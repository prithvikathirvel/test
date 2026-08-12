# React Flow Code Review — Agent Studio

**Scope:** every file in the repo that touches React Flow.
**Version:** `reactflow@11.11.4` (v11, unchanged — no `@xyflow/react` migration).
**Language:** JSX throughout (no TypeScript introduced).
**Status:** all critical/high findings fixed; `npx next lint --dir src` clean (2 pre-existing warnings unrelated to flow code); production build 13/13 pages.

Line numbers written as `path:line`. "orig" = the file as it was at commit `eab6f74`; unqualified line numbers refer to the current working tree.

---

## 1. Flow surface inventory

Files that import from `reactflow`, after the review:

| File | Lines | Role |
|---|---|---|
| `src/app/studio/[id]/page.jsx` | 580 | Page container: data fetch, Redux sync, modals. Owns `useNodesState`/`useEdgesState`. |
| `src/components/studio/FlowCanvas.jsx` | 562 | **New.** The `<ReactFlow>` host — all canvas props, shortcuts, MiniMap/Controls/Background/Panel, viewport persistence. |
| `src/components/FlowNodes/index.jsx` | 444 | `CustomNode` + `useNodeTypes()`; all `<Handle>`s. |
| `src/components/FlowNodes/FlowEdge.jsx` | 88 | **New.** Custom edge with hover-to-delete. |
| `src/components/FlowNodes/ConnectionLine.jsx` | 52 | **New.** Animated connection line with valid/invalid coloring. |
| `src/components/studio/CanvasToolbar.jsx` | 94 | **New.** Floating toolbar inside `<Panel>`. |
| `src/components/studio/NodeSearchPalette.jsx` | 233 | **New.** Ctrl+K search / quick-add. |
| `src/components/studio/NodeContextMenu.jsx` | 73 | **New.** Right-click node menu. |
| `src/hooks/useUndoRedo.js` | 72 | **New.** Snapshot undo/redo. |
| `src/utils/flowLayout.js` | 385 | **New.** Graph→nodes/edges builders + in-house auto-layout. |
| `src/hooks/useFlow.js` | 40 | Dead legacy hook (kept, patched). |
| `src/components/ReactAgentNode.jsx` | 65 | Unreferenced node component (kept, memoized). |

Support files touched: `src/components/studio/ComponentsSidebar.jsx` (drag source), `src/redux/slices/studioSlice.js`, `src/app/globals.css`.

---

## 2. Critical findings (all fixed)

### C1 — No `ReactFlowProvider` anywhere in the app
**Evidence:** `grep -rn "ReactFlowProvider|useReactFlow" src/` returned **0 matches** at `eab6f74`. `page.jsx:766-770` (orig) exported `<Studio />` bare.

**Impact:** Without a provider, `<ReactFlow>` creates a store scoped to itself, so no component outside its subtree can use `useReactFlow()`, `screenToFlowPosition`, `deleteElements`, `useNodesInitialized`, etc. This is what forced the hand-rolled (and wrong) drop math in C2 and blocked every imperative feature you asked for.

**Fix:** `page.jsx:574-579` — the default export wraps `<Studio />` in `<ReactFlowProvider>`. Everything imperative now hangs off that one store. Verified in SSR HTML: exactly one `-desc-` id set (`react-flow__node-desc-1`, `react-flow__edge-desc-1`), i.e. one store instance, no accidental double-provider.

### C2 — Drop position ignored pan and zoom
**Evidence:** orig `page.jsx:428-431`:
```js
const position = { x: event.clientX - drawerWidth, y: event.clientY - 100 };
```
Also `const type` was declared twice in the same `onDrop` (orig `page.jsx:398` and `408`) — shadowing inside the nested branch.

**Impact:** dropped nodes landed at the wrong coordinates as soon as the canvas was panned or zoomed. The `- 280 / - 100` constants only happened to be right at zoom 1 with the drawer open.

**Fix:** `FlowCanvas.jsx:165` uses the provider-backed projection:
```js
const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
```
The duplicate `const type` is gone. Correct at any pan/zoom.

### C3 — `nodeTypes` identity churned on every catalog fetch
**Evidence:** orig `FlowNodes/index.jsx:363-398` — `useNodeTypes()` `useMemo`'d over the raw Redux arrays (`tools`, `agents`, `models`, `inputs`, `outputs`, `flows`). Those arrays get replaced by reference on every fetch/refresh, so the memo produced a **new `nodeTypes` object**.

