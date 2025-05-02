import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiPieChart,
  FiBarChart2,
  FiDownload,
  FiExternalLink,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';

/**
 * Document Analysis component
 * @param {Object} props - Component props
 * @param {Object} props.analysisResult - Document analysis result
 * @param {boolean} props.isLoading - Whether the analysis is loading
 * @param {string} props.error - Error message if analysis failed
 * @param {Function} props.onDownload - Callback when download button is clicked
 * @param {Function} props.onViewDocument - Callback when view document button is clicked
 * @returns {JSX.Element} Document Analysis component
 */
const DocumentAnalysis = ({
  analysisResult,
  isLoading = false,
  error = null,
  onDownload,
  onViewDocument,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Format currency
  const formatCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get badge color based on asset class
  const getAssetClassColor = (assetClass) => {
    const assetClassColors = {
      'Equities': 'green',
      'Bonds': 'blue',
      'Cash': 'gray',
      'Liquidity': 'gray',
      'Real Estate': 'orange',
      'Alternatives': 'purple',
      'Commodities': 'yellow',
      'Structured products': 'pink',
    };
    
    return assetClassColors[assetClass] || 'gray';
  };

  // Loading state
  if (isLoading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color={accentColor} thickness="4px" speed="0.65s" />
        <Text mt={4} fontWeight="medium">Analyzing document...</Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          This may take a few moments depending on the document size and complexity
        </Text>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Analysis Failed
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No result state
  if (!analysisResult) {
    return (
      <Alert
        status="info"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          No Analysis Available
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Please upload a document to analyze.
        </AlertDescription>
      </Alert>
    );
  }

  // Extract data from analysis result
  const {
    document_info,
    portfolio,
    metrics,
    accuracy,
  } = analysisResult;

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"
    >
      {/* Document Info Header */}
      <Box p={6} borderBottom="1px" borderColor={borderColor}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="md" mb={1}>
              {document_info.document_name || 'Financial Document Analysis'}
            </Heading>
            <Flex align="center" color="gray.500" fontSize="sm">
              <Icon as={FiCalendar} mr={1} />
              <Text mr={4}>Document Date: {formatDate(document_info.document_date)}</Text>
              <Icon as={FiClock} mr={1} />
              <Text>Processed: {formatDate(document_info.processing_date)}</Text>
            </Flex>
          </Box>
          <Flex gap={2}>
            {onViewDocument && (
              <Button
                leftIcon={<FiExternalLink />}
                variant="outline"
                size="sm"
                onClick={onViewDocument}
              >
                View Document
              </Button>
            )}
            {onDownload && (
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                size="sm"
                onClick={onDownload}
              >
                Download Analysis
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Summary Stats */}
      <Grid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
        gap={4}
        p={6}
        bg={useColorModeValue('gray.50', 'gray.700')}
      >
        <Stat>
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiDollarSign} mr={1} />
            Total Value
          </StatLabel>
          <StatNumber>{formatCurrency(portfolio.total_value, portfolio.currency)}</StatNumber>
          <StatHelpText>Portfolio Total</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiFileText} mr={1} />
            Securities
          </StatLabel>
          <StatNumber>{metrics.total_securities}</StatNumber>
          <StatHelpText>Total Securities</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiPieChart} mr={1} />
            Asset Classes
          </StatLabel>
          <StatNumber>{metrics.total_asset_classes}</StatNumber>
          <StatHelpText>Distinct Classes</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiClock} mr={1} />
            Processing Time
          </StatLabel>
          <StatNumber>{document_info.processing_time.toFixed(2)}s</StatNumber>
          <StatHelpText>Analysis Duration</StatHelpText>
        </Stat>
      </Grid>

      {/* Tabs */}
      <Tabs
        variant="enclosed"
        colorScheme="blue"
        onChange={(index) => setActiveTab(index)}
        defaultIndex={0}
      >
        <TabList px={6} pt={4}>
          <Tab>Securities</Tab>
          <Tab>Asset Allocation</Tab>
          {accuracy && <Tab>Accuracy</Tab>}
          <Tab>Details</Tab>
        </TabList>
        
        <TabPanels>
          {/* Securities Tab */}
          <TabPanel p={6}>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>ISIN</Th>
                    <Th isNumeric>Quantity</Th>
                    <Th isNumeric>Price</Th>
                    <Th isNumeric>Value</Th>
                    <Th>Currency</Th>
                    <Th>Asset Class</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {portfolio.securities.map((security, index) => (
                    <Tr key={security.isin || index}>
                      <Td fontWeight="medium">{security.name}</Td>
                      <Td>{security.isin || 'N/A'}</Td>
                      <Td isNumeric>{security.quantity ? security.quantity.toLocaleString() : 'N/A'}</Td>
                      <Td isNumeric>{security.price ? formatCurrency(security.price, security.currency) : 'N/A'}</Td>
                      <Td isNumeric>{security.value ? formatCurrency(security.value, security.currency) : 'N/A'}</Td>
                      <Td>{security.currency || portfolio.currency}</Td>
                      <Td>
                        <Badge colorScheme={getAssetClassColor(security.asset_class)}>
                          {security.asset_class}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          
          {/* Asset Allocation Tab */}
          <TabPanel p={6}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
              <Box>
                <Heading size="sm" mb={4}>Asset Allocation</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Asset Class</Th>
                      <Th isNumeric>Value</Th>
                      <Th isNumeric>Weight</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(portfolio.asset_allocation).map(([assetClass, allocation]) => (
                      <Tr key={assetClass}>
                        <Td>
                          <Badge colorScheme={getAssetClassColor(assetClass)} mr={2}>
                            {assetClass}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          {allocation.value ? formatCurrency(allocation.value, portfolio.currency) : 'N/A'}
                        </Td>
                        <Td isNumeric>
                          {allocation.weight ? formatPercentage(allocation.weight) : 'N/A'}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              <Box>
                <Heading size="sm" mb={4}>Allocation Chart</Heading>
                <Box
                  height="250px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={4}
                >
                  <Text color="gray.500">
                    Asset allocation chart visualization would be displayed here
                  </Text>
                </Box>
              </Box>
            </Grid>
          </TabPanel>
          
          {/* Accuracy Tab */}
          {accuracy && (
            <TabPanel p={6}>
              <Heading size="sm" mb={4}>Analysis Accuracy</Heading>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
                <Box>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Metric</Th>
                        <Th isNumeric>Accuracy</Th>
                        <Th>Rating</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(accuracy).map(([key, value]) => (
                        <Tr key={key}>
                          <Td>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Td>
                          <Td isNumeric>{formatPercentage(value)}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                value >= 0.9 ? 'green' :
                                value >= 0.7 ? 'yellow' :
                                'red'
                              }
                            >
                              {value >= 0.9 ? 'High' : value >= 0.7 ? 'Medium' : 'Low'}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={4}>Accuracy Visualization</Heading>
                  <Box
                    height="250px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                  >
                    <Text color="gray.500">
                      Accuracy visualization would be displayed here
                    </Text>
                  </Box>
                </Box>
              </Grid>
            </TabPanel>
          )}
          
          {/* Details Tab */}
          <TabPanel p={6}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
              <Box>
                <Heading size="sm" mb={4}>Document Information</Heading>
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Th>Document Name</Th>
                      <Td>{document_info.document_name}</Td>
                    </Tr>
                    <Tr>
                      <Th>Document ID</Th>
                      <Td>{document_info.document_id}</Td>
                    </Tr>
                    <Tr>
                      <Th>Document Date</Th>
                      <Td>{formatDate(document_info.document_date)}</Td>
                    </Tr>
                    <Tr>
                      <Th>Processing Date</Th>
                      <Td>{formatDate(document_info.processing_date)}</Td>
                    </Tr>
                    <Tr>
                      <Th>Processing Time</Th>
                      <Td>{document_info.processing_time.toFixed(2)} seconds</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
              
              <Box>
                <Heading size="sm" mb={4}>Portfolio Metrics</Heading>
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Th>Total Value</Th>
                      <Td>{formatCurrency(portfolio.total_value, portfolio.currency)}</Td>
                    </Tr>
                    <Tr>
                      <Th>Currency</Th>
                      <Td>{portfolio.currency}</Td>
                    </Tr>
                    <Tr>
                      <Th>Total Securities</Th>
                      <Td>{metrics.total_securities}</Td>
                    </Tr>
                    <Tr>
                      <Th>Asset Classes</Th>
                      <Td>{metrics.total_asset_classes}</Td>
                    </Tr>
                    <Tr>
                      <Th>Average Security Value</Th>
                      <Td>
                        {formatCurrency(
                          portfolio.total_value / metrics.total_securities,
                          portfolio.currency
                        )}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default DocumentAnalysis;
