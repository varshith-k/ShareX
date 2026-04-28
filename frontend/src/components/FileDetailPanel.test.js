import { render, screen } from '@testing-library/react';
import FileDetailPanel from './FileDetailPanel';

describe('FileDetailPanel', () => {
  test('renders complete file metadata clearly', () => {
    render(
      <FileDetailPanel
        filename="resume.pdf"
        size={2048}
        token="test-token-123"
        createdAt="2026-04-12T10:00:00.000Z"
        expiresAt="2035-04-20T10:00:00.000Z"
        isExpired={false}
      />
    );

    expect(screen.getByRole('region', { name: /file details/i })).toBeInTheDocument();
    expect(screen.getByText(/resume\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.00 kb/i)).toBeInTheDocument();
    expect(screen.getByText(/test-token-123/i)).toBeInTheDocument();
    expect(screen.getByText(/expiration/i)).toBeInTheDocument();
  });

  test('handles missing optional metadata gracefully', () => {
    render(
      <FileDetailPanel
        filename=""
        size={undefined}
        token=""
        createdAt=""
        expiresAt={null}
        isExpired={false}
      />
    );

    expect(screen.getAllByText(/unavailable/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/unknown size/i)).toBeInTheDocument();
    expect(screen.getByText(/no expiration/i)).toBeInTheDocument();
  });

  test('shows expired status when file is expired', () => {
    render(
      <FileDetailPanel
        filename="old.pdf"
        size={1024}
        token="expired-token"
        createdAt="2026-04-01T10:00:00.000Z"
        expiresAt="2020-04-20T10:00:00.000Z"
        isExpired={true}
      />
    );

    expect(screen.getByText(/old\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });
});