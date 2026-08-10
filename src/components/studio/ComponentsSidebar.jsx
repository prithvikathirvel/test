"use client"

import { useState, useCallback } from "react"
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import {
  ChevronDown,
  Database,
  Workflow,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileInput,
  CloudUpload,
  Layers,
  Folder
} from "lucide-react"
import { useSelector } from "react-redux"
import InputBox from "@/components/Common/InputBox"
import { sortByField } from "@/utils/commonFunction"

export default function ComponentsSidebar({ minimizeSideBar, handleMinimizeSideBar }) {
  const tools = useSelector((state) => state.studio.tools)
  const agents = useSelector((state) => state.studio.agents)
  const models = useSelector((state) => state.studio.models)
  const inputNodes = useSelector((state) => state.studio.inputs)
  const outputNodes = useSelector((state) => state.studio.outputs)
  const prebuiltFlows1 = useSelector((state) => state.studio.prebuiltFlows)
  const prebuiltFlows = sortByField(prebuiltFlows1, "updatedAt", "desc");
  const mcpServers = useSelector((state) => state.studio.mcpTools);
//{
//     "filesystem": [
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the read_file tool from MCP Server. Read the complete contents of a file as text. DEPRECATED: Use read_text_file instead.",
//             "displayName": "read_file",
//             "id": "26450f05-9588-4151-913a-e8276fd8b108",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "read_file"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "head": 0,
//                         "path": "",
//                         "tail": 0
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "head": {
//                             "description": "If provided, returns only the first N lines of the file",
//                             "type": "number"
//                         },
//                         "path": {
//                             "type": "string"
//                         },
//                         "tail": {
//                             "description": "If provided, returns only the last N lines of the file",
//                             "type": "number"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the read_text_file tool from MCP Server. Read the complete contents of a file from the file system as text. Handles various text encodings and provides detailed error messages if the file cannot be read. Use this tool when you need to examine the contents of a single file. Use the 'head' parameter to read only the first N lines of a file, or the 'tail' parameter to read only the last N lines of a file. Operates on the file as text regardless of extension. Only works within allowed directories.",
//             "displayName": "read_text_file",
//             "id": "72442021-78cf-4c7d-99f4-75a4b9c74266",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "read_text_file"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "head": 0,
//                         "path": "",
//                         "tail": 0
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "head": {
//                             "description": "If provided, returns only the first N lines of the file",
//                             "type": "number"
//                         },
//                         "path": {
//                             "type": "string"
//                         },
//                         "tail": {
//                             "description": "If provided, returns only the last N lines of the file",
//                             "type": "number"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the read_media_file tool from MCP Server. Read an image or audio file. Returns the base64 encoded data and MIME type. Only works within allowed directories.",
//             "displayName": "read_media_file",
//             "id": "4eaea22e-f799-4b62-ba15-2decb6d9ec3c",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "read_media_file"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the read_multiple_files tool from MCP Server. Read the contents of multiple files simultaneously. This is more efficient than reading files one by one when you need to analyze or compare multiple files. Each file's content is returned with its path as a reference. Failed reads for individual files won't stop the entire operation. Only works within allowed directories.",
//             "displayName": "read_multiple_files",
//             "id": "9b5223c0-e3bd-4a72-9475-3b1c13a6f00b",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "read_multiple_files"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "paths": []
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "paths": {
//                             "items": {
//                                 "type": "string"
//                             },
//                             "type": "array"
//                         }
//                     },
//                     "required": [
//                         "paths"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the write_file tool from MCP Server. Create a new file or completely overwrite an existing file with new content. Use with caution as it will overwrite existing files without warning. Handles text content with proper encoding. Only works within allowed directories.",
//             "displayName": "write_file",
//             "id": "ceee51ea-42b9-4143-85f7-f115365a334e",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "write_file"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "content": "",
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "content": {
//                             "type": "string"
//                         },
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path",
//                         "content"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the edit_file tool from MCP Server. Make line-based edits to a text file. Each edit replaces exact line sequences with new content. Returns a git-style diff showing the changes made. Only works within allowed directories.",
//             "displayName": "edit_file",
//             "id": "c8236af9-d32c-4447-b03d-09c3599e13ac",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "edit_file"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "dryRun": false,
//                         "edits": [],
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "dryRun": {
//                             "default": false,
//                             "description": "Preview changes using git-style diff format",
//                             "type": "boolean"
//                         },
//                         "edits": {
//                             "items": {
//                                 "additionalProperties": false,
//                                 "properties": {
//                                     "newText": {
//                                         "description": "Text to replace with",
//                                         "type": "string"
//                                     },
//                                     "oldText": {
//                                         "description": "Text to search for - must match exactly",
//                                         "type": "string"
//                                     }
//                                 },
//                                 "required": [
//                                     "oldText",
//                                     "newText"
//                                 ],
//                                 "type": "object"
//                             },
//                             "type": "array"
//                         },
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path",
//                         "edits"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the create_directory tool from MCP Server. Create a new directory or ensure a directory exists. Can create multiple nested directories in one operation. If the directory already exists, this operation will succeed silently. Perfect for setting up directory structures for projects or ensuring required paths exist. Only works within allowed directories.",
//             "displayName": "create_directory",
//             "id": "1a80e98f-09c5-4045-beb1-5e0721736c62",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "create_directory"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the list_directory tool from MCP Server. Get a detailed listing of all files and directories in a specified path. Results clearly distinguish between files and directories with [FILE] and [DIR] prefixes. This tool is essential for understanding directory structure and finding specific files within a directory. Only works within allowed directories.",
//             "displayName": "list_directory",
//             "id": "2d3daa96-2eab-47de-945b-88ad7c5626de",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "list_directory"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the list_directory_with_sizes tool from MCP Server. Get a detailed listing of all files and directories in a specified path, including sizes. Results clearly distinguish between files and directories with [FILE] and [DIR] prefixes. This tool is useful for understanding directory structure and finding specific files within a directory. Only works within allowed directories.",
//             "displayName": "list_directory_with_sizes",
//             "id": "40bcceb2-508c-4b40-a332-b77cc21a4514",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "list_directory_with_sizes"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "path": "",
//                         "sortBy": "name"
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "path": {
//                             "type": "string"
//                         },
//                         "sortBy": {
//                             "default": "name",
//                             "description": "Sort entries by name or size",
//                             "enum": [
//                                 "name",
//                                 "size"
//                             ],
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the directory_tree tool from MCP Server. Get a recursive tree view of files and directories as a JSON structure. Each entry includes 'name', 'type' (file/directory), and 'children' for directories. Files have no children array, while directories always have a children array (which may be empty). The output is formatted with 2-space indentation for readability. Only works within allowed directories.",
//             "displayName": "directory_tree",
//             "id": "c3c620aa-54e0-4074-97ec-ba3f4b36df94",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "directory_tree"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the move_file tool from MCP Server. Move or rename files and directories. Can move files between directories and rename them in a single operation. If the destination exists, the operation will fail. Works across different directories and can be used for simple renaming within the same directory. Both source and destination must be within allowed directories.",
//             "displayName": "move_file",
//             "id": "317f81b3-e9fe-41df-a6a3-2bb71d250277",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "move_file"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "destination": "",
//                         "source": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "destination": {
//                             "type": "string"
//                         },
//                         "source": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "source",
//                         "destination"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the search_files tool from MCP Server. Recursively search for files and directories matching a pattern. Searches through all subdirectories from the starting path. The search is case-insensitive and matches partial names. Returns full paths to all matching items. Great for finding files when you don't know their exact location. Only searches within allowed directories.",
//             "displayName": "search_files",
//             "id": "282ae16a-5693-4384-84cf-5d3e668025b6",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "search_files"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "excludePatterns": [],
//                         "path": "",
//                         "pattern": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "excludePatterns": {
//                             "default": [],
//                             "items": {
//                                 "type": "string"
//                             },
//                             "type": "array"
//                         },
//                         "path": {
//                             "type": "string"
//                         },
//                         "pattern": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path",
//                         "pattern"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the get_file_info tool from MCP Server. Retrieve detailed metadata about a file or directory. Returns comprehensive information including size, creation time, last modified time, permissions, and type. This tool is perfect for understanding file characteristics without reading the actual content. Only works within allowed directories.",
//             "displayName": "get_file_info",
//             "id": "7b9a8d86-56e7-424f-9462-449239785779",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "get_file_info"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {
//                         "path": ""
//                     }
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "$schema": "http://json-schema.org/draft-07/schema#",
//                     "additionalProperties": false,
//                     "properties": {
//                         "path": {
//                             "type": "string"
//                         }
//                     },
//                     "required": [
//                         "path"
//                     ],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         },
//         {
//             "createdAt": "2025-09-03T07:51:25.277978Z",
//             "createdBy": "Prithiv",
//             "description": "Runs the list_allowed_directories tool from MCP Server. Returns the list of directories that this server is allowed to access. Subdirectories within these allowed directories are also accessible. Use this to understand which directories and their nested paths are available before trying to access files.",
//             "displayName": "list_allowed_directories",
//             "id": "26b18edf-4123-4c75-96ac-a8a9be74460c",
//             "inputParameters": [
//                 {
//                     "key": "server_id",
//                     "type": "text",
//                     "value": "filesystem"
//                 },
//                 {
//                     "key": "tool_name",
//                     "type": "text",
//                     "value": "list_allowed_directories"
//                 },
//                 {
//                     "key": "arguments",
//                     "type": "object",
//                     "value": {}
//                 },
//                 {
//                     "key": "timeout",
//                     "type": "number",
//                     "value": 30
//                 }
//             ],
//             "isActive": true,
//             "isPublic": true,
//             "name": "MCP Tool",
//             "outputParameters": [
//                 {
//                     "key": "output",
//                     "type": "object",
//                     "value": "tool_execution_result"
//                 }
//             ],
//             "specifications": {
//                 "original_schema": {
//                     "properties": {},
//                     "required": [],
//                     "type": "object"
//                 },
//                 "server_id": "filesystem"
//             },
//             "status": true,
//             "tags": [
//                 "Run tools from MCP servers",
//                 "External tools caller"
//             ],
//             "type": "tool",
//             "updatedAt": "2025-09-03T07:51:25.277978Z",
//             "updatedBy": "Prithiv",
//             "version": "1.0.0"
//         }
//     ]
// }

  const nodeTypes = [
    {
      title: "Inputs",
      icon: <FileInput size={18} />,
      nodes: mapToNodes(inputNodes, "input"),
    },
    {
      title: "Agents",
      icon: <Database size={18} />,
      nodes: mapToNodes(agents, "agent"),
    },
    {
      title: "Agent Flows",
      icon: <Layers size={18} />,
      nodes:
        prebuiltFlows?.map((flow) => ({
          ...flow,
          displayName: flow.name,
          key: `flow-${flow.id}`,
          id: flow.id,
          type: "agentflow",
        })) || [],
    },
    {
      title: "Tools",
      icon: <Workflow size={18} />,
      nodes: mapToNodes(tools, "tool"),
    },
    {
      title: "AI Models",
      icon: <Bot size={18} />,
      nodes: mapToNodes(models, "model"),
    },
    {
      title: "Outputs",
      icon: <CloudUpload size={18} />,
      nodes: mapToNodes(outputNodes, "output"),
    },
    {
      title: "MCP Servers",
      icon: <Database size={18} />,
      nodes: Object.keys(mcpServers || {}).map((serverName) => ({
        title: `${serverName}`,
        icon: <Folder size={16} />,
        nodes: mcpServers[serverName].map((tool, index) => (
          {
          ...tool,
          name: tool.displayName,
          displayName: tool.displayName,
          key: `${serverName}-${index}`,
          id: tool.id,
        })),
      })),
    }
  ]

  function mapToNodes(items, prefix) {
    return (
      items?.map((item, index) => ({
        ...item,
        displayName: item.name,
        key: `${prefix}-${index}`,
        id: item.id,
      })) || []
    )
  }

  const onDragStart = useCallback((event, nodeType, node) => {
    event.dataTransfer.setData("application/node-spec", JSON.stringify(node))
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }, [])

  const [searchQuery, setSearchQuery] = useState("")

  const filteredNodeTypes = searchQuery.trim()
    ? nodeTypes
      .map((section) => ({
        ...section,
        nodes: section.nodes.filter((node) => node.name.toLowerCase().includes(searchQuery.toLowerCase())),
      }))
      .filter((section) => section.nodes.length > 0)
    : nodeTypes

  return (
    <Box
      className="flex flex-col h-full bg-white"
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        minWidth: 0,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Box
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b shadow-sm"
        sx={{ borderColor: "divider" }}
      >
        <Typography
          variant="subtitle1"
          className="font-semibold text-gray-800 truncate"
          sx={{ fontWeight: 600, fontSize: "0.95rem" }}
        >
          Components
        </Typography>
        <Box
          onClick={handleMinimizeSideBar}
          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-800"
        >
          {minimizeSideBar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Box>
      </Box>

      <Box className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <InputBox
          placeholder="Search components..."
          className="w-full"
          label="Search"
          isShowLabel={false}
          onChange={(e) => setSearchQuery(e)}
        />
      </Box>

      <Box
        className="flex-1"
        sx={{
          maxHeight: "calc(100vh - 130px)",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f5f9",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: "#94a3b8",
            },
          },
        }}
      >
        <div className="p-2 space-y-2">
          {filteredNodeTypes.map((section, index) => (
            <ComponentSection
              key={section.title}
              section={section}
              isFirstSection={index === 0}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </Box>
    </Box>
  )
}

function ComponentSection({ section, isFirstSection, onDragStart }) {
  const [expanded, setExpanded] = useState(isFirstSection)

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-0"
      sx={{
        backgroundColor: "white",
        borderRadius: "8px !important",
        "&:before": { display: "none" },
        "&.Mui-expanded": {
          backgroundColor: "#fafafa",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        },
        "& .MuiAccordionSummary-root": {
          borderRadius: "8px 8px 0 0",
        },
        "& .MuiAccordionDetails-root": {
          borderRadius: "0 0 8px 8px",
        },
      }}
    >
      <AccordionSummary
        expandIcon={
          <div className={`transform transition-transform duration-200 text-gray-500 ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown size={16} />
          </div>
        }
        className=" hover:bg-gray-50 transition-colors duration-200"
        sx={{
          px: 2,
          py: 0,
          minHeight: "50px !important",
          "& .MuiAccordionSummary-content": {
            margin: 0,
            alignItems: "center",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            margin: 0,
          },
        }}
      >
        <Box className="flex items-center justify-between w-full min-w-0">
          <Box className="flex items-center gap-3 min-w-0 flex-1">
            <Box
              className="flex-shrink-0 p-1.5 rounded-md"
              sx={{
                color: getNodeColor(section.title),
                backgroundColor: getNodeBgColor(section.title),
              }}
            >
              {section.icon}
            </Box>
            <Typography className="font-medium text-gray-800 truncate" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {section.title}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium flex-shrink-0"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              minWidth: "24px",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {section.nodes.length}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails className="bg-gray-50/30" >
        <Box className="space-y-2">
          {section.nodes.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">No components available</div>
          ) : section.nodes[0]?.nodes ? (
            // Render nested servers for MCP
            section.nodes.map((subSection) => (
              <ComponentSection
                key={subSection.title}
                section={subSection}
                isFirstSection={false}
                onDragStart={onDragStart}
              />
            ))
          ): (
            section.nodes.map((node, nodeIndex) => (
              <Box
                key={node.key || nodeIndex}
                draggable
                onDragStart={(event) => onDragStart(event, node.type, node)}
                className="group flex items-center gap-3 p-3 rounded-lg cursor-move bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200"
                sx={{
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getNodeColor(section.title) }}
                />
                <Typography
                  className="font-medium text-gray-800 group-hover:text-gray-900 truncate flex-1 min-w-0"
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {node.name}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

// Helper function to get color based on node type
function getNodeColor(nodeType) {
  switch (nodeType) {
    case "Inputs":
      return "#475569"
    case "Agents":
      return "#0d47a1"
    case "Agent Flows":
      return "#0d47a1"
    case "Tools":
      return "#18181b"
    case "AI Models":
      return "#18181b"
    case "Outputs":
      return "#475569"
    default:
      return "#64748b"
  }
}

// Helper function to get background color based on node type
function getNodeBgColor(nodeType) {
  switch (nodeType) {
    case "Inputs":
      return "#f8fafc"
    case "Agents":
      return "#eff6ff"
    case "Agent Flows":
      return "#eff6ff"
    case "Tools":
      return "#f4f4f5"
    case "AI Models":
      return "#f4f4f5"
    case "Outputs":
      return "#f8fafc"
    default:
      return "#fafafa"
  }
}
