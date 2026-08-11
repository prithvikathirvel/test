'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Waypoints } from 'lucide-react';
import {
  setStep, setUploadSession,
  clearSession, setSessionExpired, resetWizard,
} from '@/redux/slices/knowledgeGraphSlice';
import { BASE, authHdr, normalizeProposal, normalizeSampleData } from '@/components/knowledge-graph/helpers';
import { ConnectionManager, StepIndicator, HealthBadge, Step1Upload, Step2Schema, Step3Confirm, GraphListing } from '@/components/knowledge-graph';

/* ─── Page Root ──────────────────────────────────────────────────── */

export default function KnowledgeGraphPage() {
  const dispatch = useDispatch();
  const { step, uploadSession, sessionExpired } = useSelector((s) => s.knowledgeGraph);
  const [listingKey, setListingKey] = useState(0);

  useEffect(() => {
    const id = sessionStorage.getItem('cmdb_upload_id');
    if (!id) return;
    fetch(`${BASE}/upload/${id}`, { headers: authHdr() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { sessionStorage.removeItem('cmdb_upload_id'); return; }
        const proposal = normalizeProposal(data?.proposal);
        if (proposal.entities.length > 0 || proposal.relationships.length > 0) {
          dispatch(setUploadSession({ uploadId: id, proposal, sampleData: normalizeSampleData(data?.sample_data) }));
          dispatch(setStep(2));
        } else {
          sessionStorage.removeItem('cmdb_upload_id');
        }
      })
      .catch(() => sessionStorage.removeItem('cmdb_upload_id'));
  }, [dispatch]);

  const handleUploadDone = (data) => {
    const proposal = normalizeProposal(data?.proposal);
    dispatch(setUploadSession({ uploadId: data?.upload_id, proposal, sampleData: normalizeSampleData(data?.sample_data) }));
    dispatch(setStep(2));
  };

  const handleSessionExpired = () => {
    sessionStorage.removeItem('cmdb_upload_id');
    dispatch(setSessionExpired());
  };

  const cancelSession = () => {
    if (uploadSession?.uploadId) {
      fetch(`${BASE}/upload/${uploadSession.uploadId}`, { method: 'DELETE', headers: authHdr() }).catch(() => {});
    }
    sessionStorage.removeItem('cmdb_upload_id');
    dispatch(clearSession());
  };

  const handleReset = () => {
    if (uploadSession?.uploadId) {
      fetch(`${BASE}/upload/${uploadSession.uploadId}`, { method: 'DELETE', headers: authHdr() }).catch(() => {});
    }
    sessionStorage.removeItem('cmdb_upload_id');
    dispatch(resetWizard());
    setListingKey((k) => k + 1);
  };

  return (
    <div className="px-6 lg:px-8 py-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Platform</span>
            <span>/</span>
            <span className="text-slate-700">Knowledge Graph</span>
          </div>
          <h1 className="font-bold text-slate-800 leading-tight text-2xl">Knowledge Graph</h1>
          <p className="text-xs text-slate-400 mt-0.5">Model structured data into entity-relationship graphs for agent retrieval</p>
        </div>
        <HealthBadge />
      </div>

      <div className="mx-auto">
        <ConnectionManager />

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-8 lg:p-10">
          <StepIndicator current={step} />

          {step === 1 && (
            <Step1Upload onSuccess={handleUploadDone} sessionExpiredMsg={sessionExpired} />
          )}
          {step === 2 && uploadSession && (
            <Step2Schema
              session={uploadSession}
              onBack={cancelSession}
              onNext={() => dispatch(setStep(3))}
              onSessionExpired={handleSessionExpired}
            />
          )}
          {step === 3 && uploadSession && (
            <Step3Confirm
              session={uploadSession}
              onBack={() => dispatch(setStep(2))}
              onSessionExpired={handleSessionExpired}
              onReset={handleReset}
              onIngestComplete={() => setListingKey((k) => k + 1)}
            />
          )}
        </div>

        <GraphListing refreshTrigger={listingKey} />
      </div>
    </div>
  );
}
