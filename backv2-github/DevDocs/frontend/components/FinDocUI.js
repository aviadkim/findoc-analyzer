import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Box, useToast } from '@chakra-ui/react';
import ResponsiveNavigation from './ResponsiveNavigation';

const FinDocUI = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Aviad B.', role: 'Administrator' });
  const [apiKey, setApiKey] = useState('');
  const toast = useToast();

  // Fetch API key from GitHub secrets on component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get('/api/config/api-key');
        if (response.data && response.data.key) {
          setApiKey(response.data.key);
          console.log('API key loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
        toast({
          title: 'Error loading API key',
          description: 'Some features may not work properly.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchApiKey();
  }, [toast]);

  return (
    <Box bg="gray.50" minH="100vh">
      <ResponsiveNavigation user={user} />
      <Box
        ml={{ base: 0, lg: '250px' }}
        mt={{ base: '60px', lg: 0 }}
        transition="margin 0.3s"
        p={{ base: 4, md: 6 }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default FinDocUI;
