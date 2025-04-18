'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pubDeck from '@/utils/pubDeck.json';

export default function PublicDeckGallery() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleDeckClick = (deckIndex) => {
    // Store the selected deck's data in localStorage for the flashcard viewer
    const selectedDeck = pubDeck.decks[deckIndex];
    localStorage.setItem('selectedPublicDeck', JSON.stringify(selectedDeck));
    router.push(`/public-decks/${deckIndex}`);
  };

  return (
    <div className="ml-16 container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100">Public Decks</h2>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      {pubDeck.decks.length === 0 ? (
        <div className="text-center text-gray-100 py-8">
          <p className="text-xl mb-4">No public decks available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubDeck.decks.map((deck, index) => (
            <div
              key={index}
              onClick={() => handleDeckClick(index)}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{deck.topic}</h3>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {deck.flashcards.length} cards
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeckClick(index);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    View Deck
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 