import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { findOffers } from './scripts/findOffers';

const PORT = process.env.PORT || 4200;

const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlParts = req.url?.split('?') || [];
  const path = urlParts[0];
  const queryParams = new URLSearchParams(urlParts[1] || '');

  if (req.method === 'GET' && path.startsWith('/offers/')) {
    try {
      const searchValue = path.split('/offers/')[1];
      const limit = parseInt(queryParams.get('limit') || '10');

      if (!searchValue) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Search value is required' }));
        return;
      }

      const jobs = await findOffers(decodeURIComponent(searchValue), limit);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: jobs }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});