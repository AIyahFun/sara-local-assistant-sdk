# Contributing

Thank you for helping make SARA more accessible.

## Safe contribution boundary

Use only synthetic data. Never post real names, measurements, medical notes, identifiers, screenshots, credentials, network configuration, device addresses, or operational logs.

Contributions must not add:

- Diagnosis, treatment, dosage, or autonomous triage behavior.
- Arbitrary URLs, paths, selectors, scripts, shell commands, or transport topics.
- Fleet administration or device-management operations.
- Automatic execution of model-proposed actions.
- Production integration code or production-derived fixtures.

## Development

```bash
npm ci
npm run check
```

Kotlin contract checks can be run from `sdk/kotlin` with its Gradle wrapper.

## Pull requests

Keep each pull request focused. Describe the user benefit, contract impact, tests, and safety implications. New tools require:

1. A bounded input and output schema with `additionalProperties: false`.
2. A documented effect and capability.
3. A deterministic simulator implementation.
4. Positive, ambiguous, and adversarial evaluation cases.
5. Contract, policy, and public-boundary tests.

We use the Developer Certificate of Origin. Add a sign-off to each commit:

```text
Signed-off-by: Your Name <your-email@example.com>
```

By contributing, you certify that you have the right to submit the work under the repository license.
