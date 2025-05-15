/**
 * Feedback Page
 *
 * Main page for user feedback submission and history.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  Button,
  Link
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import FinDocLayout from '../components/FinDocLayout';
import FeedbackForm from '../components/feedback/FeedbackForm';
import FeedbackHistory from '../components/feedback/FeedbackHistory';
import { trackPageView } from '../services/analyticsService';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const FeedbackPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const toast = useToast();
  const router = useRouter();

  // Track page view
  useEffect(() => {
    trackPageView('feedback');
    
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();
        
        if (response.ok && result.data?.user?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  const handleSubmitSuccess = () => {
    // Switch to history tab after successful submission
    setTabIndex(1);
    
    toast({
      title: 'Feedback Submitted',
      description: 'Thank you for your feedback! We\'ll review it soon.',
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };

  return (
    <FinDocLayout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8} textAlign="center">
          <Heading size="xl">Feedback</Heading>
          <Text mt={2} color="gray.600">
            We value your input and use it to improve our services
          </Text>
        </Box>

        {isAdmin && (
          <Box mb={6}>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <Text fontWeight="bold">Admin Access Available</Text>
                <Text>You have access to the admin feedback dashboard.</Text>
              </Box>
              <Button 
                size="sm" 
                colorScheme="blue" 
                onClick={() => router.push('/admin/feedback')}
              >
                Go to Admin Dashboard
              </Button>
            </Alert>
          </Box>
        )}

        <Divider mb={8} />

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={8}>
          <GridItem colSpan={{ base: 12, lg: 7 }}>
            <Tabs 
              isLazy 
              colorScheme="blue" 
              index={tabIndex} 
              onChange={(index) => setTabIndex(index)}
            >
              <TabList mb={4}>
                <Tab>Submit Feedback</Tab>
                <Tab>Your History</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <FeedbackForm onSubmitSuccess={handleSubmitSuccess} />
                </TabPanel>
                
                <TabPanel px={0}>
                  <FeedbackHistory />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>

          <GridItem colSpan={{ base: 12, lg: 5 }}>
            <Box p={6} borderWidth="1px" borderRadius="md" bg="blue.50">
              <Heading size="md" mb={4}>
                Why Your Feedback Matters
              </Heading>
              
              <Text mb={4}>
                Your feedback helps us understand what's working well and what we
                can improve. Here's how we use your feedback:
              </Text>
              
              <Box as="ul" pl={5} spacing={2}>
                <Box as="li" pb={2}>
                  <Text>
                    <strong>Feature Requests:</strong> We review all feature requests
                    to identify the most valuable additions to our platform.
                  </Text>
                </Box>
                
                <Box as="li" pb={2}>
                  <Text>
                    <strong>Bug Reports:</strong> Reporting bugs helps us resolve
                    issues quickly and improve stability.
                  </Text>
                </Box>
                
                <Box as="li" pb={2}>
                  <Text>
                    <strong>Usability Feedback:</strong> Your insights on user experience
                    help us make the platform more intuitive and easier to use.
                  </Text>
                </Box>
                
                <Box as="li">
                  <Text>
                    <strong>General Feedback:</strong> Any comments or suggestions
                    help us understand your needs and expectations better.
                  </Text>
                </Box>
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </FinDocLayout>
  );
};

export default FeedbackPage;
