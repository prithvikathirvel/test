import React from 'react';
import { Typography, Box } from '@mui/material';
import { X } from 'lucide-react';

const NodeDetailsModal = ({ node, open, onClose }) => {
  if (!open || !node) return null;

  const formatData = (data) => {
    if (!data) return 'N/A';
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return data.toString();
  };

  const { id, type, data } = node;
  const { name, description, status, version, isPublic, createdBy, spec } = data;

  return (
    <div
      className={`
        absolute top-0 right-0 bottom-0 w-[400px] 
        bg-white z-[899] 
        border-l border-gray-200 
        rounded-lg
        ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        overflow-y-auto
        shadow-lg
      `}

      sx={{
        opacity: open ? 1 : 0,
        transition: 'opacity s ease-in-out',
        pointerEvents: open ? 'auto' : 'none'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="
          absolute top-2 right-2 
          p-1 
          hover:bg-gray-100 
          rounded-full 
          transition-all duration-300 ease-in-out
          hover:rotate-90
          hover:scale-110
          hover:bg-transparent
        "
      >
        <X size={20} className="transition-all duration-300 ease-in-out text-white" />
      </button>
      <Box className="p-3 bg-purple-500">
        <Typography  className="text-white">{name || type}</Typography>
      </Box>
    </div>
  );
};

export default NodeDetailsModal;
