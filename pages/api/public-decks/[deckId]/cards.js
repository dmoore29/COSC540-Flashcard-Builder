import clientPromise from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { deckId } = req.query;
  console.log('Received deckId:', deckId);

  if (!deckId) {
    return res.status(400).json({ error: 'Deck ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mydb');
    const decks = db.collection('decks');
    const flashcards = db.collection('flashcards');

    // Find the public deck
    const deck = await decks.findOne({ _id: new ObjectId(deckId) });
    console.log('Found deck:', deck);

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Fetch all cards in the deck
    const cardIds = deck.cardIds || [];
    console.log('Card IDs:', cardIds);

    if (cardIds.length === 0) {
      return res.status(200).json([]);
    }

    const cards = await flashcards
      .find({ _id: { $in: cardIds.map(id => new ObjectId(id)) } })
      .toArray();

    console.log('Found cards:', cards);
    return res.status(200).json(cards);
  } catch (error) {
    console.error('Error in /api/public-decks/[deckId]/cards:', error);
    return res.status(500).json({ error: 'Failed to fetch cards' });
  }
} 