import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DashboardUploadPanel from './DashboardUploadPanel';

describe('DashboardUploadPanel', () => {
  test('renders upload panel content', () => {
    render(<DashboardUploadPanel />);

    expect(screen.getByText('Upload Panel')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  test('shows selected file name when a file is chosen', () => {
    render(<DashboardUploadPanel />);

    const file = new File(['hello'], 'sample.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('Selected: sample.txt')).toBeInTheDocument();
  });

  test('shows message when upload is clicked without file', () => {
    render(<DashboardUploadPanel />);

    fireEvent.click(screen.getByText('Upload File'));

    expect(
      screen.getByText('Please choose a file before uploading.')
    ).toBeInTheDocument();
  });
});