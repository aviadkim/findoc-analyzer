/**
 * Feedback Admin Dashboard Component
 *
 * A dashboard for administrators to view and manage feedback and analytics.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Flex,
  Badge,
  Text,
  Select,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  useToast
} from '@chakra-ui/react';
import { getAnalyticsSummary } from '../../services/analyticsService';

// Helper to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status badge component
const StatusBadge = ({ status }) => {
  const colorScheme = {
    pending: 'yellow',
    in_progress: 'blue',
    resolved: 'green',
    rejected: 'red'
  }[status] || 'gray';

  const label = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  }[status] || status;

  return (
    <Badge colorScheme={colorScheme} borderRadius="full" px={2} py={0.5}>
      {label}
    </Badge>
  );
};

// Feedback management modal
const FeedbackManagementModal = ({ isOpen, onClose, feedback, onStatusUpdate, onResponseSubmit }) => {
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [responseContent, setResponseContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (feedback) {
      setStatus(feedback.status || 'pending');
      setAdminNotes(feedback.admin_notes || '');
      setResponseContent('');
    }
  }, [feedback]);

  const handleStatusUpdate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/admin?id=${feedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Status updated',
          description: `Feedback status updated to ${status}`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        if (onStatusUpdate) {
          onStatusUpdate(result.data.feedback);
        }
      } else {
        toast({
          title: 'Update failed',
          description: result.message || 'Failed to update feedback status',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: 'Update failed',
        description: 'An error occurred while updating feedback status',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!responseContent.trim()) {
      toast({
        title: 'Response required',
        description: 'Please enter a response',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/admin?id=${feedback.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: responseContent })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Response added',
          description: 'Your response has been added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        setResponseContent('');
        if (onResponseSubmit) {
          onResponseSubmit(result.data.response);
        }
      } else {
        toast({
          title: 'Submission failed',
          description: result.message || 'Failed to add response',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: 'Submission failed',
        description: 'An error occurred while adding your response',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!feedback) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Manage Feedback
          <Text fontSize="sm" color="gray.500" mt={1}>
            Submitted on {formatDate(feedback.created_at)}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
            <Flex justify="space-between" align="center" mb={2}>
              <Heading size="md">{feedback.subject}</Heading>
              <StatusBadge status={feedback.status} />
            </Flex>
            
            <Text color="gray.600" mb={3}>
              From: {feedback.users?.email || 'Anonymous'} | Type: {feedback.type}
              {feedback.rating && ` | Rating: ${feedback.rating}/5`}
            </Text>
            
            <Text whiteSpace="pre-wrap" mb={2}>
              {feedback.content}
            </Text>
          </Box>
          
          {/* Status Management */}
          <Box mb={4} borderWidth="1px" borderRadius="md" p={4}>
            <Heading size="sm" mb={3}>Update Status</Heading>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <RadioGroup value={status} onChange={setStatus}>
                <Stack direction="row" spacing={4}>
                  <Radio value="pending">Pending</Radio>
                  <Radio value="in_progress">In Progress</Radio>
                  <Radio value="resolved">Resolved</Radio>
                  <Radio value="rejected">Rejected</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Admin Notes</FormLabel>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this feedback"
                rows={2}
              />
            </FormControl>
            
            <Button
              colorScheme="blue"
              onClick={handleStatusUpdate}
              isLoading={isSubmitting}
              isDisabled={status === feedback.status && adminNotes === feedback.admin_notes}
              size="sm"
            >
              Update Status
            </Button>
          </Box>
          
          {/* Response Management */}
          <Box mb={4} borderWidth="1px" borderRadius="md" p={4}>
            <Heading size="sm" mb={3}>Add Response</Heading>
            <FormControl mb={3}>
              <FormLabel>Response</FormLabel>
              <Textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                placeholder="Enter your response to this feedback..."
                rows={4}
              />
            </FormControl>
            
            <Button
              colorScheme="green"
              onClick={handleResponseSubmit}
              isLoading={isSubmitting}
              size="sm"
            >
              Send Response
            </Button>
          </Box>
          
          {/* Response History */}
          {feedback.feedback_responses && feedback.feedback_responses.length > 0 && (
            <Box mb={4}>
              <Heading size="sm" mb={3}>Response History</Heading>
              <Stack spacing={3}>
                {feedback.feedback_responses.map((response) => (
                  <Box 
                    key={response.id} 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    bg={response.is_admin_response ? "blue.50" : "white"}
                  >
                    <Flex>
                      <Text fontSize="sm" fontWeight="bold">
                        {response.is_admin_response ? "Support Team" : "User"}
                      </Text>
                      <Text fontSize="xs" color="gray.500" ml="auto">
                        {formatDate(response.created_at)}
                      </Text>
                    </Flex>
                    <Text mt={2} fontSize="sm">{response.content}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Analytics Dashboard Component
const AnalyticsPanel = () => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await getAnalyticsSummary(analyticsPeriod);
        if (result.status === 'success') {
          setAnalyticsData(result.data);
        } else {
          setError('Failed to fetch analytics data');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('An error occurred while fetching analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [analyticsPeriod]);

  if (isLoading) {
    return (
      <Box textAlign="center" my={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading analytics data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" my={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Flex mb={4} align="center" justify="space-between">
        <Heading size="md">Analytics Dashboard</Heading>
        <Select
          value={analyticsPeriod}
          onChange={(e) => setAnalyticsPeriod(e.target.value)}
          width="150px"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last year</option>
        </Select>
      </Flex>

      {analyticsData && (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Stat p={4} borderWidth="1px" borderRadius="md" bg="white">
              <StatLabel>Total Feedback</StatLabel>
              <StatNumber>{analyticsData.summary?.total_feedback || 0}</StatNumber>
              <Text fontSize="sm" color="gray.500">
                {analyticsPeriod === '7d' ? 'Last 7 days' : 
                 analyticsPeriod === '30d' ? 'Last 30 days' : 
                 analyticsPeriod === '90d' ? 'Last 90 days' : 'Last year'}
              </Text>
            </Stat>
            
            <Stat p={4} borderWidth="1px" borderRadius="md" bg="white">
              <StatLabel>Average Rating</StatLabel>
              <StatNumber>{analyticsData.summary?.average_rating?.toFixed(1) || 'N/A'}</StatNumber>
              <Text fontSize="sm" color="gray.500">Out of 5.0</Text>
            </Stat>
            
            <Stat p={4} borderWidth="1px" borderRadius="md" bg="white">
              <StatLabel>Resolution Rate</StatLabel>
              <StatNumber>
                {analyticsData.summary?.resolution_rate ? 
                 `${(analyticsData.summary.resolution_rate * 100).toFixed(0)}%` : 
                 'N/A'}
              </StatNumber>
              <Text fontSize="sm" color="gray.500">Feedback marked as resolved</Text>
            </Stat>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Heading size="sm" mb={4}>Feedback by Status</Heading>
              {analyticsData.feedback_stats && analyticsData.feedback_stats.length > 0 ? (
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Status</Th>
                      <Th isNumeric>Count</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analyticsData.feedback_stats.map((stat) => {
                      const totalCount = analyticsData.feedback_stats.reduce(
                        (sum, item) => sum + parseInt(item.count), 0
                      );
                      const percentage = totalCount > 0 ? 
                        ((parseInt(stat.count) / totalCount) * 100).toFixed(1) : 0;
                      
                      return (
                        <Tr key={stat.status}>
                          <Td><StatusBadge status={stat.status} /></Td>
                          <Td isNumeric>{stat.count}</Td>
                          <Td isNumeric>{percentage}%</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No feedback data available</Text>
              )}
            </Box>
            
            <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
              <Heading size="sm" mb={4}>Feedback by Type</Heading>
              {analyticsData.feedback_type_stats && analyticsData.feedback_type_stats.length > 0 ? (
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Type</Th>
                      <Th isNumeric>Count</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analyticsData.feedback_type_stats.map((stat) => {
                      const totalCount = analyticsData.feedback_type_stats.reduce(
                        (sum, item) => sum + parseInt(item.count), 0
                      );
                      const percentage = totalCount > 0 ? 
                        ((parseInt(stat.count) / totalCount) * 100).toFixed(1) : 0;
                      
                      return (
                        <Tr key={stat.type}>
                          <Td>{stat.type}</Td>
                          <Td isNumeric>{stat.count}</Td>
                          <Td isNumeric>{percentage}%</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No feedback type data available</Text>
              )}
            </Box>
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

// Feedback Management Panel Component
const FeedbackManagementPanel = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ total: 0, offset: 0, limit: 25 });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch feedback data
  const fetchFeedback = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      if (statusFilter) queryParams.append('status', statusFilter);
      if (typeFilter) queryParams.append('type', typeFilter);
      
      const response = await fetch(`/api/feedback/admin?${queryParams.toString()}`);
      const result = await response.json();
      
      if (response.ok) {
        setFeedbackList(result.data.feedback);
        setPagination(result.data.pagination);
      } else {
        setError(result.message || 'Failed to fetch feedback data');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('An error occurred while fetching feedback data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, typeFilter, pagination.offset, pagination.limit]);

  // Handle feedback selection
  const handleSelectFeedback = async (feedback) => {
    try {
      // Fetch detailed feedback with responses
      const response = await fetch(`/api/feedback/${feedback.id}`);
      const result = await response.json();
      
      if (response.ok) {
        setSelectedFeedback(result.data.feedback);
        onOpen();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch feedback details',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (err) {
      console.error('Error fetching feedback details:', err);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching feedback details',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Handle status update
  const handleStatusUpdate = (updatedFeedback) => {
    setFeedbackList(feedbackList.map(item => 
      item.id === updatedFeedback.id ? updatedFeedback : item
    ));
    setSelectedFeedback(updatedFeedback);
  };

  // Handle response submission
  const handleResponseSubmit = (response) => {
    // Refresh the selected feedback to include the new response
    const feedback = {...selectedFeedback};
    if (!feedback.feedback_responses) {
      feedback.feedback_responses = [];
    }
    feedback.feedback_responses.push(response);
    feedback.status = 'in_progress'; // Status is automatically updated to in_progress
    
    setSelectedFeedback(feedback);
    
    // Update the list item status as well
    setFeedbackList(feedbackList.map(item => 
      item.id === feedback.id ? {...item, status: 'in_progress'} : item
    ));
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit
      });
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit)
      });
    }
  };

  // Filter feedback list by search query
  const filteredFeedback = searchQuery.trim() === '' ? 
    feedbackList : 
    feedbackList.filter(item => 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.users?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Box>
      <Flex mb={4} align="center" justify="space-between" wrap="wrap" gap={2}>
        <Heading size="md">Feedback Management</Heading>
        
        <Flex gap={2} flex="1" justify="flex-end" maxW={{ base: '100%', md: '70%' }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
            width={{ base: '100%', md: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </Select>
          
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="Filter by type"
            width={{ base: '100%', md: '150px' }}
          >
            <option value="">All Types</option>
            <option value="feature_request">Feature Request</option>
            <option value="bug_report">Bug Report</option>
            <option value="usability">Usability</option>
            <option value="general">General</option>
          </Select>
          
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            width={{ base: '100%', md: '200px' }}
          />
        </Flex>
      </Flex>

      {error && (
        <Alert status="error" borderRadius="md" my={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box textAlign="center" my={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading feedback...</Text>
        </Box>
      ) : filteredFeedback.length === 0 ? (
        <Box p={6} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text>No feedback found matching your criteria.</Text>
        </Box>
      ) : (
        <Box>
          <Table variant="simple" size="sm" borderWidth="1px" borderRadius="md">
            <Thead bg="gray.50">
              <Tr>
                <Th>Subject</Th>
                <Th>Submitted</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>User</Th>
                <Th width="120px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFeedback.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.subject}</Td>
                  <Td>{formatDate(item.created_at)}</Td>
                  <Td>{item.type}</Td>
                  <Td><StatusBadge status={item.status} /></Td>
                  <Td>{item.users?.email || 'Anonymous'}</Td>
                  <Td>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={() => handleSelectFeedback(item)}
                    >
                      Manage
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          <Flex justify="space-between" mt={4}>
            <Text>
              Showing {pagination.offset + 1}-
              {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
            </Text>
            <Flex gap={2}>
              <Button
                size="sm"
                onClick={handlePrevPage}
                isDisabled={pagination.offset === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={handleNextPage}
                isDisabled={pagination.offset + pagination.limit >= pagination.total}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      <FeedbackManagementModal
        isOpen={isOpen}
        onClose={onClose}
        feedback={selectedFeedback}
        onStatusUpdate={handleStatusUpdate}
        onResponseSubmit={handleResponseSubmit}
      />
    </Box>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>Feedback & Analytics Dashboard</Heading>
      
      <Tabs colorScheme="blue" isLazy>
        <TabList>
          <Tab>Feedback Management</Tab>
          <Tab>Analytics</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <FeedbackManagementPanel />
          </TabPanel>
          <TabPanel px={0}>
            <AnalyticsPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboard;