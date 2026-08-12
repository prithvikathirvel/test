"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import InputBox from '@/components/Common/InputBox';
import ExpandableTextInput from '@/components/Common/ExpandableTextInput';
import ParameterHeader from './common/ParameterHeader';

/**
 * Heuristic: does this value deserve a multi-line editor?
 *
 * Short identifiers, model names and single tokens keep the compact single-line
 * field so the parameter panel stays dense. Prompts, templates, JSON blobs,
 * markdown and HTML get the growing editor instead of a 38px slot the user has
 * to scroll horizontally through.
 */
const RICH_KEY_HINTS = [
  'prompt', 'instruction', 'system', 'template', 'query', 'sql', 'body',
  'content', 'message', 'text', 'description', 'schema', 'payload',
  'markdown', 'html', 'json', 'script', 'code', 'context', 'rule',
];

const RICH_TYPE_HINTS = [
  'textarea', 'longtext', 'multiline', 'markdown', 'html', 'json', 'code', 'prompt',
];

const needsRichEditor = (param, value) => {
  const text = typeof value === 'string' ? value : '';
  if (text.includes('\n') || text.length > 80) return true;

  const type = String(param?.type || '').toLowerCase();
  if (RICH_TYPE_HINTS.some((hint) => type.includes(hint))) return true;

  const key = String(param?.key || param?.name || '').toLowerCase();
  if (RICH_KEY_HINTS.some((hint) => key.includes(hint))) return true;

  const trimmed = text.trim();
  // Looks like JSON / HTML content pasted into a plain string field.
  if (/^[[{]/.test(trimmed) && /[\]}]$/.test(trimmed)) return true;
  if (/^\s*<[a-z!/]/i.test(trimmed)) return true;

  return false;
};

const StringParameter = ({ param = {}, color, onUpdate, parameters, parameter }) => {
  const [localValue, setLocalValue] = useState(param.value ?? '');

  useEffect(() => {
    setLocalValue(param.value ?? '');
  }, [param.value]);

  const handleChange = (value) => {
    setLocalValue(value);
    const updatedParams = (parameters || []).map(p =>
      p.key === param.key ? { ...p, value } : p
    );
    onUpdate(updatedParams, parameter, true);
  };

  // Once a field has been promoted to the rich editor it stays there while the
  // user types (the value length would otherwise flip it back and steal focus).
  const [everRich, setEverRich] = useState(() => needsRichEditor(param, param.value));
  const isRich = useMemo(() => {
    const rich = everRich || needsRichEditor(param, localValue);
    return rich;
  }, [everRich, param, localValue]);

  useEffect(() => {
    if (!everRich && needsRichEditor(param, localValue)) setEverRich(true);
  }, [everRich, param, localValue]);

  return (
    <Box className="w-full min-w-0">
      <ParameterHeader
        title={param.key || param.name}
        description={param.description}
        type={param.type || 'text'}
      />
      {isRich ? (
        <ExpandableTextInput
          value={typeof localValue === 'string' ? localValue : String(localValue ?? '')}
          onChange={handleChange}
          title={param.key || param.name || 'Value'}
          placeholder={`Enter ${param.key || 'value'}...`}
          language="auto"
          minRows={3}
          maxRows={14}
          compact
        />
      ) : (
        <InputBox
          placeholder={`Enter ${param.key || 'value'}...`}
          icon={""}
          color={color}
          value={localValue}
          label=""
          isShowLabel={false}
          onChange={handleChange}
        />
      )}
    </Box>
  );
};

export default StringParameter;
