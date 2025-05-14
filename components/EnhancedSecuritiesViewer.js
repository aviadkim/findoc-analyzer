import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useToast,
  IconButton,
  Switch,
  Badge,
  Text,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Stack,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiArrowUp,
  FiArrowDown,
  FiDownload,
  FiPlus,
  FiInfo,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiBarChart2,
  FiMoreVertical,
  FiSettings,
  FiClock
} from 'react-icons/fi';
import AccessibilityWrapper from './AccessibilityWrapper';

const EnhancedSecuritiesViewer = ({ documentId, readOnly = false }) => {
  // State variables
  const [securities, setSecurities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showMarketValues, setShowMarketValues] = useState(true);
  const [refreshingMarketData, setRefreshingMarketData] = useState(false);
  const [marketDataProvider, setMarketDataProvider] = useState('yahoo');
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [selectedSecurity, setSelectedSecurity] = useState(null);
  const [priceChartData, setPriceChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('1m');
  const [totalPortfolioValue, setTotalPortfolioValue] = useState({ document: 0, market: 0 });
  const [marketDataStats, setMarketDataStats] = useState({ available: 0, total: 0 });
  const [refreshingSecurityId, setRefreshingSecurityId] = useState(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isSecurityDetailOpen, 
    onOpen: onSecurityDetailOpen, 
    onClose: onSecurityDetailClose 
  } = useDisclosure();
  const {
    isOpen: isRefreshAlertOpen,
    onOpen: onRefreshAlertOpen,
    onClose: onRefreshAlertClose
  } = useDisclosure();
  
  const {
    isOpen: isExportModalOpen,
    onOpen: onExportModalOpen,
    onClose: onExportModalClose
  } = useDisclosure();
  
  const toast = useToast();
  const cancelRef = React.useRef();

  // Fetch securities data
  useEffect(() => {
    const fetchSecurities = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/financial/securities';
        
        if (documentId) {
          endpoint = `/api/documents/${documentId}/securities`;
        }
        
        const response = await axios.get(endpoint);
        
        if (response.data && Array.isArray(response.data.securities)) {
          const fetchedSecurities = response.data.securities;
          setSecurities(fetchedSecurities);
          
          // Update market data statistics
          const marketDataCount = fetchedSecurities.filter(s => s.marketPrice !== undefined).length;
          setMarketDataStats({
            available: marketDataCount,
            total: fetchedSecurities.length
          });
          
          // Calculate portfolio totals
          calculatePortfolioTotals(fetchedSecurities);
          
          setLastRefreshTime(new Date());
        } else {
          setSecurities([]);
          console.warn('Unexpected data format:', response.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching securities:', err);
        setError('Failed to load securities data. Please try again later.');
        setSecurities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurities();
  }, [documentId]);

  // Calculate portfolio totals
  const calculatePortfolioTotals = (securitiesData) => {
    const totals = securitiesData.reduce(
      (acc, security) => {
        // Document value total
        if (security.value !== undefined && security.value !== null) {
          acc.document += parseFloat(security.value);
        }
        
        // Market value total
        if (security.marketValue !== undefined && security.marketValue !== null) {
          acc.market += parseFloat(security.marketValue);
        } else if (security.value !== undefined && security.value !== null) {
          // Fall back to document value if market value is not available
          acc.market += parseFloat(security.value);
        }
        
        return acc;
      },
      { document: 0, market: 0 }
    );
    
    setTotalPortfolioValue(totals);
  };

  // Handle sort click
  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Edit security
  const handleEditClick = (security) => {
    setEditingId(security.id);
    setEditFormData({...security});
    onOpen();
  };

  // Save edited security
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/financial/securities/${editingId}`, editFormData);
      
      if (response.data && response.data.success) {
        // Update the securities array with edited security
        const updatedSecurities = securities.map(sec => 
          sec.id === editingId ? {...sec, ...editFormData} : sec
        );
        
        setSecurities(updatedSecurities);
        
        // Recalculate portfolio totals
        calculatePortfolioTotals(updatedSecurities);
        
        toast({
          title: 'Security updated',
          description: 'The security was successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
      setEditingId(null);
    } catch (err) {
      console.error('Error updating security:', err);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the security.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change in edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Refresh market data
  const refreshMarketData = async () => {
    try {
      setRefreshingMarketData(true);
      
      // Trigger refresh from server
      const response = await axios.put('/api/market-data/update-securities', {
        securities,
        provider: marketDataProvider,
        forceRefresh: true
      });
      
      if (response.data && response.data.success) {
        const updatedSecurities = response.data.data.securities;
        setSecurities(updatedSecurities);
        
        // Update market data statistics
        const marketDataCount = updatedSecurities.filter(s => s.marketPrice !== undefined).length;
        setMarketDataStats({
          available: marketDataCount,
          total: updatedSecurities.length
        });
        
        // Recalculate portfolio totals
        calculatePortfolioTotals(updatedSecurities);
        
        setLastRefreshTime(new Date());
        
        toast({
          title: 'Market data refreshed',
          description: `Updated prices for ${response.data.data.marketPricesAdded} securities.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error refreshing market data:', err);
      toast({
        title: 'Refresh failed',
        description: 'There was an error refreshing market data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRefreshingMarketData(false);
    }
  };

  // Refresh single security market data
  const refreshSingleSecurityData = async (security) => {
    try {
      setRefreshingSecurityId(security.id || security.isin);
      
      // Get current price from API
      const response = await axios.get(`/api/market-data/price/${security.isin}`, {
        params: {
          provider: marketDataProvider,
          forceRefresh: true
        }
      });
      
      if (response.data && response.data.success) {
        const priceData = response.data.data;
        
        // Update the security with new market data
        const updatedSecurity = {
          ...security,
          marketPrice: priceData.price,
          marketValue: security.quantity ? security.quantity * priceData.price : null,
          priceChange: priceData.change,
          priceChangePercent: priceData.changePercent,
          lastUpdated: new Date().toISOString(),
          dataProvider: priceData.provider
        };
        
        // Update securities array
        const updatedSecurities = securities.map(sec => 
          (sec.id === security.id || sec.isin === security.isin) ? updatedSecurity : sec
        );
        
        setSecurities(updatedSecurities);
        
        // Update market data statistics
        const marketDataCount = updatedSecurities.filter(s => s.marketPrice !== undefined).length;
        setMarketDataStats({
          available: marketDataCount,
          total: updatedSecurities.length
        });
        
        // Recalculate portfolio totals
        calculatePortfolioTotals(updatedSecurities);
        
        toast({
          title: 'Security price updated',
          description: `Updated price: ${formatCurrency(priceData.price, security.currency)}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // If this was the selected security, update it
        if (selectedSecurity && (selectedSecurity.id === security.id || selectedSecurity.isin === security.isin)) {
          setSelectedSecurity(updatedSecurity);
        }
      }
    } catch (err) {
      console.error('Error refreshing security market data:', err);
      toast({
        title: 'Refresh failed',
        description: 'There was an error refreshing market data for this security.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRefreshingSecurityId(null);
    }
  };

  // View security details
  const viewSecurityDetails = async (security) => {
    setSelectedSecurity(security);
    
    // Load price chart data
    loadPriceChart(security.isin, chartPeriod);
    
    // Open detail modal
    onSecurityDetailOpen();
  };

  // Load price chart data
  const loadPriceChart = async (isin, period = '1m') => {
    try {
      setChartLoading(true);
      
      // Get historical price data from API
      const response = await axios.get(`/api/market-data/historical/${isin}`, {
        params: {
          period,
          interval: '1d',
          provider: marketDataProvider
        }
      });
      
      if (response.data && response.data.success) {
        setPriceChartData(response.data.data.historicalData || []);
        setChartPeriod(period);
      } else {
        setPriceChartData([]);
      }
    } catch (err) {
      console.error('Error loading price chart data:', err);
      setPriceChartData([]);
      toast({
        title: 'Chart data loading failed',
        description: 'Could not load historical price data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setChartLoading(false);
    }
  };

  // Filter and sort securities
  const filteredAndSortedSecurities = useMemo(() => {
    // First filter by search query
    let result = securities.filter(security => {
      const searchLower = searchQuery.toLowerCase();
      return (
        security.isin?.toLowerCase().includes(searchLower) ||
        security.name?.toLowerCase().includes(searchLower) ||
        security.type?.toLowerCase().includes(searchLower) ||
        security.description?.toLowerCase().includes(searchLower)
      );
    });

    // Then filter by category
    if (filter !== 'all') {
      result = result.filter(security => security.type === filter);
    }

    // Finally sort
    return result.sort((a, b) => {
      let aValue, bValue;
      
      // Special handling for market-related fields
      if (sortField === 'marketPrice') {
        aValue = a.marketPrice !== undefined ? a.marketPrice : a.price;
        bValue = b.marketPrice !== undefined ? b.marketPrice : b.price;
      } else if (sortField === 'marketValue') {
        aValue = a.marketValue !== undefined ? a.marketValue : a.value;
        bValue = b.marketValue !== undefined ? b.marketValue : b.value;
      } else if (sortField === 'priceChange') {
        aValue = a.priceChange || 0;
        bValue = b.priceChange || 0;
      } else if (sortField === 'priceChangePercent') {
        aValue = a.priceChangePercent || 0;
        bValue = b.priceChangePercent || 0;
      } else {
        // Standard fields
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
      }
      
      // Handle numeric values
      if (['quantity', 'price', 'value', 'marketPrice', 'marketValue', 'priceChange', 'priceChangePercent'].includes(sortField)) {
        return sortDirection === 'asc' 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      // Handle string values
      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
  }, [securities, searchQuery, filter, sortField, sortDirection]);

  // Get unique security types for filter dropdown
  const securityTypes = useMemo(() => {
    const types = new Set(securities.map(security => security.type).filter(Boolean));
    return Array.from(types);
  }, [securities]);

  // State for export options
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeMetadata: true,
    includeMarketData: true,
    onlyEssentialFields: false,
    includeLogo: false,
    scheduleExport: false,
    scheduleFrequency: 'daily',
    scheduleTime: '09:00'
  });
  
  // Handle export option changes
  const handleExportOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExportOptions({
      ...exportOptions,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Export securities using API
  const exportSecurities = async (format, options = {}) => {
    try {
      toast({
        title: 'Starting export...',
        description: `Preparing ${format.toUpperCase()} export`,
        status: 'info',
        duration: 2000,
      });
      
      const defaultOptions = {
        includeMetadata: true,
        includeMarketData: showMarketValues,
        onlyEssentialFields: false,
        fileName: `securities_export_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xlsx' : format}`
      };
      
      const mergedOptions = { ...defaultOptions, ...exportOptions, ...options };
      
      // If this component is displaying a specific document's securities
      if (documentId) {
        const response = await axios.post(`/api/securities-export/document/${documentId}`, {
          format,
          options: mergedOptions
        });
        
        if (response.data && response.data.success) {
          toast({
            title: 'Export successful',
            description: `The data has been exported to ${format.toUpperCase()}`,
            status: 'success',
            duration: 3000,
          });
          
          // Schedule export if requested
          if (mergedOptions.scheduleExport) {
            scheduleExport(format, mergedOptions);
          }
          
          // Trigger download
          window.location.href = response.data.export.downloadUrl;
        } else {
          throw new Error('Export failed');
        }
      } else {
        // If no specific document, use client-side export
        performClientSideExport(format, mergedOptions);
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      toast({
        title: 'Export failed',
        description: `There was an error exporting to ${format.toUpperCase()}`,
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Schedule export API call
  const scheduleExport = async (format, options) => {
    try {
      const response = await axios.post('/api/securities-export/schedule', {
        documentId,
        format,
        schedule: {
          frequency: options.scheduleFrequency,
          time: options.scheduleTime
        },
        options: {
          includeMetadata: options.includeMetadata,
          includeMarketData: options.includeMarketData,
          onlyEssentialFields: options.onlyEssentialFields,
          includeLogo: options.includeLogo
        }
      });
      
      if (response.data && response.data.success) {
        toast({
          title: 'Export scheduled',
          description: `The export has been scheduled with ${options.scheduleFrequency} frequency`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error scheduling export:', error);
      toast({
        title: 'Scheduling failed',
        description: 'There was an error scheduling the export',
        status: 'error',
        duration: 5000,
      });
    }
  };
  
  // Client-side CSV export as fallback
  const performClientSideExport = (format, options) => {
    if (format === 'csv') {
      exportToCSV(options);
    } else {
      toast({
        title: 'Export not supported',
        description: `Client-side export to ${format.toUpperCase()} is not supported. Please use the server-side export.`,
        status: 'warning',
        duration: 5000,
      });
    }
  };
  
  // Client-side CSV export
  const exportToCSV = (options) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers - include both document and market values
    const headers = [
      "ISIN", "Name", "Type", "Quantity", 
      "Document Price", "Document Value"
    ];
    
    // Add market data headers if requested
    if (options.includeMarketData) {
      headers.push(
        "Market Price", "Market Value", 
        "Price Change", "Change %"
      );
    }
    
    // Add remaining headers
    headers.push("Currency", "Last Updated");
    
    csvContent += headers.join(",") + "\n";
    
    // Data
    filteredAndSortedSecurities.forEach(security => {
      let row = [
        security.isin || "",
        `"${(security.name || "").replace(/"/g, '""')}"`, // Escape quotes in names
        security.type || "",
        security.quantity || "",
        security.price || "",
        security.value || ""
      ];
      
      // Add market data if requested
      if (options.includeMarketData) {
        row.push(
          security.marketPrice || "",
          security.marketValue || "",
          security.priceChange || "",
          security.priceChangePercent ? `${security.priceChangePercent}%` : ""
        );
      }
      
      // Add remaining data
      row.push(
        security.currency || "",
        security.lastUpdated || ""
      );
      
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", options.fileName || `securities_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency value with appropriate formatting
  const formatCurrency = (value, currency = 'USD') => {
    if (value === undefined || value === null) return '-';
    
    try {
      const numValue = parseFloat(value);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numValue);
    } catch (e) {
      return value;
    }
  };

  // Format percentage with appropriate formatting
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '-';
    
    try {
      const numValue = parseFloat(value);
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numValue / 100);
    } catch (e) {
      return value;
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Determine color based on price change
  const getPriceChangeColor = (change) => {
    if (!change) return 'gray.500';
    return parseFloat(change) >= 0 ? 'green.500' : 'red.500';
  };

  return (
    <AccessibilityWrapper>
      <Box className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Heading size="md" mb={4}>Securities Information</Heading>
        
        {/* Market data toggle and refresh */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          mb={4}
          gap={3}
        >
          <Flex align="center" gap={2}>
            <Text>Show Market Values</Text>
            <Switch 
              isChecked={showMarketValues} 
              onChange={() => setShowMarketValues(!showMarketValues)} 
              colorScheme="blue"
              size="md"
            />
          </Flex>
          
          {showMarketValues && (
            <Flex align="center" gap={2}>
              <Select 
                size="sm"
                value={marketDataProvider}
                onChange={(e) => setMarketDataProvider(e.target.value)}
                width="150px"
              >
                <option value="yahoo">Yahoo Finance</option>
                <option value="alphavantage">Alpha Vantage</option>
                <option value="finnhub">Finnhub</option>
                <option value="polygon">Polygon</option>
              </Select>
              
              <Button
                leftIcon={<FiRefreshCw />}
                size="sm"
                colorScheme="blue"
                onClick={onRefreshAlertOpen}
                isLoading={refreshingMarketData}
                loadingText="Refreshing"
              >
                Refresh Market Data
              </Button>
              
              {lastRefreshTime && (
                <Tooltip label={`Last refreshed at ${lastRefreshTime.toLocaleTimeString()}`}>
                  <Flex align="center" fontSize="xs" color="gray.500">
                    <FiClock style={{ marginRight: '4px' }} />
                    {lastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Flex>
                </Tooltip>
              )}
            </Flex>
          )}
        </Flex>
        
        {/* Portfolio summary */}
        {showMarketValues && (
          <Box mb={4} p={3} bg="gray.50" borderRadius="md">
            <Heading size="sm" mb={2}>Portfolio Summary</Heading>
            <Flex 
              direction={{ base: "column", md: "row" }} 
              justify="space-between"
              gap={3}
            >
              <Stat>
                <StatLabel>Document Value</StatLabel>
                <StatNumber>{formatCurrency(totalPortfolioValue.document)}</StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel>Market Value</StatLabel>
                <StatNumber>{formatCurrency(totalPortfolioValue.market)}</StatNumber>
                {totalPortfolioValue.document > 0 && (
                  <StatHelpText>
                    <StatArrow 
                      type={totalPortfolioValue.market >= totalPortfolioValue.document ? 'increase' : 'decrease'} 
                    />
                    {Math.abs((totalPortfolioValue.market / totalPortfolioValue.document - 1) * 100).toFixed(2)}%
                  </StatHelpText>
                )}
              </Stat>
              
              <Stat>
                <StatLabel>Securities with Market Data</StatLabel>
                <StatNumber>{marketDataStats.available} / {marketDataStats.total}</StatNumber>
                <StatHelpText>
                  {((marketDataStats.available / marketDataStats.total) * 100).toFixed(0)}% Coverage
                </StatHelpText>
                <Progress 
                  value={(marketDataStats.available / marketDataStats.total) * 100}
                  size="xs"
                  colorScheme="blue"
                  mt={1}
                />
              </Stat>
            </Flex>
          </Box>
        )}
        
        {/* Search and filter controls */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          mb={4}
          gap={3}
        >
          <InputGroup maxW={{ base: "100%", md: "300px" }}>
            <Input
              placeholder="Search securities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pr="4rem"
            />
            <InputRightElement width="4rem">
              <FiSearch className="mr-2" />
            </InputRightElement>
          </InputGroup>
          
          <Flex gap={3}>
            <Select 
              maxW="200px"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {securityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            
            <Menu>
              <Tooltip label="Export Data">
                <MenuButton
                  as={IconButton}
                  icon={<FiDownload />}
                  aria-label="Export Data"
                  isDisabled={filteredAndSortedSecurities.length === 0}
                />
              </Tooltip>
              <MenuList>
                <MenuItem onClick={onExportModalOpen}>
                  <Flex align="center">
                    <FiSettings style={{ marginRight: '8px' }} />
                    Advanced Export Options
                  </Flex>
                </MenuItem>
                <MenuItem onClick={() => exportSecurities('csv')}>
                  <Flex align="center">
                    <FiDownload style={{ marginRight: '8px' }} />
                    Quick Export to CSV
                  </Flex>
                </MenuItem>
                <MenuItem onClick={() => exportSecurities('excel')}>
                  <Flex align="center">
                    <FiDownload style={{ marginRight: '8px' }} />
                    Quick Export to Excel
                  </Flex>
                </MenuItem>
                <MenuItem onClick={() => exportSecurities('pdf')}>
                  <Flex align="center">
                    <FiDownload style={{ marginRight: '8px' }} />
                    Quick Export to PDF
                  </Flex>
                </MenuItem>
                <MenuItem onClick={() => exportSecurities('json')}>
                  <Flex align="center">
                    <FiDownload style={{ marginRight: '8px' }} />
                    Quick Export to JSON
                  </Flex>
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
        
        {/* Status indicators */}
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="sm" color="gray.600">
            {filteredAndSortedSecurities.length} securities found
          </Text>
          
          {loading && (
            <Flex align="center">
              <Spinner size="sm" mr={2} />
              <Text fontSize="sm">Loading data...</Text>
            </Flex>
          )}
        </Flex>
        
        {/* Error message */}
        {error && (
          <Box mb={4} p={3} bg="red.50" color="red.600" borderRadius="md">
            <Flex align="center">
              <FiXCircle className="mr-2" />
              <Text>{error}</Text>
            </Flex>
          </Box>
        )}
        
        {/* Securities table */}
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSortClick('isin')}
                >
                  <Flex align="center">
                    ISIN
                    {sortField === 'isin' && (
                      sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                    )}
                  </Flex>
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSortClick('name')}
                >
                  <Flex align="center">
                    Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                    )}
                  </Flex>
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSortClick('type')}
                >
                  <Flex align="center">
                    Type
                    {sortField === 'type' && (
                      sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                    )}
                  </Flex>
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSortClick('quantity')}
                  isNumeric
                >
                  <Flex align="center" justify="flex-end">
                    Quantity
                    {sortField === 'quantity' && (
                      sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                    )}
                  </Flex>
                </Th>
                
                {/* Conditional columns based on view mode */}
                {showMarketValues ? (
                  <>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSortClick('price')}
                      isNumeric
                    >
                      <Flex align="center" justify="flex-end">
                        Doc. Price
                        {sortField === 'price' && (
                          sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSortClick('marketPrice')}
                      isNumeric
                    >
                      <Flex align="center" justify="flex-end">
                        Market Price
                        {sortField === 'marketPrice' && (
                          sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSortClick('priceChangePercent')}
                      isNumeric
                    >
                      <Flex align="center" justify="flex-end">
                        Change %
                        {sortField === 'priceChangePercent' && (
                          sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSortClick('marketValue')}
                      isNumeric
                    >
                      <Flex align="center" justify="flex-end">
                        Market Value
                        {sortField === 'marketValue' && (
                          sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                        )}
                      </Flex>
                    </Th>
                  </>
                ) : (
                  <>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSortClick('price')}
                      isNumeric
                    >
                      <Flex align="center" justify="flex-end">
                        Price
                        {sortField === 'price' && (
                          sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSortClick('value')}
                      isNumeric
                    >
                      <Flex align="center" justify="flex-end">
                        Value
                        {sortField === 'value' && (
                          sortDirection === 'asc' ? <FiArrowUp ml={1} /> : <FiArrowDown ml={1} />
                        )}
                      </Flex>
                    </Th>
                  </>
                )}
                
                <Th>Currency</Th>
                {!readOnly && <Th>Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {filteredAndSortedSecurities.length > 0 ? (
                filteredAndSortedSecurities.map(security => (
                  <Tr key={security.id || security.isin}>
                    <Td>
                      <Tooltip label={security.isin || 'N/A'}>
                        <Text isTruncated maxW="100px">
                          {security.isin || 'N/A'}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label={security.name || 'N/A'}>
                        <Text 
                          isTruncated 
                          maxW="200px" 
                          cursor="pointer" 
                          color="blue.600"
                          onClick={() => viewSecurityDetails(security)}
                          textDecoration="underline"
                        >
                          {security.name || 'N/A'}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Badge colorScheme={getTypeColor(security.type)}>
                        {security.type || 'Unknown'}
                      </Badge>
                    </Td>
                    <Td isNumeric>{security.quantity || 'N/A'}</Td>
                    
                    {/* Conditional columns based on view mode */}
                    {showMarketValues ? (
                      <>
                        <Td isNumeric>{security.price ? formatCurrency(security.price, security.currency) : 'N/A'}</Td>
                        <Td isNumeric>
                          <Text color={security.marketPrice ? 'black' : 'gray.500'}>
                            {security.marketPrice 
                              ? formatCurrency(security.marketPrice, security.currency) 
                              : (security.price ? formatCurrency(security.price, security.currency) : 'N/A')}
                          </Text>
                        </Td>
                        <Td isNumeric>
                          <Flex justify="flex-end" align="center">
                            {security.priceChangePercent ? (
                              <Text color={getPriceChangeColor(security.priceChangePercent)}>
                                {security.priceChangePercent > 0 ? '+' : ''}
                                {security.priceChangePercent.toFixed(2)}%
                              </Text>
                            ) : (
                              <Text color="gray.500">-</Text>
                            )}
                          </Flex>
                        </Td>
                        <Td isNumeric>
                          <Text color={security.marketValue ? 'black' : 'gray.500'}>
                            {security.marketValue 
                              ? formatCurrency(security.marketValue, security.currency) 
                              : (security.value ? formatCurrency(security.value, security.currency) : 'N/A')}
                          </Text>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td isNumeric>{security.price ? formatCurrency(security.price, security.currency) : 'N/A'}</Td>
                        <Td isNumeric>{security.value ? formatCurrency(security.value, security.currency) : 'N/A'}</Td>
                      </>
                    )}
                    
                    <Td>{security.currency || 'N/A'}</Td>
                    {!readOnly && (
                      <Td>
                        <Flex>
                          <IconButton
                            size="sm"
                            colorScheme="blue"
                            icon={<FiEdit2 />}
                            onClick={() => handleEditClick(security)}
                            aria-label="Edit security"
                            mr={1}
                          />
                          
                          {showMarketValues && (
                            <IconButton
                              size="sm"
                              colorScheme="green"
                              icon={<FiRefreshCw />}
                              onClick={() => refreshSingleSecurityData(security)}
                              aria-label="Refresh market data"
                              isLoading={refreshingSecurityId === (security.id || security.isin)}
                            />
                          )}
                        </Flex>
                      </Td>
                    )}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={showMarketValues ? (readOnly ? 9 : 10) : (readOnly ? 6 : 7)} textAlign="center" py={4}>
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      <Text color="gray.500">No securities found</Text>
                    )}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
        
        {/* Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Security Information</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={3}>
                <FormLabel>ISIN</FormLabel>
                <Input 
                  name="isin"
                  value={editFormData.isin || ''}
                  onChange={handleEditInputChange}
                  placeholder="ISIN"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Name</FormLabel>
                <Input 
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditInputChange}
                  placeholder="Security name"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Type</FormLabel>
                <Select 
                  name="type"
                  value={editFormData.type || ''}
                  onChange={handleEditInputChange}
                >
                  <option value="">Select type</option>
                  {securityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Quantity</FormLabel>
                <Input 
                  name="quantity"
                  value={editFormData.quantity || ''}
                  onChange={handleEditInputChange}
                  placeholder="Quantity"
                  type="number"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Price</FormLabel>
                <Input 
                  name="price"
                  value={editFormData.price || ''}
                  onChange={handleEditInputChange}
                  placeholder="Price"
                  type="number"
                  step="0.01"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Value</FormLabel>
                <Input 
                  name="value"
                  value={editFormData.value || ''}
                  onChange={handleEditInputChange}
                  placeholder="Value"
                  type="number"
                  step="0.01"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Currency</FormLabel>
                <Input 
                  name="currency"
                  value={editFormData.currency || ''}
                  onChange={handleEditInputChange}
                  placeholder="Currency"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>Description</FormLabel>
                <Input 
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditInputChange}
                  placeholder="Description"
                />
              </FormControl>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Security Detail Modal */}
        <Modal isOpen={isSecurityDetailOpen} onClose={onSecurityDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Security Details</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              {selectedSecurity ? (
                <>
                  <Flex 
                    direction={{ base: "column", md: "row" }} 
                    justify="space-between" 
                    align={{ base: "stretch", md: "center" }}
                    mb={4}
                  >
                    <Box>
                      <Heading size="md">{selectedSecurity.name}</Heading>
                      <Text color="gray.600" fontSize="sm">{selectedSecurity.isin}</Text>
                      <Badge colorScheme={getTypeColor(selectedSecurity.type)} mt={1}>
                        {selectedSecurity.type || 'Unknown'}
                      </Badge>
                    </Box>
                    
                    {showMarketValues && (
                      <Flex align="center" mt={{ base: 3, md: 0 }}>
                        <Box textAlign="right">
                          <Text fontSize="2xl" fontWeight="bold">
                            {selectedSecurity.marketPrice
                              ? formatCurrency(selectedSecurity.marketPrice, selectedSecurity.currency)
                              : (selectedSecurity.price 
                                ? formatCurrency(selectedSecurity.price, selectedSecurity.currency) 
                                : 'N/A')}
                          </Text>
                          {selectedSecurity.priceChangePercent && (
                            <Flex align="center" justify="flex-end">
                              {selectedSecurity.priceChangePercent > 0 ? (
                                <FiTrendingUp color="green" style={{ marginRight: '4px' }} />
                              ) : (
                                <FiTrendingDown color="red" style={{ marginRight: '4px' }} />
                              )}
                              <Text
                                color={getPriceChangeColor(selectedSecurity.priceChangePercent)}
                                fontWeight="medium"
                              >
                                {selectedSecurity.priceChange > 0 ? '+' : ''}
                                {formatCurrency(selectedSecurity.priceChange, selectedSecurity.currency)} 
                                ({selectedSecurity.priceChangePercent > 0 ? '+' : ''}
                                {selectedSecurity.priceChangePercent.toFixed(2)}%)
                              </Text>
                            </Flex>
                          )}
                        </Box>
                        
                        <IconButton
                          icon={<FiRefreshCw />}
                          ml={3}
                          aria-label="Refresh"
                          isLoading={refreshingSecurityId === (selectedSecurity.id || selectedSecurity.isin)}
                          onClick={() => refreshSingleSecurityData(selectedSecurity)}
                        />
                      </Flex>
                    )}
                  </Flex>
                  
                  <Divider my={4} />
                  
                  <Tabs isFitted variant="enclosed" mb={4}>
                    <TabList>
                      <Tab>Overview</Tab>
                      {showMarketValues && <Tab>Market Data</Tab>}
                    </TabList>
                    
                    <TabPanels>
                      {/* Overview Tab */}
                      <TabPanel>
                        <Stack spacing={4}>
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Quantity:</Text>
                            <Text>{selectedSecurity.quantity || 'N/A'}</Text>
                          </Flex>
                          
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Document Price:</Text>
                            <Text>
                              {selectedSecurity.price 
                                ? formatCurrency(selectedSecurity.price, selectedSecurity.currency) 
                                : 'N/A'}
                            </Text>
                          </Flex>
                          
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Document Value:</Text>
                            <Text>
                              {selectedSecurity.value 
                                ? formatCurrency(selectedSecurity.value, selectedSecurity.currency) 
                                : 'N/A'}
                            </Text>
                          </Flex>
                          
                          <Flex justify="space-between">
                            <Text fontWeight="medium">Currency:</Text>
                            <Text>{selectedSecurity.currency || 'N/A'}</Text>
                          </Flex>
                          
                          {selectedSecurity.description && (
                            <Box>
                              <Text fontWeight="medium" mb={1}>Description:</Text>
                              <Text>{selectedSecurity.description}</Text>
                            </Box>
                          )}
                        </Stack>
                      </TabPanel>
                      
                      {/* Market Data Tab */}
                      {showMarketValues && (
                        <TabPanel>
                          <Stack spacing={4}>
                            <Flex justify="space-between">
                              <Text fontWeight="medium">Market Price:</Text>
                              <Text>
                                {selectedSecurity.marketPrice 
                                  ? formatCurrency(selectedSecurity.marketPrice, selectedSecurity.currency) 
                                  : 'N/A'}
                              </Text>
                            </Flex>
                            
                            <Flex justify="space-between">
                              <Text fontWeight="medium">Market Value:</Text>
                              <Text>
                                {selectedSecurity.marketValue 
                                  ? formatCurrency(selectedSecurity.marketValue, selectedSecurity.currency) 
                                  : 'N/A'}
                              </Text>
                            </Flex>
                            
                            <Flex justify="space-between">
                              <Text fontWeight="medium">Change (%):</Text>
                              <Text color={getPriceChangeColor(selectedSecurity.priceChangePercent)}>
                                {selectedSecurity.priceChangePercent 
                                  ? `${selectedSecurity.priceChangePercent > 0 ? '+' : ''}${selectedSecurity.priceChangePercent.toFixed(2)}%` 
                                  : 'N/A'}
                              </Text>
                            </Flex>
                            
                            <Flex justify="space-between">
                              <Text fontWeight="medium">Data Provider:</Text>
                              <Text>{selectedSecurity.dataProvider || 'N/A'}</Text>
                            </Flex>
                            
                            <Flex justify="space-between">
                              <Text fontWeight="medium">Last Updated:</Text>
                              <Text>{selectedSecurity.lastUpdated ? formatDate(selectedSecurity.lastUpdated) : 'N/A'}</Text>
                            </Flex>
                            
                            {/* Price Chart Section */}
                            <Box mt={4}>
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text fontWeight="medium">Price History</Text>
                                <Flex>
                                  <Button 
                                    size="xs" 
                                    mr={1} 
                                    colorScheme={chartPeriod === '1m' ? 'blue' : 'gray'}
                                    onClick={() => loadPriceChart(selectedSecurity.isin, '1m')}
                                  >
                                    1M
                                  </Button>
                                  <Button 
                                    size="xs" 
                                    mr={1} 
                                    colorScheme={chartPeriod === '3m' ? 'blue' : 'gray'}
                                    onClick={() => loadPriceChart(selectedSecurity.isin, '3m')}
                                  >
                                    3M
                                  </Button>
                                  <Button 
                                    size="xs" 
                                    mr={1} 
                                    colorScheme={chartPeriod === '6m' ? 'blue' : 'gray'}
                                    onClick={() => loadPriceChart(selectedSecurity.isin, '6m')}
                                  >
                                    6M
                                  </Button>
                                  <Button 
                                    size="xs" 
                                    colorScheme={chartPeriod === '1y' ? 'blue' : 'gray'}
                                    onClick={() => loadPriceChart(selectedSecurity.isin, '1y')}
                                  >
                                    1Y
                                  </Button>
                                </Flex>
                              </Flex>
                              
                              <Box h="200px" position="relative">
                                {chartLoading ? (
                                  <Flex 
                                    justify="center" 
                                    align="center" 
                                    h="100%" 
                                    w="100%"
                                  >
                                    <Spinner />
                                  </Flex>
                                ) : priceChartData.length > 0 ? (
                                  <Box>
                                    {/* This would be replaced with an actual chart component */}
                                    <Text fontSize="sm" color="gray.500" textAlign="center">
                                      Price chart would be displayed here using a chart library like Chart.js or Recharts.
                                      {priceChartData.length} data points available for the selected period.
                                    </Text>
                                  </Box>
                                ) : (
                                  <Flex 
                                    justify="center" 
                                    align="center" 
                                    h="100%" 
                                    w="100%" 
                                    color="gray.500"
                                  >
                                    No historical data available
                                  </Flex>
                                )}
                              </Box>
                            </Box>
                          </Stack>
                        </TabPanel>
                      )}
                    </TabPanels>
                  </Tabs>
                </>
              ) : (
                <Flex justify="center" align="center" h="200px">
                  <Spinner />
                </Flex>
              )}
            </ModalBody>
            
            <ModalFooter>
              <Button onClick={onSecurityDetailClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Refresh Market Data Alert Dialog */}
        <AlertDialog
          isOpen={isRefreshAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onRefreshAlertClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Refresh Market Data
              </AlertDialogHeader>

              <AlertDialogBody>
                This will make API calls to update market prices for all {securities.length} securities. 
                Some providers have rate limits that may be exceeded.
                
                <Text mt={2} fontWeight="bold">Are you sure you want to continue?</Text>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onRefreshAlertClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    onRefreshAlertClose();
                    refreshMarketData();
                  }} 
                  ml={3}
                  isLoading={refreshingMarketData}
                >
                  Refresh All
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        
        {/* Export Modal */}
        <Modal isOpen={isExportModalOpen} onClose={onExportModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Export Securities Data</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <Stack spacing={4}>
                {/* Format Selection */}
                <FormControl>
                  <FormLabel>Export Format</FormLabel>
                  <Select 
                    name="format" 
                    value={exportOptions.format} 
                    onChange={handleExportOptionChange}
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                    <option value="json">JSON</option>
                  </Select>
                </FormControl>
                
                {/* Data Options */}
                <Box>
                  <Text fontWeight="medium" mb={2}>Data Options</Text>
                  <Stack spacing={2}>
                    <Flex>
                      <Checkbox 
                        name="includeMetadata" 
                        isChecked={exportOptions.includeMetadata}
                        onChange={handleExportOptionChange}
                        mr={2}
                      />
                      <Text>Include document metadata</Text>
                    </Flex>
                    
                    <Flex>
                      <Checkbox 
                        name="includeMarketData" 
                        isChecked={exportOptions.includeMarketData}
                        onChange={handleExportOptionChange}
                        mr={2}
                      />
                      <Text>Include market data</Text>
                    </Flex>
                    
                    <Flex>
                      <Checkbox 
                        name="onlyEssentialFields" 
                        isChecked={exportOptions.onlyEssentialFields}
                        onChange={handleExportOptionChange}
                        mr={2}
                      />
                      <Text>Only include essential fields</Text>
                    </Flex>
                    
                    {exportOptions.format === 'pdf' && (
                      <Flex>
                        <Checkbox 
                          name="includeLogo" 
                          isChecked={exportOptions.includeLogo}
                          onChange={handleExportOptionChange}
                          mr={2}
                        />
                        <Text>Include logo in header</Text>
                      </Flex>
                    )}
                  </Stack>
                </Box>
                
                {/* Scheduling Options */}
                {documentId && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Schedule Regular Export</Text>
                    <Stack spacing={2}>
                      <Flex>
                        <Checkbox 
                          name="scheduleExport" 
                          isChecked={exportOptions.scheduleExport}
                          onChange={handleExportOptionChange}
                          mr={2}
                        />
                        <Text>Schedule regular export</Text>
                      </Flex>
                      
                      {exportOptions.scheduleExport && (
                        <Flex mt={2} direction={{ base: "column", md: "row" }} gap={4}>
                          <FormControl>
                            <FormLabel>Frequency</FormLabel>
                            <Select 
                              name="scheduleFrequency" 
                              value={exportOptions.scheduleFrequency} 
                              onChange={handleExportOptionChange}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </Select>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Time</FormLabel>
                            <Input 
                              name="scheduleTime" 
                              type="time" 
                              value={exportOptions.scheduleTime} 
                              onChange={handleExportOptionChange}
                            />
                          </FormControl>
                        </Flex>
                      )}
                    </Stack>
                  </Box>
                )}
                
                {/* Custom Filename */}
                <FormControl>
                  <FormLabel>Custom Filename (Optional)</FormLabel>
                  <Input 
                    name="fileName" 
                    placeholder={`securities_export_${new Date().toISOString().slice(0,10)}.${exportOptions.format === 'excel' ? 'xlsx' : exportOptions.format}`}
                    onChange={handleExportOptionChange}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onExportModalClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={() => {
                  exportSecurities(exportOptions.format);
                  onExportModalClose();
                }}
              >
                Export
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AccessibilityWrapper>
  );
};

// Helper function to determine badge color based on security type
const getTypeColor = (type) => {
  if (!type) return 'gray';
  
  switch (type.toLowerCase()) {
    case 'stock':
    case 'equity':
      return 'blue';
    case 'bond':
    case 'fixed income':
      return 'green';
    case 'etf':
    case 'fund':
      return 'purple';
    case 'option':
    case 'derivative':
      return 'orange';
    case 'cash':
    case 'money market':
      return 'teal';
    default:
      return 'gray';
  }
};

export default EnhancedSecuritiesViewer;