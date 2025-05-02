import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import { useToast } from '@chakra-ui/react';

/**
 * Custom hook for making API calls
 * @param {Object} options - Hook options
 * @param {string} options.url - API endpoint URL
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request data
 * @param {Object} options.params - Query parameters
 * @param {Object} options.headers - Request headers
 * @param {boolean} options.withCredentials - Whether to include credentials
 * @param {boolean} options.showErrors - Whether to show error toasts
 * @param {boolean} options.loadOnMount - Whether to make the request when the component mounts
 * @returns {Object} API call utilities
 */
const useApi = ({
  url,
  method = 'GET',
  data = null,
  params = null,
  headers = {},
  withCredentials = false,
  showErrors = true,
  loadOnMount = false,
}) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const cancelTokenSourceRef = useRef(null);

  // Create a new cancel token source when the component mounts
  useEffect(() => {
    cancelTokenSourceRef.current = axios.CancelToken.source();
    
    return () => {
      // Cancel the request when the component unmounts
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Request canceled due to component unmount');
      }
    };
  }, []);

  // Make the API call
  const callApi = useCallback(async (callOptions = {}) => {
    // Merge options with defaults
    const mergedOptions = {
      url: callOptions.url || url,
      method: callOptions.method || method,
      data: callOptions.data || data,
      params: callOptions.params || params,
      headers: { ...headers, ...callOptions.headers },
      withCredentials: callOptions.withCredentials !== undefined ? callOptions.withCredentials : withCredentials,
    };
    
    // Create a new cancel token source for this request
    const cancelTokenSource = axios.CancelToken.source();
    cancelTokenSourceRef.current = cancelTokenSource;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await axios({
        ...mergedOptions,
        cancelToken: cancelTokenSource.token,
      });
      
      setResponse(result.data);
      return result.data;
    } catch (err) {
      // Ignore canceled requests
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
        return null;
      }
      
      // Handle API errors
      const errorObj = handleApiError(err, showErrors ? toast : null);
      setError(errorObj);
      
      // Rethrow the error for the caller to handle
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [url, method, data, params, headers, withCredentials, showErrors, toast]);

  // Cancel the current request
  const cancelRequest = useCallback((message = 'Request canceled by user') => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel(message);
      // Create a new cancel token source for future requests
      cancelTokenSourceRef.current = axios.CancelToken.source();
    }
  }, []);

  // Reset the state
  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  // Make the request when the component mounts if loadOnMount is true
  useEffect(() => {
    if (loadOnMount) {
      callApi();
    }
  }, [loadOnMount, callApi]);

  return {
    response,
    error,
    loading,
    callApi,
    cancelRequest,
    reset,
  };
};

export default useApi;
