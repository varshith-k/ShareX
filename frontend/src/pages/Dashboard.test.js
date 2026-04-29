import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: jest.fn(),
    token: 'test-token',
    user: { name: 'Varshith' },
  }),
}));

jest.mock('../services/api', () => ({
  deleteMyFile: jest.fn(),
  fetchMyFiles: jest.fn().mockResolvedValue({ files: [] }),
  revokeMyFile: jest.fn(),
}));

describe('Dashboard page', () => {
  test('renders authenticated dashboard shell', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back, Varshith/i)).toBeInTheDocument();
    expect(await screen.findByText(/No owned files yet/i)).toBeInTheDocument();
  });
});
