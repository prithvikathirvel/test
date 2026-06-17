/* ─── Config & helpers ───────────────────────────────────────────── */

export const BASE = (process.env.NEXT_PUBLIC_CMDB_API_URL || 'http://1.6.37.35/cmdb').replace(/\/$/, '');
export const LABEL_RE = /^[A-Za-z][A-Za-z0-9_]*$/;
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const ALLOWED_EXT = ['.csv', '.xlsx', '.xls', '.sql', '.zip'];
export const NODE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#b45309', '#0d9488'];

export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
export const authHdr = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };
export const readErr = async (res) => { try { return await res.json(); } catch { return { error: `HTTP ${res.status}` }; } };

export const renderCell = (v) => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

export const enrichEntities = (entities) =>
  (entities || []).map((e, i) => ({ ...e, _color: NODE_COLORS[i % NODE_COLORS.length] }));

export const asArray = (v) => (Array.isArray(v) ? v : []);
export const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

export const normalizeColumn = (col) => {
  if (typeof col === 'string')
    return { source_column: col, target_property: col, is_identity: false, skip: false };
  if (typeof col === 'object' && col !== null)
    return {
      source_column: String(col.source_column || col.column || col.name || ''),
      target_property: String(col.target_property || col.target || col.source_column || col.name || ''),
      is_identity: Boolean(col.is_identity || col.is_primary),
      skip: Boolean(col.skip || col.exclude),
    };
  return { source_column: String(col), target_property: String(col), is_identity: false, skip: false };
};

export const normalizeEntity = (entity) => {
  const e = asObject(entity);
  const rawCols = asArray(e.columns || e.source_columns || e.properties);
  const columns = rawCols.map(normalizeColumn).filter((c) => c.source_column);
  const properties = columns.length > 0 ? columns.map((c) => c.source_column) : [];
  const idCol = String(e.id_column || e.primary_key || properties[0] || 'id');
  return {
    source_table: String(e.source_table || e.table_name || e.table || e.from_table || ''),
    node_label: String(e.node_label || e.label || e.entity || 'Entity'),
    id_column: idCol,
    is_junction_table: Boolean(e.is_junction_table),
    properties,
    columns,
  };
};

export const normalizeRelationship = (r) => {
  const rel = asObject(r);
  return {
    rel_type: String(rel.rel_type || rel.type || 'RELATED_TO'),
    from_table: String(rel.from_table || rel.source_table || rel.from || ''),
    to_table: String(rel.to_table || rel.target_table || rel.to || ''),
    from_column: String(rel.from_column || rel.left_key || ''),
    to_column: String(rel.to_column || rel.right_key || ''),
  };
};

export const normalizeProposal = (raw) => {
  const p = asObject(raw);
  return {
    entities: asArray(p.entities || p.entity_mappings || p.node_mappings || p.nodes).map(normalizeEntity),
    relationships: asArray(p.relationships || p.relationship_mappings || p.edges).map(normalizeRelationship),
  };
};

export const normalizeSampleData = (raw) => {
  const src = asObject(raw);
  const out = {};
  Object.keys(src).forEach((k) => { out[k] = asArray(src[k]); });
  return out;
};
