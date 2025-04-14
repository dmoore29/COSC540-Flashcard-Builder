'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AddDeckForm({ user, onDeckCreated }) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!name) return setMessage('Deck name is required');

    try {
      // Create the new deck
      const res = await axios.post(
        '/api/decks',
        { name, public: isPublic },
        { withCredentials: true }
      );
      setMessage('Deck created successfully!');
      setName('');
      setIsPublic(false);
      // If a parent component needs to be notified,
      // pass the new deck details via onDeckCreated.
      if (onDeckCreated) onDeckCreated(res.data);
      // Navigate to addCard page with the deck name
      router.push(`/addCard?deckName=${encodeURIComponent(name)}`);
    } catch (err) {
      console.error('Error creating deck:', err);
      setMessage(err.response?.data?.error || 'Failed to create deck.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create New Deck</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Deck Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this deck public
          </label>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Deck
        </button>
      </form>
    </div>
  );
}
