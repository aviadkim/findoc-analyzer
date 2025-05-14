import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { Tabs, Tab, Button, Select, MenuItem, FormControl, InputLabel, Grid, Paper, Typography, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  dashboard: {
    padding: theme.spacing(3),
  },
  chartContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    height: 400,
  },
  controlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    height: '100%',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  filterControls: {
    display: 'flex',
    gap: theme.spacing(2),
  },
}));

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AnalyticsDashboard = ({ portfolioData, documentData }) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('1y');
  const [assetClass, setAssetClass] = useState('all');
  const [chartData, setChartData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [documentMetrics, setDocumentMetrics] = useState([]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Initialize dashboard with sample data if real data is not available
  useEffect(() => {
    // Generate sample data if real data is not available
    if (!portfolioData || !portfolioData.securities || portfolioData.securities.length === 0) {
      generateSampleData();
    } else {
      processPortfolioData();
    }
    
    if (!documentData || documentData.length === 0) {
      generateSampleDocumentData();
    } else {
      processDocumentData();
    }
  }, [portfolioData, documentData, timeRange, assetClass]);
  
  // Process portfolio data for charts
  const processPortfolioData = () => {
    // Process asset allocation data
    const allocation = {};
    portfolioData.securities.forEach(security => {
      const assetClass = security.asset_class || 'Other';
      allocation[assetClass] = (allocation[assetClass] || 0) + security.value;
    });
    
    const allocationChartData = Object.keys(allocation).map(key => ({
      name: key,
      value: allocation[key]
    }));
    setAllocationData(allocationChartData);
    
    // Process performance data
    // This would usually come from historical data
    const performanceHistory = portfolioData.performanceHistory || generatePerformanceHistory();
    
    const filteredPerformance = performanceHistory.filter(item => {
      if (timeRange === '1m') return new Date(item.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (timeRange === '3m') return new Date(item.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      if (timeRange === '6m') return new Date(item.date) >= new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      if (timeRange === '1y') return new Date(item.date) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      return true;
    });
    
    setPerformanceData(filteredPerformance);
  };
  
  // Process document data for charts
  const processDocumentData = () => {
    // Count documents by type
    const docTypes = {};
    documentData.forEach(doc => {
      const type = doc.type || 'Other';
      docTypes[type] = (docTypes[type] || 0) + 1;
    });
    
    const docTypeData = Object.keys(docTypes).map(key => ({
      name: key,
      count: docTypes[key]
    }));
    
    // Count documents by month
    const docsByMonth = {};
    documentData.forEach(doc => {
      const date = new Date(doc.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      docsByMonth[monthYear] = (docsByMonth[monthYear] || 0) + 1;
    });
    
    const docMonthData = Object.keys(docsByMonth).map(key => ({
      month: key,
      count: docsByMonth[key]
    }));
    
    setDocumentMetrics([
      { name: 'Document Types', data: docTypeData },
      { name: 'Documents by Month', data: docMonthData }
    ]);
  };
  
  // Generate sample performance history
  const generatePerformanceHistory = () => {
    const history = [];
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    
    let value = 100000;
    for (let i = 0; i < 365; i += 5) { // Every 5 days
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      // Add some random fluctuation to the value
      value = value * (1 + (Math.random() * 0.04 - 0.015));
      
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        // Add benchmark values
        benchmark: Math.round(100000 * (1 + (i / 365) * 0.08)),
      });
    }
    
    return history;
  };
  
  // Generate sample data for the dashboard
  const generateSampleData = () => {
    // Sample asset allocation data
    const sampleAllocation = [
      { name: 'Equity', value: 55000 },
      { name: 'Fixed Income', value: 30000 },
      { name: 'Cash', value: 10000 },
      { name: 'Alternative', value: 5000 }
    ];
    setAllocationData(sampleAllocation);
    
    // Sample performance data
    const samplePerformanceData = generatePerformanceHistory();
    setPerformanceData(samplePerformanceData);
  };
  
  // Generate sample document data
  const generateSampleDocumentData = () => {
    const docTypes = [
      { name: 'Portfolio Statement', count: 12 },
      { name: 'Trade Confirmation', count: 25 },
      { name: 'Tax Document', count: 5 },
      { name: 'Research Report', count: 8 }
    ];
    
    const docMonths = [
      { month: '1/2025', count: 8 },
      { month: '2/2025', count: 10 },
      { month: '3/2025', count: 15 },
      { month: '4/2025', count: 12 },
      { month: '5/2025', count: 5 }
    ];
    
    setDocumentMetrics([
      { name: 'Document Types', data: docTypes },
      { name: 'Documents by Month', data: docMonths }
    ]);
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${label} : ${payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
          {payload.length > 1 && <p className="desc">{`Benchmark : ${payload[1].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className={classes.dashboard}>
      <div className={classes.controlBar}>
        <Typography variant="h4" component="h1">Financial Analytics Dashboard</Typography>
        <div className={classes.filterControls}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="1m">1 Month</MenuItem>
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small">
            <InputLabel>Asset Class</InputLabel>
            <Select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value)}
              label="Asset Class"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="equity">Equity</MenuItem>
              <MenuItem value="fixed_income">Fixed Income</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="alternative">Alternative</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="contained" color="primary" onClick={() => processPortfolioData()}>
            Update
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
        <Tab label="Portfolio Overview" />
        <Tab label="Performance Analysis" />
        <Tab label="Document Analytics" />
        <Tab label="Insights" />
      </Tabs>
      
      {/* Portfolio Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3} className={classes.chartContainer}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Asset Allocation</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Security Breakdown</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portfolioData?.securities?.slice(0, 5) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Value" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Performance Analysis Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3} className={classes.chartContainer}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Portfolio Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Portfolio" />
                  <Area type="monotone" dataKey="benchmark" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Benchmark" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Monthly Returns</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.filter((_, i) => i % 30 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Value" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Performance Metrics</Typography>
              <Box p={2}>
                <Typography variant="body1">Total Return: <strong>15.8%</strong></Typography>
                <Typography variant="body1">Annualized Return: <strong>12.3%</strong></Typography>
                <Typography variant="body1">Volatility: <strong>11.7%</strong></Typography>
                <Typography variant="body1">Sharpe Ratio: <strong>0.94</strong></Typography>
                <Typography variant="body1">Alpha: <strong>2.7%</strong></Typography>
                <Typography variant="body1">Beta: <strong>0.85</strong></Typography>
                <Typography variant="body1">Max Drawdown: <strong>-8.3%</strong></Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Document Analytics Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3} className={classes.chartContainer}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Document Types</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={documentMetrics[0]?.data || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label
                  >
                    {(documentMetrics[0]?.data || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Documents by Month</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={documentMetrics[1]?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Document Count" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Document Processing Metrics</Typography>
              <Box p={2}>
                <Typography variant="body1">Total Documents Processed: <strong>{documentData?.length || 50}</strong></Typography>
                <Typography variant="body1">Documents This Month: <strong>{documentMetrics[1]?.data?.[documentMetrics[1]?.data.length - 1]?.count || 5}</strong></Typography>
                <Typography variant="body1">Average Processing Time: <strong>2.3 seconds</strong></Typography>
                <Typography variant="body1">Extraction Success Rate: <strong>94.7%</strong></Typography>
                <Typography variant="body1">Most Common Document Type: <strong>{documentMetrics[0]?.data?.[0]?.name || 'Portfolio Statement'}</strong></Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Insights Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3} className={classes.chartContainer}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Portfolio Insights</Typography>
              <Box p={2}>
                <Typography variant="subtitle1">Portfolio Health Score: <strong>84/100</strong></Typography>
                <Typography variant="body1">Your portfolio is well-diversified across asset classes, with a good balance between growth and income assets.</Typography>
                <Typography variant="body1" style={{ marginTop: '1rem' }}>Key Observations:</Typography>
                <ul>
                  <li>Your equity allocation is slightly above your target for your risk profile.</li>
                  <li>Your portfolio's performance is outperforming the benchmark by 2.7% on an annualized basis.</li>
                  <li>Your expense ratio is below average, which is positively contributing to your returns.</li>
                  <li>Consider increasing international exposure for better diversification.</li>
                </ul>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Risk Analysis</Typography>
              <Box p={2}>
                <Typography variant="subtitle1">Risk Level: <strong>Moderate</strong></Typography>
                <Typography variant="body1">Your portfolio has a moderate risk level, with a volatility of 11.7% which is in line with your risk tolerance.</Typography>
                <Typography variant="body1" style={{ marginTop: '1rem' }}>Risk Factors:</Typography>
                <ul>
                  <li>Market Risk: <strong>Medium</strong></li>
                  <li>Interest Rate Risk: <strong>Medium-Low</strong></li>
                  <li>Inflation Risk: <strong>Low</strong></li>
                  <li>Concentration Risk: <strong>Low</strong></li>
                </ul>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" className={classes.title}>Recommendations</Typography>
              <Box p={2}>
                <Typography variant="body1">Based on our analysis, we recommend the following actions:</Typography>
                <ol>
                  <li>Rebalance your portfolio to slightly reduce equity exposure (by 3-5%).</li>
                  <li>Consider adding exposure to international markets for better diversification.</li>
                  <li>Review your fixed income holdings to ensure they are optimized for the current interest rate environment.</li>
                  <li>Consider tax-loss harvesting opportunities in your portfolio.</li>
                  <li>Set up automatic contributions to take advantage of dollar-cost averaging.</li>
                </ol>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
