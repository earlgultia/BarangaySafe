#!/usr/bin/env node
/**
 * Simple SPA server for local testing
 * Serves dist files, falls back to index.html for routes
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || '/';

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    pathname = '/';
  }

  // Remove trailing slash except for root
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const safePath = pathname.replace(/^\.\.(?:\/|$)/, '/');
  let filePath = path.join(DIST_DIR, safePath);

  // Check if it's a file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // Check if it's a directory with index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(indexPath));
      return;
    }
  }

  // SPA fallback: serve index.html for all other routes
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(indexPath));
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1><p>dist/index.html not found. Run npm run build first.</p>');
});

server.listen(PORT, () => {
  console.log(`🚀 SPA server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${DIST_DIR}`);
  console.log(`\n✅ Test routes:`);
  console.log(`   • http://localhost:${PORT}/ (Landing)`);
  console.log(`   • http://localhost:${PORT}/staff (Staff Dashboard - should show page, not 404)`);
  console.log(`   • http://localhost:${PORT}/resident (Resident Dashboard)`);
  console.log(`   • http://localhost:${PORT}/admin (Admin Dashboard)\n`);
  console.log(`Press Ctrl+C to stop\n`);
});
