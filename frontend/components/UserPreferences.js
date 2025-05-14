import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Grid, Switch,
  FormControlLabel, FormControl, InputLabel, Select,
  MenuItem, TextField, Button, Divider, Chip,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Keyboard as KeyboardIcon,
  Accessibility as AccessibilityIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  KeyboardReturn as EnterIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Default user preferences
const DEFAULT_PREFERENCES = {
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontSize: 'medium'
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderOptimized: false
  },
  notifications: {
    emailAlerts: true,
    browserNotifications: false,
    documentUpdates: true,
    analysisResults: true
  },
  keyboardShortcuts: {
    enabled: true,
    customShortcuts: {}
  },
  display: {
    cardsPerRow: 3,
    compactView: false,
    showPreview: true,
    defaultSort: 'date'
  },
  analysis: {
    defaultRiskProfile: 'moderate',
    showAdvancedMetrics: false,
    autoAnalyze: true
  }
};

// Predefined keyboard shortcuts
const DEFAULT_SHORTCUTS = {
  'search': 'ctrl+f',
  'newDocument': 'ctrl+n',
  'save': 'ctrl+s',
  'openDashboard': 'ctrl+d',
  'runAnalysis': 'ctrl+r',
  'exportData': 'ctrl+e',
  'help': 'f1'
};

// Color themes
const COLOR_THEMES = [
  { name: 'Blue (Default)', primary: '#1976d2', secondary: '#dc004e' },
  { name: 'Purple', primary: '#6200ea', secondary: '#03dac6' },
  { name: 'Green', primary: '#2e7d32', secondary: '#f50057' },
  { name: 'Orange', primary: '#ed6c02', secondary: '#2979ff' },
  { name: 'Teal', primary: '#00796b', secondary: '#ff4081' }
];

