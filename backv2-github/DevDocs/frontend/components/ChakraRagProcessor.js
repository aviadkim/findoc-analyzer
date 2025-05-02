import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  useToast,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:24125';

const ChakraRagProcessor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/rag/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      toast({
        title: 'Document processed',
        description: 'Document has been successfully processed with RAG',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Error processing document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" mb={4}>
        Financial Document Analysis with RAG
      </Heading>
      <Text mb={6}>
        Upload a financial document (PDF) to analyze it using Retrieval-Augmented Generation (RAG).
        The system will extract key information and provide insights about the document.
      </Text>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
          <Heading as="h2" size="md" mb={4}>
            Upload Document
          </Heading>
          <FormControl mb={4}>
            <FormLabel>Select a PDF file</FormLabel>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              p={1}
              border="none"
            />
          </FormControl>
          {file && (
            <Text fontSize="sm" mb={4}>
              Selected: {file.name}
            </Text>
          )}
          <Button
            colorScheme="blue"
            leftIcon={<FiUpload />}
            onClick={handleUpload}
            isLoading={loading}
            loadingText="Processing"
            isDisabled={!file}
          >
            Process Document
          </Button>
        </Box>

        {result && (
          <Card borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
            <CardHeader>
              <Heading size="md">Document Analysis Results</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={3}>
                <Text>
                  <strong>Document ID:</strong> {result.document_id}
                </Text>
                <Text>
                  <strong>Document Type:</strong> {result.results.document_type}
                </Text>
                <Text>
                  <strong>Total Value:</strong> {result.results.total_value} {result.results.currency}
                </Text>
                <Text>
                  <strong>Securities Count:</strong> {result.results.securities_count}
                </Text>
                <Divider my={2} />
                <Heading as="h3" size="sm" mb={2}>
                  Asset Allocation
                </Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  {Object.entries(result.results.asset_allocation || {}).map(([asset, value]) => (
                    <Text key={asset}>
                      <strong>{asset}:</strong> {value}
                    </Text>
                  ))}
                </Grid>
              </Stack>
            </CardBody>
          </Card>
        )}
      </Grid>
    </Container>
  );
};

export default ChakraRagProcessor;
