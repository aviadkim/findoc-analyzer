import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Select,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { 
  FiPlay, 
  FiPause, 
  FiX, 
  FiSearch, 
  FiFileText, 
  FiCheck, 
  FiAlertTriangle, 
  FiRefreshCw, 
  FiClock,
  FiBarChart2,
  FiUpload,
  FiDownload,
  FiDatabase,
} from 'react-icons/fi';
import axios from 'axios';

// Status color mapping
const statusColors = {
  pending: 'gray',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
  paused: 'orange',
  cancelled: 'purple',
};

// Format date utility function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Format duration utility function
const formatDuration = (milliseconds) => {
  if (!milliseconds) return 'N/A';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Batch Processing Dashboard Component
 */
const BatchProcessingDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setIsRefreshing(true);
      let url = '/api/batch/jobs';
      
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        console.error('Failed to fetch jobs:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter]);
  
  // Fetch system metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get('/api/batch/metrics');
      
      if (response.data.success) {
        setMetrics(response.data.metrics);
      } else {
        console.error('Failed to fetch metrics:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, []);

  // Fetch job details
  const fetchJobDetails = useCallback(async (jobId) => {
    try {
      const response = await axios.get(`/api/batch/jobs/${jobId}`);
      
      if (response.data.success) {
        setSelectedJobDetails(response.data.job);
      } else {
        console.error('Failed to fetch job details:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  }, []);

  // Handle job action (pause, resume, cancel)
  const handleJobAction = async (jobId, action) => {
    try {
      let url;
      let method;
      
      switch (action) {
        case 'pause':
          url = `/api/batch/jobs/${jobId}/pause`;
          method = 'put';
          break;
        case 'resume':
          url = `/api/batch/jobs/${jobId}/resume`;
          method = 'put';
          break;
        case 'cancel':
          url = `/api/batch/jobs/${jobId}`;
          method = 'delete';
          break;
        default:
          console.error('Unknown action:', action);
          return;
      }
      
      const response = await axios[method](url);
      
      if (response.data.success) {
        // Show success toast
        toast({
          title: `Job ${action}d`,
          description: `Successfully ${action}d job ${jobId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh jobs list
        fetchJobs();
        
        // Update job details if viewing the affected job
        if (selectedJob === jobId) {
          fetchJobDetails(jobId);
        }
      } else {
        // Show error toast
        toast({
          title: `Failed to ${action} job`,
          description: response.data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      
      // Show error toast
      toast({
        title: `Error ${action}ing job`,
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle job selection
  const handleJobSelect = (jobId) => {
    setSelectedJob(jobId);
    fetchJobDetails(jobId);
    onOpen();
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      job.id.toLowerCase().includes(query) ||
      job.name.toLowerCase().includes(query)
    );
  });

  // Setup auto-refresh
  useEffect(() => {
    fetchJobs();
    fetchMetrics();
    
    // Setup refresh interval
    const intervalId = setInterval(() => {
      fetchJobs();
      fetchMetrics();
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchJobs, fetchMetrics, refreshInterval]);

  return (
    <Box p={5}>
      <Heading mb={5}>Batch Processing Dashboard</Heading>
      
      {/* Metrics Summary */}
      {metrics && (
        <Flex mb={5} gap={4} flexWrap="wrap">
          <Box p={4} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
            <Flex align="center">
              <Icon as={FiClock} mr={2} color="blue.500" />
              <Text fontWeight="bold">Processing</Text>
            </Flex>
            <Text fontSize="2xl">{metrics.jobs.current.processing}</Text>
          </Box>
          
          <Box p={4} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
            <Flex align="center">
              <Icon as={FiCheck} mr={2} color="green.500" />
              <Text fontWeight="bold">Completed</Text>
            </Flex>
            <Text fontSize="2xl">{metrics.jobs.completed}</Text>
          </Box>
          
          <Box p={4} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
            <Flex align="center">
              <Icon as={FiAlertTriangle} mr={2} color="red.500" />
              <Text fontWeight="bold">Failed</Text>
            </Flex>
            <Text fontSize="2xl">{metrics.jobs.failed}</Text>
          </Box>
          
          <Box p={4} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
            <Flex align="center">
              <Icon as={FiBarChart2} mr={2} color="purple.500" />
              <Text fontWeight="bold">Throughput</Text>
            </Flex>
            <Text fontSize="2xl">{metrics.performance.throughput.toFixed(2)}/min</Text>
          </Box>
        </Flex>
      )}
      
      {/* Controls */}
      <Flex mb={5} align="center" wrap="wrap" gap={4}>
        <FormControl maxW="200px">
          <FormLabel htmlFor="status-filter">Status Filter</FormLabel>
          <Select 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </FormControl>
        
        <FormControl maxW="250px">
          <FormLabel htmlFor="search-query">Search</FormLabel>
          <Flex>
            <Input
              id="search-query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or name"
            />
            <Button ml={2} aria-label="Search">
              <Icon as={FiSearch} />
            </Button>
          </Flex>
        </FormControl>
        
        <FormControl maxW="200px">
          <FormLabel htmlFor="refresh-interval">Refresh Interval (s)</FormLabel>
          <Select
            id="refresh-interval"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          >
            <option value="10">10s</option>
            <option value="30">30s</option>
            <option value="60">1m</option>
            <option value="300">5m</option>
          </Select>
        </FormControl>
        
        <Button
          colorScheme="blue"
          leftIcon={<FiRefreshCw />}
          isLoading={isRefreshing}
          onClick={() => {
            fetchJobs();
            fetchMetrics();
          }}
          alignSelf="flex-end"
        >
          Refresh
        </Button>
      </Flex>
      
      {/* Jobs Table */}
      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Job ID</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Progress</Th>
                <Th>Created</Th>
                <Th>Tasks</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredJobs.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center">No jobs found</Td>
                </Tr>
              ) : (
                filteredJobs.map((job) => (
                  <Tr key={job.id}>
                    <Td>
                      <Button
                        variant="link"
                        colorScheme="blue"
                        onClick={() => handleJobSelect(job.id)}
                      >
                        {job.id.substring(0, 8)}...
                      </Button>
                    </Td>
                    <Td>{job.name}</Td>
                    <Td>
                      <Badge colorScheme={statusColors[job.status]}>
                        {job.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Box w="150px">
                        <Progress
                          value={job.progress}
                          size="sm"
                          colorScheme={
                            job.status === 'failed' ? 'red' : 
                            job.status === 'completed' ? 'green' : 'blue'
                          }
                        />
                        <Text fontSize="xs" mt={1}>
                          {job.progress}% ({job.completedTasks}/{job.totalTasks} tasks)
                        </Text>
                      </Box>
                    </Td>
                    <Td>{formatDate(job.createdAt)}</Td>
                    <Td>
                      {job.completedTasks}/{job.totalTasks}
                      {job.failedTasks > 0 && (
                        <Badge ml={2} colorScheme="red">
                          {job.failedTasks} failed
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        {job.status === 'processing' && (
                          <Button
                            size="sm"
                            colorScheme="orange"
                            onClick={() => handleJobAction(job.id, 'pause')}
                            title="Pause Job"
                          >
                            <Icon as={FiPause} />
                          </Button>
                        )}
                        
                        {job.status === 'paused' && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleJobAction(job.id, 'resume')}
                            title="Resume Job"
                          >
                            <Icon as={FiPlay} />
                          </Button>
                        )}
                        
                        {(job.status === 'pending' || job.status === 'processing' || job.status === 'paused') && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleJobAction(job.id, 'cancel')}
                            title="Cancel Job"
                          >
                            <Icon as={FiX} />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleJobSelect(job.id)}
                          title="View Details"
                        >
                          <Icon as={FiSearch} />
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Job Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Job Details
            {selectedJobDetails && (
              <Flex align="center" mt={1}>
                <Text fontSize="sm" fontWeight="normal">
                  {selectedJobDetails.id}
                </Text>
                <Badge ml={2} colorScheme={statusColors[selectedJobDetails.status]}>
                  {selectedJobDetails.status}
                </Badge>
              </Flex>
            )}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            {!selectedJobDetails ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Tasks</Tab>
                  <Tab>Metadata</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel>
                    <Box mb={4}>
                      <Text fontWeight="bold" mb={1}>Name</Text>
                      <Text>{selectedJobDetails.name}</Text>
                    </Box>
                    
                    <Box mb={4}>
                      <Text fontWeight="bold" mb={1}>Progress</Text>
                      <Progress
                        value={selectedJobDetails.progress}
                        size="md"
                        colorScheme={
                          selectedJobDetails.status === 'failed' ? 'red' : 
                          selectedJobDetails.status === 'completed' ? 'green' : 'blue'
                        }
                        mb={2}
                      />
                      <Text>{selectedJobDetails.progress}% complete</Text>
                    </Box>
                    
                    <Flex mb={4} wrap="wrap" gap={8}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>Created</Text>
                        <Text>{formatDate(selectedJobDetails.createdAt)}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Started</Text>
                        <Text>{formatDate(selectedJobDetails.startedAt)}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Completed</Text>
                        <Text>{formatDate(selectedJobDetails.completedAt)}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Duration</Text>
                        <Text>
                          {selectedJobDetails.startedAt ? 
                            formatDuration(
                              selectedJobDetails.completedAt ? 
                                new Date(selectedJobDetails.completedAt) - new Date(selectedJobDetails.startedAt) : 
                                new Date() - new Date(selectedJobDetails.startedAt)
                            ) : 
                            'Not started'
                          }
                        </Text>
                      </Box>
                    </Flex>
                    
                    <Flex mb={4} wrap="wrap" gap={8}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>Priority</Text>
                        <Badge colorScheme={
                          selectedJobDetails.priority === 'high' ? 'red' : 
                          selectedJobDetails.priority === 'low' ? 'green' : 'blue'
                        }>
                          {selectedJobDetails.priority}
                        </Badge>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Task Summary</Text>
                        <Text>
                          {selectedJobDetails.tasks.filter(t => t.status === 'completed').length} completed, {' '}
                          {selectedJobDetails.tasks.filter(t => t.status === 'processing').length} processing, {' '}
                          {selectedJobDetails.tasks.filter(t => t.status === 'pending').length} pending, {' '}
                          {selectedJobDetails.tasks.filter(t => t.status === 'failed').length} failed
                        </Text>
                      </Box>
                    </Flex>
                    
                    {/* Actions */}
                    <Flex mt={6} gap={3}>
                      {selectedJobDetails.status === 'processing' && (
                        <Button
                          colorScheme="orange"
                          leftIcon={<FiPause />}
                          onClick={() => handleJobAction(selectedJobDetails.id, 'pause')}
                        >
                          Pause
                        </Button>
                      )}
                      
                      {selectedJobDetails.status === 'paused' && (
                        <Button
                          colorScheme="blue"
                          leftIcon={<FiPlay />}
                          onClick={() => handleJobAction(selectedJobDetails.id, 'resume')}
                        >
                          Resume
                        </Button>
                      )}
                      
                      {(selectedJobDetails.status === 'pending' || 
                        selectedJobDetails.status === 'processing' || 
                        selectedJobDetails.status === 'paused') && (
                        <Button
                          colorScheme="red"
                          leftIcon={<FiX />}
                          onClick={() => handleJobAction(selectedJobDetails.id, 'cancel')}
                        >
                          Cancel
                        </Button>
                      )}
                      
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<FiRefreshCw />}
                        onClick={() => fetchJobDetails(selectedJobDetails.id)}
                      >
                        Refresh
                      </Button>
                    </Flex>
                  </TabPanel>
                  
                  {/* Tasks Tab */}
                  <TabPanel>
                    <Accordion allowMultiple>
                      {selectedJobDetails.tasks.map((task) => (
                        <AccordionItem key={task.id}>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <Flex align="center">
                                  <Badge mr={2} colorScheme={statusColors[task.status]}>
                                    {task.status}
                                  </Badge>
                                  <Text fontWeight="bold">{task.name}</Text>
                                </Flex>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <Flex wrap="wrap" gap={6}>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">Task ID</Text>
                                <Text fontSize="sm">{task.id}</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">Started</Text>
                                <Text fontSize="sm">{formatDate(task.startedAt)}</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">Completed</Text>
                                <Text fontSize="sm">{formatDate(task.completedAt)}</Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">Duration</Text>
                                <Text fontSize="sm">
                                  {task.startedAt ? 
                                    formatDuration(
                                      task.completedAt ? 
                                        new Date(task.completedAt) - new Date(task.startedAt) : 
                                        new Date() - new Date(task.startedAt)
                                    ) : 
                                    'Not started'
                                  }
                                </Text>
                              </Box>
                              
                              <Box>
                                <Text fontWeight="bold" fontSize="sm">Retries</Text>
                                <Text fontSize="sm">{task.retries || 0}</Text>
                              </Box>
                            </Flex>
                            
                            {task.error && (
                              <Box mt={4} p={3} bg="red.50" borderRadius="md">
                                <Text fontWeight="bold" color="red.600">Error</Text>
                                <Text color="red.600">{task.error.message}</Text>
                              </Box>
                            )}
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabPanel>
                  
                  {/* Metadata Tab */}
                  <TabPanel>
                    {selectedJobDetails.metadata && Object.keys(selectedJobDetails.metadata).length > 0 ? (
                      <Box>
                        <Heading size="sm" mb={3}>Metadata</Heading>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Key</Th>
                              <Th>Value</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {Object.entries(selectedJobDetails.metadata).map(([key, value]) => (
                              <Tr key={key}>
                                <Td fontWeight="bold">{key}</Td>
                                <Td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Text>No metadata available</Text>
                    )}
                    
                    {selectedJobDetails.options && (
                      <Box mt={6}>
                        <Heading size="sm" mb={3}>Options</Heading>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Option</Th>
                              <Th>Value</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {Object.entries(selectedJobDetails.options).map(([key, value]) => (
                              <Tr key={key}>
                                <Td fontWeight="bold">{key}</Td>
                                <Td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BatchProcessingDashboard;