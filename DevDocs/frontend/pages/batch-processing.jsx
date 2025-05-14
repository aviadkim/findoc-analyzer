import React, { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Heading,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import BatchProcessingDashboard from '../components/BatchProcessingDashboard';
import BatchJobCreationForm from '../components/BatchJobCreationForm';
import Layout from '../components/Layout';

/**
 * Batch Processing Page
 * 
 * Main page for batch processing management and job creation.
 */
const BatchProcessingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Handle job creation (switch to dashboard tab)
  const handleJobCreated = () => {
    setActiveTab(0);
  };
  
  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" mb={8}>
          <Heading size="xl" mb={2}>Batch Processing</Heading>
          <Text color="gray.600">
            Manage batch document processing operations and monitor progress
          </Text>
        </Flex>
        
        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Tabs
            isFitted
            colorScheme="blue"
            variant="enclosed"
            index={activeTab}
            onChange={setActiveTab}
          >
            <TabList>
              <Tab fontWeight="semibold">Dashboard</Tab>
              <Tab fontWeight="semibold">Create Job</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0}>
                <BatchProcessingDashboard />
              </TabPanel>
              
              <TabPanel p={5}>
                <BatchJobCreationForm onJobCreated={handleJobCreated} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Layout>
  );
};

export default BatchProcessingPage;