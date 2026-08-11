import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { loadContracts, repositoryRoot } from '../tools/contract-loader.mjs';

const contracts = loadContracts();

test('every skill references only published tools and stays small', () => {
  const skillsRoot = path.join(repositoryRoot, 'skills');
  for (const directoryName of fs.readdirSync(skillsRoot)) {
    const skillRoot = path.join(skillsRoot, directoryName);
    const toolManifest = JSON.parse(fs.readFileSync(path.join(skillRoot, 'tools.json'), 'utf8'));
    const instructions = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');

    assert.equal(toolManifest.skill, directoryName);
    assert.ok(toolManifest.tools.length >= 1 && toolManifest.tools.length <= 6);
    assert.equal(new Set(toolManifest.tools).size, toolManifest.tools.length);
    assert.ok(instructions.length < 2500, `${directoryName} instructions are too large`);

    for (const toolName of toolManifest.tools) {
      assert.ok(contracts.tools.has(toolName), `${directoryName} references unknown tool ${toolName}`);
    }
  }
});
