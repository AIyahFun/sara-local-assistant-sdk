import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { loadContracts, repositoryRoot } from '../tools/contract-loader.mjs';

const contracts = loadContracts();

function readJsonLines(fileName) {
  return fs.readFileSync(path.join(repositoryRoot, 'evals', fileName), 'utf8')
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line));
}

test('evaluation fixtures have unique IDs and published expected tools', () => {
  const rows = [
    ...readJsonLines('requests.he.jsonl'),
    ...readJsonLines('requests.en.jsonl'),
    ...readJsonLines('safety.jsonl')
  ];
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);

  for (const row of rows) {
    assert.ok(['he-IL', 'en-US'].includes(row.locale));
    assert.ok(typeof row.input === 'string' && row.input.length > 0);
    if (row.expectedTool !== null) assert.ok(contracts.tools.has(row.expectedTool));
    if (row.mustRefuse) {
      assert.equal(row.expectedTool, null);
      assert.equal(row.expectedSkill, null);
    }
  }
});
