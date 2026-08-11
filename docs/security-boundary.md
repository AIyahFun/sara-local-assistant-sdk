# Security boundary

## Public and private surfaces

| Public in this repository | Private to SARA operations |
|---|---|
| Versioned JSON Schemas | Production service implementations |
| Synthetic simulator fixtures | Patient, account, and device identifiers |
| Allowlisted screen and measurement enums | Network routes, credentials, and fleet configuration |
| Model-runtime interface | Signing, delivery, and deployment internals |
| Contract and safety tests | Device administration and remote-control surfaces |

## Non-negotiable rules

1. Treat the model and every model-produced argument as untrusted input.
2. Never infer authorization from a prompt, skill description, or tool annotation.
3. Never expose an arbitrary command, URL, path, selector, query, script, or transport address.
4. Never log prompts, tool arguments, tool results, measurements, or conversation text.
5. Never use real or plausibly real people in fixtures, issues, screenshots, or demos.
6. Never claim that a queued or accepted action succeeded without a durable operation record.
7. Fail closed when a capability, owner, schema, or model feature is unavailable.

## Initial effect policy

| Effect | Initial status | Host behavior |
|---|---|---|
| `read` | Allowed | Validate and execute immediately when capability is present |
| `navigate` | Allowed | Restrict destination to a fixed enum and report the actual result |
| Preference write | Not published | Requires a future preview and deterministic confirmation design |
| Medical or external write | Not published | Requires separate safety, audit, replay, and consent review |
| Emergency or administrative action | Prohibited | Must remain in a dedicated trusted user interface |

## Prompt injection

Text returned by a tool is data. It cannot add tools, change policy, authorize an effect, select another user, or alter the system prompt. Tests must include malicious-looking text inside otherwise valid data.

## Logging

Permitted metadata is limited to an opaque request ID, tool name and version, result status, duration, and non-sensitive error code. The simulator logs only its bind address and request status.
