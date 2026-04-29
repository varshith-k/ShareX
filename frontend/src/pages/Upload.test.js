import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Upload from './Upload';
import * as api from '../services/api';

jest.mock('../services/api');
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    token: '',
  }),
}));

describe('Upload page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows validation message when no file is selected', async () => {
    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    expect(await screen.findByText(/please select a file first/i)).toBeInTheDocument();
  });

  test('uploads a file and shows the returned share panel', async () => {
    api.uploadFile.mockResolvedValueOnce({
      downloadUrl: '/download/test-token',
      expiresAt: '2026-05-01T10:30:00.000Z',
      requiresPassword: true,
      token: 'test-token',
    });

    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/choose file/i);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.change(screen.getByLabelText(/link expiration/i), {
      target: { value: '168' },
    });
    fireEvent.change(screen.getByLabelText(/file password/i), {
      target: { value: 'lock123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(api.uploadFile).toHaveBeenCalledWith(file, '', '168', 'lock123');
    });

    expect(await screen.findByText(/upload successful/i)).toBeInTheDocument();
    expect(screen.getByText(/share link ready/i)).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost\/download\/test-token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open share page/i })).toBeInTheDocument();
    expect(screen.getByText(/5\/1\/2026/i)).toBeInTheDocument();
    expect(screen.getByText(/password protected/i)).toBeInTheDocument();
  });

  test('shows expiration helper text when selection changes', () => {
    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );

    expect(screen.getByText(/link stays active until revoked/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/link expiration/i), {
      target: { value: '24' },
    });

    expect(screen.getByText(/best for quick one-time sharing/i)).toBeInTheDocument();
  });

  test('shows error when file size exceeds limit', async () => {
    render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/choose file/i);
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large-file.txt',
      { type: 'text/plain' }
    );

    fireEvent.change(input, { target: { files: [largeFile] } });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    expect(
      await screen.findByText(/file size should be less than 5mb/i)
    ).toBeInTheDocument();
  });
});
