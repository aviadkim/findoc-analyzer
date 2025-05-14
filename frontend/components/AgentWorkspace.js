import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Stepper, Step, StepLabel,
  Card, CardContent, CardHeader, CardActions, IconButton, Divider,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, TextField, CircularProgress,
  Switch, FormControlLabel, Alert, Collapse, Badge
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Save as SaveIcon,
  DeleteOutline as DeleteIcon,
  Code as CodeIcon,
  Description as DocumentIcon,
  BarChart as ChartIcon,
  Layers as LayersIcon,
  Assignment as ReportIcon
} from '@mui/icons-material';

// Sample agent configurations
const AVAILABLE_AGENTS = [
  {
    id: 'isin-extractor',
    name: 'ISIN Extractor Agent',
    description: 'Extracts ISINs and related information from financial documents',
    category: 'extraction',
    inputs: ['document'],
    outputs: ['isins', 'securities'],
    settings: {
      extract_currency: true,
      extract_security_names: true,
      filter_by_country_code: '',
      validation_level: 'strict'
    }
  },
  {
    id: 'financial-table-detector',
    name: 'Financial Table Detector Agent',
    description: 'Detects and extracts tables from financial documents',
    category: 'extraction',
    inputs: ['document'],
    outputs: ['tables'],
    settings: {
      detect_nested_tables: true,
      enhance_header_detection: true,
      min_confidence: 0.7,
      output_format: 'dataframe'
    }
  },
  {
    id: 'financial-data-analyzer',
    name: 'Financial Data Analyzer Agent',
    description: 'Analyzes financial data and extracts insights',
    category: 'analysis',
    inputs: ['tables', 'securities'],
    outputs: ['analysis'],
    settings: {
      analyze_allocation: true,
      analyze_performance: true,
      analyze_risk: true,
      analyze_expenses: true
    }
  },
  {
    id: 'document-merge',
    name: 'Document Merge Agent',
    description: 'Merges multiple financial documents',
    category: 'processing',
    inputs: ['documents'],
    outputs: ['merged_document'],
    settings: {
      merge_strategy: 'comprehensive',
      resolve_conflicts: 'latest',
      merge_metadata: true,
      generate_report: true
    }
  },
  {
    id: 'financial-advisor',
    name: 'Financial Advisor Agent',
    description: 'Provides financial advice based on portfolio analysis',
    category: 'advisor',
    inputs: ['analysis', 'portfolio'],
    outputs: ['recommendations', 'report'],
    settings: {
      risk_profile: 'moderate',
      consider_tax_efficiency: true,
      consider_fees: true,
      include_implementation_steps: true
    }
  },
  {
    id: 'data-export',
    name: 'Data Export Agent',
    description: 'Exports financial data to various formats',
    category: 'export',
    inputs: ['analysis', 'portfolio', 'tables', 'securities'],
    outputs: ['export_file'],
    settings: {
      format: 'excel',
      include_charts: true,
      include_metadata: true,
      export_details: true
    }
  },
  {
    id: 'document-comparison',
    name: 'Document Comparison Agent',
    description: 'Compares multiple financial documents',
    category: 'analysis',
    inputs: ['documents'],
    outputs: ['comparison', 'report'],
    settings: {
      comparison_type: 'comprehensive',
      highlight_significant_changes: true,
      generate_report: true,
      compare_metadata: true
    }
  }
];

// Agent categories for grouping
const AGENT_CATEGORIES = [
  { id: 'extraction', name: 'Data Extraction', icon: <DocumentIcon /> },
  { id: 'analysis', name: 'Analysis', icon: <AnalyticsIcon /> },
  { id: 'processing', name: 'Processing', icon: <LayersIcon /> },
  { id: 'advisor', name: 'Advisory', icon: <InfoIcon /> },
  { id: 'export', name: 'Export', icon: <SaveIcon /> }
];

