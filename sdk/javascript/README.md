# JavaScript reference client

The client sends a model-produced `tool + arguments` proposal through a trusted transport. It adds an opaque request ID, applies a timeout, and performs basic result-envelope checks.

`createLoopbackHttpTransport` accepts only `localhost`, `127.0.0.1`, or `::1` over plain HTTP. Production adapters are intentionally outside this repository.
