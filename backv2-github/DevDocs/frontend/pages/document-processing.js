import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { FiUpload, FiFileText, FiBarChart2, FiDownload } from 'react-icons/fi';
import FinDocUI from '../components/FinDocUI';
import DocumentUploader from '../components/DocumentUploader';
import DocumentAnalysis from '../components/DocumentAnalysis';
import PDFViewer from '../components/PDFViewer';
import useDocumentProcessor from '../hooks/useDocumentProcessor';

const DocumentProcessingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [documentFile, setDocumentFile] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const {
    file,
    isProcessing,
    progress,
    result,
    error,
    handleFileChange,
    processDocument,
    downloadJson,
  } = useDocumentProcessor({
    apiUrl: 'http://localhost:24125/api/rag',
    showToasts: true,
  });

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    setDocumentFile(selectedFile);
    handleFileChange(selectedFile);
  };

  // Handle document upload
  const handleUpload = () => {
    processDocument();
    setActiveTab(1); // Switch to Analysis tab
  };

  // Handle view document
  const handleViewDocument = () => {
    if (documentFile) {
      onOpen();
    } else {
      toast({
        title: 'No document available',
        description: 'Please upload a document first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle download analysis
  const handleDownloadAnalysis = () => {
    downloadJson();
  };

  return (
    <FinDocUI>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading as="h1" mb={2}>Document Processing</Heading>
          <Text color="gray.600">
            Upload and analyze financial documents to extract valuable insights
          </Text>
        </Box>

        <Tabs
          variant="enclosed"
          colorScheme="blue"
          index={activeTab}
          onChange={setActiveTab}
          isLazy
        >
          <TabList>
            <Tab>
              <Flex align="center">
                <FiUpload style={{ marginRight: '8px' }} />
                Upload
              </Flex>
            </Tab>
            <Tab isDisabled={!file && !result}>
              <Flex align="center">
                <FiBarChart2 style={{ marginRight: '8px' }} />
                Analysis
              </Flex>
            </Tab>
            <Tab isDisabled={!documentFile}>
              <Flex align="center">
                <FiFileText style={{ marginRight: '8px' }} />
                Document
              </Flex>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Upload Tab */}
            <TabPanel p={6}>
              <Box maxW="800px" mx="auto">
                <DocumentUploader
                  onFileSelect={handleFileSelect}
                  acceptedFileTypes={['.pdf']}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  multiple={false}
                  showPreview={true}
                />
                
                <Flex justify="center" mt={6}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FiBarChart2 />}
                    onClick={handleUpload}
                    isDisabled={!documentFile || isProcessing}
                    isLoading={isProcessing}
                    loadingText="Processing..."
                  >
                    Process Document
                  </Button>
                </Flex>
              </Box>
            </TabPanel>

            {/* Analysis Tab */}
            <TabPanel p={6}>
              <DocumentAnalysis
                analysisResult={result}
                isLoading={isProcessing}
                error={error}
                onDownload={handleDownloadAnalysis}
                onViewDocument={handleViewDocument}
              />
            </TabPanel>

            {/* Document Tab */}
            <TabPanel p={6}>
              <Box height="700px" borderWidth={1} borderRadius="lg" overflow="hidden">
                {documentFile ? (
                  <PDFViewer
                    file={documentFile}
                    showControls={true}
                    showPageNavigation={true}
                    showZoomControls={true}
                    showRotateControl={true}
                    showDownloadButton={true}
                    showSearchBox={true}
                  />
                ) : (
                  <Flex
                    height="100%"
                    align="center"
                    justify="center"
                    direction="column"
                    p={8}
                  >
                    <FiFileText size={48} color="gray" />
                    <Text mt={4} fontSize="lg" fontWeight="medium">
                      No document available
                    </Text>
                    <Text mt={2} color="gray.500">
                      Please upload a document first
                    </Text>
                    <Button
                      mt={6}
                      colorScheme="blue"
                      onClick={() => setActiveTab(0)}
                    >
                      Go to Upload
                    </Button>
                  </Flex>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* PDF Viewer Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="5xl">
          <ModalOverlay />
          <ModalContent height="90vh">
            <ModalHeader>Document Viewer</ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <Box height="100%">
                <PDFViewer
                  file={documentFile}
                  showControls={true}
                  showPageNavigation={true}
                  showZoomControls={true}
                  showRotateControl={true}
                  showDownloadButton={true}
                  showSearchBox={true}
                />
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </FinDocUI>
  );
};

export default DocumentProcessingPage;
