import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Box, Grid, Paper, Typography, FormControl, InputLabel, 
  Select, MenuItem, TextField, Button, Divider, CircularProgress,
  Card, CardContent, IconButton, Snackbar, Alert
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  SaveAlt as SaveIcon,
  Settings as SettingsIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Custom color schemes
const COLOR_SCHEMES = {
  default: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'],
  monochrome: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'],
  diverging: ['#1984c5', '#22a7f0', '#63bff0', '#a7d5ed', '#e2e2e2', '#e1a692', '#de6e56', '#e14b31', '#c23728'],
  sequential: ['#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#034e7b'],
  categorical: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab']
};

const DataVisualization = ({ data, dataType = 'portfolio', onSaveVisualization }) => {
  const [visualizationType, setVisualizationType] = useState('bar');
  const [colorScheme, setColorScheme] = useState('default');
  const [customTitle, setCustomTitle] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [showLegend, setShowLegend] = useState(true);
  const [selectedDataKeys, setSelectedDataKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState([]);
  const [availableDataKeys, setAvailableDataKeys] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState(null);
  
  // Initialize with the first set of data
  useEffect(() => {
    if (data && data.length > 0) {
      processData();
    } else {
      // Generate sample data for demonstration
      generateSampleData();
    }
  }, [data, dataType]);
  
  // Process incoming data
  const processData = () => {
    setLoading(true);
    
    try {
      let processedResult = [];
      let dataKeys = [];
      
      // Process different data types accordingly
      if (dataType === 'portfolio') {
        // For portfolio data, assume an array of securities
        processedResult = data.map(item => ({
          name: item.name || 'Unknown',
          value: item.value || 0,
          weight: (item.weight || 0) * 100,
          return: item.return || 0,
          risk: item.risk || 0
        }));
        
        dataKeys = ['value', 'weight', 'return', 'risk'];
      } else if (dataType === 'performance') {
        // For performance data, assume an array of time-series data
        processedResult = data;
        
        // Get all unique keys excluding 'name' or 'date'
        const sampleItem = data[0] || {};
        dataKeys = Object.keys(sampleItem).filter(key => key !== 'name' && key !== 'date');
      } else if (dataType === 'document') {
        // For document data, group by document type
        const docTypes = {};
        data.forEach(doc => {
          const type = doc.type || 'Other';
          docTypes[type] = (docTypes[type] || 0) + 1;
        });
        
        processedResult = Object.keys(docTypes).map(key => ({
          name: key,
          count: docTypes[key]
        }));
        
        dataKeys = ['count'];
      }
      
      setProcessedData(processedResult);
      setAvailableDataKeys(dataKeys);
      
      // Default to the first data key if none selected
      if (selectedDataKeys.length === 0 && dataKeys.length > 0) {
        setSelectedDataKeys([dataKeys[0]]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing data:', error);
      setError('Failed to process data');
      setLoading(false);
    }
  };
  
  // Generate sample data for demonstration
  const generateSampleData = () => {
    if (dataType === 'portfolio') {
      const samplePortfolio = [
        { name: 'US Large Cap', value: 45000, weight: 0.45, return: 12.3, risk: this },
        { name: 'US Mid Cap', value: 15000, weight: 0.15, return: 14.5, risk: 15.2 },
        { name: 'US Small Cap', value: 5000, weight: 0.05, return: 15.7, risk: 18.9 },
        { name: 'International', value: 20000, weight: 0.20, return: 8.9, risk: 14.3 },
        { name: 'Emerging Markets', value: 10000, weight: 0.10, return: 10.2, risk: 22.1 },
        { name: 'Bonds', value: 25000, weight: 0.25, return: 4.5, risk: 5.7 },
        { name: 'Cash', value: 5000, weight: 0.05, return: 1.2, risk: 0.5 }
      ];
      setProcessedData(samplePortfolio);
      setAvailableDataKeys(['value', 'weight', 'return', 'risk']);
      setSelectedDataKeys(['value']);
    } else if (dataType === 'performance') {
      const samplePerformance = [];
      const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      
      let portfolioValue = 100000;
      let benchmarkValue = 100000;
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000);
        // Add some random fluctuation
        portfolioValue = portfolioValue * (1 + (Math.random() * 0.04 - 0.01));
        benchmarkValue = benchmarkValue * (1 + (Math.random() * 0.03 - 0.01));
        
        samplePerformance.push({
          date: date.toISOString().split('T')[0],
          portfolio: Math.round(portfolioValue),
          benchmark: Math.round(benchmarkValue)
        });
      }
      
      setProcessedData(samplePerformance);
      setAvailableDataKeys(['portfolio', 'benchmark']);
      setSelectedDataKeys(['portfolio', 'benchmark']);
    } else if (dataType === 'document') {
      const sampleDocuments = [
        { name: 'Portfolio Statement', count: 12 },
        { name: 'Trade Confirmation', count: 25 },
        { name: 'Tax Document', count: 8 },
        { name: 'Research Report', count: 15 },
        { name: 'Account Statement', count: 18 },
        { name: 'Prospectus', count: 6 }
      ];
      
      setProcessedData(sampleDocuments);
      setAvailableDataKeys(['count']);
      setSelectedDataKeys(['count']);
    }
  };
  
  // Handle saving the visualization
  const handleSaveVisualization = () => {
    if (onSaveVisualization) {
      onSaveVisualization({
        type: visualizationType,
        data: processedData,
        title: customTitle || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Visualization`,
        dataKeys: selectedDataKeys,
        colorScheme,
        xAxisLabel,
        yAxisLabel,
        showLegend
      });
      
      setSnackbarMessage('Visualization saved successfully!');
      setSnackbarOpen(true);
    }
  };
  
  // Handle exporting the visualization as image
  const handleExportImage = () => {
    try {
      // Create a temporary canvas from the visualization component
      const svgElement = document.querySelector('.visualization-container svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create an image from SVG
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Create a download link
          const a = document.createElement('a');
          a.download = `${customTitle || 'visualization'}.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
          
          setSnackbarMessage('Visualization exported as image');
          setSnackbarOpen(true);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      } else {
        throw new Error('No visualization found to export');
      }
    } catch (error) {
      console.error('Error exporting image:', error);
      setSnackbarMessage('Failed to export image');
      setSnackbarOpen(true);
    }
  };
  
  // Custom tooltip for numerical values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  // Render the appropriate chart based on visualization type
  const renderVisualization = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }
    
    if (!processedData || processedData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <Typography>No data available for visualization</Typography>
        </Box>
      );
    }
    
    const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.default;
    
    // Determine the data key for X-axis
    const xKey = dataType === 'performance' ? 'date' : 'name';
    
    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {selectedDataKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} name={key} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {selectedDataKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]} 
                  name={key} 
                  dot={{ stroke: colors[index % colors.length], strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {selectedDataKeys.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  fill={colors[index % colors.length]}
                  stroke={colors[index % colors.length]}
                  fillOpacity={0.3}
                  name={key}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        // For pie charts, we can only use one data key
        const pieDataKey = selectedDataKeys[0] || availableDataKeys[0];
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey={pieDataKey}
                nameKey={xKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        // Scatter plots require two data keys (x and y)
        if (selectedDataKeys.length < 2) {
          return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
              <Typography>Scatter plots require selecting at least two data keys</Typography>
            </Box>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={selectedDataKeys[0]} 
                name={selectedDataKeys[0]}
                label={{ value: xAxisLabel || selectedDataKeys[0], position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey={selectedDataKeys[1]} 
                name={selectedDataKeys[1]}
                label={{ value: yAxisLabel || selectedDataKeys[1], angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              {showLegend && <Legend />}
              <Scatter 
                name={`${selectedDataKeys[0]} vs ${selectedDataKeys[1]}`} 
                data={processedData} 
                fill={colors[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processedData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={xKey} />
              <PolarRadiusAxis />
              {selectedDataKeys.map((key, index) => (
                <Radar 
                  key={key} 
                  name={key} 
                  dataKey={key} 
                  stroke={colors[index % colors.length]} 
                  fill={colors[index % colors.length]} 
                  fillOpacity={0.2} 
                />
              ))}
              <Tooltip />
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <Typography>Select a visualization type</Typography>
          </Box>
        );
    }
  };
  
  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {customTitle || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Visualization`}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Visualization Type</InputLabel>
                  <Select
                    value={visualizationType}
                    onChange={(e) => setVisualizationType(e.target.value)}
                    label="Visualization Type"
                  >
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="area">Area Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                    <MenuItem value="scatter">Scatter Plot</MenuItem>
                    <MenuItem value="radar">Radar Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Color Scheme</InputLabel>
                  <Select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    label="Color Scheme"
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="monochrome">Monochrome</MenuItem>
                    <MenuItem value="diverging">Diverging</MenuItem>
                    <MenuItem value="sequential">Sequential</MenuItem>
                    <MenuItem value="categorical">Categorical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Data Fields</InputLabel>
                  <Select
                    multiple
                    value={selectedDataKeys}
                    onChange={(e) => setSelectedDataKeys(e.target.value)}
                    label="Data Fields"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {availableDataKeys.map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    label="Custom Title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="X-Axis Label"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Y-Axis Label"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />}
                    onClick={processData}
                    sx={{ mr: 1 }}
                  >
                    Refresh
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<SaveIcon />}
                    onClick={handleSaveVisualization}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<ShareIcon />}
                    onClick={handleExportImage}
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box className="visualization-container">
              {renderVisualization()}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataVisualization;
