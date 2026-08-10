"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress, IconButton, Tooltip, Chip } from "@mui/material";
import { CloudUpload, Search, Trash2, FileText, AlertCircle, Database, FolderOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "@/components/Common/CustomButton";
import InputBox from "@/components/Common/InputBox";
import KnowledgeListingTableView from "@/components/knowledge/KnowledgeListingTableView";
import DashedBox from "@/components/Common/DashedBox";
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

const FILE_TYPE_COLORS = {
    pdf: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' },
    docx: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
    doc: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
    txt: { bg: 'bg-zinc-100', border: 'border-zinc-200', text: 'text-zinc-700' },
    md: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
    json: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
    csv: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
};

const getFileTypeStyle = (ext) => FILE_TYPE_COLORS[ext] || { bg: 'bg-zinc-100', border: 'border-zinc-200', text: 'text-zinc-700' };

const KnowledgePage = () => {
    const dispatch = useDispatch();
    const [searchKnowledge, setSearchKnowledge] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

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
        if (e.dataTransfer.files.length > 0) {
            setSelectedFiles(prev => [...prev, ...processFiles(e.dataTransfer.files)]);
        }
    };

    const handleFileInput = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setSelectedFiles(prev => [...prev, ...processFiles(e.target.files)]);
        e.target.value = '';
    };

    const handleFieldChange = (index, field, value) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles[index] = { ...updatedFiles[index], [field]: value };
        setSelectedFiles(updatedFiles);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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

    const isFormValid = selectedFiles.every(file => file.knowledgeBaseName.trim() !== "");

    return (
        <Box className="min-h-screen bg-[#fafafa] px-6 py-8">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80">
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
                    Knowledge sources
                </h1>
                <span className="text-xs text-zinc-500">
                    PDF, DOCX, TXT, MD, CSV — up to 25 MB per file
                </span>
            </div>

            {/* Minimal Upload Section */}
            <Box className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
                <Box className="p-6">
                    <DashedBox
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`transition-all duration-150 ease-in-out !rounded-xl ${
                            isDragging
                                ? '!bg-zinc-100 !border-zinc-500'
                                : '!bg-zinc-50/50 !border-zinc-200 hover:!border-zinc-400'
                        }`}
                    >
                        <Box className="flex flex-col items-center justify-center py-10 px-6 text-center">
                            <Box className="p-3 rounded-xl bg-zinc-100 mb-3">
                                <CloudUpload size={22} className="text-zinc-700" />
                            </Box>
                            <Typography className="!text-sm !font-semibold !text-zinc-900 !mb-1">
                                {isDragging ? 'Release to upload' : 'Add your knowledge sources'}
                            </Typography>
                            <Typography className="!text-xs !text-zinc-500 !mb-4">
                                Drop files here or click to browse
                            </Typography>
                            <Box className="flex flex-col items-center gap-3">
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
                                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors"
                                >
                                    Browse files
                                </button>
                            </Box>
                        </Box>
                    </DashedBox>
                </Box>
            </Box>

            {/* Pending Files Queue */}
            {selectedFiles.length > 0 && (
                <Box className="bg-white mb-8 rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <Box className="flex justify-between items-center px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
                        <span className="text-xs font-semibold text-zinc-900">
                            Configure files ({selectedFiles.length})
                        </span>
                    </Box>

                    <Box className="max-h-[320px] overflow-y-auto divide-y divide-zinc-100">
                        {selectedFiles.map((item, index) => {
                            const typeStyle = getFileTypeStyle(item.extension);
                            return (
                                <Box
                                    key={index}
                                    className="flex flex-col lg:flex-row items-start lg:items-center px-5 py-3 gap-4"
                                >
                                    <Box className="flex items-center gap-2.5 w-full lg:w-[260px] shrink-0">
                                        <Box className={`p-2 rounded-lg ${typeStyle.bg}`}>
                                            <FileText size={16} className={typeStyle.text} />
                                        </Box>
                                        <Box className="overflow-hidden flex-1">
                                            <Typography className="!font-medium !text-zinc-900 truncate !text-xs" title={item.file.name}>
                                                {item.file.name}
                                            </Typography>
                                            <Typography className="!text-zinc-400 !text-[10px]">
                                                {item.file.size ? bytesToSize(item.file.size) : '--'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box className="flex flex-col sm:flex-row gap-2.5 w-full lg:flex-grow">
                                        <InputBox
                                            label="Knowledge Base Name *"
                                            value={item.knowledgeBaseName}
                                            onChange={(val) => handleFieldChange(index, 'knowledgeBaseName', val)}
                                            className="w-full bg-white"
                                            icon={null}
                                            error={item.knowledgeBaseName.trim() === ""}
                                        />

                                        {ALLOWED_SETTINGS_EXTENSIONS_FOR_CHUNKING.includes(item.extension) && (
                                            <InputBox
                                                label="Chunk Token (Optional)"
                                                value={item.chunkWord}
                                                onChange={(val) => handleFieldChange(index, 'chunkWord', val)}
                                                className="bg-white sm:max-w-[160px]"
                                                icon={null}
                                            />
                                        )}
                                    </Box>

                                    <Tooltip title="Remove file" arrow>
                                        <IconButton
                                            onClick={() => handleRemoveFile(index)}
                                            size="small"
                                            className="!text-zinc-400 hover:!text-red-600"
                                        >
                                            <Trash2 size={15} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box className="flex items-center justify-between px-5 py-3 bg-zinc-50/60 border-t border-zinc-100">
                        <Box>
                            {!isFormValid && (
                                <span className="text-xs text-amber-600">
                                    All files need a Knowledge Base Name
                                </span>
                            )}
                        </Box>
                        <Box className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedFiles([])}
                                disabled={uploadStatus === 'loading'}
                                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-medium"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploadStatus === 'loading' || !isFormValid}
                                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium"
                            >
                                {uploadStatus === 'loading' ? 'Uploading...' : 'Upload'}
                            </button>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Existing Sources Section */}
            <Box className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                <Box className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-semibold text-zinc-900">
                        Existing sources ({sources.length})
                    </span>

                    <Box className="w-64">
                        <InputBox
                            placeholder="Search sources..."
                            value={searchKnowledge}
                            isShowLabel={false}
                            height="36px"
                            onChange={setSearchKnowledge}
                            icon={<Search className="text-zinc-400" size={14} />}
                        />
                    </Box>
                </Box>

                {loading && sources.length === 0 ? (
                    <Box className="flex flex-col items-center justify-center py-12">
                        <CircularProgress size={24} sx={{ color: '#18181b' }} />
                        <Typography className="!text-xs !text-zinc-500 !mt-2">Loading…</Typography>
                    </Box>
                ) : error ? (
                    <Box className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <Typography className="!text-xs !font-medium">Error: {error}</Typography>
                    </Box>
                ) : (
                    <>
                        {filteredSources.length > 0 ? (
                            <Box className="rounded-lg border border-zinc-200 overflow-hidden">
                                <KnowledgeListingTableView
                                    filteredFlows={filteredSources}
                                    handleOpenStudio={(row) => console.log("Open", row)}
                                    handleDeleteKnowledge={handleDeleteKnowledge}
                                />
                            </Box>
                        ) : (
                            <Box className="flex flex-col items-center justify-center py-12 text-center">
                                <Typography className="!text-sm !font-semibold !text-zinc-900">No sources found</Typography>
                                <Typography className="!text-xs !text-zinc-500 !mt-1">
                                    {searchKnowledge ? 'No matches' : 'Upload files above to start'}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default KnowledgePage;
