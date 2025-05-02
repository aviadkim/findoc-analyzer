import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  TextField, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  UploadFile, 
  Search, 
  Download, 
  PieChart, 
  Assessment, 
  Info,
  Send
} from '@mui/icons-material';

/**
 * FinDocRAG Component for integrating Google Agent Technologies
 * with the existing FinDoc Analyzer frontend.
 */
const FinDocRAGComponent = ({ apiBaseUrl = '' }) => {
  // State
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [documentStatus, setDocumentStatus] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [documentSummary, setDocumentSummary] = useState(null);
  const [securities, setSecurities] = useState([]);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const integrationRef = useRef(null);
  
  // Initialize integration
  useEffect(() => {
    // Create integration instance
    integrationRef.current = new window.FinDocRAGIntegration({
      apiBaseUrl,
      onStatusChange: handleStatusChange,
      onError: handleError
    });
    
    return () => {
      // Cleanup if needed
    };
  }, [apiBaseUrl]);
  
  // Handle document status change
  const handleStatusChange = (documentId, status) => {
    setDocumentStatus(prev => ({
      ...prev,
      [documentId]: status
    }));
    
    // If document is completed, fetch summary and securities
    if (status === 'completed') {
      fetchDocumentSummary(documentId);
      fetchSecurities(documentId);
    }
  };
  
  // Handle errors
  const handleError = (source, error) => {
    console.error(`[${source}]`, error);
    
    if (source === 'Upload error') {
      setUploadError(error.message);
      setIsUploading(false);
    } else if (source === 'Query error') {
      setQueryError(error.message);
      setIsQuerying(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const result = await integrationRef.current.uploadDocument(file);
      setActiveDocumentId(result.document_id);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle query submission
  const handleQuerySubmit = async (event) => {
    event.preventDefault();
    
    if (!query.trim() || !activeDocumentId) return;
    
    setIsQuerying(true);
    setQueryError(null);
    
    try {
      const result = await integrationRef.current.queryDocument(query);
      setQueryResult(result);
    } catch (error) {
      setQueryError(error.message);
    } finally {
      setIsQuerying(false);
    }
  };
  
  // Fetch document summary
  const fetchDocumentSummary = async (documentId) => {
    try {
      const summary = await integrationRef.current.getDocumentSummary(documentId);
      setDocumentSummary(summary);
    } catch (error) {
      console.error('Error fetching document summary:', error);
    }
  };
  
  // Fetch securities
  const fetchSecurities = async (documentId) => {
    try {
      const securities = await integrationRef.current.getDocumentSecurities(documentId);
      setSecurities(securities);
    } catch (error) {
      console.error('Error fetching securities:', error);
    }
  };
  
  // Export to CSV
  const handleExport = async () => {
    try {
      const result = await integrationRef.current.exportDocument();
      // Open download in new tab
      window.open(result.fullDownloadUrl, '_blank');
    } catch (error) {
      console.error('Error exporting document:', error);
    }
  };
  
  // Render document status
  const renderDocumentStatus = () => {
    if (!activeDocumentId) return null;
    
    const status = documentStatus[activeDocumentId];
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        {status === 'processing' && (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Processing document...</Typography>
          </>
        )}
        {status === 'completed' && (
          <>
            <Chip 
              color="success" 
              label="Document Processed" 
              icon={<Info />} 
              sx={{ mr: 1 }} 
            />
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleExport}
              size="small"
            >
              Export to CSV
            </Button>
          </>
        )}
      </Box>
    );
  };
  
  // Render document summary
  const renderDocumentSummary = () => {
    if (!documentSummary) return null;
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Portfolio Summary" 
          subheader={`Document ID: ${documentSummary.document_id}`}
          avatar={<Assessment />}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                Total Value: {documentSummary.total_value} {documentSummary.currency}
              </Typography>
              <Typography variant="subtitle1">
                Securities: {documentSummary.security_count}
              </Typography>
              <Typography variant="subtitle1">
                Risk Profile: {documentSummary.risk_profile}
              </Typography>
              <Typography variant="subtitle1">
                Diversification Score: {documentSummary.diversification_score.toFixed(2)}/100
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Asset Allocation:</Typography>
              <List dense>
                {Object.entries(documentSummary.asset_allocation).map(([asset, percentage]) => (
                  <ListItem key={asset}>
                    <ListItemText 
                      primary={`${asset}: ${percentage}%`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            {documentSummary.recommendations && documentSummary.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">Recommendations:</Typography>
                <List dense>
                  {documentSummary.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render securities table
  const renderSecuritiesTable = () => {
    if (!securities || securities.length === 0) return null;
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Securities" 
          subheader={`${securities.length} securities found`}
          avatar={<PieChart />}
        />
        <Divider />
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>ISIN</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Asset Class</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell>Risk</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {securities.map((security) => (
                  <TableRow key={security.identifier}>
                    <TableCell>{security.name}</TableCell>
                    <TableCell>{security.identifier}</TableCell>
                    <TableCell>{security.security_type}</TableCell>
                    <TableCell>{security.asset_class}</TableCell>
                    <TableCell align="right">{security.quantity}</TableCell>
                    <TableCell align="right">{security.value}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        label={security.risk_level}
                        color={
                          security.risk_level === 'High' ? 'error' :
                          security.risk_level === 'Medium' ? 'warning' : 'success'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };
  
  // Render query interface
  const renderQueryInterface = () => {
    if (!activeDocumentId || documentStatus[activeDocumentId] !== 'completed') return null;
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Ask Questions About Your Document" 
          subheader="Use natural language to query your financial document"
          avatar={<Search />}
        />
        <Divider />
        <CardContent>
          <form onSubmit={handleQuerySubmit}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Ask a question"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., What is the total portfolio value? What securities have high risk?"
                disabled={isQuerying}
                error={!!queryError}
                helperText={queryError}
              />
              <IconButton 
                type="submit" 
                color="primary" 
                disabled={isQuerying || !query.trim()}
                sx={{ ml: 1 }}
              >
                {isQuerying ? <CircularProgress size={24} /> : <Send />}
              </IconButton>
            </Box>
          </form>
          
          {queryResult && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2">Query: {queryResult.query}</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>{queryResult.answer}</Typography>
            </Paper>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Financial Document Analysis
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="file"
            accept=".pdf,.xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
          <Button
            variant="contained"
            startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFile />}
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
          >
            Upload Document
          </Button>
          <Typography variant="body2" color="error" sx={{ ml: 2 }}>
            {uploadError}
          </Typography>
        </Box>
        
        {renderDocumentStatus()}
      </Paper>
      
      {renderDocumentSummary()}
      {renderSecuritiesTable()}
      {renderQueryInterface()}
    </Box>
  );
};

export default FinDocRAGComponent;
