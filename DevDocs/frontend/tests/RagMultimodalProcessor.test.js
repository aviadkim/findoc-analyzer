import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import RagMultimodalProcessor from '../components/RagMultimodalProcessor';

// Mock axios
jest.mock('axios');

// Mock InteractiveVisualization component
jest.mock('../components/InteractiveVisualization', () => {
  return function MockInteractiveVisualization(props) {
    return (
      <div data-testid="mock-interactive-visualization">
        <div>Mock Interactive Visualization</div>
        <div>Data: {JSON.stringify(props.data)}</div>
      </div>
    );
  };
});

describe('RagMultimodalProcessor Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  test('renders upload form correctly', () => {
    render(<RagMultimodalProcessor />);
    
    // Check if the component title is rendered
    expect(screen.getByText('RAG Multimodal Financial Document Processor')).toBeInTheDocument();
    
    // Check if the upload form is rendered
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('PDF Document')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('Process Document')).toBeInTheDocument();
  });

  test('handles file upload correctly', () => {
    render(<RagMultimodalProcessor />);
    
    // Create a file input
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('PDF Document');
    
    // Upload a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if the file is uploaded
    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files.length).toBe(1);
  });

  test('handles form submission correctly', async () => {
    // Mock axios.post to return a successful response
    axios.post.mockResolvedValueOnce({
      status: 202,
      data: {
        status: 'processing',
        task_id: 'test-task-id',
        message: 'Document processing started'
      }
    });
    
    // Mock axios.get to return a successful response for task status
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        status: 'completed',
        progress: 100,
        result_url: '/api/rag/result/test-task-id'
      }
    });
    
    // Mock axios.get to return a successful response for task result
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        document_info: {
          document_name: 'test.pdf',
          document_date: '2025-03-31',
          processing_date: '2025-04-01',
          processing_time: 10.5
        },
        portfolio: {
          total_value: 19510599,
          currency: 'USD',
          securities: [
            { name: 'Apple Inc.', isin: 'US0378331005', value: 2345678, quantity: 13500 }
          ],
          asset_allocation: {
            'Equities': { value: 8779769, weight: 0.45 }
          }
        },
        metrics: {
          total_securities: 1,
          total_asset_classes: 1
        }
      }
    });
    
    render(<RagMultimodalProcessor />);
    
    // Create a file input
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('PDF Document');
    
    // Upload a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Process Document'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:24125/api/rag/process',
        expect.any(FormData)
      );
    });
    
    // Wait for the task status to be checked
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:24125/api/rag/task/test-task-id'
      );
    });
    
    // Wait for the task result to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:24125/api/rag/result/test-task-id'
      );
    });
    
    // Check if the result is displayed
    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('Document Information')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    });
  });

  test('handles error during form submission', async () => {
    // Mock axios.post to return an error
    axios.post.mockRejectedValueOnce(new Error('Failed to process document'));
    
    render(<RagMultimodalProcessor />);
    
    // Create a file input
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('PDF Document');
    
    // Upload a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Process Document'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:24125/api/rag/process',
        expect.any(FormData)
      );
    });
    
    // Check if the error is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to process document')).toBeInTheDocument();
    });
  });

  test('handles view securities button click', async () => {
    // Mock axios.post to return a successful response
    axios.post.mockResolvedValueOnce({
      status: 202,
      data: {
        status: 'processing',
        task_id: 'test-task-id',
        message: 'Document processing started'
      }
    });
    
    // Mock axios.get to return a successful response for task status
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        status: 'completed',
        progress: 100,
        result_url: '/api/rag/result/test-task-id'
      }
    });
    
    // Mock axios.get to return a successful response for task result
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        document_info: {
          document_name: 'test.pdf',
          document_date: '2025-03-31',
          processing_date: '2025-04-01',
          processing_time: 10.5
        },
        portfolio: {
          total_value: 19510599,
          currency: 'USD',
          securities: [
            { name: 'Apple Inc.', isin: 'US0378331005', value: 2345678, quantity: 13500 }
          ],
          asset_allocation: {
            'Equities': { value: 8779769, weight: 0.45 }
          }
        },
        metrics: {
          total_securities: 1,
          total_asset_classes: 1
        }
      }
    });
    
    render(<RagMultimodalProcessor />);
    
    // Create a file input
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('PDF Document');
    
    // Upload a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Process Document'));
    
    // Wait for the result to be displayed
    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
    });
    
    // Click the view securities button
    fireEvent.click(screen.getByText('View Securities'));
    
    // Check if the securities modal is displayed
    await waitFor(() => {
      expect(screen.getByText('Securities')).toBeInTheDocument();
    });
  });

  test('handles view visualizations button click', async () => {
    // Mock axios.post to return a successful response
    axios.post.mockResolvedValueOnce({
      status: 202,
      data: {
        status: 'processing',
        task_id: 'test-task-id',
        message: 'Document processing started'
      }
    });
    
    // Mock axios.get to return a successful response for task status
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        status: 'completed',
        progress: 100,
        result_url: '/api/rag/result/test-task-id'
      }
    });
    
    // Mock axios.get to return a successful response for task result
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        document_info: {
          document_name: 'test.pdf',
          document_date: '2025-03-31',
          processing_date: '2025-04-01',
          processing_time: 10.5
        },
        portfolio: {
          total_value: 19510599,
          currency: 'USD',
          securities: [
            { name: 'Apple Inc.', isin: 'US0378331005', value: 2345678, quantity: 13500 }
          ],
          asset_allocation: {
            'Equities': { value: 8779769, weight: 0.45 }
          }
        },
        metrics: {
          total_securities: 1,
          total_asset_classes: 1
        }
      }
    });
    
    // Mock axios.get to return a successful response for visualizations
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        files: [
          {
            name: 'asset_allocation.png',
            type: 'image/png',
            url: 'https://via.placeholder.com/800x600.png?text=Asset+Allocation',
            title: 'Asset Allocation'
          }
        ]
      }
    });
    
    render(<RagMultimodalProcessor />);
    
    // Create a file input
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('PDF Document');
    
    // Upload a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Process Document'));
    
    // Wait for the result to be displayed
    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
    });
    
    // Click the view visualizations button
    fireEvent.click(screen.getByText('View Visualizations'));
    
    // Check if the visualizations modal is displayed
    await waitFor(() => {
      expect(screen.getByText('Interactive Visualizations')).toBeInTheDocument();
      expect(screen.getByTestId('mock-interactive-visualization')).toBeInTheDocument();
    });
  });

  test('handles download JSON button click', async () => {
    // Mock axios.post to return a successful response
    axios.post.mockResolvedValueOnce({
      status: 202,
      data: {
        status: 'processing',
        task_id: 'test-task-id',
        message: 'Document processing started'
      }
    });
    
    // Mock axios.get to return a successful response for task status
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        status: 'completed',
        progress: 100,
        result_url: '/api/rag/result/test-task-id'
      }
    });
    
    // Mock axios.get to return a successful response for task result
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        task_id: 'test-task-id',
        document_info: {
          document_id: 'test-doc-id',
          document_name: 'test.pdf',
          document_date: '2025-03-31',
          processing_date: '2025-04-01',
          processing_time: 10.5
        },
        portfolio: {
          total_value: 19510599,
          currency: 'USD',
          securities: [
            { name: 'Apple Inc.', isin: 'US0378331005', value: 2345678, quantity: 13500 }
          ],
          asset_allocation: {
            'Equities': { value: 8779769, weight: 0.45 }
          }
        },
        metrics: {
          total_securities: 1,
          total_asset_classes: 1
        }
      }
    });
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:test');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement and a.click
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn()
    };
    document.createElement = jest.fn(() => mockAnchor);
    
    render(<RagMultimodalProcessor />);
    
    // Create a file input
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText('PDF Document');
    
    // Upload a file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Process Document'));
    
    // Wait for the result to be displayed
    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
    });
    
    // Click the download JSON button
    fireEvent.click(screen.getByText('Download JSON'));
    
    // Check if the download function was called
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toBe('blob:test');
    expect(mockAnchor.download).toBe('test-doc-id_processed.json');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
