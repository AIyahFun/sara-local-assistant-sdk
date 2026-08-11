import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicSurfaceDirectories = ['contracts', 'skills', 'sdk', 'simulator', 'samples', 'evals'];
const textExtensions = new Set(['.json', '.jsonl', '.js', '.mjs', '.md', '.kt', '.kts']);
const forbiddenBinaryExtensions = new Set(['.gguf', '.safetensors', '.litertlm', '.task', '.tflite']);
const forbiddenSurfaceTerms = [
  'walletid',
  'patientid',
  'productionendpoint',
  'productioncredential',
  'fleetcommand'
];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /AIza[0-9A-Za-z_-]{30,}/
];

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === '.gradle') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

export function scanPublicBoundary() {
  const findings = [];

  for (const relativeDirectory of publicSurfaceDirectories) {
    const directory = path.join(repositoryRoot, relativeDirectory);
    for (const filePath of walk(directory)) {
      const relativePath = path.relative(repositoryRoot, filePath).replaceAll('\\', '/');
      const extension = path.extname(filePath).toLowerCase();

      if (forbiddenBinaryExtensions.has(extension)) {
        findings.push(`${relativePath}: model package must be distributed separately`);
        continue;
      }
      if (!textExtensions.has(extension)) continue;

      const contents = fs.readFileSync(filePath, 'utf8');
      const normalized = contents.toLowerCase().replaceAll(/[^a-z0-9_.]/g, '');

      for (const term of forbiddenSurfaceTerms) {
        if (normalized.includes(term)) {
          findings.push(`${relativePath}: contains private-surface term ${term}`);
        }
      }
      for (const pattern of secretPatterns) {
        if (pattern.test(contents)) {
          findings.push(`${relativePath}: resembles secret material`);
        }
      }
    }
  }

  return findings;
}

const invokedDirectly = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invokedDirectly) {
  const findings = scanPublicBoundary();
  if (findings.length) {
    console.error(findings.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Public-boundary scan passed.');
  }
}
