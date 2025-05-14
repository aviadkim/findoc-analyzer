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
  InputRightElement
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
  FiInfo
} from 'react-icons/fi';
import AccessibilityWrapper from './AccessibilityWrapper';

const SecuritiesViewer = ({ documentId, readOnly = false }) => {
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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
          setSecurities(response.data.securities);
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
        setSecurities(securities.map(sec => 
          sec.id === editingId ? {...sec, ...editFormData} : sec
        ));
        
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
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      // Handle numeric values
      if (sortField === 'quantity' || sortField === 'value' || sortField === 'price') {
        return sortDirection === 'asc' 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      // Handle string values
      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [securities, searchQuery, filter, sortField, sortDirection]);

  // Get unique security types for filter dropdown
  const securityTypes = useMemo(() => {
    const types = new Set(securities.map(security => security.type).filter(Boolean));
    return Array.from(types);
  }, [securities]);

  // Export securities to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = ["ISIN", "Name", "Type", "Quantity", "Price", "Value", "Currency", "Description"];
    csvContent += headers.join(",") + "\n";
    
    // Data
    filteredAndSortedSecurities.forEach(security => {
      const row = [
        security.isin || "",
        `"${(security.name || "").replace(/"/g, '""')}"`, // Escape quotes in names
        security.type || "",
        security.quantity || "",
        security.price || "",
        security.value || "",
        security.currency || "",
        `"${(security.description || "").replace(/"/g, '""')}"` // Escape quotes in descriptions
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `securities_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render security value with appropriate formatting
  const renderValue = (value, currency) => {
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

  return (
    <AccessibilityWrapper>
      <Box className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Heading size="md" mb={4}>Securities Information</Heading>
        
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
            
            <Tooltip label="Export to CSV">
              <IconButton
                icon={<FiDownload />}
                onClick={exportToCSV}
                aria-label="Export to CSV"
                isDisabled={filteredAndSortedSecurities.length === 0}
              />
            </Tooltip>
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
                        <Text isTruncated maxW="200px">
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
                    <Td isNumeric>{security.price ? renderValue(security.price, security.currency) : 'N/A'}</Td>
                    <Td isNumeric>{security.value ? renderValue(security.value, security.currency) : 'N/A'}</Td>
                    <Td>{security.currency || 'N/A'}</Td>
                    {!readOnly && (
                      <Td>
                        <IconButton
                          size="sm"
                          colorScheme="blue"
                          icon={<FiEdit2 />}
                          onClick={() => handleEditClick(security)}
                          aria-label="Edit security"
                        />
                      </Td>
                    )}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={readOnly ? 7 : 8} textAlign="center" py={4}>
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
      </Box>
    </AccessibilityWrapper>
  );
};

// Helper function to determine badge color based on security type
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
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

export default SecuritiesViewer;