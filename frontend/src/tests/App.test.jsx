import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import ProtectedRoute from '../components/ProtectRoute';
import '@testing-library/jest-dom';

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe('App Routing and ProtectedRoute', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  // App Routing Tests
  describe('App Routing', () => {
    test('renders landing page on root route', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    });

    test('renders login page on /login route', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });

    test('renders registration page on /register route', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByText(/Registration/i)).toBeInTheDocument();
    });

    test('redirects to login when accessing protected routes without auth', () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      );
      
      // Assuming your ProtectedRoute redirects to login when unauthenticated
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });
  });

  // ProtectedRoute Component Tests
  describe('ProtectedRoute Component', () => {
    test('redirects to login when no token is present', () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/protected"
              element={<ProtectedRoute element={<TestComponent />} />}
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('renders protected content when token is present', () => {
      window.localStorage.setItem('token', 'test-token');
      
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/protected"
              element={<ProtectedRoute element={<TestComponent />} />}
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });
});