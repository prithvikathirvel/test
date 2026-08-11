"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress, IconButton, Tooltip, TextField, Chip } from "@mui/material";
import { CloudUpload, Search, Trash2, FileText, AlertCircle, Database, Upload, FolderOpen } from "lucide-react";
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
    txt: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
    md: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
    json: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
    csv: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' },
};

const getFileTypeStyle = (ext) => FILE_TYPE_COLORS[ext] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' };

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

    // Validation Check: ensure all files have a mapped Knowledge Base Name
    const isFormValid = selectedFiles.every(file => file.knowledgeBaseName.trim() !== "");

    return (
        <Box className="px-6 lg:px-10 py-8 bg-[#f8fafc] min-h-screen">
            {/* Page Header */}
            <Box className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                        <span>Platform</span>
                        <span>/</span>
                        <span className="text-slate-700">Knowledge Base</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
                        Documents & Sources
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {sources.length} Total
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Upload and manage domain documents for agent RAG retrieval.
                    </p>
                </div>
            </Box>

            {/* Upload Section */}
            <Box className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden mb-8">
                <Box className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                    <Box className="flex items-center gap-2">
                        <Upload size={16} className="text-slate-500" />
                        <Typography variant="subtitle2" className="!font-bold !text-slate-800 !text-xs !uppercase !tracking-wider">
                            Upload Documents
                        </Typography>
                    </Box>
                </Box>

                <Box className="p-6">
                    <DashedBox
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`transition-all duration-200 !rounded-xl ${isDragging
                                ? '!bg-indigo-50/40 !border-indigo-400'
                                : '!bg-slate-50/50 !border-slate-200 hover:!border-slate-300'
                            }`}
                    >
                        <Box className="flex flex-col items-center justify-center py-10 px-6 text-center">
                            <Box className="p-4 rounded-xl bg-white border border-slate-200/80 mb-3 shadow-2xs">
                                <CloudUpload size={26} className="text-slate-600" />
                            </Box>
                            <Typography variant="subtitle1" className="!font-bold !text-slate-800 !text-sm !mb-1">
                                {isDragging ? 'Drop files to upload' : 'Drag & drop document files here'}
                            </Typography>
                            <Typography variant="body2" className="!text-slate-400 !text-xs !mb-4">
                                or browse files from your computer
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
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                                >
                                    <FolderOpen size={14} /> Browse Files
                                </button>
                                <Box className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                                    {['PDF', 'DOCX', 'TXT', 'MD', 'JSON', 'CSV'].map((format) => (
                                        <span
                                            key={format}
                                            className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400 bg-white border border-slate-200"
                                        >
                                            {format}
                                        </span>
                                    ))}
                                    <span className="text-[10px] text-slate-400 ml-1">
                                        Max 15MB
                                    </span>
                                </Box>
                            </Box>
                        </Box>
                    </DashedBox>
                </Box>
            </Box>

            {/* Pending Files Configuration */}
            {selectedFiles.length > 0 && (
                <Box className="bg-white mt-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Box className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
                        <Box className="flex items-center gap-3">
                            <Box className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText size={16} className="text-blue-600" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" className="!font-semibold !text-gray-800">
                                    Configure Uploads
                                </Typography>
                                <Typography variant="caption" className="!text-slate-400">
                                    Set a knowledge base name for each file
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={`${selectedFiles.length} ${selectedFiles.length === 1 ? 'file' : 'files'} ready`}
                            size="small"
                            sx={{
                                bgcolor: '#eff6ff',
                                color: '#1d4ed8',
                                fontWeight: 600,
                                fontSize: '12px',
                            }}
                        />
                    </Box>

                    <Box className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                        {selectedFiles.map((item, index) => {
                            const typeStyle = getFileTypeStyle(item.extension);
                            return (
                                <Box
                                    key={index}
                                    className="flex flex-col lg:flex-row items-start lg:items-center px-6 py-4 hover:bg-slate-25 transition-colors gap-4 group"
                                >
                                    {/* File Info */}
                                    <Box className="flex items-center gap-3 w-full lg:w-[280px] shrink-0">
                                        <Box className={`p-2.5 rounded-lg ${typeStyle.bg} border ${typeStyle.border}`}>
                                            <FileText size={20} className={typeStyle.text} />
                                        </Box>
                                        <Box className="overflow-hidden flex-1">
                                            <Typography variant="body2" className="!font-semibold !text-gray-800 truncate !text-[13px]" title={item.file.name}>
                                                {item.file.name}
                                            </Typography>
                                            <Box className="flex items-center gap-2 mt-0.5">
                                                <Typography variant="caption" className="!text-slate-400 !text-[11px]">
                                                    {item.file.size ? bytesToSize(item.file.size) : '--'}
                                                </Typography>
                                                <Box className="w-1 h-1 rounded-full bg-slate-300" />
                                                <Chip
                                                    label={item.extension.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        height: '18px',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        bgcolor: typeStyle.bg.replace('bg-', '').includes('red') ? '#fef2f2' :
                                                            typeStyle.bg.replace('bg-', '').includes('blue') ? '#eff6ff' :
                                                                typeStyle.bg.replace('bg-', '').includes('purple') ? '#faf5ff' :
                                                                    typeStyle.bg.replace('bg-', '').includes('amber') ? '#fffbeb' :
                                                                        typeStyle.bg.replace('bg-', '').includes('green') ? '#f0fdf4' : '#f8fafc',
                                                        color: typeStyle.text.replace('text-', '').includes('red') ? '#dc2626' :
                                                            typeStyle.text.replace('text-', '').includes('blue') ? '#2563eb' :
                                                                typeStyle.text.replace('text-', '').includes('purple') ? '#7c3aed' :
                                                                    typeStyle.text.replace('text-', '').includes('amber') ? '#d97706' :
                                                                        typeStyle.text.replace('text-', '').includes('green') ? '#16a34a' : '#475569',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Input Fields */}
                                    <Box className="flex flex-col sm:flex-row gap-3 w-full lg:flex-grow">
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
                                                label="Chunk Word (Optional)"
                                                value={item.chunkWord}
                                                onChange={(val) => handleFieldChange(index, 'chunkWord', val)}
                                                className="bg-white sm:max-w-[180px]"
                                                icon={null}
                                            />
                                        )}
                                    </Box>

                                    {/* Delete Action */}
                                    <Tooltip title="Remove file" arrow>
                                        <IconButton
                                            onClick={() => handleRemoveFile(index)}
                                            size="small"
                                            className="!text-gray-300 hover:!text-red-500 hover:!bg-red-50 !opacity-0 group-hover:!opacity-100 !transition-all shrink-0"
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-gray-100">
                        <Box>
                            {!isFormValid && (
                                <Box className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                                    <AlertCircle size={14} />
                                    <Typography variant="caption" className="!font-medium !text-[12px]">
                                        All files need a Knowledge Base Name
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Box className="flex gap-2.5">
                            <CustomButton
                                variant="outlined"
                                onClick={() => setSelectedFiles([])}
                                disabled={uploadStatus === 'loading'}
                                className="!bg-white !text-gray-500 !border-gray-200 hover:!bg-gray-50 !rounded-lg !text-[13px]"
                            >
                                Clear All
                            </CustomButton>
                            <CustomButton
                                variant="contained"
                                color="primary"
                                startIcon={uploadStatus === 'loading' ? <CircularProgress size={14} color="inherit" /> : <CloudUpload size={16} />}
                                onClick={handleUpload}
                                disabled={uploadStatus === 'loading' || !isFormValid}
                                className="!px-5 !rounded-lg !shadow-md !shadow-blue-200/30"
                            >
                                {uploadStatus === 'loading' ? 'Uploading...' : 'Upload All'}
                            </CustomButton>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Existing Sources Section */}
            <Box className="mt-10">
                <Box className="flex items-center justify-between mb-5">
                    <Box className="flex items-center gap-2">
                        <Typography variant="subtitle1" className="!font-bold !text-gray-800">
                            Existing Sources
                        </Typography>
                        {sources.length > 0 && (
                            <Chip
                                label={sources.length}
                                size="small"
                                sx={{
                                    height: '20px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    bgcolor: '#f1f5f9',
                                    color: '#475569',
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {loading && sources.length === 0 ? (
                    <Box className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                        <CircularProgress size={32} sx={{ color: 'var(--primary-color)' }} />
                        <Typography variant="body2" className="!text-slate-400 !mt-3">Loading sources...</Typography>
                    </Box>
                ) : error ? (
                    <Box className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl mt-2">
                        <AlertCircle size={18} className="text-red-500 shrink-0" />
                        <Typography variant="body2" className="!font-medium">Error loading sources: {error}</Typography>
                    </Box>
                ) : (
                    <>
                        <Box className="mb-4">
                            <InputBox
                                placeholder="Search sources..."
                                value={searchKnowledge}
                                isShowLabel={false}
                                height="42px"
                                onChange={setSearchKnowledge}
                                className="w-full md:w-80 bg-white"
                                icon={<Search className='text-gray-400' size={18} />}
                            />
                        </Box>

                        {filteredSources.length > 0 ? (
                            <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <KnowledgeListingTableView
                                    filteredFlows={filteredSources}
                                    handleOpenStudio={(row) => console.log("Open", row)}
                                    handleDeleteKnowledge={handleDeleteKnowledge}
                                />
                            </Box>
                        ) : (
                            <Box className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                                <Box className="p-4 rounded-2xl bg-slate-50 mb-4">
                                    <FileText size={32} className="text-slate-300" />
                                </Box>
                                <Typography variant="subtitle2" className="!text-gray-500 !font-semibold">No sources found</Typography>
                                <Typography variant="caption" className="!text-slate-400 !mt-1">
                                    {searchKnowledge ? 'Try a different search term' : 'Upload files above to get started'}
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