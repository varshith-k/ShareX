import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import * as api from '../services/api';

jest.mock('../services/api');

const renderDownloadPage = (token = 'test-token-123') => {
  return render(
    <MemoryRouter initialEntries={[`/download/${token}`]}>
      <Routes>
        <Route path="/download/:token" element={<DownloadPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('DownloadPage public flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getDownloadUrl.mockReturnValue('http://localhost:8080/download/test-token-123');
  });

  test('renders successful metadata state with active download action', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'resume.pdf',
      size: 2048,
      token: 'test-token-123',
      createdAt: '2026-04-12T10:00:00.000Z',
      expiresAt: '2035-04-20T10:00:00.000Z',
      isExpired: false,
    });

    renderDownloadPage();

    const fileNames = await screen.findAllByText(/resume\.pdf/i);
    expect(fileNames.length).toBeGreaterThan(0);

    expect(screen.getByText(/file details/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.00 kb/i)).toBeInTheDocument();
    expect(screen.getByText(/active until/i)).toBeInTheDocument();

    const downloadButton = screen.getByRole('button', { name: /download file/i });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).not.toBeDisabled();
  });

  test('renders no-expiration metadata state gracefully', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'project.zip',
      size: 4096,
      token: 'no-expiry-token',
      createdAt: '2026-04-12T10:00:00.000Z',
      expiresAt: null,
      isExpired: false,
    });

    renderDownloadPage('no-expiry-token');

    expect(await screen.findByText(/project\.zip/i)).toBeInTheDocument();
    expect(screen.getAllByText(/no expiration/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /download file/i })).toBeInTheDocument();
  });

  test('renders expired metadata state with disabled download action', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'old-file.pdf',
      size: 1024,
      token: 'expired-token',
      createdAt: '2026-04-01T10:00:00.000Z',
      expiresAt: '2020-04-20T10:00:00.000Z',
      isExpired: true,
    });

    renderDownloadPage('expired-token');

    expect(await screen.findByText(/old-file\.pdf/i)).toBeInTheDocument();
    expect(screen.getAllByText(/expired/i).length).toBeGreaterThan(0);

    const disabledButton = screen.getByRole('button', {
      name: /download unavailable/i,
    });
    expect(disabledButton).toBeDisabled();
  });

  test('renders expired link error state with clear messaging', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(new Error('This share link has expired'));

    renderDownloadPage('expired-error-token');

    expect(await screen.findByText(/this share link has expired/i)).toBeInTheDocument();
    expect(screen.getByText(/download window has ended/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /try another token/i })).toBeInTheDocument();
  });

  test('renders revoked link error state with clear messaging', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(new Error('This share link was revoked'));

    renderDownloadPage('revoked-token');

    expect(await screen.findByText(/this share link has been revoked/i)).toBeInTheDocument();
    expect(screen.getByText(/owner has disabled this link/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
  });

  test('renders generic invalid-link fallback for unknown errors', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(new Error('File not found'));

    renderDownloadPage('bad-token');

    expect(await screen.findByText(/file not found/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid, unavailable, or may have been removed/i)).toBeInTheDocument();
  });
});