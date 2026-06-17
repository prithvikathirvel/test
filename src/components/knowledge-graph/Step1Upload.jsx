'use client';

import { useState, useRef } from 'react';
import { CloudUpload, FileText, CheckCircle2, X, Network, AlertCircle, Info } from 'lucide-react';
import { BASE, ALLOWED_EXT, MAX_FILE_BYTES, authHdr, readErr } from './helpers';
import { Button, IconBtn, InfoRow, ProgressBar, Spinner } from './ui';

export default function Step1Upload({ onSuccess, sessionExpiredMsg }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [clientErr, setClientErr] = useState(null);
  const [serverErr, setServerErr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validate = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return `Unsupported format. Allowed: ${ALLOWED_EXT.join(', ')}`;
    if (f.size > MAX_FILE_BYTES) return `File is ${(f.size / 1024 / 1024).toFixed(1)} MB — exceeds 100 MB limit`;
    return null;
  };

  const setCheckedFile = (f) => {
    const err = validate(f);
    setClientErr(err); setServerErr(null);
    if (!err) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setServerErr(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE}/upload`, { method: 'POST', headers: authHdr(), body: form });
      if (!res.ok) {
        const body = await readErr(res);
        setServerErr(
          res.status === 422 ? body.error || 'File has wrong format or no data'
          : res.status === 413 ? 'File exceeds the 100 MB server limit'
          : body.error || `Upload failed (${res.status})`
        );
        return;
      }
      const data = await res.json();
      sessionStorage.setItem('cmdb_upload_id', data.upload_id);
      onSuccess(data);
    } catch {
      setServerErr('Network error — could not reach the server.');
    } finally {
      setUploading(false);
    }
  };

  const formats = [
    { label: 'XLSX', note: 'Multi-sheet Excel' },
    { label: 'XLS', note: 'Legacy Excel' },
    { label: 'CSV', note: 'Comma/semicolon' },
    { label: 'ZIP', note: 'Multiple files' },
    { label: 'SQL', note: 'DDL / INSERT' },
  ];

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-lg sm:text-xl mb-1">Upload Data File</h2>
      <p className="text-sm text-gray-400 mb-6">
        Upload a structured data file. We&apos;ll auto-detect nodes, properties and relationships.
      </p>

      {sessionExpiredMsg && (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
          <Info size={14} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">Session expired — please re-upload your file.</p>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setCheckedFile(e.dataTransfer.files[0]); }}
        onClick={() => !file && inputRef.current?.click()}
        className={`transition-all duration-200 rounded-2xl border-2 border-dashed cursor-pointer ${
          isDragging ? 'border-blue-400 bg-blue-50/80' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
        }`}
      >
        <div className="flex flex-col items-center py-10 sm:py-14 lg:py-16 gap-4 px-4">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'
          }`}>
            <CloudUpload size={30} className={isDragging ? 'text-blue-500' : 'text-gray-300'} />
          </div>

          {!file ? (
            <>
              <div className="text-center">
                <p className="font-semibold text-gray-600 text-sm sm:text-base mb-1">
                  {isDragging ? 'Release to upload' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-400">
                  or <span className="text-blue-600 font-semibold cursor-pointer hover:underline">browse files</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {formats.map((f) => (
                  <span
                    key={f.label}
                    title={f.note}
                    className="text-[11px] font-semibold bg-white text-gray-500 px-2.5 py-1 rounded-full cursor-default border border-gray-200 shadow-sm"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-300">Max 100 MB</p>
            </>
          ) : (
            <div className="flex items-center gap-4 bg-white border border-emerald-200 rounded-xl px-4 sm:px-5 py-3.5 shadow-sm w-full max-w-sm sm:max-w-md">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={20} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-700 truncate text-sm">{file.name}</p>
                <p className="text-[11px] text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · ready to upload
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <IconBtn title="Remove" onClick={(e) => { e.stopPropagation(); setFile(null); setClientErr(null); setServerErr(null); }}>
                  <X size={14} className="text-gray-400" />
                </IconBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef} type="file" hidden
        accept=".csv,.xlsx,.xls,.sql,.zip"
        onChange={(e) => { if (e.target.files?.[0]) setCheckedFile(e.target.files[0]); e.target.value = ''; }}
      />

      {(clientErr || serverErr) && (
        <div className="mt-4">
          <InfoRow icon={AlertCircle}>{clientErr || serverErr}</InfoRow>
        </div>
      )}

      {uploading && (
        <div className="mt-5 p-4 bg-blue-50/80 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Spinner size={14} className="text-blue-600" />
            <p className="font-semibold text-blue-700 text-sm">Analysing file structure…</p>
          </div>
          <ProgressBar />
          <p className="text-[11px] text-blue-500/70 mt-2.5">Detecting tables, columns and relationships</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-3">
        <p className="text-[11px] text-gray-300">
          {file ? 'Click Upload & Analyse to continue' : 'Select a file to begin'}
        </p>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || !!clientErr}
          loading={uploading}
          leftIcon={!uploading && <Network size={15} />}
        >
          {uploading ? 'Uploading…' : 'Upload & Analyse'}
        </Button>
      </div>
    </div>
  );
}
