import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Checkbox,
  Stack,
  Heading,
  Text,
  Flex,
  IconButton,
  useToast,
  Textarea,
  Divider,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiList, FiUpload, FiFile, FiBarChart2, FiDatabase } from 'react-icons/fi';
import axios from 'axios';

/**
 * Initial task template by type
 */
const taskTemplates = {
  'document-processing': {
    type: 'document-processing',
    name: 'Process Document',
    data: {
      documentId: '',
      options: {
        performOcr: false,
        enhancedMode: true,
        detectTables: true
      }
    }
  },
  'data-export': {
    type: 'data-export',
    name: 'Export Data',
    data: {
      documentId: '',
      exportFormat: 'json',
      options: {
        saveToStorage: true,
        includeTimestamp: true
      }
    }
  },
  'document-comparison': {
    type: 'document-comparison',
    name: 'Compare Documents',
    data: {
      documentIds: ['', ''],
      comparisonType: 'complete',
      options: {
        includeCharts: true,
        normalizeDates: true
      }
    }
  },
  'portfolio-analysis': {
    type: 'portfolio-analysis',
    name: 'Analyze Portfolio',
    data: {
      documentId: '',
      analysisTypes: ['complete'],
      options: {
        includeCharts: true,
        includeBenchmarkComparison: true
      }
    }
  },
  'bulk-import': {
    type: 'bulk-import',
    name: 'Bulk Import',
    data: {
      documents: [],
      options: {
        skipDuplicates: true,
        autoProcessing: true
      }
    }
  }
};

/**
 * Form for creating batch jobs
 */
