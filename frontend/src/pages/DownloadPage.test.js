import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import * as api from '../services/api';

jest.mock('../services/api');

const renderDownloadPage = (token = 'test-token-123') =>
  render(
    <MemoryRouter initialEntries={[`/download/${token}`]}>
      <Routes>
        <Route path="/download/:token" element={<DownloadPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('DownloadPage public flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getDownloadUrl.mockReturnValue(
      'http://localhost:8080/download/test-token-123'
    );
  });

  test('renders successful metadata state', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'resume.pdf',
      size: 2048,
      token: 'test-token-123',
      createdAt: '2026-04-12T10:00:00.000Z',
      expiresAt: '2035-04-20T10:00:00.000Z',
      isExpired: false,
    });

    renderDownloadPage();

    expect((await screen.findAllByText(/resume\.pdf/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/2\.00 kb/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /download file/i })
    ).toBeInTheDocument();
  });

  test('renders no expiration state', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'project.zip',
      size: 4096,
      token: 'no-expiry-token',
      createdAt: '2026-04-12T10:00:00.000Z',
      expiresAt: null,
      isExpired: false,
    });

    renderDownloadPage('no-expiry-token');

    expect((await screen.findAllByText(/project\.zip/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/no expiration/i).length).toBeGreaterThan(0);
  });

  test('renders expired metadata state', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'old-file.pdf',
      size: 1024,
      token: 'expired-token',
      createdAt: '2026-04-01T10:00:00.000Z',
      expiresAt: '2020-04-20T10:00:00.000Z',
      isExpired: true,
    });

    renderDownloadPage('expired-token');

    expect((await screen.findAllByText(/old-file\.pdf/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/expired/i).length).toBeGreaterThan(0);

    expect(
      screen.getByRole('button', { name: /download unavailable/i })
    ).toBeDisabled();
  });

  test('renders expired error state', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(
      new Error('This share link has expired')
    );

    renderDownloadPage();

    expect(
      await screen.findByText(/this share link has expired/i)
    ).toBeInTheDocument();
  });

  test('renders revoked error state', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(
      new Error('This share link was revoked')
    );

    renderDownloadPage();

    expect(
      await screen.findByText(/this share link has been revoked/i)
    ).toBeInTheDocument();
  });

  test('renders invalid fallback state', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(
      new Error('File not found')
    );

    renderDownloadPage();

    expect(await screen.findByText(/file not found/i)).toBeInTheDocument();
  });
});