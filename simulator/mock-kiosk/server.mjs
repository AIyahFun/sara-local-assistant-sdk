import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { loadContracts } from '../../tools/contract-loader.mjs';
import { capabilitySnapshot, invokeTool } from './policy.mjs';

const host = '127.0.0.1';
const defaultPort = 4317;
const maxBodyBytes = 16 * 1024;
const contracts = loadContracts();

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  response.end(body);
}

async function readJsonBody(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBodyBytes) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createMockKioskServer() {
  return http.createServer(async (request, response) => {
    try {
      if (request.method === 'GET' && request.url === '/health') {
        sendJson(response, 200, { ok: true, synthetic: true });
        return;
      }
      if (request.method === 'GET' && request.url === '/v1/catalog') {
        sendJson(response, 200, contracts.catalog);
        return;
      }
      if (request.method === 'GET' && request.url === '/v1/capabilities') {
        sendJson(response, 200, capabilitySnapshot());
        return;
      }
      if (request.method === 'POST' && request.url === '/v1/invoke') {
        const proposal = await readJsonBody(request);
        const requestId = request.headers['x-sara-request-id'];
        const result = invokeTool(proposal, {
          requestId: typeof requestId === 'string' ? requestId.slice(0, 80) : undefined
        });
        sendJson(response, result.ok ? 200 : 400, result);
        return;
      }

      sendJson(response, 404, { ok: false, error: 'Not found' });
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === 'BODY_TOO_LARGE';
      sendJson(response, tooLarge ? 413 : 400, {
        ok: false,
        error: tooLarge ? 'Request body too large' : 'Invalid JSON request'
      });
    }
  });
}

const invokedDirectly = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invokedDirectly) {
  const requestedPort = Number.parseInt(process.env.SARA_SIMULATOR_PORT || `${defaultPort}`, 10);
  const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort <= 65535
    ? requestedPort
    : defaultPort;
  const server = createMockKioskServer();
  server.listen(port, host, () => {
    console.log(`Synthetic SARA kiosk simulator listening on http://${host}:${port}`);
  });
}
