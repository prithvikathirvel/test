"use client"

import { useState,useEffect  } from "react"
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
} from "lucide-react"

import InputBox from "@/components/Common/InputBox" 
import CustomSelect from "@/components/Common/CustomSelect"
import UploadArea from "../studio/parameters/common/UploadArea"
import FilePreview from "../studio/parameters/common/FilePreview"

const InputFieldConfiguration = ({ onSave, open, onClose }) => {
  const [fields, setFields] = useState([])
  const [file,setFile]=useState([]);
  const [currentField, setCurrentField] = useState({
    name: "",
    input: "",
    type: "text",
  })

  // useEffect(() => {
  //   if (open) {
  //     setCurrentField({
  //       name: "",
  //       input: "",
  //       type: "text",
  //     })
  //   }
  // }, [open])

  const inputTypes = ["text", "file", "object"]

  const handleInputChange = (field, value) => {
    setCurrentField(prev => ({
      ...prev,
      [field]: value
    }))
    console.log(currentField,'curr')
  }

  const handleInputBoxChange = (value, field = 'input') => {
    handleInputChange(field, value)
  }

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      const reader = new FileReader();

      reader.readAsDataURL(selectedFile)

      reader.onload = async () => {
        const base64Data = reader.result;
        console.log(base64Data,'on Data');
        handleInputChange('input', base64Data)
        setFile(base64Data)
      };
    }
  };

  const handleAdd = () => {
    if (currentField.name && currentField.input) {
      setFields([...fields, { ...currentField }])
      setCurrentField({ name: "", input: "", type: "text" })
    }
  }


  const handleDelete = (index) => {
    const newFields = fields.filter((_, i) => i !== index)
    setFields(newFields)
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
      default:
        return "default"
    }
  }

  const renderInputField = () => {
    switch (currentField.type) {
      case "file":
        return (
          file ? <UploadArea onUpload={handleFileChange} paramKey="input" /> :
          <FilePreview
            file={file}
            fileId={currentField?.input}
            onRemove={handleDelete}
          />
        )
      case "object":
        return (
          <InputBox
            value={currentField?.input}
            onChange={(value) => handleInputBoxChange(value, 'input')}
            placeholder="Enter JSON object"
            width="200px"
          />
        )
      default:
        return (
          <InputBox
           label="Input"
            value={currentField?.input}
            onChange={(value) => handleInputBoxChange(value, 'input')}
            placeholder="Enter the Text Input"
            width="200px"
            icon={getTypeIcon(currentField.type)}
          />
        )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="py-2 px-4 !text-[15px] !font-bold text-gray-800">
        Input Field Configuration
        <p className="text-gray-500 text-sm !font-medium">Add and configure input fields for your application.</p>
      </DialogTitle>

      <DialogContent className="p-8 space-y-8">
        <Paper elevation={0} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <Typography variant="subtitle1" className="!text-[14px] !font-semibold text-gray-800 !mb-6">
            Add New Field
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} className="mb-6">

            <InputBox
              label="Field Name"
              value={currentField.name}
              onChange={(value) => handleInputBoxChange(value, 'name')}
              placeholder="Enter field name"
              width='200px'
              icon={''}
            />

            <CustomSelect
              label="Type"
              value={currentField.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              options={inputTypes.map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                icon: getTypeIcon(type)
              }))}
              placeholder="Select type"
              width="200px"
            />
          </Stack>

          <div className="pt-4">
            {renderInputField()}
          </div>

          <Box className="flex justify-end mt-6">
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!currentField.name || !currentField.input}
              startIcon={<AddIcon />}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              sx={{
                '&:disabled': {
                  opacity: 0.7,
                  cursor: 'not-allowed',
                },
              }}
            >
              Add Field
            </Button>
          </Box>
        </Paper>

        {fields.length > 0 && (
          <Box className="space-y-6">
            <Typography variant="h6" className="text-xl font-semibold text-gray-800 mb-4">
              Added Fields ({fields.length})
            </Typography>

            <Paper elevation={0} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <Box className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <Grid container spacing={2} className="font-medium text-gray-600 text-sm uppercase tracking-wider">
                  <Grid item xs={4}>
                    Field Name
                  </Grid>
                  <Grid item xs={4}>
                    Input
                  </Grid>
                  <Grid item xs={3}>
                    Type
                  </Grid>
                  <Grid item xs={1}></Grid>
                </Grid>
              </Box>

              <Box className="divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <Box key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={4}>
                        <Typography className="font-medium truncate text-gray-900">{field.name}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography className="text-gray-600 truncate">{field.input}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Chip
                          icon={getTypeIcon(field.type)}
                          label={field.type}
                          size="small"
                          color={getTypeColor(field.type)}
                          className="capitalize"
                          sx={{
                            '& .MuiChip-root': {
                              height: '28px',
                              padding: '0 8px',
                            },
                            '& .MuiChip-label': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={1} className="text-right">
                        <IconButton
                          onClick={() => handleDelete(index)}
                          color="error"
                          size="small"
                          className="hover:bg-red-50"
                          sx={{
                            '& .MuiIconButton-root': {
                              padding: '6px',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.125rem',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="p-6 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          className="text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-all duration-200"
          sx={{
            '& .MuiButton-startIcon': {
              marginRight: '12px',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          color="primary"
          startIcon={<SaveIcon />}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
          sx={{
            '& .MuiButton-startIcon': {
              marginRight: '12px',
            },
          }}
        >
          Save Configuration
        </Button>
      </DialogActions>
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
