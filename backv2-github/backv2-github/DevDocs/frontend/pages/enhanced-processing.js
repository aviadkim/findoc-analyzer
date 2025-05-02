import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Home, Description } from '@mui/icons-material';
import EnhancedDocumentProcessor from '../components/EnhancedDocumentProcessor';
import FinDocUI from '../components/FinDocUI';

/**
 * Enhanced Processing Page
 * 
 * This page provides access to the enhanced document processing capabilities.
 */
const EnhancedProcessingPage = () => {
  return (
    <FinDocUI>
      <Container maxWidth="lg">
        <Box mb={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center' }}
              color="text.primary"
            >
              <Description sx={{ mr: 0.5 }} fontSize="inherit" />
              Enhanced Document Processing
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Enhanced Financial Document Processing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process financial documents with our advanced multi-agent system for improved accuracy and reliability.
            The system uses specialized agents for document analysis, table understanding, securities extraction, and financial reasoning.
          </Typography>
        </Box>
        
        <EnhancedDocumentProcessor />
      </Container>
    </FinDocUI>
  );
};

export default EnhancedProcessingPage;
