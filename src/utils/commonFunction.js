import { toast } from "react-toastify";
import { lighten, darken } from '@mui/material/styles';
import { File, Image, Video, AudioLines, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const showToaster = (type, message) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message.text, {
        toastId: message.code,
      });
      break;
    case 'warning':
      toast.warning(message);
      break;
    case 'info':
      toast.info(message);
      break;
    default:
      toast.info(message);
      break;
  }
};

function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function stringAvatar(name) {
  const nameParts = name.split(' ');
  return {
    sx: {
      bgcolor: stringToColor(name),
      fontSize: '11px'
    },
    children: nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : name[0],
  };
}


function convertToTitleCase(str) {
  if (!str) {
      return "Undefined Title"
  }
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

const getChipStyles = (baseColor) => ({
  backgroundColor: lighten(baseColor, 0.6),
  color: darken(baseColor, 0.4),
});

const getNodeColor = (nodeType) => {
  switch (nodeType?.toLowerCase()) {
    case 'tool':
      return '#6c5ce7';
    case 'agent':
      return '#00b894';
    case 'model':
      return '#0984e3';
    case 'input':
      return '#0284e3';
    default:
      return '#6c5ce7';
  }
};

const FileTypeIcon = ({ fileName }) => {
  if (!fileName) return <File />;
  const ext = fileName.split('.').pop().toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <Image className="text-blue-500" />;
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return <Video className="text-purple-500" />;
  if (['mp3', 'wav', 'ogg'].includes(ext)) return <AudioLines className="text-green-500" />;
  if (['pdf'].includes(ext)) return <FileText className="text-red-500" />;
  return <File className="text-gray-500" />;
};

const generateUUID = () => {
  return uuidv4().replace(/-/g, '');

}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const units = [
    { label: "year", value: 31536000 },
    { label: "month", value: 2592000 },
    { label: "week", value: 604800 },
    { label: "day", value: 86400 },
    { label: "hour", value: 3600 },
    { label: "minute", value: 60 },
  ];

  for (let unit of units) {
    const count = Math.floor(seconds / unit.value);
    if (count >= 1) return `Updated ${count} ${unit.label}${count > 1 ? "s" : ""} ago`;
  }

  return "Updated just now";
}



const generateSpecification = (flow, nodes, edges) => {
  if (!nodes.length) return null;

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return {};
  }
  const specification = {
  ...flow, 
  graphSpec: {
    nodes: nodes.map(node => ({
      node_id: node.id,  
      name: node.data?.name || node.name,
      type: node.data?.type || node.type,
      description: node.data?.description || node.description,
      next: node.data?.next || node.next || [],
      inputParameters: node.data?.inputParameters || node.inputParameters || [],
      outputParameters: node.data?.outputParameters || node.outputParameters || []
    })),
    edges: edges.map(edge => ({
      from: edge.source,  
      to: edge.target,    
    })),
  }
  };

  return specification;
};

function sortByField(arr, field, order = "asc") {
  try {
    if (!Array.isArray(arr) || arr.length === 0) return []; // Return empty if input is not a valid array

    return [...arr].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (valA === undefined || valB === undefined) return 0; // Ignore undefined values

      if (typeof valA === "string" && typeof valB === "string") {
        return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (typeof valA === "number" && typeof valB === "number") {
        return order === "asc" ? valA - valB : valB - valA;
      }

      return 0; // If types are different, keep original order
    });
  } catch (error) {
    console.error("Sorting error:", error);
    return [];
  }
}


export {
  showToaster,
  stringAvatar,
  stringToColor,
  convertToTitleCase, 
  getChipStyles,
  getNodeColor, 
  FileTypeIcon, 
  generateUUID,
  generateSpecification,
  timeAgo,
  sortByField
}