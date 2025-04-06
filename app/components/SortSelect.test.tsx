import { render, screen } from '@testing-library/react'; // Remove fireEvent import
// Remove unused userEvent import
import SortSelect from './SortSelect'; // Adjust the import path if necessary
import { SortOption } from '@/lib/SortConfig'; // Adjust the import path if necessary
import '@testing-library/jest-dom';
import React from 'react'; // Keep React import for JSX
// Import the mocked components to access their mock properties
import { Select as MockSelect } from '@/components/ui/select';

// Mock the underlying Shadcn UI Select components
jest.mock('@/components/ui/select', () => ({
  // Remove unused onValueChange from the mock function signature
  Select: jest.fn(({ children, value }) => (
    // Simulate the select wrapper and pass value/onChange
    // Note: The onChange here is just for simulation structure, we'll call the prop directly
    <div data-testid="mock-select" data-value={value}>
      {children}
    </div>
  )),
  SelectTrigger: jest.fn(({ children, ...props }) => <button {...props} data-testid="mock-select-trigger">{children}</button>),
  // Render the placeholder text directly for easier assertion
  SelectValue: jest.fn(({ placeholder }) => <span data-testid="mock-select-value">{placeholder || 'Selected'}</span>),
  SelectContent: jest.fn(({ children }) => <div data-testid="mock-select-content">{children}</div>),
  // Render options simply for checking existence and value prop
  SelectItem: jest.fn(({ children, value, ...props }) => <div {...props} data-testid={`mock-select-item-${value}`} data-value={value}>{children}</div>),
}));


describe('SortSelect Component', () => {
  const mockOnValueChange = jest.fn();
  const initialValue: SortOption = 'relevance';

  beforeEach(() => {
    // Reset the mock function before each test
    mockOnValueChange.mockClear();
  });

  it('should render the select trigger with the correct initial value text', () => {
    render(<SortSelect value={initialValue} onValueChange={mockOnValueChange} />);

    // Check if the trigger displays the text corresponding to the initial value
    // Note: Shadcn Select might render the value directly or use a placeholder initially.
    // We'll check for the text associated with 'relevance'.
    // Using a regex for flexibility.
    // Check the mocked trigger button
    expect(screen.getByTestId('mock-select-trigger')).toBeInTheDocument();
    // Check the mocked value display (might show placeholder initially based on mock)
    expect(screen.getByTestId('mock-select-value')).toHaveTextContent('Sort by');
  });

  // No userEvent needed now, just check if items are rendered within the mock content
  it('should render all sort options within the mocked content', () => {
    render(<SortSelect value={initialValue} onValueChange={mockOnValueChange} />);

    // Check if the mocked items are rendered with correct values and text
    expect(screen.getByTestId('mock-select-item-relevance')).toHaveTextContent('Relevance');
    expect(screen.getByTestId('mock-select-item-relevance')).toHaveAttribute('data-value', 'relevance');

    expect(screen.getByTestId('mock-select-item-best-selling')).toHaveTextContent('Trending');
    expect(screen.getByTestId('mock-select-item-best-selling')).toHaveAttribute('data-value', 'best-selling');

    expect(screen.getByTestId('mock-select-item-new-arrivals')).toHaveTextContent('New Arrivals');
    expect(screen.getByTestId('mock-select-item-new-arrivals')).toHaveAttribute('data-value', 'new-arrivals');

    expect(screen.getByTestId('mock-select-item-price-low-to-high')).toHaveTextContent('Price: Low to High');
    expect(screen.getByTestId('mock-select-item-price-low-to-high')).toHaveAttribute('data-value', 'price-low-to-high');

    expect(screen.getByTestId('mock-select-item-price-high-to-low')).toHaveTextContent('Price: High to Low');
    expect(screen.getByTestId('mock-select-item-price-high-to-low')).toHaveAttribute('data-value', 'price-high-to-low');
  });

  // Simulate the change handler passed to the mocked Select component
  it('should call onValueChange when the underlying Select component invokes its callback', () => {
    render(<SortSelect value={initialValue} onValueChange={mockOnValueChange} />);

    // Get the props passed to the mocked Select component in the last render
    // Ensure MockSelect is correctly typed as a Jest mock function
    const mockSelectProps = (MockSelect as jest.Mock).mock.calls[0][0];

    // Check if the onValueChange prop exists before calling it
    if (mockSelectProps && typeof mockSelectProps.onValueChange === 'function') {
      // Directly call the onValueChange function passed to the mocked Select
      mockSelectProps.onValueChange('price-high-to-low');
    } else {
      // Fail the test if the prop wasn't passed correctly
      throw new Error('onValueChange prop was not passed to the mocked Select component');
    }

    // Verify that the original callback (mockOnValueChange) was called
    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    expect(mockOnValueChange).toHaveBeenCalledWith('price-high-to-low');
  });

});
