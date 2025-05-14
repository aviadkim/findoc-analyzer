import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Spinner, IconButton, Text, useToast } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon, DownloadIcon } from '@chakra-ui/icons';

/**
 * MobileDocumentViewer Component
 * 
 * A React implementation of the MobileDocumentViewer class for mobile and tablet devices.
 * Provides gesture controls, zoom functionality, and efficient rendering of large documents.
 * 
 * @param {Object} props
 * @param {string} props.documentUrl - URL to the document content
 * @param {string} props.documentType - Type of document (pdf, html, image, etc.)
 * @param {number} props.initialZoom - Initial zoom level
 * @param {boolean} props.enableGestures - Whether to enable touch gestures
 */
const MobileDocumentViewer = ({ 
  documentUrl, 
  documentType = 'pdf', 
  initialZoom = 1, 
  enableGestures = true,
  onPageChange = () => {},
  totalPages = 1
}) => {
  // State
  const [zoom, setZoom] = useState(initialZoom);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  
  // Refs
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const toast = useToast();
  
  // Touch state
  const touchStateRef = useRef({
    isDragging: false,
    isPinching: false,
    startX: 0,
    startY: 0,
    lastPinchDistance: 0,
    lastTouchTime: 0
  });
  
  // Load document effect
  useEffect(() => {
    if (documentUrl) {
      setIsLoading(true);
      setError(null);
      
      // For different document types
      if (documentType === 'pdf' || documentType === 'image') {
        // These will be handled by the iframe or img element
        // They will call onLoad when ready
      } else {
        // For other types, just finish loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }
  }, [documentUrl, documentType]);
  
  // Handle document element load
  const handleDocumentLoad = () => {
    setIsLoading(false);
    resetZoom();
  };
  
  // Reset position and zoom
  const resetZoom = () => {
    setZoom(1);
    setTransform({ x: 0, y: 0 });
  };
  
  // Zoom in
  const zoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.25));
  };
  
  // Zoom out
  const zoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.25));
  };
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };
  
  // Touch event handlers
  const handleTouchStart = (e) => {
    if (isLoading || !enableGestures) return;
    
    const touches = e.touches;
    const ts = touchStateRef.current;
    
    // Record time for double tap detection
    const currentTime = new Date().getTime();
    const tapLength = currentTime - ts.lastTouchTime;
    ts.lastTouchTime = currentTime;
    
    // Check for double tap
    if (tapLength < 300 && tapLength > 0) {
      // Handle double tap (toggle zoom)
      if (zoom > 1) {
        resetZoom();
      } else {
        setZoom(2);
      }
      return;
    }
    
    // Single touch (pan)
    if (touches.length === 1) {
      ts.startX = touches[0].clientX;
      ts.startY = touches[0].clientY;
      ts.isDragging = true;
    } 
    // Multi-touch (pinch zoom)
    else if (touches.length === 2) {
      ts.isPinching = true;
      
      // Calculate initial distance between two touches
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      ts.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  };
  
  const handleTouchMove = (e) => {
    if (isLoading || !enableGestures) return;
    
    const touches = e.touches;
    const ts = touchStateRef.current;
    
    // Single touch (pan)
    if (ts.isDragging && touches.length === 1) {
      const moveX = touches[0].clientX - ts.startX;
      const moveY = touches[0].clientY - ts.startY;
      
      setTransform(prev => ({
        x: prev.x + moveX,
        y: prev.y + moveY
      }));
      
      // Update start position for next move
      ts.startX = touches[0].clientX;
      ts.startY = touches[0].clientY;
      
      // Prevent default behavior (scrolling)
      e.preventDefault();
    }
    // Multi-touch (pinch zoom)
    else if (ts.isPinching && touches.length === 2) {
      // Calculate new distance between touches
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate zoom change based on pinch distance change
      const deltaDistance = distance - ts.lastPinchDistance;
      const zoomChange = deltaDistance * 0.01; // Adjust sensitivity as needed
      
      // Apply zoom
      setZoom(prev => Math.max(0.5, Math.min(3, prev + zoomChange)));
      
      // Update last pinch distance
      ts.lastPinchDistance = distance;
      
      // Prevent default behavior (browser zoom)
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = (e) => {
    const ts = touchStateRef.current;
    
    // Get final touch position
    if (e.changedTouches && e.changedTouches.length > 0 && ts.isDragging) {
      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - ts.startX;
      
      // Check for swipe (for page turning)
      if (Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
          prevPage();
        } else {
          nextPage();
        }
      }
    }
    
    // Reset touch state
    ts.isDragging = false;
    ts.isPinching = false;
  };
  
  // Render content based on document type
  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" h="100%" direction="column">
          <Spinner size="xl" mb={4} />
          <Text>Loading document...</Text>
        </Flex>
      );
    }
    
    if (error) {
      return (
        <Flex justify="center" align="center" h="100%" direction="column" color="red.500">
          <Text fontWeight="bold" mb={2}>Error Loading Document</Text>
          <Text>{error}</Text>
        </Flex>
      );
    }
    
    switch (documentType) {
      case 'pdf':
        return (
          <Box 
            ref={contentRef}
            as="iframe"
            src={documentUrl}
            width="100%"
            height="100%"
            border="none"
            style={{ 
              transform: `scale(${zoom}) translate(${transform.x / zoom}px, ${transform.y / zoom}px)`,
              transformOrigin: '0 0',
              transition: 'transform 0.1s ease'
            }}
            onLoad={handleDocumentLoad}
          />
        );
        
      case 'image':
        return (
          <Box 
            ref={contentRef}
            as="img"
            src={documentUrl}
            maxW="100%"
            height="auto"
            style={{ 
              transform: `scale(${zoom}) translate(${transform.x / zoom}px, ${transform.y / zoom}px)`,
              transformOrigin: '0 0',
              transition: 'transform 0.1s ease'
            }}
            onLoad={handleDocumentLoad}
          />
        );
      
      default:
        return (
          <Box 
            ref={contentRef}
            p={4}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            fontFamily="monospace"
            fontSize="16px"
            lineHeight="1.6"
            style={{ 
              transform: `scale(${zoom}) translate(${transform.x / zoom}px, ${transform.y / zoom}px)`,
              transformOrigin: '0 0',
              transition: 'transform 0.1s ease'
            }}
          >
            {documentUrl}
          </Box>
        );
    }
  };
  
  return (
    <Box 
      ref={containerRef}
      position="relative"
      width="100%" 
      height="100%"
      overflow="hidden"
      borderRadius="md"
      bg="gray.100"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderContent()}
      
      {/* Controls */}
      <Flex 
        position="absolute" 
        bottom="0" 
        left="0" 
        right="0" 
        bg="rgba(255, 255, 255, 0.8)" 
        p={3}
        justifyContent="space-between"
        alignItems="center"
        zIndex={10}
      >
        {/* Page Controls */}
        <Flex alignItems="center">
          <IconButton
            icon={<ChevronLeftIcon />}
            aria-label="Previous page"
            isDisabled={currentPage <= 1}
            onClick={prevPage}
            mr={2}
            size="sm"
            isRound
          />
          <Text fontSize="sm">{currentPage} / {totalPages}</Text>
          <IconButton
            icon={<ChevronRightIcon />}
            aria-label="Next page"
            isDisabled={currentPage >= totalPages}
            onClick={nextPage}
            ml={2}
            size="sm"
            isRound
          />
        </Flex>
        
        {/* Zoom Controls */}
        <Flex alignItems="center">
          <IconButton
            icon={<ZoomOutIcon />}
            aria-label="Zoom out"
            onClick={zoomOut}
            size="sm"
            mr={2}
            isRound
          />
          <Text fontSize="sm">{Math.round(zoom * 100)}%</Text>
          <IconButton
            icon={<ZoomInIcon />}
            aria-label="Zoom in"
            onClick={zoomIn}
            size="sm"
            ml={2}
            isRound
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default MobileDocumentViewer;