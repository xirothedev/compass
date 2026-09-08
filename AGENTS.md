# Compass — exam score rank lookup + school info/reviews + aspiration suggestions

## Agent skills

### Issue tracker

Issues live as GitHub issues (repo has no remote yet — see the note in the file). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `lookup` / `catalog` / `guidance`. See `docs/agents/domain.md`.

## Monorepo

Turborepo + pnpm workspaces. Tasks run in each package, root only delegates:

- `pnpm dev|build|lint|typecheck` → `turbo run <task>`
- `apps/web`: Next.js UI · `packages/db`: Supabase SQL + client · `packages/ui`: shared components · `data-pipeline`: Python crawl/normalize (outside pnpm)
