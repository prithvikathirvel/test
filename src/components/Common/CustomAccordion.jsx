import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Box,
  Badge,
  CircularProgress
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
import Loader from '@/components/Common/Loader'


const CustomAccordion = ({
  title,
  icon,
  defaultExpanded = true,
  children,
  className = '',
  titleClassName = '!text-[14px] !font-semibold !font-sans',
  headerContent,
  headerActions,
  emptyStateMessage,
  badgeCount,
  badgeColor = 'primary',
  loading = false,
  loadingText = 'Loading',
  disabled = false,
  ...props
}) => {
  const isEmpty = React.Children.count(children) === 0 && !loading;
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      setIsExpanded(!isExpanded);
    }
  };

  const titleComponent = (
    <Typography className={`${titleClassName} ${disabled ? 'text-gray-400' : ''}`}>
      {title}
    </Typography>
  );

  const accordionContent = (
    <Accordion 
      expanded={isExpanded}
      onChange={() => !disabled && setIsExpanded(!isExpanded)}
      className={`!shadow-none border border-gray-300 !rounded ${disabled ? 'opacity-60' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      <AccordionSummary 
        expandIcon={<ChevronDown className={disabled ? 'text-gray-400' : ''} />}
        className={`hover:bg-gray-50 ${disabled ? 'cursor-not-allowed' : ''}`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        aria-label={`${title} section${disabled ? ' (disabled)' : ''}, press Enter or Space to ${isExpanded ? 'collapse' : 'expand'}`}
      >
        <Stack direction="row" alignItems="center" spacing={1} className="w-full">
          {icon && <Box className={disabled ? 'text-gray-400' : ''}>{icon}</Box>}
          {typeof badgeCount === 'number' ? (
            <Badge 
              badgeContent={badgeCount} 
              color={disabled ? 'default' : badgeColor}
              className="mr-2"
            >
              {titleComponent}
            </Badge>
          ) : titleComponent}
          
          {headerContent && (
            <Box className="ml-auto flex items-center gap-2">
              {headerContent}
            </Box>
          )}
          
          {headerActions && !disabled && (
            <Box 
              className="ml-2 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="toolbar"
              aria-label="Section actions"
            >
              {headerActions}
            </Box>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: isEmpty ? 0 : 3 }}>
          {loading ? (
            <Loader loadingText={loadingText} />
          ) : isEmpty ? (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              className="text-center py-4"
              sx={{ fontStyle: 'italic' }}
            >
              {emptyStateMessage || 'No content available'}
            </Typography>
          ) : children}
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  return accordionContent;
};

export default CustomAccordion;
