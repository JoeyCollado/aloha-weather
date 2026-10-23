# SHARED.md — Keep These Files Identical Across Both Repos

`aloha-weather-log` and `aloha-pos` are **two independent repos** that
share **one MongoDB database** (`aloha_rmr`) and **one Clerk instance**.

The following files MUST remain byte-identical in both repos. When you
change one, change the other in the same commit-pair and note the date
below.

## Files that must match

- `lib/models/*.ts`         (all 9 collection types + Zod schemas)
- `lib/db.ts`                (Mongo client singleton + ensureIndexes)
- `lib/auth.ts`              (Clerk owner guard helper)
- `.env.local.example`       (same variable names; values may differ)

## Files that intentionally differ

- `app/**`                   (different pages per app)
- `components/**`            (different UI per app)
- `package.json`             (different deps: pos adds Stripe)
- `middleware.ts`            (same Clerk logic; route matchers differ)
- `scripts/**`               (pos has seed/cleanup; weather has export)

## Sync log

| Date       | Changed file(s)        | Notes                          |
|------------|------------------------|--------------------------------|
| 2026-10-23 | initial scaffold       | Created from proposal docs     |

## Rule of thumb

If a change touches a MongoDB collection shape, a Zod schema, or the
Clerk owner check, it belongs in BOTH repos. If it touches a page, a
component, or a script, it belongs in ONE repo.