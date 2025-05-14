/**
 * Mock Supabase Client
 *
 * This module provides a mock Supabase client for the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directory to store mock data
const DATA_DIR = path.join(__dirname, 'mock-data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Tables
const TABLES = {
  tenants: 'tenants.json',
  api_keys: 'api_keys.json',
  api_key_usage: 'api_key_usage.json',
  documents: 'documents.json'
};

// Initialize tables
for (const table of Object.values(TABLES)) {
  const tablePath = path.join(DATA_DIR, table);

  if (!fs.existsSync(tablePath)) {
    fs.writeFileSync(tablePath, JSON.stringify([], null, 2));
  }
}

// Helper function to read table data
function readTable(table) {
  const tablePath = path.join(DATA_DIR, TABLES[table]);
  return JSON.parse(fs.readFileSync(tablePath, 'utf8'));
}

// Helper function to write table data
function writeTable(table, data) {
  const tablePath = path.join(DATA_DIR, TABLES[table]);
  fs.writeFileSync(tablePath, JSON.stringify(data, null, 2));
}

// Mock Supabase client
const supabase = {
  from: (table) => {
    return {
      select: (columns) => {
        return {
          eq: (column, value) => {
            return {
              single: () => {
                try {
                  const data = readTable(table);
                  const item = data.find(item => item[column] === value);

                  if (!item) {
                    return { data: null, error: { message: 'Item not found' } };
                  }

                  return { data: item, error: null };
                } catch (error) {
                  return { data: null, error };
                }
              },

              // Return all matching items
              execute: () => {
                try {
                  const data = readTable(table);
                  const items = data.filter(item => item[column] === value);

                  return { data: items, error: null };
                } catch (error) {
                  return { data: null, error };
                }
              }
            };
          },

          // Return all items
          execute: () => {
            try {
              const data = readTable(table);
              return { data, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      },

      insert: (item) => {
        try {
          const data = readTable(table);
          data.push(item);
          writeTable(table, data);

          return {
            data: item,
            error: null,
            select: () => {
              return {
                data: item,
                error: null,
                single: () => {
                  return { data: item, error: null };
                }
              };
            }
          };
        } catch (error) {
          return {
            data: null,
            error,
            select: () => {
              return {
                data: null,
                error,
                single: () => {
                  return { data: null, error };
                }
              };
            }
          };
        }
      },

      upsert: (item, options) => {
        try {
          const data = readTable(table);

          // Check if item exists
          const index = data.findIndex(i => {
            if (options && options.onConflict) {
              const [col1, col2] = options.onConflict.split(', ');
              return i[col1] === item[col1] && i[col2] === item[col2];
            }

            return i.id === item.id;
          });

          if (index !== -1) {
            // Update existing item
            data[index] = { ...data[index], ...item };
          } else {
            // Insert new item
            data.push(item);
          }

          writeTable(table, data);

          return {
            data: item,
            error: null,
            select: () => {
              return {
                data: item,
                error: null,
                single: () => {
                  return { data: item, error: null };
                }
              };
            }
          };
        } catch (error) {
          return {
            data: null,
            error,
            select: () => {
              return {
                data: null,
                error,
                single: () => {
                  return { data: null, error };
                }
              };
            }
          };
        }
      },

      update: (item) => {
        return {
          eq: (column, value) => {
            try {
              const data = readTable(table);

              // Find item
              const index = data.findIndex(i => i[column] === value);

              if (index === -1) {
                return { data: null, error: { message: 'Item not found' } };
              }

              // Update item
              data[index] = { ...data[index], ...item };
              writeTable(table, data);

              return { data: data[index], error: null };
            } catch (error) {
              return { data: null, error };
            }
          },

          // Return updated item
          single: () => {
            try {
              const data = readTable(table);

              // Find item
              const index = data.findIndex(i => i.id === item.id);

              if (index === -1) {
                return { data: null, error: { message: 'Item not found' } };
              }

              // Update item
              data[index] = { ...data[index], ...item };
              writeTable(table, data);

              return { data: data[index], error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      },

      delete: () => {
        return {
          eq: (column, value) => {
            try {
              const data = readTable(table);

              // Filter out item
              const newData = data.filter(item => item[column] !== value);
              writeTable(table, newData);

              return { data: null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      }
    };
  },

  rpc: (functionName, params) => {
    // Mock RPC functions
    if (functionName === 'increment_api_key_usage') {
      try {
        const { p_tenant_id, p_provider, p_count } = params;

        // Get API key usage
        const data = readTable('api_key_usage');

        // Find usage record
        const today = new Date().toISOString().split('T')[0];
        const index = data.findIndex(item =>
          item.tenant_id === p_tenant_id &&
          item.provider === p_provider &&
          item.usage_date === today
        );

        if (index !== -1) {
          // Update existing record
          data[index].call_count += p_count;
          data[index].updated_at = new Date().toISOString();
        } else {
          // Create new record
          data.push({
            id: crypto.randomUUID(),
            tenant_id: p_tenant_id,
            provider: p_provider,
            usage_date: today,
            call_count: p_count,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        writeTable('api_key_usage', data);

        return { data: null, error: null };
      } catch (error) {
        return { data: null, error };
      }
    } else if (functionName === 'has_exceeded_api_call_limit') {
      try {
        const { p_tenant_id, p_provider } = params;

        // Get API key usage
        const usageData = readTable('api_key_usage');

        // Get tenant
        const tenantsData = readTable('tenants');
        const tenant = tenantsData.find(item => item.id === p_tenant_id);

        if (!tenant) {
          return { data: false, error: null };
        }

        // Calculate usage
        const today = new Date().toISOString().split('T')[0];
        const usage = usageData
          .filter(item =>
            item.tenant_id === p_tenant_id &&
            item.provider === p_provider &&
            item.usage_date === today
          )
          .reduce((total, item) => total + item.call_count, 0);

        // Check if usage exceeds limit
        const limit = tenant.max_api_calls || 1000;

        return { data: usage >= limit, error: null };
      } catch (error) {
        return { data: false, error };
      }
    } else if (functionName === 'exec_sql') {
      // Mock SQL execution
      return { data: null, error: null };
    }

    return { data: null, error: { message: `Function ${functionName} not implemented` } };
  }
};

module.exports = supabase;
