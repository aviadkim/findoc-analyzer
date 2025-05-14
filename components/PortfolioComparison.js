/**
 * Portfolio Comparison Component
 * 
 * This component displays a comparison between two portfolios, showing changes in holdings,
 * asset allocation, and performance metrics over time.
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Grid, Tabs, Tab, 
  Button, CircularProgress, Divider, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Tooltip, Alert 
} from '@mui/material';
import { 
  ArrowUpward, ArrowDownward, Add, Remove, 
  CompareArrows, InfoOutlined, GetApp 
} from '@mui/icons-material';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  Legend, Cell, ResponsiveContainer, CartesianGrid 
} from 'recharts';

function PortfolioComparison({ document1Id, document2Id, comparison, onRunComparison, loading }) {
  const [activeTab, setActiveTab] = useState(0);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    // If comparison data is provided, use it
    if (comparison) {
      setComparisonData(comparison);
    }
  }, [comparison]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRunComparison = async () => {
    if (onRunComparison) {
      try {
        await onRunComparison({
          document1Id,
          document2Id,
          options: {
            includeMarketData: true,
            thresholdPercentage: 5.0
          }
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Error running comparison');
      }
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Export portfolio comparison data
  const exportComparisonData = async (format) => {
    if (!comparisonData) {
      return;
    }
    
    try {
      // Create a payload with the document IDs and comparison data
      const payload = {
        documentIds: [document1Id, document2Id],
        format,
        options: {
          includeMetadata: true,
          includeMarketData: true
        }
      };
      
      // Call the export API
      const response = await fetch('/api/securities-export/comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Download the exported file
        window.location.href = data.export.downloadUrl;
      } else {
        throw new Error(data.message || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting comparison data:', error);
      setError(`Export failed: ${error.message}`);
    }
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Prepare data for asset allocation chart
  const prepareAssetAllocationData = () => {
    if (!comparisonData?.portfolioMetrics?.assetAllocation) return [];
    
    const oldAllocation = comparisonData.portfolioMetrics.assetAllocation.old;
    const newAllocation = comparisonData.portfolioMetrics.assetAllocation.new;
    
    const allAssetTypes = new Set([
      ...Object.keys(oldAllocation),
      ...Object.keys(newAllocation)
    ]);
    
    return Array.from(allAssetTypes).map(assetType => ({
      name: assetType,
      Old: (oldAllocation[assetType] || 0) * 100,
      New: (newAllocation[assetType] || 0) * 100,
      Change: ((newAllocation[assetType] || 0) - (oldAllocation[assetType] || 0)) * 100
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading comparison...</Typography>
      </Box>
    );
  }

  // No comparison data yet
  if (!comparisonData) {
    return (
      <Box p={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Portfolio Comparison</Typography>
          <Typography paragraph>
            Compare two portfolios to see how your investments have changed over time.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            onClick={handleRunComparison}
            startIcon={<CompareArrows />}
            disabled={!document1Id || !document2Id}
          >
            Run Comparison
          </Button>
          
          {(!document1Id || !document2Id) && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Please select two documents to compare.
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Portfolio Comparison</Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<GetApp />}
              onClick={() => exportComparisonData('csv')}
              sx={{ mr: 1 }}
            >
              Export CSV
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<GetApp />}
              onClick={() => exportComparisonData('excel')}
            >
              Export Excel
            </Button>
          </Box>
        </Box>
        
        {/* Summary Box */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                {comparisonData.document1.name} ({new Date(comparisonData.document1.date).toLocaleDateString()})
                &nbsp;vs.&nbsp;
                {comparisonData.document2.name} ({new Date(comparisonData.document2.date).toLocaleDateString()})
              </Typography>
              
              <Box mt={2}>
                <Typography variant="h6">Portfolio Value</Typography>
                <Box display="flex" alignItems="center">
                  <Typography>
                    {formatCurrency(comparisonData.portfolioMetrics.portfolioValue.old)} →&nbsp;
                    {formatCurrency(comparisonData.portfolioMetrics.portfolioValue.new)}
                  </Typography>
                  <Chip 
                    icon={comparisonData.portfolioMetrics.portfolioValue.change >= 0 ? <ArrowUpward /> : <ArrowDownward />}
                    label={formatPercentage(comparisonData.portfolioMetrics.portfolioValue.percentageChange)}
                    color={comparisonData.portfolioMetrics.portfolioValue.change >= 0 ? "success" : "error"}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Summary</Typography>
              <Box mt={1}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Added Securities</Typography>
                    <Typography>{comparisonData.securitiesComparison.totalAdded}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Removed Securities</Typography>
                    <Typography>{comparisonData.securitiesComparison.totalRemoved}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Significant Changes</Typography>
                    <Typography>{comparisonData.securitiesComparison.totalSignificantChanges}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Portfolio Turnover</Typography>
                    <Typography>{formatPercentage(comparisonData.portfolioMetrics.turnover.turnoverRatio)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Overview" />
            <Tab label="Asset Allocation" />
            <Tab label="Securities Changes" />
            <Tab label="Added & Removed" />
          </Tabs>
        </Paper>
        
        {/* Tab Content */}
        <Paper sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Portfolio Overview</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Portfolio Value Change</Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h5">
                      {formatCurrency(comparisonData.portfolioMetrics.portfolioValue.change)}
                    </Typography>
                    <Chip 
                      icon={comparisonData.portfolioMetrics.portfolioValue.change >= 0 ? <ArrowUpward /> : <ArrowDownward />}
                      label={formatPercentage(comparisonData.portfolioMetrics.portfolioValue.percentageChange)}
                      color={comparisonData.portfolioMetrics.portfolioValue.change >= 0 ? "success" : "error"}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Diversification</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Securities Count</Typography>
                      <Box display="flex" alignItems="center">
                        <Typography>{comparisonData.portfolioMetrics.diversification.old.securitiesCount} → {comparisonData.portfolioMetrics.diversification.new.securitiesCount}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({comparisonData.portfolioMetrics.diversification.change.securitiesCount >= 0 ? '+' : ''}
                          {comparisonData.portfolioMetrics.diversification.change.securitiesCount})
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Top 5 Concentration</Typography>
                      <Box display="flex" alignItems="center">
                        <Typography>
                          {(comparisonData.portfolioMetrics.diversification.old.topHoldingsConcentration * 100).toFixed(1)}% → 
                          {(comparisonData.portfolioMetrics.diversification.new.topHoldingsConcentration * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({(comparisonData.portfolioMetrics.diversification.change.topHoldingsConcentration * 100) >= 0 ? '+' : ''}
                          {(comparisonData.portfolioMetrics.diversification.change.topHoldingsConcentration * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Portfolio Turnover</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Added Securities Value</Typography>
                      <Typography>{formatCurrency(comparisonData.portfolioMetrics.turnover.additionsValue)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Removed Securities Value</Typography>
                      <Typography>{formatCurrency(comparisonData.portfolioMetrics.turnover.removalsValue)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Turnover Ratio</Typography>
                      <Typography>{formatPercentage(comparisonData.portfolioMetrics.turnover.turnoverRatio)}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Top 5 Holdings - New Portfolio</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Security</TableCell>
                          <TableCell align="right">Value</TableCell>
                          <TableCell align="right">% of Portfolio</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comparisonData.portfolioMetrics.diversification.new.topHoldings.map((holding, index) => (
                          <TableRow key={index}>
                            <TableCell>{holding.name}</TableCell>
                            <TableCell align="right">{formatCurrency(holding.value)}</TableCell>
                            <TableCell align="right">{(holding.percentage * 100).toFixed(2)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>Significant Changes</Typography>
                    {comparisonData.securitiesComparison.significantChanges.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Security</TableCell>
                              <TableCell align="right">Change</TableCell>
                              <TableCell align="right">% Change</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {comparisonData.securitiesComparison.significantChanges.slice(0, 5).map((security, index) => (
                              <TableRow key={index}>
                                <TableCell>{security.name}</TableCell>
                                <TableCell align="right">{formatCurrency(security.value.change)}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={formatPercentage(security.percentageChange)}
                                    color={security.percentageChange >= 0 ? "success" : "error"}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No significant changes found.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Asset Allocation Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Asset Allocation Changes</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Typography variant="subtitle1" gutterBottom>Asset Allocation Comparison</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareAssetAllocationData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="Old" name="Old Allocation %" fill="#8884d8" />
                        <Bar dataKey="New" name="New Allocation %" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Typography variant="subtitle1" gutterBottom>Asset Allocation Changes</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset Type</TableCell>
                          <TableCell align="right">Old %</TableCell>
                          <TableCell align="right">New %</TableCell>
                          <TableCell align="right">Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comparisonData.portfolioMetrics.assetAllocation.comparison.map((allocation, index) => (
                          <TableRow key={index}>
                            <TableCell>{allocation.assetType}</TableCell>
                            <TableCell align="right">{(allocation.old * 100).toFixed(2)}%</TableCell>
                            <TableCell align="right">{(allocation.new * 100).toFixed(2)}%</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`${allocation.change >= 0 ? '+' : ''}${(allocation.change * 100).toFixed(2)}%`}
                                color={allocation.change > 0 ? "success" : allocation.change < 0 ? "error" : "default"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box mt={4}>
                    <Typography variant="subtitle1" gutterBottom>What Changed?</Typography>
                    <Typography paragraph>
                      This section shows how your asset allocation has shifted between the two time periods. 
                      Significant shifts could indicate a change in investment strategy or market performance 
                      differences between asset classes.
                    </Typography>
                    
                    {comparisonData.portfolioMetrics.assetAllocation.comparison
                      .filter(a => Math.abs(a.change) >= 0.03) // 3% change threshold
                      .map((allocation, index) => (
                        <Typography key={index} paragraph>
                          <strong>{allocation.assetType}:</strong> {allocation.changeType === 'increased' ? 'Increased' : 'Decreased'} by {(Math.abs(allocation.change) * 100).toFixed(2)}% 
                          (from {(allocation.old * 100).toFixed(2)}% to {(allocation.new * 100).toFixed(2)}%)
                        </Typography>
                      ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Securities Changes Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Securities Changes</Typography>
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Significant Changes ({comparisonData.securitiesComparison.significantChanges.length})
                </Typography>
                
                {comparisonData.securitiesComparison.significantChanges.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Security</TableCell>
                          <TableCell align="right">Old Value</TableCell>
                          <TableCell align="right">New Value</TableCell>
                          <TableCell align="right">Change</TableCell>
                          <TableCell align="right">% Change</TableCell>
                          <TableCell align="right">Quantity Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comparisonData.securitiesComparison.significantChanges.map((security, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Tooltip title={security.isin}>
                                <Box display="flex" alignItems="center">
                                  {security.name}
                                  <InfoOutlined fontSize="small" sx={{ ml: 0.5, opacity: 0.5 }} />
                                </Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(security.value.old)}</TableCell>
                            <TableCell align="right">{formatCurrency(security.value.new)}</TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                {security.value.change >= 0 ? <ArrowUpward color="success" fontSize="small" /> : <ArrowDownward color="error" fontSize="small" />}
                                {formatCurrency(Math.abs(security.value.change))}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={formatPercentage(security.percentageChange)}
                                color={security.percentageChange >= 0 ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {security.quantity.change !== 0 ? (
                                <Box display="flex" alignItems="center" justifyContent="flex-end">
                                  {security.quantity.change > 0 ? <Add fontSize="small" /> : <Remove fontSize="small" />}
                                  {formatNumber(Math.abs(security.quantity.change))}
                                </Box>
                              ) : (
                                "No change"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">No significant changes found between the portfolios.</Alert>
                )}
              </Box>
              
              <Box mt={4}>
                <Typography variant="subtitle1" gutterBottom>
                  All Securities ({comparisonData.securitiesComparison.common.length})
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Security</TableCell>
                        <TableCell align="right">Old Value</TableCell>
                        <TableCell align="right">New Value</TableCell>
                        <TableCell align="right">% Change</TableCell>
                        <TableCell align="right">Old %</TableCell>
                        <TableCell align="right">New %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonData.securitiesComparison.common.map((security, index) => (
                        <TableRow key={index}>
                          <TableCell>{security.name}</TableCell>
                          <TableCell align="right">{formatCurrency(security.value.old)}</TableCell>
                          <TableCell align="right">{formatCurrency(security.value.new)}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={formatPercentage(security.percentageChange)}
                              color={security.percentageChange >= 0 ? "success" : security.percentageChange < 0 ? "error" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{(security.allocation.old * 100).toFixed(2)}%</TableCell>
                          <TableCell align="right">{(security.allocation.new * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
          
          {/* Added & Removed Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Added & Removed Securities</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Added Securities ({comparisonData.securitiesComparison.added.length})
                  </Typography>
                  
                  {comparisonData.securitiesComparison.added.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Security</TableCell>
                            <TableCell align="right">Value</TableCell>
                            <TableCell align="right">% of Portfolio</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparisonData.securitiesComparison.added.map((security, index) => (
                            <TableRow key={index}>
                              <TableCell>{security.name}</TableCell>
                              <TableCell align="right">{formatCurrency(security.value)}</TableCell>
                              <TableCell align="right">{(security.percentage * 100).toFixed(2)}%</TableCell>
                              <TableCell align="right">{formatNumber(security.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No securities were added to the portfolio.</Alert>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Removed Securities ({comparisonData.securitiesComparison.removed.length})
                  </Typography>
                  
                  {comparisonData.securitiesComparison.removed.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Security</TableCell>
                            <TableCell align="right">Value</TableCell>
                            <TableCell align="right">% of Portfolio</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparisonData.securitiesComparison.removed.map((security, index) => (
                            <TableRow key={index}>
                              <TableCell>{security.name}</TableCell>
                              <TableCell align="right">{formatCurrency(security.value)}</TableCell>
                              <TableCell align="right">{(security.percentage * 100).toFixed(2)}%</TableCell>
                              <TableCell align="right">{formatNumber(security.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No securities were removed from the portfolio.</Alert>
                  )}
                </Grid>
              </Grid>
              
              {(comparisonData.securitiesComparison.added.length > 0 || 
                comparisonData.securitiesComparison.removed.length > 0) && (
                <Box mt={4}>
                  <Typography variant="subtitle1" gutterBottom>Portfolio Turnover Analysis</Typography>
                  <Typography paragraph>
                    {comparisonData.securitiesComparison.added.length > 0 && comparisonData.securitiesComparison.removed.length > 0 ? (
                      `The portfolio had significant turnover with ${comparisonData.securitiesComparison.added.length} new securities added and 
                       ${comparisonData.securitiesComparison.removed.length} securities removed. This represents a turnover ratio of 
                       ${formatPercentage(comparisonData.portfolioMetrics.turnover.turnoverRatio)}.`
                    ) : comparisonData.securitiesComparison.added.length > 0 ? (
                      `The portfolio added ${comparisonData.securitiesComparison.added.length} new securities without removing any. 
                       This indicates portfolio expansion or diversification.`
                    ) : (
                      `The portfolio removed ${comparisonData.securitiesComparison.removed.length} securities without adding any new ones. 
                       This indicates portfolio consolidation or reduction.`
                    )}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default PortfolioComparison;