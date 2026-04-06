"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress, IconButton, Tooltip, TextField } from "@mui/material";
import { CloudUpload, Search, Trash2, FileText, AlertCircle } from "lucide-react";
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
                knowledgeBaseName: nameWithoutExt, // Pre-fill with filename, user edits this inline
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
        e.target.value = ''; // Reset input to allow re-uploading the same file if needed
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
        <Box className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
            <Box className="mb-10">
                <Typography variant="h4" className="!font-bold text-gray-800">Manage Knowledge Resources</Typography>
                <Typography variant="body1" className="text-slate-500 mt-1">
                    Upload documents to train your AI or manage existing knowledge base entries.
                </Typography>
            </Box>

            <Box>
                <Typography variant="h6" className="!font-bold !mb-4 text-gray-700">Upload Sources</Typography>
                <DashedBox
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`transition-all duration-200 !bg-white border-2 border-dashed rounded-xl ${isDragging ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300'
                        }`}
                >
                    <Box className="flex flex-col sm:flex-row justify-between items-center p-8 gap-6">
                        <Box className="flex gap-5 items-center">
                            <Box className={`p-4 rounded-full ${isDragging ? 'bg-blue-200' : 'bg-blue-50'}`}>
                                <CloudUpload size={36} className="text-blue-600" />
                            </Box>
                            <Box>
                                <Typography variant="h6" className="!font-semibold text-gray-700">
                                    {isDragging ? 'Drop files to upload' : 'Drag and Drop Files Here'}
                                </Typography>
                                <Typography variant="body2" className="text-slate-500 mt-1">
                                    Supported formats: PDF, DOCX, TXT, MD, JSON, CSV (Max 15MB/file)
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="fileUpload"
                                hidden
                                accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
                                onChange={handleFileInput}
                                multiple
                            />
                            <CustomButton
                                variant="contained"
                                color="primary"
                                onClick={() => fileInputRef.current?.click()}
                                className="!px-6 !py-2 !rounded-lg !shadow-sm"
                            >
                                Browse Files
                            </CustomButton>
                        </Box>
                    </Box>
                </DashedBox>
            </Box>

            {/* Pending Files List - Requires User Configuration Inline */}
            {selectedFiles.length > 0 && (
                <Box className="bg-white mt-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Box className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50">
                        <Box>
                            <Typography variant="subtitle1" className="!font-bold text-gray-800">
                                Configure Uploads
                            </Typography>
                            <Typography variant="caption" className="text-slate-500">
                                Provide a knowledge base name for each file before uploading.
                            </Typography>
                        </Box>
                        <Typography variant="caption" className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">
                            {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} pending
                        </Typography>
                    </Box>

                    <Box className="max-h-[500px] overflow-y-auto">
                        {selectedFiles.map((item, index) => (
                            <Box
                                key={index}
                                className="flex flex-col lg:flex-row items-start lg:items-center p-4 border-b border-gray-100 hover:bg-slate-50 transition-colors gap-4"
                            >
                                {/* File Info */}
                                <Box className="flex items-center gap-3 w-full lg:w-1/3 shrink-0">
                                    <Box className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
                                        <FileText size={24} className="text-indigo-500" />
                                    </Box>
                                    <Box className="overflow-hidden">
                                        <Typography variant="body2" className="!font-bold text-gray-700 truncate" title={`${item.file.name}`}>
                                            {item.file.name}
                                        </Typography>
                                        <Typography variant="caption" className="text-slate-500">
                                            {item.file.size ? bytesToSize(item.file.size) : '--'} • {item.extension.toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Input Fields */}
                                <Box className="flex flex-col sm:flex-row gap-4 w-full lg:flex-grow">
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
                                            className="bg-white sm:max-w-[200px]"
                                            icon={null}
                                        />
                                    )}
                                </Box>

                                {/* Delete Action */}
                                <Tooltip title="Remove File">
                                    <IconButton
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                                    >
                                        <Trash2 size={20} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ))}
                    </Box>

                    <Box className="flex items-center justify-between p-4 bg-gray-50/50 border-t border-gray-200">
                        <Box>
                            {!isFormValid && (
                                <Box className="flex items-center gap-2 text-amber-600">
                                    <AlertCircle size={16} />
                                    <Typography variant="caption" className="font-medium">
                                        Please provide a Knowledge Base Name for all files.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Box className="flex gap-3">
                            <CustomButton
                                variant="outlined"
                                onClick={() => setSelectedFiles([])}
                                disabled={uploadStatus === 'loading'}
                                className="!bg-white !text-gray-600 !border-gray-300 hover:!bg-gray-50"
                            >
                                Clear All
                            </CustomButton>
                            <CustomButton
                                variant="contained"
                                color="primary"
                                startIcon={uploadStatus === 'loading' ? <CircularProgress size={16} color="inherit" /> : <CloudUpload size={18} />}
                                onClick={handleUpload}
                                disabled={uploadStatus === 'loading' || !isFormValid}
                                className="!px-6"
                            >
                                {uploadStatus === 'loading' ? 'Uploading...' : 'Upload All'}
                            </CustomButton>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* List Existing Sources */}
            <Box className="mt-12">
                <Typography variant="h6" className="!font-bold text-gray-700">Existing Sources</Typography>

                {loading && sources.length === 0 ? (
                    <Box className="flex justify-center py-10">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mt-4">
                        <Typography className="font-medium">Error loading sources: {error}</Typography>
                    </Box>
                ) : (
                    <>
                        <Box className="flex gap-2 mt-4 mb-4">
                            <InputBox
                                placeholder="Search by source name..."
                                value={searchKnowledge}
                                isShowLabel={false}
                                height="44px"
                                onChange={setSearchKnowledge}
                                className="w-full md:w-1/2 lg:w-1/3 bg-white"
                                icon={<Search className='text-gray-400' size={20} />}
                            />
                        </Box>

                        {filteredSources.length > 0 ? (
                            <KnowledgeListingTableView
                                filteredFlows={filteredSources}
                                handleOpenStudio={(row) => console.log("Open", row)}
                                handleDeleteKnowledge={handleDeleteKnowledge}
                            />
                        ) : (
                            <Box className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 mt-4">
                                <FileText size={48} className="text-gray-300 mb-4" />
                                <Typography variant="h6" className="text-gray-500 font-medium">No sources found</Typography>
                                <Typography variant="body2" className="text-gray-400 mt-1">Upload files above to populate your knowledge base.</Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default KnowledgePage;