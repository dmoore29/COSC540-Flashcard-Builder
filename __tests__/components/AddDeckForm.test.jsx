// __tests__/components/AddDeckForm.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AddDeckForm from '../../components/AddDeckForm';

jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AddDeckForm', () => {
  let pushMock;
  let user;

  beforeEach(() => {
    pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });
    axios.post.mockReset();
    user = userEvent.setup();
  });

  it('shows validation error when name is empty', async () => {
    render(<AddDeckForm />);

    // grab the <form> element (closest ancestor of the textbox)
    const form = screen
      .getByPlaceholderText(/deck name/i)
      .closest('form');

    // manually dispatch submit to bypass native HTML validation
    fireEvent.submit(form);

    expect(
      await screen.findByText(/deck name is required/i)
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits, calls API, notifies parent, and navigates', async () => {
    const newDeck = { id: '123', name: 'My Deck', public: true };
    axios.post.mockResolvedValue({ data: newDeck });
    const onDeckCreated = jest.fn();

    render(<AddDeckForm onDeckCreated={onDeckCreated} />);

    await user.type(screen.getByPlaceholderText(/deck name/i), 'My Deck');
    await user.click(screen.getByLabelText(/make this deck public/i));

    // click the submit button (HTML validation passes because name is filled)
    await user.click(screen.getByRole('button', { name: /create deck/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/decks',
        { name: 'My Deck', public: true },
        { withCredentials: true }
      );
    });

    expect(
      screen.getByText(/deck created successfully!/i)
    ).toBeInTheDocument();
    expect(onDeckCreated).toHaveBeenCalledWith(newDeck);
    expect(pushMock).toHaveBeenCalledWith('/addCard?deckName=My%20Deck');

    // form reset assertions
    expect(screen.getByPlaceholderText(/deck name/i)).toHaveValue('');
    expect(screen.getByLabelText(/make this deck public/i)).not.toBeChecked();
  });
});
