import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api');

describe('DownloadPage Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // FE2-17: Metadata Success
    test('FE2-17: displays file name and size on successful fetch', async () => {
        api.fetchFileMetadata.mockResolvedValueOnce({
            filename: 'harshini_data.zip',
            size: 1048576 // 1MB
        });

        render(
            <MemoryRouter initialEntries={['/download/valid-token']}>
                <Routes>
                    <Route path="/download/:token" element={<DownloadPage />} />
                </Routes>
            </MemoryRouter>
        );

        const filename = await screen.findByText(/harshini_data.zip/i);
        expect(filename).toBeInTheDocument();
        expect(screen.getByText(/1024.00 KB/i)).toBeInTheDocument();
    });

    // FE2-18: Metadata Error
    test('FE2-18: displays error UI when token is invalid', async () => {
        api.fetchFileMetadata.mockRejectedValueOnce(new Error('404'));

        render(
            <MemoryRouter initialEntries={['/download/expired-token']}>
                <Routes>
                    <Route path="/download/:token" element={<DownloadPage />} />
                </Routes>
            </MemoryRouter>
        );

        const errorHeading = await screen.findByText(/File Not Found/i);
        expect(errorHeading).toBeInTheDocument();
        expect(screen.getByText(/link is invalid or has expired/i)).toBeInTheDocument();
    });
});