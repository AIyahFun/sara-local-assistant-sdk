import {
  createLoopbackHttpTransport,
  SaraAssistantClient
} from '../../sdk/javascript/src/index.js';

const client = new SaraAssistantClient({
  transport: createLoopbackHttpTransport()
});

const result = await client.invoke('vitals.get_latest', {
  kinds: ['spo2', 'heart_rate']
});

console.log(JSON.stringify(result, null, 2));
