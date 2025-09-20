"use client";
import React from 'react';
import { Box, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';

const KeyValueInput = ({newKey,newValue,onKeyChange,onValueChange,onAdd,color,onKeyPress,disabled = false,newKeyLabel,newValueLabel}) => (
  <Box className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
    <InputBox
      label={newKeyLabel}
      placeholder={newKeyLabel}
      value={newKey}
      height="30px"
      onChange={onKeyChange}
      icon=''
      color={color}
      isShowLabel={false}
      onKeyDown={onKeyPress}
      disabled={disabled}
    />
    <InputBox
      placeholder={newValueLabel}
      label={newValueLabel}
      value={newValue}
      isShowLabel={false}
      height="30px"
      onChange={onValueChange}
      color={color}
      icon=''
      onKeyDown={onKeyPress}
    />
    <Button
      className="h-[25px] !min-w-[25px] w-[25px] border !rounded-[100%]"
      style={{ backgroundColor: color }}
      size="small"
      onClick={onAdd}
      disabled={!newKey || !newValue}
    >
      <Plus size={15} color="white" />
    </Button>
  </Box>
);

export default KeyValueInput;
