import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Paper, Grid, Alert, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { UploadFile, CheckCircle, Error, Refresh, Download } from '@mui/icons-material';
import axios from 'axios';

/**
 * Enhanced Document Processor Component
 * 
 * This component provides a UI for uploading and processing financial documents
 * using the enhanced multi-agent system.
 */
const EnhancedDocumentProcessor = () => {
  // State
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  const [securities, setSecurities] = useState([]);
  const [isLoadingSecurities, setIsLoadingSecurities] = useState(false);
  const [securitiesError, setSecuritiesError] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const statusCheckInterval = useRef(null);
  
  // Clear status check interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);
  
  // Start status check when document ID changes
  useEffect(() => {
    if (documentId) {
      // Clear any existing interval
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      
      // Check status immediately
      checkDocumentStatus();
      
      // Set up interval for status checks
      statusCheckInterval.current = setInterval(checkDocumentStatus, 5000);
    }
  }, [documentId]);
  
  // Stop status check when processing is complete
  useEffect(() => {
    if (documentStatus === 'completed' || documentStatus === 'error') {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      
      // Load securities if processing completed successfully
      if (documentStatus === 'completed') {
        loadSecurities();
      }
    }
  }, [documentStatus]);
  
  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setDocumentId(null);
    setDocumentStatus(null);
    setProcessingError(null);
    setSecurities([]);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/api/financial/enhanced-processing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setDocumentId(response.data.document_id);
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError(error.response?.data?.error || 'Error uploading document');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Check document status
  const checkDocumentStatus = async () => {
    if (!documentId) return;
    
    try {
      const response = await axios.get(`/api/financial/enhanced-processing/${documentId}`);
      setDocumentStatus(response.data.status);
      
      if (response.data.status === 'error') {
        setProcessingError(response.data.error);
      }
    } catch (error) {
      console.error('Error checking document status:', error);
      setProcessingError(error.response?.data?.error || 'Error checking document status');
    }
  };
  
  // Load securities
  const loadSecurities = async () => {
    if (!documentId) return;
    
    setIsLoadingSecurities(true);
    setSecuritiesError(null);
    
    try {
      const response = await axios.get(`/api/financial/enhanced-processing/${documentId}/securities`);
      setSecurities(response.data.securities || []);
    } catch (error) {
      console.error('Error loading securities:', error);
      setSecuritiesError(error.response?.data?.error || 'Error loading securities');
    } finally {
      setIsLoadingSecurities(false);
    }
  };
  
  // Download results
  const handleDownload = async () => {
    if (!documentId) return;
    
    try {
      window.open(`/api/financial/enhanced-processing/${documentId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading results:', error);
    }
  };
  
  // Reset component
  const handleReset = () => {
    setFile(null);
    setIsUploading(false);
    setUploadError(null);
    setDocumentId(null);
    setDocumentStatus(null);
    setProcessingError(null);
    setSecurities([]);
    setIsLoadingSecurities(false);
    setSecuritiesError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
  };
  
  // Render status indicator
  const renderStatusIndicator = () => {
    if (!documentId) return null;
    
    if (documentStatus === 'processing') {
      return (
        <Box display="flex" alignItems="center" mb={2}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Processing document...</Typography>
        </Box>
      );
    } else if (documentStatus === 'completed') {
      return (
        <Box display="flex" alignItems="center" mb={2}>
          <CheckCircle color="success" sx={{ mr: 1 }} />
          <Typography>Processing completed successfully</Typography>
        </Box>
      );
    } else if (documentStatus === 'error') {
      return (
        <Box mb={2}>
          <Alert severity="error">
            {processingError || 'An error occurred during processing'}
          </Alert>
        </Box>
      );
    }
    
    return null;
  };
  
  // Render securities table
  const renderSecuritiesTable = () => {
    if (!securities.length) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Extracted Securities ({securities.length})
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ISIN</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell align="right">Weight (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {securities.map((security, index) => (
                <TableRow key={security.isin || index}>
                  <TableCell>{security.isin || 'N/A'}</TableCell>
                  <TableCell>{security.security_name || 'N/A'}</TableCell>
                  <TableCell align="right">{security.quantity?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell align="right">{security.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || 'N/A'}</TableCell>
                  <TableCell align="right">{security.value?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell>{security.currency || 'N/A'}</TableCell>
                  <TableCell align="right">{security.weight?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Enhanced Document Processing
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload a financial document to process it using our enhanced multi-agent system.
          The system will extract securities information with improved accuracy.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              fullWidth
            >
              Select Document
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || isUploading}
              fullWidth
            >
              {isUploading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                'Upload & Process'
              )}
            </Button>
          </Grid>
        </Grid>
        
        {file && (
          <Box mt={2}>
            <Chip
              label={`Selected file: ${file.name}`}
              variant="outlined"
              onDelete={() => setFile(null)}
            />
          </Box>
        )}
        
        {uploadError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {uploadError}
          </Alert>
        )}
      </Paper>
      
      {documentId && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Processing Results
            </Typography>
            <Box>
              <Button
                startIcon={<Refresh />}
                onClick={handleReset}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              {documentStatus === 'completed' && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  Download Results
                </Button>
              )}
            </Box>
          </Box>
          
          {renderStatusIndicator()}
          
          {isLoadingSecurities ? (
            <Box display="flex" alignItems="center" mt={3}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography>Loading securities...</Typography>
            </Box>
          ) : securitiesError ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              {securitiesError}
            </Alert>
          ) : (
            renderSecuritiesTable()
          )}
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedDocumentProcessor;
