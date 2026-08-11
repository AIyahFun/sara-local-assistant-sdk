# Model runtime interface

The public contracts do not require a particular model or inference engine.

An adapter implements a small `LocalModelEngine` responsibility:

1. Load and unload a licensed model package.
2. Route a request to one skill from a fixed enum.
3. Produce a schema-constrained tool proposal.
4. Return control to the trusted host before any tool executes.
5. Accept a validated tool result and generate a bounded plain-text answer.
6. Support cancellation and release resources under memory or thermal pressure.

## Required behavior

- Automatic tool execution is off.
- Parallel tool calls are off in the initial implementation.
- A generation is cancelled when a new user request starts.
- Invalid structured output is treated as model failure, not repaired into an action.
- The adapter reports readiness and performance metadata without conversation content.

## Benchmark dimensions

- Cold model-load time without blocking the user interface.
- Warm time to first token and tokens per second.
- Peak and steady-state memory.
- Thermal behavior over repeated turns.
- Dashboard, connectivity, and measurement stability while inference runs.
- Hebrew and English skill routing, tool selection, argument accuracy, clarification rate, and unsafe-call rate.

Model packages are distributed separately from this repository. Every model requires a documented source, license, hash, compatibility range, and rollback path.
