/**
 * Deterministic fingerprint of a flow's canvas state.
 *
 * Used by the studio to answer a single question: "does what is on the canvas
 * differ from what was last persisted?". It must be stable across re-renders
 * (so key order is normalised) and must ignore purely cosmetic React Flow
 * bookkeeping (`selected`, `dragging`, measured sizes, z-index...), otherwise
 * merely clicking a node would mark the flow dirty.
 */

const round = (n) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : 0);

/** Stable stringify: object keys are emitted in sorted order at every depth. */
const stableStringify = (value) => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
};

const normalizeParams = (params) =>
  (Array.isArray(params) ? params : []).map((p) => ({
    key: p?.key ?? p?.name ?? '',
    type: p?.type ?? '',
    value: p?.value ?? '',
    ...(p?.conditions ? { conditions: p.conditions } : {}),
    ...(p?.nextNode ? { nextNode: p.nextNode } : {}),
  }));

const normalizeNode = (node) => ({
  id: node?.id ?? '',
  type: node?.data?.type ?? node?.type ?? '',
  name: node?.data?.name ?? node?.name ?? '',
  description: node?.data?.description ?? node?.description ?? '',
  // Positions are rounded to whole pixels: sub-pixel drift from React Flow's
  // transform maths should not count as an unsaved change.
  x: round(node?.position?.x),
  y: round(node?.position?.y),
  next: Array.isArray(node?.data?.next) ? [...node.data.next].sort() : [],
  inputParameters: normalizeParams(node?.data?.inputParameters ?? node?.inputParameters),
  outputParameters: normalizeParams(node?.data?.outputParameters ?? node?.outputParameters),
});

const normalizeEdge = (edge) => ({
  source: edge?.source ?? edge?.from ?? '',
  target: edge?.target ?? edge?.to ?? '',
  sourceHandle: edge?.sourceHandle ?? null,
});

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const byEdge = (a, b) => {
  const ka = `${a.source}->${a.target}:${a.sourceHandle ?? ''}`;
  const kb = `${b.source}->${b.target}:${b.sourceHandle ?? ''}`;
  return ka < kb ? -1 : ka > kb ? 1 : 0;
};

/** Fingerprints the live canvas (React Flow `nodes` / `edges` arrays). */
export const fingerprintCanvas = (nodes, edges) =>
  stableStringify({
    nodes: (Array.isArray(nodes) ? nodes : []).map(normalizeNode).sort(byId),
    edges: (Array.isArray(edges) ? edges : []).map(normalizeEdge).sort(byEdge),
  });

export default fingerprintCanvas;
