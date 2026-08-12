# Phase 4 — Defect fixes & UI adjustments

Six reported issues. Three were genuine logic bugs with non-obvious causes; three
were presentation rules that reverse or refine Phase-3 decisions.

---

## 1. `/knowledge` — staged file lost after cancel + re-select

**Symptom.** Upload one file, remove it, pick another → the file never appears
and the upload button never returns.

**Cause.** A live-object lifetime bug, not a state bug:

```js
setSelectedFiles(prev => [...prev, ...processFiles(e.target.files)]);
e.target.value = '';
```

`processFiles(e.target.files)` sits *inside* the functional updater, so it is
only evaluated when React flushes the update. `e.target.value = ''` runs first
and empties the `FileList` — which is a **live view** of the input, not a copy.
By the time the updater ran it mapped over an empty list, so zero files were
staged. `selectedFiles.length` stayed `0`, and the whole staged-file block
(including the submit button) is gated on that.

Reproduced in isolation with a `FileList` stub whose `value` setter clears
`files`: the deferred updater returned `[]`.

**Fix.** Snapshot synchronously, reset the input, then queue the update.
Same treatment for `handleDrop` (a `DataTransfer` is cleared once the drop
event finishes dispatching).

**Two adjacent bugs fixed at the same time:**

- `handleRemoveFile` did not clear the native input, so re-selecting the *same
  filename* after removing it fired no `change` event at all — the browser sees
  an unchanged `value`. This is the more likely path for the exact "cancel then
  select another" report if the user re-picked the same file.
- `isFormValid` used `.every()`, which is `true` for an empty array. It now
  requires at least one file, and the "needs a name" warning is gated on
  `selectedFiles.length > 0` so it cannot fire on an empty list.

**Layout rearrange.** Ingestion rail `360px → 400px`; the panel is now a flex
column capped at `calc(100vh-2.5rem)` and scrolls as a whole, replacing the
nested `max-h-[380px]` scroll area on the staged list (nested scrollbars were
the cramped feeling); staged count moved into the panel header; name and
chunk-word inputs sit side by side — but only when the chunk-word field is
actually rendered, otherwise the name input takes full width.

## 2. `/knowledge-graph` — 422 from validate never surfaced

**Cause.** Two independent faults stacked:

1. `readErr` only understood `{error}` / `{errors}`. The endpoint is FastAPI,
   which reports a 422 as `{detail: [{loc, msg, type}]}`. That shape matched
   nothing, so it collapsed to `'Mapping rejected by server'`.
2. `ErrorBox` and `WarnBox` were **imported into `Step2Schema` but never
   rendered**. Even the generic message had nowhere to appear — `setErrors`
   wrote to state nothing was reading.

**Fix.** New `readErrMessages(res)` in `helpers.js` flattens every observed
shape into `string[]`, preserving the `loc` path minus protocol noise, so a
validation failure now reads `entities.0.node_label: field required` instead of
a generic sentence. Verified against seven response shapes:

| Response | Output |
|---|---|
| `{detail:[{loc:['body','entities',0,'node_label'],msg:'field required'}]}` | `entities.0.node_label: field required` |
| `{detail:'Graph name already exists'}` | `Graph name already exists` |
| `{errors:['Duplicate label Customer', …]}` | both preserved |
| `{error:'Neo4j unavailable'}` | `Neo4j unavailable` |
| `{message:'bad request'}` | `bad request` |
| non-JSON body `Bad Gateway` | `Bad Gateway` |
| `{}` | `Request failed (HTTP 418)` |

`<ErrorBox>` / `<WarnBox>` are now mounted. Steps 1 and 3 had the same
swallowing (`body.error || 'Upload failed'`) and were migrated too, so the
server's own wording reaches the user on upload and commit as well. The 413
branch keeps its bespoke size message.

## 3. Ingested-graph list — Relationships always `0`

