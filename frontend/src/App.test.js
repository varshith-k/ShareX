import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders final demo landing page and navigation links', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/Final Demo Flow/i)).toBeInTheDocument();
  expect(screen.getByText(/ShareX File Sharing/i)).toBeInTheDocument();

  expect(
    screen.getByRole('link', { name: /Start Upload Flow/i })
  ).toBeInTheDocument();

  expect(
    screen.getByRole('link', { name: /Open Public Download Flow/i })
  ).toBeInTheDocument();

  expect(
    screen.getByRole('link', { name: /Login/i })
  ).toBeInTheDocument();
});