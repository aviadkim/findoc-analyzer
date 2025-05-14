/**
 * Tenant Service
 * 
 * A service for managing multi-tenant functionality in the FinDoc Analyzer
 * Provides tenant isolation, tenant-specific settings, and access control
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Promisified fs functions
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Tenant statuses
const TENANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  ARCHIVED: 'archived'
};

// Tenant tiers
const TENANT_TIER = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
};

// Default storage paths
const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');
const DEFAULT_TENANTS_DIR = path.join(DEFAULT_DATA_DIR, 'tenants');
const DEFAULT_TENANTS_FILE = path.join(DEFAULT_DATA_DIR, 'tenants.json');

// Default options
const DEFAULT_OPTIONS = {
  dataDir: DEFAULT_DATA_DIR,
  tenantsDir: DEFAULT_TENANTS_DIR,
  tenantsFile: DEFAULT_TENANTS_FILE,
  createDefaultTenant: true,
  defaultTenantId: 'default',
  maxUsersPerTenant: {
    [TENANT_TIER.FREE]: 5,
    [TENANT_TIER.BASIC]: 25,
    [TENANT_TIER.PROFESSIONAL]: 100,
    [TENANT_TIER.ENTERPRISE]: 1000
  },
  maxStoragePerTenant: {
    [TENANT_TIER.FREE]: 1 * 1024 * 1024 * 1024, // 1GB
    [TENANT_TIER.BASIC]: 10 * 1024 * 1024 * 1024, // 10GB
    [TENANT_TIER.PROFESSIONAL]: 100 * 1024 * 1024 * 1024, // 100GB
    [TENANT_TIER.ENTERPRISE]: 1000 * 1024 * 1024 * 1024 // 1TB
  },
  maxDocsPerTenant: {
    [TENANT_TIER.FREE]: 100,
    [TENANT_TIER.BASIC]: 1000,
    [TENANT_TIER.PROFESSIONAL]: 10000,
    [TENANT_TIER.ENTERPRISE]: 100000
  },
  tenantAutoExpiry: {
    [TENANT_TIER.FREE]: 90, // days
    [TENANT_TIER.BASIC]: 365, // days
    [TENANT_TIER.PROFESSIONAL]: 365, // days
    [TENANT_TIER.ENTERPRISE]: 730 // days
  },
  useMockData: false
};

/**
 * Tenant Service for multi-tenant functionality
 */
class TenantService {
  /**
   * Initialize the tenant service
   * @param {Object} options - Service options
   */
  constructor(options = {}) {
    // Merge options with defaults
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Initialize tenants map (in-memory cache)
    this.tenants = new Map();
    
    // Initialize service
    this.initialize();
  }
  
  /**
   * Initialize the service
   * @private
   */
  async initialize() {
    try {
      // Create directories
      await mkdirAsync(this.options.dataDir, { recursive: true });
      await mkdirAsync(this.options.tenantsDir, { recursive: true });
      
      // Load tenants from file
      await this.loadTenants();
      
      // Create default tenant if enabled
      if (this.options.createDefaultTenant && !this.tenants.has(this.options.defaultTenantId)) {
        await this.createTenant({
          id: this.options.defaultTenantId,
          name: 'Default Tenant',
          tier: TENANT_TIER.PROFESSIONAL,
          status: TENANT_STATUS.ACTIVE
        });
      }
      
      console.log(`Tenant Service initialized with ${this.tenants.size} tenants`);
    } catch (error) {
      console.error('Error initializing tenant service:', error);
    }
  }
  
