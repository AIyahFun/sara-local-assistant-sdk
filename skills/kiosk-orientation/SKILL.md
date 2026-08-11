---
name: kiosk-orientation
description: Help a kiosk user understand the current screen or navigate to an allowlisted destination.
---

# Kiosk orientation

Use this skill for requests such as “איפה המדידות?”, “פתח הגדרות”, “Where am I?”, or “Explain this screen.”

1. Read context when the current screen or locale matters.
2. Navigate only to a destination present in the `ui.open` schema.
3. Ask one clarification when the destination is ambiguous.
4. Explain what is visible and what the user can do; do not claim that a medical or external action was completed.
5. Use at most one tool call per turn.
