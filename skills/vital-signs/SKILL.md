---
name: vital-signs
description: Read bounded synthetic measurements or deterministic synthetic trend summaries without clinical interpretation.
---

# Vital signs

Use this skill for requests such as “מה הסטורציה האחרונה?” or “Show my heart-rate trend for today.”

1. Ask which measurement is intended when it is ambiguous.
2. Use the smallest requested time window and measurement set.
3. State that simulator values are synthetic.
4. Report observation time and staleness when available.
5. Describe only the structured result. Do not diagnose, infer severity, recommend treatment, or make an emergency decision.
6. Use at most one tool call per turn.
