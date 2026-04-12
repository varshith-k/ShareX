import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

describe('Home', () => {
  test('renders home page content', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Upload, share, and retrieve files from one place./i)
    ).toBeInTheDocument();
  });
});