const UserPreferences = ({ onSave, initialPreferences }) => {
  // Initialize with default preferences or provided preferences
  const [preferences, setPreferences] = useState(
    initialPreferences || DEFAULT_PREFERENCES
  );
  
  const [activeTab, setActiveTab] = useState(0);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [newShortcut, setNewShortcut] = useState('');
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Update preferences
  const updatePreferences = (section, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    
    setUnsavedChanges(true);
  };
  
  // Save preferences
  const savePreferences = () => {
    // Save to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Call onSave callback if provided
    if (onSave) {
      onSave(preferences);
    }
    
    // Show success message
    setSnackbarMessage('Preferences saved successfully');
    setSnackbarOpen(true);
    setUnsavedChanges(false);
  };
  
  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);
  
  // Handle shortcut key press
  const handleShortcutKeyPress = (e) => {
    e.preventDefault();
    
    // Build shortcut string
    let shortcut = '';
    if (e.ctrlKey) shortcut += 'ctrl+';
    if (e.altKey) shortcut += 'alt+';
    if (e.shiftKey) shortcut += 'shift+';
    if (e.metaKey) shortcut += 'meta+';
    
    // Add key
    const key = e.key.toLowerCase();
    if (key === 'control' || key === 'alt' || key === 'shift' || key === 'meta') {
      // Ignore modifier keys pressed alone
      return;
    }
    
    shortcut += key;
    setNewShortcut(shortcut);
  };
  
  // Save custom shortcut
  const saveCustomShortcut = () => {
    if (!editingShortcut || !newShortcut) return;
    
    // Update keyboard shortcuts
    updatePreferences('keyboardShortcuts', 'customShortcuts', {
      ...preferences.keyboardShortcuts.customShortcuts,
      [editingShortcut]: newShortcut
    });
    
    // Close dialog
    setShortcutDialogOpen(false);
    setEditingShortcut(null);
    setNewShortcut('');
    
    // Show success message
    setSnackbarMessage('Keyboard shortcut updated');
    setSnackbarOpen(true);
  };
  
  // Reset all preferences to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setUnsavedChanges(true);
    
    setSnackbarMessage('Preferences reset to defaults');
    setSnackbarOpen(true);
  };
  
  // Format shortcut for display
  const formatShortcut = (shortcut) => {
    return shortcut
      .split('+')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' + ');
  };
  
  // Get effective shortcut (custom or default)
  const getEffectiveShortcut = (action) => {
    return preferences.keyboardShortcuts.customShortcuts[action] || DEFAULT_SHORTCUTS[action];
  };
  
  // Render theme preferences
  const renderThemePreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="theme-mode-label">Theme Mode</InputLabel>
          <Select
            labelId="theme-mode-label"
            value={preferences.theme.mode}
            onChange={(e) => updatePreferences('theme', 'mode', e.target.value)}
            label="Theme Mode"
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System Default</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="font-size-label">Font Size</InputLabel>
          <Select
            labelId="font-size-label"
            value={preferences.theme.fontSize}
            onChange={(e) => updatePreferences('theme', 'fontSize', e.target.value)}
            label="Font Size"
          >
            <MenuItem value="small">Small</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="large">Large</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Color Theme
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {COLOR_THEMES.map((theme) => (
            <Grid item key={theme.name}>
              <Box
                onClick={() => {
                  updatePreferences('theme', 'primaryColor', theme.primary);
                  updatePreferences('theme', 'secondaryColor', theme.secondary);
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary} 50%, ${theme.secondary} 50%, ${theme.secondary} 100%)`,
                    border: theme.primary === preferences.theme.primaryColor ? '3px solid #000' : '1px solid #ccc'
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {theme.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Preview
        </Typography>
        
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: preferences.theme.mode === 'dark' ? '#121212' : '#fff',
            color: preferences.theme.mode === 'dark' ? '#fff' : '#000',
            boxShadow: 1,
            fontSize: {
              small: '0.875rem',
              medium: '1rem',
              large: '1.125rem'
            }[preferences.theme.fontSize]
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: preferences.theme.primaryColor, fontWeight: 'bold' }}
          >
            Theme Preview
          </Typography>
          
          <Typography variant="body1" sx={{ my: 1 }}>
            This is how your theme settings will look across the application.
          </Typography>
          
          <Button
            variant="contained"
            sx={{
              bgcolor: preferences.theme.primaryColor,
              '&:hover': {
                bgcolor: preferences.theme.primaryColor,
                filter: 'brightness(0.9)'
              }
            }}
          >
            Primary Button
          </Button>
          
          <Button
            variant="outlined"
            sx={{
              ml: 1,
              color: preferences.theme.secondaryColor,
              borderColor: preferences.theme.secondaryColor,
              '&:hover': {
                borderColor: preferences.theme.secondaryColor,
                filter: 'brightness(0.9)'
              }
            }}
          >
            Secondary Button
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render accessibility preferences
  const renderAccessibilityPreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Visual Settings
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.accessibility.highContrast}
              onChange={(e) => updatePreferences('accessibility', 'highContrast', e.target.checked)}
            />
          }
          label="High Contrast Mode"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.accessibility.largeText}
              onChange={(e) => updatePreferences('accessibility', 'largeText', e.target.checked)}
            />
          }
          label="Large Text Mode"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            High contrast mode increases the contrast between text and background colors for better readability.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Motion Settings
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.accessibility.reducedMotion}
              onChange={(e) => updatePreferences('accessibility', 'reducedMotion', e.target.checked)}
            />
          }
          label="Reduced Motion"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Reduced motion minimizes animations and transitions throughout the application.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Screen Reader Optimization
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.accessibility.screenReaderOptimized}
              onChange={(e) => updatePreferences('accessibility', 'screenReaderOptimized', e.target.checked)}
            />
          }
          label="Screen Reader Optimized Mode"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Optimizes the interface for screen readers with improved ARIA labels and focus management.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: '#f5f5f5',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Accessibility Tip
          </Typography>
          
          <Typography variant="body2">
            You can also use keyboard shortcuts to navigate the application more efficiently. 
            See the "Keyboard Shortcuts" tab to customize your shortcuts.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render notification preferences
  const renderNotificationPreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Email Notifications
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.notifications.emailAlerts}
              onChange={(e) => updatePreferences('notifications', 'emailAlerts', e.target.checked)}
            />
          }
          label="Email Notifications"
        />
        
        <Box sx={{ mt: 1, ml: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.notifications.documentUpdates}
                onChange={(e) => updatePreferences('notifications', 'documentUpdates', e.target.checked)}
                disabled={!preferences.notifications.emailAlerts}
              />
            }
            label="Document Updates"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={preferences.notifications.analysisResults}
                onChange={(e) => updatePreferences('notifications', 'analysisResults', e.target.checked)}
                disabled={!preferences.notifications.emailAlerts}
              />
            }
            label="Analysis Results"
          />
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Browser Notifications
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.notifications.browserNotifications}
              onChange={(e) => updatePreferences('notifications', 'browserNotifications', e.target.checked)}
            />
          }
          label="Browser Notifications"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Browser notifications will show up on your desktop when important events occur, even if you're not actively using the application.
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              // Request browser notification permission
              if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    updatePreferences('notifications', 'browserNotifications', true);
                    
                    // Send a test notification
                    new Notification('FinDoc Analyzer', {
                      body: 'Browser notifications are now enabled',
                      icon: '/favicon.ico'
                    });
                  } else {
                    updatePreferences('notifications', 'browserNotifications', false);
                    setSnackbarMessage('Browser notification permission denied');
                    setSnackbarOpen(true);
                  }
                });
              }
            }}
          >
            Test Browser Notifications
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render keyboard shortcut preferences
  const renderKeyboardShortcutPreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.keyboardShortcuts.enabled}
              onChange={(e) => updatePreferences('keyboardShortcuts', 'enabled', e.target.checked)}
            />
          }
          label="Enable Keyboard Shortcuts"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Keyboard shortcuts allow you to perform common actions quickly without using the mouse.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Available Shortcuts
        </Typography>
        
        <List>
          {Object.entries(DEFAULT_SHORTCUTS).map(([action, defaultShortcut]) => {
            const currentShortcut = getEffectiveShortcut(action);
            const isCustomized = preferences.keyboardShortcuts.customShortcuts[action] !== undefined;
            
            return (
              <ListItem key={action} divider>
                <ListItemText
                  primary={action.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  secondary={isCustomized ? 'Customized' : 'Default'}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={formatShortcut(currentShortcut)}
                    color={isCustomized ? 'primary' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    edge="end"
                    disabled={!preferences.keyboardShortcuts.enabled}
                    onClick={() => {
                      setEditingShortcut(action);
                      setNewShortcut(currentShortcut);
                      setShortcutDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Grid>
      
      <Grid item xs={12}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: '#f5f5f5',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Keyboard Shortcut Tips
          </Typography>
          
          <Typography variant="body2">
            • Press <strong>F1</strong> to open the help dialog at any time.<br />
            • Use <strong>Tab</strong> to navigate between elements.<br />
            • Press <strong>Enter</strong> to activate the focused button or link.<br />
            • Press <strong>Escape</strong> to close dialogs.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render display preferences
  const renderDisplayPreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="cards-per-row-label">Cards Per Row</InputLabel>
          <Select
            labelId="cards-per-row-label"
            value={preferences.display.cardsPerRow}
            onChange={(e) => updatePreferences('display', 'cardsPerRow', e.target.value)}
            label="Cards Per Row"
          >
            <MenuItem value={1}>1 (Full Width)</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="default-sort-label">Default Sort</InputLabel>
          <Select
            labelId="default-sort-label"
            value={preferences.display.defaultSort}
            onChange={(e) => updatePreferences('display', 'defaultSort', e.target.value)}
            label="Default Sort"
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="type">Document Type</MenuItem>
            <MenuItem value="size">File Size</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.display.compactView}
              onChange={(e) => updatePreferences('display', 'compactView', e.target.checked)}
            />
          }
          label="Compact View"
        />
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Compact view reduces spacing and shows more content on the screen.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.display.showPreview}
              onChange={(e) => updatePreferences('display', 'showPreview', e.target.checked)}
            />
          }
          label="Show Document Preview"
        />
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Show a preview of document content in the list view.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: preferences.display.compactView ? '#f0f0f0' : '#f8f8f8',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Display Preview
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: preferences.display.compactView ? 1 : 2
            }}
          >
            {Array.from({ length: preferences.display.cardsPerRow }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: `calc(${100 / preferences.display.cardsPerRow}% - ${preferences.display.compactView ? 8 : 16}px)`,
                  height: preferences.display.compactView ? 100 : 120,
                  bgcolor: '#e0e0e0',
                  borderRadius: 1,
                  p: preferences.display.compactView ? 1 : 2,
                  boxSizing: 'border-box'
                }}
              >
                <Typography variant="subtitle2">Document {index + 1}</Typography>
                {preferences.display.showPreview && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                    Preview text...
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render analysis preferences
  const renderAnalysisPreferences = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="risk-profile-label">Default Risk Profile</InputLabel>
          <Select
            labelId="risk-profile-label"
            value={preferences.analysis.defaultRiskProfile}
            onChange={(e) => updatePreferences('analysis', 'defaultRiskProfile', e.target.value)}
            label="Default Risk Profile"
          >
            <MenuItem value="conservative">Conservative</MenuItem>
            <MenuItem value="moderate">Moderate</MenuItem>
            <MenuItem value="aggressive">Aggressive</MenuItem>
            <MenuItem value="growth">Growth</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            The default risk profile used for portfolio analysis and recommendations.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.analysis.showAdvancedMetrics}
              onChange={(e) => updatePreferences('analysis', 'showAdvancedMetrics', e.target.checked)}
            />
          }
          label="Show Advanced Metrics"
        />
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Display advanced financial metrics such as Sharpe ratio, Treynor ratio, and Alpha/Beta values.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.analysis.autoAnalyze}
              onChange={(e) => updatePreferences('analysis', 'autoAnalyze', e.target.checked)}
            />
          }
          label="Automatically Analyze New Documents"
        />
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Automatically run analysis on newly uploaded documents.
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: '#f5f5f5',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Risk Profile Description
          </Typography>
          
          <Typography variant="body2">
            {preferences.analysis.defaultRiskProfile === 'conservative' && (
              "Conservative: Focuses on capital preservation with modest growth potential. Typically has a higher allocation to fixed income and lower volatility."
            )}
            {preferences.analysis.defaultRiskProfile === 'moderate' && (
              "Moderate: Balanced approach between growth and capital preservation. Diversified across asset classes with moderate volatility."
            )}
            {preferences.analysis.defaultRiskProfile === 'aggressive' && (
              "Aggressive: Emphasizes capital appreciation with higher volatility tolerance. Higher allocation to equities and growth assets."
            )}
            {preferences.analysis.defaultRiskProfile === 'growth' && (
              "Growth: Maximizes long-term growth potential with high volatility tolerance. Predominantly invested in equities with minimal fixed income."
            )}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          User Preferences
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize your experience with the FinDoc Analyzer application.
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="preference tabs">
            <Tab icon={<PaletteIcon />} label="Theme" />
            <Tab icon={<AccessibilityIcon />} label="Accessibility" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<KeyboardIcon />} label="Keyboard Shortcuts" />
            <Tab icon={<SettingsIcon />} label="Display" />
            <Tab icon={<AnalyticsIcon />} label="Analysis" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 1 }}>
          {activeTab === 0 && renderThemePreferences()}
          {activeTab === 1 && renderAccessibilityPreferences()}
          {activeTab === 2 && renderNotificationPreferences()}
          {activeTab === 3 && renderKeyboardShortcutPreferences()}
          {activeTab === 4 && renderDisplayPreferences()}
          {activeTab === 5 && renderAnalysisPreferences()}
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={resetPreferences}
          >
            Reset to Defaults
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={savePreferences}
            disabled={!unsavedChanges}
            startIcon={<SaveIcon />}
          >
            Save Preferences
          </Button>
        </Box>
      </Paper>
      
      {/* Shortcut Dialog */}
      <Dialog
        open={shortcutDialogOpen}
        onClose={() => setShortcutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Keyboard Shortcut
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {editingShortcut?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Typography>
          
          <Box
            component="div"
            sx={{
              mt: 2,
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            tabIndex={0}
            onKeyDown={handleShortcutKeyPress}
          >
            <Typography variant="body1">
              {newShortcut ? formatShortcut(newShortcut) : 'Press keys to set shortcut...'}
            </Typography>
            
            <IconButton
              size="small"
              onClick={() => setNewShortcut('')}
              disabled={!newShortcut}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Press the keys you want to use for this shortcut. For example, press Ctrl+S for a Ctrl+S shortcut.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShortcutDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveCustomShortcut}
            disabled={!newShortcut}
            startIcon={<SaveIcon />}
          >
            Save Shortcut
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserPreferences;