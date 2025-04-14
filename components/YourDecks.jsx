'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function YourDecks({ user }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDecks = async () => {
      console.log('User data:', user);
      
      if (!user?.email) {
        console.log('No user email found');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching decks for user:', user.email);
        const response = await axios.get('/api/decks', { withCredentials: true });
        console.log('Raw API Response:', response);
        console.log('Response data:', response.data);
        
        // Ensure we have an array of decks
        const decksData = Array.isArray(response.data) ? response.data : [];
        console.log('Processed decks:', decksData);
        
        setDecks(decksData);
      } catch (err) {
        console.error('Failed to fetch decks:', err);
        console.error('Error response:', err.response);
        setMessage('Failed to load your decks');
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [user]);

  const handleDelete = async (deckId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (!confirm('Are you sure you want to delete this deck?')) return;

    try {
      await axios.delete(`/api/decks?deckId=${deckId}`, { withCredentials: true });
      setDecks(decks.filter(deck => deck._id !== deckId));
      setMessage('Deck deleted successfully');
    } catch (err) {
      console.error('Failed to delete deck:', err);
      setMessage('Failed to delete deck');
    }
  };

  const handleAddCards = (deckName, e) => {
    e.stopPropagation(); // Prevent navigation when clicking add cards
    router.push(`/addCard?deckName=${encodeURIComponent(deckName)}`);
  };

  const handleDeckClick = (deckId) => {
    console.log('Navigating to deck:', deckId);
    router.push(`/flashcards/${deckId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-100">Loading your decks...</div>
      </div>
    );
  }

  console.log('Rendering decks:', decks);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100">Your Decks</h2>
        
      </div>

      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center text-gray-100 py-8">
          <p className="text-xl mb-4">You haven't created any decks yet</p>
          <button
            onClick={() => router.push('/addDeck')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Create Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck._id}
              onClick={() => handleDeckClick(deck._id)}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{deck.name}</h3>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {deck.cardIds?.length || 0} cards
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleAddCards(deck.name, e)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                    >
                      Add Cards
                    </button>
                    <button
                      onClick={(e) => handleDelete(deck._id, e)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 