**Cause.** `normalizeGraphs` in `knowledgeGraphSlice.js` read only
`g.relationship_count`. The API returns `rel_count`. `Number(undefined)` is
`NaN`, the `Number.isFinite` guard caught it, and it normalised to `0` —
silently, with no warning anywhere.

**Fix.** A `firstNumber(...candidates)` helper returns the first argument that
parses as finite, so `relationship_count`, `rel_count`, `relationshipCount`,
`relCount`, `total_relationships`, `relationships_count` and `relationships`
are all accepted; `node_count` gets the same treatment. It short-circuits on a
genuine `0` rather than falling through to a later candidate, and accepts
numeric strings. `GraphListing` read the raw `g.rel_count` directly, bypassing
the normaliser — it now reads the normalised field, so there is one source of
truth.

## 4. Row actions always visible *(reverses a Phase-3 decision)*

Hover-reveal removed from all three tables — studio flows, knowledge sources,
graph datasets. Hover-only controls are undiscoverable and unreachable on
touch. Verified: zero `opacity-0 group-hover` in rendered markup. The one
remaining `opacity-0` in `ui.jsx` is the Collapsible height animation and is
unrelated.

## 5. No inner table scrollbar unless needed

Dropped the forced `min-w-[720px]` / `min-w-[680px]` / `min-w-[760px]`. All
three tables are `table-fixed` with percentage `colgroup` widths and `truncate`
cells, so columns now compress instead of overflowing. `overflow-x-auto` stays
as a genuine fallback. The knowledge table had no `colgroup` at all, so one was
added (38/12/12/16/14/8) — without it, `table-fixed` would have divided the
columns equally.

## 6. `/studio` — raw id replaced with description + version

The slate-gray `shortId()` line under each flow name is gone; `id` is retained
only as a React key and for the open/delete handlers. The description moved
into that slot (full text on hover, `No description` in italic grey when
absent), freeing its column for a new sortable **Version** column rendered as a
neutral mono `tabular-nums` chip. Widths rebalanced to 46/14/22/18.

Version sorting is semver-aware — a plain string compare puts `1.10.0` before
`1.9.0`. One trap worth noting: `Number('')` is `0`, not `NaN`, so blank
versions initially sorted to the *front* as `0.0.0`. Empty input is now rejected
before parsing. Verified ordering:

```
0.9 → 1.0.0 → 1.9.0 → 1.10.0 → v2.0.0 → (blank, null, "abc" last)
```

---

## Verification

All six items were asserted against **rendered markup**, not just source, using
a temporary probe route with mock data covering both the modern (`name`,
`description`, `version`) and legacy (`agent_name`, `agent_description`) flow
shapes plus a flow with no version at all. Confirmed: version column present,
descriptions rendered, **zero UUIDs in the markup**, zero hover-reveal classes,
zero forced min-widths, delete/open controls present unconditionally. The probe
was removed afterwards.

`/studio`, `/knowledge`, `/knowledge-graph` and `/dashboard` all return 200.

**One caveat:** `next build` cannot complete in this sandbox — `next/font`
fetches Geist from Google Fonts at build time and the network is blocked
(`ECONNRESET`). This is a pre-existing environmental limit, unrelated to these
changes, but it does mean a full production build has not been exercised. The
dev server (Turbopack) compiles every touched route cleanly. `eslint` reports
`no matching configuration` for `src/**` — the repo's lint config does not
cover these paths, so it provided no signal either way.

Items 2 and 3 are fixes to how the UI reads server responses; neither has been
run against the live CMDB API, so the shapes handled are those in the code plus
the standard FastAPI contract.

## Standing rules changed by this phase

- ~~Hover-reveal row actions~~ → **always visible**.
- Tables: no forced pixel `min-w`; percentage `colgroup` + `table-fixed` +
  `truncate`, with `overflow-x-auto` only as a fallback.
- Never render raw ids. Show description, version or another meaningful field.
- Never let a server error collapse into a generic string — use
  `readErrMessages` and mount an error surface that actually renders it.
