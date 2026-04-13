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
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(api.uploadFile).toHaveBeenCalledWith(file, '');
    });

    expect(await screen.findByText(/upload successful/i)).toBeInTheDocument();
    expect(screen.getByText(/share link ready/i)).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost\/download\/test-token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open share page/i })).toBeInTheDocument();
  });
});