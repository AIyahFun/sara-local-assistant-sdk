import assert from 'node:assert/strict';
import test from 'node:test';

import { capabilitySnapshot, invokeTool } from '../simulator/mock-kiosk/policy.mjs';
import { loadContracts } from '../tools/contract-loader.mjs';

const contracts = loadContracts();
const validProposals = [
  { tool: 'system.get_context', arguments: {} },
  { tool: 'ui.open', arguments: { screen: 'measurements' } },
  { tool: 'vitals.get_latest', arguments: { kinds: ['spo2', 'heart_rate'] } },
  { tool: 'vitals.get_trend_summary', arguments: { kinds: ['heart_rate'], windowHours: 24 } },
  { tool: 'device.get_summary', arguments: {} },
  { tool: 'help.explain_screen', arguments: { screen: 'devices', locale: 'he-IL' } }
];

test('all published simulator tools return schema-valid results', () => {
  for (const proposal of validProposals) {
    const result = invokeTool(proposal, { requestId: `request-${proposal.tool}` });
    assert.equal(result.ok, true, proposal.tool);
    assert.equal(contracts.validateResult(result), true, proposal.tool);
    assert.equal(contracts.tools.get(proposal.tool).validateOutput(result.data), true, proposal.tool);
  }
});

test('unknown tools and extra arguments fail closed', () => {
  const unknown = invokeTool({ tool: 'unknown.action', arguments: {} });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.error.code, 'TOOL_UNAVAILABLE');

  const extra = invokeTool({
    tool: 'vitals.get_latest',
    arguments: { kinds: ['spo2'], actor: 'someone' }
  });
  assert.equal(extra.ok, false);
  assert.equal(extra.error.code, 'INVALID_ARGUMENT');
});

test('missing capabilities fail closed', () => {
  const result = invokeTool(
    { tool: 'device.get_summary', arguments: {} },
    { availableCapabilities: [] }
  );
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'TOOL_UNAVAILABLE');
});

test('capability snapshot is schema-valid and identifier-free', () => {
  const snapshot = capabilitySnapshot();
  assert.equal(contracts.validateCapability(snapshot), true);
  assert.ok(snapshot.available.includes('synthetic_measurements'));
});
