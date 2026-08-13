"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import {
    CloudUpload,
    Search,
    Trash2,
    FileText,
    AlertCircle,
    Upload,
    FolderOpen,
    Database,
    CheckCircle2,
    X,
    BookOpen,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "@/components/Common/CustomButton";
import InputBox from "@/components/Common/InputBox";
import KnowledgeListingTableView from "@/components/knowledge/KnowledgeListingTableView";
import { bytesToSize } from "@/utils/commonFunction";
import {
    fetchKnowledgeSources,
    uploadKnowledgeSource,
    selectKnowledgeSources,
    selectKnowledgeLoading,
    selectKnowledgeError,
    selectUploadStatus,
    resetUploadStatus,
    deleteKnowledgeSource
} from "@/redux/slices/knowledgeSlice";

const ALLOWED_SETTINGS_EXTENSIONS_FOR_CHUNKING = ['pdf', 'docx', 'txt', 'md'];

const ACCEPTED_FORMATS = ['PDF', 'DOCX', 'TXT', 'MD', 'JSON', 'CSV'];

/**
 * Knowledge base workspace.
 *
 * Redesign intent:
 * - Two-column workspace instead of a vertical stack of large cards. The
 *   library (the thing users come here to read) owns the main column; ingestion
 *   is a persistent side rail, so uploading no longer pushes the table off
 *   screen.
 * - Neutral by default. The previous version tinted every file type a
 *   different colour, which made the page read as a palette rather than a
 *   catalogue. Format is now a monospace token; the only colour left carries
 *   state (indexing status, validation, destructive actions).
 * - Summary strip gives the operational read (total / indexed / staged) that an
 *   enterprise user checks first.
 *
 * All data flow (redux thunks, payload shape, validation) is unchanged.
 */
