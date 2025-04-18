// integration-tests/deckFlow.int.test.js
// @jest-environment jsdom

// 1) Stub out auth so verifyToken always succeeds
jest.mock('@/lib/auth', () => ({
  verifyToken: async (token) => ({ sub: 'test-user' })
}));

// 2) Mock Next.js router
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
import { useRouter } from 'next/navigation';

import { makeTestServer } from './testServer.js';
import supertest from 'supertest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddDeckForm from '../components/AddDeckForm.jsx';
import axios from 'axios';

let server, request;
const MOCK_TOKEN = 'dummy-token';

beforeAll(async () => {
  // spin up the in‑process API server
  server = makeTestServer();
  await new Promise(res => server.listen(res));
  request = supertest(server);

  // 3) Override axios.post so it passes our fake cookie
  axios.post = (url, body) =>
    request
      .post(url)
      .set('Cookie', `token=${MOCK_TOKEN}`)
      .send(body)
      .set('Content-Type', 'application/json')
      .then(res => ({ data: res.body }));

  useRouter.mockReturnValue({ push: jest.fn() });
});

afterAll(() => new Promise(res => server.close(res)));

it('creates a deck end‑to‑end', async () => {
  const user = userEvent.setup();
  render(<AddDeckForm />);

  await user.type(screen.getByPlaceholderText(/deck name/i), 'E2E Deck');
  await user.click(screen.getByRole('button', { name: /create deck/i }));

  // should show the success message
  expect(await screen.findByText(/deck created successfully/i)).toBeInTheDocument();

  // 4) Query the GET endpoint with the same cookie
  const res = await request
    .get('/api/decks')
    .query({ name: 'E2E Deck' })
    .set('Cookie', `token=${MOCK_TOKEN}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'E2E Deck' })])
  );
});
