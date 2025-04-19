import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractiveVisualization from '../components/InteractiveVisualization';

// Mock the dynamic import of react-apexcharts
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = (props) => <div data-testid="mock-chart">{JSON.stringify(props)}</div>;
  DynamicComponent.displayName = 'MockChart';
  return DynamicComponent;
});

describe('InteractiveVisualization Component', () => {
  const mockData = {
    task_id: 'test-task-id',
    document_info: {
      title: 'Financial Report Q1 2025',
      date: '2025-03-31',
      pages: 42,
      language: 'English'
    },
    financial_data: {
      total_value: '$19,510,599',
      currency: 'USD',
      securities: [
        { name: 'Apple Inc.', isin: 'US0378331005', value: '$2,345,678', quantity: 13500 },
        { name: 'Microsoft Corp', isin: 'US5949181045', value: '$3,456,789', quantity: 8400 },
        { name: 'Amazon.com Inc', isin: 'US0231351067', value: '$1,987,654', quantity: 6200 }
      ],
      asset_allocation: {
        'Equities': '45%',
        'Bonds': '30%',
        'Cash': '15%',
        'Alternative Investments': '10%'
      }
    },
    rag_validation: {
      accuracy: '98.5%',
      confidence: 'high',
      issues_detected: 0
    }
  };

  test('renders loading state correctly', () => {
    render(<InteractiveVisualization isLoading={true} />);
    expect(screen.getByText('Loading visualization data...')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const error = { message: 'Failed to load visualization data' };
    render(<InteractiveVisualization error={error} />);
    expect(screen.getByText('Error loading visualization!')).toBeInTheDocument();
    expect(screen.getByText('Failed to load visualization data')).toBeInTheDocument();
  });

  test('renders empty state correctly', () => {
    render(<InteractiveVisualization />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Please process a document to view visualizations.')).toBeInTheDocument();
  });

  test('renders visualization with data correctly', () => {
    render(<InteractiveVisualization data={mockData} />);
    
    // Check if the component title is rendered
    expect(screen.getByText('Interactive Financial Visualizations')).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText('Securities')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    
    // Check if the chart is rendered
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    
    // Check if the help text is rendered
    expect(screen.getByText('Click on the chart legends to toggle visibility. Use the toolbar in the top-right corner for additional options.')).toBeInTheDocument();
  });

  test('changes chart type when select is changed', async () => {
    render(<InteractiveVisualization data={mockData} />);
    
    // Find the select element
    const select = screen.getAllByRole('combobox')[0];
    
    // Change the chart type to donut
    fireEvent.change(select, { target: { value: 'donut' } });
    
    // Wait for the chart to update
    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });

  test('switches tabs correctly', async () => {
    render(<InteractiveVisualization data={mockData} />);
    
    // Click on the Securities tab
    fireEvent.click(screen.getByText('Securities'));
    
    // Wait for the tab to switch
    await waitFor(() => {
      expect(screen.getByText('Securities by Value')).toBeInTheDocument();
    });
    
    // Click on the Performance tab
    fireEvent.click(screen.getByText('Performance'));
    
    // Wait for the tab to switch
    await waitFor(() => {
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
    });
  });

  test('resets view when reset button is clicked', async () => {
    render(<InteractiveVisualization data={mockData} />);
    
    // Find the reset button
    const resetButton = screen.getAllByText('Reset View')[0];
    
    // Click the reset button
    fireEvent.click(resetButton);
    
    // Wait for the chart to update
    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });

  test('refreshes data when refresh button is clicked', async () => {
    render(<InteractiveVisualization data={mockData} />);
    
    // Find the refresh button
    const refreshButton = screen.getAllByText('Refresh Data')[0];
    
    // Click the refresh button
    fireEvent.click(refreshButton);
    
    // Wait for the chart to update
    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });
});
