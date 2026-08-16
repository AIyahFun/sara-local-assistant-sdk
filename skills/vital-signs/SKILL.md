---
name: vital-signs
description: Read bounded synthetic measurements and support reproducible clinical-reasoning research on synthetic cases.
---

# Vital signs

Use this skill for requests such as “מה הסטורציה האחרונה?” or “Show my heart-rate trend for today.”

1. Ask which measurement is intended when it is ambiguous.
2. Use the smallest requested time window and measurement set.
3. State that simulator values are synthetic.
4. Report observation time and staleness when available.
5. Separate observations, hypotheses, and proposed actions. Include evidence, alternatives, uncertainty, and the synthetic ground truth when available.
6. For diagnostic, treatment, dosage, triage, or emergency research, return structured output that can be scored by the evaluation harness.
7. Use at most one tool call per turn.
