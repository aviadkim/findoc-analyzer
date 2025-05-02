import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for document processing
 * @param {Object} options - Hook options
 * @param {string} options.apiUrl - API endpoint URL
 * @param {number} options.pollingInterval - Polling interval in milliseconds
 * @param {boolean} options.showToasts - Whether to show toast notifications
 * @returns {Object} Document processing utilities
 */
const useDocumentProcessor = ({
  apiUrl = 'http://localhost:24125/api/rag',
  pollingInterval = 2000,
  showToasts = true,
} = {}) => {
  const [file, setFile] = useState(null);
  const [languages, setLanguages] = useState('eng,heb');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [visualizations, setVisualizations] = useState([]);
  
  const toast = useToast();
  const pollingIntervalRef = useRef(null);
  const cancelTokenSourceRef = useRef(null);

  // Clean up polling interval and cancel token on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Handle file change
  const handleFileChange = useCallback((selectedFile) => {
    setFile(selectedFile);
  }, []);

  // Handle languages change
  const handleLanguagesChange = useCallback((selectedLanguages) => {
    setLanguages(selectedLanguages);
  }, []);

  // Process document
  const processDocument = useCallback(async () => {
    if (!file) {
      if (showToasts) {
        toast({
          title: 'No file selected',
          description: 'Please select a PDF file to process',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setResult(null);
      setError(null);
      
      // Create a new cancel token source
      cancelTokenSourceRef.current = axios.CancelToken.source();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('languages', languages);
      
      // Upload file and start processing
      const response = await axios.post(`${apiUrl}/process`, formData, {
        cancelToken: cancelTokenSourceRef.current.token,
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to process document: ${response.statusText}`);
      }
      
      const data = response.data;
      setTaskId(data.task_id);
      
      // Start polling for status
      pollingIntervalRef.current = setInterval(() => {
        checkStatus(data.task_id);
      }, pollingInterval);
      
      if (showToasts) {
        toast({
          title: 'Processing started',
          description: 'Your document is being processed',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return;
      }
      
      const errorObj = handleApiError(error, showToasts ? toast : null);
      setError(errorObj.message);
      setIsProcessing(false);
    }
  }, [file, languages, apiUrl, pollingInterval, showToasts, toast]);

  // Check processing status
  const checkStatus = useCallback(async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/task/${id}`, {
        cancelToken: cancelTokenSourceRef.current?.token,
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }
      
      const data = response.data;
      setProgress(data.progress * 100);
      
      if (data.status === 'completed') {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        getResult(id);
      } else if (data.status === 'failed') {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsProcessing(false);
        setError(data.error || 'Processing failed');
        
        if (showToasts) {
          toast({
            title: 'Processing failed',
            description: data.error || 'An error occurred during processing',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return;
      }
      
      console.error('Error checking status:', error);
    }
  }, [apiUrl, showToasts, toast]);

  // Get processing result
  const getResult = useCallback(async (id) => {
    try {
      const response = await axios.get(`${apiUrl}/result/${id}`, {
        cancelToken: cancelTokenSourceRef.current?.token,
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to get result: ${response.statusText}`);
      }
      
      const data = response.data;
      setResult(data);
      setIsProcessing(false);
      
      if (showToasts) {
        toast({
          title: 'Processing complete',
          description: `Extracted ${data.metrics.total_securities} securities with total value ${data.portfolio.total_value.toLocaleString()} ${data.portfolio.currency}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return;
      }
      
      const errorObj = handleApiError(error, showToasts ? toast : null);
      setError(errorObj.message);
      setIsProcessing(false);
    }
  }, [apiUrl, showToasts, toast]);

  // Get visualizations
  const getVisualizations = useCallback(async () => {
    if (!taskId) return;
    
    try {
      const response = await axios.get(`${apiUrl}/visualizations/${taskId}`, {
        cancelToken: cancelTokenSourceRef.current?.token,
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to get visualizations: ${response.statusText}`);
      }
      
      const data = response.data;
      setVisualizations(data.files);
      return data.files;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return;
      }
      
      const errorObj = handleApiError(error, showToasts ? toast : null);
      console.error('Error getting visualizations:', errorObj);
      return [];
    }
  }, [apiUrl, taskId, showToasts, toast]);

  // Cancel processing
  const cancelProcessing = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Processing canceled by user');
      cancelTokenSourceRef.current = axios.CancelToken.source();
    }
    
    setIsProcessing(false);
    
    if (showToasts) {
      toast({
        title: 'Processing canceled',
        description: 'Document processing has been canceled',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [showToasts, toast]);

  // Reset state
  const reset = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setFile(null);
    setProgress(0);
    setTaskId(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
    setVisualizations([]);
  }, []);

  // Download result as JSON
  const downloadJson = useCallback(() => {
    if (!result) return;
    
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.document_info.document_id}_processed.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, [result]);

  return {
    file,
    languages,
    isProcessing,
    progress,
    taskId,
    result,
    error,
    visualizations,
    handleFileChange,
    handleLanguagesChange,
    processDocument,
    getVisualizations,
    cancelProcessing,
    reset,
    downloadJson,
  };
};

export default useDocumentProcessor;
