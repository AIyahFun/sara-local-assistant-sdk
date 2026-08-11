import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { repositoryRoot } from '../tools/contract-loader.mjs';

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', '.gradle', 'build', 'node_modules'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

test('relative Markdown links resolve to repository files', () => {
  const markdownFiles = walk(repositoryRoot).filter((filePath) => filePath.endsWith('.md'));
  for (const filePath of markdownFiles) {
    const contents = fs.readFileSync(filePath, 'utf8');
    for (const match of contents.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1].trim().split(/[ #]/, 1)[0];
      if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
      const resolved = path.resolve(path.dirname(filePath), decodeURIComponent(target));
      assert.ok(fs.existsSync(resolved), `${path.relative(repositoryRoot, filePath)} links to missing ${target}`);
    }
  }
});

test('GitHub Actions dependencies are pinned to immutable commits', () => {
  const workflow = fs.readFileSync(path.join(repositoryRoot, '.github', 'workflows', 'ci.yml'), 'utf8');
  const uses = [...workflow.matchAll(/^\s*- uses:\s*([^\s#]+)/gm)].map((match) => match[1]);
  assert.ok(uses.length > 0);
  for (const reference of uses) {
    assert.match(reference, /@[0-9a-f]{40}$/);
  }
});
