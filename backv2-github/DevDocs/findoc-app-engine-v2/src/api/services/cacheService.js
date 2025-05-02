/**
 * Cache Service
 * 
 * This service provides a simple in-memory cache for API responses.
 */

// In-memory cache
const cache = new Map();

// Default TTL in milliseconds (5 minutes)
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Set cache item
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} [ttl=DEFAULT_TTL] - Time to live in milliseconds
 */
const set = (key, value, ttl = DEFAULT_TTL) => {
  const expiresAt = Date.now() + ttl;
  
  cache.set(key, {
    value,
    expiresAt
  });
  
  console.log(`Cache: Set item with key "${key}" (expires in ${ttl / 1000}s)`);
  
  // Schedule cleanup
  setTimeout(() => {
    if (cache.has(key) && cache.get(key).expiresAt <= Date.now()) {
      cache.delete(key);
      console.log(`Cache: Removed expired item with key "${key}"`);
    }
  }, ttl);
};

/**
 * Get cache item
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined if not found or expired
 */
const get = (key) => {
  if (!cache.has(key)) {
    console.log(`Cache: Miss for key "${key}"`);
    return undefined;
  }
  
  const item = cache.get(key);
  
  // Check if expired
  if (item.expiresAt <= Date.now()) {
    cache.delete(key);
    console.log(`Cache: Expired item with key "${key}"`);
    return undefined;
  }
  
  console.log(`Cache: Hit for key "${key}"`);
  return item.value;
};

/**
 * Delete cache item
 * @param {string} key - Cache key
 */
const del = (key) => {
  if (cache.has(key)) {
    cache.delete(key);
    console.log(`Cache: Deleted item with key "${key}"`);
  }
};

/**
 * Clear all cache items
 */
const clear = () => {
  cache.clear();
  console.log('Cache: Cleared all items');
};

/**
 * Get cache stats
 * @returns {object} Cache stats
 */
const getStats = () => {
  const now = Date.now();
  let activeItems = 0;
  let expiredItems = 0;
  
  cache.forEach(item => {
    if (item.expiresAt > now) {
      activeItems++;
    } else {
      expiredItems++;
    }
  });
  
  return {
    totalItems: cache.size,
    activeItems,
    expiredItems
  };
};

/**
 * Cleanup expired items
 */
const cleanup = () => {
  const now = Date.now();
  let removedCount = 0;
  
  cache.forEach((item, key) => {
    if (item.expiresAt <= now) {
      cache.delete(key);
      removedCount++;
    }
  });
  
  console.log(`Cache: Cleaned up ${removedCount} expired items`);
  return removedCount;
};

// Schedule periodic cleanup every 15 minutes
setInterval(cleanup, 15 * 60 * 1000);

module.exports = {
  set,
  get,
  del,
  clear,
  getStats,
  cleanup
};
