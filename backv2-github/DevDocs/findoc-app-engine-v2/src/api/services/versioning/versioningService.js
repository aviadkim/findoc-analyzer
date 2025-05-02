/**
 * Versioning Service
 * 
 * This service manages document versioning and history tracking.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabaseService');

/**
 * Create a new document version
 * @param {string} documentId - Document ID
 * @param {Object} document - Document data
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @param {string} reason - Reason for version
 * @returns {Promise<Object>} Created version
 */
const createVersion = async (documentId, document, userId, tenantId, reason = '') => {
  try {
    // Get current version number
    const { data: versions, error: versionsError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);
    
    const versionNumber = versions && versions.length > 0
      ? versions[0].version_number + 1
      : 1;
    
    // Create version
    const version = {
      id: uuidv4(),
      document_id: documentId,
      version_number: versionNumber,
      name: document.name,
      type: document.type,
      size: document.size,
      path: await createVersionFile(document.path, documentId, versionNumber),
      metadata: document.metadata || {},
      status: document.status,
      user_id: userId,
      tenant_id: tenantId,
      reason,
      created_at: new Date().toISOString()
    };
    
    // Insert version into database
    const { data, error } = await supabase
      .from('document_versions')
      .insert(version)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating document version:', error);
      throw new Error('Error creating document version');
    }
    
    return data;
  } catch (error) {
    console.error('Error in createVersion:', error);
    throw error;
  }
};

/**
 * Get document versions
 * @param {string} documentId - Document ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Versions
 */
const getVersions = async (documentId, tenantId) => {
  try {
    // Get versions from database
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .eq('tenant_id', tenantId)
      .order('version_number', { ascending: false });
    
    if (error) {
      console.error('Error getting document versions:', error);
      throw new Error('Error getting document versions');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getVersions:', error);
    throw error;
  }
};

/**
 * Get document version by ID
 * @param {string} versionId - Version ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Version
 */
const getVersionById = async (versionId, tenantId) => {
  try {
    // Get version from database
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error getting document version:', error);
      throw new Error('Error getting document version');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getVersionById:', error);
    throw error;
  }
};

/**
 * Get document version by number
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Version
 */
const getVersionByNumber = async (documentId, versionNumber, tenantId) => {
  try {
    // Get version from database
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .eq('version_number', versionNumber)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error getting document version:', error);
      throw new Error('Error getting document version');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getVersionByNumber:', error);
    throw error;
  }
};

/**
 * Restore document version
 * @param {string} documentId - Document ID
 * @param {string} versionId - Version ID
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Updated document
 */
const restoreVersion = async (documentId, versionId, userId, tenantId) => {
  try {
    // Get version
    const version = await getVersionById(versionId, tenantId);
    
    if (!version || version.document_id !== documentId) {
      throw new Error('Version not found or does not belong to document');
    }
    
    // Get document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (documentError || !document) {
      throw new Error('Document not found');
    }
    
    // Create a version of the current state before restoring
    await createVersion(documentId, document, userId, tenantId, 'Before restore');
    
    // Copy version file to document path
    await copyFile(version.path, document.path);
    
    // Update document
    const updateData = {
      name: version.name,
      type: version.type,
      size: version.size,
      metadata: version.metadata,
      status: version.status,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedDocument, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) {
      console.error('Error restoring document version:', error);
      throw new Error('Error restoring document version');
    }
    
    return updatedDocument;
  } catch (error) {
    console.error('Error in restoreVersion:', error);
    throw error;
  }
};

/**
 * Compare document versions
 * @param {string} documentId - Document ID
 * @param {string} versionId1 - First version ID
 * @param {string} versionId2 - Second version ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Comparison result
 */
const compareVersions = async (documentId, versionId1, versionId2, tenantId) => {
  try {
    // Get versions
    const version1 = await getVersionById(versionId1, tenantId);
    const version2 = await getVersionById(versionId2, tenantId);
    
    if (!version1 || !version2 || version1.document_id !== documentId || version2.document_id !== documentId) {
      throw new Error('Versions not found or do not belong to document');
    }
    
    // Compare metadata
    const metadataComparison = compareObjects(version1.metadata, version2.metadata);
    
    // Compare basic properties
    const propertyComparison = {
      name: {
        version1: version1.name,
        version2: version2.name,
        changed: version1.name !== version2.name
      },
      type: {
        version1: version1.type,
        version2: version2.type,
        changed: version1.type !== version2.type
      },
      size: {
        version1: version1.size,
        version2: version2.size,
        changed: version1.size !== version2.size
      },
      status: {
        version1: version1.status,
        version2: version2.status,
        changed: version1.status !== version2.status
      }
    };
    
    return {
      version1: {
        id: version1.id,
        versionNumber: version1.version_number,
        createdAt: version1.created_at,
        userId: version1.user_id,
        reason: version1.reason
      },
      version2: {
        id: version2.id,
        versionNumber: version2.version_number,
        createdAt: version2.created_at,
        userId: version2.user_id,
        reason: version2.reason
      },
      propertyComparison,
      metadataComparison
    };
  } catch (error) {
    console.error('Error in compareVersions:', error);
    throw error;
  }
};

/**
 * Delete document version
 * @param {string} versionId - Version ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} Success
 */
const deleteVersion = async (versionId, tenantId) => {
  try {
    // Get version
    const version = await getVersionById(versionId, tenantId);
    
    if (!version) {
      throw new Error('Version not found');
    }
    
    // Delete version file
    if (fs.existsSync(version.path)) {
      fs.unlinkSync(version.path);
    }
    
    // Delete version from database
    const { error } = await supabase
      .from('document_versions')
      .delete()
      .eq('id', versionId)
      .eq('tenant_id', tenantId);
    
    if (error) {
      console.error('Error deleting document version:', error);
      throw new Error('Error deleting document version');
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteVersion:', error);
    throw error;
  }
};

/**
 * Create version file
 * @param {string} sourcePath - Source file path
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number
 * @returns {Promise<string>} Version file path
 */
const createVersionFile = async (sourcePath, documentId, versionNumber) => {
  try {
    // Create versions directory if it doesn't exist
    const versionsDir = path.join('versions', documentId);
    
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
    }
    
    // Generate version file path
    const extension = path.extname(sourcePath);
    const versionPath = path.join(versionsDir, `v${versionNumber}${extension}`);
    
    // Copy file
    await copyFile(sourcePath, versionPath);
    
    return versionPath;
  } catch (error) {
    console.error('Error creating version file:', error);
    throw error;
  }
};

/**
 * Copy file
 * @param {string} sourcePath - Source file path
 * @param {string} destinationPath - Destination file path
 * @returns {Promise<void>}
 */
const copyFile = (sourcePath, destinationPath) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destinationPath);
    
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    
    readStream.pipe(writeStream);
  });
};

/**
 * Compare objects
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Object} Comparison result
 */
const compareObjects = (obj1, obj2) => {
  const result = {};
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  
  for (const key of allKeys) {
    const value1 = obj1?.[key];
    const value2 = obj2?.[key];
    
    if (typeof value1 === 'object' && typeof value2 === 'object' && value1 !== null && value2 !== null) {
      // Recursively compare nested objects
      result[key] = {
        type: 'object',
        comparison: compareObjects(value1, value2)
      };
    } else {
      result[key] = {
        version1: value1,
        version2: value2,
        changed: JSON.stringify(value1) !== JSON.stringify(value2)
      };
    }
  }
  
  return result;
};

module.exports = {
  createVersion,
  getVersions,
  getVersionById,
  getVersionByNumber,
  restoreVersion,
  compareVersions,
  deleteVersion
};
