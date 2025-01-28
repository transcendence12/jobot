import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { findOffers } from './scripts/findOffers';
import { Cache } from './utils/cache';

const PORT = process.env.PORT || 4200;
const cache = Cache.getInstance();

const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL and query parameters
  const urlParts = req.url?.split('?') || [];
  const path = urlParts[0];
  const queryParams = new URLSearchParams(urlParts[1] || '');

  // Handle /offers/:search_value endpoint
  if (req.method === 'GET' && path.startsWith('/offers/')) {
    console.log('Received request for offers');
    try {
      const searchValue = path.split('/offers/')[1];
      const limit = parseInt(queryParams.get('limit') || '10');

      if (!searchValue) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error',
          error: 'Search value is required' 
        }));
        return;
      }

      // Create cache key
      const cacheKey = `offers:${searchValue}:${limit}`;
      
      // Try to get data from cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('Cache hit! Returning cached data from:', cacheKey);
        console.log('Cache timestamp:', new Date(cache.getTimestamp(cacheKey)).toLocaleString());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          data: cachedData,
          meta: {
            total: cachedData.length,
            search: searchValue,
            limit,
            cached: true
          }
        }));
        return;
      } else {
        console.log('Cache miss! Fetching fresh data for:', cacheKey);
      }

      console.log(`Starting search for: ${searchValue} with limit: ${limit}`);
      const jobs = await findOffers(decodeURIComponent(searchValue), limit);
      
      if (!jobs || jobs.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error',
          error: 'No jobs found' 
        }));
        return;
      }

      // Store in cache
      cache.set(cacheKey, jobs);

      const response = { 
        status: 'success',
        data: jobs,
        meta: {
          total: jobs.length,
          search: searchValue,
          limit,
          cached: false
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error during request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error',
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'error',
      error: 'Not found' 
    }));
  }
});

// Error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  cache.clear();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  cache.clear();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});