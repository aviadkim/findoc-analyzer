import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Progress,
  Select,
  Stack,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  Spinner,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiDownload, FiBarChart2, FiPieChart, FiTable, FiMessageSquare } from 'react-icons/fi';
import DocumentChat from './DocumentChat';

const EnhancedIntegrationProcessor = () => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Upload file
      const response = await fetch('/api/financial/enhanced-integration', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setProcessingStatus('success');

      toast({
        title: 'Processing complete',
        description: `Successfully processed ${file.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(`Error processing document: ${err.message}`);
      setProcessingStatus('error');

      toast({
        title: 'Processing failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDocumentType('');
    setProcessingStatus('idle');
    setResults(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Enhanced Financial Document Processor
          </Heading>
          <Text color="gray.600">
            Process financial documents with advanced extraction and visualization capabilities
          </Text>
        </Box>

        <Box bg="white" p={6} borderRadius="md" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Select Document</FormLabel>
              <Input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isUploading || processingStatus === 'success'}
              />
              {file && (
                <Text mt={2} fontSize="sm">
                  Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Document Type (Optional)</FormLabel>
              <Select
                placeholder="Auto-detect document type"
                value={documentType}
                onChange={handleDocumentTypeChange}
                disabled={isUploading || processingStatus === 'success'}
              >
                <option value="portfolio_statement">Portfolio Statement</option>
                <option value="financial_report">Financial Report</option>
                <option value="investment_summary">Investment Summary</option>
                <option value="account_statement">Account Statement</option>
              </Select>
            </FormControl>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {processingStatus === 'uploading' && (
              <Box>
                <Text mb={2}>
                  {uploadProgress < 100
                    ? `Uploading and processing ${file?.name}...`
                    : 'Finalizing results...'}
                </Text>
                <Progress
                  value={uploadProgress}
                  size="sm"
                  colorScheme="blue"
                  borderRadius="md"
                  hasStripe
                  isAnimated
                />
              </Box>
            )}

            <HStack spacing={4}>
              <Button
                leftIcon={<FiUpload />}
                colorScheme="blue"
                onClick={handleUpload}
                isLoading={isUploading}
                loadingText="Processing"
                disabled={!file || processingStatus === 'success'}
                flex="1"
              >
                Process Document
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isUploading}
                flex="1"
              >
                Reset
              </Button>
            </HStack>
          </VStack>
        </Box>

        {results && processingStatus === 'success' && (
          <Box bg="white" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h2" size="lg" mb={4}>
              Processing Results
            </Heading>

            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>
                  <HStack>
                    <FiTable />
                    <Text>Results</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiFile />
                    <Text>Reports</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiPieChart />
                    <Text>Visualizations</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiMessageSquare />
                    <Text>Chat</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <Stack spacing={6}>
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Document Information
                      </Heading>
                      <Table variant="simple" size="sm">
                        <Tbody>
                          <Tr>
                            <Th>Document Name</Th>
                            <Td>{results.document_name}</Td>
                          </Tr>
                          <Tr>
                            <Th>Document Type</Th>
                            <Td>{results.document_type}</Td>
                          </Tr>
                          <Tr>
                            <Th>Processing Date</Th>
                            <Td>{results.processing_date}</Td>
                          </Tr>
                          <Tr>
                            <Th>Securities Count</Th>
                            <Td>{results.securities_count}</Td>
                          </Tr>
                          <Tr>
                            <Th>Total Value</Th>
                            <Td>{formatCurrency(results.total_value, results.currency)}</Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>

                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Extracted Securities
                      </Heading>
                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Security Name</Th>
                              <Th>ISIN</Th>
                              <Th isNumeric>Quantity</Th>
                              <Th isNumeric>Price</Th>
                              <Th isNumeric>Value</Th>
                              <Th isNumeric>Weight</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {results.securities.map((security, index) => (
                              <Tr key={index}>
                                <Td>{security.security_name}</Td>
                                <Td>{security.isin}</Td>
                                <Td isNumeric>
                                  {security.quantity ? security.quantity.toLocaleString() : 'N/A'}
                                </Td>
                                <Td isNumeric>
                                  {security.price
                                    ? formatCurrency(security.price, results.currency)
                                    : 'N/A'}
                                </Td>
                                <Td isNumeric>
                                  {security.value
                                    ? formatCurrency(security.value, results.currency)
                                    : 'N/A'}
                                </Td>
                                <Td isNumeric>
                                  {security.weight ? formatPercentage(security.weight) : 'N/A'}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    {Object.entries(results.reports).map(([reportName, reportPath]) => (
                      <HStack key={reportName} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <Text fontWeight="medium">
                          {reportName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Text>
                        <Button
                          as="a"
                          href={reportPath}
                          target="_blank"
                          size="sm"
                          leftIcon={<FiDownload />}
                          colorScheme="blue"
                          variant="outline"
                        >
                          Download
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    {Object.entries(results.visualizations).map(([vizName, vizPath]) => (
                      <HStack key={vizName} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <Text fontWeight="medium">
                          {vizName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Text>
                        <Button
                          as="a"
                          href={vizPath}
                          target="_blank"
                          size="sm"
                          leftIcon={<FiBarChart2 />}
                          colorScheme="green"
                          variant="outline"
                        >
                          View
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <DocumentChat 
                    documentId={results.document_path} 
                    documentName={results.document_name} 
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default EnhancedIntegrationProcessor;
