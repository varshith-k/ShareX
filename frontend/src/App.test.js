import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./contexts/AuthContext', () => {
  const actual = jest.requireActual('./contexts/AuthContext');

  return {
    ...actual,
    AuthProvider: ({ children }) => children,
    useAuth: () => ({
      loading: false,
      token: '',
      user: null,
    }),
  };
});

test('renders ShareX brand content and auth navigation links', () => {
  render(<App />);

  expect(screen.getByText(/Secure file sharing/i)).toBeInTheDocument();
  expect(screen.getByAltText(/ShareX logo/i)).toBeInTheDocument();
  expect(screen.getByText(/Create account/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
});
