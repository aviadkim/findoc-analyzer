import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, Container, Divider, Grid, Paper, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload } from '@mui/icons-material';
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

const SimpleRagProcessor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.error || 'Error processing document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Simple RAG Document Processor
      </Typography>
      <Typography variant="body1" paragraph>
        Upload a financial document (PDF) to analyze it using RAG.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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
        >
          {loading ? <CircularProgress size={24} /> : 'Process Document'}
        </Button>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {result && (
        <Card variant="outlined">
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
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Asset Allocation
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(result.results.asset_allocation).map(([asset, value]) => (
                <Grid item xs={6} key={asset}>
                  <Typography variant="body2">
                    <strong>{asset}:</strong> {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SimpleRagProcessor;
