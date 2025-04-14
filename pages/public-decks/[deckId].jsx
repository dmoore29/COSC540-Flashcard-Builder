'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Profnav from '@/components/profnav';
import Sidebar from '@/components/sidebar';
import '@/styles/flashcards.css';

export default function PublicFlashcardViewer() {
  const params = useParams();
  const deckId = params?.deckId;
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    yes: 0,
    somewhat: 0,
    no: 0,
    totalReviewed: 0
  });

  useEffect(() => {
    if (!deckId) {
      console.error('No deckId provided');
      setError('Invalid deck ID');
      setLoading(false);
      return;
    }

    try {
      const storedDeck = localStorage.getItem('selectedPublicDeck');
      if (!storedDeck) {
        throw new Error('Deck data not found');
      }

      const deck = JSON.parse(storedDeck);
      setCards(deck.flashcards);
      
      // Initialize stats from localStorage or create new
      const storedStats = localStorage.getItem(`publicDeckStats_${deckId}`);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading deck:', error);
      setError('Failed to load deck');
      setLoading(false);
    }
  }, [deckId]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleResponse = (response) => {
    if (!isFlipped) return; // Only track responses when card is flipped
    
    const newStats = {
      ...stats,
      [response]: stats[response] + 1,
      totalReviewed: stats.totalReviewed + 1
    };
    
    setStats(newStats);
    localStorage.setItem(`publicDeckStats_${deckId}`, JSON.stringify(newStats));
    
    // Auto-advance to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  if (!deckId) {
    return (
      <div className="min-h-screen bg-gray-600">
        <Profnav />
        <Sidebar />
        <div className="ml-16 flex items-center justify-center h-screen">
          <div className="text-white text-xl">Invalid deck ID</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-600">
        <Profnav />
        <Sidebar />
        <div className="ml-16 flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-600">
        <Profnav />
        <Sidebar />
        <div className="ml-16 flex items-center justify-center h-screen">
          <div className="text-white text-xl">{error}</div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-600">
        <Profnav />
        <Sidebar />
        <div className="ml-16 flex items-center justify-center h-screen">
          <div className="text-white text-xl">No cards in this deck</div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gray-600">
      <Profnav />
      <Sidebar />
      <div className="ml-16 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <div 
            className="relative h-96 w-full cursor-pointer"
            onClick={handleFlip}
          >
            <div className={`absolute w-full h-full transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full backface-hidden">
                <div className="bg-white rounded-lg shadow-lg p-8 h-full flex items-center justify-center">
                  <p className="text-2xl text-center">{currentCard.front}</p>
                </div>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180">
                <div className="bg-white rounded-lg shadow-lg p-8 h-full flex items-center justify-center">
                  <p className="text-2xl text-center">{currentCard.back}</p>
                </div>
              </div>
            </div>
          </div>

          {isFlipped && (
            <div className="flex gap-4">
              <button
                onClick={() => handleResponse('no')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Didn't Know
              </button>
              <button
                onClick={() => handleResponse('somewhat')}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Somewhat
              </button>
              <button
                onClick={() => handleResponse('yes')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Knew It
              </button>
            </div>
          )}

          <div className="flex justify-between items-center w-full max-w-md">
            <button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white">
              Card {currentCardIndex + 1} of {cards.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentCardIndex === cards.length - 1}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="mt-4 text-white text-center">
            <p>Progress: {stats.totalReviewed} cards reviewed</p>
            <div className="flex gap-4 justify-center mt-2">
              <span className="text-green-500">Knew It: {stats.yes}</span>
              <span className="text-yellow-500">Somewhat: {stats.somewhat}</span>
              <span className="text-red-500">Didn't Know: {stats.no}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 