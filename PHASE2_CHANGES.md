# Phase 2 — Implementation Report

All 8 requested items are implemented, the production build is clean
(`next build` → ✓ Compiled successfully, 13/13 static pages, no new warnings),
and every route serves 200 in dev.

Everything is JSX. No TypeScript, no React Flow Pro code, no new dependencies,
still on `reactflow` v11.

---

## 1. API layer hardening

**Files:** `src/utils/APIKit.js` (verified), `src/redux/slices/studioSlice.js`,
`src/utils/commonFunction.js`

- `APIKit` rejects a consistent `{ message, status, data }` envelope, so every
  `.catch()` in the app reads the same shape.
- `401` clears the stored token and hard-redirects to `/login`.
- `baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'`. No `.env*` file exists in
  the repo, so `/api` falls through the `next.config` rewrite to
  `http://223.30.168.13/ai/api/agent-studio`.
- Thunks in `studioSlice` now use `rejectWithValue` consistently and guard against
  non-array payloads before `.map()`.

---

## 2. Unsaved-changes guard in the Studio

**Files:** `src/utils/flowFingerprint.js` *(new)*, `src/app/studio/[id]/page.jsx`,
`src/components/studio/StudioHeader.jsx`, `src/components/Common/ConfirmDialog.jsx` *(new)*

`fingerprintCanvas(nodes, edges)` produces a stable string from the canvas,
deliberately ignoring `selected`, `dragging` and measured node sizes — those flip
constantly during interaction and would otherwise report a clean flow as dirty.

- `savedFingerprintRef.current === null` means "flow not loaded yet" and suppresses
  dirty derivation, so opening a flow never immediately shows unsaved changes.
- `beforeunload` covers tab close / reload.
- `requestNavigation(navigate)` is the **single funnel** for every in-app exit from
  the studio (back button, breadcrumb, sidenav). `pendingNavigation !== null` drives
  the dialog.
- `handleSaveFlow(options)` returns a boolean (`false` = validation blocked) and
  fires `options.onSaved` after a successful `updateFlow`, which is how
  "Save & Leave" chains into the queued navigation.
- The header shows a dirty chip and an enabled/disabled save button driven by
  `isDirty`.

> Note: `generateSpecification` does **not** persist node positions, so the
> fingerprint is canvas-only by design — moving a node marks the flow dirty in the
> UI even though the position is not part of the saved spec. This is intentional
> and matches user expectation.

---

## 3. "Objects are not valid as a React child" — diagnosed and fixed

**Files:** `src/components/studio/nodeDocsData.js`,
`src/components/studio/NodeDetailsModal.jsx`

**Root cause.** `getNodeDocs()` has a generic fallback that builds docs from the
node's own parameters. It copied `p.value` straight into the `example` and
`exampleConfig` fields. For object- and array-typed parameters that value is an
object, and the docs tab renders it with a bare `{p.example}` — React throws.

**Fix.**
- Added `toDisplayString(value)` — objects/arrays are `JSON.stringify`'d with
  indentation, primitives are stringified, `null`/`undefined` become `""`.
- Added `normalizeDocs(docs)` which runs every renderable docs field through it,
  so the *entire* docs object is guaranteed string-safe regardless of source.
- Lookup order is unchanged:
  `node.data.docs || node.docs` → `DEFAULT_NODE_DOCS[nameKey]` → `[typeKey]` → fallback.
- The example block in the modal (Tab 2) got `whitespace-pre-wrap break-words
  max-h-32 overflow-auto` so a long stringified payload scrolls instead of blowing
  out the modal.

---

## 4. Responsive text input

**Files:** `src/components/Common/InputBox.jsx`,
`src/components/Common/ExpandableTextInput.jsx` *(new)*,
`src/components/studio/parameters/{String,Object,Array,Code}Parameter.jsx`

### `InputBox`
`multiline` / `rows` / `minRows` / `maxRows` were being spread onto the wrapper
`Box` instead of reaching `InputBase`, so multiline never worked. They are now
explicit, forwarded props. In multiline mode the wrapper swaps its fixed
`height: 38px` for `minHeight` and switches to `items-start py-2`; `type` is
suppressed and the textarea gets `lineHeight: 1.55`.

**Single-line behaviour is byte-for-byte unchanged** (`height='38px'`,
`onChange(event.target.value)`), so nothing else in the app shifts.

### `ExpandableTextInput` (new)
An auto-growing textarea with a utility bar: full-screen pop-out, soft-wrap toggle,
copy, live JSON validation and a line/char counter.

The `compact` prop is the key to *not* disturbing surrounding UI: with `compact`,
the utility bar only appears on focus, on hover, or once the content is genuinely
large (`lines > 1 || chars > 60`). A short string field therefore looks exactly
like a plain input until you engage with it.

