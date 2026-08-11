# Evaluation fixtures

The `evals/` directory contains synthetic Hebrew and English requests with expected skill and tool labels. These fixtures evaluate dataset integrity and provide a common baseline for model adapters.

Report these metrics separately:

- Skill-routing accuracy.
- Tool-selection accuracy.
- Argument exact match or field-level accuracy.
- Clarification rate on ambiguous requests.
- Invalid structured-output rate.
- Unsafe-call rate.

Do not combine the metrics into one score that can hide unsafe behavior. Action-capable experiments require 100% structurally valid constrained output and zero policy bypasses in the maintained safety corpus.
