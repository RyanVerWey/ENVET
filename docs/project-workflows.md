# Project Workflows

<!-- brain:begin project-doc-workflows -->
Use this file for agent operating workflow inside the repo.

## Startup

1. If no validated session is active, run `brain prep --task "<task>"`.
2. If a session already exists, run `brain prep`.
3. Read `AGENTS.md`, `.brain/policy.yaml`, and the linked context files still needed for the task.
4. Use `brain context compile --task "<task>"` only when you need the lower-level packet compiler directly.
5. If project memory still matters, run `brain find envet` or `brain search "envet <task>"`.

## During Work

- Keep durable discoveries, decisions, and risks in AGENTS.md, /docs, or .brain notes.
- Update existing durable notes instead of duplicating context.
- Run required verification commands through `brain session run -- <command>`.
- If you change Brain command behavior or agent-facing workflow guidance, update `skills/brain/SKILL.md` in the same branch.
- Re-read context before large changes if the task shifts.

## Ticket Loop

1. Start one task or ticket at a time and keep the scope narrow.
2. Implement the task, then run focused tests for the touched packages.
3. Run the required full checks through `brain session run -- go test ./...` and `brain session run -- go build ./...`.
4. Review the diff against the task goal and user-facing behavior.
5. If review finds issues, patch the work and repeat the test and review steps.
6. When the task is clean, commit it, push it, and only then move to the next task.

## Close-Out

- Refresh or update durable notes for meaningful behavior, config, or architecture changes.
- If `brain session finish` blocks, inspect the promotion suggestions first; run `brain distill --session --dry-run` only when you need the full review without creating a proposal note.
- Before switching away from a working branch or back to `develop`, run `git status --short` and resolve repo-owned leftovers. If `.brain/resources/changes/*`, `.brain/`, `docs/`, or contract files belong to the task, keep them in the same branch/PR; otherwise review and intentionally remove them instead of carrying them onto `develop`, `release/*`, or `main`.
- If `skills/brain/` changed, reinstall the local Brain skill for Codex and OpenClaw with `brain skills install --scope local --agent codex --agent openclaw --project .`.
- When opening a PR, make the title and body release-note friendly because GitHub release notes are generated from merged PR metadata.
- Summarize shipped behavior in the PR, not just implementation steps, so future changelogs stay human-readable.
- Finish with `brain session finish`.
- If you must bypass enforcement, use `brain session finish --force --reason "..."` so the override is recorded.
<!-- brain:end project-doc-workflows -->

## Local Notes

Add repo-specific notes here. `brain context refresh` preserves content outside managed blocks.
