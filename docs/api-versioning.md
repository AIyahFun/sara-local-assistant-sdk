# API versioning

## Version layers

- Repository releases use semantic versioning.
- Each tool definition has its own semantic `version`.
- The catalog has a `schemaVersion` and a catalog `version`.
- Result metadata reports the exact tool version that executed.

## Compatibility

Before `1.0.0`, contracts are experimental. After `1.0.0`:

- Adding an optional field is backward compatible.
- Adding a new enum member requires consumers to handle unknown values safely.
- Removing or renaming a field, tool, or enum member is breaking.
- Tightening an accepted input range is breaking unless the old range was explicitly invalid.
- A tool implementation must never silently change effect or confirmation requirements.

Clients discover the catalog and invoke only tools whose required capabilities are currently present. An unavailable tool returns `TOOL_UNAVAILABLE`; it must not return a fabricated empty success.

## Stable result status

The result envelope uses these statuses:

- `succeeded`
- `failed`
- `cancelled`
- `timed_out`

Stable error codes are:

- `INVALID_ARGUMENT`
- `TOOL_UNAVAILABLE`
- `NOT_AUTHORIZED`
- `CONFIRMATION_REQUIRED`
- `NOT_IMPLEMENTED`
- `CONFLICT`
- `TIMEOUT`
- `OFFLINE`
- `STALE_DATA`
- `EXECUTION_FAILED`

Errors must not include stack traces, internal paths, transport details, or identifiers.
