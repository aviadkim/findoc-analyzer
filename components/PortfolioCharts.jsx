import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Heading, 
  Flex, 
  Button, 
  Spinner, 
  Text, 
  SimpleGrid,
  useColorMode,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  VStack,
  Select,
  IconButton,
  Badge,
  useToast
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import ResponsiveWrapper from './ResponsiveWrapper';

/**
 * PortfolioCharts Component
 * 
 * A React implementation of the PortfolioCharts class.
 * Displays portfolio visualization charts with responsive design.
 * 
 * @param {Object} props
 * @param {string} props.portfolioId - ID of the portfolio to visualize (optional)
 * @param {string} props.timeframe - Initial timeframe to display (default: '1y')
 * @param {boolean} props.showLegend - Whether to display chart legends (default: true)
 * @param {boolean} props.showTimeframeSelector - Whether to show timeframe selector (default: true)
 * @param {boolean} props.showThemeToggle - Whether to show theme toggle button (default: true)
 * @param {number} props.height - Height of individual charts in pixels (default: 300)
 * @param {string} props.width - Width of the charts container (default: '100%')
 */
const PortfolioCharts = ({
  portfolioId,
  timeframe = '1y',
  showLegend = true,
  showTimeframeSelector = true,
  showThemeToggle = true,
  height = 300,
  width = '100%',
  ...props
}) => {
  // State
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const chartsRef = useRef({});
  const toast = useToast();
  
  // Chakra color mode hooks
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Chart.js dynamic import
  useEffect(() => {
    // Load Chart.js dynamically
    const loadChartJs = async () => {
      try {
        if (!window.Chart) {
          // Use dynamic import for client-side only code
          await import('chart.js/auto');
        }
        fetchData();
      } catch (err) {
        console.error('Error loading Chart.js:', err);
        setError('Failed to load chart library. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadChartJs();
  }, []);
  
  // Fetch portfolio data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    const queryParams = new URLSearchParams();
    
    if (portfolioId) {
      queryParams.set('id', portfolioId);
    }
    
    queryParams.set('timeframe', selectedTimeframe);
    
    try {
      const response = await fetch(`/api/visualization/portfolio?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load portfolio data');
      }
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError('Failed to load portfolio data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update when timeframe changes
  useEffect(() => {
    if (window.Chart) {
      fetchData();
    }
  }, [selectedTimeframe, portfolioId]);
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage for display
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Format metric name (convert camelCase to Title Case with spaces)
  const formatMetricName = (name) => {
    const formatted = name.replace(/([A-Z])/g, ' $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };
  
  // Timeframe options
  const timeframeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' },
    { value: 'max', label: 'Max' }
  ];
  
  // Render placeholder for charts
  if (isLoading) {
    return (
      <ResponsiveWrapper width={width} {...props}>
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          height={`${height}px`} 
          direction="column"
        >
          <Spinner size="xl" mb={4} />
          <Text>Loading portfolio data...</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  if (error) {
    return (
      <ResponsiveWrapper width={width} {...props}>
        <Box 
          p={4} 
          bg="red.50" 
          color="red.500" 
          borderRadius="md" 
          textAlign="center"
        >
          <Text fontWeight="bold">{error}</Text>
        </Box>
      </ResponsiveWrapper>
    );
  }
  
  // Render empty state if no data
  if (!data) {
    return (
      <ResponsiveWrapper width={width} {...props}>
        <Box 
          p={4} 
          bg={cardBg} 
          color={textColor} 
          borderRadius="md" 
          textAlign="center"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text>No portfolio data available.</Text>
        </Box>
      </ResponsiveWrapper>
    );
  }
  
  // Render portfolio charts
  return (
    <ResponsiveWrapper width={width} {...props}>
      <Box>
        {/* Toolbar */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          {showTimeframeSelector && (
            <HStack>
              <Text fontSize="sm">Timeframe:</Text>
              <Select 
                value={selectedTimeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                size="sm"
                maxW="150px"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </HStack>
          )}
          
          {showThemeToggle && (
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              size="sm"
            />
          )}
        </Flex>
        
        {/* Portfolio Summary */}
        {data.assetAllocation && (
          <Box 
            mb={6} 
            p={4} 
            bg={cardBg} 
            borderRadius="md" 
            border="1px solid" 
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>Portfolio Summary</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Total Value</StatLabel>
                <StatNumber>
                  {data.totalValue 
                    ? formatCurrency(data.totalValue) 
                    : 'N/A'}
                </StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel>Performance ({selectedTimeframe})</StatLabel>
                <StatNumber>
                  {data.performance 
                    ? formatPercentage(data.performance) 
                    : 'N/A'}
                </StatNumber>
                {data.performance && (
                  <StatHelpText>
                    <StatArrow 
                      type={data.performance >= 0 ? 'increase' : 'decrease'} 
                    />
                    {formatCurrency(data.performanceValue || 0)}
                  </StatHelpText>
                )}
              </Stat>
              
              <Stat>
                <StatLabel>Asset Count</StatLabel>
                <StatNumber>
                  {data.assetCount || 'N/A'}
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </Box>
        )}
        
        {/* Charts Grid */}
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={6}
          className="responsive-grid"
        >
          {/* Asset Allocation */}
          {data.assetAllocation && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>Asset Allocation</Heading>
              <Box height={`${height}px`}>
                {/* This is where we would render the Chart.js component */}
                {/* For this demo, we'll show a placeholder */}
                <Flex direction="column" h="100%" justifyContent="center" alignItems="center">
                  <Text textAlign="center" fontSize="sm" color="gray.500">
                    Asset allocation chart would be rendered here using Chart.js
                  </Text>
                </Flex>
              </Box>
            </Box>
          )}
          
          {/* Sector Allocation */}
          {data.sectorAllocation && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>Sector Allocation</Heading>
              <Box height={`${height}px`}>
                <Flex direction="column" h="100%" justifyContent="center" alignItems="center">
                  <Text textAlign="center" fontSize="sm" color="gray.500">
                    Sector allocation chart would be rendered here using Chart.js
                  </Text>
                </Flex>
              </Box>
            </Box>
          )}
          
          {/* Geographic Distribution */}
          {data.geographicDistribution && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>Geographic Distribution</Heading>
              <Box height={`${height}px`}>
                <Flex direction="column" h="100%" justifyContent="center" alignItems="center">
                  <Text textAlign="center" fontSize="sm" color="gray.500">
                    Geographic distribution chart would be rendered here using Chart.js
                  </Text>
                </Flex>
              </Box>
            </Box>
          )}
          
          {/* Performance History */}
          {data.performanceHistory && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>Performance History</Heading>
              <Box height={`${height}px`}>
                <Flex direction="column" h="100%" justifyContent="center" alignItems="center">
                  <Text textAlign="center" fontSize="sm" color="gray.500">
                    Performance history chart would be rendered here using Chart.js
                  </Text>
                </Flex>
              </Box>
            </Box>
          )}
          
          {/* Top Holdings */}
          {data.topHoldings && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>Top Holdings</Heading>
              <Box height={`${height}px`}>
                <Flex direction="column" h="100%" justifyContent="center" alignItems="center">
                  <Text textAlign="center" fontSize="sm" color="gray.500">
                    Top holdings chart would be rendered here using Chart.js
                  </Text>
                </Flex>
              </Box>
            </Box>
          )}
          
          {/* Risk Metrics */}
          {data.riskMetrics && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>Risk Metrics</Heading>
              <SimpleGrid columns={2} spacing={4}>
                {Object.entries(data.riskMetrics).map(([key, value]) => (
                  <Stat key={key} size="sm">
                    <StatLabel>{formatMetricName(key)}</StatLabel>
                    <StatNumber fontSize="lg">{value}</StatNumber>
                  </Stat>
                ))}
              </SimpleGrid>
            </Box>
          )}
          
          {/* ESG Metrics */}
          {data.esgMetrics && (
            <Box 
              p={4} 
              bg={cardBg} 
              borderRadius="md" 
              border="1px solid" 
              borderColor={borderColor}
            >
              <Heading size="sm" mb={4}>ESG Metrics</Heading>
              <SimpleGrid columns={2} spacing={4} mb={4}>
                <Stat size="sm">
                  <StatLabel>Environmental Score</StatLabel>
                  <StatNumber fontSize="lg">{data.esgMetrics.environmentalScore}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel>Social Score</StatLabel>
                  <StatNumber fontSize="lg">{data.esgMetrics.socialScore}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel>Governance Score</StatLabel>
                  <StatNumber fontSize="lg">{data.esgMetrics.governanceScore}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel>Overall ESG</StatLabel>
                  <StatNumber fontSize="lg">{data.esgMetrics.overallESGScore}</StatNumber>
                </Stat>
              </SimpleGrid>
              
              {data.esgMetrics.controversyFlag && (
                <Badge colorScheme={data.esgMetrics.controversyFlag === "None" ? "green" : "red"}>
                  Controversy: {data.esgMetrics.controversyFlag}
                </Badge>
              )}
            </Box>
          )}
        </SimpleGrid>
      </Box>
    </ResponsiveWrapper>
  );
};

export default PortfolioCharts;