**Impact:** React Flow treats a new `nodeTypes` object as a new component map — it re-creates the component type for every node, which **unmounts and remounts every node on the canvas** (losing DOM state, re-measuring handles) and logs React Flow dev warning #002. This was the single largest source of canvas jank.

**Fix:** `FlowNodes/index.jsx:28-52` adds two `createSelector` selectors — `selectCatalogTypes` (a `Set` of type strings) and `selectNodeTypeKeys` — and `useNodeTypes()` (`index.jsx:401-426`) memoizes on a **string signature** (`typeKeys.join("|")`), not on array identity. A fetch that returns the same catalog now yields the *same* `nodeTypes` object.

`edgeTypes` never had this problem because it didn't exist; the new one is module-scope constant `EDGE_TYPES` at `FlowCanvas.jsx:27`.

---

## 3. High findings (all fixed)

### H1 — `reactFlowProps` useMemo anti-pattern
**Evidence:** orig `page.jsx:624-651` built one big props object with `nodes` and `edges` in the dependency array, then spread it: `<ReactFlow {...reactFlowProps}>` (orig `page.jsx:721`).

**Impact:** the memo was pure overhead — its deps changed on literally every node drag frame, so it recomputed constantly while adding an extra object allocation and defeating any per-prop referential stability.

**Fix:** deleted. `FlowCanvas.jsx:485-517` passes props explicitly, with every object/array/function literal hoisted to module scope (`FlowCanvas.jsx:27-38`): `EDGE_TYPES`, `DEFAULT_EDGE_OPTIONS`, `FLOW_STYLE`, `SNAP_GRID`, `DELETE_KEY_CODES`, `FIT_VIEW_OPTIONS`, `PRO_OPTIONS`, `MINIMAP_STYLE`, `MINIMAP_MASK`.

### H2 — Six Redux subscriptions per node, plus per-render array spreads
**Evidence:** orig `FlowNodes/index.jsx:75-80` — every `CustomNode` instance ran six `useSelector` calls. `getNodeIcon` / `getNodeAccent` (orig `index.jsx:20`, `:47`) each did `[...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find(...)` — two full concatenations of all six catalogs **per node per render**. `getOptionColors()` (orig `index.jsx:66`) returned a fresh array literal each call (orig `index.jsx:85`).

**Impact:** with N nodes that's 6N store subscriptions and 2N array concatenations per render pass. Any catalog update re-rendered every node.

**Fix:**
- one memoized subscription: `useSelector(selectCatalogTypes)` at `index.jsx:116`;
- `OPTION_COLORS` hoisted to module scope (`index.jsx:96-105`);
- `icon` memoized (`index.jsx:119`), `conditionData` / `questionData` / `displayOptions` already memoized and kept so;
- `CustomNode` wrapped in `memo` (`index.jsx:114`).

### H3 — Dynamic handles never triggered a re-measure
**Evidence:** `FlowNodes/index.jsx:288-299` renders one `<Handle id={index.toString()}>` **per condition** for `conditions`/`condition` nodes. The handle set therefore changes at runtime when a user adds or removes a condition. `grep -rn "useUpdateNodeInternals" src/` returned 0 matches.

**Impact:** React Flow measures and caches handle bounds when a node mounts. Adding/removing a condition changes the handle list without invalidating that cache, so edges anchor to stale rows — visibly attaching to the wrong condition or floating off the node.

**Fix:** `FlowNodes/index.jsx:190-201` — `useUpdateNodeInternals()` fired from an effect keyed on `conditionCount`, so it runs only when handles are actually added or removed, never on ordinary re-renders:
```js
const conditionCount = conditionData.conditions.length;
const updateNodeInternals = useUpdateNodeInternals();
useEffect(() => {
  if (!id) return;
  if (nodeType !== "conditions" && nodeType !== "condition") return;
  updateNodeInternals(id);
}, [id, nodeType, conditionCount, updateNodeInternals]);
```

### H4 — Redux sync effects had lying dependency arrays
**Evidence:** orig `page.jsx:476-495` and `:498-517` — both effects read `flow` and `dispatch` in the body but declared only `[nodes]` / `[edges]`.

