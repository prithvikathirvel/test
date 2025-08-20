import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@mui/material';
import { Button } from '@mui/material';

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
  ...props
}) => {
  // Base button styles
  const baseStyles = {
    textTransform: 'none',
    fontSize: '14px',
    py: 0.75,
    px: 2,
    borderRadius: '4px',
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    '&:disabled': {
      opacity: 0.7,
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

  // Variant styles
  const variantStyles = {
    contained: {
      backgroundColor: 'var(--primary-color)',
      color: '#fff',
      border: 'none',
      '&:hover': {
        // backgroundColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: 'none',
      },
      '&:disabled': {
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        color: 'rgba(0, 0, 0, 0.26)',
      },
    },
    outlined: {
      backgroundColor: 'transparent',
      color: 'var(--primary-color)',
      border: '1px solid var(--primary-color)',
      '&:hover': {
        backgroundColor: 'rgba(108, 92, 231, 0.04)',
        border: '1px solid var(--primary-color)',
      },
      '&:disabled': {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        color: 'rgba(0, 0, 0, 0.26)',
      },
    },
    text: {
      backgroundColor: 'transparent',
      color: 'var(--primary-color)',
      border: 'none',
      '&:hover': {
        backgroundColor: 'rgba(108, 92, 231, 0.04)',
      },
      '&:disabled': {
        color: 'rgba(0, 0, 0, 0.26)',
      },
    },
  };

  // Size styles
  const sizeStyles = {
    small: {
      fontSize: '0.8125rem',
      padding: '4px 10px',
      minWidth: '64px',
      height: '32px',
    },
    medium: {
      fontSize: '0.875rem',
      padding: '6px 16px',
      minWidth: '64px',
      height: '36px',
    },
    large: {
      fontSize: '0.9375rem',
      padding: '8px 22px',
      minWidth: '64px',
      height: '42px',
    },
  };

  // Merge all styles
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
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      onClick={onClick}
      disabled={disabled || loading}
      sx={buttonStyles}
      {...props}
    >
      {loading && !startIcon && <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />}
      {children}
    </Button>
  );
};

export default CustomButton;