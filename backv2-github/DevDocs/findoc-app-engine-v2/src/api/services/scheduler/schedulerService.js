/**
 * Scheduler Service
 * 
 * This service manages scheduled reports and alerts.
 */

const schedule = require('node-schedule');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabaseService');
const { generateAllocationChartData, generatePerformanceChartData, generateChartImage } = require('../visualization/chartGenerator');
const { generateContentInternal } = require('../../controllers/geminiController');

// Store scheduled jobs
const scheduledJobs = {};

/**
 * Initialize scheduler
 * @returns {Promise<void>}
 */
const initializeScheduler = async () => {
  try {
    console.log('Initializing scheduler...');
    
    // Get all active schedules
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error getting schedules:', error);
      return;
    }
    
    // Schedule jobs
    for (const schedule of schedules) {
      scheduleJob(schedule);
    }
    
    console.log(`Initialized ${schedules.length} scheduled jobs`);
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
};

/**
 * Create a new schedule
 * @param {Object} scheduleData - Schedule data
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created schedule
 */
const createSchedule = async (scheduleData, userId, tenantId) => {
  try {
    const { name, type, frequency, config, recipients } = scheduleData;
    
    // Validate schedule
    if (!name || !type || !frequency || !config) {
      throw new Error('Name, type, frequency, and config are required');
    }
    
    // Create schedule
    const newSchedule = {
      id: uuidv4(),
      name,
      type,
      frequency,
      config,
      recipients: recipients || [],
      user_id: userId,
      tenant_id: tenantId,
      status: 'active',
      last_run: null,
      next_run: calculateNextRun(frequency),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert schedule into database
    const { data, error } = await supabase
      .from('schedules')
      .insert(newSchedule)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Error creating schedule');
    }
    
    // Schedule job
    scheduleJob(data);
    
    return data;
  } catch (error) {
    console.error('Error in createSchedule:', error);
    throw error;
  }
};

/**
 * Get schedules for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Schedules
 */
const getSchedules = async (tenantId) => {
  try {
    // Get schedules from database
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting schedules:', error);
      throw new Error('Error getting schedules');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSchedules:', error);
    throw error;
  }
};

/**
 * Get schedule by ID
 * @param {string} scheduleId - Schedule ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Schedule
 */
const getScheduleById = async (scheduleId, tenantId) => {
  try {
    // Get schedule from database
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error getting schedule:', error);
      throw new Error('Error getting schedule');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getScheduleById:', error);
    throw error;
  }
};

/**
 * Update schedule
 * @param {string} scheduleId - Schedule ID
 * @param {Object} scheduleData - Schedule data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Updated schedule
 */
const updateSchedule = async (scheduleId, scheduleData, tenantId) => {
  try {
    const { name, type, frequency, config, recipients, status } = scheduleData;
    
    // Create update object
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (frequency) {
      updateData.frequency = frequency;
      updateData.next_run = calculateNextRun(frequency);
    }
    if (config) updateData.config = config;
    if (recipients) updateData.recipients = recipients;
    if (status) updateData.status = status;
    
    // Update schedule in database
    const { data, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', scheduleId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Error updating schedule');
    }
    
    // Cancel existing job
    if (scheduledJobs[scheduleId]) {
      scheduledJobs[scheduleId].cancel();
      delete scheduledJobs[scheduleId];
    }
    
    // Schedule new job if active
    if (data.status === 'active') {
      scheduleJob(data);
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    throw error;
  }
};

/**
 * Delete schedule
 * @param {string} scheduleId - Schedule ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} Success
 */