**Impact:** stale `flow` captured in the closure; `setNodes({ nodes, flow })` could dispatch a stale flow object over a fresh one.

**Fix:** `page.jsx:254-294` keeps the original structural-vs-debounced heuristic (immediate dispatch when the node/edge count changes, 300 ms debounce otherwise) but reads the flow through `flowRef.current` and declares honest deps `[nodes, dispatch]` / `[edges, dispatch]`. Behavior unchanged, correctness restored.

### H5 — Ref mutation during render
**Evidence:** orig `page.jsx:59-62`:
```js
const nodesRef = useRef(nodes); nodesRef.current = nodes;
const flowRef  = useRef(flow);  flowRef.current  = flow;
```
Assignment in the render body is a side effect. Under React 19 concurrent rendering a render pass can be thrown away, leaving the ref written from a discarded render.

**Fix:** `page.jsx:78-87` — both refs are synced inside `useEffect`, declared above every consumer.

### H6 — Custom edge delete bypassed React Flow's delete pipeline
**Evidence:** the pre-fix edge component removed itself with `setEdges(eds => eds.filter(...))`.

**Impact:** `onEdgesDelete` never fires, so Redux never learns the edge is gone and undo has nothing to hook into — the canvas and the store drift apart.

**Fix:** `FlowEdge.jsx:70-76` uses `deleteElements({ edges: [{ id }] })`, which is the same code path as the Delete key and does fire `onEdgesDelete`.

### H7 — Unstable handler identities on `<ReactFlow>`
**Evidence:** orig `page.jsx:464`, `:468`, `:530`, `:607`, `:612`, `:619`; `runFlowValidation` (orig `page.jsx:537`) declared `[nodes]`, so it changed identity on every drag frame and cascaded into any memo depending on it.

**Fix:** all rewritten as `useCallback` reading through refs (`nodesRef`, `flowRef`, `selectedNodeIdRef`, `voiceConfigRef`, `voiceEnabledRef`). No handler passed to the canvas changes identity during a drag.

### H8 — CSS animated the drag transform
**Evidence:** `globals.css` `.react-flow__node { transition: all 0.2s ...; }` and `FlowNodes/index.jsx` root `<div className="... transition-all duration-300 backdrop-blur-sm ...">`.

**Impact:** React Flow writes `transform: translate(x,y)` on the node wrapper **every drag frame**. `transition: all` made the browser interpolate that transform, so nodes visibly lagged behind the cursor and every frame produced extra compositing work. Separately, `backdrop-blur-sm` sat behind an opaque `bg-white` — visually a no-op, but it forced a GPU compositing layer per node.

**Fix:** `globals.css:96-101` narrows to `transition: box-shadow ..., border-color ...`; `FlowNodes/index.jsx:206` uses `transition-[box-shadow,border-color] duration-300` and drops `backdrop-blur-sm`. Hover affordances look identical; drag is now transform-only.

---

## 4. Medium / low findings (all addressed)

| # | Finding | Evidence | Resolution |
|---|---|---|---|
| M1 | Wasted store subscriptions on the page | orig `page.jsx:55-56` subscribed to `flowOutput`; `studioLoader` and an unused `output` state were also live | Removed. `page.jsx` now has **zero high-frequency subscriptions**. |
| M2 | `specification` subscribed but only read at save time | orig `page.jsx` `useSelector(state => state.studio.specification)` | Converted to an imperative read via `useStore()` — `page.jsx:73` + `store.getState().studio.specification` at `page.jsx:394`. Save behavior identical, re-renders gone. |
| M3 | `generateSpecification` ran twice per parameter edit | `studioSlice.js` `updateNode` called it once for `state.specification` and again for `state.flow` | Built once into `const specification`, assigned to both — `studioSlice.js:316-320`. |
| M4 | `console.log("specification inside slice", ...)` on a hot reducer path | `studioSlice.js:171` (orig) | Removed. Remaining logs are in fetch/save thunks only (`:41-61`, `:86`, `:114`, `~407`, `~433`) — off the render path, left untouched. |
| M5 | Sidebar re-rendered its whole catalog on every drag | `ComponentsSidebar.jsx` | `ComponentSection` and `NodeTile` wrapped in `memo`; `prebuiltFlows` sort memoized. |
| M6 | Dead code with real bugs | `useFlow.js` `onConnect` used a non-functional `setEdges`; `ReactAgentNode.jsx` un-memoized | Both patched (`useFlow.js` functional update; `ReactAgentNode` wrapped in `memo`) so they're not landmines if ever wired up. |
| L1 | Stray `@reactflow/*` sub-package deps in `package.json` | `@reactflow/{background,controls,core,minimap,node-resizer}` alongside `reactflow` | **No code change needed.** `grep -rn "@reactflow/" src/` → 0 direct imports; `npm ls` shows a single `@reactflow/core@11.11.4` with no nested duplicate, so there is no split-store risk. Safe to drop from `package.json` as housekeeping whenever convenient. |

