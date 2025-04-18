import clientPromise from '@/lib/mongo';
import { hashPassword } from '@/lib/hash';
import { generateToken, setAuthCookie } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fName, lName, email, password, confirmPassword } = req.body;

  if (!fName || !lName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('mydb'); 
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const result = await users.insertOne({
      fName,
      lName,
      email,
      password: hashedPassword,
    });

    // Create a user object consistent with login, using _id
    const newUser = {
      _id: result.insertedId,
      email,
    };

    // Await token generation
    const token = await generateToken(newUser);
    setAuthCookie(res, token);

    return res.status(201).json({ message: 'User registered successfully', user: { id: result.insertedId, email } });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