const KnowledgePage = () => {
    const dispatch = useDispatch();
    const [searchKnowledge, setSearchKnowledge] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // File State
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Selectors
    const sources = useSelector(selectKnowledgeSources);
    const loading = useSelector(selectKnowledgeLoading);
    const error = useSelector(selectKnowledgeError);
    const uploadStatus = useSelector(selectUploadStatus);

    useEffect(() => {
        dispatch(fetchKnowledgeSources());
        return () => { dispatch(resetUploadStatus()); };
    }, [dispatch]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const processFiles = (files) => {
        return Array.from(files).map(file => {
            const name = file.name;
            const lastDotIndex = name.lastIndexOf('.');
            const extension = lastDotIndex !== -1 ? name.substring(lastDotIndex + 1).toLowerCase() : 'txt';
            const nameWithoutExt = lastDotIndex !== -1 ? name.substring(0, lastDotIndex) : name;

            return {
                file: file,
                knowledgeBaseName: nameWithoutExt,
                extension: extension,
                chunkWord: "",
            };
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
        // Same reasoning as handleFileInput: read the DataTransfer synchronously,
        // because it is cleared once the drop event finishes dispatching.
        const staged = processFiles(e.dataTransfer.files);
        if (staged.length === 0) return;
        setSelectedFiles(prev => [...prev, ...staged]);
    };

    const handleFileInput = (e) => {
        const input = e.target;
        if (!input.files || input.files.length === 0) return;

        // A FileList is a *live* view of the input. `processFiles` used to be
        // called inside the state updater, which React runs asynchronously —
        // by then `input.value = ''` had already emptied the list, so nothing
        // was staged and the upload button never appeared. Snapshot first,
        // reset the input second, then queue the update.
        const staged = processFiles(input.files);
        input.value = '';
        if (staged.length === 0) return;
        setSelectedFiles(prev => [...prev, ...staged]);
    };

    const handleFieldChange = (index, field, value) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles[index] = { ...updatedFiles[index], [field]: value };
        setSelectedFiles(updatedFiles);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        // Clear the native input too: re-selecting the *same* filename after a
        // removal is a no-op otherwise, because the input's value never changes
        // and the browser fires no `change` event.
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !isFormValid) return;

        try {
            const payload = {
                files: selectedFiles.map(f => f.file),
                knowledge_base_names: selectedFiles.map(f => f.knowledgeBaseName),
                content_types: selectedFiles.map(f => f.extension),
                chunk_words: selectedFiles.map(f => f.chunkWord),
            };

            await dispatch(uploadKnowledgeSource(payload)).unwrap();
            setSelectedFiles([]);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleDeleteKnowledge = (id) => {
        dispatch(deleteKnowledgeSource(id));
    };

    const filteredSources = useMemo(() => {
        if (!searchKnowledge) return sources;
        return sources.filter(source =>
            source.filename.toLowerCase().includes(searchKnowledge.toLowerCase())
        );
    }, [sources, searchKnowledge]);

    // Validation Check: ensure all files have a mapped Knowledge Base Name
    const isFormValid = selectedFiles.length > 0
        && selectedFiles.every(file => file.knowledgeBaseName.trim() !== "");

    const indexedCount = useMemo(
        () => sources.filter((s) => (s.status || "Indexed").toLowerCase() === "indexed").length,
        [sources]
    );

    const isUploading = uploadStatus === 'loading';

    return (
        <Box className="min-h-screen bg-[#f8fafc]">
            <Box className="px-6 lg:px-5 py-5">
                <PageHeader
                    icon={BookOpen}
                    title="Knowledge Base"
                    description="Documents indexed for agent retrieval"
                />

                {/* Summary strip: three plain figures, no tinted cards. */}
                <Box className="mb-5 grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
                    {[
                        { label: "Total sources", value: sources.length, Icon: Database },
                        { label: "Indexed", value: indexedCount, Icon: CheckCircle2 },
                        { label: "Staged", value: selectedFiles.length, Icon: Upload },
                    ].map(({ label, value, Icon }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-3">
                            <span className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
                                <Icon size={15} />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    {label}
                                </span>
                                <span className="block text-[17px] font-bold leading-tight text-slate-800">
                                    {value}
                                </span>
                            </span>
                        </div>
                    ))}
                </Box>

                {/* ---------------- Workspace ---------------- */}
                <Box className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-5 items-start">
                    {/* ===== Main column: the library ===== */}
                    <Box className="min-w-0 rounded-lg border border-slate-200 bg-white">
                        <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                                    Sources
                                </h2>
                                <span className="text-[11px] font-medium text-slate-400">
                                    {filteredSources.length}
                                    {searchKnowledge ? ` of ${sources.length}` : ""}
                                </span>
                            </div>

                            <InputBox
                                placeholder="Search sources..."
                                value={searchKnowledge}
                                isShowLabel={false}
                                height="34px"
                                onChange={setSearchKnowledge}
                                className="w-full sm:w-64 bg-white"
                                icon={<Search className="text-slate-400" size={15} />}
                            />
                        </Box>

                        {loading && sources.length === 0 ? (
                            <Box className="flex flex-col items-center justify-center py-16">
                                <CircularProgress size={26} sx={{ color: '#4f46e5' }} />
                                <p className="text-xs text-slate-400 mt-3">Loading sources...</p>
                            </Box>
                        ) : error ? (
                            <Box className="m-4 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3">
                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-px" />
                                <div className="min-w-0">
                                    <p className="text-[12.5px] font-semibold text-red-700">
                                        Could not load sources
                                    </p>
                                    <p className="text-[11.5px] text-red-600/90 break-words">{error}</p>
                                </div>
                            </Box>
                        ) : filteredSources.length > 0 ? (
                            <KnowledgeListingTableView
                                filteredFlows={filteredSources}
                                handleOpenStudio={(row) => console.log("Open", row)}
                                handleDeleteKnowledge={handleDeleteKnowledge}
                            />
                        ) : (
                            <Box className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <span className="h-11 w-11 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center mb-3">
                                    <FileText size={20} className="text-slate-400" />
                                </span>
                                <p className="text-[13px] font-semibold text-slate-700">
                                    {searchKnowledge ? "No matching sources" : "No sources yet"}
                                </p>
                                <p className="text-[11.5px] text-slate-400 mt-1 max-w-xs">
                                    {searchKnowledge
                                        ? "Try a different search term."
                                        : "Add documents from the ingestion panel to make them available to your agents."}
                                </p>
                            </Box>
                        )}
                    </Box>

                    {/* ===== Side rail: ingestion ===== */}
                    <Box className="rounded-lg border border-slate-200 bg-white lg:sticky lg:top-5 flex flex-col lg:max-h-[calc(100vh-2.5rem)]">
                        <Box className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 shrink-0">
                            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                                Add documents
                            </h2>
                            {selectedFiles.length > 0 && (
                                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                    {selectedFiles.length} staged
                                </span>
                            )}
                        </Box>

                        <Box className="p-4 min-h-0 overflow-y-auto">
                            {/* Compact dropzone — a form control, not a hero panel. */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`rounded-md border border-dashed px-4 py-6 text-center transition-colors ${
                                    isDragging
                                        ? "border-indigo-400 bg-indigo-50/50"
                                        : "border-slate-300 bg-slate-50/60 hover:border-slate-400"
                                }`}
                            >
                                <CloudUpload
                                    size={22}
                                    className={isDragging ? "text-indigo-500 mx-auto" : "text-slate-400 mx-auto"}
                                />
                                <p className="mt-2 text-[12.5px] font-semibold text-slate-700">
                                    {isDragging ? "Drop to stage files" : "Drag files here"}
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="fileUpload"
                                    hidden
                                    accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
                                    onChange={handleFileInput}
                                    multiple
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                                >
                                    <FolderOpen size={13} /> Browse
                                </button>

                                <p className="mt-3 text-[10px] font-mono text-slate-400">
                                    {ACCEPTED_FORMATS.join(" · ")}
                                </p>
                                <p className="text-[10px] text-slate-400">Max 15MB per file</p>
                            </div>

                            {/* Staged files */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            Staged ({selectedFiles.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFiles([])}
                                            disabled={isUploading}
                                            className="text-[11px] font-medium text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </div>

                                    <div className="space-y-2.5">
                                        {selectedFiles.map((item, index) => {
                                            const invalid = item.knowledgeBaseName.trim() === "";
                                            return (
                                                <div
                                                    key={index}
                                                    className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-0.5 shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9.5px] font-mono font-semibold uppercase text-slate-500">
                                                            {item.extension}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-[12px] font-medium text-slate-700 truncate">
                                                                {item.file?.name}
                                                            </span>
                                                            <span className="block text-[10.5px] text-slate-400">
                                                                {bytesToSize(item.file?.size || 0)}
                                                            </span>
                                                        </span>
                                                        <Tooltip title="Remove file" arrow>
                                                            <button
                                                                type="button"
                                                                aria-label={`Remove ${item.file?.name}`}
                                                                onClick={() => handleRemoveFile(index)}
                                                                className="shrink-0 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </Tooltip>
                                                    </div>

                                                    <div className={`mt-2 grid gap-2 ${
                                                        ALLOWED_SETTINGS_EXTENSIONS_FOR_CHUNKING.includes(item.extension)
                                                            ? "grid-cols-1 sm:grid-cols-2"
                                                            : "grid-cols-1"
                                                    }`}>
                                                        <InputBox
                                                            label="Knowledge base name *"
                                                            value={item.knowledgeBaseName}
                                                            onChange={(val) => handleFieldChange(index, 'knowledgeBaseName', val)}
                                                            className="w-full bg-white"
                                                            height="32px"
                                                            icon={null}
                                                            error={invalid}
                                                        />

                                                        {ALLOWED_SETTINGS_EXTENSIONS_FOR_CHUNKING.includes(item.extension) && (
                                                            <InputBox
                                                                label="Chunk word (optional)"
                                                                value={item.chunkWord}
                                                                onChange={(val) => handleFieldChange(index, 'chunkWord', val)}
                                                                className="w-full bg-white"
                                                                height="32px"
                                                                icon={null}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {selectedFiles.length > 0 && !isFormValid && (
                                        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2">
                                            <AlertCircle size={13} className="text-amber-600 shrink-0 mt-px" />
                                            <p className="text-[11px] font-medium text-amber-700">
                                                Every file needs a knowledge base name.
                                            </p>
                                        </div>
                                    )}

                                    <CustomButton
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={
                                            isUploading
                                                ? <CircularProgress size={13} color="inherit" />
                                                : <CloudUpload size={15} />
                                        }
                                        onClick={handleUpload}
                                        disabled={isUploading || !isFormValid}
                                        className="!mt-3 !rounded-md !text-[13px]"
                                    >
                                        {isUploading
                                            ? 'Uploading...'
                                            : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'file' : 'files'}`}
                                    </CustomButton>
                                </div>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default KnowledgePage;