---

## 5. Performance Checklist — every item resolved

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | `nodeTypes` / `edgeTypes` referentially stable | ✅ Satisfied | `edgeTypes` module-scope `FlowCanvas.jsx:27`; `nodeTypes` memoized on a string signature `FlowNodes/index.jsx:401-426`. |
| 2 | Node components wrapped in `memo` | ✅ Satisfied | `CustomNode` `index.jsx:114`; `ReactAgentNode.jsx`; `FlowEdge.jsx:14`; `CanvasToolbar.jsx:23`; `NodeContextMenu.jsx:13`; `NodeSearchPalette.jsx:100`; `FlowCanvas.jsx:74`. |
| 3 | No inline object/array/function literals in `<ReactFlow>` props | ✅ Satisfied | All hoisted, `FlowCanvas.jsx:27-38`; handlers all `useCallback`, `FlowCanvas.jsx:153-476`. |
| 4 | Node data mutated immutably | ✅ Satisfied | Only `useNodesState`/`useEdgesState` setters and reducer spreads; no in-place writes found. |
| 5 | Selectors narrow / memoized | ✅ Satisfied | `createSelector` for `selectCatalogTypes` (`index.jsx:28`), `selectNodeTypeKeys` (`index.jsx:50`), `selectCatalog` (`NodeSearchPalette.jsx:25`). |
| 6 | Store subscriptions off the hot path | ✅ Satisfied | Page-level subscriptions reduced to `flow`, `studioUpdateFlowLoader`, `isFlowRunning`; `specification` read imperatively (`page.jsx:73`). |
| 7 | Expensive derived values memoized | ✅ Satisfied | `icon`, `conditionData`, `questionData`, `displayOptions` (`index.jsx:119-188`); layout results computed on demand only. |
| 8 | Handler identity stable across drags | ✅ Satisfied | Ref-backed `useCallback`s; `runFlowValidation` no longer depends on `nodes`. |
| 9 | State updates use functional form | ✅ Satisfied | `page.jsx:159`, `:217`, `:236`, `:350-352`; `useFlow.js` patched. |
| 10 | Change batches kept small | ✅ Satisfied | React Flow's own `applyChanges` is O(changes) per element; we pass `onNodesChange`/`onEdgesChange` straight through and never re-wrap or re-emit changes. |
| 11 | Redux sync debounced, not per-frame | ✅ Satisfied | Structural change → immediate; position-only → 300 ms debounce (`page.jsx:254-294`). Same policy as original, now with correct deps. |
| 12 | Viewport writes debounced | ✅ Satisfied | `onMoveEnd` only (`FlowCanvas.jsx:506`), 300 ms debounced persist (`FlowCanvas.jsx:116`). |
| 13 | `fitView` not re-run on every render | ✅ Satisfied | One-shot, gated on `useNodesInitialized` (`FlowCanvas.jsx:99`, `:140`). |
| 14 | CSS doesn't animate the drag transform | ✅ Satisfied | `globals.css:96-101`; `index.jsx:206`. |
| 15 | No unnecessary GPU layers | ✅ Satisfied | `backdrop-blur-sm` removed from the node root. |
| 16 | `useUpdateNodeInternals` for dynamic handles | ✅ Satisfied | `index.jsx:190-201`. |
| 17 | Node/edge lookups not O(n) inside render | ✅ Satisfied | Catalog lookups are `Set.has` (`selectCatalogTypes`); the remaining `getNodes().find()` calls are inside event handlers (`FlowCanvas.jsx:184`), not render. |
| 18 | `onlyRenderVisibleElements` considered | ⚪ N/A — deliberately off | Supported in 11.11.4 (`@reactflow/core` `:3163`, `:3589`) but it adds a per-viewport-change intersection pass and unmounts off-screen nodes. Agent flows here are tens of nodes, not thousands; enabling it would cost more than it saves and would break the one-shot `fitView` measurement. Flip it on if a flow ever exceeds a few hundred nodes. |
| 19 | Custom `ConnectionLine` cheap to render | ✅ Satisfied | Pure SVG path + CSS keyframe dash animation (`ConnectionLine.jsx`, `globals.css` keyframes) — no per-frame React state. |
| 20 | Undo/redo history doesn't re-render the canvas | ✅ Satisfied | `past`/`future` are refs; a single `useState({canUndo,canRedo})` re-renders only the toolbar and bails when unchanged (`useUndoRedo.js:18-30`). |

