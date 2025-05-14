import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  IconButton,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Text,
  Grid,
  GridItem,
  HStack,
  VStack,
  Tooltip,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useColorMode,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Input,
  InputGroup,
  InputRightElement,
  useToast
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  SettingsIcon,
  SearchIcon,
  AddIcon,
  CalendarIcon,
  TimeIcon,
  InfoIcon,
  RepeatIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@chakra-ui/icons';
import ResponsiveWrapper from './ResponsiveWrapper';

/**
 * TimeSeriesAnalyzer Component
 * 
 * This component provides advanced time series analysis and visualization for financial data,
 * with features like moving averages, pattern detection, anomaly highlighting, and forecasting.
 * 
 * Key features:
 * - Multiple visualization types (line, bar, candlestick, area)
 * - Technical indicators (moving averages, Bollinger bands, etc.)
 * - Pattern detection and anomaly highlighting
 * - Forecasting models with confidence intervals
 * - Seasonality analysis and decomposition
 * - Correlation analysis between different time series
 * - Interactive date range selection with zoom/pan
 * - Annotations and event markers
 * - Data transformations (log scale, first differences, etc.)
 * - Date-based filtering and aggregation (daily, weekly, monthly, etc.)
 * - Statistical summary and distribution analysis
 * 
 * @param {Object} props
 * @param {Array} props.timeSeries - Array of time series data objects
 * @param {Object} props.config - Configuration options
 * @param {Function} props.onExport - Callback for export functionality
 * @param {String} props.height - Component height
 * @param {String} props.width - Component width
 */
