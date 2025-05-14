import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import axios from 'axios';

/**
 * Plugin Management component for FinDoc Analyzer
 */
const PluginManagement = () => {
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [pluginConfig, setPluginConfig] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isConfigOpen,
    onOpen: onConfigOpen,
    onClose: onConfigClose
  } = useDisclosure();
  
  const toast = useToast();
  
  // Load plugins on component mount
  useEffect(() => {
    fetchPlugins();
  }, []);
  
  /**
   * Fetch the list of plugins from the API
   */
  const fetchPlugins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/plugins');
      setPlugins(response.data.plugins || []);
    } catch (error) {
      console.error('Error fetching plugins:', error);
      setError('Failed to load plugins. Please try again.');
      
      toast({
        title: 'Error',
        description: 'Failed to load plugins',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Open plugin configuration modal
   * 
   * @param {Object} plugin - The plugin to configure
   */
  const openPluginConfig = async (plugin) => {
    try {
      setSelectedPlugin(plugin);
      
      const response = await axios.get(`/api/plugins/${plugin.id}/config`);
      setPluginConfig(response.data.config || {});
      
      onConfigOpen();
    } catch (error) {
      console.error('Error fetching plugin config:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to load plugin configuration',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  /**
   * Save plugin configuration
   */
  const savePluginConfig = async () => {
    try {
      await axios.post(`/api/plugins/${selectedPlugin.id}/config`, {
        config: pluginConfig
      });
      
      toast({
        title: 'Success',
        description: 'Plugin configuration saved',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onConfigClose();
    } catch (error) {
      console.error('Error saving plugin config:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to save plugin configuration',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  /**
   * Handle plugin activation/deactivation
   * 
   * @param {Object} plugin - The plugin to activate/deactivate
   * @param {boolean} active - Whether to activate or deactivate
   */
  const togglePluginActive = async (plugin, active) => {
    try {
      const endpoint = active ? 'activate' : 'deactivate';
      await axios.post(`/api/plugins/${plugin.id}/${endpoint}`);
      
      // Update plugin list
      setPlugins(plugins.map(p => 
        p.id === plugin.id ? { ...p, active } : p
      ));
      
      toast({
        title: 'Success',
        description: `Plugin ${active ? 'activated' : 'deactivated'}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error(`Error ${active ? 'activating' : 'deactivating'} plugin:`, error);
      
      toast({
        title: 'Error',
        description: `Failed to ${active ? 'activate' : 'deactivate'} plugin`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  /**
   * Uninstall a plugin
   * 
   * @param {Object} plugin - The plugin to uninstall
   */
  const uninstallPlugin = async (plugin) => {
    if (!window.confirm(`Are you sure you want to uninstall ${plugin.manifest.name}?`)) {
      return;
    }
    
    try {
      await axios.post(`/api/plugins/${plugin.id}/uninstall`);
      
      // Remove from plugin list
      setPlugins(plugins.filter(p => p.id !== plugin.id));
      
      toast({
        title: 'Success',
        description: 'Plugin uninstalled',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error uninstalling plugin:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to uninstall plugin',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  /**
   * Handle plugin file selection
   * 
   * @param {Object} event - File input change event
   */
  const handleFileChange = (event) => {
    setUploadFile(event.target.files[0]);
  };
  
  /**
   * Upload and install a plugin
   */
  const uploadPlugin = async () => {
    if (!uploadFile) {
      toast({
        title: 'Error',
        description: 'Please select a plugin file',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('plugin', uploadFile);
      
      const response = await axios.post('/api/plugins/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add to plugin list
      setPlugins([...plugins, response.data.plugin]);
      
      toast({
        title: 'Success',
        description: 'Plugin installed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Reset form
      setUploadFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading plugin:', error);
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload plugin',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  /**
   * Reload all plugins
   */
  const reloadPlugins = async () => {
    try {
      await axios.post('/api/plugins/reload');
      
      toast({
        title: 'Success',
        description: 'Plugins reloaded',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Refetch plugins
      fetchPlugins();
    } catch (error) {
      console.error('Error reloading plugins:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to reload plugins',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  /**
   * Handle config field change
   * 
   * @param {string} key - Config key
   * @param {any} value - Config value
   */
  const handleConfigChange = (key, value) => {
    setPluginConfig({
      ...pluginConfig,
      [key]: value
    });
  };
  
  /**
   * Render config fields based on config type
   * 
   * @param {string} key - Config key
   * @param {any} value - Config value
   */
  const renderConfigField = (key, value) => {
    // Skip internal fields that start with underscore
    if (key.startsWith('_')) {
      return null;
    }
    
    const fieldType = typeof value;
    
    switch (fieldType) {
      case 'boolean':
        return (
          <FormControl key={key} display="flex" alignItems="center" my={2}>
            <FormLabel htmlFor={key} mb="0">
              {key}
            </FormLabel>
            <Switch
              id={key}
              isChecked={value}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
            />
          </FormControl>
        );
        
      case 'number':
        return (
          <FormControl key={key} my={2}>
            <FormLabel htmlFor={key}>{key}</FormLabel>
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => handleConfigChange(key, Number(e.target.value))}
            />
          </FormControl>
        );
        
      case 'string':
        return (
          <FormControl key={key} my={2}>
            <FormLabel htmlFor={key}>{key}</FormLabel>
            <Input
              id={key}
              type="text"
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
            />
          </FormControl>
        );
        
      default:
        // For complex objects, we don't provide UI editing
        return (
          <FormControl key={key} my={2}>
            <FormLabel htmlFor={key}>{key}</FormLabel>
            <Text color="gray.500">Complex value (edit not supported)</Text>
          </FormControl>
        );
    }
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">Plugin Management</Heading>
        <Flex>
          <Button 
            leftIcon={<RepeatIcon />} 
            mr={2}
            onClick={reloadPlugins}
            isLoading={isLoading}
          >
            Reload
          </Button>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={onOpen}
          >
            Install Plugin
          </Button>
        </Flex>
      </Flex>
      
      {error && (
        <Box bg="red.50" p={3} borderRadius="md" mb={4}>
          <Text color="red.500">{error}</Text>
        </Box>
      )}
      
      {isLoading ? (
        <Text>Loading plugins...</Text>
      ) : plugins.length === 0 ? (
        <Card>
          <CardBody>
            <Text textAlign="center">No plugins installed</Text>
          </CardBody>
        </Card>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Version</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {plugins.map(plugin => (
              <Tr key={plugin.id}>
                <Td fontWeight="medium">{plugin.manifest.name}</Td>
                <Td>{plugin.manifest.version}</Td>
                <Td>{plugin.manifest.description}</Td>
                <Td>
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id={`active-${plugin.id}`}
                      isChecked={plugin.active}
                      onChange={(e) => togglePluginActive(plugin, e.target.checked)}
                      colorScheme="green"
                    />
                    <FormLabel htmlFor={`active-${plugin.id}`} mb="0" ml={2}>
                      {plugin.active ? 'Active' : 'Inactive'}
                    </FormLabel>
                  </FormControl>
                </Td>
                <Td>
                  <IconButton
                    icon={<SettingsIcon />}
                    aria-label="Configure plugin"
                    mr={2}
                    onClick={() => openPluginConfig(plugin)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Uninstall plugin"
                    colorScheme="red"
                    onClick={() => uninstallPlugin(plugin)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      
      {/* Upload Plugin Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Install Plugin</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Plugin File (ZIP)</FormLabel>
              <Input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                p={1}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={uploadPlugin}
              isLoading={isUploading}
            >
              Upload & Install
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Plugin Configuration Modal */}
      <Modal isOpen={isConfigOpen} onClose={onConfigClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPlugin?.manifest.name} Configuration
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPlugin && (
              <Stack spacing={4}>
                <Text fontStyle="italic" color="gray.600">
                  {selectedPlugin.manifest.description}
                </Text>
                
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">Plugin Information</Text>
                  <Text fontSize="sm">Version: {selectedPlugin.manifest.version}</Text>
                  <Text fontSize="sm">Author: {selectedPlugin.manifest.author || 'Unknown'}</Text>
                  <Text fontSize="sm">
                    Extension Points: {selectedPlugin.manifest.extensionPoints?.join(', ') || 'None'}
                  </Text>
                </Box>
                
                <Heading size="md" mt={4}>Settings</Heading>
                
                {Object.keys(pluginConfig).length === 0 ? (
                  <Text>This plugin has no configurable settings.</Text>
                ) : (
                  Object.entries(pluginConfig).map(([key, value]) => 
                    renderConfigField(key, value)
                  )
                )}
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfigClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={savePluginConfig}
            >
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PluginManagement;