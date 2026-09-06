# Project Agent Contract

<!-- brain:begin agents-contract -->
Use this file as a Brain-managed project context entrypoint for `ENVET`.

Read the linked context files before substantial work. Prefer the `brain` skill and `brain` CLI for project memory, retrieval, and durable context updates.

## Table Of Contents

- [Overview](./.brain/context/overview.md)
- [Architecture](./.brain/context/architecture.md)
- [Standards](./.brain/context/standards.md)
- [Workflows](./.brain/context/workflows.md)
- [Memory Policy](./.brain/context/memory-policy.md)
- [Current State](./.brain/context/current-state.md)
- [Policy](./.brain/policy.yaml)

## Required Workflow

1. If no validated session is active, run `brain prep --task "<task>"`.
2. If a session is already active, run `brain prep`.
3. Read this file and the linked context files still needed for the task.
4. Use `brain context compile --task "<task>"` only when you need the lower-level packet compiler directly.
5. Retrieve project memory with `brain find envet` or `brain search "envet <task>"` when the compiled packet is not enough.
6. Use `brain edit` for durable context updates to AGENTS.md, docs, or .brain notes.
7. Use `brain session run -- <command>` for required verification commands.
8. Finish with `brain session finish` so policy checks can enforce verification and surface promotion review when durable follow-through is still needed.
<!-- brain:end agents-contract -->

## Local Notes

Add repo-specific notes here. `brain context refresh` preserves content outside managed blocks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
