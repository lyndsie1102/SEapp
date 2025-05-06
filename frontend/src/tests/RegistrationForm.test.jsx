import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/RegistrationForm';
import '@testing-library/jest-dom';

// Mock the fetch API
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  // Clear all mocks between tests
  jest.clearAllMocks();
  
  // Setup fetch mock
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  );
});

describe('RegistrationForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate,
        }));
    });

    test('renders registration form with all fields', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });



    test('shows email validation error on submit', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'invalid-email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            const errorElements = screen.queryAllByText(/./);
            console.log('All text elements:', errorElements.map(el => el.textContent));

            expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });


    test('validates password match', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@gmail.com' }
        });

        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
            target: { value: 'differentpassword' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            const errorElements = screen.queryAllByText(/./);
            console.log('All text elements:', errorElements.map(el => el.textContent));

            expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        }, { timeout: 3000 });

    });

    test('handles successful registration', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true }), 
        });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Debugging logs
        console.log('Fetch calls:', fetch.mock.calls);
        console.log('Navigation calls:', mockNavigate.mock.calls);

        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
              }),
            });
        
            expect(mockNavigate).toHaveBeenCalledWith('/', {
              state: { fromRegister: true }
            });
          }, { timeout: 3000 });

    });

    test('handles registration failure', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: 'Email already exists' }),
        });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await screen.findByText('Email already exists');
    });
});