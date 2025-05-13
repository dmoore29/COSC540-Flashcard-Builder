'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export default function AddCardForm({ user }) {
  const searchParams = useSearchParams();
  const deckName = searchParams.get('deckName');

  const [form, setForm] = useState({
    topic: '',
    front: '',
    back: '',
    public: 'no',
    deckChoice: '', // holds deck's _id
  });

  const [decks, setDecks] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  console.log('User props:', user);

  useEffect(() => {
    const fetchDecks = async () => {
      if (!user?.email) {
        console.error('No user email available');
        setMessage('User authentication required');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/decks', { withCredentials: true });
        const fetchedDecks = response.data;
        setDecks(fetchedDecks);
        
        // If we have a deckName from URL, find and select that deck
        if (deckName) {
          const targetDeck = fetchedDecks.find(deck => deck.name === deckName);
          if (targetDeck) {
            setForm(prev => ({ ...prev, deckChoice: targetDeck._id }));
            console.log('Selected deck:', targetDeck);
          } else {
            console.warn('Deck not found:', deckName);
          }
        }
      } catch (err) {
        console.error('Failed to fetch decks:', err);
        setMessage('Failed to load decks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, [user, deckName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!form.deckChoice) {
      return setMessage('Please select a deck.');
    }

    try {
      // Step 1: Create the flashcard.
      const flashcardRes = await axios.post(
        '/api/flashcards',
        {
          topic: form.topic,
          front: form.front,
          back: form.back,
          public: form.public,
          cardSet: form.deckChoice,
        },
        { withCredentials: true }
      );
      const newCardId = flashcardRes.data.id;
      console.log('Created flashcard with id:', newCardId);

      // Step 2: Add the new card's id to the selected deck's cardIDs array
      await axios.put(
        `/api/decks?deckId=${form.deckChoice}&action=add-card`,
        { cardId: newCardId },
        { withCredentials: true }
      );
      
      setMessage('Card created and added to deck!');
      setForm({ topic: '', front: '', back: '', public: 'no', deckChoice: form.deckChoice });
    } catch (err) {
      console.error('Error creating card or adding to deck:', err);
      setMessage(err.response?.data?.error || 'Failed to create card.');
    }
  };

  if (isLoading) {
    return <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded shadow">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add Flashcard</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="add-card-form">
        <input
          name="topic"
          placeholder="Topic"
          value={form.topic}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="front"
          placeholder="Front (Question)"
          value={form.front}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="back"
          placeholder="Back (Answer)"
          value={form.back}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="public"
          value={form.public}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          data-testid="public-select"
        >
          <option value="no">Private</option>
          <option value="yes">Public</option>
        </select>

        <div>
          <label className="block mb-1 font-medium">Choose deck:</label>
          <select
            name="deckChoice"
            value={form.deckChoice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            data-testid="deck-select"
          >
            <option value="">-- Select a deck --</option>
            {decks.map((deck) => (
              <option key={deck._id} value={deck._id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Card
        </button>
      </form>
    </div>
  );
}
