import { randomUUID } from 'node:crypto';

import { loadContracts } from '../../tools/contract-loader.mjs';
import {
  explainScreen,
  latestMeasurements,
  syntheticDeviceSummary,
  trendSummaries
} from './fixtures.mjs';

const contracts = loadContracts();
const defaultCapabilities = new Set();
for (const { definition } of contracts.tools.values()) {
  for (const capability of definition.sara.capabilities) defaultCapabilities.add(capability);
}

const handlers = {
  'system.get_context': () => ({
    screen: 'home',
    locale: 'he-IL',
    offline: false,
    localAssistantReady: true
  }),
  'ui.open': ({ screen }) => ({ opened: true, screen }),
  'vitals.get_latest': ({ kinds }) => ({
    measurements: latestMeasurements(kinds),
    asOf: new Date().toISOString(),
    synthetic: true
  }),
  'vitals.get_trend_summary': ({ kinds, windowHours }) => ({
    summaries: trendSummaries(kinds, windowHours),
    asOf: new Date().toISOString(),
    synthetic: true,
    clinicalInterpretation: false
  }),
  'device.get_summary': () => structuredClone(syntheticDeviceSummary),
  'help.explain_screen': ({ screen, locale }) => ({
    screen,
    locale,
    explanation: explainScreen(screen, locale),
    synthetic: true
  })
};

function failure(toolVersion, requestId, code, message, startedAt) {
  return {
    ok: false,
    status: 'failed',
    error: { code, message },
    meta: {
      requestId,
      toolVersion,
      source: 'synthetic-fixture',
      durationMs: Date.now() - startedAt
    }
  };
}

export function invokeTool(proposal, options = {}) {
  const startedAt = Date.now();
  const requestId = typeof options.requestId === 'string' && /^[A-Za-z0-9._-]{8,80}$/.test(options.requestId)
    ? options.requestId
    : randomUUID();

  if (!contracts.validateProposal(proposal)) {
    return failure('0.0.0', requestId, 'INVALID_ARGUMENT', 'Proposal does not match the published schema.', startedAt);
  }

  const tool = contracts.tools.get(proposal.tool);
  if (!tool || !handlers[proposal.tool]) {
    return failure('0.0.0', requestId, 'TOOL_UNAVAILABLE', 'The requested tool is not available.', startedAt);
  }

  const availableCapabilities = options.availableCapabilities
    ? new Set(options.availableCapabilities)
    : defaultCapabilities;
  const capabilityPresent = tool.definition.sara.capabilities.every((name) => availableCapabilities.has(name));
  if (!capabilityPresent) {
    return failure(tool.definition.version, requestId, 'TOOL_UNAVAILABLE', 'A required capability is unavailable.', startedAt);
  }

  if (!tool.validateInput(proposal.arguments)) {
    return failure(tool.definition.version, requestId, 'INVALID_ARGUMENT', 'Arguments do not match the published schema.', startedAt);
  }

  try {
    const data = handlers[proposal.tool](proposal.arguments);
    if (!tool.validateOutput(data)) {
      return failure(tool.definition.version, requestId, 'EXECUTION_FAILED', 'The tool produced an invalid result.', startedAt);
    }
    if (Buffer.byteLength(JSON.stringify(data), 'utf8') > tool.definition.sara.maxResultBytes) {
      return failure(tool.definition.version, requestId, 'EXECUTION_FAILED', 'The tool result exceeded its published bound.', startedAt);
    }

    return {
      ok: true,
      status: 'succeeded',
      data,
      meta: {
        requestId,
        toolVersion: tool.definition.version,
        source: 'synthetic-fixture',
        durationMs: Date.now() - startedAt
      }
    };
  } catch {
    return failure(tool.definition.version, requestId, 'EXECUTION_FAILED', 'The tool could not complete.', startedAt);
  }
}

export function capabilitySnapshot() {
  const available = new Set();
  for (const { definition } of contracts.tools.values()) {
    for (const capability of definition.sara.capabilities) available.add(capability);
  }
  return {
    schemaVersion: '1.0.0',
    available: [...available].sort(),
    asOf: new Date().toISOString()
  };
}
