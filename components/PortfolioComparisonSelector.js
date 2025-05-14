/**
 * Portfolio Comparison Selector Component
 * 
 * This component allows users to select two documents for portfolio comparison.
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, 
  FormControl, InputLabel, Select, MenuItem,
  FormHelperText, CircularProgress, Divider,
  Alert
} from '@mui/material';
import { CompareArrows, CalendarToday } from '@mui/icons-material';

function PortfolioComparisonSelector({ documents, onRunComparison, loading }) {
  const [document1Id, setDocument1Id] = useState('');
  const [document2Id, setDocument2Id] = useState('');
  const [options, setOptions] = useState({
    includeMarketData: true,
    thresholdPercentage: 5.0,
    useMarketValues: false
  });
  const [error, setError] = useState(null);

  // Filter documents that can be compared (only those with securities data)
  const comparableDocuments = Array.isArray(documents) 
    ? documents.filter(doc => 
        doc.processed && 
        doc.content && 
        Array.isArray(doc.content.securities) && 
        doc.content.securities.length > 0)
    : [];
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Get document info for display
  const getDocumentInfo = (docId) => {
    if (!docId) return null;
    const doc = comparableDocuments.find(d => d.id === docId);
    if (!doc) return null;
    
    return {
      name: doc.fileName,
      date: formatDate(doc.uploadDate),
      securities: doc.content?.securities?.length || 0,
      totalValue: doc.content?.securities?.reduce((sum, sec) => sum + (sec.value || 0), 0) || 0
    };
  };

  // Handle document 1 selection
  const handleDocument1Change = (e) => {
    const newDoc1Id = e.target.value;
    setDocument1Id(newDoc1Id);
    
    // If document 2 is the same as the new document 1, clear document 2
    if (newDoc1Id === document2Id) {
      setDocument2Id('');
    }
  };

  // Handle document 2 selection
  const handleDocument2Change = (e) => {
    const newDoc2Id = e.target.value;
    setDocument2Id(newDoc2Id);
    
    // If document 1 is the same as the new document 2, clear document 1
    if (newDoc2Id === document1Id) {
      setDocument1Id('');
    }
  };

  // Handle comparison
  const handleRunComparison = async () => {
    if (!document1Id || !document2Id) {
      setError('Please select two documents to compare');
      return;
    }

    try {
      setError(null);
      await onRunComparison({
        document1Id,
        document2Id,
        options
      });
    } catch (err) {
      setError(err.message || 'Error running comparison');
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const doc1Info = getDocumentInfo(document1Id);
  const doc2Info = getDocumentInfo(document2Id);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Select Documents to Compare</Typography>
      
      {comparableDocuments.length < 2 ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need at least two processed documents with securities data to make a comparison.
        </Alert>
      ) : null}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Document 1 Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="document1-label">First Document</InputLabel>
            <Select
              labelId="document1-label"
              id="document1-select"
              value={document1Id}
              label="First Document"
              onChange={handleDocument1Change}
              disabled={loading || comparableDocuments.length < 1}
            >
              <MenuItem value="">
                <em>Select a document</em>
              </MenuItem>
              {comparableDocuments.map((doc) => (
                <MenuItem 
                  key={doc.id} 
                  value={doc.id}
                  disabled={doc.id === document2Id}
                >
                  {doc.fileName} ({formatDate(doc.uploadDate)})
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>This will be the "before" or baseline document</FormHelperText>
          </FormControl>
          
          {doc1Info && (
            <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
              <Typography variant="subtitle2">{doc1Info.name}</Typography>
              <Box display="flex" alignItems="center" mt={0.5}>
                <CalendarToday fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2">{doc1Info.date}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                {doc1Info.securities} securities | {formatCurrency(doc1Info.totalValue)}
              </Typography>
            </Box>
          )}
        </Grid>
        
        {/* Document 2 Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="document2-label">Second Document</InputLabel>
            <Select
              labelId="document2-label"
              id="document2-select"
              value={document2Id}
              label="Second Document"
              onChange={handleDocument2Change}
              disabled={loading || comparableDocuments.length < 1}
            >
              <MenuItem value="">
                <em>Select a document</em>
              </MenuItem>
              {comparableDocuments.map((doc) => (
                <MenuItem 
                  key={doc.id} 
                  value={doc.id}
                  disabled={doc.id === document1Id}
                >
                  {doc.fileName} ({formatDate(doc.uploadDate)})
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>This will be the "after" or comparison document</FormHelperText>
          </FormControl>
          
          {doc2Info && (
            <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
              <Typography variant="subtitle2">{doc2Info.name}</Typography>
              <Box display="flex" alignItems="center" mt={0.5}>
                <CalendarToday fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2">{doc2Info.date}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                {doc2Info.securities} securities | {formatCurrency(doc2Info.totalValue)}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
      
      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CompareArrows />}
          onClick={handleRunComparison}
          disabled={loading || !document1Id || !document2Id || comparableDocuments.length < 2}
          size="large"
        >
          {loading ? 'Running Comparison...' : 'Compare Portfolios'}
        </Button>
      </Box>
    </Paper>
  );
}

export default PortfolioComparisonSelector;