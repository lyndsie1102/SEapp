import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
// Mock fetch to avoid actual API calls during testing
global.fetch = jest.fn(() =>
Promise.resolve({
ok: true,
json: () => Promise.resolve({ contacts: [] }),
})
);
describe('App Component', () => {
beforeEach(() => {
fetch.mockClear();
});
test('renders the app with tabs', () => {
render(<App />);
expect(screen.getByText(/Contacts/i)).toBeInTheDocument();
expect(screen.getByText(/Image Search/i)).toBeInTheDocument();
});
test('switches between tabs', () => {
render(<App />);
// Initially should show Contacts tab
expect(screen.getByText(/Create New Contact/i)).toBeInTheDocument();
// Click on Image Search tab
fireEvent.click(screen.getByText(/Image Search/i));
// Should now show Image Search content
expect(screen.getByText(/Search for images/i)).toBeInTheDocument();
expect(screen.queryByText(/Create New Contact/i)).not.toBeInTheDocument();
});
});