import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveSearchPopover from '../components/SaveSearchPopover';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';

describe('SaveSearchPopover', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the popover with initial state', () => {
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    expect(screen.getByText('Save Your Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 'name'")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 'name'")).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 'name'")).toHaveValue('');
  });

  test('focuses input on render', () => {
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    const input = screen.getByPlaceholderText("e.g. 'name'");
    expect(input).toHaveFocus();
  });

  test('shows error when trying to save with empty name', async () => {
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    fireEvent.click(screen.getByText('Save'));
    
    expect(await screen.findByText('Please enter a name for your search')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('calls onSave with name when save is successful', async () => {
    mockOnSave.mockResolvedValueOnce();
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    const input = screen.getByPlaceholderText("e.g. 'name'");
    fireEvent.change(input, { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));
    
    expect(await screen.findByText('Saving...')).toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalledWith('My Search');
    expect(await screen.findByText('Search saved successfully!')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('shows error message when save fails', async () => {
    const errorResponse = { data: { error: 'Duplicate search name' } };
    mockOnSave.mockRejectedValueOnce(errorResponse);
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    const input = screen.getByPlaceholderText("e.g. 'name'");
    fireEvent.change(input, { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));
    
    expect(await screen.findByText('Duplicate search name')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('shows generic error when save fails without specific error', async () => {
    mockOnSave.mockRejectedValueOnce(new Error('Network error'));
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    const input = screen.getByPlaceholderText("e.g. 'name'");
    fireEvent.change(input, { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));
    
    expect(await screen.findByText('Failed to save search. Please try again.')).toBeInTheDocument();
  });

  test('calls onClose when cancel is clicked', () => {
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('disables buttons while saving', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    const input = screen.getByPlaceholderText("e.g. 'name'");
    fireEvent.change(input, { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));
    
    expect(screen.getByText('Saving...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  test('applies success/error message styling', async () => {
    // Test success styling
    mockOnSave.mockResolvedValueOnce();
    const { rerender } = render(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    fireEvent.change(screen.getByPlaceholderText("e.g. 'name'"), { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));
    
    const successMessage = await screen.findByText('Search saved successfully!');
    expect(successMessage).toHaveClass('success');
    

    mockOnSave.mockRejectedValueOnce({ data: { error: 'Error' } });
    rerender(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    
    fireEvent.change(screen.getByPlaceholderText("e.g. 'name'"), { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));
    
    const errorMessage = await screen.findByText('Error');
    expect(errorMessage).toHaveClass('error');
  });
  test('clears input and message after successful save', async () => {
    mockOnSave.mockResolvedValueOnce();
    const { rerender } = render(
      <SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />
    );

    const input = screen.getByPlaceholderText("e.g. 'name'");
    fireEvent.change(input, { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    rerender(<SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByPlaceholderText("e.g. 'name'")).toHaveValue('');
    expect(screen.queryByText('Search saved successfully!')).not.toBeInTheDocument();
  });

  
  test('handles component unmount before timeout completes', async () => {
    mockOnSave.mockResolvedValueOnce();
    const { unmount } = render(
      <SaveSearchPopover onClose={mockOnClose} onSave={mockOnSave} />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. 'name'"), { target: { value: 'My Search' } });
    fireEvent.click(screen.getByText('Save'));

    unmount();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});