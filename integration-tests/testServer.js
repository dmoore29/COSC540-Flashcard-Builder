import express from 'express';
import handler from '../pages/api/decks/index.js'; // adjust if nested
import { createServer } from 'http';

export function makeTestServer() {
  const app = express();
  app.use(express.json());
  app.all('/api/decks', (req, res) => handler(req, res));
  return createServer(app);
}
