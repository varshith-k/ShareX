import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import * as api from '../services/api';

jest.mock('../services/api');

const renderDownloadPage = () => {
  return render(
    <MemoryRouter initialEntries={['/download/test-token-123']}>
      <Routes>
        <Route path="/download/:token" element={<DownloadPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('DownloadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getDownloadUrl.mockReturnValue('http://localhost:8080/download/test-token-123');
  });

  test('renders file metadata and download button on successful fetch', async () => {
    api.fetchFileMetadata.mockResolvedValueOnce({
      filename: 'resume.pdf',
      size: 2048,
      token: 'test-token-123',
      createdAt: '2026-04-12T10:00:00.000Z',
      expiresAt: '2026-04-20T10:00:00.000Z',
      isExpired: false,
    });

    renderDownloadPage();

    const headings = await screen.findAllByText(/resume\.pdf/i);
    expect(headings.length).toBeGreaterThan(0);

    expect(screen.getByText(/size/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.00 kb/i)).toBeInTheDocument();

    const downloadButton = screen.getByRole('button', { name: /download file/i });
    expect(downloadButton).toBeInTheDocument();
  });

  test('displays generic invalid-link state when metadata fetch fails', async () => {
    api.fetchFileMetadata.mockRejectedValueOnce(new Error('File not found'));

    renderDownloadPage();

    const errorHeading = await screen.findByText(/file not found/i);
    expect(errorHeading).toBeInTheDocument();

    const errorMessage = screen.getByText(/invalid, unavailable, or may have been removed/i);
    expect(errorMessage).toBeInTheDocument();

    const homeLink = screen.getByText(/back to home/i);
    expect(homeLink).toBeInTheDocument();
  });
});