const AgentWorkspace = ({ documents, onAgentResult }) => {
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [agentPipeline, setAgentPipeline] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('idle'); // idle, running, completed, error
  const [activeStep, setActiveStep] = useState(0);
  const [executionResults, setExecutionResults] = useState({});
  const [executionLogs, setExecutionLogs] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  const [agentSettings, setAgentSettings] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  // Filter agents by category
  const filteredAgents = AVAILABLE_AGENTS.filter(agent => 
    selectedCategory === 'all' || agent.category === selectedCategory
  );
  
  // Initialize with default pipeline
  useEffect(() => {
    // Check if there's a saved pipeline in localStorage
    const savedPipeline = localStorage.getItem('agentPipeline');
    if (savedPipeline) {
      try {
        const parsedPipeline = JSON.parse(savedPipeline);
        setAgentPipeline(parsedPipeline);
        
        // Extract just the agent IDs for the selected agents list
        setSelectedAgents(parsedPipeline.map(agent => agent.id));
      } catch (error) {
        console.error('Error loading saved pipeline:', error);
        // Use default pipeline if saved pipeline is corrupted
        initializeDefaultPipeline();
      }
    } else {
      // No saved pipeline, use default
      initializeDefaultPipeline();
    }
    
    // Load execution history
    const savedHistory = localStorage.getItem('executionHistory');
    if (savedHistory) {
      try {
        setExecutionHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading execution history:', error);
      }
    }
  }, []);
  
  // Initialize with a default pipeline
  const initializeDefaultPipeline = () => {
    const defaultPipeline = [
      AVAILABLE_AGENTS.find(agent => agent.id === 'isin-extractor'),
      AVAILABLE_AGENTS.find(agent => agent.id === 'financial-table-detector'),
      AVAILABLE_AGENTS.find(agent => agent.id === 'financial-data-analyzer')
    ].filter(Boolean);
    
    setAgentPipeline(defaultPipeline);
    setSelectedAgents(defaultPipeline.map(agent => agent.id));
  };
  
  // Add an agent to the pipeline
  const handleAddAgent = (agentId) => {
    // Check if agent is already in the pipeline
    if (selectedAgents.includes(agentId)) {
      showAlert('Agent is already in the pipeline', 'warning');
      return;
    }
    
    const agent = AVAILABLE_AGENTS.find(agent => agent.id === agentId);
    if (agent) {
      const updatedPipeline = [...agentPipeline, agent];
      setAgentPipeline(updatedPipeline);
      setSelectedAgents([...selectedAgents, agentId]);
      
      // Save the updated pipeline
      localStorage.setItem('agentPipeline', JSON.stringify(updatedPipeline));
      
      showAlert(`Added ${agent.name} to pipeline`, 'success');
    }
  };
  
  // Remove an agent from the pipeline
  const handleRemoveAgent = (agentId) => {
    const updatedPipeline = agentPipeline.filter(agent => agent.id !== agentId);
    setAgentPipeline(updatedPipeline);
    setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    
    // Save the updated pipeline
    localStorage.setItem('agentPipeline', JSON.stringify(updatedPipeline));
    
    showAlert('Agent removed from pipeline', 'info');
  };
  
  // Reorder agents in the pipeline
  const handleReorderPipeline = (fromIndex, toIndex) => {
    const updatedPipeline = [...agentPipeline];
    const [movedAgent] = updatedPipeline.splice(fromIndex, 1);
    updatedPipeline.splice(toIndex, 0, movedAgent);
    
    setAgentPipeline(updatedPipeline);
    setSelectedAgents(updatedPipeline.map(agent => agent.id));
    
    // Save the updated pipeline
    localStorage.setItem('agentPipeline', JSON.stringify(updatedPipeline));
  };
  
  // Execute the agent pipeline
  const executePipeline = async () => {
    if (agentPipeline.length === 0) {
      showAlert('No agents in the pipeline to execute', 'warning');
      return;
    }
    
    if (!documents || documents.length === 0) {
      showAlert('No documents selected for processing', 'warning');
      return;
    }
    
    // Reset previous execution state
    setExecutionResults({});
    setExecutionLogs([]);
    setPipelineStatus('running');
    setActiveStep(0);
    
    // Log the start of execution
    addExecutionLog('info', 'Starting agent pipeline execution');
    addExecutionLog('info', `Documents selected: ${documents.length}`);
    
    // Initialize context with documents
    let context = { documents };
    
    // Execute each agent in sequence
    for (let i = 0; i < agentPipeline.length; i++) {
      const agent = agentPipeline[i];
      setActiveStep(i);
      
      addExecutionLog('info', `Executing ${agent.name}...`);
      
      try {
        // Simulate agent execution
        const result = await simulateAgentExecution(agent, context);
        
        // Update context with agent result
        context = { ...context, ...result };
        
        // Update execution results
        setExecutionResults(prev => ({
          ...prev,
          [agent.id]: result
        }));
        
        addExecutionLog('success', `${agent.name} executed successfully`);
      } catch (error) {
        addExecutionLog('error', `Error executing ${agent.name}: ${error.message}`);
        setPipelineStatus('error');
        
        // Save execution to history
        saveExecutionToHistory({
          timestamp: new Date().toISOString(),
          status: 'error',
          pipeline: agentPipeline,
          documents: documents.length,
          error: error.message
        });
        
        return;
      }
    }
    
    // All agents executed successfully
    setPipelineStatus('completed');
    setActiveStep(agentPipeline.length);
    addExecutionLog('success', 'Pipeline execution completed successfully');
    
    // Save execution to history
    saveExecutionToHistory({
      timestamp: new Date().toISOString(),
      status: 'completed',
      pipeline: agentPipeline,
      documents: documents.length,
      results: executionResults
    });
    
    // Call the callback with results
    if (onAgentResult) {
      onAgentResult(context);
    }
  };
  
  // Simulate agent execution (for demo purposes)
  const simulateAgentExecution = (agent, context) => {
    return new Promise((resolve, reject) => {
      // Add a random delay to simulate processing time
      const delay = 1000 + Math.random() * 2000;
      
      setTimeout(() => {
        // Check for required inputs
        for (const input of agent.inputs) {
          if (input !== 'document' && input !== 'documents' && !context[input]) {
            reject(new Error(`Missing required input: ${input}`));
            return;
          }
        }
        
        // Simulate agent output based on agent type
        let result = {};
        
        switch (agent.id) {
          case 'isin-extractor':
            result = {
              isins: [
                { isin: 'US0378331005', security_name: 'Apple Inc.', currency: 'USD' },
                { isin: 'US5949181045', security_name: 'Microsoft Corp', currency: 'USD' },
                { isin: 'US88160R1014', security_name: 'Tesla Inc', currency: 'USD' }
              ],
              securities: [
                { isin: 'US0378331005', name: 'Apple Inc.', value: 50000, currency: 'USD' },
                { isin: 'US5949181045', name: 'Microsoft Corp', value: 40000, currency: 'USD' },
                { isin: 'US88160R1014', name: 'Tesla Inc', value: 30000, currency: 'USD' }
              ]
            };
            break;
            
          case 'financial-table-detector':
            result = {
              tables: [
                {
                  id: 'table-1',
                  title: 'Portfolio Holdings',
                  rows: 10,
                  columns: 5,
                  data: [] // Simplified for demo
                },
                {
                  id: 'table-2',
                  title: 'Performance Summary',
                  rows: 5,
                  columns: 3,
                  data: [] // Simplified for demo
                }
              ]
            };
            break;
            
          case 'financial-data-analyzer':
            result = {
              analysis: {
                portfolio_summary: {
                  total_value: 120000,
                  asset_allocation: {
                    equity: 60,
                    fixed_income: 30,
                    cash: 10
                  },
                  risk_metrics: {
                    volatility: 12.5,
                    sharpe_ratio: 0.85
                  },
                  performance_metrics: {
                    ytd_return: 8.3,
                    one_year_return: 12.7
                  }
                }
              }
            };
            break;
            
          case 'financial-advisor':
            result = {
              recommendations: {
                summary: 'Portfolio is well-diversified but slightly overweight in technology sector',
                asset_allocation: [
                  'Consider reducing technology exposure by 5%',
                  'Increase international exposure by 7%',
                  'Add 3% to fixed income allocation'
                ],
                risk_management: [
                  'Current risk level is appropriate for moderate risk profile',
                  'Consider adding more defensive sectors for better downside protection'
                ]
              },
              report: {
                title: 'Financial Advisory Report',
                sections: [
                  'Portfolio Analysis',
                  'Recommendations',
                  'Implementation Plan'
                ]
              }
            };
            break;
            
          case 'document-merge':
            result = {
              merged_document: {
                status: 'success',
                document_count: context.documents.length,
                securities_count: (context.securities || []).length,
                merge_date: new Date().toISOString()
              }
            };
            break;
            
          case 'data-export':
            result = {
              export_file: {
                filename: 'portfolio_analysis.xlsx',
                size: '124KB',
                format: agentSettings[agent.id]?.format || 'excel',
                status: 'generated'
              }
            };
            break;
            
          case 'document-comparison':
            result = {
              comparison: {
                status: 'success',
                document_count: context.documents.length,
                differences_found: 12,
                added_securities: 3,
                removed_securities: 1,
                changed_securities: 8
              },
              report: {
                title: 'Document Comparison Report',
                sections: [
                  'Executive Summary',
                  'Changes Overview',
                  'Detailed Analysis'
                ]
              }
            };
            break;
            
          default:
            result = { status: 'success' };
        }
        
        // Add a small chance of failure for demonstration
        if (Math.random() < 0.05) {
          reject(new Error('Simulated random failure'));
          return;
        }
        
        resolve(result);
      }, delay);
    });
  };
  
  // Add a log entry
  const addExecutionLog = (level, message) => {
    const timestamp = new Date().toISOString();
    setExecutionLogs(prev => [...prev, { timestamp, level, message }]);
  };
  
  // Save execution to history
  const saveExecutionToHistory = (execution) => {
    const updatedHistory = [execution, ...executionHistory.slice(0, 9)]; // Keep only 10 most recent
    setExecutionHistory(updatedHistory);
    localStorage.setItem('executionHistory', JSON.stringify(updatedHistory));
  };
  
  // Show an alert message
  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Open agent settings dialog
  const handleOpenSettings = (agent) => {
    setSelectedAgent(agent);
    // Initialize settings with current settings or defaults
    setAgentSettings(prev => ({
      ...prev,
      [agent.id]: prev[agent.id] || { ...agent.settings }
    }));
    setAgentSettingsOpen(true);
  };
  
  // Save agent settings
  const handleSaveSettings = () => {
    if (!selectedAgent) return;
    
    // Update agent settings
    setAgentSettings(prev => ({
      ...prev,
      [selectedAgent.id]: { ...prev[selectedAgent.id] }
    }));
    
    setAgentSettingsOpen(false);
    showAlert('Agent settings saved', 'success');
  };
  
  // Render settings fields for the selected agent
  const renderSettingsFields = () => {
    if (!selectedAgent) return null;
    
    const settings = agentSettings[selectedAgent.id] || {};
    
    return Object.entries(selectedAgent.settings).map(([key, defaultValue]) => {
      // Determine field type based on the default value
      if (typeof defaultValue === 'boolean') {
        return (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={settings[key] || false}
                onChange={(e) => {
                  setAgentSettings(prev => ({
                    ...prev,
                    [selectedAgent.id]: {
                      ...prev[selectedAgent.id],
                      [key]: e.target.checked
                    }
                  }));
                }}
              />
            }
            label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          />
        );
      } else if (typeof defaultValue === 'number') {
        return (
          <TextField
            key={key}
            label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            type="number"
            value={settings[key] || defaultValue}
            onChange={(e) => {
              setAgentSettings(prev => ({
                ...prev,
                [selectedAgent.id]: {
                  ...prev[selectedAgent.id],
                  [key]: parseFloat(e.target.value)
                }
              }));
            }}
            fullWidth
            margin="normal"
          />
        );
      } else if (typeof defaultValue === 'string') {
        // Check if value appears to be one of a predefined set (like an enum)
        if (['strategy', 'format', 'level', 'type', 'mode', 'profile'].some(term => key.includes(term))) {
          // Generate some appropriate options based on the field name
          const options = [];
          
          if (key.includes('format')) {
            options.push('json', 'csv', 'excel', 'pdf', 'html');
          } else if (key.includes('strategy') || key.includes('type')) {
            options.push('simple', 'comprehensive', 'detailed', 'basic', 'advanced');
          } else if (key.includes('level')) {
            options.push('strict', 'moderate', 'relaxed', 'high', 'medium', 'low');
          } else if (key.includes('profile')) {
            options.push('conservative', 'moderate', 'aggressive', 'growth');
          } else {
            options.push('default', 'alternative', 'custom');
          }
          
          return (
            <FormControl fullWidth margin="normal" key={key}>
              <InputLabel>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</InputLabel>
              <Select
                value={settings[key] || defaultValue}
                onChange={(e) => {
                  setAgentSettings(prev => ({
                    ...prev,
                    [selectedAgent.id]: {
                      ...prev[selectedAgent.id],
                      [key]: e.target.value
                    }
                  }));
                }}
                label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              >
                {options.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        } else {
          return (
            <TextField
              key={key}
              label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              value={settings[key] || defaultValue}
              onChange={(e) => {
                setAgentSettings(prev => ({
                  ...prev,
                  [selectedAgent.id]: {
                    ...prev[selectedAgent.id],
                    [key]: e.target.value
                  }
                }));
              }}
              fullWidth
              margin="normal"
            />
          );
        }
      }
      
      return null;
    });
  };
  
  // Render agent card for selection
  const renderAgentCard = (agent) => {
    const isSelected = selectedAgents.includes(agent.id);
    
    return (
      <Card 
        key={agent.id} 
        variant={isSelected ? 'outlined' : 'elevation'}
        sx={{
          mb: 2,
          border: isSelected ? '2px solid #4caf50' : '1px solid #e0e0e0',
          backgroundColor: isSelected ? '#f1f8e9' : 'white'
        }}
      >
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="h6">{agent.name}</Typography>
              {isSelected && (
                <Chip
                  label="In Pipeline"
                  size="small"
                  color="success"
                  icon={<CheckIcon />}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          }
          subheader={`Category: ${AGENT_CATEGORIES.find(cat => cat.id === agent.category)?.name || agent.category}`}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {agent.description}
          </Typography>
          
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Inputs: {agent.inputs.join(', ')}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Outputs: {agent.outputs.join(', ')}
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          {isSelected ? (
            <Button 
              size="small" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => handleRemoveAgent(agent.id)}
            >
              Remove from Pipeline
            </Button>
          ) : (
            <Button 
              size="small" 
              color="primary"
              onClick={() => handleAddAgent(agent.id)}
            >
              Add to Pipeline
            </Button>
          )}
          <Button 
            size="small" 
            startIcon={<SettingsIcon />}
            onClick={() => handleOpenSettings(agent)}
          >
            Settings
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  // Render log severity icon
  const getLogIcon = (level) => {
    switch (level) {
      case 'success':
        return <CheckIcon fontSize="small" color="success" />;
      case 'warning':
        return <WarningIcon fontSize="small" color="warning" />;
      case 'error':
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return <InfoIcon fontSize="small" color="info" />;
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Agent Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Configure and execute financial agents to analyze your documents
          </Typography>
          
          <Collapse in={alertOpen}>
            <Alert 
              severity={alertSeverity}
              onClose={() => setAlertOpen(false)}
              sx={{ mt: 2, mb: 2 }}
            >
              {alertMessage}
            </Alert>
          </Collapse>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agent Categories
            </Typography>
            <List component="nav">
              <ListItem 
                button 
                selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              >
                <ListItemText primary="All Agents" />
              </ListItem>
              
              {AGENT_CATEGORIES.map(category => (
                <ListItem 
                  button
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <ListItemIcon>
                    {category.icon}
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                  <ListItemSecondaryAction>
                    <Badge
                      badgeContent={AVAILABLE_AGENTS.filter(agent => agent.category === category.id).length}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Agents
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select agents to add to your pipeline
            </Typography>
            
            {filteredAgents.map(agent => renderAgentCard(agent))}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Agent Pipeline
              </Typography>
              
              <Box>
                <Tooltip title="View Execution History">
                  <IconButton onClick={() => setHistoryOpen(true)}>
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={pipelineStatus === 'running' ? <StopIcon /> : <PlayIcon />}
                  onClick={executePipeline}
                  disabled={pipelineStatus === 'running' || agentPipeline.length === 0}
                >
                  {pipelineStatus === 'running' ? 'Running...' : 'Execute Pipeline'}
                </Button>
              </Box>
            </Box>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {agentPipeline.map((agent, index) => (
                <Step key={agent.id}>
                  <StepLabel>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Typography>{agent.name}</Typography>
                      
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenSettings(agent)}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAgent(agent.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {agentPipeline.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No agents in pipeline. Add agents from the left panel.
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execution Log
            </Typography>
            
            {pipelineStatus === 'running' && (
              <Box display="flex" alignItems="center" mb={2}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Pipeline execution in progress...
                </Typography>
              </Box>
            )}
            
            {executionLogs.length === 0 && pipelineStatus !== 'running' && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No execution logs yet. Run the pipeline to see logs.
              </Typography>
            )}
            
            <List dense>
              {executionLogs.map((log, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getLogIcon(log.level)}
                  </ListItemIcon>
                  <ListItemText
                    primary={log.message}
                    secondary={new Date(log.timestamp).toLocaleTimeString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execution Results
            </Typography>
            
            {pipelineStatus === 'idle' && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Execute the pipeline to see results
              </Typography>
            )}
            
            {pipelineStatus === 'running' && (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
              </Box>
            )}
            
            {pipelineStatus === 'completed' && (
              <Box>
                {agentPipeline.map(agent => {
                  const result = executionResults[agent.id];
                  if (!result) return null;
                  
                  return (
                    <Box key={agent.id} mb={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {agent.name}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      
                      {/* Render result summary based on agent type */}
                      {agent.id === 'isin-extractor' && (
                        <Box>
                          <Typography variant="body2">
                            Extracted {result.isins?.length || 0} ISINs
                          </Typography>
                          <Typography variant="body2">
                            Identified {result.securities?.length || 0} securities
                          </Typography>
                        </Box>
                      )}
                      
                      {agent.id === 'financial-table-detector' && (
                        <Box>
                          <Typography variant="body2">
                            Detected {result.tables?.length || 0} tables
                          </Typography>
                          {result.tables?.map((table, i) => (
                            <Typography key={i} variant="body2" color="text.secondary">
                              {table.title}: {table.rows} rows × {table.columns} columns
                            </Typography>
                          ))}
                        </Box>
                      )}
                      
                      {agent.id === 'financial-data-analyzer' && (
                        <Box>
                          <Typography variant="body2">
                            Total portfolio value: ${result.analysis?.portfolio_summary?.total_value?.toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            YTD Return: {result.analysis?.portfolio_summary?.performance_metrics?.ytd_return}%
                          </Typography>
                        </Box>
                      )}
                      
                      {agent.id === 'financial-advisor' && (
                        <Box>
                          <Typography variant="body2">
                            {result.recommendations?.summary}
                          </Typography>
                          <Typography variant="body2" mt={1}>
                            Generated report with {result.report?.sections?.length || 0} sections
                          </Typography>
                        </Box>
                      )}
                      
                      {agent.id === 'document-merge' && (
                        <Box>
                          <Typography variant="body2">
                            Successfully merged {result.merged_document?.document_count} documents
                          </Typography>
                          <Typography variant="body2">
                            Contains {result.merged_document?.securities_count} securities
                          </Typography>
                        </Box>
                      )}
                      
                      {agent.id === 'data-export' && (
                        <Box>
                          <Typography variant="body2">
                            Generated {result.export_file?.format} file: {result.export_file?.filename}
                          </Typography>
                          <Typography variant="body2">
                            File size: {result.export_file?.size}
                          </Typography>
                        </Box>
                      )}
                      
                      {agent.id === 'document-comparison' && (
                        <Box>
                          <Typography variant="body2">
                            Compared {result.comparison?.document_count} documents
                          </Typography>
                          <Typography variant="body2">
                            Found {result.comparison?.differences_found} differences
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveIcon />}
                  fullWidth
                  onClick={() => {
                    if (onAgentResult) {
                      onAgentResult(executionResults);
                      showAlert('Results saved successfully', 'success');
                    }
                  }}
                >
                  Save Results
                </Button>
              </Box>
            )}
            
            {pipelineStatus === 'error' && (
              <Alert severity="error">
                Pipeline execution failed. Check the logs for details.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Agent Settings Dialog */}
      <Dialog
        open={agentSettingsOpen}
        onClose={() => setAgentSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAgent?.name || 'Agent'} Settings
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure settings for {selectedAgent?.name}
          </Typography>
          
          {renderSettingsFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgentSettingsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Execution History Dialog */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Execution History</DialogTitle>
        <DialogContent>
          {executionHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No execution history yet
            </Typography>
          ) : (
            <List>
              {executionHistory.map((execution, index) => (
                <ListItem key={index} divider={index < executionHistory.length - 1}>
                  <ListItemIcon>
                    {execution.status === 'completed' ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Execution on ${new Date(execution.timestamp).toLocaleString()}`}
                    secondary={`${execution.pipeline.length} agents, ${execution.documents} documents, Status: ${execution.status}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => {
                        // Load this execution into the current state
                        setPipelineStatus(execution.status);
                        setExecutionResults(execution.results || {});
                        setHistoryOpen(false);
                      }}
                    >
                      View Details
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              setExecutionHistory([]);
              localStorage.removeItem('executionHistory');
              setHistoryOpen(false);
              showAlert('Execution history cleared', 'info');
            }}
            color="error"
          >
            Clear History
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentWorkspace;