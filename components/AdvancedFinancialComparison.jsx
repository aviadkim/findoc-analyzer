import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  ButtonGroup,
  IconButton,
  Select,
  Text,
  Grid,
  GridItem, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  useColorModeValue,
  useColorMode,
  Tooltip,
  Badge,
  Divider,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  InfoIcon,
  DownloadIcon,
  RepeatIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@chakra-ui/icons';
import ResponsiveWrapper from './ResponsiveWrapper';

/**
 * AdvancedFinancialComparison Component
 * 
 * This component provides a comprehensive comparative analysis dashboard
 * for financial portfolios, statements, or securities. It supports multiple
 * visualization types and comparison methods with interactive features.
 * 
 * @param {Object} props
 * @param {Array} props.datasets - Array of datasets to compare
 * @param {Object} props.config - Configuration options for comparison
 * @param {Array} props.metrics - Financial metrics to display
 * @param {Function} props.onExport - Callback for export functionality
 * @param {String} props.height - Component height
 * @param {String} props.width - Component width
 */
const AdvancedFinancialComparison = ({
  datasets = [],
  config = {},
  metrics = [],
  onExport,
  height = '800px',
  width = '100%',
  ...props
}) => {
  // Destructure configuration with defaults
  const {
    defaultChartType = 'line',
    enableAnimations = true,
    enableDrilldown = true,
    significanceThreshold = 5, // percentage change considered significant
    defaultComparisonMode = 'overlay', // 'overlay', 'sideBySide', 'table'
    defaultTimeRange = 'all',
    defaultNormalization = 'absolute', // 'absolute', 'percentage', 'indexed'
  } = config;
  
  // State management
  const [comparisonMode, setComparisonMode] = useState(defaultComparisonMode);
  const [chartType, setChartType] = useState(defaultChartType);
  const [timeRange, setTimeRange] = useState(defaultTimeRange);
  const [normalization, setNormalization] = useState(defaultNormalization);
  const [activeDatasets, setActiveDatasets] = useState(datasets.map((d, i) => i)); // Indices of displayed datasets
  const [highlightedDataset, setHighlightedDataset] = useState(null);
  const [sortMetric, setSortMetric] = useState('value'); // 'value', 'change', 'percentChange'
  const [sortDirection, setSortDirection] = useState('desc');
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  
  // Chakra color mode
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.700', 'gray.100');
  const increaseColor = useColorModeValue('green.500', 'green.300');
  const decreaseColor = useColorModeValue('red.500', 'red.300');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Normalize dataset labels to be consistent
  useEffect(() => {
    if (!datasets || datasets.length === 0) {
      setError("No datasets provided for comparison");
      setLoading(false);
      return;
    }
    
    try {
      // Process and normalize the datasets for comparison
      setLoading(true);
      
      // Simulate data processing delay
      const timer = setTimeout(() => {
        const processed = processDatasets(datasets, {
          timeRange,
          normalization,
          activeDatasets,
        });
        setProcessedData(processed);
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error processing comparison data:", err);
      setError("Failed to process comparison data");
      setLoading(false);
    }
  }, [datasets, timeRange, normalization, activeDatasets]);
  
  // Process and normalize datasets for visualization
  const processDatasets = useCallback((data, options) => {
    if (!data || data.length === 0) return null;
    
    const { timeRange, normalization } = options;
    const activeIndices = options.activeDatasets || data.map((_, i) => i);
    
    // Extract labels (time periods)
    let allLabels = new Set();
    data.forEach(dataset => {
      if (dataset.timeSeries) {
        dataset.timeSeries.forEach(point => {
          allLabels.add(point.period);
        });
      }
    });
    
    // Convert to array and sort chronologically
    const labels = Array.from(allLabels).sort((a, b) => {
      // For simplicity, assumes periods are ISO date strings or comparable values
      return new Date(a) - new Date(b);
    });
    
    // Filter by time range if needed
    const filteredLabels = timeRange === 'all' 
      ? labels 
      : labels.slice(-parseInt(timeRange));
    
    // Process each dataset
    const processedDatasets = [];
    activeIndices.forEach(index => {
      if (index >= data.length) return;
      
      const dataset = data[index];
      const values = [];
      
      // Fill values array with null as placeholders
      filteredLabels.forEach(label => {
        const point = dataset.timeSeries?.find(p => p.period === label);
        values.push(point ? point.value : null);
      });
      
      // Apply normalization
      let normalizedValues = [...values];
      if (normalization === 'percentage' && values.length > 0) {
        const firstNonNullValue = values.find(v => v !== null) || 0;
        normalizedValues = values.map(v => 
          v !== null && firstNonNullValue !== 0 
            ? ((v - firstNonNullValue) / firstNonNullValue) * 100 
            : null
        );
      } else if (normalization === 'indexed' && values.length > 0) {
        const firstNonNullValue = values.find(v => v !== null) || 0;
        normalizedValues = values.map(v => 
          v !== null && firstNonNullValue !== 0 
            ? (v / firstNonNullValue) * 100 
            : null
        );
      }
      
      // Calculate changes from previous period
      const changes = [];
      const percentChanges = [];
      
      for (let i = 1; i < values.length; i++) {
        if (values[i] === null || values[i-1] === null) {
          changes.push(null);
          percentChanges.push(null);
        } else {
          const change = values[i] - values[i-1];
          changes.push(change);
          const percentChange = values[i-1] !== 0 
            ? (change / values[i-1]) * 100 
            : null;
          percentChanges.push(percentChange);
        }
      }
      
      // Prepend null as there's no change for the first period
      changes.unshift(null);
      percentChanges.unshift(null);
      
      processedDatasets.push({
        id: dataset.id,
        name: dataset.name,
        color: dataset.color || getRandomColor(index),
        values: normalizedValues,
        rawValues: values,
        changes,
        percentChanges,
        metadata: dataset.metadata || {}
      });
    });
    
    // Calculate overall statistics
    const overallStats = calculateOverallStats(processedDatasets, filteredLabels);
    
    return {
      labels: filteredLabels,
      datasets: processedDatasets,
      stats: overallStats
    };
  }, []);
  
  // Calculate overall comparison statistics
  const calculateOverallStats = (datasets, labels) => {
    if (!datasets || datasets.length < 2 || !labels || labels.length === 0) {
      return {
        relativeDifference: null,
        absoluteDifference: null,
        percentageDifference: null,
        startValueDifference: null,
        endValueDifference: null,
        volatilityDifference: null
      };
    }
    
    const firstDataset = datasets[0];
    const secondDataset = datasets[1];
    
    // Calculate start and end values
    const firstStart = firstDataset.rawValues[0] || 0;
    const firstEnd = firstDataset.rawValues[firstDataset.rawValues.length - 1] || 0;
    const secondStart = secondDataset.rawValues[0] || 0;
    const secondEnd = secondDataset.rawValues[secondDataset.rawValues.length - 1] || 0;
    
    // Calculate changes
    const firstChange = firstEnd - firstStart;
    const secondChange = secondEnd - secondStart;
    const absoluteDifference = firstChange - secondChange;
    
    // Calculate percentage differences
    const firstPercentChange = firstStart !== 0 ? (firstChange / firstStart) * 100 : 0;
    const secondPercentChange = secondStart !== 0 ? (secondChange / secondStart) * 100 : 0;
    const percentageDifference = firstPercentChange - secondPercentChange;
    
    // Calculate relative performance
    const relativeDifference = firstStart !== 0 && secondStart !== 0
      ? (firstEnd / firstStart) / (secondEnd / secondStart) - 1
      : 0;
    
    // Calculate other metrics
    const startValueDifference = firstStart - secondStart;
    const endValueDifference = firstEnd - secondEnd;
    
    // Calculate volatility (standard deviation of percent changes)
    const firstVolatility = calculateVolatility(firstDataset.percentChanges);
    const secondVolatility = calculateVolatility(secondDataset.percentChanges);
    const volatilityDifference = firstVolatility - secondVolatility;
    
    return {
      relativeDifference,
      absoluteDifference,
      percentageDifference,
      startValueDifference,
      endValueDifference,
      volatilityDifference
    };
  };
  
  // Calculate volatility (standard deviation of percent changes)
  const calculateVolatility = (percentChanges) => {
    const validChanges = percentChanges.filter(change => change !== null);
    if (validChanges.length === 0) return 0;
    
    const mean = validChanges.reduce((sum, change) => sum + change, 0) / validChanges.length;
    const squaredDiffs = validChanges.map(change => Math.pow(change - mean, 2));
    const variance = squaredDiffs.reduce((sum, sqDiff) => sum + sqDiff, 0) / validChanges.length;
    return Math.sqrt(variance);
  };
  
  // Generate a random color for datasets without specified colors
  const getRandomColor = (index) => {
    const colors = [
      'rgba(54, 162, 235, 0.8)',   // blue
      'rgba(255, 99, 132, 0.8)',   // red
      'rgba(75, 192, 192, 0.8)',   // green
      'rgba(255, 159, 64, 0.8)',   // orange
      'rgba(153, 102, 255, 0.8)',  // purple
      'rgba(255, 206, 86, 0.8)',   // yellow
      'rgba(199, 199, 199, 0.8)',  // gray
      'rgba(83, 102, 255, 0.8)',   // indigo
      'rgba(255, 99, 71, 0.8)',    // tomato
      'rgba(34, 139, 34, 0.8)'     // forest green
    ];
    
    return colors[index % colors.length];
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
  
  // Format a value according to the current normalization mode
  const formatValue = (value) => {
    if (value === null || value === undefined) return '—';
    
    switch (normalization) {
      case 'percentage':
      case 'indexed':
        return `${value.toFixed(2)}%`;
      default:
        return formatCurrency(value);
    }
  };
  
  // Toggle a dataset's visibility
  const toggleDataset = (index) => {
    setActiveDatasets(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index].sort();
      }
    });
  };
  
  // Toggle sort direction
  const toggleSort = (metric) => {
    if (sortMetric === metric) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMetric(metric);
      setSortDirection('desc');
    }
  };
  
  // Handle export functionality
  const handleExport = (format) => {
    if (onExport) {
      onExport({
        data: processedData,
        format,
        chartType,
        normalization,
        timeRange
      });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          direction="column" 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          bg={bgColor}
          p={6}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
        >
          <Box className="spinner" mb={4}></Box>
          <Text>Loading comparison data...</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          direction="column" 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          bg="red.50"
          color="red.500"
          p={6}
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
        >
          <Text fontSize="lg" fontWeight="bold" mb={2}>Error Loading Comparison</Text>
          <Text>{error}</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render empty state if no processed data
  if (!processedData) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          direction="column" 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          bg={bgColor}
          p={6}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
        >
          <Text>No comparison data available for visualization.</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render main component
  return (
    <ResponsiveWrapper width={width} height={height} {...props}>
      <Box bg={bgColor} p={4} borderRadius="md" border="1px solid" borderColor={borderColor}>
        {/* Header with controls */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <Heading size="md" color={headingColor}>Financial Comparison</Heading>
          
          <HStack spacing={3} flexWrap="wrap">
            {/* Visualization mode selection */}
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                isActive={comparisonMode === 'overlay'}
                onClick={() => setComparisonMode('overlay')}
                aria-label="Overlay view"
              >
                Overlay
              </Button>
              <Button
                isActive={comparisonMode === 'sideBySide'}
                onClick={() => setComparisonMode('sideBySide')}
                aria-label="Side by side view"
              >
                Side-by-Side
              </Button>
              <Button
                isActive={comparisonMode === 'table'}
                onClick={() => setComparisonMode('table')}
                aria-label="Table view"
              >
                Table
              </Button>
            </ButtonGroup>
            
            {/* Timeframe selection */}
            <Select 
              size="sm" 
              width="auto" 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="60">Last 5 Years</option>
              <option value="36">Last 3 Years</option>
              <option value="12">Last Year</option>
              <option value="6">Last 6 Months</option>
              <option value="3">Last 3 Months</option>
            </Select>
            
            {/* Chart type selection */}
            {comparisonMode !== 'table' && (
              <Select 
                size="sm" 
                width="auto" 
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="radar">Radar Chart</option>
              </Select>
            )}
            
            {/* Normalization selection */}
            <Select 
              size="sm" 
              width="auto" 
              value={normalization}
              onChange={(e) => setNormalization(e.target.value)}
            >
              <option value="absolute">Absolute Values</option>
              <option value="percentage">Percentage Change</option>
              <option value="indexed">Indexed (100)</option>
            </Select>
            
            {/* Export menu */}
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                <DownloadIcon mr={1} />
                Export
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleExport('png')}>
                  Export as Image (.png)
                </MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF (.pdf)
                </MenuItem>
                <MenuItem onClick={() => handleExport('csv')}>
                  Export Data as CSV (.csv)
                </MenuItem>
                <MenuItem onClick={() => handleExport('excel')}>
                  Export Data as Excel (.xlsx)
                </MenuItem>
                <MenuItem onClick={() => handleExport('json')}>
                  Export Data as JSON (.json)
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Summary statistics */}
        {processedData.datasets.length >= 2 && (
          <Card mb={4} variant="outline">
            <CardHeader pb={0}>
              <Heading size="sm" color={headingColor}>Comparison Summary</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
                <GridItem>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Overall Performance Difference</StatLabel>
                      <StatNumber color={processedData.stats.percentageDifference >= 0 ? increaseColor : decreaseColor}>
                        {processedData.stats.percentageDifference >= 0 ? '+' : ''}
                        {processedData.stats.percentageDifference?.toFixed(2)}%
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type={processedData.stats.percentageDifference >= 0 ? 'increase' : 'decrease'} />
                        {processedData.datasets[0]?.name || 'First dataset'} vs. {processedData.datasets[1]?.name || 'Second dataset'}
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </GridItem>
                
                <GridItem>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Absolute Value Difference</StatLabel>
                      <StatNumber>
                        {formatCurrency(processedData.stats.endValueDifference)}
                      </StatNumber>
                      <StatHelpText>
                        Current difference between datasets
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </GridItem>
                
                <GridItem>
                  <StatGroup>
                    <Stat>
                      <StatLabel>Volatility Difference</StatLabel>
                      <StatNumber>
                        {processedData.stats.volatilityDifference >= 0 ? '+' : ''}
                        {processedData.stats.volatilityDifference?.toFixed(2)}%
                      </StatNumber>
                      <StatHelpText>
                        {Math.abs(processedData.stats.volatilityDifference) < 1 ? 'Similar volatility' : 
                          processedData.stats.volatilityDifference > 0 ? 'First dataset more volatile' : 
                          'Second dataset more volatile'}
                      </StatHelpText>
                    </Stat>
                  </StatGroup>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        )}
        
        {/* Dataset selection */}
        <Box mb={4}>
          <Text fontWeight="medium" mb={2}>
            Datasets {activeDatasets.length > 0 && `(${activeDatasets.length} selected)`}
          </Text>
          <Flex flexWrap="wrap" gap={2}>
            {datasets.map((dataset, index) => (
              <Button
                key={index}
                size="sm"
                variant={activeDatasets.includes(index) ? "solid" : "outline"}
                colorScheme={activeDatasets.includes(index) ? "blue" : "gray"}
                leftIcon={activeDatasets.includes(index) ? <CheckIcon /> : null}
                onClick={() => toggleDataset(index)}
              >
                {dataset.name}
              </Button>
            ))}
          </Flex>
        </Box>
        
        {/* Visualization area */}
        {comparisonMode !== 'table' ? (
          <Box 
            h="350px" 
            mb={4} 
            position="relative"
            aria-live="polite"
            aria-atomic="true"
          >
            <Flex alignItems="center" justifyContent="center" h="100%">
              <Text>
                {comparisonMode === 'overlay' ? 'Overlay' : 'Side-by-Side'} {chartType} chart would be rendered here using Chart.js
              </Text>
            </Flex>
          </Box>
        ) : (
          <Box overflowX="auto" mb={4}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Period</Th>
                  {processedData.datasets.map((dataset, i) => (
                    <React.Fragment key={i}>
                      <Th textAlign="right">{dataset.name}</Th>
                      <Th textAlign="right">Change</Th>
                    </React.Fragment>
                  ))}
                  {processedData.datasets.length === 2 && (
                    <Th textAlign="right">Difference</Th>
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {processedData.labels.map((label, periodIndex) => (
                  <Tr key={periodIndex}>
                    <Td fontWeight="medium">{label}</Td>
                    {processedData.datasets.map((dataset, datasetIndex) => {
                      const value = dataset.values[periodIndex];
                      const change = dataset.percentChanges[periodIndex];
                      const isSignificant = change !== null && Math.abs(change) >= significanceThreshold;
                      
                      return (
                        <React.Fragment key={datasetIndex}>
                          <Td textAlign="right">{formatValue(value)}</Td>
                          <Td 
                            textAlign="right"
                            color={change === null ? 'gray.500' : 
                                  change > 0 ? increaseColor : 
                                  change < 0 ? decreaseColor : 'gray.500'}
                          >
                            {change === null ? '—' : (
                              <HStack justifyContent="flex-end" spacing={1}>
                                {change > 0 ? <ArrowUpIcon boxSize={3} /> : 
                                change < 0 ? <ArrowDownIcon boxSize={3} /> : null}
                                <Text>{change.toFixed(2)}%</Text>
                                {isSignificant && (
                                  <Tooltip label="Significant change">
                                    <Badge 
                                      colorScheme={change > 0 ? "green" : "red"} 
                                      variant="outline" 
                                      ml={1}
                                      fontSize="2xs"
                                    >
                                      !
                                    </Badge>
                                  </Tooltip>
                                )}
                              </HStack>
                            )}
                          </Td>
                        </React.Fragment>
                      );
                    })}
                    
                    {processedData.datasets.length === 2 && (
                      <Td textAlign="right">
                        {processedData.datasets[0].values[periodIndex] !== null && 
                         processedData.datasets[1].values[periodIndex] !== null ? (
                          <Text color={processedData.datasets[0].values[periodIndex] >= processedData.datasets[1].values[periodIndex] ? 
                                     increaseColor : decreaseColor}>
                            {formatValue(processedData.datasets[0].values[periodIndex] - processedData.datasets[1].values[periodIndex])}
                          </Text>
                        ) : '—'}
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
        
        {/* Detail tabs: Overview, Statistics, Changes */}
        <Tabs variant="enclosed" size="sm" colorScheme="blue">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Statistics</Tab>
            <Tab>Key Changes</Tab>
          </TabList>
          
          <TabPanels>
            {/* Overview panel */}
            <TabPanel>
              <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
                {processedData.datasets.map((dataset, i) => {
                  // Calculate overall performance metrics
                  const firstValue = dataset.rawValues[0] || 0;
                  const lastValue = dataset.rawValues[dataset.rawValues.length - 1] || 0;
                  const totalChange = lastValue - firstValue;
                  const totalPercentChange = firstValue !== 0 ? (totalChange / firstValue) * 100 : 0;
                  
                  return (
                    <Card key={i} variant="outline">
                      <CardHeader bg={useColorModeValue(`${dataset.color.replace('0.8', '0.1')}`, `${dataset.color.replace('0.8', '0.3')}`)}>
                        <Heading size="sm">{dataset.name}</Heading>
                      </CardHeader>
                      <CardBody>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <GridItem>
                            <Stat>
                              <StatLabel>Start Value</StatLabel>
                              <StatNumber fontSize="lg">{formatCurrency(firstValue)}</StatNumber>
                              <StatHelpText>{processedData.labels[0]}</StatHelpText>
                            </Stat>
                          </GridItem>
                          <GridItem>
                            <Stat>
                              <StatLabel>Current Value</StatLabel>
                              <StatNumber fontSize="lg">{formatCurrency(lastValue)}</StatNumber>
                              <StatHelpText>{processedData.labels[processedData.labels.length - 1]}</StatHelpText>
                            </Stat>
                          </GridItem>
                          <GridItem>
                            <Stat>
                              <StatLabel>Total Change</StatLabel>
                              <StatNumber fontSize="lg" color={totalChange >= 0 ? increaseColor : decreaseColor}>
                                {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}
                              </StatNumber>
                            </Stat>
                          </GridItem>
                          <GridItem>
                            <Stat>
                              <StatLabel>Total % Change</StatLabel>
                              <StatNumber fontSize="lg" color={totalPercentChange >= 0 ? increaseColor : decreaseColor}>
                                {totalPercentChange >= 0 ? '+' : ''}{totalPercentChange.toFixed(2)}%
                              </StatNumber>
                              <StatHelpText>
                                <StatArrow type={totalPercentChange >= 0 ? 'increase' : 'decrease'} />
                                Over entire period
                              </StatHelpText>
                            </Stat>
                          </GridItem>
                        </Grid>
                        
                        {dataset.metadata && Object.keys(dataset.metadata).length > 0 && (
                          <Box mt={4}>
                            <Text fontWeight="medium" mb={2}>Additional Information</Text>
                            <Table size="sm" variant="simple">
                              <Tbody>
                                {Object.entries(dataset.metadata).map(([key, value]) => (
                                  <Tr key={key}>
                                    <Td fontWeight="medium">{key.charAt(0).toUpperCase() + key.slice(1)}</Td>
                                    <Td>{value}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </Grid>
            </TabPanel>
            
            {/* Statistics panel */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Metric</Th>
                      {processedData.datasets.map((dataset, i) => (
                        <Th key={i}>{dataset.name}</Th>
                      ))}
                      {processedData.datasets.length >= 2 && <Th>Difference</Th>}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* Average value */}
                    <Tr>
                      <Td fontWeight="medium">Average Value</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const avg = dataset.rawValues.filter(v => v !== null).reduce((a, b) => a + b, 0) / 
                                   dataset.rawValues.filter(v => v !== null).length;
                        return (
                          <Td key={i}>{formatCurrency(avg)}</Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td>
                          {formatCurrency(
                            (processedData.datasets[0].rawValues.filter(v => v !== null).reduce((a, b) => a + b, 0) / 
                            processedData.datasets[0].rawValues.filter(v => v !== null).length) -
                            (processedData.datasets[1].rawValues.filter(v => v !== null).reduce((a, b) => a + b, 0) / 
                            processedData.datasets[1].rawValues.filter(v => v !== null).length)
                          )}
                        </Td>
                      )}
                    </Tr>
                    
                    {/* Minimum value */}
                    <Tr>
                      <Td fontWeight="medium">Minimum Value</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const min = Math.min(...dataset.rawValues.filter(v => v !== null));
                        return (
                          <Td key={i}>{formatCurrency(min)}</Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td>
                          {formatCurrency(
                            Math.min(...processedData.datasets[0].rawValues.filter(v => v !== null)) -
                            Math.min(...processedData.datasets[1].rawValues.filter(v => v !== null))
                          )}
                        </Td>
                      )}
                    </Tr>
                    
                    {/* Maximum value */}
                    <Tr>
                      <Td fontWeight="medium">Maximum Value</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const max = Math.max(...dataset.rawValues.filter(v => v !== null));
                        return (
                          <Td key={i}>{formatCurrency(max)}</Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td>
                          {formatCurrency(
                            Math.max(...processedData.datasets[0].rawValues.filter(v => v !== null)) -
                            Math.max(...processedData.datasets[1].rawValues.filter(v => v !== null))
                          )}
                        </Td>
                      )}
                    </Tr>
                    
                    {/* Range */}
                    <Tr>
                      <Td fontWeight="medium">Range</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const min = Math.min(...dataset.rawValues.filter(v => v !== null));
                        const max = Math.max(...dataset.rawValues.filter(v => v !== null));
                        return (
                          <Td key={i}>{formatCurrency(max - min)}</Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td>
                          {formatCurrency(
                            (Math.max(...processedData.datasets[0].rawValues.filter(v => v !== null)) -
                             Math.min(...processedData.datasets[0].rawValues.filter(v => v !== null))) -
                            (Math.max(...processedData.datasets[1].rawValues.filter(v => v !== null)) -
                             Math.min(...processedData.datasets[1].rawValues.filter(v => v !== null)))
                          )}
                        </Td>
                      )}
                    </Tr>
                    
                    {/* Volatility (standard deviation of % changes) */}
                    <Tr>
                      <Td fontWeight="medium">Volatility</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const volatility = calculateVolatility(dataset.percentChanges);
                        return (
                          <Td key={i}>{volatility.toFixed(2)}%</Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td 
                          color={processedData.stats.volatilityDifference >= 0 ? increaseColor : decreaseColor}
                        >
                          {processedData.stats.volatilityDifference >= 0 ? '+' : ''}
                          {processedData.stats.volatilityDifference.toFixed(2)}%
                        </Td>
                      )}
                    </Tr>
                    
                    {/* Total change */}
                    <Tr>
                      <Td fontWeight="medium">Total Change</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const firstValue = dataset.rawValues[0] || 0;
                        const lastValue = dataset.rawValues[dataset.rawValues.length - 1] || 0;
                        const change = lastValue - firstValue;
                        return (
                          <Td key={i} color={change >= 0 ? increaseColor : decreaseColor}>
                            {change >= 0 ? '+' : ''}{formatCurrency(change)}
                          </Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td color={processedData.stats.absoluteDifference >= 0 ? increaseColor : decreaseColor}>
                          {processedData.stats.absoluteDifference >= 0 ? '+' : ''}
                          {formatCurrency(processedData.stats.absoluteDifference)}
                        </Td>
                      )}
                    </Tr>
                    
                    {/* Total % change */}
                    <Tr>
                      <Td fontWeight="medium">Total % Change</Td>
                      {processedData.datasets.map((dataset, i) => {
                        const firstValue = dataset.rawValues[0] || 0;
                        const lastValue = dataset.rawValues[dataset.rawValues.length - 1] || 0;
                        const percentChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
                        return (
                          <Td key={i} color={percentChange >= 0 ? increaseColor : decreaseColor}>
                            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
                          </Td>
                        );
                      })}
                      {processedData.datasets.length >= 2 && (
                        <Td color={processedData.stats.percentageDifference >= 0 ? increaseColor : decreaseColor}>
                          {processedData.stats.percentageDifference >= 0 ? '+' : ''}
                          {processedData.stats.percentageDifference.toFixed(2)}%
                        </Td>
                      )}
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            
            {/* Key Changes panel */}
            <TabPanel>
              {processedData.datasets.map((dataset, datasetIndex) => {
                // Find periods with significant changes
                const significantChanges = [];
                
                dataset.percentChanges.forEach((change, i) => {
                  if (change !== null && Math.abs(change) >= significanceThreshold) {
                    significantChanges.push({
                      period: processedData.labels[i],
                      previousPeriod: i > 0 ? processedData.labels[i-1] : null,
                      value: dataset.rawValues[i],
                      previousValue: i > 0 ? dataset.rawValues[i-1] : null,
                      change: dataset.changes[i],
                      percentChange: change,
                      index: i
                    });
                  }
                });
                
                significantChanges.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
                
                return (
                  <Box key={datasetIndex} mb={datasetIndex < processedData.datasets.length - 1 ? 6 : 0}>
                    <Heading size="sm" mb={3} color={headingColor}>{dataset.name} - Key Changes</Heading>
                    
                    {significantChanges.length > 0 ? (
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Period</Th>
                            <Th>Previous</Th>
                            <Th>Current</Th>
                            <Th>Change</Th>
                            <Th>% Change</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {significantChanges.slice(0, 5).map((change, i) => (
                            <Tr key={i}>
                              <Td>{change.period}</Td>
                              <Td>{formatValue(change.previousValue)}</Td>
                              <Td>{formatValue(change.value)}</Td>
                              <Td color={change.change >= 0 ? increaseColor : decreaseColor}>
                                {change.change >= 0 ? '+' : ''}{formatValue(change.change)}
                              </Td>
                              <Td color={change.percentChange >= 0 ? increaseColor : decreaseColor}>
                                <HStack>
                                  {change.percentChange >= 0 ? <ArrowUpIcon boxSize={3} /> : <ArrowDownIcon boxSize={3} />}
                                  <Text>{change.percentChange.toFixed(2)}%</Text>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No significant changes found (threshold: {significanceThreshold}%).</Text>
                    )}
                    
                    {/* Key periods summary */}
                    {significantChanges.length > 0 && (
                      <Box mt={4}>
                        <Text fontWeight="medium" mb={2}>Summary of Key Periods</Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                          {significantChanges.slice(0, 3).map((change, i) => (
                            <Card key={i} size="sm">
                              <CardBody>
                                <Heading size="xs" mb={1}>{change.period}</Heading>
                                <Text fontSize="sm">
                                  {dataset.name} {change.percentChange >= 0 ? 'increased' : 'decreased'} by{' '}
                                  <Text as="span" fontWeight="bold" color={change.percentChange >= 0 ? increaseColor : decreaseColor}>
                                    {Math.abs(change.percentChange).toFixed(2)}%
                                  </Text>{' '}
                                  from the previous period.
                                </Text>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                    
                    {datasetIndex < processedData.datasets.length - 1 && <Divider my={4} />}
                  </Box>
                );
              })}
              
              {/* Comparative analysis (only if there are at least 2 datasets) */}
              {processedData.datasets.length >= 2 && (
                <Box mt={6}>
                  <Heading size="sm" mb={3} color={headingColor}>
                    Comparative Analysis - {processedData.datasets[0].name} vs. {processedData.datasets[1].name}
                  </Heading>
                  
                  <Text fontSize="sm" mb={4}>
                    Overall, {processedData.datasets[0].name} has{' '}
                    <Text as="span" fontWeight="bold" color={processedData.stats.percentageDifference >= 0 ? increaseColor : decreaseColor}>
                      {processedData.stats.percentageDifference >= 0 ? 'outperformed' : 'underperformed'}
                    </Text>{' '}
                    {processedData.datasets[1].name} by{' '}
                    <Text as="span" fontWeight="bold">
                      {Math.abs(processedData.stats.percentageDifference).toFixed(2)}%
                    </Text>{' '}
                    over the selected time period.
                  </Text>
                  
                  {/* Find periods with largest performance gaps */}
                  {(() => {
                    const gaps = [];
                    
                    processedData.labels.forEach((label, i) => {
                      const value1 = processedData.datasets[0].rawValues[i];
                      const value2 = processedData.datasets[1].rawValues[i];
                      
                      if (value1 !== null && value2 !== null) {
                        const absoluteGap = value1 - value2;
                        const relativeGap = value2 !== 0 ? ((value1 / value2) - 1) * 100 : 0;
                        
                        gaps.push({
                          period: label,
                          value1,
                          value2,
                          absoluteGap,
                          relativeGap,
                          index: i
                        });
                      }
                    });
                    
                    // Sort by magnitude of relative gap
                    gaps.sort((a, b) => Math.abs(b.relativeGap) - Math.abs(a.relativeGap));
                    
                    if (gaps.length > 0) {
                      return (
                        <>
                          <Text fontWeight="medium" mb={2}>Periods with Largest Performance Gaps</Text>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Period</Th>
                                <Th>{processedData.datasets[0].name}</Th>
                                <Th>{processedData.datasets[1].name}</Th>
                                <Th>Absolute Gap</Th>
                                <Th>Relative Gap</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {gaps.slice(0, 5).map((gap, i) => (
                                <Tr key={i}>
                                  <Td>{gap.period}</Td>
                                  <Td>{formatValue(gap.value1)}</Td>
                                  <Td>{formatValue(gap.value2)}</Td>
                                  <Td color={gap.absoluteGap >= 0 ? increaseColor : decreaseColor}>
                                    {gap.absoluteGap >= 0 ? '+' : ''}{formatValue(gap.absoluteGap)}
                                  </Td>
                                  <Td color={gap.relativeGap >= 0 ? increaseColor : decreaseColor}>
                                    {gap.relativeGap >= 0 ? '+' : ''}{gap.relativeGap.toFixed(2)}%
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </>
                      );
                    }
                    
                    return null;
                  })()}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ResponsiveWrapper>
  );
};

export default AdvancedFinancialComparison;