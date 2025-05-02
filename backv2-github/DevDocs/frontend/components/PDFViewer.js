import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Button,
  Flex,
  Text,
  IconButton,
  Spinner,
  HStack,
  VStack,
  Input,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiDownload,
  FiSearch,
  FiX,
} from 'react-icons/fi';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDF Viewer component
 * @param {Object} props - Component props
 * @param {string|File|ArrayBuffer} props.file - PDF file to display (URL, File object, or ArrayBuffer)
 * @param {Function} props.onLoadSuccess - Callback when PDF is loaded successfully
 * @param {Function} props.onLoadError - Callback when PDF fails to load
 * @param {boolean} props.showControls - Whether to show the controls (default: true)
 * @param {boolean} props.showPageNavigation - Whether to show page navigation controls (default: true)
 * @param {boolean} props.showZoomControls - Whether to show zoom controls (default: true)
 * @param {boolean} props.showRotateControl - Whether to show rotate control (default: true)
 * @param {boolean} props.showDownloadButton - Whether to show download button (default: true)
 * @param {boolean} props.showSearchBox - Whether to show search box (default: true)
 * @param {number} props.initialPage - Initial page to display (default: 1)
 * @param {number} props.initialScale - Initial scale (default: 1.0)
 * @returns {JSX.Element} PDF Viewer component
 */
const PDFViewer = ({
  file,
  onLoadSuccess,
  onLoadError,
  showControls = true,
  showPageNavigation = true,
  showZoomControls = true,
  showRotateControl = true,
  showDownloadButton = true,
  showSearchBox = true,
  initialPage = 1,
  initialScale = 1.0,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(initialScale);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pdfDocument, setPdfDocument] = useState(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Handle PDF load success
  const handleLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
    setPdfDocument(pdf);
    
    if (onLoadSuccess) {
      onLoadSuccess(pdf);
    }
  };

  // Handle PDF load error
  const handleLoadError = (error) => {
    setIsLoading(false);
    
    toast({
      title: 'Error loading PDF',
      description: error.message || 'Failed to load PDF document',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    
    if (onLoadError) {
      onLoadError(error);
    }
  };

  // Navigate to previous page
  const goToPrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  // Navigate to next page
  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  };

  // Zoom in
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  // Zoom out
  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  // Rotate document
  const rotateDocument = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  // Download PDF
  const downloadPDF = () => {
    if (typeof file === 'string') {
      // If file is a URL, create a link and click it
      const link = document.createElement('a');
      link.href = file;
      link.download = file.split('/').pop() || 'document.pdf';
      link.target = '_blank';
      link.click();
    } else if (file instanceof File) {
      // If file is a File object, create a URL and download it
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name || 'document.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // If file is an ArrayBuffer or other format, convert to Blob and download
      const blob = new Blob([file], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Search in PDF
  const searchInPDF = async () => {
    if (!pdfDocument || !searchText) return;
    
    try {
      // This is a simplified search implementation
      // In a real application, you would use PDF.js's search functionality
      toast({
        title: 'Search functionality',
        description: 'Full text search is not implemented in this demo',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error searching in PDF:', error);
      
      toast({
        title: 'Search error',
        description: error.message || 'Failed to search in PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchInPDF();
  };

  // Clear search
  const clearSearch = () => {
    setSearchText('');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts if the focus is not in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevPage();
          break;
        case 'ArrowRight':
          goToNextPage();
          break;
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'r':
          rotateDocument();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [numPages]);

  return (
    <Box
      width="100%"
      height="100%"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      position="relative"
    >
      {/* PDF Controls */}
      {showControls && (
        <Flex
          justify="space-between"
          align="center"
          p={2}
          borderBottom="1px"
          borderColor={borderColor}
          bg={bgColor}
          flexWrap="wrap"
          gap={2}
        >
          {/* Page Navigation */}
          {showPageNavigation && (
            <HStack spacing={2}>
              <IconButton
                icon={<FiChevronLeft />}
                onClick={goToPrevPage}
                isDisabled={pageNumber <= 1 || isLoading}
                aria-label="Previous page"
                size="sm"
              />
              <Text fontSize="sm">
                Page {pageNumber} of {numPages || '?'}
              </Text>
              <IconButton
                icon={<FiChevronRight />}
                onClick={goToNextPage}
                isDisabled={pageNumber >= numPages || isLoading}
                aria-label="Next page"
                size="sm"
              />
            </HStack>
          )}
          
          {/* Zoom Controls */}
          {showZoomControls && (
            <HStack spacing={2}>
              <IconButton
                icon={<FiZoomOut />}
                onClick={zoomOut}
                isDisabled={scale <= 0.5 || isLoading}
                aria-label="Zoom out"
                size="sm"
              />
              <Text fontSize="sm">{Math.round(scale * 100)}%</Text>
              <IconButton
                icon={<FiZoomIn />}
                onClick={zoomIn}
                isDisabled={scale >= 3.0 || isLoading}
                aria-label="Zoom in"
                size="sm"
              />
            </HStack>
          )}
          
          {/* Other Controls */}
          <HStack spacing={2}>
            {showRotateControl && (
              <Tooltip label="Rotate">
                <IconButton
                  icon={<FiRotateCw />}
                  onClick={rotateDocument}
                  isDisabled={isLoading}
                  aria-label="Rotate"
                  size="sm"
                />
              </Tooltip>
            )}
            
            {showDownloadButton && (
              <Tooltip label="Download">
                <IconButton
                  icon={<FiDownload />}
                  onClick={downloadPDF}
                  isDisabled={isLoading}
                  aria-label="Download"
                  size="sm"
                />
              </Tooltip>
            )}
          </HStack>
          
          {/* Search Box */}
          {showSearchBox && (
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex' }}>
              <HStack spacing={2}>
                <Input
                  placeholder="Search in document"
                  value={searchText}
                  onChange={handleSearchChange}
                  size="sm"
                  width="auto"
                  maxWidth="200px"
                />
                <IconButton
                  icon={<FiSearch />}
                  type="submit"
                  isDisabled={!searchText || isLoading}
                  aria-label="Search"
                  size="sm"
                />
                {searchText && (
                  <IconButton
                    icon={<FiX />}
                    onClick={clearSearch}
                    aria-label="Clear search"
                    size="sm"
                    variant="ghost"
                  />
                )}
              </HStack>
            </form>
          )}
        </Flex>
      )}
      
      {/* PDF Document */}
      <Box
        height={showControls ? 'calc(100% - 50px)' : '100%'}
        overflowY="auto"
        p={4}
        display="flex"
        justifyContent="center"
      >
        {isLoading && (
          <VStack justify="center" align="center" height="100%">
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text mt={4}>Loading PDF...</Text>
          </VStack>
        )}
        
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={<Spinner size="xl" color="blue.500" />}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={<Spinner size="xl" color="blue.500" />}
          />
        </Document>
      </Box>
    </Box>
  );
};

export default PDFViewer;
