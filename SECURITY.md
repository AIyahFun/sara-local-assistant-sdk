# Security policy

## Reporting

Do not open a public issue for a suspected vulnerability, accidental sensitive-data exposure, or unsafe medical behavior. Use GitHub private vulnerability reporting for this repository. If that channel is unavailable, contact the repository owner privately through their GitHub profile before sharing details.

## Never include

- Real or plausibly real patient information.
- Authentication secrets, API keys, certificates, or signing material.
- Production endpoints, device identifiers, account identifiers, or operational logs.
- Production administration commands or unrestricted native/browser bridges.
- Model weights without an explicit license and provenance review.

## Supported versions

Until `1.0.0`, only the latest commit on the default branch receives security fixes.

## Design posture

The model is an untrusted proposer. The host validates schemas, capability, effect, deadlines, and results. Tool annotations and prompt instructions are not authorization. The simulator binds to loopback and contains synthetic fixtures only.
