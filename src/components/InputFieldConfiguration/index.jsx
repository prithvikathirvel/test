"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateSpecification } from "@/redux/slices/studioSlice"
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Input 
} from "@mui/material"
import {
  Trash as DeleteIcon,
  Plus as AddIcon,
  Save as SaveIcon,
  X as CloseIcon,
  FileText as DescriptionIcon,
  Upload as UploadIcon,
  Code as CodeIcon,
  Pencil as EditIcon,
  Eye as EyeIcon,
  List as ArrayIcon
} from "lucide-react"

import InputBox from "@/components/Common/InputBox" 
import CustomSelect from "@/components/Common/CustomSelect"
import UploadArea from "../studio/parameters/common/UploadArea"
import FilePreview from "../studio/parameters/common/FilePreview"

const InputFieldConfiguration = ({ onSave, open, onClose }) => {
  const dispatch = useDispatch()
  const specification = useSelector((state) => state.studio.specification)
  const [fields, setFields] = useState([])
  const [file, setFile] = useState(null)
  const [editIndex, setEditIndex] = useState(null)
  const [newArrayItem, setNewArrayItem] = useState("");
  const [previewField, setPreviewField] = useState(null)
  const [currentField, setCurrentField] = useState({
    key: "",
    value: "",
    type: "text",
  })

const handleAddArrayItem = () => {
  if (!newArrayItem.trim()) return;
  const arr = Array.isArray(currentField.value) ? currentField.value : [];
  const updated = [...arr, newArrayItem.trim()];
  handleInputChange("value", updated);
  setNewArrayItem("");
};
const handleArrayItemChange = (idx, v) => {
  if (!Array.isArray(currentField.value)) return;
  const updated = [...currentField.value];
  updated[idx] = v;
  handleInputChange("value", updated);
};
const handleRemoveArrayItem = (idx) => {
  if (!Array.isArray(currentField.value)) return;
  const updated = currentField.value.filter((_, i) => i !== idx);
  handleInputChange("value", updated);
};

  const inputTypes = ["text", "file", "object", "array"]
  const handleInputChange = (field, value) => {
    setCurrentField(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    if (open && specification && specification.inputs && specification.inputs.length > 0) {
      console.log("Loading inputs from specification:", specification.inputs);
      // Make sure we create new objects to avoid reference issues
      const loadedFields = specification.inputs.map(input => ({...input}));
      setFields(loadedFields);
    }
  }, [open, specification]);

  useEffect(() => {
    if (fields.length > 0 && !editIndex) {
      setCurrentField({ key: "", value: "", type: "text" });
      setFile(null);
    }
  }, [fields, editIndex]);

  const handleInputBoxChange = (value, field = 'value') => {
    handleInputChange(field, value)
  }

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile)
      reader.onload = async () => {
        const base64Data = reader.result;
        handleInputChange('value', base64Data)
        setFile(selectedFile)
      };
    }
  };

  const handleAdd = () => {
    if (currentField.key && currentField.value) {
      let newFields;
      
      if (editIndex !== null) {
        // Update existing field
        newFields = fields.map((field, index) => 
          index === editIndex ? { ...currentField } : field
        );
        setEditIndex(null);
      } else {
        // Add new field
        newFields = [...fields, { ...currentField }];
      }
      
      setFields(newFields);
      setCurrentField({ key: "", value: "", type: "text" })

      
      // Update specification
      const updatedSpec = {
        ...specification,
        inputs: newFields
      }
      dispatch(updateSpecification(updatedSpec))
      
    }
  }

  const handleEdit = (index) => {
    console.log("Editing field at index:", index);
    console.log("Fields array:", fields);
    
    const fieldToEdit = {...fields[index]};
    console.log("Field to edit:", fieldToEdit);
    
    setEditIndex(index);
    setCurrentField(fieldToEdit);
    
    // Handle file type fields properly
    if (fieldToEdit.type === 'file') {
      try {
        // If it's a file input, set the file state
        console.log("Setting file for file type:", fieldToEdit.value);
        setFile(fieldToEdit.value);
      } catch (error) {
        console.error("Error setting file:", error);
        setFile(null);
      }
    } else {
      setFile(null);
    }
  }

  const handlePreview = (field) => {
    setPreviewField(field);
  }

  const handleDelete = (index) => {
    const newFields = fields.filter((_, i) => i !== index)
    setFields(newFields)
    
    const updatedSpec = {
      ...specification,
      inputs: newFields
    }
    dispatch(updateSpecification(updatedSpec))
    
    if (editIndex === index) {
      setEditIndex(null);
      setCurrentField({ key: "", value: "", type: "text" });
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(fields)
    }
    onClose()
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "text":
        return <DescriptionIcon className="h-4 w-4" />
      case "file":
        return <UploadIcon className="h-4 w-4" />
      case "object":
        return <CodeIcon className="h-4 w-4" />
      case "array":
        return <ArrayIcon className="h-4 w-4" />
      default:
        return <DescriptionIcon className="h-4 w-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "text":
        return "default"
      case "file":
        return "primary"
      case "object":
        return "secondary"
      case "array":
        return "default"
      default:
        return "default"
    }
  }

  const renderInputField = () => {
    console.log("Rendering input field for:", currentField);
    
    switch (currentField.type) {
      case "file":
        return (
          <div className="mt-3">
            {file ? 
              <FilePreview
                file={file}
                fileId={currentField?.value}
                onRemove={() => setFile(null)}
              /> :
              <UploadArea onUpload={handleFileChange} paramKey="value" />
            }
          </div>
        )
      case "object":
        return (
          <div className="mt-3">
            <InputBox
              label="Input Object"
              value={currentField?.value}
              onChange={(value) => handleInputBoxChange(value, 'value')}
              placeholder="Enter JSON object"
              width="100%"
              icon={getTypeIcon(currentField.type)}
            />
          </div>
        )
      case "array":
        return (
          <div className="mt-3">
            {Array.isArray(currentField.value) &&
              currentField.value.map((item, idx) => (
                <div key={idx} className="flex items-center mb-2">
            <InputBox
              label={`Item ${idx + 1}`}
              value={item}
              onChange={(v) => handleArrayItemChange(idx, v)}
              placeholder="Enter item"
              width="100%"
            />
            <IconButton
              onClick={() => handleRemoveArrayItem(idx)}
              size="small"
              className="text-red-500 ml-2"
            >
              <DeleteIcon className="h-4 w-4" />
            </IconButton>
          </div>
        ))
      }
      <div className="flex items-center">
        <InputBox
          label="New Item"
          value={newArrayItem}
          onChange={(v) => setNewArrayItem(v)}
          placeholder="Enter new item"
          width="100%"
        />
        <IconButton
          onClick={handleAddArrayItem}
          size="small"
          className="text-green-500 ml-2"
        >
          <AddIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  )

        
      default:
        return (
          <div className="mt-3">
            <InputBox
              label="Input Text"
              value={currentField?.value}
              onChange={(value) => handleInputBoxChange(value, 'value')}
              placeholder="Enter the Text Input"
              width="100%"
              icon={getTypeIcon(currentField.type)}
            />
          </div>
        )
    }
  }

  const renderPreviewContent = (field) => {
    switch (field.type) {
      case "file":
        return (
          <div className="mt-4 max-w-full">
            <FilePreview
              file={field.value}
              fileId={field.value}
              onRemove={() => {}}
            />
          </div>
        );
      case "object":
        try {
          const formattedJson = JSON.stringify(JSON.parse(field.value), null, 2);
          return (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-80 text-sm mt-3 border border-gray-200">
              {formattedJson}
            </pre>
          );
        } catch (e) {
          return <div className="text-red-500 mt-3">Invalid JSON format</div>;
        }
      case "array":
        return (
          <ul className="list-disc pl-6 mt-3">
            {field.value.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
      default:
        return <p className="text-gray-700 mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">{field.value}</p>;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        className="py-5 px-6 border-b border-gray-200"
        sx={{
          backgroundColor: 'white',
          '& .MuiTypography-root': {
            fontWeight: 600
          }
        }}
      >
        <Typography className="text-gray-800 font-semibold">
          Input Field Configuration
        </Typography>
        <Typography className="text-gray-500 !font-medium !mt-1 !text-[13px]">
          Add and configure input fields for your application
        </Typography>
      </DialogTitle>

      <DialogContent className="p-0">
        <div className="p-6 grid grid-cols-1 gap-8">
          {/* Add/Edit Field Section */}
          <Paper 
            elevation={0} 
            className="border border-gray-200 rounded-xl p-6 bg-white"
            sx={{
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <Typography 
              variant="subtitle1" 
              className="text-gray-800 mb-5 font-semibold"
              sx={{ fontSize: '16px' }}
            >
              {editIndex !== null ? "Edit Field" : "Add New Field"}
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <InputBox
                  label="Field Name"
                  value={currentField.key}
                  onChange={(value) => handleInputBoxChange(value, 'key')}
                  placeholder="Enter field name"
                  width="100%"
                />
              </div>
              
              <div>
                <CustomSelect
                  label="Field Type"
                  value={currentField.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  options={inputTypes.map((type) => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    icon: getTypeIcon(type)
                  }))}
                  placeholder="Select type"
                  width="100%"
                />
              </div>
            </div>

            <div className="mb-2">
              {renderInputField()}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              {editIndex !== null && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditIndex(null);
                    setCurrentField({ key: "", value: "", type: "text" });
                  }}
                  startIcon={<CloseIcon className="h-4 w-4" />}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '10px 18px',
                    borderColor: 'rgb(209, 213, 219)',
                    '&:hover': {
                      borderColor: 'rgb(156, 163, 175)',
                      backgroundColor: 'rgba(243, 244, 246, 0.8)'
                    }
                  }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!currentField.key || !currentField.value}
                startIcon={editIndex !== null ? <SaveIcon className="h-4 w-4" /> : <AddIcon className="h-4 w-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 18px',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)'
                  },
                  '&:disabled': {
                    opacity: 0.7,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)'
                  }
                }}
              >
                {editIndex !== null ? "Update Field" : "Add Field"}
              </Button>
            </div>
          </Paper>

          {/* Fields List Section */}
          {fields.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Typography 
                  variant="subtitle1" 
                  className="text-gray-800 font-semibold"
                  sx={{ fontSize: '16px' }}
                >
                  Added Fields
                </Typography>
                <Chip 
                  label={fields.length} 
                  size="small" 
                  color="primary"
                  sx={{
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '24px'
                  }}
                />
              </div>

              <Paper 
                elevation={0} 
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                sx={{
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3.5 grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <Typography variant="body2" className="font-medium text-gray-600 uppercase text-xs tracking-wider">
                      Field Name
                    </Typography>
                  </div>
                  <div className="col-span-4">
                    <Typography variant="body2" className="font-medium text-gray-600 uppercase text-xs tracking-wider">
                      Input
                    </Typography>
                  </div>
                  <div className="col-span-2">
                    <Typography variant="body2" className="font-medium text-gray-600 uppercase text-xs tracking-wider">
                      Type
                    </Typography>
                  </div>
                  <div className="col-span-2 text-right">
                    <Typography variant="body2" className="font-medium text-gray-600 uppercase text-xs tracking-wider">
                      Actions
                    </Typography>
                  </div>
                </div>

                {/* Rows */}
                <div>
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors ${
                        index !== fields.length - 1 ? "border-b border-gray-200" : ""
                      } ${editIndex === index ? "bg-blue-50" : ""}`}
                    >
                      <div className="col-span-4">
                        <Typography variant="body1" className="font-medium text-gray-900 truncate">
                          {field.key}
                        </Typography>
                      </div>
                      <div className="col-span-4">
                        <Typography variant="body2" className="text-gray-600 truncate block max-w-[200px]">
                          {field.type === 'file' ? 'File data' : field.value}
                        </Typography>
                      </div>
                      <div className="col-span-2">
                        <Chip
                          icon={getTypeIcon(field.type)}
                          label={field.type}
                          size="small"
                          color={getTypeColor(field.type)}
                          className="capitalize"
                          sx={{
                            borderRadius: '6px',
                            '& .MuiChip-label': {
                              paddingLeft: '4px',
                              fontWeight: 500
                            }
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end space-x-2">
                        <IconButton
                          onClick={() => handlePreview(field)}
                          size="small"
                          className="text-blue-500 hover:bg-blue-50"
                          title="Preview"
                          sx={{
                            padding: '6px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.12)'
                            }
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEdit(index)}
                          size="small"
                          className="text-green-500 hover:bg-green-50"
                          title="Edit"
                          sx={{
                            padding: '6px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(34, 197, 94, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(34, 197, 94, 0.12)'
                            }, 
                            paddingRight:'2px'
                          }}
                        >
                          <EditIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(index)}
                          size="small"
                          className="text-red-500 hover:bg-red-50"
                          title="Delete"
                          sx={{
                            padding: '6px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.12)'
                            }
                          }}
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </Paper>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Button
          onClick={onClose}
          startIcon={<CloseIcon className="h-4 w-4" />}
          className="text-gray-700 hover:bg-gray-100"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 18px',
            '&:hover': {
              backgroundColor: 'rgba(243, 244, 246, 0.8)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 18px',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)'
            }
          }}
        >
          Save Configuration
        </Button>
      </DialogActions>
      
      {/* Preview Dialog */}
      {previewField && (
        <Dialog 
          open={!!previewField} 
          onClose={() => setPreviewField(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle className="flex justify-between items-center py-4 px-6 border-b border-gray-200 bg-white">
            <Typography className="text-gray-800 font-semibold">
              Field Preview: {previewField.key}
            </Typography>
            <IconButton 
              onClick={() => setPreviewField(null)} 
              size="small"
              sx={{
                borderRadius: '6px',
                padding: '6px',
                backgroundColor: 'rgba(107, 114, 128, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(107, 114, 128, 0.12)'
                }
              }}
            >
              <CloseIcon className="h-5 w-5" />
            </IconButton>
          </DialogTitle>
          <DialogContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Typography variant="body1" className="font-medium text-gray-700">
                  Type:
                </Typography>
                <Chip
                  icon={getTypeIcon(previewField.type)}
                  label={previewField.type}
                  size="small"
                  color={getTypeColor(previewField.type)}
                  className="capitalize"
                  sx={{
                    borderRadius: '6px',
                    '& .MuiChip-label': {
                      paddingLeft: '4px',
                      fontWeight: 500
                    }
                  }}
                />
              </div>
              
              <div>
                <Typography variant="body1" className="font-medium text-gray-700 mb-2">
                  Value:
                </Typography>
                {renderPreviewContent(previewField)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}

const Grid = ({ container, item, xs, spacing, children, className, alignItems }) => {
  if (container) {
    return (
      <Box
        className={`grid grid-cols-12 gap-${spacing || 0} ${alignItems ? `items-${alignItems}` : ""} ${className || ""}`}
      >
        {children}
      </Box>
    )
  }

  if (item) {
    const colSpan = xs || 12
    return <Box className={`col-span-${colSpan} ${className || ""}`}>{children}</Box>
  }

  return <Box className={className}>{children}</Box>
}

export default InputFieldConfiguration
