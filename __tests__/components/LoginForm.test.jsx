// __tests__/components/LoginForm.test.jsx


beforeAll(() => {
    global.alert = jest.fn(); // Mock the alert function
  });

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/LoginForm'; // Adjust the import path as necessary

jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  let pushMock;
  let user;

  beforeEach(() => {
    pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });
    axios.post.mockReset();
    user = userEvent.setup();
  });

  it('renders LoginForm correctly', () => {
    render(<LoginForm />);

    // Check if the form elements are present
    //expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    //expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    //expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  //});
  expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

  it('shows validation error when email or password is empty', async () => {
    render(<LoginForm />);

    // Click the submit button without filling in the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check for validation messages
  //  expect(await screen.findByText(/User not found/i)).toBeInTheDocument();
    //expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  //  expect(axios.post).not.toHaveBeenCalled();
 // });

     // Check for validation messages
     expect(global.alert).toHaveBeenCalled();//'Email is required');
     expect(global.alert).toHaveBeenCalled();//'Password is required');
     expect(axios.post).not.toHaveBeenCalled();
   });

  it('submits, calls API, and navigates on successful login', async () => {
    const mockUser  = { id: '123', email: 'test@example.com' };
    axios.post.mockResolvedValue({ data: mockUser  });

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');

    // Click the submit button
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { email: 'test@example.com', password: 'password123' },
        { withCredentials: true }
      );
    });

    expect(pushMock).toHaveBeenCalledWith('/dash'); // Adjust the route as necessary
  });
});