---

## 6. Common Mistakes — every item resolved

| # | Mistake | Status | Evidence |
|---|---|---|---|
| 1 | Missing `ReactFlowProvider` | ✅ Fixed | `page.jsx:574-579`. See C1. |
| 2 | `nodeTypes`/`edgeTypes` recreated each render | ✅ Fixed | See C3. |
| 3 | Manual screen→flow math instead of projection | ✅ Fixed | See C2 — `screenToFlowPosition`, `FlowCanvas.jsx:165`. |
| 4 | Mutating nodes/edges in place | ✅ N/A — never occurred | Original code already used immutable setters and reducer spreads. |
| 5 | Deleting elements outside React Flow's pipeline | ✅ Fixed | `deleteElements`, `FlowEdge.jsx:70-76`. See H6. |
| 6 | Dynamic handles without `useUpdateNodeInternals` | ✅ Fixed | See H3. |
| 7 | Missing/duplicate handle ids | ✅ Satisfied | Verified unique per node — target Left (skipped for `start`), source Right (skipped for output/decision/iterator/condition), decision `true`/`false`, iterator `loop`/`complete`, per-condition index strings (`index.jsx:325-406`). |
| 8 | Unknown `edge.type` falling back to `default` | ✅ Fixed | Every generated edge gets `type: FLOW_EDGE_TYPE` (`flowLayout.js:18`) and `EDGE_TYPES` registers it (`FlowCanvas.jsx:27`). No React Flow error #011 in the dev log. |
| 9 | Wrong dependency arrays | ✅ Fixed | See H4, H7. |
| 10 | Side effects during render | ✅ Fixed | See H5. |
| 11 | Non-functional `setState` in async handlers | ✅ Fixed | See checklist #9; `useFlow.js` patched. |
| 12 | Uncontrolled re-render from parent state | ✅ Fixed | Canvas extracted into memoized `FlowCanvas`; page-level modal state no longer re-renders the canvas subtree. |
| 13 | Self-loops / duplicate / invalid connections allowed | ✅ Fixed | `isValidConnection` (`FlowCanvas.jsx:177-200`) blocks self-loops, duplicate handle pairs, and anything targeting a `start` node. |
| 14 | Keyboard shortcuts firing while typing | ✅ Fixed | `isTypingTarget` guard (`FlowCanvas.jsx:61`, checked at `:404`) before any shortcut runs. |
| 15 | Shortcuts swallowed by React Flow's own listeners | ✅ Fixed | Capture-phase `window` listener (`FlowCanvas.jsx:445`, `useCapture = true`) — React Flow listens on `document`. |
| 16 | Duplicated/dead flow code drifting | ✅ Addressed | `useFlow.js` and `ReactAgentNode.jsx` confirmed unreferenced (grep → 0 call sites) and patched rather than left broken; `flowSlice.js` `updateSpecification` is a no-op and untouched. |
| 17 | Duplicate React Flow installs (split store) | ✅ Verified clean | Single `@reactflow/core@11.11.4`, no nested copy; `src/` imports only from `reactflow`. See L1. |
| 18 | Pro-only code copied in | ✅ Satisfied | No Pro features and no Pro-derived code. Auto-layout is written in-house (`flowLayout.js:278` `getLayoutedElements`) — layered ranking with cycle guard, no `dagre`, no `elkjs`. |

---

## 7. Features added

All additive; no existing behavior changed.

