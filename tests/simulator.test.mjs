import assert from 'node:assert/strict';
import test from 'node:test';

import { createMockKioskServer } from '../simulator/mock-kiosk/server.mjs';

async function withServer(run) {
  const server = createMockKioskServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('simulator exposes health, catalog, capabilities, and invocation', async () => {
  await withServer(async (baseAddress) => {
    const health = await fetch(`${baseAddress}/health`).then((response) => response.json());
    assert.deepEqual(health, { ok: true, synthetic: true });

    const catalog = await fetch(`${baseAddress}/v1/catalog`).then((response) => response.json());
    assert.equal(catalog.tools.length, 6);

    const capabilities = await fetch(`${baseAddress}/v1/capabilities`).then((response) => response.json());
    assert.ok(capabilities.available.length > 0);

    const response = await fetch(`${baseAddress}/v1/invoke`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-sara-request-id': 'simulator-test-request'
      },
      body: JSON.stringify({ tool: 'device.get_summary', arguments: {} })
    });
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.ok, true);
    assert.equal(result.data.synthetic, true);
    assert.equal(result.meta.requestId, 'simulator-test-request');
  });
});

test('simulator rejects malformed and oversized requests', async () => {
  await withServer(async (baseAddress) => {
    const malformed = await fetch(`${baseAddress}/v1/invoke`, {
      method: 'POST',
      body: '{'
    });
    assert.equal(malformed.status, 400);

    const oversized = await fetch(`${baseAddress}/v1/invoke`, {
      method: 'POST',
      body: JSON.stringify({ value: 'x'.repeat(17000) })
    });
    assert.equal(oversized.status, 413);
  });
});
