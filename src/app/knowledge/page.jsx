"use client"
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, CircularProgress, TextField, IconButton, Tooltip } from "@mui/material";
import { CloudUpload, Search, Trash2, FileText, Edit2, Check, X } from "lucide-react";
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
    selectUploadProgress,
    resetUploadStatus
} from "@/redux/slices/knowledgeSlice";

import { deleteKnowledgeSource } from "@/redux/slices/knowledgeSlice";

const KnowledgePage = () => {
    const dispatch = useDispatch();
    const [searchKnowledge, setSearchKnowledge] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    
    // State stores objects: { file: File, customName: string, extension: string, isEditing: boolean }
    const [selectedFiles, setSelectedFiles] = useState([]); 
    const fileInputRef = useRef(null);

    // Selectors
    const sources = useSelector(selectKnowledgeSources);
    const loading = useSelector(selectKnowledgeLoading);
    const error = useSelector(selectKnowledgeError);
    const uploadStatus = useSelector(selectUploadStatus);
    const uploadProgress = useSelector(selectUploadProgress);

    // Fetch knowledge sources on component mount
    useEffect(() => {
        dispatch(fetchKnowledgeSources());
    }, [dispatch]);

    // Reset upload status when component unmounts
    useEffect(() => {
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

    // Helper to process files into the required state structure
    const processFiles = (files) => {
        return Array.from(files).map(file => {
            const name = file.name;
            const lastDotIndex = name.lastIndexOf('.');
            
            // Extract extension and name without extension
            // content_type logic: remove dot, if no extension, default to empty or octet-stream logic
            const extension = lastDotIndex !== -1 ? name.substring(lastDotIndex + 1) : 'txt';
            const nameWithoutExt = lastDotIndex !== -1 ? name.substring(0, lastDotIndex) : name;

            return {
                file: file,
                customName: nameWithoutExt, 
                extension: extension,
                isEditing: false // Initial state is view mode
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

    // Toggle Edit Mode
    const toggleEditMode = (index) => {
        const updatedFiles = [...selectedFiles];
        // If we are saving (turning off edit mode), ensure name isn't empty
        if (updatedFiles[index].isEditing && !updatedFiles[index].customName.trim()) {
            return; // Prevent saving empty names
        }
        updatedFiles[index].isEditing = !updatedFiles[index].isEditing;
        setSelectedFiles(updatedFiles);
    };

    // Update Name in State
    const handleNameChange = (index, newName) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles[index].customName = newName;
        setSelectedFiles(updatedFiles);
    };

    // Save on Enter Key
    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            toggleEditMode(index);
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        try {
            console.log("Selected files data:", selectedFiles);

            // Prepare Arrays for the payload
            // This structure ensures that index 0 of files matches index 0 of names and content_types
            const filesArray = selectedFiles.map(f => f.file);
            const namesArray = selectedFiles.map(f => f.customName);
            const typesArray = selectedFiles.map(f => f.extension);

            const payload = {
                files: filesArray,
                // Passing metadata as arrays implies the backend/thunk will loop through them 
                // or the thunk constructs FormData appending these keys repeatedly.
                knowledge_base_names: namesArray,
                content_types: typesArray,
                
                // Fallback: If your API expects a single object per request, you might need to loop calls,
                // but usually for bulk upload, passing arrays corresponds to the file index.
                uploads: selectedFiles.map(item => ({
                    knowledge_base_name: item.customName,
                    content_type: item.extension
                }))
            };

            console.log("Dispatching Payload:", payload);

            const result = await dispatch(uploadKnowledgeSource(payload)).unwrap();

            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            console.log('Upload successful:', result.message);

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
                                    {item.isEditing ? (
                                        <Box className="flex items-center gap-2">
                                            <TextField 
                                                variant="outlined" 
                                                value={item.customName}
                                                onChange={(e) => handleNameChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                placeholder="Enter file name"
                                                size="small"
                                                autoFocus
                                                fullWidth
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '35px',
                                                        backgroundColor: '#fff'
                                                    }
                                                }}
                                            />
                                            <Typography variant="body2" className="text-slate-500 font-semibold shrink-0">
                                                .{item.extension}
                                            </Typography>
                                            
                                            <Tooltip title="Save Name">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => toggleEditMode(index)}
                                                    className="bg-green-50 hover:bg-green-100 text-green-600"
                                                >
                                                    <Check size={16} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ) : (
                                        <Box className="flex items-center gap-2 group">
                                            <Typography variant="body2" className="!font-bold text-gray-700">
                                                {item.customName}.{item.extension}
                                            </Typography>
                                            <Tooltip title="Edit Name">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => toggleEditMode(index)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                                                >
                                                    <Edit2 size={14} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                    
                                    {!item.isEditing && (
                                        <Typography variant="caption" className="text-slate-400 mt-0.5">
                                            {item.file?.size ? bytesToSize(item.file.size) : '--'}
                                        </Typography>
                                    )}
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

                        {filteredSources.length>0 ? 

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
        </Box>
    );
};

export default KnowledgePage;