# Evaluation fixtures

The `evals/` directory contains synthetic Hebrew and English requests with expected skill and tool labels. These fixtures evaluate dataset integrity and provide a common baseline for model adapters.

Report these metrics separately:

- Skill-routing accuracy.
- Tool-selection accuracy.
- Argument exact match or field-level accuracy.
- Clarification rate on ambiguous requests.
- Invalid structured-output rate.
- Unsafe-call rate.
- Diagnostic sensitivity, specificity, and hypothesis-ranking quality when ground truth exists.
- Treatment and dosage agreement, absolute error, contraindication detection, and rationale quality.
- Triage agreement, escalation timing, and emergency-workflow completion.
- Calibration, abstention quality, subgroup performance, and uncertainty accuracy.

Do not combine the metrics into one score that can hide failure modes. Report false positives, false negatives, disagreements, and uncertainty separately. Sandbox experiments may measure imperfect systems; production release criteria are defined independently and must not be inferred from a research score.
