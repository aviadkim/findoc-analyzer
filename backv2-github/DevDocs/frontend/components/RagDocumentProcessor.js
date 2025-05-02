import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, Container, Divider, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Search } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:24125';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const RagDocumentProcessor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [documentId, setDocumentId] = useState('');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/rag/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      setDocumentId(response.data.document_id);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.error || 'Error processing document');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setQueryError('');
  };

  const handleQuerySubmit = async () => {
    if (!documentId) {
      setQueryError('Please process a document first');
      return;
    }

    if (!query.trim()) {
      setQueryError('Please enter a query');
      return;
    }

    setQueryLoading(true);
    setQueryError('');
    setQueryResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/rag/query`, {
        document_id: documentId,
        query: query,
      });

      setQueryResult(response.data);
    } catch (err) {
      console.error('Error querying document:', err);
      setQueryError(err.response?.data?.error || 'Error querying document');
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Document Analysis with RAG
      </Typography>
      <Typography variant="body1" paragraph>
        Upload a financial document (PDF) to analyze it using Retrieval-Augmented Generation (RAG).
        The system will extract key information and allow you to ask questions about the document.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upload Document
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Select File
                <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".pdf" />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Selected: {file.name}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file || loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Process Document'}
            </Button>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {result && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Document Analysis Results
                  </Typography>
                  <Typography variant="body2">
                    <strong>Document ID:</strong> {result.document_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Document Type:</strong> {result.results.document_type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Value:</strong> {result.results.total_value} {result.results.currency}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Securities Count:</strong> {result.results.securities_count}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Has Financial Statements:</strong> {result.results.has_financial_statements ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Query Document
            </Typography>
            <TextField
              fullWidth
              label="Enter your question about the document"
              variant="outlined"
              value={query}
              onChange={handleQueryChange}
              disabled={!documentId}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleQuerySubmit}
              disabled={!documentId || !query.trim() || queryLoading}
              startIcon={<Search />}
              sx={{ mb: 2 }}
            >
              {queryLoading ? <CircularProgress size={24} /> : 'Ask Question'}
            </Button>
            {queryError && (
              <Typography color="error" variant="body2">
                {queryError}
              </Typography>
            )}
            {queryResult && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Answer
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {queryResult.answer}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RagDocumentProcessor;
