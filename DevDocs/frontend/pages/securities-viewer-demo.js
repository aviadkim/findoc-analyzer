import React, { useState } from 'react';
import { Box, Button, Container, Heading, VStack, HStack, Text, Select, FormControl, FormLabel } from '@chakra-ui/react';
import SecuritiesViewer from '../components/SecuritiesViewer';
import Layout from '../components/Layout';

// Mock data for demo purposes
const DEMO_SECURITIES = [
  {
    id: '1',
    isin: 'US0378331005',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 100,
    price: 150.25,
    value: 15025,
    currency: 'USD',
    description: 'Technology company that designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.'
  },
  {
    id: '2',
    isin: 'US88160R1014',
    name: 'Tesla, Inc.',
    type: 'stock',
    quantity: 50,
    price: 275.33,
    value: 13766.5,
    currency: 'USD',
    description: 'American electric vehicle and clean energy company.'
  },
  {
    id: '3',
    isin: 'US68389X1054',
    name: 'Oracle Corporation',
    type: 'stock',
    quantity: 120,
    price: 105.65,
    value: 12678,
    currency: 'USD',
    description: 'Computer technology corporation that sells database software and technology, cloud engineered systems, and enterprise software products.'
  },
  {
    id: '4',
    isin: 'US037833AR12',
    name: 'Apple Inc. Bond 2.4% 2023',
    type: 'bond',
    quantity: 25000,
    price: 99.5,
    value: 24875,
    currency: 'USD',
    description: 'Corporate bond issued by Apple Inc. with 2.4% coupon rate, maturing in 2023.'
  },
  {
    id: '5',
    isin: 'IE00B4L5Y983',
    name: 'iShares Core MSCI World UCITS ETF',
    type: 'etf',
    quantity: 200,
    price: 75.8,
    value: 15160,
    currency: 'EUR',
    description: 'Exchange-traded fund that tracks the performance of the MSCI World Index.'
  },
  {
    id: '6',
    isin: 'GB00B03MLX29',
    name: 'Royal Dutch Shell Plc',
    type: 'stock',
    quantity: 300,
    price: 23.15,
    value: 6945,
    currency: 'GBP',
    description: 'British-Dutch multinational oil and gas company.'
  },
  {
    id: '7',
    isin: 'DE0005557508',
    name: 'Deutsche Telekom AG',
    type: 'stock',
    quantity: 175,
    price: 19.5,
    value: 3412.5,
    currency: 'EUR',
    description: 'German telecommunications company.'
  },
  {
    id: '8',
    isin: 'US912810SL35',
    name: 'US Treasury Bond 2.375% 2049',
    type: 'bond',
    quantity: 40000,
    price: 98.25,
    value: 39300,
    currency: 'USD',
    description: 'Long-term government debt security issued by the US Department of the Treasury.'
  },
  {
    id: '9',
    isin: 'US4642872422',
    name: 'iShares S&P 500 Growth ETF',
    type: 'etf',
    quantity: 85,
    price: 62.75,
    value: 5333.75,
    currency: 'USD',
    description: 'ETF that tracks an index of large- and mid-cap US stocks with growth characteristics.'
  },
  {
    id: '10',
    isin: 'Cash_USD',
    name: 'Cash Holdings',
    type: 'cash',
    quantity: 1,
    price: 15680.42,
    value: 15680.42,
    currency: 'USD',
    description: 'Cash holdings in USD'
  }
];

const SecuritiesViewerDemo = () => {
  const [demoMode, setDemoMode] = useState('live');
  
  // Mock API response for demo purposes
  if (typeof window !== 'undefined' && window.mock === undefined) {
    window.mock = {
      axios: {
        get: async (url) => {
          console.log('Mock API call to:', url);
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 750));
          
          if (url.includes('/api/financial/securities') || url.includes('/api/documents/')) {
            return { data: { securities: DEMO_SECURITIES } };
          }
          
          throw new Error('Not found');
        },
        put: async (url, data) => {
          console.log('Mock API update call to:', url, data);
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return { data: { success: true, data } };
        }
      }
    };
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box bg="blue.50" p={4} borderRadius="md">
            <Heading as="h1" size="lg" mb={2}>Securities Viewer Demo</Heading>
            <Text>
              This page demonstrates the SecuritiesViewer component, which provides a user-friendly interface 
              for viewing and interacting with extracted securities data. You can filter, sort, and edit securities information.
            </Text>
            
            <HStack mt={4} spacing={4}>
              <FormControl maxW="300px">
                <FormLabel>Demo Mode</FormLabel>
                <Select value={demoMode} onChange={e => setDemoMode(e.target.value)}>
                  <option value="live">Live Demo (with mock data)</option>
                  <option value="readonly">Read-only Mode</option>
                </Select>
              </FormControl>
            </HStack>
          </Box>
          
          <SecuritiesViewer readOnly={demoMode === 'readonly'} />
          
          <Box bg="gray.50" p={4} borderRadius="md">
            <Heading as="h3" size="md" mb={2}>Component Usage</Heading>
            <Text fontFamily="mono" fontSize="sm" whiteSpace="pre-wrap">
{`// Basic usage
<SecuritiesViewer />

// Document-specific securities
<SecuritiesViewer documentId="doc123" />

// Read-only mode (no editing)
<SecuritiesViewer readOnly={true} />
`}
            </Text>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export default SecuritiesViewerDemo;