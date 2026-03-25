import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sprint 2 home content and navigation links', () => {
  render(<App />);

  expect(screen.getByText(/ShareX File Sharing/i)).toBeInTheDocument();
  expect(screen.getByText(/Open Upload Flow/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Find a file/i })).toBeInTheDocument();
});
