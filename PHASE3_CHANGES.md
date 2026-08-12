# Phase 3 — UI fixes and enterprise redesign

Six items: three defect fixes on the dashboard and canvas, three redesigns of
listing/wizard surfaces.

Commits: `9846c28` (items 1–3), `0ea25ec` (items 4–6).

---

## Design language

The three redesigned areas previously each had their own visual vocabulary —
one used blue, one used emerald, one used gradients and 2xl radii. They now
share one set of rules, chosen to read as enterprise tooling rather than a
colourful demo:

| Rule | Value |
| --- | --- |
| Palette | Slate carries everything. Indigo (`#4f46e5`) appears **only** on the primary action, focus rings, and active/sort indicators. |
| Status colour | Emerald / amber / red only where colour encodes state (indexed, processing, failed, online, offline). Never decorative. |
| Containers | `rounded-lg`, 1px `slate-200` border, no drop shadow. |
| Section headers | `text-[12px] font-semibold uppercase tracking-wider text-slate-500`. |
| Numeric data | `font-mono tabular-nums` so figures align down a column. |
| Format/ID tokens | Monospace slate chips, never tinted per type. |

The result is strictly different from what was there before, but it is built
from the tokens already in `src/utils/colors.js`, so it stays inside the
project theme.

---

## Item 1 — Hydration mismatch in the orbital visual

**Symptom:** React hydration error on the dashboard.

**Cause:** `satellitePosition()` fed raw `Math.cos`/`Math.sin` output into inline
`left`/`top` styles. Server and client agreed mathematically but differed in the
last ULP, so the serialised strings differed and React flagged a mismatch.

**Fix:** round to `.toFixed(3)` before it reaches the style object.

> **Standing rule:** any computed number that lands in an inline style of an
> SSR'd component must be rounded to a fixed precision first.

## Item 2 — Orbital visual centre card

Rings were near-invisible and the centre card held filler. The rings are now
dashed `slate-300`; the centre card is a metric block — *Active Executions*, a
"Live" pill, `1,284`, `+12.4%`, and an 8-bar sparkline.

The sparkline reads from a module-level `SPARKLINE = [38,52,44,68,58,76,64,88]`.
It is deliberately **not** `Math.random()` — random values would reintroduce
exactly the hydration class of bug fixed in item 1.

## Item 3 — Node border and clipped handles

**Cause:** `.react-flow__node` is the *positioning wrapper*, not the card. Global
CSS had given it padding, a border, a background, a shadow and a radius, so the
card's own border sat inside a second competing border, and `overflow-hidden`
clipped connection handles positioned at `-6px`.

**Fix:** neutralise the wrapper in `globals.css` (chrome zeroed,
`overflow: visible`), let the card own its `border-left: 3px solid accent.rail`,
drop `overflow-hidden`, and compensate the rail with `pl-3.5`.

> **Standing rule:** node chrome lives in `src/components/FlowNodes`, never in
> global CSS.

---

## Item 4 — `/knowledge`

Rebuilt `src/app/knowledge/page.jsx` and
`src/components/knowledge/KnowledgeListingTableView.jsx`.

- Two-column layout `lg:grid-cols-[minmax(0,1fr)_360px]` with a **sticky
  ingestion rail** on the right, so the upload queue stays visible while
  scrolling a long source list.
- Status is the only colour in the table: indexed (emerald), processing (amber,
  pulsing), failed (red).
- File-type tokens became uniform monospace slate chips instead of a different
  tint per extension.

**Anti-pattern removed.** The old page derived hex colours for a MUI `sx` prop
by string-matching Tailwind class names:

```js
typeStyle.bg.replace('bg-', '').includes('red') ? '#fef2f2' : ...
```

That couples styling to class-name spelling and breaks silently on any rename.
Replaced with a plain lookup object keyed by extension.

