'use client';

import { useState, useRef } from 'react';
import { CloudUpload, FileText, CheckCircle2, X, Network, AlertCircle, Info } from 'lucide-react';
import { BASE, ALLOWED_EXT, MAX_FILE_BYTES, authHdr, readErrMessages } from './helpers';
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
        // A 422 here carries the real reason (bad sheet, empty file, unparseable
        // SQL). Show the server's own wording rather than a generic sentence.
        const messages = await readErrMessages(res);
        setServerErr(
          res.status === 413
            ? 'File exceeds the 100 MB server limit'
            : messages.join(' \u00b7 ')
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
      <div className="mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Step 1</p>
        <h2 className="text-[17px] font-semibold text-slate-800 mt-0.5">Upload data file</h2>
        <p className="text-[13px] text-slate-500 mt-1">
          Upload a structured data file. Tables, columns and relationships are detected automatically.
        </p>
      </div>

      {sessionExpiredMsg && (
        <div className="mb-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2.5">
          <Info size={14} className="text-amber-600 shrink-0" />
          <p className="text-[13px] text-amber-800">Session expired \u2014 please re-upload your file.</p>
        </div>
      )}

      {/* Dropzone: previously a very tall empty box with a scaling coloured tile.
          It is now a compact horizontal band, so the supported-format reference
          below stays visible in the same viewport. */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setCheckedFile(e.dataTransfer.files[0]); }}
        onClick={() => !file && inputRef.current?.click()}
        role="button"
        tabIndex={file ? -1 : 0}
        onKeyDown={(e) => { if (!file && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); } }}
        aria-label="Upload data file"
        className={`rounded-lg border border-dashed transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30 ${
          file
            ? 'border-slate-200 bg-white cursor-default'
            : isDragging
              ? 'border-indigo-400 bg-indigo-50/60 cursor-pointer'
              : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50 cursor-pointer'
        }`}
      >
        {!file ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 px-5 py-8 sm:py-9">
            <div className="w-11 h-11 rounded-md border border-slate-200 bg-white flex items-center justify-center shrink-0">
              <CloudUpload size={20} className={isDragging ? 'text-indigo-600' : 'text-slate-400'} />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-[14px] font-semibold text-slate-800">
                {isDragging ? 'Release to upload' : 'Drag and drop a file, or browse'}
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">
                XLSX, XLS, CSV, ZIP or SQL \u00b7 up to 100 MB
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700">
              Browse files
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              <FileText size={17} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{file.name}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {(file.size / 1024 / 1024).toFixed(2)} MB \u00b7 ready to upload
              </p>
            </div>
            <IconBtn
              title="Remove file"
              onClick={(e) => { e.stopPropagation(); setFile(null); setClientErr(null); setServerErr(null); }}
              className="hover:!text-red-600 hover:!bg-red-50"
            >
              <X size={15} />
            </IconBtn>
          </div>
        )}
      </div>

      {!file && (
        <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden">
          <p className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Supported formats
          </p>
          <ul className="divide-y divide-slate-100">
            {formats.map((f) => (
              <li key={f.label} className="flex items-center gap-3 px-3.5 py-2">
                <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 w-14 text-center shrink-0">
                  {f.label}
                </span>
                <span className="text-[12px] text-slate-500">{f.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <div className="mt-4 p-3.5 bg-white border border-slate-200 rounded-md">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Spinner size={13} className="text-indigo-600" />
            <p className="text-[13px] font-semibold text-slate-800">Analysing file structure\u2026</p>
          </div>
          <ProgressBar />
          <p className="text-[11.5px] text-slate-500 mt-2">Detecting tables, columns and relationships</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-3">
        <p className="text-[11.5px] text-slate-500">
          {file ? 'Continue to detect the schema' : 'Select a file to begin'}
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