const TimeSeriesAnalyzer = ({
  timeSeries = [],
  config = {},
  onExport,
  height = '700px',
  width = '100%',
  ...props
}) => {
  // Destructure configuration with defaults
  const {
    defaultChartType = 'line',
    enableTechnicalIndicators = true,
    enableForecasting = true,
    enableSeasonalDecomposition = true,
    enableAnomalyDetection = true,
    defaultDateRange = 'all', // 'all', '1y', '6m', '3m', '1m', '1w', 'custom'
    defaultInterval = 'daily', // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    showConfidenceIntervals = true,
    forecastHorizon = 30, // days
    allowDataTransformations = true,
    enableAnnotations = true,
    showStatisticalSummary = true,
  } = config;
  
  // State management
  const [chartType, setChartType] = useState(defaultChartType);
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [interval, setInterval] = useState(defaultInterval);
  const [activeSeries, setActiveSeries] = useState(timeSeries.map(ts => ts.id));
  const [technicalIndicators, setTechnicalIndicators] = useState([]);
  const [showForecast, setShowForecast] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [maWindow, setMaWindow] = useState(20);
  const [showBollingerBands, setShowBollingerBands] = useState(false);
  const [bollingerStdDev, setBollingerStdDev] = useState(2);
  const [showTrend, setShowTrend] = useState(false);
  const [showSeasonality, setShowSeasonality] = useState(false);
  const [transformationType, setTransformationType] = useState('none'); // 'none', 'log', 'diff', 'pct_change', 'z_score'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleTimeFrame, setVisibleTimeFrame] = useState({ start: 0, end: 100 }); // percentage of total range
  
  // Refs and other hooks
  const chartRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure(); // For settings drawer
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const increaseColor = useColorModeValue('green.500', 'green.300');
  const decreaseColor = useColorModeValue('red.500', 'red.300');
  const neutralColor = useColorModeValue('blue.500', 'blue.300');
  const sliderColor = useColorModeValue('blue.500', 'blue.300');
  
  // Process time series data on initial load and when parameters change
  useEffect(() => {
    if (!timeSeries || timeSeries.length === 0) {
      setError("No time series data provided");
      setLoading(false);
      return;
    }
    
    const processTimeSeriesData = async () => {
      setLoading(true);
      
      try {
        // Generate processed data
        const processed = await simulateDataProcessing();
        setProcessedData(processed);
        setLoading(false);
      } catch (err) {
        console.error("Error processing time series data:", err);
        setError("Failed to process time series data");
        setLoading(false);
      }
    };
    
    processTimeSeriesData();
  }, [
    timeSeries, 
    dateRange, 
    interval, 
    activeSeries, 
    transformationType, 
    customStartDate, 
    customEndDate
  ]);
  
  // Update technical indicators when settings change
  useEffect(() => {
    if (!processedData) return;
    
    // This would normally make an API call or process data locally
    // For this demo, we're just updating state to show what indicators are active
    const indicators = [];
    
    if (showMovingAverage) {
      indicators.push({
        type: 'moving_average',
        window: maWindow,
        name: `Moving Average (${maWindow})`
      });
    }
    
    if (showBollingerBands) {
      indicators.push({
        type: 'bollinger_bands',
        window: maWindow,
        stdDev: bollingerStdDev,
        name: `Bollinger Bands (${maWindow}, ${bollingerStdDev}σ)`
      });
    }
    
    if (showTrend) {
      indicators.push({
        type: 'trend',
        name: 'Trend Line'
      });
    }
    
    if (showSeasonality) {
      indicators.push({
        type: 'seasonality',
        name: 'Seasonality'
      });
    }
    
    setTechnicalIndicators(indicators);
  }, [
    processedData,
    showMovingAverage, 
    maWindow, 
    showBollingerBands, 
    bollingerStdDev,
    showTrend,
    showSeasonality
  ]);
  
  // Update forecast data when forecast settings change
  useEffect(() => {
    if (!processedData || !showForecast) return;
    
    // In a real implementation, this would update the forecast data
    // based on the selected parameters
    console.log("Forecast parameters updated");
  }, [processedData, showForecast, forecastHorizon, showConfidenceIntervals]);
  
  // Simulate data processing (in a real implementation, this would be a real data processing function)
  const simulateDataProcessing = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock time series data with 100 data points
        const dates = [];
        const now = new Date();
        
        // Generate dates based on interval
        for (let i = 99; i >= 0; i--) {
          const date = new Date(now);
          switch (interval) {
            case 'daily':
              date.setDate(now.getDate() - i);
              break;
            case 'weekly':
              date.setDate(now.getDate() - (i * 7));
              break;
            case 'monthly':
              date.setMonth(now.getMonth() - i);
              break;
            case 'quarterly':
              date.setMonth(now.getMonth() - (i * 3));
              break;
            case 'yearly':
              date.setFullYear(now.getFullYear() - i);
              break;
            default:
              date.setDate(now.getDate() - i);
          }
          dates.push(date.toISOString().split('T')[0]);
        }
        
        // Filter dates based on dateRange
        let filteredDates = [...dates];
        if (dateRange !== 'all') {
          const cutoffDate = new Date();
          switch (dateRange) {
            case '1y':
              cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
              break;
            case '6m':
              cutoffDate.setMonth(cutoffDate.getMonth() - 6);
              break;
            case '3m':
              cutoffDate.setMonth(cutoffDate.getMonth() - 3);
              break;
            case '1m':
              cutoffDate.setMonth(cutoffDate.getMonth() - 1);
              break;
            case '1w':
              cutoffDate.setDate(cutoffDate.getDate() - 7);
              break;
            case 'custom':
              // Use custom dates if provided, otherwise fallback to all dates
              if (customStartDate && customEndDate) {
                filteredDates = dates.filter(date => 
                  date >= customStartDate && date <= customEndDate
                );
              }
              break;
          }
          
          if (dateRange !== 'custom' || !customStartDate || !customEndDate) {
            const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
            filteredDates = dates.filter(date => date >= cutoffDateStr);
          }
        }
        
        // Generate series data
        const processedSeries = activeSeries.map(seriesId => {
          const series = timeSeries.find(ts => ts.id === seriesId) || {};
          
          // Generate random data that resembles financial time series
          let lastValue = Math.random() * 1000 + 500; // Start between 500-1500
          const volatility = 0.02; // 2% daily volatility
          const trend = 0.0002; // Slight upward trend
          
          // Seasonal component (higher values in middle of sequence)
          const seasonalPeak = Math.floor(filteredDates.length / 2);
          const seasonalStrength = 0.2; // 20% seasonal component
          
          const values = filteredDates.map((date, i) => {
            // Add random walk with mean reversion
            const randomComponent = (Math.random() - 0.5) * 2 * volatility * lastValue;
            // Add trend component
            const trendComponent = trend * lastValue;
            // Add seasonal component
            const seasonalComponent = seasonalStrength * lastValue * 
              Math.sin((i - seasonalPeak) * (Math.PI / (filteredDates.length / 2)));
            
            // Calculate new value
            const newValue = lastValue + randomComponent + trendComponent + seasonalComponent;
            lastValue = newValue;
            
            // Add an anomaly spike in the middle for testing
            if (i === Math.floor(filteredDates.length * 0.75)) {
              return newValue * (1 + Math.random() * 0.3);
            }
            
            return newValue;
          });
          
          // Generate high, low, open, close for candlestick charts
          const ohlc = values.map(value => {
            const range = value * 0.03; // 3% range for the day
            const high = value + (Math.random() * range);
            const low = value - (Math.random() * range);
            const open = low + (Math.random() * (high - low));
            const close = low + (Math.random() * (high - low));
            
            return { open, high, low, close };
          });
          
          // Apply data transformations
          let transformedValues = [...values];
          if (transformationType !== 'none') {
            switch (transformationType) {
              case 'log':
                transformedValues = values.map(value => Math.log(value));
                break;
              case 'diff':
                transformedValues = values.map((value, i) => 
                  i > 0 ? value - values[i-1] : 0
                );
                break;
              case 'pct_change':
                transformedValues = values.map((value, i) => 
                  i > 0 ? ((value - values[i-1]) / values[i-1]) * 100 : 0
                );
                break;
              case 'z_score':
                const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                const stdDev = Math.sqrt(
                  values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
                );
                transformedValues = values.map(value => (value - mean) / stdDev);
                break;
            }
          }
          
          // Calculate returns
          const returns = values.map((value, i) => 
            i > 0 ? ((value - values[i-1]) / values[i-1]) * 100 : 0
          );
          
          // Mark some points as anomalies for testing
          const anomalies = returns.map((returnVal, i) => {
            if (i === 0) return false;
            return Math.abs(returnVal) > 5; // Flag returns over 5% as anomalies
          });
          
          // Calculate moving average
          const movingAverage = values.map((_, i) => {
            if (i < maWindow - 1) return null;
            
            const window = values.slice(i - maWindow + 1, i + 1);
            const sum = window.reduce((acc, val) => acc + val, 0);
            return sum / maWindow;
          });
          
          // Calculate Bollinger Bands
          const upperBand = movingAverage.map((ma, i) => {
            if (ma === null) return null;
            
            const window = values.slice(i - maWindow + 1, i + 1);
            const sum = window.reduce((acc, val) => acc + val, 0);
            const mean = sum / maWindow;
            
            const sumSquaredDiff = window.reduce((acc, val) => 
              acc + Math.pow(val - mean, 2), 0
            );
            const stdDev = Math.sqrt(sumSquaredDiff / maWindow);
            
            return ma + (bollingerStdDev * stdDev);
          });
          
          const lowerBand = movingAverage.map((ma, i) => {
            if (ma === null) return null;
            
            const window = values.slice(i - maWindow + 1, i + 1);
            const sum = window.reduce((acc, val) => acc + val, 0);
            const mean = sum / maWindow;
            
            const sumSquaredDiff = window.reduce((acc, val) => 
              acc + Math.pow(val - mean, 2), 0
            );
            const stdDev = Math.sqrt(sumSquaredDiff / maWindow);
            
            return ma - (bollingerStdDev * stdDev);
          });
          
          // Calculate forecast values (simple extrapolation)
          const lastVal = values[values.length - 1];
          const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
          
          const forecastValues = Array(forecastHorizon).fill(0).map((_, i) => {
            return lastVal * Math.pow(1 + (avgReturn / 100), i + 1);
          });
          
          // Calculate confidence intervals (widening with time)
          const forecastStdDev = Math.sqrt(
            returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
          );
          
          const forecastLower = forecastValues.map((val, i) => {
            const intervalWidth = forecastStdDev * Math.sqrt(i + 1) * bollingerStdDev;
            return val * (1 - (intervalWidth / 100));
          });
          
          const forecastUpper = forecastValues.map((val, i) => {
            const intervalWidth = forecastStdDev * Math.sqrt(i + 1) * bollingerStdDev;
            return val * (1 + (intervalWidth / 100));
          });
          
          // Calculate simple statistics
          const stats = {
            min: Math.min(...values),
            max: Math.max(...values),
            mean: values.reduce((sum, val) => sum + val, 0) / values.length,
            startValue: values[0],
            endValue: values[values.length - 1],
            change: values[values.length - 1] - values[0],
            percentChange: ((values[values.length - 1] - values[0]) / values[0]) * 100,
            volatility: Math.sqrt(
              returns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / returns.length
            )
          };
          
          // Decomposition (trend + seasonality + residual)
          // Simple decomposition for demonstration - in real implementation use proper methods
          const trend = values.map((_, i) => {
            const lookback = Math.min(21, i + 1);
            const lookforward = Math.min(21, values.length - i - 1);
            const window = values.slice(i - lookback + 1, i + lookforward + 1);
            return window.reduce((sum, val) => sum + val, 0) / window.length;
          });
          
          const residuals = values.map((val, i) => val - trend[i]);
          
          return {
            id: seriesId,
            name: series.name || `Series ${seriesId}`,
            color: series.color || getRandomColor(seriesId),
            dates: filteredDates,
            values: transformedValues,
            rawValues: values,
            ohlc, // For candlestick charts
            returns,
            stats,
            indicators: {
              movingAverage,
              upperBand,
              lowerBand,
              trend,
              residuals,
              anomalies
            },
            forecast: {
              dates: Array(forecastHorizon).fill(0).map((_, i) => {
                const date = new Date(filteredDates[filteredDates.length - 1]);
                date.setDate(date.getDate() + i + 1);
                return date.toISOString().split('T')[0];
              }),
              values: forecastValues,
              lowerBound: forecastLower,
              upperBound: forecastUpper
            }
          };
        });
        
        resolve({
          dates: filteredDates,
          series: processedSeries,
          dateRange,
          interval
        });
      }, 1000);
    });
  };
  
  // Generate a random color for series without specified colors
  const getRandomColor = (id) => {
    const colors = [
      'rgba(66, 133, 244, 0.8)',   // Google blue
      'rgba(219, 68, 55, 0.8)',    // Google red
      'rgba(244, 180, 0, 0.8)',    // Google yellow
      'rgba(15, 157, 88, 0.8)',    // Google green
      'rgba(98, 0, 238, 0.8)',     // Purple
      'rgba(255, 109, 0, 0.8)',    // Orange
      'rgba(0, 121, 107, 0.8)',    // Teal
      'rgba(194, 24, 91, 0.8)'     // Pink
    ];
    
    // Use modulo to cycle through colors
    return colors[id % colors.length];
  };
  
  // Format a number as currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format a number as percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '—';
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Add a new annotation at the selected point
  const addAnnotation = () => {
    if (!selectedPoint) return;
    
    const newAnnotation = {
      id: Date.now(),
      date: selectedPoint.date,
      value: selectedPoint.value,
      series: selectedPoint.series,
      text: 'New annotation',
      color: processedData.series.find(s => s.id === selectedPoint.series)?.color || neutralColor
    };
    
    setAnnotations([...annotations, newAnnotation]);
    
    toast({
      title: "Annotation added",
      description: `Added annotation at ${selectedPoint.date}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Remove an annotation
  const removeAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };
  
  // Handle date range selection
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    
    // Reset custom dates if not using custom range
    if (newRange !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };
  
  // Handle export
  const handleExport = (format) => {
    if (onExport) {
      onExport({
        data: processedData,
        format,
        chartType,
        indicators: technicalIndicators,
        showForecast,
        dateRange,
        interval,
        transformationType
      });
    }
    
    toast({
      title: "Export initiated",
      description: `Exporting data as ${format.toUpperCase()}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle moving average window change
  const handleMAWindowChange = (val) => {
    setMaWindow(val);
  };
  
  // Handle Bollinger Bands std dev change
  const handleBBStdDevChange = (val) => {
    setBollingerStdDev(val);
  };
  
  // Toggle a series visibility
  const toggleSeries = (seriesId) => {
    setActiveSeries(prev => {
      if (prev.includes(seriesId)) {
        return prev.filter(id => id !== seriesId);
      } else {
        return [...prev, seriesId];
      }
    });
  };
  
  // Calculate zoom range labels
  const getVisibleRangeLabels = () => {
    if (!processedData || !processedData.dates) return { start: '', end: '' };
    
    const totalDates = processedData.dates.length;
    const startIndex = Math.floor((totalDates - 1) * (visibleTimeFrame.start / 100));
    const endIndex = Math.floor((totalDates - 1) * (visibleTimeFrame.end / 100));
    
    return {
      start: processedData.dates[startIndex] || '',
      end: processedData.dates[endIndex] || ''
    };
  };
  
  // Render loading state
  if (loading) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          direction="column"
          p={6}
        >
          <Box className="spinner" mb={4}></Box>
          <Text>Loading time series data...</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          bg="red.50"
          color="red.500"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          direction="column"
          p={6}
        >
          <Text fontWeight="bold" mb={2}>{error}</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render the component
  return (
    <ResponsiveWrapper width={width} height={height} {...props}>
      <Box 
        bg={bgColor} 
        border="1px solid" 
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        {/* Header with controls */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          p={4} 
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderBottom="1px solid"
          borderColor={borderColor}
          flexWrap="wrap"
          gap={2}
        >
          <Heading size="md">{processedData?.series?.[0]?.name || 'Time Series Analysis'}</Heading>
          
          <HStack spacing={2} flexWrap="wrap">
            {/* Chart type selection */}
            <Select 
              size="sm" 
              width="auto" 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
              <option value="candlestick">Candlestick</option>
            </Select>
            
            {/* Date range selection */}
            <Select 
              size="sm" 
              width="auto" 
              value={dateRange} 
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option value="all">All Data</option>
              <option value="1y">1 Year</option>
              <option value="6m">6 Months</option>
              <option value="3m">3 Months</option>
              <option value="1m">1 Month</option>
              <option value="1w">1 Week</option>
              <option value="custom">Custom Range</option>
            </Select>
            
            {/* Interval selection */}
            <Select 
              size="sm" 
              width="auto" 
              value={interval} 
              onChange={(e) => setInterval(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
            
            {/* Open settings drawer */}
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline" 
              leftIcon={<SettingsIcon />}
              onClick={onOpen}
            >
              Settings
            </Button>
            
            {/* Export menu */}
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                <DownloadIcon mr={1} />
                Export
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleExport('png')}>Export as Image (.png)</MenuItem>
                <MenuItem onClick={() => handleExport('svg')}>Export as SVG (.svg)</MenuItem>
                <MenuItem onClick={() => handleExport('csv')}>Export Data as CSV (.csv)</MenuItem>
                <MenuItem onClick={() => handleExport('excel')}>Export Data as Excel (.xlsx)</MenuItem>
                <MenuItem onClick={() => handleExport('json')}>Export Data as JSON (.json)</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Custom date range inputs (only shown when custom date range is selected) */}
        {dateRange === 'custom' && (
          <Flex p={4} borderBottom="1px solid" borderColor={borderColor} gap={4}>
            <FormControl>
              <FormLabel fontSize="sm">Start Date:</FormLabel>
              <Input 
                type="date" 
                size="sm"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">End Date:</FormLabel>
              <Input 
                type="date" 
                size="sm"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </FormControl>
            
            <Button 
              size="sm" 
              colorScheme="blue" 
              alignSelf="flex-end"
              isDisabled={!customStartDate || !customEndDate}
              onClick={() => {
                if (customStartDate && customEndDate) {
                  // Reset and reload with new custom dates
                  setDateRange('custom');
                }
              }}
            >
              Apply
            </Button>
          </Flex>
        )}
        
        {/* Active indicators display */}
        {technicalIndicators.length > 0 && (
          <Flex 
            p={2} 
            borderBottom="1px solid" 
            borderColor={borderColor} 
            bg={useColorModeValue('blue.50', 'blue.900')}
            flexWrap="wrap"
            gap={2}
          >
            <Text fontSize="sm" fontWeight="medium" mr={2}>Active Indicators:</Text>
            {technicalIndicators.map((indicator, index) => (
              <Badge key={index} colorScheme="blue" variant="subtle" px={2} py={1}>
                {indicator.name}
              </Badge>
            ))}
          </Flex>
        )}
        
        {/* Series selection */}
        {timeSeries.length > 1 && (
          <Flex 
            p={3} 
            borderBottom="1px solid" 
            borderColor={borderColor}
            overflowX="auto"
            gap={2}
          >
            {timeSeries.map((series) => (
              <Button
                key={series.id}
                size="xs"
                colorScheme={activeSeries.includes(series.id) ? "blue" : "gray"}
                variant={activeSeries.includes(series.id) ? "solid" : "outline"}
                onClick={() => toggleSeries(series.id)}
                leftIcon={
                  <Box 
                    w="10px" 
                    h="10px" 
                    borderRadius="full" 
                    bg={series.color || getRandomColor(series.id)} 
                  />
                }
              >
                {series.name}
              </Button>
            ))}
          </Flex>
        )}
        
        {/* Main chart area */}
        <Box p={4} height="350px" position="relative">
          <Flex alignItems="center" justifyContent="center" h="100%">
            <Text>
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart would be rendered here using Chart.js or D3.js
            </Text>
          </Flex>
          
          {/* Overlay forecast if enabled */}
          {showForecast && (
            <Box 
              position="absolute" 
              top={4} 
              right={4} 
              bg={useColorModeValue('blue.50', 'blue.900')} 
              p={2} 
              borderRadius="md"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.600')}
            >
              <Text fontSize="xs" fontWeight="semibold">Forecast Enabled</Text>
              <Text fontSize="xs">{forecastHorizon} days forecast horizon</Text>
              {showConfidenceIntervals && (
                <Text fontSize="xs">With {bollingerStdDev}σ confidence intervals</Text>
              )}
            </Box>
          )}
          
          {/* Annotations overlay */}
          {annotations.length > 0 && enableAnnotations && (
            <Box 
              position="absolute" 
              top={4} 
              left={4} 
              bg={useColorModeValue('orange.50', 'orange.900')} 
              p={2} 
              borderRadius="md"
              border="1px solid"
              borderColor={useColorModeValue('orange.200', 'orange.600')}
            >
              <Text fontSize="xs" fontWeight="semibold">{annotations.length} Annotations</Text>
            </Box>
          )}
          
          {/* Anomaly indicators if enabled */}
          {showAnomalies && (
            <Box 
              position="absolute" 
              bottom={4} 
              left={4} 
              bg={useColorModeValue('red.50', 'red.900')} 
              p={2} 
              borderRadius="md"
              border="1px solid"
              borderColor={useColorModeValue('red.200', 'red.600')}
            >
              <Text fontSize="xs" fontWeight="semibold">Anomaly Detection Enabled</Text>
            </Box>
          )}
        </Box>
        
        {/* Time range slider */}
        <Box p={4} pt={0}>
          <Flex align="center" mb={2}>
            <Text fontSize="xs" mr={2}>{getVisibleRangeLabels().start}</Text>
            <Slider
              aria-label="Time range slider"
              defaultValue={[0, 100]}
              value={[visibleTimeFrame.start, visibleTimeFrame.end]}
              min={0}
              max={100}
              step={1}
              colorScheme="blue"
              onChange={(val) => setVisibleTimeFrame({ start: val[0], end: val[1] })}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb index={0} />
              <SliderThumb index={1} />
            </Slider>
            <Text fontSize="xs" ml={2}>{getVisibleRangeLabels().end}</Text>
          </Flex>
          
          {/* Zoom buttons */}
          <Flex justify="center" gap={2}>
            <Tooltip label="Zoom out">
              <IconButton
                icon={<RepeatIcon />}
                size="xs"
                variant="outline"
                onClick={() => setVisibleTimeFrame({ start: 0, end: 100 })}
                aria-label="Reset zoom"
              />
            </Tooltip>
            <Tooltip label="Zoom to last month">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  const totalRange = processedData.dates.length;
                  const monthPoints = Math.ceil(totalRange / 12);
                  const newStart = Math.max(0, 100 - ((monthPoints / totalRange) * 100));
                  setVisibleTimeFrame({ start: newStart, end: 100 });
                }}
              >
                1M
              </Button>
            </Tooltip>
            <Tooltip label="Zoom to last 3 months">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  const totalRange = processedData.dates.length;
                  const quarterPoints = Math.ceil(totalRange / 4);
                  const newStart = Math.max(0, 100 - ((quarterPoints / totalRange) * 100));
                  setVisibleTimeFrame({ start: newStart, end: 100 });
                }}
              >
                3M
              </Button>
            </Tooltip>
            <Tooltip label="Zoom to last 6 months">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  const totalRange = processedData.dates.length;
                  const halfYearPoints = Math.ceil(totalRange / 2);
                  const newStart = Math.max(0, 100 - ((halfYearPoints / totalRange) * 100));
                  setVisibleTimeFrame({ start: newStart, end: 100 });
                }}
              >
                6M
              </Button>
            </Tooltip>
            <Tooltip label="Zoom to year to date">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  // Find first date of current year
                  const now = new Date();
                  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                  const startIndex = processedData.dates.findIndex(date => date >= startOfYear);
                  if (startIndex >= 0) {
                    const newStart = (startIndex / (processedData.dates.length - 1)) * 100;
                    setVisibleTimeFrame({ start: newStart, end: 100 });
                  }
                }}
              >
                YTD
              </Button>
            </Tooltip>
            <Tooltip label="Pan left">
              <IconButton
                icon={<ChevronLeftIcon />}
                size="xs"
                variant="outline"
                onClick={() => {
                  const range = visibleTimeFrame.end - visibleTimeFrame.start;
                  const shift = range * 0.25; // Shift by 25% of visible range
                  const newStart = Math.max(0, visibleTimeFrame.start - shift);
                  const newEnd = newStart + range;
                  setVisibleTimeFrame({ start: newStart, end: newEnd });
                }}
                aria-label="Pan left"
              />
            </Tooltip>
            <Tooltip label="Pan right">
              <IconButton
                icon={<ChevronRightIcon />}
                size="xs"
                variant="outline"
                onClick={() => {
                  const range = visibleTimeFrame.end - visibleTimeFrame.start;
                  const shift = range * 0.25; // Shift by 25% of visible range
                  const newEnd = Math.min(100, visibleTimeFrame.end + shift);
                  const newStart = newEnd - range;
                  setVisibleTimeFrame({ start: newStart, end: newEnd });
                }}
                aria-label="Pan right"
              />
            </Tooltip>
          </Flex>
        </Box>
        
        {/* Tabs for different analysis views */}
        <Tabs isLazy colorScheme="blue" size="sm">
          <TabList px={4} borderBottom="1px solid" borderColor={borderColor}>
            <Tab>Overview</Tab>
            <Tab>Statistics</Tab>
            <Tab>Returns</Tab>
            {enableAnomalyDetection && <Tab>Anomalies</Tab>}
            {enableSeasonalDecomposition && <Tab>Decomposition</Tab>}
            {enableAnnotations && <Tab>Annotations</Tab>}
          </TabList>
          
          <TabPanels maxH="250px" overflowY="auto">
            {/* Overview Tab */}
            <TabPanel>
              <Grid templateColumns={{base: "1fr", md: "repeat(2, 1fr)"}} gap={4}>
                {processedData.series.map((series, index) => (
                  <Box 
                    key={index} 
                    p={3} 
                    border="1px solid" 
                    borderColor={borderColor} 
                    borderRadius="md"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    <Flex alignItems="center" mb={2}>
                      <Box 
                        w="12px" 
                        h="12px" 
                        borderRadius="full" 
                        bg={series.color} 
                        mr={2}
                      />
                      <Heading size="sm">{series.name}</Heading>
                    </Flex>
                    
                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                      <Stat size="sm">
                        <StatLabel>Current Value</StatLabel>
                        <StatNumber fontSize="md">
                          {transformationType === 'none' 
                            ? formatCurrency(series.rawValues[series.rawValues.length - 1]) 
                            : series.values[series.values.length - 1].toFixed(2)}
                        </StatNumber>
                        <StatHelpText>
                          {processedData.dates[processedData.dates.length - 1]}
                        </StatHelpText>
                      </Stat>
                      
                      <Stat size="sm">
                        <StatLabel>Change</StatLabel>
                        <StatNumber 
                          fontSize="md" 
                          color={series.stats.percentChange >= 0 ? increaseColor : decreaseColor}
                        >
                          {series.stats.percentChange >= 0 ? '+' : ''}
                          {series.stats.percentChange.toFixed(2)}%
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow 
                            type={series.stats.percentChange >= 0 ? 'increase' : 'decrease'} 
                          />
                          {transformationType === 'none' 
                            ? formatCurrency(series.stats.change) 
                            : series.stats.change.toFixed(2)}
                        </StatHelpText>
                      </Stat>
                      
                      <Stat size="sm">
                        <StatLabel>Range</StatLabel>
                        <StatNumber fontSize="md">
                          {transformationType === 'none' 
                            ? formatCurrency(series.stats.max - series.stats.min) 
                            : (series.stats.max - series.stats.min).toFixed(2)}
                        </StatNumber>
                      </Stat>
                      
                      <Stat size="sm">
                        <StatLabel>Volatility</StatLabel>
                        <StatNumber fontSize="md">
                          {series.stats.volatility.toFixed(2)}%
                        </StatNumber>
                      </Stat>
                    </Grid>
                  </Box>
                ))}
              </Grid>
            </TabPanel>
            
            {/* Statistics Tab */}
            <TabPanel>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Statistic</Th>
                    {processedData.series.map((series, index) => (
                      <Th key={index}>{series.name}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td fontWeight="medium">Start Value</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index}>
                        {transformationType === 'none' 
                          ? formatCurrency(series.stats.startValue) 
                          : series.values[0].toFixed(2)}
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">End Value</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index}>
                        {transformationType === 'none' 
                          ? formatCurrency(series.stats.endValue) 
                          : series.values[series.values.length - 1].toFixed(2)}
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">Minimum</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index}>
                        {transformationType === 'none' 
                          ? formatCurrency(series.stats.min) 
                          : Math.min(...series.values).toFixed(2)}
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">Maximum</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index}>
                        {transformationType === 'none' 
                          ? formatCurrency(series.stats.max) 
                          : Math.max(...series.values).toFixed(2)}
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">Average</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index}>
                        {transformationType === 'none' 
                          ? formatCurrency(series.stats.mean) 
                          : (series.values.reduce((sum, val) => sum + val, 0) / series.values.length).toFixed(2)}
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">Total Change</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index} color={series.stats.change >= 0 ? increaseColor : decreaseColor}>
                        {series.stats.change >= 0 ? '+' : ''}
                        {transformationType === 'none' 
                          ? formatCurrency(series.stats.change) 
                          : (series.values[series.values.length - 1] - series.values[0]).toFixed(2)}
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">% Change</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index} color={series.stats.percentChange >= 0 ? increaseColor : decreaseColor}>
                        {series.stats.percentChange >= 0 ? '+' : ''}
                        {series.stats.percentChange.toFixed(2)}%
                      </Td>
                    ))}
                  </Tr>
                  <Tr>
                    <Td fontWeight="medium">Volatility</Td>
                    {processedData.series.map((series, index) => (
                      <Td key={index}>{series.stats.volatility.toFixed(2)}%</Td>
                    ))}
                  </Tr>
                </Tbody>
              </Table>
            </TabPanel>
            
            {/* Returns Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      {processedData.series.map((series, index) => (
                        <Th key={index} textAlign="right">{series.name}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {processedData.dates.slice(-10).map((date, dateIndex) => {
                      const realIndex = processedData.dates.length - 10 + dateIndex;
                      return (
                        <Tr key={dateIndex}>
                          <Td fontWeight="medium">{date}</Td>
                          {processedData.series.map((series, seriesIndex) => {
                            const returnValue = series.returns[realIndex];
                            return (
                              <Td 
                                key={seriesIndex} 
                                textAlign="right"
                                color={returnValue > 0 ? increaseColor : returnValue < 0 ? decreaseColor : textColor}
                              >
                                {returnValue > 0 ? '+' : ''}{returnValue.toFixed(2)}%
                              </Td>
                            );
                          })}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
              
              <Text fontSize="sm" mt={4} fontStyle="italic">
                Showing returns for the last 10 periods.
              </Text>
            </TabPanel>
            
            {/* Anomalies Tab */}
            {enableAnomalyDetection && (
              <TabPanel>
                {processedData.series.map((series, seriesIndex) => {
                  // Find anomalies
                  const anomalyDates = [];
                  series.indicators.anomalies.forEach((isAnomaly, i) => {
                    if (isAnomaly) {
                      anomalyDates.push({
                        date: processedData.dates[i],
                        value: series.rawValues[i],
                        returnValue: series.returns[i]
                      });
                    }
                  });
                  
                  return (
                    <Box key={seriesIndex} mb={seriesIndex < processedData.series.length - 1 ? 6 : 0}>
                      <Flex alignItems="center" mb={2}>
                        <Box 
                          w="12px" 
                          h="12px" 
                          borderRadius="full" 
                          bg={series.color} 
                          mr={2}
                        />
                        <Heading size="sm">{series.name}</Heading>
                      </Flex>
                      
                      {anomalyDates.length > 0 ? (
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Date</Th>
                              <Th isNumeric>Value</Th>
                              <Th isNumeric>Return</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {anomalyDates.map((anomaly, anomalyIndex) => (
                              <Tr key={anomalyIndex}>
                                <Td fontWeight="medium">{anomaly.date}</Td>
                                <Td isNumeric>
                                  {transformationType === 'none' 
                                    ? formatCurrency(anomaly.value) 
                                    : anomaly.value.toFixed(2)}
                                </Td>
                                <Td 
                                  isNumeric
                                  color={anomaly.returnValue > 0 ? increaseColor : decreaseColor}
                                >
                                  {anomaly.returnValue > 0 ? '+' : ''}
                                  {anomaly.returnValue.toFixed(2)}%
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      ) : (
                        <Text>No anomalies detected for this series.</Text>
                      )}
                    </Box>
                  );
                })}
              </TabPanel>
            )}
            
            {/* Decomposition Tab */}
            {enableSeasonalDecomposition && (
              <TabPanel>
                <Text mb={4}>
                  Time series decomposition breaks down a series into trend, seasonal, and residual components. 
                  This can help identify underlying patterns and anomalies.
                </Text>
                
                <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                  <TabList>
                    {processedData.series.map((series, index) => (
                      <Tab key={index}>
                        <Box 
                          w="10px" 
                          h="10px" 
                          borderRadius="full" 
                          bg={series.color} 
                          mr={2}
                        />
                        {series.name}
                      </Tab>
                    ))}
                  </TabList>
                  
                  <TabPanels mt={4}>
                    {processedData.series.map((series, seriesIndex) => (
                      <TabPanel key={seriesIndex} p={0}>
                        <Text>
                          Decomposition components would be visualized here with separate trend, 
                          seasonal, and residual charts.
                        </Text>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              </TabPanel>
            )}
            
            {/* Annotations Tab */}
            {enableAnnotations && (
              <TabPanel>
                <Flex justifyContent="space-between" mb={4} alignItems="center">
                  <Text>Manage annotations for significant events or points of interest in the time series.</Text>
                  
                  <Button 
                    size="xs" 
                    colorScheme="blue"
                    leftIcon={<AddIcon />}
                    isDisabled={!selectedPoint}
                    onClick={addAnnotation}
                  >
                    Add Annotation
                  </Button>
                </Flex>
                
                {annotations.length > 0 ? (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Series</Th>
                        <Th>Value</Th>
                        <Th>Note</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {annotations.map((annotation, index) => (
                        <Tr key={index}>
                          <Td>{annotation.date}</Td>
                          <Td>
                            <Flex alignItems="center">
                              <Box 
                                w="10px" 
                                h="10px" 
                                borderRadius="full" 
                                bg={annotation.color} 
                                mr={2}
                              />
                              {processedData.series.find(s => s.id === annotation.series)?.name || 'Unknown'}
                            </Flex>
                          </Td>
                          <Td>
                            {transformationType === 'none' 
                              ? formatCurrency(annotation.value) 
                              : annotation.value.toFixed(2)}
                          </Td>
                          <Td>{annotation.text}</Td>
                          <Td>
                            <IconButton
                              size="xs"
                              icon={<SearchIcon />}
                              aria-label="View annotation"
                              variant="ghost"
                              mr={1}
                            />
                            <IconButton
                              size="xs"
                              colorScheme="red"
                              icon={<ArrowDownIcon />}
                              aria-label="Remove annotation"
                              variant="ghost"
                              onClick={() => removeAnnotation(annotation.id)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text>No annotations yet. Select a point on the chart and click "Add Annotation".</Text>
                )}
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Settings drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Chart Settings</DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={6} align="stretch">
              {/* Data Transformation */}
              {allowDataTransformations && (
                <Box>
                  <Heading size="sm" mb={3}>Data Transformation</Heading>
                  <Select 
                    value={transformationType} 
                    onChange={(e) => setTransformationType(e.target.value)}
                  >
                    <option value="none">No Transformation</option>
                    <option value="log">Log Transformation</option>
                    <option value="diff">First Difference</option>
                    <option value="pct_change">Percentage Change</option>
                    <option value="z_score">Z-Score Normalization</option>
                  </Select>
                  <Text fontSize="xs" mt={1} color={subtextColor}>
                    Transforms the data to highlight different patterns
                  </Text>
                </Box>
              )}
              
              {/* Technical Indicators */}
              {enableTechnicalIndicators && (
                <Box>
                  <Heading size="sm" mb={3}>Technical Indicators</Heading>
                  
                  <FormControl display="flex" alignItems="center" mb={3}>
                    <FormLabel htmlFor="moving-average" mb="0" fontSize="sm">
                      Moving Average
                    </FormLabel>
                    <Switch 
                      id="moving-average" 
                      isChecked={showMovingAverage}
                      onChange={(e) => setShowMovingAverage(e.target.checked)}
                    />
                  </FormControl>
                  
                  {showMovingAverage && (
                    <Box mb={4} ml={6}>
                      <Text fontSize="sm" mb={1}>Window Size: {maWindow}</Text>
                      <Slider
                        min={2}
                        max={50}
                        step={1}
                        value={maWindow}
                        onChange={handleMAWindowChange}
                        colorScheme="blue"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Box>
                  )}
                  
                  <FormControl display="flex" alignItems="center" mb={3}>
                    <FormLabel htmlFor="bollinger-bands" mb="0" fontSize="sm">
                      Bollinger Bands
                    </FormLabel>
                    <Switch 
                      id="bollinger-bands" 
                      isChecked={showBollingerBands}
                      onChange={(e) => setShowBollingerBands(e.target.checked)}
                    />
                  </FormControl>
                  
                  {showBollingerBands && (
                    <Box mb={4} ml={6}>
                      <Text fontSize="sm" mb={1}>Standard Deviations: {bollingerStdDev}</Text>
                      <Slider
                        min={1}
                        max={4}
                        step={0.5}
                        value={bollingerStdDev}
                        onChange={handleBBStdDevChange}
                        colorScheme="blue"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Box>
                  )}
                  
                  <FormControl display="flex" alignItems="center" mb={3}>
                    <FormLabel htmlFor="trend-line" mb="0" fontSize="sm">
                      Trend Line
                    </FormLabel>
                    <Switch 
                      id="trend-line" 
                      isChecked={showTrend}
                      onChange={(e) => setShowTrend(e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="seasonality" mb="0" fontSize="sm">
                      Seasonality
                    </FormLabel>
                    <Switch 
                      id="seasonality" 
                      isChecked={showSeasonality}
                      onChange={(e) => setShowSeasonality(e.target.checked)}
                    />
                  </FormControl>
                </Box>
              )}
              
              {/* Forecasting */}
              {enableForecasting && (
                <Box>
                  <Heading size="sm" mb={3}>Forecasting</Heading>
                  
                  <FormControl display="flex" alignItems="center" mb={3}>
                    <FormLabel htmlFor="show-forecast" mb="0" fontSize="sm">
                      Show Forecast
                    </FormLabel>
                    <Switch 
                      id="show-forecast" 
                      isChecked={showForecast}
                      onChange={(e) => setShowForecast(e.target.checked)}
                    />
                  </FormControl>
                  
                  {showForecast && (
                    <>
                      <FormControl mb={3}>
                        <FormLabel fontSize="sm">Forecast Horizon (Days)</FormLabel>
                        <Grid templateColumns="1fr auto" gap={4} alignItems="center">
                          <Slider
                            min={5}
                            max={90}
                            step={1}
                            value={forecastHorizon}
                            onChange={(val) => setForecastHorizon(val)}
                            colorScheme="blue"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                          <Text>{forecastHorizon}</Text>
                        </Grid>
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="confidence-intervals" mb="0" fontSize="sm">
                          Show Confidence Intervals
                        </FormLabel>
                        <Switch 
                          id="confidence-intervals" 
                          isChecked={showConfidenceIntervals}
                          onChange={(e) => setShowConfidenceIntervals(e.target.checked)}
                        />
                      </FormControl>
                    </>
                  )}
                </Box>
              )}
              
              {/* Anomaly Detection */}
              {enableAnomalyDetection && (
                <Box>
                  <Heading size="sm" mb={3}>Anomaly Detection</Heading>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="show-anomalies" mb="0" fontSize="sm">
                      Highlight Anomalies
                    </FormLabel>
                    <Switch 
                      id="show-anomalies" 
                      isChecked={showAnomalies}
                      onChange={(e) => setShowAnomalies(e.target.checked)}
                    />
                  </FormControl>
                </Box>
              )}
            </VStack>
          </DrawerBody>
          
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Apply
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ResponsiveWrapper>
  );
};

export default TimeSeriesAnalyzer;