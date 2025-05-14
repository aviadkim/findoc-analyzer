/**
 * Mock Storage Service
 * 
 * A mock implementation of storage services for demo purposes.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// In-memory database
const db = {
  documents: [],
  chat_history: []
};

/**
 * Mock Supabase service
 */
const mockSupabase = {
  from: (table) => {
    return {
      select: (columns) => {
        return {
          eq: (field, value) => {
            return {
              eq: (field2, value2) => {
                return {
                  single: () => {
                    const items = db[table].filter(item => 
                      item[field] === value && item[field2] === value2
                    );
                    return Promise.resolve({
                      data: items.length > 0 ? items[0] : null,
                      error: items.length > 0 ? null : { message: 'No matching record found' }
                    });
                  },
                  order: (orderField, { ascending }) => {
                    const items = db[table].filter(item => 
                      item[field] === value && item[field2] === value2
                    );
                    const sortedItems = [...items].sort((a, b) => {
                      if (ascending) {
                        return a[orderField] > b[orderField] ? 1 : -1;
                      } else {
                        return a[orderField] < b[orderField] ? 1 : -1;
                      }
                    });
                    return Promise.resolve({
                      data: sortedItems,
                      error: null
                    });
                  }
                };
              },
              single: () => {
                const items = db[table].filter(item => item[field] === value);
                return Promise.resolve({
                  data: items.length > 0 ? items[0] : null,
                  error: items.length > 0 ? null : { message: 'No matching record found' }
                });
              }
            };
          },
          single: () => {
            return Promise.resolve({
              data: db[table].length > 0 ? db[table][0] : null,
              error: db[table].length > 0 ? null : { message: 'No records found' }
            });
          }
        };
      },
      insert: (item) => {
        return {
          select: () => {
            return {
              single: () => {
                db[table].push(item);
                return Promise.resolve({
                  data: item,
                  error: null
                });
              }
            };
          }
        };
      },
      update: (updates) => {
        return {
          eq: (field, value) => {
            return {
              eq: (field2, value2) => {
                return {
                  select: () => {
                    return {
                      single: () => {
                        const index = db[table].findIndex(item => 
                          item[field] === value && item[field2] === value2
                        );
                        if (index !== -1) {
                          db[table][index] = { ...db[table][index], ...updates };
                          return Promise.resolve({
                            data: db[table][index],
                            error: null
                          });
                        }
                        return Promise.resolve({
                          data: null,
                          error: { message: 'No matching record found' }
                        });
                      }
                    };
                  }
                };
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (field, value) => {
            return {
              eq: (field2, value2) => {
                const index = db[table].findIndex(item => 
                  item[field] === value && item[field2] === value2
                );
                if (index !== -1) {
                  db[table].splice(index, 1);
                  return Promise.resolve({
                    data: {},
                    error: null
                  });
                }
                return Promise.resolve({
                  data: null,
                  error: { message: 'No matching record found' }
                });
              }
            };
          }
        };
      }
    };
  },
  storage: {
    from: (bucket) => {
      return {
        upload: (storagePath, fileBuffer, options) => {
          try {
            // Create directories if they don't exist
            const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
            const fullPath = path.join(uploadDir, storagePath);
            const dirPath = path.dirname(fullPath);
            
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            // Write file
            fs.writeFileSync(fullPath, fileBuffer);
            
            return Promise.resolve({
              data: { path: storagePath },
              error: null
            });
          } catch (error) {
            return Promise.resolve({
              data: null,
              error: { message: error.message }
            });
          }
        },
        getPublicUrl: (storagePath) => {
          return Promise.resolve({
            data: { publicUrl: `/uploads/${storagePath}` },
            error: null
          });
        },
        download: (storagePath) => {
          try {
            const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
            const fullPath = path.join(uploadDir, storagePath);
            
            if (!fs.existsSync(fullPath)) {
              return Promise.resolve({
                data: null,
                error: { message: 'File not found' }
              });
            }
            
            const fileData = fs.readFileSync(fullPath);
            
            // Create an object with an arrayBuffer method to mimic the Fetch API Response
            const response = {
              arrayBuffer: () => Promise.resolve(fileData.buffer)
            };
            
            return Promise.resolve({
              data: response,
              error: null
            });
          } catch (error) {
            return Promise.resolve({
              data: null,
              error: { message: error.message }
            });
          }
        },
        remove: (paths) => {
          try {
            const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
            
            for (const storagePath of paths) {
              const fullPath = path.join(uploadDir, storagePath);
              
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            }
            
            return Promise.resolve({
              data: { deleted: paths },
              error: null
            });
          } catch (error) {
            return Promise.resolve({
              data: null,
              error: { message: error.message }
            });
          }
        }
      };
    }
  }
};

module.exports = {
  supabase: mockSupabase
};