### Where it is wired in
| Parameter | Behaviour |
|---|---|
| `ObjectParameter` | JSON text-input branch → `ExpandableTextInput language="json" minRows={6} maxRows={16}` |
| `ArrayParameter`  | same, plus `error={error}` (the component renders errors itself, so the old `<Typography color="error">` caption was removed) |
| `StringParameter` | rich editor only when warranted — see below |
| `CodeParameter`   | height is now content-driven (`height="auto"`, `minHeight 220px`, `maxHeight 55vh`) instead of a fixed `60vh` + `300px` floor that pushed the rest of the panel off-screen |

### The `StringParameter` heuristic
`needsRichEditor(param, value)` returns true when **any** of these hold:

- the value contains a newline, or is longer than 80 characters;
- `param.type` matches `textarea|longtext|multiline|markdown|html|json|code|prompt`;
- `param.key`/`name` matches a hint list (`prompt`, `instruction`, `system`,
  `template`, `query`, `sql`, `body`, `content`, `message`, `text`, `description`,
  `schema`, `payload`, `markdown`, `html`, `json`, `script`, `code`, `context`, `rule`);
- the trimmed value *looks like* JSON (`^[[{] … []}]$`) or HTML (`^\s*<[a-z!/]`).

This covers the four content types you named: plain text, markdown, HTML and JSON.

An `everRich` latch means a field that has become rich never flips back to
single-line mid-typing — that would unmount the input and steal focus.
`ObjectParameter.handleTextInputChange` still stores the **raw unparsed string**
(the backend parses it) and `ArrayParameter` still JSON-parses and requires an
array; both keep their "Use Text Input" switch and their `param.value` mirroring
effect. No contract changed.

---

## 5. Professional node redesign

**File:** `src/components/FlowNodes/index.jsx`

**What was wrong.** Every node wore a full-bleed saturated gradient bar. At canvas
zoom those bars dominate the viewport, fight the app's calm slate/indigo shell,
and white-on-mid-tone titles are hard to read.

**What it is now.** A white enterprise card that matches the header, sidebar and
modals:

- **Accent rail** — a 3px vertical bar in the type colour is the only saturated
  element. Type recognition at a glance, zero visual shouting.
- **Tinted icon tile** — 7×7 rounded tile in a 50/600 tint of the same hue.
- **Header meta row** — an uppercase type chip (`Agent Flow`, `Loop`, `Condition`…
  via `TYPE_LABELS`) plus a live field count (`3 fields`).
- **Title** wrapped in a `Tooltip`, since it truncates.
- **Selection** is a soft coloured ring in the node's own accent
  (`0 0 0 3px <accent>`) instead of a hard indigo border, plus a lifted shadow.
  Unselected: `border-slate-200 shadow-sm`, hover: `shadow-md border-slate-300`.
- **Unified handle geometry.** Previously every handle hardcoded
  `background: 'gray'` inline, silently overriding its own Tailwind colour classes.
  A single `handleStyle(color, extra)` helper now produces white-filled, 2px
  coloured-ring ports everywhere, with a hover scale.
- **Labelled branch ports.** `decision` shows `true` (emerald) / `false` (rose) and
  `iterator` shows `loop` (indigo) / `done` (slate), each with a tooltip. You no
  longer have to guess which port is which.
- **Question/options body** is denser, caps at 4 options with a `+N more` overflow,
  and uses the option colour as a small dot rather than a grey slab.
- **Condition rows** keep their per-condition inline `Handle` (`id = index`) — that
  wiring is untouched — but now render the operator as a mono amber chip.
- The iterator icon spin was slowed from the default to 3s so it reads as "looping"
  rather than "loading".

Node type detection, handle IDs, `useUpdateNodeInternals`, the memoized
`nodeTypes` map and the `typeSignature` cache are all unchanged — only presentation
moved.

---

## 6. Hero orbital visual

**Files:** `src/components/Dashboard/OrbitalVisual.jsx` *(new)*,
`src/components/Dashboard/HeroSection.jsx`, `src/app/globals.css`

Your reference JSX was used as the concept, then re-skinned to the product:
white surfaces, slate borders and text, indigo as the single accent — no dark
palette, no neon.

- **Layout.** The hero is now
  `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]`. Copy sits left and
  left-aligns from `lg` up; the visual sits right. Below `lg` it collapses back to
  the original centred single column, so mobile is unchanged. The visual is hidden
  below `md` (it would be clumsy at that width) and is `aria-hidden` since it is
  decorative.
- **Hero text and colours were not touched** — only alignment utilities
  (`lg:items-start`, `lg:text-left`, `lg:justify-start`) were added.
- **Structure.** Static dashed guide rings (they do *not* rotate, which keeps the
  geometry calm), an outer ring of 3 satellites at 34s, an inner counter-rotating
  ring of 3 at 26s, and a central "Orchestration Core" card with a Live pill and
  42ms / 6 nodes stat chips that echo the canvas mockup below.
- **Upright satellites.** Each satellite carries the mirrored animation at the
  identical duration, so the ring's rotation is cancelled and the card never
  appears upside down.
- **New CSS:** `@keyframes orbit`, `orbit-reverse`, `orbit-glow` plus a
  `prefers-reduced-motion: reduce` block that disables all hero motion
  (`orbit`, `blob`, `flow-dot`, `float`, `pulse-ring`).

