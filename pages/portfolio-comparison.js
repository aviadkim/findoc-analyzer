/**
 * Portfolio Comparison Page
 * 
 * This page allows users to compare portfolios from different dates/documents to see how their
 * investments have evolved over time.
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Breadcrumbs, 
  Link, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { Home, Folder, CompareArrows } from '@mui/icons-material';
import PortfolioComparisonSelector from '../components/PortfolioComparisonSelector';
import PortfolioComparison from '../components/PortfolioComparison';
import { useRouter } from 'next/router';

function PortfolioComparisonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Get document IDs from URL query
  const { document1Id, document2Id } = router.query;
  
  useEffect(() => {
    // Load documents when component mounts
    loadDocuments();
  }, []);
  
  useEffect(() => {
    // If document IDs are provided in URL, run comparison when documents are loaded
    if (documentsLoaded && document1Id && document2Id) {
      runComparison({
        document1Id,
        document2Id,
        options: {
          includeMarketData: true,
          thresholdPercentage: 5.0
        }
      });
    }
  }, [documentsLoaded, document1Id, document2Id]);
  
  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch documents with securities data
      const response = await fetch('/api/documents?processed=true&includeContent=true');
      
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const data = await response.json();
      
      setDocuments(data.documents || []);
      setDocumentsLoaded(true);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Run comparison
  const runComparison = async (comparisonData) => {
    try {
      if (!comparisonData.document1Id || !comparisonData.document2Id) {
        setError('Please select two documents to compare');
        return;
      }
      
      setComparing(true);
      setError(null);
      
      // Update URL with document IDs for sharing/bookmarking
      router.push({
        pathname: router.pathname,
        query: { 
          document1Id: comparisonData.document1Id, 
          document2Id: comparisonData.document2Id 
        }
      }, undefined, { shallow: true });
      
      // Call API to compare portfolios
      const response = await fetch('/api/portfolio-comparison/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comparisonData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to compare portfolios');
      }
      
      const data = await response.json();
      
      setComparison(data.comparison);
      setNotification('Comparison completed successfully');
    } catch (err) {
      console.error('Error comparing portfolios:', err);
      setError(err.message || 'Failed to compare portfolios. Please try again later.');
    } finally {
      setComparing(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="/" 
            onClick={(e) => { e.preventDefault(); router.push('/'); }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/documents"
            onClick={(e) => { e.preventDefault(); router.push('/documents'); }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
            Documents
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <CompareArrows sx={{ mr: 0.5 }} fontSize="inherit" />
            Portfolio Comparison
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Portfolio Comparison
        </Typography>
        
        <Typography variant="body1" paragraph>
          Compare your portfolio composition across different documents to track changes over time.
          See how your asset allocation has evolved, which securities have been added or removed,
          and how your investment values have changed.
        </Typography>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading state for initial documents load */}
        {loading && !documents.length && (
          <Box display="flex" justifyContent="center" alignItems="center" py={5}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading documents...
            </Typography>
          </Box>
        )}
        
        {/* Document selection */}
        {!loading && documents.length > 0 && (
          <PortfolioComparisonSelector 
            documents={documents}
            onRunComparison={runComparison}
            loading={comparing}
          />
        )}
        
        {/* No documents available */}
        {!loading && documents.length === 0 && (
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Documents Available
            </Typography>
            <Typography variant="body1">
              You need to upload and process at least two documents with portfolio data before
              you can use the comparison feature.
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                onClick={() => router.push('/upload')}
              >
                Upload Documents
              </Button>
            </Box>
          </Paper>
        )}
        
        {/* Comparison results */}
        <PortfolioComparison
          document1Id={document1Id}
          document2Id={document2Id}
          comparison={comparison}
          onRunComparison={runComparison}
          loading={comparing}
        />
        
        {/* Success notification */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          message={notification}
        />
      </Box>
    </Container>
  );
}

export default PortfolioComparisonPage;