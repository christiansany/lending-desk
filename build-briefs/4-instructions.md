# Build brief 4 — the instructions

`.github/copilot-instructions.md` is the working agreement your predecessor left behind. Parts of
it are wrong, and the agent follows it anyway.

## Must (20 min)

- Go through it rule by rule. For each one: is it **true** in this repo? Check, don't assume.
- Delete or rewrite every rule you cannot verify. Short beats complete.
- Every rule that survives states an **outcome** and points at a **reference file** in this repo.

## Should

- Move the task-specific detail (how we build forms, how we handle errors) out of the always-on
  file into a rule or skill that loads only when it is relevant.
- Note which rules could be enforced by lint or a test instead of being written down.

## Stretch

- Hand `SPEC.md` to a fresh agent with no memory of this session and compare the result with
  your first run.

## Acceptance

The second run gets the form, the states and the logging right without you steering it. If it
does not, the rule was not specific enough yet.
