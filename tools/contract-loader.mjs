import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractsRoot = path.join(repositoryRoot, 'contracts');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function formatErrors(validate) {
  return (validate.errors ?? [])
    .map((error) => `${error.instancePath || '/'} ${error.message}`)
    .join('; ');
}

export function loadContracts() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);

  const definitionSchema = readJson(path.join(contractsRoot, 'tool-definition.schema.json'));
  const proposalSchema = readJson(path.join(contractsRoot, 'tool-proposal.schema.json'));
  const resultSchema = readJson(path.join(contractsRoot, 'tool-result.schema.json'));
  const capabilitySchema = readJson(path.join(contractsRoot, 'capability.schema.json'));
  const catalog = readJson(path.join(contractsRoot, 'catalog.json'));

  const validateDefinition = ajv.compile(definitionSchema);
  const validateProposal = ajv.compile(proposalSchema);
  const validateResult = ajv.compile(resultSchema);
  const validateCapability = ajv.compile(capabilitySchema);
  const tools = new Map();

  for (const entry of catalog.tools) {
    if (tools.has(entry.name)) {
      throw new Error(`Duplicate tool in catalog: ${entry.name}`);
    }

    const definitionPath = path.resolve(contractsRoot, entry.definition);
    if (!definitionPath.startsWith(`${contractsRoot}${path.sep}`)) {
      throw new Error(`Tool definition escaped contracts directory: ${entry.definition}`);
    }

    const definition = readJson(definitionPath);
    if (!validateDefinition(definition)) {
      throw new Error(`Invalid tool definition ${entry.name}: ${formatErrors(validateDefinition)}`);
    }
    if (definition.name !== entry.name) {
      throw new Error(`Catalog name ${entry.name} does not match ${definition.name}`);
    }

    tools.set(entry.name, {
      definition,
      validateInput: ajv.compile(definition.inputSchema),
      validateOutput: ajv.compile(definition.outputSchema)
    });
  }

  return {
    catalog,
    tools,
    validateProposal,
    validateResult,
    validateCapability,
    formatErrors
  };
}

export { contractsRoot, repositoryRoot };