---

## 7. Dictionary — now API-driven

**Files:** `src/utils/dictionaryAPI.js` *(new)*, `src/app/dictionary/page.jsx`

The page was seeded from a hardcoded `DEFAULT_GLOBAL_DICTIONARIES` constant and
persisted to `localStorage` under `aurora_global_dictionaries`. Both are gone.

`src/utils/dictionaryAPI.js` is a dedicated axios instance, because the dictionary
service is on a different host than `APIKit`'s `/api` rewrite. (`fetchMcpTools`
already set the precedent for calling an absolute URL.)

- Base URL `https://apidev.sifymodernization.digital/ai/api/agent-studio`,
  overridable via `NEXT_PUBLIC_DICTIONARY_API_URL`.
- Bearer token from `localStorage`, guarded for SSR.
- Every axios failure is normalised to `{ message, code, status }` matching the
  spec's `{ status: "error", code, message }` envelope.

| Function | Endpoint |
|---|---|
| `listDictionaries({type, search, page, limit})` | `GET /api/dictionary` |
| `createDictionary(payload)` | `POST /api/dictionary` (201) |
| `updateDictionary(id, payload)` | `PUT /api/dictionary/:id` |
| `deleteDictionary(id)` | `DELETE /api/dictionary/:id` |

Plus `validateDictionaryKey` (`^[A-Z0-9_]+$`, ≤64 chars) and
`validateDictionaryValue` enforcing the type contract exactly
(`object` must not be an array, `number` must be finite, etc.).

`mapDictionaryFromApi` bridges the API's `created_at` / `updated_at` / `created_by`
to the `updatedAt` the UI already renders, so no table markup had to change.

**Page changes:**
- `loadDictionaries()` on mount, plus a **Refresh** button in the header.
- Table renders three distinct states: spinner while loading, an error card with a
  **Try again** button, and two different empty messages depending on whether the
  workspace is genuinely empty or just filtered down to nothing.
- Save button shows `Saving…` / `Registering…` and disables during flight.
- `409 DUPLICATE_KEY` is surfaced with the server's message; a local duplicate
  check still fails fast before the round-trip.
- **Delete now confirms** — deleting a global variable breaks every flow
  referencing `{{global.KEY}}`, and the dialog says exactly that.
- Search and type filtering stay client-side so typing remains instant, while the
  API's `search`/`type` params are still supported by the client.

> The host `apidev.sifymodernization.digital` is unreachable from this sandbox
> (TCP connects to `1.6.37.35:443` but TLS fails with `SSL_ERROR_SYSCALL`), so the
> client is written strictly against `DICTIONARY_API_SPEC.md` and verified by
> compile + render, not by live response.

---

## 8. Delete confirmation on the flow listing

**Files:** `src/app/studio/page.jsx`,
`src/components/StudioListing/{FlowListingGridView,FlowListingTableView}.jsx`

Both views now pass the whole `flow` object up rather than just an id, so the
dialog can name the flow being deleted.

- `handleDeleteFlow(flow)` **only opens the dialog** — it no longer dispatches.
- `handleConfirmDelete` owns the `deleteFlow` dispatch, clears dialog state and
  refetches `getAllFlows()` on success, and releases the dialog in
  `.unwrap().catch()` so a failed delete does not leave a stuck spinner.

---

## Shared component

`src/components/Common/ConfirmDialog.jsx` backs items 2, 7 and 8.

```
open, tone ("danger" | "warning" | "info"), title, description, details,
confirmLabel, secondaryLabel, cancelLabel, busy,
onConfirm, onSecondary, onCancel
```

`busy` disables the backdrop close and both buttons, which is what makes the
"Save & Leave" three-button flow in the studio safe.

---

## Verification

- `npm run build` → **✓ Compiled successfully in 26s**, 13/13 static pages.
  The only two lint warnings (`src/utils/colors.js:31`,
  `src/utils/commonFunction.js:92`) are pre-existing and untouched.
- Dev server: `/`, `/studio`, `/dictionary`, `/studio/[id]` all return 200 and
  compile without error.
- Every changed file parses clean under `@babel/parser` with the JSX plugin.

### Known sandbox-only noise (not bugs)
- `Failed to download 'Geist' from Google Fonts` — no outbound network.
- `redux-persist failed to create sync storage. falling back to noop storage` —
  expected during SSR.
- Remember `basePath: '/agent-studio'`: use
  `http://localhost:3000/agent-studio/studio/<id>`, not `/studio/<id>`.

### Not done / worth a look
- The dictionary client could not be exercised against a live endpoint. First
  thing to check when you have network: the response envelope nesting
  (`data.data.items`) and whether your gateway wants the `Authorization` header or
  a cookie.
- `src/components/studio/StudioChatBot copy.jsx` and `src/utils/dataModels copy.js`
  are stale duplicates still sitting in the tree.
- `next.config.js` and `next.config.mjs` both exist; only the `.mjs` carries
  `basePath`. Worth deleting the dead one before it bites someone.
