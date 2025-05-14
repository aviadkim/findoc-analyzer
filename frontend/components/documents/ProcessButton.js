import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Document Process Button Component
 * 
 * This component provides functionality to process a document through various agents.
 */
const ProcessButton = ({ document, onProcessComplete, className }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [error, setError] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const router = useRouter();

  // Available processing agents
  const availableAgents = [
    { id: 'ISINExtractorAgent', name: 'ISIN Extractor', description: 'Extracts International Securities Identification Numbers' },
    { id: 'FinancialTableDetectorAgent', name: 'Financial Table Detector', description: 'Identifies tables containing financial data' },
    { id: 'FinancialDataAnalyzerAgent', name: 'Financial Data Analyzer', description: 'Analyzes financial data for insights' },
    { id: 'FinancialAdvisorAgent', name: 'Financial Advisor', description: 'Provides investment advice based on portfolio analysis' },
    { id: 'DocumentComparisonAgent', name: 'Document Comparison', description: 'Compares multiple financial documents' },
    { id: 'DataExportAgent', name: 'Data Export', description: 'Exports extracted data in various formats' }
  ];

  /**
   * Toggle agent selection
   * @param {string} agentId - Agent ID
   */
  const toggleAgent = (agentId) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  /**
   * Toggle all agents
   */
  const toggleAllAgents = () => {
    if (selectedAgents.length === availableAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(availableAgents.map(agent => agent.id));
    }
  };

  /**
   * Start standard processing
   */
  const startStandardProcessing = async () => {
    setShowOptions(false);
    setSelectedAgents(['ISINExtractorAgent', 'FinancialTableDetectorAgent', 'FinancialDataAnalyzerAgent']);
    await startProcessing();
  };

  /**
   * Start custom processing
   */
  const startCustomProcessing = async () => {
    setShowOptions(false);
    await startProcessing();
  };

  /**
   * Start processing document
   */
  const startProcessing = async () => {
    if (!document || !document.id) {
      setError('Invalid document');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProcessingProgress(0);

      // Create a custom axios instance with progress tracking
      const axiosInstance = axios.create({
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProcessingProgress(percentCompleted);
        }
      });

      // Process the document
      const response = await axiosInstance.post('/api/documents/process', {
        documentId: document.id,
        agents: selectedAgents.length > 0 ? selectedAgents : ['ISINExtractorAgent', 'FinancialTableDetectorAgent', 'FinancialDataAnalyzerAgent']
      });

      // Update processing progress
      setProcessingProgress(100);

      // Wait a moment to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call the onProcessComplete callback if provided
      if (onProcessComplete && typeof onProcessComplete === 'function') {
        onProcessComplete(response.data);
      }

      // Redirect to document details page
      router.push(`/documents/${document.id}`);
    } catch (error) {
      console.error('Error processing document:', error);
      setError(error.response?.data?.message || 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Toggle processing options
   */
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  /**
   * Render agent checkbox
   * @param {object} agent - Agent object
   * @returns {JSX.Element} Agent checkbox
   */
  const renderAgentCheckbox = (agent) => (
    <div key={agent.id} className="agent-checkbox">
      <label className="agent-label">
        <input
          type="checkbox"
          checked={selectedAgents.includes(agent.id)}
          onChange={() => toggleAgent(agent.id)}
          disabled={isProcessing}
          data-testid={`agent-checkbox-${agent.id}`}
        />
        <span className="agent-name">{agent.name}</span>
      </label>
      <p className="agent-description">{agent.description}</p>
    </div>
  );

  // If processing, show progress bar
  if (isProcessing) {
    return (
      <div className="processing-container" data-testid="processing-indicator">
        <div className="processing-status">
          <div className="spinner"></div>
          <div className="processing-text">Processing document... {processingProgress}%</div>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${processingProgress}%` }}
            aria-valuenow={processingProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    );
  }

  // If showing options, render options panel
  if (showOptions) {
    return (
      <div className="process-options-panel" data-testid="process-options-panel">
        <div className="process-options-header">
          <h3>Process Document</h3>
          <button
            className="close-button"
            onClick={toggleOptions}
            aria-label="Close process options"
          >
            &times;
          </button>
        </div>

        <div className="process-options-body">
          <div className="process-type-selection">
            <button
              className="btn btn-primary"
              onClick={startStandardProcessing}
              data-testid="standard-processing-option"
            >
              Standard Processing
            </button>
            <div className="process-type-divider">or</div>
            <div className="custom-processing">
              <h4>Custom Processing</h4>
              <div className="select-all-container">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAgents.length === availableAgents.length}
                    onChange={toggleAllAgents}
                    disabled={isProcessing}
                  />
                  Select All Agents
                </label>
              </div>
              <div className="agents-list">
                {availableAgents.map(renderAgentCheckbox)}
              </div>
              <button
                className="btn btn-success"
                onClick={startCustomProcessing}
                disabled={selectedAgents.length === 0}
                data-testid="start-processing-button"
              >
                Start Processing
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Default view: process button
  return (
    <button
      className={`process-button ${className || ''}`}
      onClick={toggleOptions}
      disabled={isProcessing}
      data-testid="process-button"
    >
      <span className="process-icon">⚙️</span>
      <span className="process-text">Process Document</span>
    </button>
  );
};

export default ProcessButton;
