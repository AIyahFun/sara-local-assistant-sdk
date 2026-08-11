import assert from 'node:assert/strict';
import test from 'node:test';

import { loadContracts } from '../tools/contract-loader.mjs';

const contracts = loadContracts();

test('catalog contains six unique validated tools', () => {
  assert.equal(contracts.tools.size, 6);
  assert.equal(new Set(contracts.catalog.tools.map((entry) => entry.name)).size, 6);
});

test('every published tool is bounded and fail-closed', () => {
  const forbiddenArguments = new Set([
    'actor',
    'command',
    'identity',
    'javascript',
    'path',
    'query',
    'role',
    'selector',
    'sql',
    'topic',
    'url'
  ]);

  for (const [name, { definition }] of contracts.tools) {
    assert.equal(definition.inputSchema.additionalProperties, false, `${name} input must reject extra fields`);
    assert.equal(definition.outputSchema.additionalProperties, false, `${name} output must reject extra fields`);
    assert.ok(['read', 'navigate'].includes(definition.sara.effect));
    assert.equal(definition.sara.confirmation, 'none');
    assert.ok(definition.sara.maxResultBytes <= 16384);

    for (const argumentName of Object.keys(definition.inputSchema.properties)) {
      assert.equal(forbiddenArguments.has(argumentName.toLowerCase()), false, `${name} exposes ${argumentName}`);
    }
  }
});

test('proposal and result envelope validators reject extra trust fields', () => {
  assert.equal(contracts.validateProposal({ tool: 'system.get_context', arguments: {} }), true);
  assert.equal(
    contracts.validateProposal({ tool: 'system.get_context', arguments: {}, role: 'operator' }),
    false
  );
});
