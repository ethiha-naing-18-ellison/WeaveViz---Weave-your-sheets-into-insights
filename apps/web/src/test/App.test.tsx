import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the auth store
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
  }),
}));

describe('App', () => {
  it('renders login page when not authenticated', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText('WeaveViz')).toBeInTheDocument();
    expect(screen.getByText('Weave Your Sheets Into Insights')).toBeInTheDocument();
  });
});