const deleteSchedule = async (scheduleId, tenantId) => {
  try {
    // Delete schedule from database
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('tenant_id', tenantId);
    
    if (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Error deleting schedule');
    }
    
    // Cancel scheduled job
    if (scheduledJobs[scheduleId]) {
      scheduledJobs[scheduleId].cancel();
      delete scheduledJobs[scheduleId];
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    throw error;
  }
};

/**
 * Run schedule manually
 * @param {string} scheduleId - Schedule ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Result
 */
const runSchedule = async (scheduleId, tenantId) => {
  try {
    // Get schedule
    const schedule = await getScheduleById(scheduleId, tenantId);
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    // Run schedule
    const result = await executeSchedule(schedule);
    
    // Update last run time
    await supabase
      .from('schedules')
      .update({
        last_run: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId);
    
    return result;
  } catch (error) {
    console.error('Error in runSchedule:', error);
    throw error;
  }
};

/**
 * Schedule a job
 * @param {Object} schedule - Schedule data
 */
const scheduleJob = (schedule) => {
  try {
    // Parse frequency
    const { type, value } = schedule.frequency;
    let cronExpression;
    
    switch (type) {
      case 'daily':
        // Run daily at specified time (default: midnight)
        const [hour, minute] = (value || '0:0').split(':').map(Number);
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case 'weekly':
        // Run weekly on specified day (default: Sunday) at midnight
        const day = value || 0;
        cronExpression = `0 0 * * ${day}`;
        break;
      case 'monthly':
        // Run monthly on specified day (default: 1st) at midnight
        const date = value || 1;
        cronExpression = `0 0 ${date} * *`;
        break;
      case 'custom':
        // Custom cron expression
        cronExpression = value;
        break;
      default:
        console.error(`Invalid schedule type: ${type}`);
        return;
    }
    
    // Schedule job
    const job = schedule.job(cronExpression, async () => {
      try {
        console.log(`Running scheduled job: ${schedule.name} (${schedule.id})`);
        
        // Execute schedule
        await executeSchedule(schedule);
        
        // Update last run time and next run time
        await supabase
          .from('schedules')
          .update({
            last_run: new Date().toISOString(),
            next_run: calculateNextRun(schedule.frequency),
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);
      } catch (error) {
        console.error(`Error executing scheduled job ${schedule.id}:`, error);
      }
    });
    
    // Store job
    scheduledJobs[schedule.id] = job;
    
    console.log(`Scheduled job: ${schedule.name} (${schedule.id}) with cron: ${cronExpression}`);
  } catch (error) {
    console.error(`Error scheduling job ${schedule.id}:`, error);
  }
};

/**
 * Execute schedule
 * @param {Object} schedule - Schedule data
 * @returns {Promise<Object>} Result
 */
const executeSchedule = async (schedule) => {
  try {
    const { type, config, tenant_id: tenantId } = schedule;
    
    // Execute based on schedule type
    switch (type) {
      case 'report':
        return await generateReport(config, tenantId);
      case 'alert':
        return await checkAlert(config, tenantId);
      default:
        throw new Error(`Invalid schedule type: ${type}`);
    }
  } catch (error) {
    console.error('Error executing schedule:', error);
    throw error;
  }
};

/**
 * Generate report
 * @param {Object} config - Report configuration
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Report result
 */
const generateReport = async (config, tenantId) => {
  try {
    const { reportType, documentIds, portfolioId, options } = config;
    
    // Generate report based on type
    switch (reportType) {
      case 'portfolio':
        return await generatePortfolioReport(portfolioId, options, tenantId);
      case 'documents':
        return await generateDocumentsReport(documentIds, options, tenantId);
      default:
        throw new Error(`Invalid report type: ${reportType}`);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

/**
 * Generate portfolio report
 * @param {string} portfolioId - Portfolio ID
 * @param {Object} options - Report options
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Report result
 */
const generatePortfolioReport = async (portfolioId, options, tenantId) => {
  try {
    // Get portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error || !portfolio) {
      throw new Error('Portfolio not found');
    }
    
    // Generate charts
    const charts = {};
    
    if (options.includeAllocation) {
      charts.allocation = generateAllocationChartData(portfolio.securities);
    }
    
    if (options.includePerformance && portfolio.historical_data) {
      charts.performance = generatePerformanceChartData(portfolio.historical_data);
    }
    
    // Generate report content
    const prompt = `
      Generate a portfolio analysis report with the following information:
      
      Portfolio Name: ${portfolio.name}
      Description: ${portfolio.description || 'N/A'}
      Total Value: ${portfolio.total_value || 'N/A'}
      Number of Securities: ${portfolio.securities?.length || 0}
      
      Securities:
      ${portfolio.securities?.map(security => `- ${security.name || 'Unknown'}: ${security.value || 'N/A'}`).join('\n') || 'None'}
      
      ${options.includeInsights ? 'Please include insights and recommendations based on the portfolio composition.' : ''}
      ${options.includeRisks ? 'Please include risk analysis and potential issues to be aware of.' : ''}
      
      Format the report in markdown with clear sections and bullet points where appropriate.
    `;
    
    const content = await generateContentInternal(prompt, tenantId);
    
    // Create report
    const report = {
      id: uuidv4(),
      type: 'portfolio',
      name: `${portfolio.name} Report`,
      content,
      charts,
      metadata: {
        portfolioId,
        portfolioName: portfolio.name,
        generatedAt: new Date().toISOString()
      }
    };
    
    // Save report
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert({
        id: report.id,
        name: report.name,
        type: report.type,
        content: report.content,
        charts: report.charts,
        metadata: report.metadata,
        user_id: portfolio.user_id,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving report:', saveError);
      throw new Error('Error saving report');
    }
    
    return savedReport;
  } catch (error) {
    console.error('Error generating portfolio report:', error);
    throw error;
  }
};

/**
 * Generate documents report
 * @param {Array} documentIds - Document IDs
 * @param {Object} options - Report options
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Report result
 */
const generateDocumentsReport = async (documentIds, options, tenantId) => {
  try {
    // Get documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds)
      .eq('tenant_id', tenantId);
    
    if (error) {
      throw new Error('Error getting documents');
    }
    
    if (!documents || documents.length === 0) {
      throw new Error('No documents found');
    }
    
    // Generate report content
    const prompt = `
      Generate a document analysis report for the following documents:
      
      ${documents.map((doc, index) => `
        Document ${index + 1}: ${doc.name}
        Type: ${doc.type}
        Status: ${doc.status}
        Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}
        ${doc.metadata?.securities ? `Securities: ${doc.metadata.securities.length}` : ''}
      `).join('\n')}
      
      ${options.includeComparison ? 'Please include a comparison of the documents, highlighting similarities and differences.' : ''}
      ${options.includeInsights ? 'Please include insights and key findings from the documents.' : ''}
      
      Format the report in markdown with clear sections and bullet points where appropriate.
    `;
    
    const content = await generateContentInternal(prompt, tenantId);
    
    // Create report
    const report = {
      id: uuidv4(),
      type: 'documents',
      name: `Document Analysis Report`,
      content,
      charts: {},
      metadata: {
        documentIds,
        documentNames: documents.map(doc => doc.name),
        generatedAt: new Date().toISOString()
      }
    };
    
    // Save report
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert({
        id: report.id,
        name: report.name,
        type: report.type,
        content: report.content,
        charts: report.charts,
        metadata: report.metadata,
        user_id: documents[0].user_id,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving report:', saveError);
      throw new Error('Error saving report');
    }
    
    return savedReport;
  } catch (error) {
    console.error('Error generating documents report:', error);
    throw error;
  }
};

/**
 * Check alert
 * @param {Object} config - Alert configuration
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Alert result
 */
const checkAlert = async (config, tenantId) => {
  try {
    const { alertType, conditions, portfolioId, documentIds } = config;
    
    // Check alert based on type
    switch (alertType) {
      case 'portfolio':
        return await checkPortfolioAlert(portfolioId, conditions, tenantId);
      case 'document':
        return await checkDocumentAlert(documentIds, conditions, tenantId);
      default:
        throw new Error(`Invalid alert type: ${alertType}`);
    }
  } catch (error) {
    console.error('Error checking alert:', error);
    throw error;
  }
};

/**
 * Check portfolio alert
 * @param {string} portfolioId - Portfolio ID
 * @param {Array} conditions - Alert conditions
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Alert result
 */
const checkPortfolioAlert = async (portfolioId, conditions, tenantId) => {
  try {
    // Get portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error || !portfolio) {
      throw new Error('Portfolio not found');
    }
    
    // Check conditions
    const triggeredConditions = [];
    
    for (const condition of conditions) {
      const { field, operator, value } = condition;
      
      // Get field value
      let fieldValue;
      
      if (field === 'totalValue') {
        fieldValue = portfolio.total_value;
      } else if (field === 'securitiesCount') {
        fieldValue = portfolio.securities?.length || 0;
      } else if (field.startsWith('security.')) {
        // Check security-specific condition
        const [_, securityField] = field.split('.');
        
        for (const security of (portfolio.securities || [])) {
          const securityValue = security[securityField];
          
          if (checkCondition(securityValue, operator, value)) {
            triggeredConditions.push({
              ...condition,
              security: security.name || 'Unknown',
              actualValue: securityValue
            });
          }
        }
        
        continue;
      } else {
        fieldValue = portfolio[field];
      }
      
      // Check condition
      if (checkCondition(fieldValue, operator, value)) {
        triggeredConditions.push({
          ...condition,
          actualValue: fieldValue
        });
      }
    }
    
    // Create alert if conditions triggered
    if (triggeredConditions.length > 0) {
      const alert = {
        id: uuidv4(),
        type: 'portfolio',
        name: `Portfolio Alert: ${portfolio.name}`,
        conditions: triggeredConditions,
        metadata: {
          portfolioId,
          portfolioName: portfolio.name,
          triggeredAt: new Date().toISOString()
        }
      };
      
      // Save alert
      const { data: savedAlert, error: saveError } = await supabase
        .from('alerts')
        .insert({
          id: alert.id,
          name: alert.name,
          type: alert.type,
          conditions: triggeredConditions,
          metadata: alert.metadata,
          user_id: portfolio.user_id,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          status: 'new'
        })
        .select()
        .single();
      
      if (saveError) {
        console.error('Error saving alert:', saveError);
        throw new Error('Error saving alert');
      }
      
      return {
        triggered: true,
        alert: savedAlert
      };
    }
    
    return {
      triggered: false
    };
  } catch (error) {
    console.error('Error checking portfolio alert:', error);
    throw error;
  }
};

/**
 * Check document alert
 * @param {Array} documentIds - Document IDs
 * @param {Array} conditions - Alert conditions
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Alert result
 */
const checkDocumentAlert = async (documentIds, conditions, tenantId) => {
  try {
    // Get documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds)
      .eq('tenant_id', tenantId);
    
    if (error) {
      throw new Error('Error getting documents');
    }
    
    if (!documents || documents.length === 0) {
      throw new Error('No documents found');
    }
    
    // Check conditions for each document
    const triggeredAlerts = [];
    
    for (const document of documents) {
      const triggeredConditions = [];
      
      for (const condition of conditions) {
        const { field, operator, value } = condition;
        
        // Get field value
        let fieldValue;
        
        if (field.startsWith('metadata.')) {
          const metadataField = field.replace('metadata.', '');
          fieldValue = document.metadata?.[metadataField];
        } else if (field.startsWith('security.')) {
          // Check security-specific condition
          const [_, securityField] = field.split('.');
          
          for (const security of (document.metadata?.securities || [])) {
            const securityValue = security[securityField];
            
            if (checkCondition(securityValue, operator, value)) {
              triggeredConditions.push({
                ...condition,
                security: security.name || 'Unknown',
                actualValue: securityValue
              });
            }
          }
          
          continue;
        } else {
          fieldValue = document[field];
        }
        
        // Check condition
        if (checkCondition(fieldValue, operator, value)) {
          triggeredConditions.push({
            ...condition,
            actualValue: fieldValue
          });
        }
      }
      
      // Create alert if conditions triggered
      if (triggeredConditions.length > 0) {
        const alert = {
          id: uuidv4(),
          type: 'document',
          name: `Document Alert: ${document.name}`,
          conditions: triggeredConditions,
          metadata: {
            documentId: document.id,
            documentName: document.name,
            triggeredAt: new Date().toISOString()
          }
        };
        
        // Save alert
        const { data: savedAlert, error: saveError } = await supabase
          .from('alerts')
          .insert({
            id: alert.id,
            name: alert.name,
            type: alert.type,
            conditions: triggeredConditions,
            metadata: alert.metadata,
            user_id: document.user_id,
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
            status: 'new'
          })
          .select()
          .single();
        
        if (saveError) {
          console.error('Error saving alert:', saveError);
          throw new Error('Error saving alert');
        }
        
        triggeredAlerts.push(savedAlert);
      }
    }
    
    return {
      triggered: triggeredAlerts.length > 0,
      alerts: triggeredAlerts
    };
  } catch (error) {
    console.error('Error checking document alert:', error);
    throw error;
  }
};

/**
 * Check condition
 * @param {any} fieldValue - Field value
 * @param {string} operator - Operator
 * @param {any} conditionValue - Condition value
 * @returns {boolean} Condition result
 */
const checkCondition = (fieldValue, operator, conditionValue) => {
  // Convert values to appropriate types
  if (typeof fieldValue === 'string' && !isNaN(fieldValue)) {
    fieldValue = parseFloat(fieldValue);
  }
  
  if (typeof conditionValue === 'string' && !isNaN(conditionValue)) {
    conditionValue = parseFloat(conditionValue);
  }
  
  // Check condition
  switch (operator) {
    case 'eq':
      return fieldValue === conditionValue;
    case 'neq':
      return fieldValue !== conditionValue;
    case 'gt':
      return fieldValue > conditionValue;
    case 'gte':
      return fieldValue >= conditionValue;
    case 'lt':
      return fieldValue < conditionValue;
    case 'lte':
      return fieldValue <= conditionValue;
    case 'contains':
      return String(fieldValue).includes(String(conditionValue));
    case 'notContains':
      return !String(fieldValue).includes(String(conditionValue));
    case 'startsWith':
      return String(fieldValue).startsWith(String(conditionValue));
    case 'endsWith':
      return String(fieldValue).endsWith(String(conditionValue));
    default:
      return false;
  }
};

/**
 * Calculate next run time
 * @param {Object} frequency - Frequency configuration
 * @returns {string} Next run time
 */
const calculateNextRun = (frequency) => {
  try {
    const { type, value } = frequency;
    const now = new Date();
    let nextRun = new Date();
    
    switch (type) {
      case 'daily':
        // Run daily at specified time (default: midnight)
        const [hour, minute] = (value || '0:0').split(':').map(Number);
        nextRun.setHours(hour, minute, 0, 0);
        
        // If time has passed for today, schedule for tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        // Run weekly on specified day (default: Sunday) at midnight
        const day = parseInt(value) || 0;
        nextRun.setHours(0, 0, 0, 0);
        
        // Set to next occurrence of day
        const currentDay = nextRun.getDay();
        const daysToAdd = (day - currentDay + 7) % 7;
        
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        
        // If day is today and time has passed, schedule for next week
        if (daysToAdd === 0 && nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'monthly':
        // Run monthly on specified day (default: 1st) at midnight
        const date = parseInt(value) || 1;
        nextRun.setDate(date);
        nextRun.setHours(0, 0, 0, 0);
        
        // If date has passed for this month, schedule for next month
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      case 'custom':
        // For custom cron, we'll use the next scheduled run from node-schedule
        // This is a simplification; in a real app, you'd calculate this properly
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
        break;
      default:
        console.error(`Invalid schedule type: ${type}`);
        return new Date().toISOString();
    }
    
    return nextRun.toISOString();
  } catch (error) {
    console.error('Error calculating next run:', error);
    return new Date().toISOString();
  }
};

module.exports = {
  initializeScheduler,
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  runSchedule
};
