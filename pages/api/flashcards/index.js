import clientPromise from '@/lib/mongo';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('mydb');
  const cards = db.collection('flashcards');

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

    const { topic, front, back, public: isPublic, cardSet } = req.body;

    if (!topic || !front || !back || !cardSet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newCard = {
      topic,
      front,
      back,
      public: isPublic === 'yes',
      createdBy: user.email,
      cardSet,
      createdOn: new Date(),
    };

    const result = await cards.insertOne(newCard);
    return res.status(201).json({ id: result.insertedId });
  }

  if (req.method === 'GET') {
    const { createdBy, publicOnly } = req.query;
    const filter = publicOnly === 'true'
      ? { public: true }
      : createdBy
      ? { createdBy }
      : {};

    const result = await cards.find(filter).toArray();
    return res.status(200).json(result);
  }

  res.status(405).end();
}
