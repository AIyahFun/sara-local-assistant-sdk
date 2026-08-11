import assert from 'node:assert/strict';
import test from 'node:test';

import { scanPublicBoundary } from '../tools/check-public-boundary.mjs';

test('public SDK surface contains no private integration terms or secret material', () => {
  assert.deepEqual(scanPublicBoundary(), []);
});
