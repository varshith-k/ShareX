import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api');

describe('FE2-18: DownloadPage Error State', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays error message when the file token is invalid or expired', async () => {
        // 1. Setup the mock to simulate a failed API call (404 Error)
        api.fetchFileMetadata.mockRejectedValueOnce(new Error('File not found'));

        // 2. Render the component with an invalid token
        render(
            <MemoryRouter initialEntries={['/download/invalid-token-999']}>
                <Routes>
                    <Route path="/download/:token" element={<DownloadPage />} />
                </Routes>
            </MemoryRouter>
        );

        // 3. Verify the "File Not Found" heading appears
        const errorHeading = await screen.findByText(/File Not Found/i);
        expect(errorHeading).toBeInTheDocument();

        // 4. Verify the specific error instruction message is displayed
        const errorMessage = screen.getByText(
        /The file link is invalid, unavailable, or may have been removed./i
        );
        expect(errorMessage).toBeInTheDocument();

        // 5. Ensure the "Back to Home" link is available for the user
        const homeLink = screen.getByText(/Back to Home/i);
        expect(homeLink).toBeInTheDocument();
    });
});