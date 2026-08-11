# Building an assistant skill

In this repository, a skill is a short user-facing workflow for the kiosk assistant. It is not a development-agent instruction package and it receives no production access.

## Layout

```text
skills/example/
  SKILL.md
  tools.json
```

`SKILL.md` contains triggering guidance, ambiguity rules, and user-facing safety language. `tools.json` contains only names from `contracts/catalog.json`.

## Rules

- Select three to six tools at most.
- Prefer one tool call per model turn.
- Ask one clarification when the target, screen, or measurement kind is ambiguous.
- Never guess a person, medication, measurement, or intended action.
- Keep computation, bounds, normalization, and policy in deterministic code.
- Do not duplicate schemas or enums in prose.
- Do not instruct the model to bypass validation or confirmation.
- Return plain text derived from the structured result; do not emit arbitrary HTML.

## Adding a tool

Adding a name to `tools.json` does not create a tool. A new tool also needs:

1. A definition under `contracts/tools/`.
2. Inclusion in `contracts/catalog.json`.
3. A deterministic simulator handler.
4. Contract and policy tests.
5. Hebrew and English evaluation fixtures.
6. A security review of every input and output field.

Run `npm run check` before opening a pull request.
