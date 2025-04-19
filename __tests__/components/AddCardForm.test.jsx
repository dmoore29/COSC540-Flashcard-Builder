// __tests__/components/AddCardForm.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import AddCardForm from '../../components/AddCardForm';

jest.mock('axios');
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('AddCardForm', () => {
  let user;
  const mockUser = { email: 'test@example.com' };
  const mockDecks = [
    { _id: 'deck1', name: 'Test Deck 1' },
    { _id: 'deck2', name: 'Test Deck 2' },
  ];

  beforeEach(() => {
    useSearchParams.mockReturnValue(new URLSearchParams('deckName=Test%20Deck%201'));
    axios.get.mockResolvedValue({ data: mockDecks });
    axios.post.mockResolvedValue({ data: { id: 'card123' } });
    axios.put.mockResolvedValue({ data: {} });
    user = userEvent.setup();
  });

  it('shows loading state initially', () => {
    render(<AddCardForm user={mockUser} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when user is not authenticated', async () => {
    render(<AddCardForm user={{}} />);
    await waitFor(() => {
      expect(screen.getByText('User authentication required')).toBeInTheDocument();
    });
  });

  it('loads and displays decks', async () => {
    render(<AddCardForm user={mockUser} />);
    
    // First, verify that loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for the loading state to disappear and the decks to be loaded
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Wait for the deck select to be populated and have the correct value
    await waitFor(() => {
      const deckSelect = screen.getByTestId('deck-select');
      // First verify that the decks are loaded by checking the options
      const options = deckSelect.querySelectorAll('option');
      expect(options).toHaveLength(3); // Default option + 2 mock decks
      // Then verify the correct deck is selected
      expect(deckSelect.value).toBe('deck1');
    });
  });

  it('shows validation error when submitting without selecting a deck', async () => {
    render(<AddCardForm user={mockUser} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Clear any existing deck selection
    await user.selectOptions(screen.getByTestId('deck-select'), '');

    const form = screen.getByTestId('add-card-form');
    fireEvent.submit(form);

    // Wait for the validation message to appear
    await waitFor(() => {
      expect(screen.getByText('Please select a deck.')).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits form successfully and creates a card', async () => {
    render(<AddCardForm user={mockUser} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Topic'), 'Test Topic');
    await user.type(screen.getByPlaceholderText('Front (Question)'), 'Test Question');
    await user.type(screen.getByPlaceholderText('Back (Answer)'), 'Test Answer');
    await user.selectOptions(screen.getByTestId('deck-select'), 'deck1');
    await user.selectOptions(screen.getByTestId('public-select'), 'yes');

    await user.click(screen.getByRole('button', { name: /add card/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/flashcards',
        {
          topic: 'Test Topic',
          front: 'Test Question',
          back: 'Test Answer',
          public: 'yes',
          cardSet: 'deck1',
        },
        { withCredentials: true }
      );
    });

    expect(axios.put).toHaveBeenCalledWith(
      '/api/decks?deckId=deck1&action=add-card',
      { cardId: 'card123' },
      { withCredentials: true }
    );

    expect(screen.getByText('Card created and added to deck!')).toBeInTheDocument();
    
    // Form should be reset
    expect(screen.getByPlaceholderText('Topic')).toHaveValue('');
    expect(screen.getByPlaceholderText('Front (Question)')).toHaveValue('');
    expect(screen.getByPlaceholderText('Back (Answer)')).toHaveValue('');
    expect(screen.getByTestId('public-select')).toHaveValue('no');
  });

  it('handles API errors gracefully', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Failed to create card' } }
    });

    render(<AddCardForm user={mockUser} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Topic'), 'Test Topic');
    await user.type(screen.getByPlaceholderText('Front (Question)'), 'Test Question');
    await user.type(screen.getByPlaceholderText('Back (Answer)'), 'Test Answer');
    await user.selectOptions(screen.getByTestId('deck-select'), 'deck1');

    await user.click(screen.getByRole('button', { name: /add card/i }));

    expect(await screen.findByText('Failed to create card')).toBeInTheDocument();
  });
}); 