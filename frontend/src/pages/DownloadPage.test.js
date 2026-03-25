import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import * as api from '../services/api';

// Mock the entire API service module
jest.mock('../services/api');

describe('FE2-17: DownloadPage Success State', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays correct file name and converted size on successful fetch', async () => {
        // 1. Setup the mock to return specific success data
        const mockMetadata = {
            filename: 'harshini_project_final.zip',
            size: 2048 // This should be displayed as 2.00 KB
        };
        api.fetchFileMetadata.mockResolvedValueOnce(mockMetadata);

        // 2. Render the component with a fake token in the URL
        render(
            <MemoryRouter initialEntries={['/download/success-token-123']}>
                <Routes>
                    <Route path="/download/:token" element={<DownloadPage />} />
                </Routes>
            </MemoryRouter>
        );

        // 3. Verify the filename appears (using findByText to wait for the async update)
        const filenameElement = await screen.findByText(/harshini_project_final.zip/i);
        expect(filenameElement).toBeInTheDocument();

        // 4. Verify the size is correctly converted to KB (2048 / 1024 = 2)
        const sizeElement = screen.getByText(/2.00 KB/i);
        expect(sizeElement).toBeInTheDocument();

        // 5. Verify the API was called with the correct token from the URL
        expect(api.fetchFileMetadata).toHaveBeenCalledWith('success-token-123');
    });
});