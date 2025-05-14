import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  IconButton,
  SimpleGrid,
  Select,
  HStack,
  Tooltip,
  useColorModeValue,
  useColorMode,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Menu,
  MenuButton, 
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  InfoIcon, 
  DownloadIcon, 
  RepeatIcon 
} from '@chakra-ui/icons';
import ResponsiveWrapper from './ResponsiveWrapper';

/**
 * InteractivePortfolioVisualization Component
 * 
 * A React component for visualizing and analyzing portfolio data with
 * interactive features, drill-down capabilities, and comparison options.
 * 
 * @param {Object} props
 * @param {Object} props.portfolioData - Portfolio data to visualize
 * @param {string} props.defaultView - Default visualization view (allocation, sector, geography, etc.)
 * @param {Array} props.timeframes - Available timeframes for time-series analysis
 * @param {boolean} props.enableDrilldown - Whether to enable drill-down functionality
 * @param {boolean} props.enableComparison - Whether to enable comparison functionality
 * @param {function} props.onDataExport - Callback function for data export
 * @param {string} props.height - Component height
 * @param {string} props.width - Component width
 */
const InteractivePortfolioVisualization = ({
  portfolioData,
  defaultView = 'allocation',
  timeframes = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'],
  enableDrilldown = true,
  enableComparison = true,
  onDataExport,
  height = '600px',
  width = '100%',
  ...props
}) => {
  // State
  const [activeView, setActiveView] = useState(defaultView);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[3]); // Default to 1Y
  const [drilldownPath, setDrilldownPath] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonTimeframe, setComparisonTimeframe] = useState(null);
  const [chartType, setChartType] = useState('doughnut');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  
  // Chakra color mode and theming
  const { colorMode } = useColorMode();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  
  // Effect to load chart data - would be replaced with actual data processing logic
  useEffect(() => {
    if (!portfolioData) {
      setError("No portfolio data provided");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call/data processing
    const timer = setTimeout(() => {
      try {
        // In a real implementation, this would process the portfolio data
        // based on the active view, selected timeframe, etc.
        setLoading(false);
      } catch (err) {
        console.error("Error processing portfolio data:", err);
        setError("Failed to process portfolio data");
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [portfolioData, activeView, selectedTimeframe, drilldownPath, comparisonMode, comparisonTimeframe]);
  
  // Toggle comparison mode
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    
    // If enabling comparison, set default comparison timeframe
    if (!comparisonMode) {
      const currentIndex = timeframes.indexOf(selectedTimeframe);
      const prevIndex = Math.max(0, currentIndex - 1);
      setComparisonTimeframe(timeframes[prevIndex]);
    } else {
      setComparisonTimeframe(null);
    }
  };
  
  // Handle drill down
  const handleDrillDown = (category) => {
    if (!enableDrilldown) return;
    
    setDrilldownPath([...drilldownPath, {
      name: category,
      view: activeView,
      timeframe: selectedTimeframe
    }]);
  };
  
  // Handle drill up (go back one level)
  const handleDrillUp = () => {
    if (drilldownPath.length === 0) return;
    
    const newPath = [...drilldownPath];
    newPath.pop();
    setDrilldownPath(newPath);
  };
  
  // Reset to top level
  const resetDrilldown = () => {
    setDrilldownPath([]);
  };
  
  // Handle export
  const handleExport = (format) => {
    if (onDataExport) {
      onDataExport({
        view: activeView,
        timeframe: selectedTimeframe,
        comparisonTimeframe: comparisonTimeframe,
        drilldownPath,
        format,
        chartType
      });
    }
  };
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Render loading state
  if (loading) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          direction="column"
          p={5}
          bg={cardBg}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <Box className="spinner" mb={4}></Box>
          <Text>Loading portfolio data...</Text>
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
          p={5}
          bg="red.50"
          color="red.500"
          borderRadius="md"
          textAlign="center"
        >
          <Text fontWeight="bold">{error}</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render empty state if no portfolio data
  if (!portfolioData) {
    return (
      <ResponsiveWrapper width={width} height={height} {...props}>
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          h="100%" 
          p={5}
          bg={cardBg}
          color={textColor}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          textAlign="center"
        >
          <Text>No portfolio data available.</Text>
        </Flex>
      </ResponsiveWrapper>
    );
  }
  
  // Render the main component
  return (
    <ResponsiveWrapper width={width} height={height} {...props}>
      <Box>
        {/* Header with controls */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <Box>
            <Heading size="md" color={headingColor}>
              Portfolio Visualization
              {drilldownPath.length > 0 && (
                <Badge ml={2} colorScheme="blue">
                  {drilldownPath.length} level{drilldownPath.length > 1 ? 's' : ''} deep
                </Badge>
              )}
            </Heading>
            
            {/* Breadcrumb trail for drill-down */}
            {drilldownPath.length > 0 && (
              <Flex align="center" mt={1} fontSize="sm" color="gray.500">
                <Text 
                  cursor="pointer" 
                  onClick={resetDrilldown}
                  _hover={{ textDecoration: 'underline' }}
                >
                  Top Level
                </Text>
                {drilldownPath.map((level, index) => (
                  <React.Fragment key={index}>
                    <ChevronRightIcon mx={1} />
                    <Text 
                      cursor={index < drilldownPath.length - 1 ? "pointer" : "default"}
                      onClick={() => {
                        if (index < drilldownPath.length - 1) {
                          setDrilldownPath(drilldownPath.slice(0, index + 1));
                        }
                      }}
                      _hover={index < drilldownPath.length - 1 ? { textDecoration: 'underline' } : {}}
                    >
                      {level.name}
                    </Text>
                  </React.Fragment>
                ))}
              </Flex>
            )}
          </Box>
          
          <HStack spacing={2} wrap="wrap">
            {/* Timeframe selector */}
            <Select 
              size="sm" 
              width="auto" 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              {timeframes.map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </Select>
            
            {/* Comparison toggle */}
            {enableComparison && (
              <Button
                size="sm"
                variant={comparisonMode ? "solid" : "outline"}
                colorScheme={comparisonMode ? "purple" : "gray"}
                leftIcon={<RepeatIcon />}
                onClick={toggleComparisonMode}
              >
                Compare
              </Button>
            )}
            
            {/* Comparison timeframe selector */}
            {comparisonMode && (
              <Select 
                size="sm" 
                width="auto" 
                value={comparisonTimeframe || ''}
                onChange={(e) => setComparisonTimeframe(e.target.value)}
                placeholder="Compare to..."
              >
                {timeframes.filter(tf => tf !== selectedTimeframe).map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </Select>
            )}
            
            {/* Chart type selector */}
            <Select 
              size="sm" 
              width="auto" 
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="doughnut">Doughnut</option>
              <option value="pie">Pie</option>
              <option value="bar">Bar</option>
              <option value="line">Line</option>
            </Select>
            
            {/* Export menu */}
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                <DownloadIcon mr={1} />
                Export
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleExport('png')}>Export as Image</MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
                <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
                <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Navigation tabs for different views */}
        <Tabs 
          variant="enclosed" 
          mb={4} 
          index={['allocation', 'sector', 'geography', 'performance'].indexOf(activeView)}
          onChange={(index) => setActiveView(['allocation', 'sector', 'geography', 'performance'][index])}
        >
          <TabList>
            <Tab>Asset Allocation</Tab>
            <Tab>Sector Breakdown</Tab>
            <Tab>Geographic Distribution</Tab>
            <Tab>Performance</Tab>
          </TabList>
          
          <TabPanels>
            {/* Asset Allocation Tab */}
            <TabPanel p={0} pt={4}>
              {portfolioData && (
                <>
                  {/* Summary cards */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                    <Stat
                      p={4}
                      bg={cardBg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={borderColor}
                      boxShadow="sm"
                    >
                      <StatLabel>Total Value</StatLabel>
                      <StatNumber>
                        {formatCurrency(portfolioData.summary?.totalValue || 0)}
                      </StatNumber>
                      <StatHelpText>
                        As of {portfolioData.summary?.asOfDate || 'N/A'}
                      </StatHelpText>
                    </Stat>
                    
                    <Stat
                      p={4}
                      bg={cardBg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={borderColor}
                      boxShadow="sm"
                    >
                      <StatLabel>YTD Performance</StatLabel>
                      <StatNumber>
                        {(portfolioData.summary?.performanceYTD || 0).toFixed(2)}%
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type={(portfolioData.summary?.performanceYTD || 0) >= 0 ? 'increase' : 'decrease'} />
                        Year to date
                      </StatHelpText>
                    </Stat>
                    
                    <Stat
                      p={4}
                      bg={cardBg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={borderColor}
                      boxShadow="sm"
                    >
                      <StatLabel>Expense Ratio</StatLabel>
                      <StatNumber>
                        {(portfolioData.summary?.expenseRatio || 0).toFixed(2)}%
                      </StatNumber>
                      <StatHelpText>
                        Weighted average
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                  
                  {/* Visualization */}
                  <Box 
                    height="300px" 
                    bg={cardBg}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={borderColor}
                    mb={4}
                    position="relative"
                  >
                    <Flex align="center" justify="center" h="100%">
                      <Text textAlign="center" color="gray.500">
                        Asset allocation visualization would be rendered here using Chart.js
                        {comparisonMode && ' with comparison to ' + comparisonTimeframe}
                      </Text>
                    </Flex>
                    
                    {drilldownPath.length > 0 && (
                      <Button
                        position="absolute"
                        top={4}
                        left={4}
                        size="sm"
                        leftIcon={<ChevronRightIcon transform="rotate(180deg)" />}
                        onClick={handleDrillUp}
                      >
                        Go Back
                      </Button>
                    )}
                  </Box>
                  
                  {/* Data table */}
                  <Box 
                    bg={cardBg}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={borderColor}
                    overflow="hidden"
                  >
                    <Heading size="sm" p={4} borderBottomWidth="1px" borderColor={borderColor}>
                      Asset Allocation Breakdown
                    </Heading>
                    
                    <Box as="table" w="100%" style={{ borderCollapse: 'collapse' }}>
                      <Box as="thead" bg={useColorModeValue('gray.50', 'gray.700')}>
                        <Box as="tr">
                          <Box as="th" textAlign="left" p={4}>Asset Class</Box>
                          <Box as="th" textAlign="right" p={4}>Value</Box>
                          <Box as="th" textAlign="right" p={4}>Percentage</Box>
                          <Box as="th" textAlign="center" p={4}>Actions</Box>
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {portfolioData.holdings.map((asset, index) => (
                          <Box 
                            as="tr" 
                            key={index}
                            borderTopWidth="1px"
                            borderColor={borderColor}
                            _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                          >
                            <Box as="td" p={4}>
                              {asset.name}
                            </Box>
                            <Box as="td" textAlign="right" p={4}>
                              {formatCurrency(asset.value)}
                            </Box>
                            <Box as="td" textAlign="right" p={4}>
                              {(asset.value / portfolioData.summary.totalValue * 100).toFixed(2)}%
                            </Box>
                            <Box as="td" textAlign="center" p={4}>
                              {enableDrilldown && asset.subHoldings && asset.subHoldings.length > 0 && (
                                <Button
                                  size="sm"
                                  rightIcon={<ChevronRightIcon />}
                                  onClick={() => handleDrillDown(asset.name)}
                                >
                                  Details
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </TabPanel>
            
            {/* Sector Breakdown Tab */}
            <TabPanel p={0} pt={4}>
              <Flex 
                align="center" 
                justify="center" 
                h="200px" 
                bg={cardBg}
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <Text>Sector breakdown visualization would be rendered here</Text>
              </Flex>
            </TabPanel>
            
            {/* Geographic Distribution Tab */}
            <TabPanel p={0} pt={4}>
              <Flex 
                align="center" 
                justify="center" 
                h="200px" 
                bg={cardBg}
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <Text>Geographic distribution visualization would be rendered here</Text>
              </Flex>
            </TabPanel>
            
            {/* Performance Tab */}
            <TabPanel p={0} pt={4}>
              <Flex 
                align="center" 
                justify="center" 
                h="200px" 
                bg={cardBg}
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <Text>Performance visualization would be rendered here</Text>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Help & Information */}
        <Accordion allowToggle>
          <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md">
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Flex align="center">
                    <InfoIcon mr={2} />
                    <Text>About This Visualization</Text>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              <Text mb={2}>
                This interactive visualization allows you to explore your portfolio data from different perspectives:
              </Text>
              <Box as="ul" pl={5} styleType="disc">
                <Box as="li" mb={1}>Asset Allocation: View your portfolio breakdown by asset class</Box>
                <Box as="li" mb={1}>Sector Breakdown: Analyze exposure across different market sectors</Box>
                <Box as="li" mb={1}>Geographic Distribution: See regional allocation of investments</Box>
                <Box as="li" mb={1}>Performance: Track historical performance across different timeframes</Box>
              </Box>
              <Text mt={2}>
                Use the drill-down features to explore specific categories in more detail, and the comparison
                mode to analyze changes over different time periods.
              </Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </ResponsiveWrapper>
  );
};

export default InteractivePortfolioVisualization;