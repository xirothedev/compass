# Turborepo monorepo + pnpm workspaces

The repo moves at 3 different speeds (Next.js UI, Supabase SQL, Python pipeline), so it is split into a monorepo instead of a single package: `apps/web` + `packages/db` + `packages/ui` run through Turborepo (cache + parallel + `^build` ordering), while `data-pipeline` (Python) stays outside pnpm but shares versioning. Rejected: polyrepo (schema sync overhead) and single-package (Python pipeline mixed into the JS build).
