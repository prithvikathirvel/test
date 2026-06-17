'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Eye, GitBranch, Layers, Plus, AlertCircle } from 'lucide-react';
import {
  BASE, LABEL_RE, asArray, asObject, normalizeProposal, normalizeSampleData, enrichEntities, authHdr, readErr,
} from './helpers';
import { Button, ErrorBox, WarnBox, InfoRow, SectionBadge } from './ui';
import NodeCard from './NodeCard';
import RelationshipCard from './RelationshipCard';

export default function Step2Schema({ session, onBack, onNext, onSessionExpired }) {
  const normalizedProposal = normalizeProposal(session?.proposal);
  const [mapping, setMapping] = useState({
    entities: enrichEntities(normalizedProposal.entities),
    relationships: normalizedProposal.relationships,
  });
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitErr, setSubmitErr] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const sourceTables = asArray(mapping.entities).map((e) => String(e?.source_table || '')).filter(Boolean);
  const entityColors = Object.fromEntries(asArray(mapping.entities).map((e) => [e.source_table, e._color]));

  const nodeErrs = asArray(mapping.entities).map((e) => {
    const lbl = String(e?.node_label || '').trim();
    return !lbl ? 'Empty label' : !LABEL_RE.test(lbl) ? 'Invalid format' : null;
  });
  const relErrs = asArray(mapping.relationships).map((r) => {
    const t = String(r?.rel_type || '').trim();
    if (!t) return 'Relationship type is required';
    if (!LABEL_RE.test(t)) return 'Must start with a letter; letters, digits, underscores only';
    if (!r.from_table || !r.to_table) return 'Both FROM and TO nodes must be selected';
    return null;
  });
  const hasLocalErrors = nodeErrs.some(Boolean) || relErrs.some(Boolean) || asArray(mapping.entities).length === 0;

  const resetPreview = () => { setPreview(null); setErrors([]); setWarnings([]); setSubmitErr(null); };

  const updateEntity = (idx, updated) => { const e = [...mapping.entities]; e[idx] = updated; setMapping((p) => ({ ...p, entities: e })); resetPreview(); };
  const updateRelationship = (idx, updated) => { const r = [...mapping.relationships]; r[idx] = updated; setMapping((p) => ({ ...p, relationships: r })); resetPreview(); };
  const deleteEntity = (idx) => {
    const tbl = mapping.entities[idx].source_table;
    setMapping((p) => ({
      entities: p.entities.filter((_, i) => i !== idx),
      relationships: p.relationships.filter((r) => r.from_table !== tbl && r.to_table !== tbl),
    }));
    resetPreview();
  };
  const deleteRelationship = (idx) => { setMapping((p) => ({ ...p, relationships: p.relationships.filter((_, i) => i !== idx) })); resetPreview(); };

  const addRelationship = () => {
    const from = sourceTables[0] || '';
    const to = sourceTables.length > 1 ? sourceTables[1] : (sourceTables[0] || '');
    setMapping((p) => ({
      ...p,
      relationships: [...p.relationships, { rel_type: 'RELATED_TO', from_table: from, to_table: to, from_column: '', to_column: '' }],
    }));
    resetPreview();
  };

  const handleValidateAndPreview = async () => {
    if (hasLocalErrors) return;
    setBusy(true); resetPreview();
    try {
      const body = {
        entities: mapping.entities.map(({ _color, properties: _p, ...rest }) => ({
          table_name: rest.source_table,
          node_label: rest.node_label,
          id_column: rest.id_column,
          columns: rest.columns,
        })),
        relationships: mapping.relationships,
      };
      const mapRes = await fetch(`${BASE}/upload/${session.uploadId}/mapping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHdr() },
        body: JSON.stringify(body),
      });
      if (mapRes.status === 404) { onSessionExpired(); return; }
      if (!mapRes.ok) {
        const e = await readErr(mapRes);
        setErrors(e.errors?.length ? e.errors : [e.error || 'Mapping rejected by server']);
        return;
      }
      const mapData = await mapRes.json();
      setWarnings(asArray(mapData?.warnings));

      const preRes = await fetch(`${BASE}/upload/${session.uploadId}/preview`, { method: 'POST', headers: authHdr() });
      if (preRes.status === 404) { onSessionExpired(); return; }
      if (!preRes.ok) {
        const e = await readErr(preRes);
        setSubmitErr(e.error || 'Preview request failed');
        return;
      }
      const previewData = await preRes.json();
      setPreview({
        valid: Boolean(previewData?.valid),
        total_node_counts: asObject(previewData?.total_node_counts),
        total_relationship_count: Number(previewData?.total_relationship_count || 0),
        issues: asArray(previewData?.issues),
      });
    } catch {
      setSubmitErr('Network error — could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const previewErrs = asArray(preview?.issues).filter((i) => i?.level === 'error');
  const previewWarns = asArray(preview?.issues).filter((i) => i?.level === 'warning');
  const canProceed = Boolean(preview?.valid) && !errors.length && !previewErrs.length;
  const sampleData = normalizeSampleData(session?.sampleData);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-lg sm:text-xl mb-0.5">Schema Review</h2>
          <p className="text-sm text-gray-400">Rename labels, adjust column mapping, then validate before ingestion.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-100">
            <Layers size={12} /> {mapping.entities.length} Nodes
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-100">
            <GitBranch size={12} /> {asArray(mapping.relationships).length} Rels
          </span>
        </div>
      </div>

      <ErrorBox messages={errors} />
      <WarnBox messages={warnings} onDismiss={() => setWarnings([])} />

      {preview && (
        <div className={`mb-6 p-4 rounded-xl border ${preview.valid ? 'bg-emerald-50/80 border-emerald-200' : 'bg-red-50/80 border-red-200'}`}>
          <p className={`font-bold mb-2.5 text-sm ${preview.valid ? 'text-emerald-700' : 'text-red-700'}`}>
            {preview.valid ? '✓ Dry-run passed — ready to commit' : '✕ Dry-run failed'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(preview.total_node_counts || {}).map(([label, count]) => (
              <span key={label} className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm">
                {label}: <strong>{Number(count).toLocaleString()}</strong>
              </span>
            ))}
            <span className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm">
              Rels: <strong>{(preview.total_relationship_count ?? 0).toLocaleString()}</strong>
            </span>
          </div>
          {previewErrs.map((iss, i) => <p key={i} className="text-xs text-red-600 leading-relaxed">✕ {iss.message}</p>)}
          {previewWarns.map((iss, i) => <p key={i} className="text-xs text-amber-600 leading-relaxed">⚠ {iss.message}</p>)}
        </div>
      )}

      {submitErr && <div className="mb-5"><InfoRow icon={AlertCircle}>{submitErr}</InfoRow></div>}

      {/* Node Labels */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shadow-sm">
            <Layers size={12} className="text-white" />
          </div>
          <h3 className="font-bold text-gray-700 text-base">Node Labels</h3>
          <SectionBadge count={mapping.entities.length} color="indigo" />
        </div>
        {mapping.entities.length === 0 && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-sm text-red-600 font-medium">At least one node type is required.</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {asArray(mapping.entities).map((entity, idx) => (
            <NodeCard
              key={idx}
              entity={entity}
              sampleData={sampleData}
              onChange={(updated) => updateEntity(idx, updated)}
              onDelete={() => deleteEntity(idx)}
            />
          ))}
        </div>
      </div>

      {/* Relationships */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center shadow-sm">
              <GitBranch size={12} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-700 text-base">Relationships</h3>
            <SectionBadge count={asArray(mapping.relationships).length} color="green" />
          </div>
          <Button
            variant="accent" size="sm"
            onClick={addRelationship}
            disabled={sourceTables.length < 1}
            leftIcon={<Plus size={13} />}
            title={sourceTables.length < 1 ? 'Add at least one node first' : 'Add relationship'}
          >
            Add
          </Button>
        </div>

        {asArray(mapping.relationships).length === 0 ? (
          <div
            className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
            onClick={() => sourceTables.length > 0 && addRelationship()}
          >
            <GitBranch size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">No relationships detected.</p>
            {sourceTables.length > 0 && <p className="text-xs text-emerald-500 font-semibold">+ Click to add</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {asArray(mapping.relationships).map((rel, idx) => (
              <RelationshipCard
                key={idx}
                rel={rel} idx={idx}
                sourceTables={sourceTables}
                entities={mapping.entities}
                entityColors={entityColors}
                relErrors={relErrs}
                onUpdate={(updated) => updateRelationship(idx, updated)}
                onDelete={() => deleteRelationship(idx)}
              />
            ))}
            <div
              className="flex items-center justify-center gap-2 p-3.5 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 text-gray-400 hover:text-emerald-600"
              onClick={() => sourceTables.length > 0 && addRelationship()}
            >
              <Plus size={14} />
              <span className="text-xs font-semibold">Add another relationship</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-100 pt-5 gap-3">
        <Button variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={onBack} disabled={busy}>Back</Button>
        <div className="flex flex-wrap gap-2.5 items-center">
          <Button
            variant="info"
            onClick={handleValidateAndPreview}
            disabled={hasLocalErrors || busy}
            loading={busy}
            leftIcon={!busy && <Eye size={14} />}
          >
            {busy ? 'Validating…' : preview ? 'Re-validate' : 'Validate & Preview'}
          </Button>
          {canProceed && (
            <Button onClick={onNext} rightIcon={<ArrowRight size={15} />}>Confirm Schema</Button>
          )}
          {preview && !canProceed && !busy && (
            <div className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-red-500" />
              <span className="text-xs text-red-500 font-medium">Fix errors to continue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