  /**
   * Load tenants from file
   * @private
   */
  async loadTenants() {
    try {
      // Check if tenants file exists
      if (fs.existsSync(this.options.tenantsFile)) {
        // Read tenants file
        const tenantsData = await readFileAsync(this.options.tenantsFile, 'utf8');
        const tenants = JSON.parse(tenantsData);
        
        // Add tenants to map
        tenants.forEach(tenant => {
          this.tenants.set(tenant.id, tenant);
        });
        
        console.log(`Loaded ${tenants.length} tenants from file`);
      } else if (this.options.useMockData) {
        // Create mock tenants
        const mockTenants = this.createMockTenants();
        
        // Add tenants to map
        mockTenants.forEach(tenant => {
          this.tenants.set(tenant.id, tenant);
        });
        
        // Save tenants to file
        await this.saveTenants();
        
        console.log(`Created ${mockTenants.length} mock tenants`);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      throw error;
    }
  }
  
  /**
   * Save tenants to file
   * @private
   */
  async saveTenants() {
    try {
      // Convert tenants map to array
      const tenants = Array.from(this.tenants.values());
      
      // Save to file
      await writeFileAsync(this.options.tenantsFile, JSON.stringify(tenants, null, 2));
      
      console.log(`Saved ${tenants.length} tenants to file`);
    } catch (error) {
      console.error('Error saving tenants:', error);
      throw error;
    }
  }
  
  /**
   * Create mock tenants for testing
   * @private
   * @returns {Array} - Mock tenants
   */
  createMockTenants() {
    // Create mock tenants
    const mockTenants = [
      {
        id: 'tenant-1',
        name: 'Acme Corporation',
        tier: TENANT_TIER.ENTERPRISE,
        status: TENANT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'admin@acme.example.com',
        adminUserId: 'user-1',
        settings: {
          enableAdvancedAnalytics: true,
          enableBatchProcessing: true,
          enableMultiDocumentComparison: true,
          defaultLanguage: 'en',
          customLogo: 'https://logo.acme.example.com/logo.png',
          customColors: {
            primary: '#007bff',
            secondary: '#6c757d'
          }
        },
        metadata: {
          industry: 'Manufacturing',
          employees: 5000,
          plan: 'Enterprise Annual',
          paymentStatus: 'Active'
        },
        apiKeys: [
          {
            id: 'api-key-1',
            name: 'Production API Key',
            key: 'sk_live_acme_' + crypto.randomBytes(16).toString('hex'),
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
            lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            permissions: ['read', 'write', 'process']
          }
        ],
        limits: {
          maxUsers: 500,
          maxStorage: 500 * 1024 * 1024 * 1024, // 500GB
          maxDocs: 50000,
          maxConcurrentProcessing: 20
        },
        usage: {
          users: 178,
          storage: 123 * 1024 * 1024 * 1024, // 123GB
          docs: 12489,
          apiCalls: {
            total: 45789,
            lastMonth: 5432
          }
        }
      },
      {
        id: 'tenant-2',
        name: 'Startup Labs',
        tier: TENANT_TIER.PROFESSIONAL,
        status: TENANT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'admin@startuplabs.example.com',
        adminUserId: 'user-2',
        settings: {
          enableAdvancedAnalytics: true,
          enableBatchProcessing: true,
          enableMultiDocumentComparison: true,
          defaultLanguage: 'en'
        },
        metadata: {
          industry: 'Technology',
          employees: 50,
          plan: 'Professional Monthly',
          paymentStatus: 'Active'
        },
        apiKeys: [
          {
            id: 'api-key-2',
            name: 'Development API Key',
            key: 'sk_test_startup_' + crypto.randomBytes(16).toString('hex'),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
            lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            permissions: ['read', 'write', 'process']
          }
        ],
        limits: {
          maxUsers: 100,
          maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
          maxDocs: 10000,
          maxConcurrentProcessing: 10
        },
        usage: {
          users: 28,
          storage: 45 * 1024 * 1024 * 1024, // 45GB
          docs: 2345,
          apiCalls: {
            total: 12345,
            lastMonth: 2345
          }
        }
      },
      {
        id: 'tenant-3',
        name: 'Small Business',
        tier: TENANT_TIER.BASIC,
        status: TENANT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'admin@smallbiz.example.com',
        adminUserId: 'user-3',
        settings: {
          enableAdvancedAnalytics: false,
          enableBatchProcessing: true,
          enableMultiDocumentComparison: false,
          defaultLanguage: 'en'
        },
        metadata: {
          industry: 'Retail',
          employees: 15,
          plan: 'Basic Annual',
          paymentStatus: 'Active'
        },
        limits: {
          maxUsers: 25,
          maxStorage: 10 * 1024 * 1024 * 1024, // 10GB
          maxDocs: 1000,
          maxConcurrentProcessing: 5
        },
        usage: {
          users: 12,
          storage: 3.2 * 1024 * 1024 * 1024, // 3.2GB
          docs: 345,
          apiCalls: {
            total: 3456,
            lastMonth: 678
          }
        }
      },
      {
        id: 'tenant-4',
        name: 'Freelancer',
        tier: TENANT_TIER.FREE,
        status: TENANT_STATUS.ACTIVE,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        adminEmail: 'freelancer@example.com',
        adminUserId: 'user-4',
        settings: {
          enableAdvancedAnalytics: false,
          enableBatchProcessing: false,
          enableMultiDocumentComparison: false,
          defaultLanguage: 'en'
        },
        metadata: {
          industry: 'Consulting',
          employees: 1,
          plan: 'Free',
          paymentStatus: 'N/A'
        },
        limits: {
          maxUsers: 5,
          maxStorage: 1 * 1024 * 1024 * 1024, // 1GB
          maxDocs: 100,
          maxConcurrentProcessing: 1
        },
        usage: {
          users: 1,
          storage: 0.3 * 1024 * 1024 * 1024, // 0.3GB
          docs: 25,
          apiCalls: {
            total: 350,
            lastMonth: 110
          }
        }
      }
    ];
    
    return mockTenants;
  }
  
  /**
   * Create a new tenant
   * @param {Object} tenantData - Tenant data
   * @returns {Promise<Object>} - Created tenant
   */
  async createTenant(tenantData) {
    try {
      const tenantId = tenantData.id || `tenant-${uuidv4()}`;
      
      // Check if tenant already exists
      if (this.tenants.has(tenantId)) {
        throw new Error(`Tenant with ID ${tenantId} already exists`);
      }
      
      // Set tenant tier
      const tier = tenantData.tier || TENANT_TIER.FREE;
      
      // Create tenant
      const tenant = {
        id: tenantId,
        name: tenantData.name || `Tenant ${tenantId}`,
        tier,
        status: tenantData.status || TENANT_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: tenantData.expiresAt || new Date(Date.now() + (this.options.tenantAutoExpiry[tier] || 90) * 24 * 60 * 60 * 1000).toISOString(),
        adminEmail: tenantData.adminEmail,
        adminUserId: tenantData.adminUserId,
        settings: tenantData.settings || {
          enableAdvancedAnalytics: tier !== TENANT_TIER.FREE,
          enableBatchProcessing: tier !== TENANT_TIER.FREE,
          enableMultiDocumentComparison: tier === TENANT_TIER.PROFESSIONAL || tier === TENANT_TIER.ENTERPRISE,
          defaultLanguage: 'en'
        },
        metadata: tenantData.metadata || {},
        apiKeys: tenantData.apiKeys || [],
        limits: tenantData.limits || {
          maxUsers: this.options.maxUsersPerTenant[tier],
          maxStorage: this.options.maxStoragePerTenant[tier],
          maxDocs: this.options.maxDocsPerTenant[tier],
          maxConcurrentProcessing: tier === TENANT_TIER.FREE ? 1 : 
                                   tier === TENANT_TIER.BASIC ? 5 : 
                                   tier === TENANT_TIER.PROFESSIONAL ? 10 : 20
        },
        usage: tenantData.usage || {
          users: 0,
          storage: 0,
          docs: 0,
          apiCalls: {
            total: 0,
            lastMonth: 0
          }
        }
      };
      
      // Create tenant directory
      const tenantDir = path.join(this.options.tenantsDir, tenantId);
      await mkdirAsync(tenantDir, { recursive: true });
      
      // Create tenant subdirectories
      await mkdirAsync(path.join(tenantDir, 'data'), { recursive: true });
      await mkdirAsync(path.join(tenantDir, 'uploads'), { recursive: true });
      await mkdirAsync(path.join(tenantDir, 'results'), { recursive: true });
      await mkdirAsync(path.join(tenantDir, 'exports'), { recursive: true });
      
      // Add tenant to map
      this.tenants.set(tenantId, tenant);
      
      // Save tenants to file
      await this.saveTenants();
      
      console.log(`Created tenant: ${tenantId}`);
      
      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }
  
  /**
   * Get tenant by ID
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Tenant
   */
  async getTenant(tenantId) {
    try {
      // Check if tenant exists
      if (!this.tenants.has(tenantId)) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      
      return this.tenants.get(tenantId);
    } catch (error) {
      console.error(`Error getting tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated tenant
   */
  async updateTenant(tenantId, updateData) {
    try {
      // Get tenant
      const tenant = await this.getTenant(tenantId);
      
      // Update tenant
      const updatedTenant = {
        ...tenant,
        ...updateData,
        id: tenant.id, // Prevent ID change
        updatedAt: new Date().toISOString()
      };
      
      // Add tenant to map
      this.tenants.set(tenantId, updatedTenant);
      
      // Save tenants to file
      await this.saveTenants();
      
      console.log(`Updated tenant: ${tenantId}`);
      
      return updatedTenant;
    } catch (error) {
      console.error(`Error updating tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete tenant
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<boolean>} - Success
   */
  async deleteTenant(tenantId) {
    try {
      // Check if tenant exists
      if (!this.tenants.has(tenantId)) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      
      // Prevent deletion of default tenant
      if (tenantId === this.options.defaultTenantId) {
        throw new Error('Cannot delete default tenant');
      }
      
      // Remove tenant from map
      this.tenants.delete(tenantId);
      
      // Save tenants to file
      await this.saveTenants();
      
      // Delete tenant directory (optional - can be archived instead)
      const tenantDir = path.join(this.options.tenantsDir, tenantId);
      // TODO: Implement proper archiving or deletion strategy
      
      console.log(`Deleted tenant: ${tenantId}`);
      
      return true;
    } catch (error) {
      console.error(`Error deleting tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all tenants
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Tenants
   */
  async getAllTenants(options = {}) {
    try {
      let tenants = Array.from(this.tenants.values());
      
      // Apply filters
      if (options.status) {
        tenants = tenants.filter(tenant => tenant.status === options.status);
      }
      
      if (options.tier) {
        tenants = tenants.filter(tenant => tenant.tier === options.tier);
      }
      
      // Apply search
      if (options.search) {
        const search = options.search.toLowerCase();
        tenants = tenants.filter(tenant => 
          tenant.name.toLowerCase().includes(search) || 
          tenant.id.toLowerCase().includes(search) ||
          (tenant.adminEmail && tenant.adminEmail.toLowerCase().includes(search))
        );
      }
      
      // Apply sorting
      if (options.sortBy) {
        const sortField = options.sortBy;
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        
        tenants.sort((a, b) => {
          if (a[sortField] < b[sortField]) return -1 * sortOrder;
          if (a[sortField] > b[sortField]) return 1 * sortOrder;
          return 0;
        });
      } else {
        // Default sort by creation date (newest first)
        tenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Apply pagination
      if (options.limit) {
        const start = options.offset || 0;
        const end = start + options.limit;
        tenants = tenants.slice(start, end);
      }
      
      return tenants;
    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw error;
    }
  }
  
  /**
   * Get tenant storage path
   * @param {string} tenantId - Tenant ID
   * @param {string} type - Path type (data, uploads, results, exports)
   * @returns {Promise<string>} - Tenant storage path
   */
  async getTenantStoragePath(tenantId, type = 'data') {
    try {
      // Check if tenant exists
      await this.getTenant(tenantId);
      
      // Get path type
      const pathType = ['data', 'uploads', 'results', 'exports'].includes(type) ? type : 'data';
      
      // Get tenant directory
      const tenantDir = path.join(this.options.tenantsDir, tenantId);
      
      // Return path
      return path.join(tenantDir, pathType);
    } catch (error) {
      console.error(`Error getting tenant storage path for ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if tenant can perform action
   * @param {string} tenantId - Tenant ID
   * @param {string} action - Action to check
   * @returns {Promise<boolean>} - Whether action is allowed
   */
  async canPerformAction(tenantId, action) {
    try {
      // Get tenant
      const tenant = await this.getTenant(tenantId);
      
      // Check tenant status
      if (tenant.status !== TENANT_STATUS.ACTIVE) {
        return false;
      }
      
      // Check tenant expiry
      if (new Date(tenant.expiresAt) < new Date()) {
        return false;
      }
      
      // Check specific actions
      switch (action) {
        case 'batch-processing':
          return tenant.settings.enableBatchProcessing === true;
        
        case 'advanced-analytics':
          return tenant.settings.enableAdvancedAnalytics === true;
        
        case 'multi-document-comparison':
          return tenant.settings.enableMultiDocumentComparison === true;
        
        case 'api-access':
          return tenant.tier !== TENANT_TIER.FREE;
        
        default:
          return true;
      }
    } catch (error) {
      console.error(`Error checking if tenant ${tenantId} can perform action ${action}:`, error);
      return false;
    }
  }
  
  /**
   * Update tenant usage
   * @param {string} tenantId - Tenant ID
   * @param {Object} usageData - Usage data to update
   * @returns {Promise<Object>} - Updated tenant
   */
  async updateTenantUsage(tenantId, usageData) {
    try {
      // Get tenant
      const tenant = await this.getTenant(tenantId);
      
      // Update usage
      const updatedUsage = {
        ...tenant.usage,
        ...usageData
      };
      
      // Update API calls
      if (usageData.apiCall) {
        updatedUsage.apiCalls = {
          total: (tenant.usage.apiCalls?.total || 0) + 1,
          lastMonth: (tenant.usage.apiCalls?.lastMonth || 0) + 1
        };
      }
      
      // Update tenant
      const updatedTenant = await this.updateTenant(tenantId, {
        usage: updatedUsage
      });
      
      return updatedTenant;
    } catch (error) {
      console.error(`Error updating tenant usage for ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate API key for tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} keyData - API key data
   * @returns {Promise<Object>} - Generated API key
   */
  async generateApiKey(tenantId, keyData = {}) {
    try {
      // Get tenant
      const tenant = await this.getTenant(tenantId);
      
      // Check if tenant can have API keys
      if (tenant.tier === TENANT_TIER.FREE) {
        throw new Error('Free tier tenants cannot generate API keys');
      }
      
      // Generate API key
      const apiKeyId = keyData.id || `api-key-${uuidv4()}`;
      const apiKey = {
        id: apiKeyId,
        name: keyData.name || `API Key ${new Date().toISOString()}`,
        key: `sk_${tenant.tier.substring(0, 4)}_${tenant.id}_${crypto.randomBytes(16).toString('hex')}`,
        createdAt: new Date().toISOString(),
        expiresAt: keyData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsedAt: null,
        permissions: keyData.permissions || ['read', 'write', 'process']
      };
      
      // Add API key to tenant
      const apiKeys = tenant.apiKeys || [];
      apiKeys.push(apiKey);
      
      // Update tenant
      await this.updateTenant(tenantId, {
        apiKeys
      });
      
      console.log(`Generated API key for tenant ${tenantId}: ${apiKeyId}`);
      
      return apiKey;
    } catch (error) {
      console.error(`Error generating API key for tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Validate API key
   * @param {string} apiKey - API key to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateApiKey(apiKey) {
    try {
      // Find tenant with API key
      let matchingTenant = null;
      let matchingKey = null;
      
      for (const [tenantId, tenant] of this.tenants.entries()) {
        if (tenant.apiKeys) {
          const foundKey = tenant.apiKeys.find(key => key.key === apiKey);
          
          if (foundKey) {
            matchingTenant = tenant;
            matchingKey = foundKey;
            break;
          }
        }
      }
      
      // Check if API key was found
      if (!matchingTenant || !matchingKey) {
        return {
          valid: false,
          error: 'Invalid API key'
        };
      }
      
      // Check if API key has expired
      if (new Date(matchingKey.expiresAt) < new Date()) {
        return {
          valid: false,
          error: 'API key has expired'
        };
      }
      
      // Check if tenant is active
      if (matchingTenant.status !== TENANT_STATUS.ACTIVE) {
        return {
          valid: false,
          error: 'Tenant is not active'
        };
      }
      
      // Check if tenant has expired
      if (new Date(matchingTenant.expiresAt) < new Date()) {
        return {
          valid: false,
          error: 'Tenant has expired'
        };
      }
      
      // Update last used timestamp
      const updatedApiKeys = matchingTenant.apiKeys.map(key => {
        if (key.id === matchingKey.id) {
          return {
            ...key,
            lastUsedAt: new Date().toISOString()
          };
        }
        return key;
      });
      
      // Update tenant
      await this.updateTenant(matchingTenant.id, {
        apiKeys: updatedApiKeys
      });
      
      // Update API call count
      await this.updateTenantUsage(matchingTenant.id, { apiCall: true });
      
      return {
        valid: true,
        tenantId: matchingTenant.id,
        permissions: matchingKey.permissions
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return {
        valid: false,
        error: 'Error validating API key'
      };
    }
  }
  
  /**
   * Check if tenant has reached limits
   * @param {string} tenantId - Tenant ID
   * @param {string} limitType - Limit type to check
   * @returns {Promise<Object>} - Limit check result
   */
  async checkTenantLimits(tenantId, limitType) {
    try {
      // Get tenant
      const tenant = await this.getTenant(tenantId);
      
      // Check specific limit
      switch (limitType) {
        case 'users':
          return {
            reached: tenant.usage.users >= tenant.limits.maxUsers,
            current: tenant.usage.users,
            limit: tenant.limits.maxUsers,
            percentage: Math.round((tenant.usage.users / tenant.limits.maxUsers) * 100)
          };
        
        case 'storage':
          return {
            reached: tenant.usage.storage >= tenant.limits.maxStorage,
            current: tenant.usage.storage,
            limit: tenant.limits.maxStorage,
            percentage: Math.round((tenant.usage.storage / tenant.limits.maxStorage) * 100)
          };
        
        case 'docs':
          return {
            reached: tenant.usage.docs >= tenant.limits.maxDocs,
            current: tenant.usage.docs,
            limit: tenant.limits.maxDocs,
            percentage: Math.round((tenant.usage.docs / tenant.limits.maxDocs) * 100)
          };
        
        case 'concurrentProcessing':
          // This would require real-time tracking
          return {
            reached: false, // Placeholder
            current: 0, // Placeholder
            limit: tenant.limits.maxConcurrentProcessing,
            percentage: 0 // Placeholder
          };
        
        default:
          return {
            reached: false,
            error: 'Unknown limit type'
          };
      }
    } catch (error) {
      console.error(`Error checking tenant limits for ${tenantId}:`, error);
      return {
        reached: true, // Fail safe
        error: 'Error checking tenant limits'
      };
    }
  }
  
  /**
   * Get tenant features
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<Object>} - Tenant features
   */
  async getTenantFeatures(tenantId) {
    try {
      // Get tenant
      const tenant = await this.getTenant(tenantId);
      
      // Build features object based on tier and settings
      const features = {
        // Core features (available to all tiers)
        documentUpload: true,
        documentProcessing: true,
        basicAnalytics: true,
        documentChat: true,
        
        // Tier-based features
        advancedAnalytics: tenant.tier !== TENANT_TIER.FREE,
        batchProcessing: tenant.tier !== TENANT_TIER.FREE && tenant.settings.enableBatchProcessing !== false,
        multiDocumentComparison: (tenant.tier === TENANT_TIER.PROFESSIONAL || tenant.tier === TENANT_TIER.ENTERPRISE) && 
                                tenant.settings.enableMultiDocumentComparison !== false,
        dataExport: tenant.tier !== TENANT_TIER.FREE,
        apiAccess: tenant.tier !== TENANT_TIER.FREE,
        
        // Enterprise-only features
        customBranding: tenant.tier === TENANT_TIER.ENTERPRISE,
        sla: tenant.tier === TENANT_TIER.ENTERPRISE,
        dedicatedSupport: tenant.tier === TENANT_TIER.ENTERPRISE,
        
        // Custom features from settings
        customFeatures: tenant.settings.customFeatures || {}
      };
      
      return features;
    } catch (error) {
      console.error(`Error getting tenant features for ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate tenant storage usage
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<number>} - Storage usage in bytes
   */
  async calculateTenantStorage(tenantId) {
    try {
      // Get tenant storage path
      const tenantDir = path.join(this.options.tenantsDir, tenantId);
      
      // Calculate total size
      const totalSize = await this.calculateDirectorySize(tenantDir);
      
      // Update tenant usage
      await this.updateTenantUsage(tenantId, {
        storage: totalSize
      });
      
      return totalSize;
    } catch (error) {
      console.error(`Error calculating tenant storage for ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate directory size recursively
   * @private
   * @param {string} dirPath - Directory path
   * @returns {Promise<number>} - Directory size in bytes
   */
  async calculateDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      
      // Read directory
      const files = await readdirAsync(dirPath);
      
      // Process files
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await statAsync(filePath);
        
        if (stats.isDirectory()) {
          // Recursive call for subdirectories
          totalSize += await this.calculateDirectorySize(filePath);
        } else {
          // Add file size
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error(`Error calculating directory size for ${dirPath}:`, error);
      return 0;
    }
  }
}

// Export constants and service
module.exports = {
  TenantService,
  TENANT_STATUS,
  TENANT_TIER
};