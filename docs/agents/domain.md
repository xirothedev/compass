# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. Context-specific decisions live next to their context (`docs/contexts/<name>/docs/adr/`).

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/
│   ├── adr/                          ← system-wide decisions
│   ├── agents/                       ← skill wiring (tracker, labels, this file)
│   └── contexts/
│       ├── lookup/CONTEXT.md         ← exam score rank lookup
│       ├── catalog/CONTEXT.md        ← schools / majors / cutoff scores
│       └── guidance/CONTEXT.md       ← onboarding / suggestions / reviews
├── apps/web/                         ← Next.js (lookup + catalog + guidance UI)
├── packages/db/supabase/             ← Postgres migrations + seeds (catalog + lookup read-models)
└── data-pipeline/                    ← Python crawl/normalize (lookup + catalog datasets)
```

Contexts are domain boundaries, not packages: `lookup` spans `data-pipeline` + `score_distribution` + `/lookup`; `catalog` spans `packages/db` + `/schools`, `/majors`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