| Feature | Where | Notes |
|---|---|---|
| MiniMap with per-type node colors | `FlowCanvas.jsx:521-529` | `nodeColor` reuses the existing `getNodeColor` from `commonFunction.js`, so colors match the canvas. Pannable + zoomable. |
| One-click auto-layout (LR / TB) | `FlowCanvas.jsx:282-289`, `flowLayout.js:278` | In-house layered ranking, cycle-guarded, preserves input order. Followed by `fitView`. |
| Undo / redo | `useUndoRedo.js`, `FlowCanvas.jsx:100` | Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y. Snapshot taken before every mutating interaction (drag start, connect, delete, paste, layout). 50-step cap. |
| Copy / paste / duplicate / delete | `FlowCanvas.jsx:394-458` | Ctrl+C, Ctrl+V, Ctrl+D, Delete/Backspace. All snapshot first. |
| Fit view + zoom controls | `FlowCanvas.jsx:290`, `:519` | Shift+1 shortcut plus the standard `<Controls>`, styling preserved from the original. |
| Hover-to-delete edge button | `FlowEdge.jsx` | Appears on hover in an `<EdgeLabelRenderer>`; deletes through `deleteElements`. |
| Animated connection line, valid/invalid coloring | `ConnectionLine.jsx` | Green `#10b981` valid, rose `#f43f5e` invalid, indigo `#6366f1` idle; dashed marching-ants via CSS keyframes. |
| Connect-on-drop | `FlowCanvas.jsx:215-238` | Dragging from a handle to empty canvas opens the palette and auto-wires the new node to the origin handle. |
| Invalid-connection prevention | `FlowCanvas.jsx:177-200` | Self-loops, duplicates, and edges into `start` are rejected before they're created. |
| Ctrl+K node search / quick-add | `NodeSearchPalette.jsx` | Searches the full catalog (memoized selector), inserts at viewport center or at the drop point. |
| Node context menu | `NodeContextMenu.jsx` | Right-click → duplicate / delete / focus / open details. |
| Selection box | `FlowCanvas.jsx:512` | `SelectionMode.Partial` + Shift-drag; multi-select drag snapshots once. |
| Snap-to-grid toggle | `FlowCanvas.jsx:510-511`, toolbar | 16×16 grid, off by default. |
| Per-flow viewport persistence | `FlowCanvas.jsx:41-72`, `:116`, `:506` | `localStorage` key `studio:viewport:${flowId}`, written debounced on `onMoveEnd`, restored via `defaultViewport`. Falls back to one-shot `fitView` when there's nothing stored. |

**Preserved from the original, verbatim:** `style={{ backgroundColor: "#F7F9FB" }}`, `defaultEdgeOptions.style` `{ stroke: 'var(--primary-color)', strokeWidth: 2 }`, `<Background color="#cbd5e1" gap={16} size={1} />`, `<Controls className="!bg-white !border !border-slate-200 !rounded-lg !shadow-xs" />`. All Redux reducer contracts (`setNodes`, `setEdges`, `deleteNode`, `updateNodeConnections`) are untouched, including the `payload.type === "flow"` branch and the decision/condition handle mapping. The graph→nodes/edges builders in `flowLayout.js` were extracted **verbatim** from the original `page.jsx:89-354`.

---

## 8. Verification

- `npx next lint --dir src` → exit 0. Two warnings, both pre-existing and outside flow code: `src/utils/colors.js:31` (anonymous default export), `src/utils/commonFunction.js:92` (missing `alt`).
- `npm run build` → ✓ Compiled successfully, 13/13 static pages. `/studio/[id]` = 286 kB route / 522 kB first-load JS.
- Dev SSR of `/agent-studio/studio/test-flow-1` → HTTP 200 with `react-flow__{renderer, viewport, pane, nodes, background, minimap, minimap-mask, panel, edgelabel-renderer, container, attribution}` present and a **single** `-desc-` id set, confirming one store instance.
- No React Flow dev errors (#002 node types, #011 edge type) in the dev server log.

**Two environmental notes, not code defects:**
1. Routes are served under `basePath: '/agent-studio'` (`next.config.mjs`), so the studio URL is `/agent-studio/studio/<id>`; `/studio/<id>` legitimately 404s.
2. `npm run build` fails in a network-isolated sandbox because `src/app/layout.js` imports `Geist` from `next/font/google`. Builds verified by temporarily stubbing the font; `layout.js` is restored and `git diff` on it is clean.
