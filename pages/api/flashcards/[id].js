import clientPromise from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('mydb');
  const collection = db.collection('flashcards');
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const _id = new ObjectId(id);

  if (req.method === 'GET') {
    const card = await collection.findOne({ _id });
    return res.status(200).json(card);
  }

  if (req.method === 'PUT') {
    const { topic, front, back, public: isPublic, cardSet } = req.body;

    const update = {
      ...(topic && { topic }),
      ...(front && { front }),
      ...(back && { back }),
      ...(typeof isPublic !== 'undefined' && { public: isPublic === 'yes' }),
      ...(cardSet && { cardSet }),
    };

    await collection.updateOne({ _id }, { $set: update });
    return res.status(200).json({ message: 'Card updated' });
  }

  if (req.method === 'DELETE') {
    await collection.deleteOne({ _id });
    return res.status(200).json({ message: 'Card deleted' });
  }

  res.status(405).end();
}
