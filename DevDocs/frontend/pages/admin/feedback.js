/**
 * Admin Feedback Dashboard Page
 *
 * A page for administrators to manage feedback and view analytics.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Spinner,
  Center
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import AdminDashboard from '../../components/feedback/AdminDashboard';

// Admin authentication check
const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Fetch current user
        const response = await fetch('/api/auth/me');
        const result = await response.json();
        
        if (response.ok && result.data?.user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          // If not admin, redirect to unauthorized page
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/unauthorized');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  return { isAdmin, isLoading };
};

const AdminFeedbackPage = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Center py={12}>
            <Box textAlign="center">
              <Spinner size="xl" />
              <Text mt={4}>Checking admin access...</Text>
            </Box>
          </Center>
        </Container>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Container maxW="container.xl" py={8}>
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Unauthorized Access</AlertTitle>
            <AlertDescription>
              You do not have permission to view this page.
            </AlertDescription>
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <AdminDashboard />
      </Container>
    </Layout>
  );
};

export default AdminFeedbackPage;