const BatchJobCreationForm = ({ onJobCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    priority: 'normal',
    tasks: [],
    metadata: {},
    options: {
      retryCount: 3,
      retryDelay: 5000,
      continueOnFailure: false
    }
  });
  
  const [metadataFields, setMetadataFields] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Add a new task
  const addTask = (taskType) => {
    const newTask = { ...taskTemplates[taskType], id: `task-${Date.now()}` };
    setFormData({
      ...formData,
      tasks: [...formData.tasks, newTask]
    });
  };

  // Remove a task
  const removeTask = (taskIndex) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks.splice(taskIndex, 1);
    setFormData({
      ...formData,
      tasks: updatedTasks
    });
  };

  // Update task data
  const updateTaskData = (taskIndex, updatedTask) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[taskIndex] = updatedTask;
    setFormData({
      ...formData,
      tasks: updatedTasks
    });
  };

  // Add metadata field
  const addMetadataField = () => {
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  // Update metadata field
  const updateMetadataField = (index, field, value) => {
    const updatedFields = [...metadataFields];
    updatedFields[index][field] = value;
    
    // Update formData.metadata
    const updatedMetadata = { ...formData.metadata };
    metadataFields.forEach(field => {
      if (field.key.trim()) {
        updatedMetadata[field.key] = field.value;
      }
    });
    
    setFormData({
      ...formData,
      metadata: updatedMetadata
    });
    
    setMetadataFields(updatedFields);
  };

  // Remove metadata field
  const removeMetadataField = (index) => {
    const updatedFields = [...metadataFields];
    const removedField = updatedFields[index];
    updatedFields.splice(index, 1);
    
    // Update formData.metadata
    const updatedMetadata = { ...formData.metadata };
    if (removedField && removedField.key) {
      delete updatedMetadata[removedField.key];
    }
    
    setFormData({
      ...formData,
      metadata: updatedMetadata
    });
    
    setMetadataFields(updatedFields);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Job name is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (formData.tasks.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one task is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/batch/jobs', formData);
      
      if (response.data.success) {
        toast({
          title: 'Batch Job Created',
          description: `Job ID: ${response.data.job.id}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form
        setFormData({
          name: '',
          priority: 'normal',
          tasks: [],
          metadata: {},
          options: {
            retryCount: 3,
            retryDelay: 5000,
            continueOnFailure: false
          }
        });
        setMetadataFields([]);
        
        // Notify parent component
        if (onJobCreated) {
          onJobCreated(response.data.job);
        }
      } else {
        toast({
          title: 'Error Creating Job',
          description: response.data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating batch job:', error);
      
      toast({
        title: 'Error Creating Job',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render task forms based on type
  const renderTaskForm = (task, index) => {
    switch (task.type) {
      case 'document-processing':
        return (
          <Card key={task.id} mb={4} variant="outline">
            <CardHeader bg="blue.50" p={3}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Badge colorScheme="blue" mr={2}>Document Processing</Badge>
                  <Input
                    value={task.name}
                    onChange={(e) => updateTaskData(index, { ...task, name: e.target.value })}
                    placeholder="Task Name"
                    size="sm"
                    width="250px"
                  />
                </Flex>
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeTask(index)}
                  aria-label="Remove Task"
                />
              </Flex>
            </CardHeader>
            <CardBody pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Document ID</FormLabel>
                  <Input
                    value={task.data.documentId}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: { ...task.data, documentId: e.target.value }
                    })}
                    placeholder="Document ID"
                  />
                </FormControl>
              </SimpleGrid>
              
              <Heading size="xs" mt={4} mb={2}>Processing Options</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Perform OCR</FormLabel>
                  <Switch
                    isChecked={task.data.options?.performOcr}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          performOcr: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Enhanced Mode</FormLabel>
                  <Switch
                    isChecked={task.data.options?.enhancedMode}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          enhancedMode: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Detect Tables</FormLabel>
                  <Switch
                    isChecked={task.data.options?.detectTables}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          detectTables: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        );
        
      case 'data-export':
        return (
          <Card key={task.id} mb={4} variant="outline">
            <CardHeader bg="green.50" p={3}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Badge colorScheme="green" mr={2}>Data Export</Badge>
                  <Input
                    value={task.name}
                    onChange={(e) => updateTaskData(index, { ...task, name: e.target.value })}
                    placeholder="Task Name"
                    size="sm"
                    width="250px"
                  />
                </Flex>
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeTask(index)}
                  aria-label="Remove Task"
                />
              </Flex>
            </CardHeader>
            <CardBody pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Document ID</FormLabel>
                  <Input
                    value={task.data.documentId}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: { ...task.data, documentId: e.target.value }
                    })}
                    placeholder="Document ID"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Export Format</FormLabel>
                  <Select
                    value={task.data.exportFormat}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: { ...task.data, exportFormat: e.target.value }
                    })}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="pdf">PDF</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <Heading size="xs" mt={4} mb={2}>Export Options</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Save to Storage</FormLabel>
                  <Switch
                    isChecked={task.data.options?.saveToStorage}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          saveToStorage: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Include Timestamp</FormLabel>
                  <Switch
                    isChecked={task.data.options?.includeTimestamp}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          includeTimestamp: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        );
        
      case 'document-comparison':
        return (
          <Card key={task.id} mb={4} variant="outline">
            <CardHeader bg="purple.50" p={3}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Badge colorScheme="purple" mr={2}>Document Comparison</Badge>
                  <Input
                    value={task.name}
                    onChange={(e) => updateTaskData(index, { ...task, name: e.target.value })}
                    placeholder="Task Name"
                    size="sm"
                    width="250px"
                  />
                </Flex>
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeTask(index)}
                  aria-label="Remove Task"
                />
              </Flex>
            </CardHeader>
            <CardBody pt={4}>
              <FormControl mb={4}>
                <FormLabel>Document IDs (comma separated)</FormLabel>
                <Input
                  value={task.data.documentIds.join(',')}
                  onChange={(e) => updateTaskData(index, {
                    ...task,
                    data: { 
                      ...task.data, 
                      documentIds: e.target.value.split(',').map(id => id.trim()).filter(id => id) 
                    }
                  })}
                  placeholder="doc-123, doc-456"
                />
                <FormHelperText>At least two document IDs are required</FormHelperText>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Comparison Type</FormLabel>
                <Select
                  value={task.data.comparisonType}
                  onChange={(e) => updateTaskData(index, {
                    ...task,
                    data: { ...task.data, comparisonType: e.target.value }
                  })}
                >
                  <option value="complete">Complete</option>
                  <option value="holdings">Holdings</option>
                  <option value="performance">Performance</option>
                  <option value="allocation">Allocation</option>
                </Select>
              </FormControl>
              
              <Heading size="xs" mt={4} mb={2}>Comparison Options</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Include Charts</FormLabel>
                  <Switch
                    isChecked={task.data.options?.includeCharts}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          includeCharts: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Normalize Dates</FormLabel>
                  <Switch
                    isChecked={task.data.options?.normalizeDates}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          normalizeDates: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        );
        
      case 'portfolio-analysis':
        return (
          <Card key={task.id} mb={4} variant="outline">
            <CardHeader bg="orange.50" p={3}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Badge colorScheme="orange" mr={2}>Portfolio Analysis</Badge>
                  <Input
                    value={task.name}
                    onChange={(e) => updateTaskData(index, { ...task, name: e.target.value })}
                    placeholder="Task Name"
                    size="sm"
                    width="250px"
                  />
                </Flex>
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeTask(index)}
                  aria-label="Remove Task"
                />
              </Flex>
            </CardHeader>
            <CardBody pt={4}>
              <FormControl mb={4}>
                <FormLabel>Document ID</FormLabel>
                <Input
                  value={task.data.documentId}
                  onChange={(e) => updateTaskData(index, {
                    ...task,
                    data: { ...task.data, documentId: e.target.value }
                  })}
                  placeholder="Document ID"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Analysis Types</FormLabel>
                <Select
                  value={task.data.analysisTypes[0]}
                  onChange={(e) => updateTaskData(index, {
                    ...task,
                    data: { ...task.data, analysisTypes: [e.target.value] }
                  })}
                >
                  <option value="complete">Complete Analysis</option>
                  <option value="asset_allocation">Asset Allocation</option>
                  <option value="sector_breakdown">Sector Breakdown</option>
                  <option value="risk_metrics">Risk Metrics</option>
                  <option value="performance">Performance</option>
                  <option value="geographic_exposure">Geographic Exposure</option>
                </Select>
              </FormControl>
              
              <Heading size="xs" mt={4} mb={2}>Analysis Options</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Include Charts</FormLabel>
                  <Switch
                    isChecked={task.data.options?.includeCharts}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          includeCharts: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Include Benchmark Comparison</FormLabel>
                  <Switch
                    isChecked={task.data.options?.includeBenchmarkComparison}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          includeBenchmarkComparison: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        );
        
      case 'bulk-import':
        return (
          <Card key={task.id} mb={4} variant="outline">
            <CardHeader bg="teal.50" p={3}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Badge colorScheme="teal" mr={2}>Bulk Import</Badge>
                  <Input
                    value={task.name}
                    onChange={(e) => updateTaskData(index, { ...task, name: e.target.value })}
                    placeholder="Task Name"
                    size="sm"
                    width="250px"
                  />
                </Flex>
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeTask(index)}
                  aria-label="Remove Task"
                />
              </Flex>
            </CardHeader>
            <CardBody pt={4}>
              <FormControl mb={4}>
                <FormLabel>Document IDs (JSON format)</FormLabel>
                <Textarea
                  value={JSON.stringify(task.data.documents, null, 2)}
                  onChange={(e) => {
                    try {
                      const documents = JSON.parse(e.target.value);
                      updateTaskData(index, {
                        ...task,
                        data: { ...task.data, documents }
                      });
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  placeholder={`[
  { "filename": "report1.pdf", "source": "upload" },
  { "filename": "report2.pdf", "source": "upload" }
]`}
                  minHeight="150px"
                />
                <FormHelperText>Enter documents as JSON array</FormHelperText>
              </FormControl>
              
              <Heading size="xs" mt={4} mb={2}>Import Options</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Skip Duplicates</FormLabel>
                  <Switch
                    isChecked={task.data.options?.skipDuplicates}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          skipDuplicates: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Auto Processing</FormLabel>
                  <Switch
                    isChecked={task.data.options?.autoProcessing}
                    onChange={(e) => updateTaskData(index, {
                      ...task,
                      data: {
                        ...task.data,
                        options: {
                          ...task.data.options,
                          autoProcessing: e.target.checked
                        }
                      }
                    })}
                  />
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        );
        
      default:
        return (
          <Card key={task.id} mb={4} variant="outline">
            <CardHeader bg="gray.50" p={3}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Badge mr={2}>Unknown Task Type</Badge>
                  <Text>{task.type}</Text>
                </Flex>
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeTask(index)}
                  aria-label="Remove Task"
                />
              </Flex>
            </CardHeader>
          </Card>
        );
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Heading size="md" mb={4}>Create Batch Job</Heading>
      
      {/* Basic job information */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
        <FormControl isRequired>
          <FormLabel>Job Name</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter job name"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Priority</FormLabel>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </Select>
        </FormControl>
      </SimpleGrid>
      
      {/* Tasks */}
      <Box mb={6}>
        <Heading size="sm" mb={3}>Tasks</Heading>
        
        {formData.tasks.length === 0 ? (
          <Text color="gray.500" mb={4}>No tasks added yet. Use the buttons below to add tasks.</Text>
        ) : (
          <Box mb={4}>
            {formData.tasks.map((task, index) => renderTaskForm(task, index))}
          </Box>
        )}
        
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3}>
          <Button
            leftIcon={<FiFile />}
            onClick={() => addTask('document-processing')}
            colorScheme="blue"
            variant="outline"
            size="sm"
          >
            Document Processing
          </Button>
          
          <Button
            leftIcon={<FiDownload />}
            onClick={() => addTask('data-export')}
            colorScheme="green"
            variant="outline"
            size="sm"
          >
            Data Export
          </Button>
          
          <Button
            leftIcon={<FiList />}
            onClick={() => addTask('document-comparison')}
            colorScheme="purple"
            variant="outline"
            size="sm"
          >
            Document Comparison
          </Button>
          
          <Button
            leftIcon={<FiBarChart2 />}
            onClick={() => addTask('portfolio-analysis')}
            colorScheme="orange"
            variant="outline"
            size="sm"
          >
            Portfolio Analysis
          </Button>
          
          <Button
            leftIcon={<FiUpload />}
            onClick={() => addTask('bulk-import')}
            colorScheme="teal"
            variant="outline"
            size="sm"
          >
            Bulk Import
          </Button>
        </SimpleGrid>
      </Box>
      
      <Divider my={6} />
      
      {/* Job Options */}
      <Box mb={6}>
        <Heading size="sm" mb={3}>Job Options</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>Retry Count</FormLabel>
            <NumberInput
              min={0}
              max={10}
              value={formData.options.retryCount}
              onChange={(valueString) => setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  retryCount: parseInt(valueString, 10)
                }
              })}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>Number of retry attempts for failed tasks</FormHelperText>
          </FormControl>
          
          <FormControl>
            <FormLabel>Retry Delay (ms)</FormLabel>
            <NumberInput
              min={1000}
              max={60000}
              step={1000}
              value={formData.options.retryDelay}
              onChange={(valueString) => setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  retryDelay: parseInt(valueString, 10)
                }
              })}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>Delay between retry attempts</FormHelperText>
          </FormControl>
          
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Continue On Failure</FormLabel>
            <Switch
              isChecked={formData.options.continueOnFailure}
              onChange={(e) => setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  continueOnFailure: e.target.checked
                }
              })}
            />
            <FormHelperText ml={2}>Continue processing tasks if some fail</FormHelperText>
          </FormControl>
        </SimpleGrid>
        
        <FormControl mt={4}>
          <FormLabel>Webhook URL (optional)</FormLabel>
          <Input
            value={formData.options.webhookUrl || ''}
            onChange={(e) => setFormData({
              ...formData,
              options: {
                ...formData.options,
                webhookUrl: e.target.value
              }
            })}
            placeholder="https://example.com/webhook"
          />
          <FormHelperText>URL to receive job status notifications</FormHelperText>
        </FormControl>
      </Box>
      
      {/* Metadata */}
      <Box mb={6}>
        <Flex align="center" mb={3}>
          <Heading size="sm">Metadata</Heading>
          <Button
            size="xs"
            ml={2}
            leftIcon={<FiPlus />}
            onClick={addMetadataField}
          >
            Add Field
          </Button>
        </Flex>
        
        {metadataFields.length === 0 ? (
          <Text color="gray.500" mb={4}>No metadata fields added yet. Click "Add Field" to add metadata.</Text>
        ) : (
          <Stack spacing={3} mb={4}>
            {metadataFields.map((field, index) => (
              <Flex key={index} gap={2}>
                <Input
                  placeholder="Key"
                  value={field.key}
                  onChange={(e) => updateMetadataField(index, 'key', e.target.value)}
                  width="40%"
                />
                <Input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateMetadataField(index, 'value', e.target.value)}
                  width="60%"
                />
                <IconButton
                  icon={<FiTrash2 />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeMetadataField(index)}
                  aria-label="Remove Field"
                />
              </Flex>
            ))}
          </Stack>
        )}
      </Box>
      
      {/* Submit button */}
      <Button
        type="submit"
        colorScheme="blue"
        isLoading={isSubmitting}
        loadingText="Creating Job"
        isDisabled={formData.tasks.length === 0}
      >
        Create Batch Job
      </Button>
    </Box>
  );
};

export default BatchJobCreationForm;