import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Badge,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  IconButton,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import ResponsiveWrapper from './ResponsiveWrapper';

/**
 * PortfolioComparisonSelector Component
 * 
 * A responsive component for selecting portfolios to compare
 * 
 * @param {Object} props
 * @param {Array} props.portfolios - List of available portfolios
 * @param {Function} props.onSelectPortfolios - Callback when portfolios are selected
 * @param {number} props.maxSelections - Maximum number of portfolios that can be selected
 */
const PortfolioComparisonSelector = ({
  portfolios = [],
  onSelectPortfolios = () => {},
  maxSelections = 3,
  ...props
}) => {
  // State
  const [selectedPortfolios, setSelectedPortfolios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPortfolios, setFilteredPortfolios] = useState(portfolios);
  const [filterType, setFilterType] = useState('all');
  
  // Responsive layout helpers
  const isMobile = useBreakpointValue({ base: true, md: false });
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBorderColor = useColorModeValue('blue.400', 'blue.300');
  
  // Filter portfolios when search query or filter type changes
  useEffect(() => {
    let result = [...portfolios];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(portfolio => 
        portfolio.name.toLowerCase().includes(query) ||
        portfolio.description?.toLowerCase().includes(query) ||
        portfolio.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(portfolio => portfolio.type === filterType);
    }
    
    setFilteredPortfolios(result);
  }, [searchQuery, filterType, portfolios]);
  
  // Handle portfolio selection
  const togglePortfolioSelection = (portfolioId) => {
    // Check if already selected
    if (selectedPortfolios.includes(portfolioId)) {
      // Remove from selection
      setSelectedPortfolios(selectedPortfolios.filter(id => id !== portfolioId));
    } else {
      // Add to selection if under max limit
      if (selectedPortfolios.length < maxSelections) {
        setSelectedPortfolios([...selectedPortfolios, portfolioId]);
      }
    }
  };
  
  // Handle compare button click
  const handleCompare = () => {
    onSelectPortfolios(selectedPortfolios);
  };
  
  // Get unique portfolio types for filter
  const portfolioTypes = [...new Set(portfolios.map(p => p.type).filter(Boolean))];
  
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
  
  return (
    <ResponsiveWrapper>
      <Box>
        <Heading size="md" mb={4}>Select Portfolios to Compare</Heading>
        
        {/* Filters and search */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          mb={6}
          gap={3}
        >
          <InputGroup maxW={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search portfolios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Flex gap={3} align="center">
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                size="sm"
              >
                {filterType === 'all' ? 'All Types' : filterType}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setFilterType('all')}>All Types</MenuItem>
                {portfolioTypes.map(type => (
                  <MenuItem key={type} onClick={() => setFilterType(type)}>
                    {type}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            
            <Button
              colorScheme="blue"
              isDisabled={selectedPortfolios.length === 0}
              rightIcon={<ChevronRightIcon />}
              onClick={handleCompare}
              size="sm"
            >
              Compare ({selectedPortfolios.length})
            </Button>
          </Flex>
        </Flex>
        
        {/* Selected portfolios counter */}
        <Text mb={3} fontSize="sm">
          {selectedPortfolios.length} of {maxSelections} portfolios selected
        </Text>
        
        {/* Portfolio grid */}
        {filteredPortfolios.length === 0 ? (
          <Box textAlign="center" p={10}>
            <Text>No portfolios found matching your criteria.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={columns} spacing={4}>
            {filteredPortfolios.map(portfolio => (
              <Card 
                key={portfolio.id}
                cursor="pointer"
                onClick={() => togglePortfolioSelection(portfolio.id)}
                bg={cardBg}
                border="2px solid"
                borderColor={selectedPortfolios.includes(portfolio.id) ? selectedBorderColor : borderColor}
                shadow={selectedPortfolios.includes(portfolio.id) ? "md" : "sm"}
                transition="all 0.2s"
                _hover={{ shadow: "md" }}
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm" noOfLines={1}>{portfolio.name}</Heading>
                    {portfolio.type && (
                      <Badge colorScheme={getTypeColor(portfolio.type)}>
                        {portfolio.type}
                      </Badge>
                    )}
                  </Flex>
                </CardHeader>
                
                <CardBody py={2}>
                  <Stack spacing={3}>
                    <Stat size="sm">
                      <StatLabel>Total Value</StatLabel>
                      <StatNumber>{formatCurrency(portfolio.value)}</StatNumber>
                    </Stat>
                    
                    {portfolio.performance !== undefined && (
                      <Stat size="sm">
                        <StatLabel>Performance (1Y)</StatLabel>
                        <Flex align="center">
                          <StatNumber>{portfolio.performance.toFixed(2)}%</StatNumber>
                          <StatArrow 
                            type={portfolio.performance >= 0 ? 'increase' : 'decrease'} 
                            ml={1}
                          />
                        </Flex>
                      </Stat>
                    )}
                    
                    {portfolio.description && (
                      <Text fontSize="sm" noOfLines={2}>{portfolio.description}</Text>
                    )}
                    
                    {portfolio.tags && portfolio.tags.length > 0 && (
                      <Flex gap={1} flexWrap="wrap">
                        {portfolio.tags.map(tag => (
                          <Badge key={tag} variant="outline" fontSize="xs">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Stack>
                </CardBody>
                
                <CardFooter pt={2}>
                  <Flex justify="space-between" w="100%" align="center">
                    <Text fontSize="xs" color="gray.500">
                      {portfolio.assetCount} assets
                    </Text>
                    
                    <Badge 
                      colorScheme={selectedPortfolios.includes(portfolio.id) ? "blue" : "gray"}
                      variant={selectedPortfolios.includes(portfolio.id) ? "solid" : "outline"}
                    >
                      {selectedPortfolios.includes(portfolio.id) ? "Selected" : "Select"}
                    </Badge>
                  </Flex>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </ResponsiveWrapper>
  );
};

// Helper to get badge color for portfolio type
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'retirement':
      return 'blue';
    case 'investment':
      return 'green';
    case 'savings':
      return 'teal';
    case 'education':
      return 'purple';
    case 'trading':
      return 'orange';
    default:
      return 'gray';
  }
};

export default PortfolioComparisonSelector;