import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Button } from '@mui/material';

const CustomButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  sx = {},
  className = '',
  ...props
}) => {
  // Base enterprise button styling
  const baseStyles = {
    textTransform: 'none',
    fontSize: '13px',
    py: 0.8,
    px: 2,
    borderRadius: '8px',
    fontWeight: 500,
    boxShadow: 'none',
    letterSpacing: '-0.01em',
    transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    '& .MuiButton-startIcon': {
      marginRight: '6px',
      '& > *:nth-of-type(1)': {
        fontSize: '16px',
      },
    },
    '& .MuiButton-endIcon': {
      marginLeft: '6px',
      '& > *:nth-of-type(1)': {
        fontSize: '16px',
      },
    },
  };

  // Variant styling
  const variantStyles = {
    contained: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: '1px solid transparent',
      boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.2)',
      '&:hover': {
        backgroundColor: '#1d4ed8',
        boxShadow: '0 2px 4px 0 rgba(37, 99, 235, 0.3)',
      },
      '&:disabled': {
        backgroundColor: '#f1f5f9',
        color: '#94a3b8',
        boxShadow: 'none',
      },
    },
    outlined: {
      backgroundColor: '#ffffff',
      color: '#334155',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      '&:hover': {
        backgroundColor: '#f8fafc',
        borderColor: '#cbd5e1',
        color: '#0f172a',
      },
      '&:disabled': {
        border: '1px solid #f1f5f9',
        color: '#cbd5e1',
      },
    },
    text: {
      backgroundColor: 'transparent',
      color: '#475569',
      border: 'none',
      '&:hover': {
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
      },
      '&:disabled': {
        color: '#cbd5e1',
      },
    },
  };

  // Size variations
  const sizeStyles = {
    small: {
      fontSize: '12px',
      padding: '4px 10px',
      minWidth: '60px',
      height: '32px',
    },
    medium: {
      fontSize: '13px',
      padding: '6px 16px',
      minWidth: '64px',
      height: '38px',
    },
    large: {
      fontSize: '14px',
      padding: '8px 22px',
      minWidth: '72px',
      height: '44px',
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...(variantStyles[variant] || variantStyles.contained),
    ...(sizeStyles[size] || sizeStyles.medium),
    ...(fullWidth && { width: '100%' }),
    ...sx,
  };

  return (
    <Button
      variant={variant}
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : startIcon}
      endIcon={endIcon}
      onClick={onClick}
      disabled={disabled || loading}
      sx={buttonStyles}
      className={className}
      {...props}
    >
      {loading && !startIcon && <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />}
      {children}
    </Button>
  );
};

export default CustomButton;
