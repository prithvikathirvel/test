"use client"
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { CloudUpload, Search, Trash2, FileText, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "@/components/Common/CustomButton";
import InputBox from "@/components/Common/InputBox";
import KnowledgeListingTableView from "@/components/knowledge/KnowledgeListingTableView";
import DashedBox from "@/components/Common/DashedBox";
import FileSettingsModal from "@/components/knowledge/FileSettingsModal";
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

// Extensions that allow settings configuration
const ALLOWED_SETTINGS_EXTENSIONS = ['pdf', 'docx', 'txt'];

const KnowledgePage = () => {
    const dispatch = useDispatch();
    const [searchKnowledge, setSearchKnowledge] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    
    // File State
    const [selectedFiles, setSelectedFiles] = useState([]); 
    const fileInputRef = useRef(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTargetIndex, setModalTargetIndex] = useState(null);

    // Selectors
    const sources = useSelector(selectKnowledgeSources);
    const loading = useSelector(selectKnowledgeLoading);
    const error = useSelector(selectKnowledgeError);
    const uploadStatus = useSelector(selectUploadStatus);

    useEffect(() => {
        dispatch(fetchKnowledgeSources());
    }, [dispatch]);

    useEffect(() => {
        // Clean up status when unmounting
        return () => {
            dispatch(resetUploadStatus());
        };
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
                customName: nameWithoutExt, 
                extension: extension,
                chunkWord: "", 
            };
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const processedFiles = processFiles(files);
            setSelectedFiles(prevFiles => [...prevFiles, ...processedFiles]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const processedFiles = processFiles(files);
        setSelectedFiles(prevFiles => [...prevFiles, ...processedFiles]);
    };

    // --- Modal Logic ---

    const handleOpenSettings = (index) => {
        setModalTargetIndex(index);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalTargetIndex(null);
    };

    const handleSaveSettings = (newName, newChunkWord) => {
        if (modalTargetIndex === null) return;

        const updatedFiles = [...selectedFiles];
        updatedFiles[modalTargetIndex] = {
            ...updatedFiles[modalTargetIndex],
            customName: newName,
            chunkWord: newChunkWord 
        };
        
        setSelectedFiles(updatedFiles);
    };

    // --- Upload Logic ---

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        try {
            // Prepare Arrays for the payload
            const filesArray = selectedFiles.map(f => f.file);
            const namesArray = selectedFiles.map(f => f.customName);
            const typesArray = selectedFiles.map(f => f.extension);
            
            // Map chunk words, sending specific value only for allowed extensions
            const chunksArray = selectedFiles.map(f => 
                ALLOWED_SETTINGS_EXTENSIONS.includes(f.extension) ? f.chunkWord : ""
            );

            const payload = {
                files: filesArray,
                knowledge_base_names: namesArray,
                content_types: typesArray,
                chunk_words: chunksArray, // This is now correctly handled by the slice
            };

            console.log("Dispatching Payload with Chunk Words:", payload);

            await dispatch(uploadKnowledgeSource(payload)).unwrap();

            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const handleRemoveFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const filteredSources = useMemo(() => {
        if (!searchKnowledge) return sources;
        return sources.filter(source =>
            source.filename.toLowerCase().includes(searchKnowledge.toLowerCase())
        );
    }, [sources, searchKnowledge]);

    
    const handleDeleteKnowledge = (id) => {
        dispatch(deleteKnowledgeSource(id));
    };

    return (
        <Box className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50">
            <Box>
                <Box className="flex items-center justify-between mb-10">
                    <Box>
                        <Typography variant="h4" className="!font-bold">Manage Knowledge Resources</Typography>
                        <Typography variant="body1" className="text-slate-500">Upload documents to train your AI or manage existing knowledge base entries.</Typography>
                    </Box>
                </Box>
            </Box>

            <Box className="">
                <Typography variant="h6" className="!font-bold !mb-2">Upload Source</Typography>

                <DashedBox
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`transition-colors duration-200 !bg-white ${isDragging ? 'bg-blue-100' : ''}`}
                >
                    <Box className="flex justify-between items-center p-10">
                        <Box
                            className="flex gap-5 items-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Box className={`p-5 rounded-lg ${isDragging ? 'bg-blue-100' : 'bg-[var(--primary-color)]/10'}`}>
                                <CloudUpload size={30} color="#0d47a1" />
                            </Box>
                            <Box>
                                <Typography variant="h5" className="!font-bold">
                                    {isDragging ? 'Drop files here' : 'Drag and Drop Files Here'}
                                </Typography>
                                <Typography variant="caption" className="text-slate-500">
                                    Supported formats: PDF, DOCX, TXT, MD (Max 15MB per file)
                                </Typography>
                                <Typography variant="caption" className="text-slate-500 block mt-1">
                                    Multiple files can be selected
                                </Typography>
                            </Box>
                        </Box>
                        <Box className="flex items-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="fileUpload"
                                hidden
                                name="files[]"
                                accept=".pdf,.doc,.docx,.txt,.md"
                                onChange={handleFileInput}
                                multiple
                            />
                            <label htmlFor="fileUpload">
                                <CustomButton
                                    variant="contained"
                                    component="span"
                                >
                                    Browse Files
                                </CustomButton>
                            </label>
                        </Box>
                    </Box>
                </DashedBox>
            </Box>

            {uploadStatus === 'loading' && (
                <Box className="mt-4 p-4 bg-blue-50 rounded-md">
                    <Box className="flex items-center gap-3">
                        <CircularProgress size={20} />
                        <Typography>Uploading...</Typography>
                    </Box>
                </Box>
            )}

            {uploadStatus === 'succeeded' && (
                <Box className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                    <Typography>Files uploaded successfully!</Typography>
                </Box>
            )}

            {uploadStatus === 'failed' && (
                <Box className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                    <Typography>Upload failed. Please try again.</Typography>
                </Box>
            )}

            {selectedFiles.length > 0 && (
                <Box className="bg-white mt-5 !border-1 rounded-md border-gray-300 shadow-sm">
                    <Box className="flex h-15 justify-between items-center p-3 border-b-1 border-gray-200 bg-gray-50 rounded-t-md">
                        <Typography variant="body2" className="!font-bold">Ready for Upload</Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} selected
                        </Typography>
                    </Box>

                    {selectedFiles.map((item, index) => (
                        <Box 
                            key={index} 
                            className="flex justify-between items-center p-3 px-4 border-b-1 !border-gray-100 hover:bg-slate-50 transition-colors"
                        >
                            <Box className="flex items-center gap-4 flex-grow">
                                <Box className="p-2 rounded-lg bg-blue-50 shrink-0">
                                    <FileText size={20} className="text-blue-600" />
                                </Box>
                                
                                <Box className="flex flex-col flex-grow max-w-2xl">
                                    <Box className="flex items-center gap-2 group">
                                        <Typography variant="body2" className="!font-bold text-gray-700">
                                            {item.customName}.{item.extension}
                                        </Typography>
                                        
                                        {/* Settings Icon - Only for Allowed Extensions */}
                                        {ALLOWED_SETTINGS_EXTENSIONS.includes(item.extension) && (
                                            <Tooltip title="Configure Settings">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleOpenSettings(index)}
                                                    className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50"
                                                >
                                                    <Settings size={16} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                    
                                    <Box className="flex gap-3">
                                        <Typography variant="caption" className="text-slate-400 mt-0.5">
                                            {item.file?.size ? bytesToSize(item.file.size) : '--'}
                                        </Typography>
                                        
                                        {/* Display Chunk Word if set */}
                                        {ALLOWED_SETTINGS_EXTENSIONS.includes(item.extension) && item.chunkWord && (
                                            <Typography variant="caption" className="text-blue-500 mt-0.5 font-medium">
                                                Chunk: {item.chunkWord}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            <Tooltip title="Remove File">
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFile(index)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 ml-4"
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}

                    <Box className="flex flex-row-reverse gap-3 p-3 border-t border-gray-200 bg-gray-50 rounded-b-md">
                        <CustomButton
                            variant="contained"
                            color="primary"
                            startIcon={<CloudUpload size={16} />}
                            onClick={handleUpload}
                            disabled={uploadStatus === 'loading'}
                        >
                            {uploadStatus === 'loading' ? 'Uploading...' : 'Upload All'}
                        </CustomButton>
                        <CustomButton
                            variant="outlined"
                            onClick={() => {
                                setSelectedFiles([]);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            disabled={uploadStatus === 'loading'}
                            className="bg-white"
                        >
                            Cancel
                        </CustomButton>
                    </Box>
                </Box>
            )}

            <Box className="mt-10">
                <Typography variant="h6" className="!font-bold">Sources</Typography>
                {loading ? (
                    <Box className="flex justify-center items-center p-10">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box className="p-4 bg-red-50 text-red-700 rounded-md mt-2">
                        <Typography>Error loading sources: {error}</Typography>
                    </Box>
                ) : (
                    <>
                        <Box className="flex gap-2 mt-2 rounded-md m-2">
                            <InputBox
                                placeholder="Search by Source..."
                                value={searchKnowledge}
                                isShowLabel={false}
                                height="40px"
                                width="50%"
                                onChange={setSearchKnowledge}
                                className="basis-2/3"
                                icon={<Search className='text-gray-400' size={18} />}
                            />
                        </Box>

                        {filteredSources.length > 0 ? 
                          <KnowledgeListingTableView
                            filteredFlows={filteredSources}
                            handleOpenStudio={(row)=> console.log("Open", row)}
                            handleDeleteKnowledge={handleDeleteKnowledge}
                        />
                        :
                        <Box className="flex !items-center !justify-center p-5">
                            <Typography variant="body2" className="!font-bold">No sources found</Typography>   
                        </Box>
                    }
                    </>
                )}
            </Box>

            {/* Settings Modal Component */}
            <FileSettingsModal 
                open={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSettings}
                initialData={modalTargetIndex !== null ? selectedFiles[modalTargetIndex] : null}
                fileType={modalTargetIndex !== null ? selectedFiles[modalTargetIndex]?.extension : ''}
            />

        </Box>
    );
};

export default KnowledgePage;