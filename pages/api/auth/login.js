import clientPromise from '@/lib/mongo';
import { comparePassword } from '@/lib/hash';
import { generateToken, setAuthCookie } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  const client = await clientPromise;
  const db = client.db('mydb');
  const user = await db.collection('users').findOne({ email });

  if (!user) return res.status(401).json({ error: 'User not found.' });

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials.' });

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.status(200).json({ message: 'Logged in', user: { id: user._id, email: user.email } });
}
