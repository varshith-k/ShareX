import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { fetchMyFiles } from '../services/api';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders authenticated dashboard shell', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back, Varshith/i)).toBeInTheDocument();
    expect(await screen.findByText(/No owned files yet/i)).toBeInTheDocument();
  });

  test('does not show revoke button for revoked files', async () => {
    fetchMyFiles.mockResolvedValueOnce({
      files: [
        {
          filename: 'revoked.pdf',
          token: 'revoked-token',
          size: 120,
          isActive: false,
          expiresAt: null,
          requiresPassword: false,
        },
      ],
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/revoked\.pdf/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  test('shows expired status and hides revoke button for expired files', async () => {
    fetchMyFiles.mockResolvedValueOnce({
      files: [
        {
          filename: 'expired.pdf',
          token: 'expired-token',
          size: 120,
          isActive: false,
          isExpired: true,
          expiresAt: new Date(Date.now() - 60_000).toISOString(),
          requiresPassword: true,
        },
      ],
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/expired\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/status: expired/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
