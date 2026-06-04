# Architecture — Backend

---

## Stack

**Supabase** — the entire backend.

| Layer | What it is | What it does |
|---|---|---|
| **Postgres** | Managed relational database | Stores all token data |
| **Supabase client** | JS/TS library used in the UI | Reads and writes data — feels like frontend code |
| **Edge Functions** | TypeScript functions on Supabase servers | Import adapter, any logic that shouldn't run in the browser |
| **Auth** | Built-in user + API key management | User accounts, repo API keys for the plugin |

No separate backend server. No Express, no Node process to run. Logic that needs to run server-side lives in Edge Functions — small, single-purpose, written in TypeScript.

---

## Data flow

```
Figma Plugin  →  POST /functions/import-figma  →  Edge Function  →  Postgres
                                                                          ↓
Tokenizer UI  ←──────────────── Supabase client ──────────────────  same tables
```

The plugin POSTs the DTCG payload it already builds. The Edge Function transforms it into rows and writes to Postgres. The UI reads from the same tables using the Supabase JS client — no separate API to write.

---

## Data states

Three states. The UI treats all three identically — it always reads from Supabase.

| State | What it is | Source field | When it goes away |
|---|---|---|---|
| **Mock** | Hardcoded in component files | — | When that screen is wired to Supabase |
| **Seed** | Manually inserted demo data | `seed` | When replaced by a real Figma import |
| **Real** | Imported from Figma via the plugin | `figma` | Never — this is the end state |

Seed data exists so the UI can be developed and demonstrated before the import pipeline is complete. It is real data in the database — just not from Figma.

---

## Database schema

### `organizations`
Top-level account. Billing and users live here.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `created_at` | timestamptz | |

---

### `repositories`
The release unit. Published as an npm package. Belongs to an organization.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `org_id` | uuid FK → organizations | |
| `name` | text | |
| `created_at` | timestamptz | |

---

### `collections`
Semantic grouping of tokens. Modes are defined here. Belongs to a repository.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `repo_id` | uuid FK → repositories | |
| `name` | text | |
| `source` | text | `figma` or `seed` |
| `figma_collection_id` | text | Figma's internal collection id — used for idempotent re-imports |
| `created_at` | timestamptz | |

---

### `modes`
A named value variant within a collection (e.g. Light, Dark, Brand A). All tokens in the collection have a value per mode.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `collection_id` | uuid FK → collections | |
| `name` | text | e.g. `Light`, `Dark`, `Mode 1` |
| `figma_mode_id` | text | Figma's internal mode id |

---

### `tokens`
The smallest unit. Has a name, DTCG type, and description. Belongs to a collection. Path encodes the group hierarchy.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `collection_id` | uuid FK → collections | |
| `name` | text | Leaf name only — e.g. `primary` |
| `path` | text[] | Full group path — e.g. `['color', 'brand']`. Name is not included. |
| `dtcg_type` | text | `color`, `dimension`, `duration`, `number`, etc. |
| `description` | text | nullable |
| `figma_variable_id` | text | Figma's variable id — key for idempotent re-imports. Null for seed data. |
| `source` | text | `figma` or `seed` |
| `created_at` | timestamptz | |

`path + name` together give the full token path. Groups are not a separate table — they are implicit in `path`. This keeps queries simple: "give me all tokens where path starts with `['color']`" is a single Postgres array query.

---

### `mode_values`
The token's value in a specific mode. One row per token per mode.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `token_id` | uuid FK → tokens | |
| `mode_id` | uuid FK → modes | |
| `value` | jsonb | Raw value. Colors stored as `{ hex, components, alpha, colorSpace }`. Aliases stored as `{ alias: true, target_token_id }`. |
| `unit` | text | nullable. For `dimension`: `px`, `rem`, `%`, `em`. For `duration`: `ms`, `s`. |

---

### `import_mappings`
Stores the user's enrichment decisions per collection — maps Figma's 4 types to DTCG types. Applied automatically on re-import so the user doesn't reconfigure every time.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `collection_id` | uuid FK → collections | |
| `figma_type` | text | `FLOAT`, `COLOR`, `STRING`, `BOOLEAN` |
| `dtcg_type` | text | e.g. `dimension`, `duration`, `number` |
| `unit` | text | nullable — only for `dimension` and `duration` |

One row per figma_type per collection. If a mapping exists for a type in this collection, the import adapter applies it automatically. If not, the token is imported with the base DTCG type and flagged for user review.

---

## Edge Functions

### `import-figma`
**Trigger:** POST from the Figma plugin  
**Input:** Array of `TokenFile` (the payload the plugin already builds — one file per collection + mode)  
**What it does:**
1. Authenticates the request via repo API key
2. Walks the DTCG JSON tree, flattens paths into `(path[], name)` pairs
3. Looks up stored `import_mappings` for this collection — applies enrichment
4. Upserts collections, modes, tokens, mode_values (match on `figma_variable_id` for tokens, `figma_collection_id` for collections)
5. Returns a diff: `{ added, updated, deleted }` counts

**Why an Edge Function and not client-side:** The import payload can be large. Transformation and upsert logic should not run in the browser. The API key should not be exposed to the plugin UI.

---

## Auth model

**User accounts** — Supabase Auth. Email + password to start.  
**Repo API keys** — one key per repository, generated in the Tokenizer UI, stored in Supabase. The plugin user pastes the key once. All plugin requests are authenticated with this key.

Row-level security (RLS) ensures users can only read and write their own organization's data.

---

## Milestone order

1. **Schema** — create tables in Supabase
2. **Seed data** — insert demo data manually (one org, one repo, one collection, a set of tokens with mode values)
3. **Wire the UI** — replace `MOCK_TOKENS` / `TREE_DATA` / `ALL_MODE1_VALUES` with Supabase queries
4. **Edge Function** — write and deploy `import-figma`
5. **Plugin push** — add `MSG.PUSH` to the plugin, POST to the Edge Function
6. **Enrichment UI** — surface unmapped tokens for user review after import
