import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createLoopbackHttpTransport,
  SaraAssistantClient,
  SaraAssistantTransportError
} from '../sdk/javascript/src/index.js';
import { createMockKioskServer } from '../simulator/mock-kiosk/server.mjs';

test('JavaScript client adds request metadata and preserves the proposal', async () => {
  let received;
  const client = new SaraAssistantClient({
    transport: async (proposal, context) => {
      received = { proposal, context };
      return {
        ok: true,
        status: 'succeeded',
        data: { synthetic: true },
        meta: {
          requestId: context.requestId,
          toolVersion: '1.0.0',
          source: 'test-transport',
          durationMs: 0
        }
      };
    }
  });

  const result = await client.invoke('system.get_context');
  assert.equal(result.ok, true);
  assert.deepEqual(received.proposal, { tool: 'system.get_context', arguments: {} });
  assert.equal(received.context.requestId.length, 36);
});

test('loopback transport rejects non-loopback destinations', () => {
  assert.throws(
    () => createLoopbackHttpTransport('https://example.invalid'),
    SaraAssistantTransportError
  );
});

test('loopback transport works with the synthetic simulator', async () => {
  const server = createMockKioskServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  try {
    const client = new SaraAssistantClient({
      transport: createLoopbackHttpTransport(`http://127.0.0.1:${address.port}`)
    });
    const result = await client.invoke('system.get_context');
    assert.equal(result.ok, true);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
