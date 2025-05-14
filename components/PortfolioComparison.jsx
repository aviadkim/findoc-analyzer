import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Grid,
  Stack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useBreakpointValue
} from '@chakra-ui/react';
import { ChevronDownIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import ResponsiveWrapper from './ResponsiveWrapper';

/**
 * PortfolioComparison Component
 * 
 * A responsive component for comparing multiple portfolios
 * 
 * @param {Object} props
 * @param {Array} props.portfolios - List of available portfolios for selection
 * @param {string} props.timeframe - Initial timeframe for comparison
 * @param {boolean} props.showPerformance - Whether to show performance metrics
 * @param {boolean} props.showDifferences - Whether to highlight differences
 */
const PortfolioComparison = ({
  portfolios = [],
  timeframe = '1y',
  showPerformance = true,
  showDifferences = true,
  ...props
}) => {
  // State
  const [selectedPortfolios, setSelectedPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  
  // Responsive layout helpers
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const statSize = useBreakpointValue({ base: 'sm', md: 'md' });
  
  // Colors
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightBg = useColorModeValue('yellow.50', 'yellow.900');
  const positiveBg = useColorModeValue('green.50', 'green.900');
  const negativeBg = useColorModeValue('red.50', 'red.900');
  
  // Available timeframes
  const timeframes = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' },
    { value: 'max', label: 'Max' }
  ];
  
  // Load comparison data when selected portfolios change
  useEffect(() => {
    const loadComparisonData = async () => {
      if (selectedPortfolios.length === 0) {
        setComparisonData(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // For this demo, we'll simulate a response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate comparison data
        const mockData = {
          summary: {
            totalValue: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                value: portfolio?.value || 0
              };
            }),
            performance: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                performance: Math.random() * 20 - 10, // Random performance between -10% and +10%
                performanceValue: (portfolio?.value || 0) * (Math.random() * 0.2 - 0.1)
              };
            }),
            assetCount: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                count: portfolio?.assetCount || 0
              };
            })
          },
          assetAllocation: {
            categories: ['Stocks', 'Bonds', 'Cash', 'Alternative'],
            allocations: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                values: [
                  Math.round(Math.random() * 60 + 30), // Stocks 30-90%
                  Math.round(Math.random() * 40 + 5),  // Bonds 5-45%
                  Math.round(Math.random() * 10 + 1),  // Cash 1-11%
                  Math.round(Math.random() * 5)        // Alternative 0-5%
                ]
              };
            })
          },
          sectorExposure: {
            sectors: ['Technology', 'Financial', 'Healthcare', 'Consumer', 'Industrial', 'Energy', 'Utilities', 'Materials', 'Real Estate', 'Communication'],
            exposures: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              
              // Generate random sector exposures that sum to 100%
              const randomValues = Array(10).fill(0).map(() => Math.random());
              const sum = randomValues.reduce((a, b) => a + b, 0);
              const normalizedValues = randomValues.map(v => Math.round((v / sum) * 100));
              
              // Ensure values sum to 100%
              const diff = 100 - normalizedValues.reduce((a, b) => a + b, 0);
              normalizedValues[0] += diff;
              
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                values: normalizedValues
              };
            })
          },
          topHoldings: {
            portfolios: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              
              // Generate random top holdings
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                holdings: [
                  { name: 'Apple Inc.', ticker: 'AAPL', weight: Math.random() * 8 + 2 },
                  { name: 'Microsoft Corp.', ticker: 'MSFT', weight: Math.random() * 7 + 1 },
                  { name: 'Amazon.com Inc.', ticker: 'AMZN', weight: Math.random() * 6 + 1 },
                  { name: 'Alphabet Inc.', ticker: 'GOOGL', weight: Math.random() * 5 + 1 },
                  { name: 'Meta Platforms Inc.', ticker: 'META', weight: Math.random() * 4 + 1 },
                  { name: 'Tesla Inc.', ticker: 'TSLA', weight: Math.random() * 4 + 0.5 },
                  { name: 'NVIDIA Corp.', ticker: 'NVDA', weight: Math.random() * 3 + 0.5 },
                  { name: 'Berkshire Hathaway', ticker: 'BRK.B', weight: Math.random() * 3 + 0.5 },
                  { name: 'UnitedHealth Group', ticker: 'UNH', weight: Math.random() * 2 + 0.5 },
                  { name: 'Johnson & Johnson', ticker: 'JNJ', weight: Math.random() * 2 + 0.5 }
                ].sort((a, b) => b.weight - a.weight) // Sort by weight
              };
            })
          },
          riskMetrics: {
            metrics: ['Volatility', 'Sharpe Ratio', 'Max Drawdown', 'Beta', 'Alpha'],
            values: selectedPortfolios.map(id => {
              const portfolio = portfolios.find(p => p.id === id);
              return {
                portfolioId: id,
                portfolioName: portfolio?.name || 'Unknown',
                values: [
                  (Math.random() * 10 + 5).toFixed(2) + '%',  // Volatility 5-15%
                  (Math.random() * 1.5 + 0.5).toFixed(2),     // Sharpe 0.5-2.0
                  (Math.random() * 20 + 10).toFixed(2) + '%', // Max Drawdown 10-30%
                  (Math.random() * 0.5 + 0.7).toFixed(2),     // Beta 0.7-1.2
                  (Math.random() * 4 - 2).toFixed(2) + '%'    // Alpha -2% to +2%
                ]
              };
            })
          }
        };
        
        setComparisonData(mockData);
      } catch (err) {
        console.error('Error loading comparison data:', err);
        setError('Failed to load portfolio comparison data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadComparisonData();
  }, [selectedPortfolios, portfolios, selectedTimeframe]);
  
  // Handle portfolio selection
  const handlePortfolioSelect = (portfolioId) => {
    if (selectedPortfolios.includes(portfolioId)) {
      setSelectedPortfolios(selectedPortfolios.filter(id => id !== portfolioId));
    } else {
      // Limit to max 3 portfolios for comparison
      if (selectedPortfolios.length < 3) {
        setSelectedPortfolios([...selectedPortfolios, portfolioId]);
      }
    }
  };
  
  // Change timeframe
  const handleTimeframeChange = (e) => {
    setSelectedTimeframe(e.target.value);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Calculate difference between portfolios and determine if it's significant
  const getDifference = (values) => {
    if (values.length < 2) return { difference: 0, isSignificant: false };
    
    const max = Math.max(...values);
    const min = Math.min(...values);
    const difference = max - min;
    
    // Consider significant if difference is >5% of the max value
    const isSignificant = difference > (max * 0.05);
    
    return { difference, isSignificant };
  };
  
  // Export comparison data
  const exportComparison = (format) => {
    // In a real app, this would trigger an API call or generate a file
    console.log(`Exporting comparison in ${format} format`);
    alert(`Comparison export in ${format} format would start here`);
  };
  
  return (
    <ResponsiveWrapper>
      <Box bg={bg} borderRadius="lg" shadow="md" p={4}>
        <Heading size="md" mb={4}>Portfolio Comparison</Heading>
        
        {/* Controls */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          mb={4}
          gap={3}
        >
          {/* Portfolio Selection */}
          <Box>
            <Text mb={2}>Select Portfolios to Compare (max 3):</Text>
            <Flex 
              gap={2} 
              flexWrap="wrap"
            >
              {portfolios.map(portfolio => (
                <Button
                  key={portfolio.id}
                  size="sm"
                  colorScheme={selectedPortfolios.includes(portfolio.id) ? "blue" : "gray"}
                  onClick={() => handlePortfolioSelect(portfolio.id)}
                  isDisabled={!selectedPortfolios.includes(portfolio.id) && selectedPortfolios.length >= 3}
                >
                  {portfolio.name}
                </Button>
              ))}
            </Flex>
          </Box>
          
          {/* Options */}
          <Flex gap={2} flexWrap="wrap">
            <Select 
              value={selectedTimeframe}
              onChange={handleTimeframeChange}
              size="sm"
              width={{ base: "100%", sm: "auto" }}
            >
              {timeframes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size="sm"
              >
                Export
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => exportComparison('csv')}>
                  <DownloadIcon mr={2} />
                  Export as CSV
                </MenuItem>
                <MenuItem onClick={() => exportComparison('excel')}>
                  <DownloadIcon mr={2} />
                  Export as Excel
                </MenuItem>
                <MenuItem onClick={() => exportComparison('pdf')}>
                  <DownloadIcon mr={2} />
                  Export as PDF
                </MenuItem>
              </MenuList>
            </Menu>
            
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Refresh comparison"
              size="sm"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
            />
          </Flex>
        </Flex>
        
        {/* Error message */}
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {/* Loading state */}
        {loading && (
          <Flex justify="center" align="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        )}
        
        {/* No portfolios selected */}
        {!loading && !comparisonData && (
          <Box textAlign="center" py={10}>
            <Text>Please select portfolios to compare.</Text>
          </Box>
        )}
        
        {/* Comparison data */}
        {!loading && comparisonData && (
          <Box>
            {/* Summary */}
            <Box mb={6}>
              <Heading size="sm" mb={4}>Portfolio Summary</Heading>
              <Grid 
                templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
                gap={4}
              >
                {/* Total Value */}
                <Box 
                  p={4} 
                  bg={bg} 
                  borderRadius="md" 
                  border="1px solid" 
                  borderColor={borderColor}
                >
                  <Text fontWeight="medium" mb={2}>Total Value</Text>
                  {comparisonData.summary.totalValue.map(item => (
                    <Stat key={item.portfolioId} size={statSize} mb={2}>
                      <StatLabel>{item.portfolioName}</StatLabel>
                      <StatNumber>{formatCurrency(item.value)}</StatNumber>
                    </Stat>
                  ))}
                </Box>
                
                {/* Performance */}
                {showPerformance && (
                  <Box 
                    p={4} 
                    bg={bg} 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor={borderColor}
                  >
                    <Text fontWeight="medium" mb={2}>Performance ({timeframes.find(t => t.value === selectedTimeframe)?.label})</Text>
                    {comparisonData.summary.performance.map(item => (
                      <Stat key={item.portfolioId} size={statSize} mb={2}>
                        <StatLabel>{item.portfolioName}</StatLabel>
                        <Flex align="center">
                          <StatNumber>{item.performance.toFixed(2)}%</StatNumber>
                          <StatArrow 
                            type={item.performance >= 0 ? 'increase' : 'decrease'} 
                            ml={1}
                          />
                        </Flex>
                        <StatHelpText>{formatCurrency(item.performanceValue)}</StatHelpText>
                      </Stat>
                    ))}
                  </Box>
                )}
                
                {/* Asset Count */}
                <Box 
                  p={4} 
                  bg={bg} 
                  borderRadius="md" 
                  border="1px solid" 
                  borderColor={borderColor}
                >
                  <Text fontWeight="medium" mb={2}>Number of Assets</Text>
                  {comparisonData.summary.assetCount.map(item => (
                    <Stat key={item.portfolioId} size={statSize} mb={2}>
                      <StatLabel>{item.portfolioName}</StatLabel>
                      <StatNumber>{item.count}</StatNumber>
                    </Stat>
                  ))}
                </Box>
              </Grid>
            </Box>
            
            {/* Detailed Comparison Tabs */}
            <Tabs variant="enclosed" onChange={setSelectedTab} index={selectedTab}>
              <TabList>
                <Tab>Asset Allocation</Tab>
                <Tab>Sector Exposure</Tab>
                <Tab>Top Holdings</Tab>
                <Tab>Risk Metrics</Tab>
              </TabList>
              
              <TabPanels>
                {/* Asset Allocation Tab */}
                <TabPanel px={0}>
                  <Box overflowX="auto">
                    <Table variant="simple" size={tableSize}>
                      <Thead>
                        <Tr>
                          <Th>Asset Class</Th>
                          {comparisonData.assetAllocation.allocations.map(portfolio => (
                            <Th key={portfolio.portfolioId} isNumeric>{portfolio.portfolioName}</Th>
                          ))}
                          {showDifferences && selectedPortfolios.length > 1 && <Th isNumeric>Difference</Th>}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {comparisonData.assetAllocation.categories.map((category, index) => {
                          // Get values for this category across portfolios
                          const values = comparisonData.assetAllocation.allocations.map(
                            portfolio => portfolio.values[index]
                          );
                          
                          // Calculate difference if needed
                          const { difference, isSignificant } = showDifferences && selectedPortfolios.length > 1 
                            ? getDifference(values) 
                            : { difference: 0, isSignificant: false };
                          
                          return (
                            <Tr 
                              key={category}
                              bg={isSignificant ? highlightBg : undefined}
                            >
                              <Td fontWeight="medium">{category}</Td>
                              {comparisonData.assetAllocation.allocations.map(portfolio => (
                                <Td key={portfolio.portfolioId} isNumeric>
                                  {portfolio.values[index]}%
                                </Td>
                              ))}
                              {showDifferences && selectedPortfolios.length > 1 && (
                                <Td isNumeric>
                                  {difference.toFixed(1)}%
                                  {isSignificant && (
                                    <Badge ml={2} colorScheme="yellow">Significant</Badge>
                                  )}
                                </Td>
                              )}
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
                
                {/* Sector Exposure Tab */}
                <TabPanel px={0}>
                  <Box overflowX="auto">
                    <Table variant="simple" size={tableSize}>
                      <Thead>
                        <Tr>
                          <Th>Sector</Th>
                          {comparisonData.sectorExposure.exposures.map(portfolio => (
                            <Th key={portfolio.portfolioId} isNumeric>{portfolio.portfolioName}</Th>
                          ))}
                          {showDifferences && selectedPortfolios.length > 1 && <Th isNumeric>Difference</Th>}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {comparisonData.sectorExposure.sectors.map((sector, index) => {
                          // Get values for this sector across portfolios
                          const values = comparisonData.sectorExposure.exposures.map(
                            portfolio => portfolio.values[index]
                          );
                          
                          // Calculate difference if needed
                          const { difference, isSignificant } = showDifferences && selectedPortfolios.length > 1 
                            ? getDifference(values) 
                            : { difference: 0, isSignificant: false };
                          
                          return (
                            <Tr 
                              key={sector}
                              bg={isSignificant ? highlightBg : undefined}
                            >
                              <Td fontWeight="medium">{sector}</Td>
                              {comparisonData.sectorExposure.exposures.map(portfolio => (
                                <Td key={portfolio.portfolioId} isNumeric>
                                  {portfolio.values[index]}%
                                </Td>
                              ))}
                              {showDifferences && selectedPortfolios.length > 1 && (
                                <Td isNumeric>
                                  {difference.toFixed(1)}%
                                  {isSignificant && (
                                    <Badge ml={2} colorScheme="yellow">Significant</Badge>
                                  )}
                                </Td>
                              )}
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
                
                {/* Top Holdings Tab */}
                <TabPanel px={0}>
                  <Grid 
                    templateColumns={{ base: "1fr", md: selectedPortfolios.length === 2 ? "repeat(2, 1fr)" : "repeat(3, 1fr)" }} 
                    gap={4}
                  >
                    {comparisonData.topHoldings.portfolios.map(portfolio => (
                      <Box 
                        key={portfolio.portfolioId}
                        p={4} 
                        bg={bg} 
                        borderRadius="md" 
                        border="1px solid" 
                        borderColor={borderColor}
                      >
                        <Heading size="sm" mb={3}>{portfolio.portfolioName}</Heading>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Security</Th>
                              <Th isNumeric>Weight</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {portfolio.holdings.slice(0, 10).map(holding => (
                              <Tr key={holding.ticker}>
                                <Td>
                                  <Text fontWeight="medium">{holding.name}</Text>
                                  <Text fontSize="xs" color="gray.500">{holding.ticker}</Text>
                                </Td>
                                <Td isNumeric>{holding.weight.toFixed(2)}%</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ))}
                  </Grid>
                </TabPanel>
                
                {/* Risk Metrics Tab */}
                <TabPanel px={0}>
                  <Box overflowX="auto">
                    <Table variant="simple" size={tableSize}>
                      <Thead>
                        <Tr>
                          <Th>Metric</Th>
                          {comparisonData.riskMetrics.values.map(portfolio => (
                            <Th key={portfolio.portfolioId}>{portfolio.portfolioName}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {comparisonData.riskMetrics.metrics.map((metric, index) => (
                          <Tr key={metric}>
                            <Td fontWeight="medium">{metric}</Td>
                            {comparisonData.riskMetrics.values.map(portfolio => (
                              <Td key={portfolio.portfolioId}>
                                {portfolio.values[index]}
                              </Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}
      </Box>
    </ResponsiveWrapper>
  );
};

export default PortfolioComparison;