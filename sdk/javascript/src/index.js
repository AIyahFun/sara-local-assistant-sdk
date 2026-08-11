export class SaraAssistantTransportError extends Error {
  constructor(message, code = 'EXECUTION_FAILED', options = {}) {
    super(message, options);
    this.name = 'SaraAssistantTransportError';
    this.code = code;
  }
}

function createRequestId() {
  if (!globalThis.crypto?.randomUUID) {
    throw new SaraAssistantTransportError('A secure request ID generator is unavailable.');
  }
  return globalThis.crypto.randomUUID();
}

function assertResultEnvelope(result) {
  if (!result || typeof result !== 'object' || typeof result.ok !== 'boolean') {
    throw new SaraAssistantTransportError('Transport returned an invalid result envelope.');
  }
  if (!result.meta || typeof result.meta.requestId !== 'string') {
    throw new SaraAssistantTransportError('Transport result is missing request metadata.');
  }
  return result;
}

export class SaraAssistantClient {
  constructor({ transport, timeoutMs = 3000 }) {
    if (typeof transport !== 'function') throw new TypeError('transport must be a function');
    if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 10000) {
      throw new RangeError('timeoutMs must be an integer between 100 and 10000');
    }
    this.transport = transport;
    this.timeoutMs = timeoutMs;
  }

  async invoke(tool, argumentsObject = {}) {
    if (typeof tool !== 'string' || !/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(tool)) {
      throw new TypeError('tool must be a published tool name');
    }
    if (!argumentsObject || typeof argumentsObject !== 'object' || Array.isArray(argumentsObject)) {
      throw new TypeError('arguments must be an object');
    }

    const requestId = createRequestId();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const result = await this.transport(
        { tool, arguments: structuredClone(argumentsObject) },
        { requestId, signal: controller.signal }
      );
      return assertResultEnvelope(result);
    } catch (error) {
      if (controller.signal.aborted) {
        throw new SaraAssistantTransportError('Tool transport timed out.', 'TIMEOUT', { cause: error });
      }
      if (error instanceof SaraAssistantTransportError) throw error;
      throw new SaraAssistantTransportError('Tool transport failed.', 'EXECUTION_FAILED', { cause: error });
    } finally {
      clearTimeout(timer);
    }
  }
}

export function createLoopbackHttpTransport(baseAddress = 'http://127.0.0.1:4317') {
  const parsed = new URL(baseAddress);
  const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (parsed.protocol !== 'http:' || !loopbackHosts.has(parsed.hostname)) {
    throw new SaraAssistantTransportError('The public simulator transport is loopback-only.');
  }

  const endpoint = new URL('/v1/invoke', parsed);
  return async (proposal, { requestId, signal }) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-sara-request-id': requestId
      },
      body: JSON.stringify(proposal),
      signal
    });
    const result = await response.json();
    return result;
  };
}
