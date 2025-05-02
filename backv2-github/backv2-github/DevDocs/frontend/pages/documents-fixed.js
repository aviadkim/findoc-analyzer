import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Badge,
  Flex,
  useToast,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiFile, FiFileText, FiDownload, FiEye, FiTrash2, FiMoreVertical, FiCalendar, FiTag } from 'react-icons/fi';
import FinDocUI from '../components/FinDocUI';
import axios from 'axios';

// Mock data for documents
const mockDocuments = [
  {
    id: '1',
    name: 'Q1 2023 Financial Report.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadDate: '2023-04-15',
    status: 'Processed',
    tags: ['Financial', 'Quarterly', '2023']
  },
  {
    id: '2',
    name: 'Investment Portfolio.xlsx',
    type: 'Excel',
    size: '1.8 MB',
    uploadDate: '2023-03-22',
    status: 'Processed',
    tags: ['Portfolio', 'Investment']
  },
  {
    id: '3',
    name: 'Tax Documents 2022.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '2023-02-10',
    status: 'Processed',
    tags: ['Tax', '2022']
  },
  {
    id: '4',
    name: 'Budget Forecast 2023.xlsx',
    type: 'Excel',
    size: '1.5 MB',
    uploadDate: '2023-01-05',
    status: 'Processing',
    tags: ['Budget', 'Forecast', '2023']
  },
  {
    id: '5',
    name: 'Audit Report.pdf',
    type: 'PDF',
    size: '4.7 MB',
    uploadDate: '2022-12-18',
    status: 'Error',
    tags: ['Audit', 'Report']
  }
];

const DocumentsPage = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Filter documents based on search term and status
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus ? doc.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: 'Document deleted',
      description: 'The document has been successfully deleted.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDownload = (id) => {
    setIsLoading(true);
    // Simulate download delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Download started',
        description: 'Your document is being downloaded.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const handleView = (id) => {
    // Navigate to document view page
    window.location.href = `/document/${id}`;
  };

  return (
    <FinDocUI>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading as="h1" mb={2}>My Documents</Heading>
          <Text color="gray.600">Manage and analyze your financial documents</Text>
        </Box>

        <Box mb={6}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <InputGroup maxW={{ base: '100%', md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="Filter by status"
              maxW={{ base: '100%', md: '200px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Processed">Processed</option>
              <option value="Processing">Processing</option>
              <option value="Error">Error</option>
            </Select>

            <Button
              leftIcon={<FiUpload />}
              colorScheme="blue"
              ml={{ base: 0, md: 'auto' }}
              onClick={() => window.location.href = '/upload'}
            >
              Upload New
            </Button>
          </Flex>
        </Box>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>List View</Tab>
            <Tab>Grid View</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th>Size</Th>
                      <Th>Upload Date</Th>
                      <Th>Status</Th>
                      <Th>Tags</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredDocuments.map((doc) => (
                      <Tr key={doc.id}>
                        <Td>
                          <Flex align="center">
                            {doc.type === 'PDF' ? <FiFile /> : <FiFileText />}
                            <Text ml={2}>{doc.name}</Text>
                          </Flex>
                        </Td>
                        <Td>{doc.type}</Td>
                        <Td>{doc.size}</Td>
                        <Td>{doc.uploadDate}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              doc.status === 'Processed' ? 'green' :
                                doc.status === 'Processing' ? 'blue' : 'red'
                            }
                          >
                            {doc.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Flex gap={1} flexWrap="wrap">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} colorScheme="gray">
                                {tag}
                              </Badge>
                            ))}
                          </Flex>
                        </Td>
                        <Td>
                          <Flex gap={2}>
                            <IconButton
                              aria-label="View document"
                              icon={<FiEye />}
                              size="sm"
                              onClick={() => handleView(doc.id)}
                            />
                            <IconButton
                              aria-label="Download document"
                              icon={isLoading ? <Spinner size="sm" /> : <FiDownload />}
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                              isLoading={isLoading}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More options"
                                icon={<FiMoreVertical />}
                                size="sm"
                                variant="ghost"
                              />
                              <MenuList>
                                <MenuItem icon={<FiEye />} onClick={() => handleView(doc.id)}>
                                  View
                                </MenuItem>
                                <MenuItem icon={<FiDownload />} onClick={() => handleDownload(doc.id)}>
                                  Download
                                </MenuItem>
                                <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(doc.id)} color="red.500">
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} boxShadow="md" borderRadius="lg">
                    <CardHeader pb={2}>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" noOfLines={1}>{doc.name}</Heading>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FiEye />} onClick={() => handleView(doc.id)}>
                              View
                            </MenuItem>
                            <MenuItem icon={<FiDownload />} onClick={() => handleDownload(doc.id)}>
                              Download
                            </MenuItem>
                            <MenuItem icon={<FiTrash2 />} onClick={() => handleDelete(doc.id)} color="red.500">
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </CardHeader>
                    <CardBody py={2}>
                      <Stack spacing={2}>
                        <Flex align="center">
                          <FiFileText />
                          <Text ml={2} fontSize="sm">{doc.type}</Text>
                          <Text ml={2} fontSize="sm" color="gray.500">{doc.size}</Text>
                        </Flex>
                        <Flex align="center">
                          <FiCalendar />
                          <Text ml={2} fontSize="sm">{doc.uploadDate}</Text>
                        </Flex>
                        <Flex align="center" flexWrap="wrap" gap={1}>
                          <FiTag />
                          {doc.tags.map((tag) => (
                            <Badge key={tag} colorScheme="gray" ml={1} fontSize="xs">
                              {tag}
                            </Badge>
                          ))}
                        </Flex>
                      </Stack>
                    </CardBody>
                    <CardFooter pt={2}>
                      <Flex justify="space-between" align="center" width="100%">
                        <Badge
                          colorScheme={
                            doc.status === 'Processed' ? 'green' :
                              doc.status === 'Processing' ? 'blue' : 'red'
                          }
                        >
                          {doc.status}
                        </Badge>
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            leftIcon={<FiEye />}
                            onClick={() => handleView(doc.id)}
                            variant="ghost"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={isLoading ? <Spinner size="xs" /> : <FiDownload />}
                            onClick={() => handleDownload(doc.id)}
                            isLoading={isLoading}
                            colorScheme="blue"
                          >
                            Download
                          </Button>
                        </Flex>
                      </Flex>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </FinDocUI>
  );
};

export default DocumentsPage;
