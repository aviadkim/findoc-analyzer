/**
 * Template Service
 * 
 * This service manages custom document templates and extraction rules.
 */

const { supabase } = require('../supabaseService');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new template
 * @param {Object} template - Template data
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Created template
 */
const createTemplate = async (template, userId, tenantId) => {
  try {
    const { name, description, documentType, extractionRules } = template;
    
    // Validate template
    if (!name || !documentType || !extractionRules) {
      throw new Error('Name, document type, and extraction rules are required');
    }
    
    // Create template
    const newTemplate = {
      id: uuidv4(),
      name,
      description: description || '',
      document_type: documentType,
      extraction_rules: extractionRules,
      user_id: userId,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert template into database
    const { data, error } = await supabase
      .from('templates')
      .insert(newTemplate)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating template:', error);
      throw new Error('Error creating template');
    }
    
    return data;
  } catch (error) {
    console.error('Error in createTemplate:', error);
    throw error;
  }
};

/**
 * Get templates for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Templates
 */
const getTemplates = async (tenantId) => {
  try {
    // Get templates from database
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) {
      console.error('Error getting templates:', error);
      throw new Error('Error getting templates');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getTemplates:', error);
    throw error;
  }
};

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Template
 */
const getTemplateById = async (templateId, tenantId) => {
  try {
    // Get template from database
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error getting template:', error);
      throw new Error('Error getting template');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    throw error;
  }
};

/**
 * Update template
 * @param {string} templateId - Template ID
 * @param {Object} template - Template data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Updated template
 */
const updateTemplate = async (templateId, template, tenantId) => {
  try {
    const { name, description, documentType, extractionRules } = template;
    
    // Create update object
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (documentType) updateData.document_type = documentType;
    if (extractionRules) updateData.extraction_rules = extractionRules;
    
    // Update template in database
    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', templateId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating template:', error);
      throw new Error('Error updating template');
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    throw error;
  }
};

/**
 * Delete template
 * @param {string} templateId - Template ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} Success
 */
const deleteTemplate = async (templateId, tenantId) => {
  try {
    // Delete template from database
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('tenant_id', tenantId);
    
    if (error) {
      console.error('Error deleting template:', error);
      throw new Error('Error deleting template');
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    throw error;
  }
};

/**
 * Apply template to document
 * @param {Object} document - Document data
 * @param {string} templateId - Template ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Processed document
 */
const applyTemplate = async (document, templateId, tenantId) => {
  try {
    // Get template
    const template = await getTemplateById(templateId, tenantId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Apply extraction rules to document
    const extractionRules = template.extraction_rules;
    const extractedData = {};
    
    // In a real app, this would use a more sophisticated extraction algorithm
    // For now, we'll just use a simple example
    if (document.content) {
      for (const rule of extractionRules) {
        const { field, pattern, type } = rule;
        
        if (pattern && field) {
          const regex = new RegExp(pattern, 'i');
          const match = document.content.match(regex);
          
          if (match && match[1]) {
            let value = match[1].trim();
            
            // Convert value based on type
            if (type === 'number') {
              value = parseFloat(value);
            } else if (type === 'boolean') {
              value = value.toLowerCase() === 'true';
            } else if (type === 'date') {
              value = new Date(value).toISOString();
            }
            
            extractedData[field] = value;
          }
        }
      }
    }
    
    // Return processed document
    return {
      ...document,
      extractedData,
      templateId,
      templateName: template.name
    };
  } catch (error) {
    console.error('Error in applyTemplate:', error);
    throw error;
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  applyTemplate
};
