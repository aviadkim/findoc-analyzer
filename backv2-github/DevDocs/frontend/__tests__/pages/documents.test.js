import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentsPage from '../../pages/documents';

// Mock the FinDocUI component
jest.mock('../../components/FinDocUI', () => {
  return ({ children }) => <div data-testid="findoc-ui">{children}</div>;
});

// Mock axios
jest.mock('axios');

describe('Documents Page', () => {
  test('renders the documents page', () => {
    render(<DocumentsPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('My Documents')).toBeInTheDocument();
    
    // Check if the search input is rendered
    expect(screen.getByPlaceholderText('Search documents by name or tag')).toBeInTheDocument();
    
    // Check if the filter dropdown is rendered
    expect(screen.getByText('Filter by status')).toBeInTheDocument();
    
    // Check if the tabs are rendered
    expect(screen.getByText('List View')).toBeInTheDocument();
    expect(screen.getByText('Grid View')).toBeInTheDocument();
  });

  test('filters documents based on search term', () => {
    render(<DocumentsPage />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('Search documents by name or tag');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'Financial' } });
    
    // Check if the filtered documents are displayed
    expect(screen.getByText('Q4 Financial Report 2023')).toBeInTheDocument();
    
    // Check if the non-matching documents are not displayed
    expect(screen.queryByText('Tax Documents 2023')).not.toBeInTheDocument();
  });

  test('filters documents based on status', () => {
    render(<DocumentsPage />);
    
    // Get the status filter dropdown
    const statusFilter = screen.getByText('Filter by status');
    
    // Select the "Processing" status
    fireEvent.change(statusFilter, { target: { value: 'Processing' } });
    
    // Check if the filtered documents are displayed
    expect(screen.getByText('Tax Documents 2023')).toBeInTheDocument();
    
    // Check if the non-matching documents are not displayed
    expect(screen.queryByText('Q4 Financial Report 2023')).not.toBeInTheDocument();
  });

  test('switches between list and grid views', () => {
    render(<DocumentsPage />);
    
    // Check if the list view is active by default
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Click on the grid view tab
    fireEvent.click(screen.getByText('Grid View'));
    
    // Check if the grid view is now active
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByText('View').length).toBeGreaterThan(0);
    
    // Click back on the list view tab
    fireEvent.click(screen.getByText('List View'));
    
    // Check if the list view is active again
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
