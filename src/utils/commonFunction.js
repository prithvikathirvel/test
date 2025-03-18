import { toast } from "react-toastify";

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

export {
  showToaster,
  stringAvatar,
  stringToColor
}