"use client"
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { CloudUpload, Search, Trash2,FileText} from "lucide-react";
import CustomButton from "@/components/Common/CustomButton";
import InputBox from "@/components/Common/InputBox";
import KnowledgeListingTableView from "@/components/knowledge/KnowledgeListingTableView";
import DashedBox from "@/components/Common/DashedBox";
import { bytesToSize } from "@/utils/commonFunction";

const KnowledgePage = () => {
    const [searchKnowledge, setSearchKnowledge] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles,setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

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

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log("Dropped files:", Array.from(files));
            setSelectedFiles([...selectedFiles,...files])
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Selected files:", Array.from(files));
            setSelectedFiles([...selectedFiles,...files])
        }
    };

    const filteredFlows = [
        {
            id: 1,
            filename: "Product_Manual_v2.pdf",
            type: "pdf",
            size: "2.4 MB",
            createdAt: "2023-10-24T10:00:00Z",
            status: "Indexed"
        },
        {
            id: 2,
            filename: "Q3_Financial_Report.docx",
            type: "docx",
            size: "845 KB",
            createdAt: "2023-10-23T10:00:00Z",
            status: "Processing"
        },
        {
            id: 3,
            filename: "API_Documentation.txt",
            type: "txt",
            size: "12 KB",
            createdAt: "2023-10-20T10:00:00Z",
            status: "Indexed"
        },
        {
            id: 4,
            filename: "Competitor_Analysis_Site",
            type: "url",
            size: "--",
            createdAt: "2023-10-18T10:00:00Z",
            status: "Failed"
        }
    ];

    return (
        <Box className="px-4 sm:px-6 lg:px-8 py-10 bg-slate-50">
            <Box >
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

            {selectedFiles.length > 0 && (
                <Box className="bg-white mt-5 !border-1 rounded-md border-gray-300">
                    <Box className="flex justify-between p-3 border-b-1 border-gray-300 bg-white rounded-t-md">
                        <Typography variant="body2" className="!font-bold">Ready for Upload</Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} selected
                        </Typography>
                    </Box>

                    {selectedFiles.map((file, index) => (
                        <Box key={index} className="flex justify-between items-center p-3 px-4 border-b-1 !border-gray-300">
                            <Box className="flex justify-center items-center gap-4">
                                <Box className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                                    <FileText size={20} className="text-red-500" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" className="!font-bold">{file?.name}</Typography>
                                    <Typography variant="caption" className="text-slate-500">{bytesToSize(file?.size)}</Typography>
                                </Box>
                            </Box>
                            <Trash2 
                                size={16} 
                                color="red" 
                                className="cursor-pointer"
                                onClick={() => {
                                    const newFiles = [...selectedFiles];
                                    newFiles.splice(index, 1);
                                    setSelectedFiles(newFiles);
                                }}
                            />
                        </Box>
                    ))}

                    <Box className="flex flex-row-reverse gap-5 p-3 border-b-1 border-gray-300 bg-white rounded-md">
                        <CustomButton 
                            variant="contained" 
                            color="primary" 
                            startIcon={<CloudUpload size={16} />}
                            onClick={() => {
                                // Handle file upload logic here
                                console.log('Uploading files:', selectedFiles);
                                // After successful upload, you might want to clear the selection:
                                // setSelectedFiles([]);
                            }}
                        >
                            Upload
                        </CustomButton>
                        <CustomButton 
                            variant="outlined"
                            onClick={() => setSelectedFiles([])}
                        >
                            Cancel
                        </CustomButton>
                    </Box>
                </Box>
            )}

            <Box className="mt-10">
                <Typography variant="h6" className="!font-bold" >Sources</Typography>
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
                    {/* <CustomButton variant="outlined" color="black" className="basis-1/3">Filter</CustomButton>
                     <CustomButton  className="basis-1/3">Filter</CustomButton> */}
                </Box>

                <KnowledgeListingTableView
                    filteredFlows={filteredFlows}
                    handleOpenStudio={(id) => console.log("Open flow:", id)}
                    handleDeleteFlow={(id) => console.log("Delete flow:", id)}
                />

            </Box>
        </Box>
    )
}

export default KnowledgePage;