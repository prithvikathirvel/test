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
    <div className="px-6 py-8 bg-[#fafafa] min-h-screen">
      {/* Minimal Header */}
      <div className="mb-8 flex items-center justify-between pb-4 border-b border-zinc-200/80">
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
          Knowledge graph
        </h1>
        <HealthBadge />
      </div>

      <div className="space-y-6">
        <ConnectionManager />

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
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
