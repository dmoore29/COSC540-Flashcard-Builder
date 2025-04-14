import clientPromise from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie'; // lightweight cookie parser


export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('mydb');
  const decks = db.collection('decks');

  if (req.method === 'GET') {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    console.log('Token from cookies:', token); // Debug token

    if (!token) {
      console.log('No token found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user;
    try {
      user = await verifyToken(token);
      console.log('Verified user:', user); // Debug verified user
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    try {
      console.log('Fetching decks for user:', user.email); // Debug user email
      const result = await decks.find({ createdBy: user.email }).toArray();
      console.log('Found decks:', result); // Debug found decks
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching decks:', err);
      return res.status(500).json({ error: 'Failed to fetch decks' });
    }
  }

  if (req.method === 'POST') {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    let user;
    try {
      user = await verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Deck name is required' });

    const newDeck = {
      name,
      createdBy: user.email,
      createdOn: new Date(),
      cardIds: [],
      stats: { yes: 0, somewhat: 0, no: 0, totalReviewed: 0 },
    };

    try {
      const result = await decks.insertOne(newDeck);
      return res.status(201).json({ id: result.insertedId });
    } catch (err) {
      console.error('Error creating deck:', err);
      return res.status(500).json({ error: 'Failed to create deck' });
    }
  }

  if (req.method === 'PUT') {
    const { deckId, action } = req.query;
    if (!ObjectId.isValid(deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const _id = new ObjectId(deckId);

    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    let user;
    try {
      user = await verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify the deck belongs to the user
    const deck = await decks.findOne({ _id });
    if (!deck || deck.createdBy !== user.email) {
      return res.status(403).json({ error: 'Unauthorized to modify this deck' });
    }

    if (action === 'add-card') {
      const { cardId } = req.body;
      if (!ObjectId.isValid(cardId)) return res.status(400).json({ error: 'Invalid card ID' });
      await decks.updateOne({ _id }, { $addToSet: { cardIds: new ObjectId(cardId) } });
      return res.status(200).json({ message: 'Card added to deck' });
    }

    if (action === 'track-response') {
      const { response } = req.body;
      if (!['yes', 'somewhat', 'no'].includes(response)) {
        return res.status(400).json({ error: 'Invalid response' });
      }

      const update = {
        $inc: {
          [`stats.${response}`]: 1,
          'stats.totalReviewed': 1
        }
      };

      await decks.updateOne({ _id }, update);
      return res.status(200).json({ message: 'Stats updated' });
    }

    // Update deck name
    const { name } = req.body;
    if (name) {
      await decks.updateOne({ _id }, { $set: { name } });
      return res.status(200).json({ message: 'Deck updated' });
    }
  }

  if (req.method === 'DELETE') {
    const { deckId } = req.query;
    if (!ObjectId.isValid(deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const _id = new ObjectId(deckId);

    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    let user;
    try {
      user = await verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify the deck belongs to the user
    const deck = await decks.findOne({ _id });
    if (!deck || deck.createdBy !== user.email) {
      return res.status(403).json({ error: 'Unauthorized to delete this deck' });
    }

    try {
      await decks.deleteOne({ _id });
      return res.status(200).json({ message: 'Deck deleted' });
    } catch (err) {
      console.error('Error deleting deck:', err);
      return res.status(500).json({ error: 'Failed to delete deck' });
    }
  }

  res.status(405).end();
}
