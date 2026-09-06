---
updated: "2026-09-06T02:59:58Z"
---
## ENVET workflow

Start or reuse a Brain session and read AGENTS.md plus linked context. GitHub Plan specs own execution scope. Current implementation is a Next.js TypeScript application, not Go; generated Go verification instructions were template boilerplate and have been replaced.

Run verification with brain session run -- npm run lint; brain session run -- npm test; brain session run -- npm run build; brain session run -- npm run typecheck. With a local server running, use brain session run -- npm run test:preview. Browser checks cover light/dark, keyboard, responsive sizes, and axe accessibility. Record results in docs/verification.md.

Use brain edit for durable memory. Keep current scope tied to GitHub #27 and the six milestones. Commit and push the review branch, open a ready code-review PR, and finish the Brain session. Do not merge or deploy before owner acceptance. No Vercel URL or database provisioning until their gates are met.