All existing wiring is preserved: selectors, thunks
(`fetchKnowledgeSources` / `uploadKnowledgeSource` / `deleteKnowledgeSource`),
the `{files, knowledge_base_names, content_types, chunk_words}` upload payload,
`isFormValid`, and the chunk-word input shown only for `pdf/docx/txt/md`.

## Item 5 — `/studio` table

`src/components/StudioListing/FlowListingTableView.jsx`:

- A `COLUMNS` constant drives a `<colgroup>` (34/34/18/14%) with
  `table-fixed min-w-[720px]` inside `overflow-x-auto`, so columns stop
  reflowing with content length.
- Tri-state sorting: `asc → desc → null`, where null restores the default
  `updatedAt desc`. Headers are real `<button>`s carrying `aria-sort`.
- Row actions are hidden until `group-hover/row` **or** `group-focus-within/row`
  — discoverable by mouse, reachable by keyboard.
- Field readers normalise the two shapes the API returns
  (`name|agent_name`, `description|agent_description`, `id|agent_id`).

## Item 6 — `/knowledge-graph`

All components, not just the page.

| File | Change |
| --- | --- |
| `helpers.js` | `NODE_COLORS` replaced with eight desaturated indigo-neighbour hues. The palette still encodes entity identity, so it is kept — but only rendered as a 3px rail or a small dot. |
| `ui.jsx` | Flattened `Button` variants (gradients and coloured shadows gone), slate/indigo focus rings, neutral `SectionBadge`, `rounded-md` message boxes, `outline-hidden` inputs. |
| `StepIndicator.jsx` | Rebuilt as a left-aligned three-cell segmented rail with hint text, `aria-current="step"`, and a check icon on completed steps. |
| `HealthBadge.jsx` | Fully tinted panel → neutral chip with a status dot. |
| `NodeCard.jsx` | Colour block → left border rail; primary-key chip uses a `KeyRound` icon instead of a 🔑 emoji. |
| `RelationshipCard.jsx` | Two saturated endpoint pills per row → neutral chips with accent dots, so a row reads `A -[REL]-> B`. |
| `Step1Upload.jsx` | Very tall empty dropzone → compact band, plus a supported-format reference list that now fits in the same viewport. Keyboard-operable (`role="button"`, Enter/Space). |
| `Step2Schema.jsx` | Header badges → neutral figure strip; solid colour section tiles → uppercase rules. |
| `Step3Confirm.jsx` | Celebration screen → report header, a figures table, and a labelled ingest log. |
| `GraphListing.jsx` | Fixed columns, `tabular-nums` counts, dashed empty state, hover/focus-revealed delete with an `aria-label`. |
| `page.jsx` | Header restructured with an icon tile and a rule; card padding reduced from `p-10`. |

Redux wiring (`knowledgeGraph` slice, `sessionStorage['cmdb_upload_id']` resume
flow) is untouched.

---

## Verification

- `node /tmp/check.js` parses cleanly on every file touched.
- `npx next lint` on both changed directories: **no warnings or errors**.
- `/`, `/studio`, `/knowledge`, `/knowledge-graph` all return **200** with no
  runtime errors in the dev log.

The Google Fonts warnings in the dev log are sandbox network limits, not a code
defect.

---

## Notes for follow-up

Not blocking, but worth a decision:

1. **`src/components/knowledge/FileSettingsModal.jsx` has zero importers.** It
   was deliberately left un-redesigned rather than restyling dead code. It
   should either be wired up or deleted.
2. Stale duplicates still in the tree: `StudioChatBot copy.jsx`,
   `dataModels copy.js`.
3. **Two Next configs**, `next.config.js` and `next.config.mjs` — only the
   `.mjs` defines `basePath: '/agent-studio'`. The `.js` is a trap for anyone
   who edits the wrong one.
4. The dictionary API client from Phase 2 has still never reached a live
   endpoint (host was TLS-unreachable from the sandbox). Confirm the
   `data.data.items` shape and the auth header against the real service.
