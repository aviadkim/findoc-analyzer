import React, { useState, useEffect } from 'react';
import { FiUpload, FiSearch, FiFileText, FiBarChart2, FiDownload, FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw, FiLayers } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const FinDocRAG = () => {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [status, setStatus] = useState(null);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [securities, setSecurities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Document comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [secondFile, setSecondFile] = useState(null);
  const [secondDocumentId, setSecondDocumentId] = useState(null);
  const [secondStatus, setSecondStatus] = useState(null);
  const [secondSecurities, setSecondSecurities] = useState([]);
  const [secondSummary, setSecondSummary] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);

  // Check document status periodically
  useEffect(() => {
    let interval;
    if (documentId && status === 'processing') {
      interval = setInterval(() => {
        checkDocumentStatus(documentId);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [documentId, status]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/document/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setDocumentId(data.document_id);
        setStatus(data.status);
        setAnswer(null);
        setSecurities([]);
        setSummary(null);
      } else {
        setError(data.error || 'Failed to upload document');
      }
    } catch (err) {
      setError('Error uploading document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check document status
  const checkDocumentStatus = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/document/status/${docId}`);
      const data = await response.json();

      setStatus(data.status);

      if (data.status === 'completed') {
        // Get document summary and securities
        getDocumentSummary(docId);
        getDocumentSecurities(docId);
      }
    } catch (err) {
      console.error('Error checking document status:', err);
    }
  };

  // Get document summary
  const getDocumentSummary = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/document/summary/${docId}`);
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Error getting document summary:', err);
    }
  };

  // Get document securities
  const getDocumentSecurities = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/document/securities/${docId}`);
      const data = await response.json();
      setSecurities(data);
    } catch (err) {
      console.error('Error getting document securities:', err);
    }
  };

  // Query document
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!documentId) {
      setError('Please upload a document first');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/document/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          query: query,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setError(data.error || 'Failed to query document');
      }
    } catch (err) {
      setError('Error querying document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export document
  const handleExport = async () => {
    if (!documentId) {
      setError('Please upload a document first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/document/export/${documentId}`);
      const data = await response.json();

      if (response.ok) {
        // Open download URL in a new tab
        window.open(`http://localhost:5000${data.download_url}`, '_blank');
      } else {
        setError(data.error || 'Failed to export document');
      }
    } catch (err) {
      setError('Error exporting document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle comparison mode
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      // Reset second document state when entering comparison mode
      setSecondFile(null);
      setSecondDocumentId(null);
      setSecondStatus(null);
      setSecondSecurities([]);
      setSecondSummary(null);
      setComparisonResults(null);
    }
  };

  // Upload second document for comparison
  const handleSecondFileUpload = async (e) => {
    e.preventDefault();
    if (!secondFile) {
      setError('Please select a second file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', secondFile);

    try {
      const response = await fetch('http://localhost:5000/api/document/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSecondDocumentId(data.document_id);
        setSecondStatus(data.status);
      } else {
        setError(data.error || 'Failed to upload second document');
      }
    } catch (err) {
      setError('Error uploading second document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check second document status
  const checkSecondDocumentStatus = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/document/status/${docId}`);
      const data = await response.json();

      setSecondStatus(data.status);

      if (data.status === 'completed') {
        // Get document summary and securities
        getSecondDocumentSummary(docId);
        getSecondDocumentSecurities(docId);
      }
    } catch (err) {
      console.error('Error checking second document status:', err);
    }
  };

  // Get second document summary
  const getSecondDocumentSummary = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/document/summary/${docId}`);
      const data = await response.json();
      setSecondSummary(data);

      // If both documents are loaded, compare them
      if (summary && data) {
        compareDocuments(summary, data);
      }
    } catch (err) {
      console.error('Error getting second document summary:', err);
    }
  };

  // Get second document securities
  const getSecondDocumentSecurities = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/document/securities/${docId}`);
      const data = await response.json();
      setSecondSecurities(data);
    } catch (err) {
      console.error('Error getting second document securities:', err);
    }
  };

  // Compare documents
  const compareDocuments = (doc1, doc2) => {
    // Calculate differences
    const valueDifference = doc2.total_value - doc1.total_value;
    const valueDifferencePercent = (valueDifference / doc1.total_value) * 100;

    // Compare asset allocations
    const allAssetClasses = new Set([
      ...Object.keys(doc1.asset_allocation),
      ...Object.keys(doc2.asset_allocation)
    ]);

    const assetAllocationComparison = Array.from(allAssetClasses).map(assetClass => {
      const doc1Value = doc1.asset_allocation[assetClass] || 0;
      const doc2Value = doc2.asset_allocation[assetClass] || 0;
      const difference = doc2Value - doc1Value;

      return {
        name: assetClass,
        document1: doc1Value,
        document2: doc2Value,
        difference: difference
      };
    });

    // Set comparison results
    setComparisonResults({
      valueDifference,
      valueDifferencePercent,
      assetAllocationComparison,
      riskProfileChange: doc1.risk_profile !== doc2.risk_profile,
      diversificationScoreChange: doc2.diversification_score - doc1.diversification_score
    });
  };

  // Define colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let color = 'bg-gray-200 text-gray-800';
    let icon = <FiClock className="mr-1" />;

    if (status === 'completed') {
      color = 'bg-green-100 text-green-800';
      icon = <FiCheckCircle className="mr-1" />;
    } else if (status === 'error') {
      color = 'bg-red-100 text-red-800';
      icon = <FiAlertCircle className="mr-1" />;
    } else if (status === 'processing') {
      color = 'bg-blue-100 text-blue-800';
      icon = <FiClock className="mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Check second document status periodically
  useEffect(() => {
    let interval;
    if (secondDocumentId && secondStatus === 'processing') {
      interval = setInterval(() => {
        checkSecondDocumentStatus(secondDocumentId);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [secondDocumentId, secondStatus]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h1 className="text-2xl font-bold text-gray-800">FinDocRAG - Financial Document Analysis</h1>
        <button
          onClick={toggleComparisonMode}
          className={`flex items-center px-4 py-2 rounded-md transition duration-200 ease-in-out ${comparisonMode ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'} hover:bg-indigo-200`}
        >
          <FiLayers className="mr-2" />
          {comparisonMode ? 'Exit Comparison Mode' : 'Compare Documents'}
        </button>
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
          <FiUpload className="mr-2 text-blue-500" /> Upload Document
        </h2>
        <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select a financial document (PDF, Excel, CSV)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.xlsx,.csv"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 ease-in-out self-end"
            disabled={loading || !file}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : 'Upload'}
          </button>
        </form>

        {documentId && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Document ID</p>
                <p className="font-mono text-sm">{documentId}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={status} />
              </div>
              {file && (
                <div className="mt-2 sm:mt-0">
                  <p className="text-sm text-gray-500">File</p>
                  <p className="text-sm truncate max-w-xs">{file.name}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Query Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
          <FiSearch className="mr-2 text-green-500" /> Query Document
        </h2>
        <form onSubmit={handleQuery} className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ask a question about the document</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., What is the total portfolio value? What are the recommendations?"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              disabled={!documentId || status !== 'completed'}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 ease-in-out self-end"
            disabled={loading || !documentId || status !== 'completed'}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Querying...
              </span>
            ) : 'Query'}
          </button>
        </form>

        {answer && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Answer:</h3>
            <p className="whitespace-pre-line text-gray-800">{answer}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Document Comparison Section */}
      {comparisonMode && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FiRefreshCw className="mr-2 text-purple-500" /> Document Comparison
          </h2>

          {!secondDocumentId ? (
            <div>
              <p className="mb-4 text-gray-600">Upload a second document to compare with the first one.</p>
              <form onSubmit={handleSecondFileUpload} className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select a second financial document</label>
                  <input
                    type="file"
                    onChange={(e) => setSecondFile(e.target.files[0])}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    accept=".pdf,.xlsx,.csv"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 ease-in-out self-end"
                  disabled={loading || !secondFile}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : 'Upload for Comparison'}
                </button>
              </form>

              {secondDocumentId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Second Document ID</p>
                      <p className="font-mono text-sm">{secondDocumentId}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <p className="text-sm text-gray-500">Status</p>
                      <StatusBadge status={secondStatus} />
                    </div>
                    {secondFile && (
                      <div className="mt-2 sm:mt-0">
                        <p className="text-sm text-gray-500">File</p>
                        <p className="text-sm truncate max-w-xs">{secondFile.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : comparisonResults ? (
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Value Comparison */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Portfolio Value Comparison</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">First Document:</span>
                      <span className="font-semibold">{formatCurrency(summary.total_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Second Document:</span>
                      <span className="font-semibold">{formatCurrency(secondSummary.total_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difference:</span>
                      <span className={`font-semibold ${comparisonResults.valueDifference > 0 ? 'text-green-600' : comparisonResults.valueDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatCurrency(comparisonResults.valueDifference)} ({comparisonResults.valueDifferencePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk and Diversification Comparison */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Risk Profile Comparison</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">First Document:</span>
                      <span className="font-semibold">{summary.risk_profile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Second Document:</span>
                      <span className="font-semibold">{secondSummary.risk_profile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diversification Change:</span>
                      <span className={`font-semibold ${comparisonResults.diversificationScoreChange > 0 ? 'text-green-600' : comparisonResults.diversificationScoreChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {comparisonResults.diversificationScoreChange > 0 ? '+' : ''}{comparisonResults.diversificationScoreChange.toFixed(1)} points
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Allocation Comparison Chart */}
              <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Asset Allocation Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonResults.assetAllocationComparison}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Legend />
                      <Bar dataKey="document1" name="First Document" fill="#8884d8" />
                      <Bar dataKey="document2" name="Second Document" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Processing documents for comparison...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Summary */}
      {summary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FiFileText className="mr-2 text-indigo-500" /> Portfolio Summary {comparisonMode && 'of First Document'}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Stats */}
            <div className="col-span-1">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-semibold">{formatCurrency(summary.total_value)} {summary.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Count:</span>
                    <span className="font-semibold">{summary.security_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Profile:</span>
                    <span className="font-semibold">{summary.risk_profile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diversification Score:</span>
                    <span className="font-semibold">{summary.diversification_score}/100</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 ease-in-out flex items-center justify-center"
                disabled={loading}
              >
                <FiDownload className="mr-2" /> Export to CSV
              </button>
            </div>

            {/* Asset Allocation Chart */}
            <div className="col-span-1">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-full">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Asset Allocation</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(summary.asset_allocation).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {Object.entries(summary.asset_allocation).map(([name, value], index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="col-span-1">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-full">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {summary.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 mt-0.5">{index + 1}</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Securities Table */}
      {securities.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FiBarChart2 className="mr-2 text-blue-500" /> Securities
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securities.map((security, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{security.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{security.identifier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{security.security_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{security.asset_class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{security.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(security.value)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${security.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                          security.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {security.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinDocRAG;
