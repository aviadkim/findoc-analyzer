import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Menu, MenuItem,
  Tabs, Tab, Divider, Card, CardContent, CardHeader, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  CloudDownload as ExportIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import DataVisualization from './DataVisualization';
import AnalyticsDashboard from './AnalyticsDashboard';

// Sample default widgets
const DEFAULT_WIDGETS = [
  {
    id: 'portfolio-allocation',
    title: 'Portfolio Allocation',
    type: 'pie',
    dataType: 'portfolio',
    size: { xs: 12, sm: 6 },
    order: 1
  },
  {
    id: 'performance-chart',
    title: 'Performance History',
    type: 'area',
    dataType: 'performance',
    size: { xs: 12, sm: 6 },
    order: 2
  },
  {
    id: 'document-analytics',
    title: 'Document Analytics',
    type: 'bar',
    dataType: 'document',
    size: { xs: 12, sm: 6 },
    order: 3
  },
  {
    id: 'risk-analysis',
    title: 'Risk Analysis',
    type: 'radar',
    dataType: 'portfolio',
    size: { xs: 12, sm: 6 },
    order: 4
  }
];

const CustomDashboard = ({ portfolioData, documentData, onSave }) => {
  const [widgets, setWidgets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dashboardTemplates, setDashboardTemplates] = useState([
    { id: 'default', name: 'Default Dashboard' },
    { id: 'performance', name: 'Performance Dashboard' },
    { id: 'document', name: 'Document Analytics Dashboard' }
  ]);
  
  // Initialize dashboard with default widgets
  useEffect(() => {
    // Check if there are saved widgets in localStorage
    const savedWidgets = localStorage.getItem('customDashboardWidgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
  }, []);
  
  // Handle saving the dashboard configuration
  const handleSaveDashboard = () => {
    // Save widgets to localStorage
    localStorage.setItem('customDashboardWidgets', JSON.stringify(widgets));
    
    // Call onSave callback if provided
    if (onSave) {
      onSave(widgets);
    }
    
    setEditMode(false);
  };
  
  // Handle adding a new widget
  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      title: 'New Widget',
      type: widgetType,
      dataType: 'portfolio',
      size: { xs: 12, sm: 6 },
      order: widgets.length + 1
    };
    
    setWidgets([...widgets, newWidget]);
    setAddDialogOpen(false);
  };
  
  // Handle deleting a widget
  const handleDeleteWidget = (widgetId) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
    setMenuAnchorEl(null);
  };
  
  // Handle editing a widget
  const handleEditWidget = (widget) => {
    setSelectedWidget(widget);
    setMenuAnchorEl(null);
  };
  
  // Handle updating a widget
  const handleUpdateWidget = (updatedWidget) => {
    setWidgets(widgets.map(widget => 
      widget.id === updatedWidget.id ? updatedWidget : widget
    ));
    setSelectedWidget(null);
  };
  
  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setWidgets(updatedItems);
  };
  
  // Load a dashboard template
  const handleLoadTemplate = (templateId) => {
    if (templateId === 'default') {
      setWidgets(DEFAULT_WIDGETS);
    } else if (templateId === 'performance') {
      setWidgets([
        {
          id: 'performance-line',
          title: 'Performance History',
          type: 'line',
          dataType: 'performance',
          size: { xs: 12, sm: 12 },
          order: 1
        },
        {
          id: 'performance-bar',
          title: 'Monthly Returns',
          type: 'bar',
          dataType: 'performance',
          size: { xs: 12, sm: 6 },
          order: 2
        },
        {
          id: 'benchmark-comparison',
          title: 'Benchmark Comparison',
          type: 'area',
          dataType: 'performance',
          size: { xs: 12, sm: 6 },
          order: 3
        }
      ]);
    } else if (templateId === 'document') {
      setWidgets([
        {
          id: 'document-type-pie',
          title: 'Document Types',
          type: 'pie',
          dataType: 'document',
          size: { xs: 12, sm: 6 },
          order: 1
        },
        {
          id: 'document-timeline',
          title: 'Document Timeline',
          type: 'line',
          dataType: 'document',
          size: { xs: 12, sm: 6 },
          order: 2
        },
        {
          id: 'document-processing',
          title: 'Document Processing Metrics',
          type: 'bar',
          dataType: 'document',
          size: { xs: 12, sm: 12 },
          order: 3
        }
      ]);
    }
  };
  
  // Render a specific widget based on its type
  const renderWidget = (widget) => {
    // In edit mode, show a placeholder
    if (editMode) {
      return (
        <Box
          sx={{ 
            height: 250, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            border: '2px dashed #ccc',
            borderRadius: 2,
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography variant="h6">{widget.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} Chart
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {widget.dataType.charAt(0).toUpperCase() + widget.dataType.slice(1)} Data
          </Typography>
        </Box>
      );
    }
    
    // Determine the data source based on widget type
    let widgetData = [];
    if (widget.dataType === 'portfolio') {
      widgetData = portfolioData?.securities || [];
    } else if (widget.dataType === 'performance') {
      widgetData = portfolioData?.performanceHistory || [];
    } else if (widget.dataType === 'document') {
      widgetData = documentData || [];
    }
    
    // Render the appropriate visualization component
    return (
      <DataVisualization 
        data={widgetData}
        dataType={widget.dataType}
        visualizationType={widget.type}
        customTitle={widget.title}
      />
    );
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {editMode ? 'Edit Dashboard' : 'Custom Dashboard'}
        </Typography>
        
        <Box>
          {editMode ? (
            <>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => setEditMode(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />}
                onClick={handleSaveDashboard}
              >
                Save Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outlined"
                startIcon={<ExportIcon />}
                sx={{ mr: 1 }}
              >
                Export
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                Edit Dashboard
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      {editMode && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Dashboard Controls</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Widget
              </Button>
            </Grid>
            
            <Grid item>
              <Button 
                variant="outlined"
                onClick={() => handleLoadTemplate('default')}
              >
                Reset to Default
              </Button>
            </Grid>
            
            <Grid item xs>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Drag and drop widgets to reorder them
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="vertical">
          {(provided) => (
            <Grid 
              container 
              spacing={3}
              ref={editMode ? provided.innerRef : null}
              {...(editMode ? provided.droppableProps : {})}
            >
              {widgets
                .sort((a, b) => a.order - b.order)
                .map((widget, index) => (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                    isDragDisabled={!editMode}
                  >
                    {(provided, snapshot) => (
                      <Grid 
                        item 
                        xs={widget.size.xs} 
                        sm={widget.size.sm}
                        ref={editMode ? provided.innerRef : null}
                        {...(editMode ? {
                          ...provided.draggableProps,
                          ...provided.dragHandleProps,
                          style: {
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1
                          }
                        } : {})}
                      >
                        <Paper 
                          sx={{ 
                            overflow: 'hidden',
                            height: '100%',
                            boxShadow: editMode && snapshot.isDragging ? 3 : 1
                          }}
                        >
                          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{widget.title}</Typography>
                            
                            {editMode && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setMenuAnchorEl(e.currentTarget);
                                  setSelectedWidget(widget);
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            )}
                          </Box>
                          
                          <Box sx={{ px: 2, pb: 2 }}>
                            {renderWidget(widget)}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Draggable>
                ))}
              {editMode && provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Add Widget Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Widget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleAddWidget('bar')}
              >
                <CardContent>
                  <Typography variant="h6">Bar Chart</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Compare values across categories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleAddWidget('line')}
              >
                <CardContent>
                  <Typography variant="h6">Line Chart</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Show trends over time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleAddWidget('pie')}
              >
                <CardContent>
                  <Typography variant="h6">Pie Chart</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Show proportions of a whole
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleAddWidget('area')}
              >
                <CardContent>
                  <Typography variant="h6">Area Chart</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Show cumulative totals over time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleAddWidget('scatter')}
              >
                <CardContent>
                  <Typography variant="h6">Scatter Plot</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Show correlation between variables
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => handleAddWidget('radar')}
              >
                <CardContent>
                  <Typography variant="h6">Radar Chart</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Compare multiple variables
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Widget Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => handleEditWidget(selectedWidget)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Widget
        </MenuItem>
        <MenuItem onClick={() => handleDeleteWidget(selectedWidget?.id)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Widget
        </MenuItem>
      </Menu>
      
      {/* Edit Widget Dialog */}
      <Dialog open={Boolean(selectedWidget)} onClose={() => setSelectedWidget(null)}>
        <DialogTitle>Edit Widget</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Widget Title</Typography>
                <input
                  type="text"
                  value={selectedWidget?.title || ''}
                  onChange={(e) => setSelectedWidget({
                    ...selectedWidget,
                    title: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Data Type</Typography>
                <select
                  value={selectedWidget?.dataType || 'portfolio'}
                  onChange={(e) => setSelectedWidget({
                    ...selectedWidget,
                    dataType: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="portfolio">Portfolio Data</option>
                  <option value="performance">Performance Data</option>
                  <option value="document">Document Data</option>
                </select>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Widget Size</Typography>
                <select
                  value={selectedWidget?.size?.sm || 6}
                  onChange={(e) => setSelectedWidget({
                    ...selectedWidget,
                    size: {
                      ...selectedWidget.size,
                      sm: parseInt(e.target.value)
                    }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value={12}>Full Width</option>
                  <option value={6}>Half Width</option>
                  <option value={4}>One Third</option>
                </select>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWidget(null)}>Cancel</Button>
          <Button 
            onClick={() => handleUpdateWidget(selectedWidget)}
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomDashboard;