import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  Dialog,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  X as CloseIcon,
  Settings as SettingsIcon,
  User as PersonIcon,
  Globe as PublicIcon,
  NotepadText as DescriptionIcon,
  Code as CodeIcon,
  TextCursorInput as InputIcon,
  ChevronsLeftRightEllipsis as OutputIcon,
  Tags as TagsIcon,
  Info as InfoIcon,
  Trash2 as DeleteIcon,
  Edit as EditIcon,
  Play as PlayIcon,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Bot,
  Brain,
  Wrench,
  Plus,
  Trash2,
  Database,
  TerminalSquare,
  Search,
} from 'lucide-react';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import NodeTestModal from './NodeTestModal';
import { updateNode } from '@/redux/slices/studioSlice';
import { getNodeDocs, toDisplayString } from './nodeDocsData';

const InfoItem = ({ label, value, icon }) => (
  <div key={label} className="flex justify-between items-center py-2 group">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-[12px]">{label}</span>
    </div>
    <span className="text-[12px] font-medium text-slate-800">
      {value ?? 'N/A'}
    </span>
  </div>
);

const DescriptionSection = ({ description }) => (
  <div className="mb-3">
    <div className="flex items-center gap-1.5 mb-1.5">
      <DescriptionIcon className="text-slate-400" size={13} />
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Description</span>
    </div>
    <p className="text-[12.5px] text-slate-600 leading-relaxed">
      {description || 'No description available.'}
    </p>
  </div>
);

const TagsSection = ({ tags }) => (
  <div className="mb-3">
    <div className="flex items-center gap-1.5 mb-1.5">
      <TagsIcon className="text-slate-400" size={13} />
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tags</span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {tags && tags.length > 0 ? (
        tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-600"
          >
            {tag}
          </span>
        ))
      ) : (
        <span className="text-[11px] text-slate-400 italic">No tags</span>
      )}
    </div>
  </div>
);

const ModalHeader = ({
  title,
  type,
  color,
  onClose,
  onDelete,
  onUpdateName,
  handleSaveChanges,
  isDirty,
  disabled,
  loading,
  handleTestClick,
  isExpanded,
  toggleExpand,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title || 'Undefined Node');

  useEffect(() => {
    setEditedName(title || 'Undefined Node');
  }, [title]);

  const handleEditClick = () => {
    if (isEditing) {
      onUpdateName(editedName);
    }
    setIsEditing(!isEditing);
  };

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onUpdateName(editedName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: color || '#6366f1' }}
        >
          <SettingsIcon size={15} className="text-white" />
        </div>
        {isEditing ? (
          <TextField
            value={editedName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            size="small"
            autoFocus
            className="min-w-[200px]"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '13px',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: '#94a3b8' },
              },
              '& input': { py: '6px' },
            }}
          />
        ) : (
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-semibold text-slate-900 truncate leading-tight">
              {editedName || 'Undefined Node'}
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {type || 'Custom Node'}
            </span>
          </div>
        )}

        <button
          onClick={handleEditClick}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isEditing ? 'Save Name' : 'Edit Name'}
        >
          <EditIcon size={13} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Unsaved
          </span>
        )}

        <button
          onClick={handleSaveChanges}
          disabled={!isDirty || disabled || loading}
          className="px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Save
        </button>

        <div className="flex items-center gap-0.5 ml-1">
          <Tooltip title="Test Node">
            <IconButton
              onClick={handleTestClick}
              disabled={loading}
              size="small"
              className="!p-1.5 !text-slate-500 hover:!text-emerald-600 hover:!bg-emerald-50 !rounded-md"
            >
              <PlayIcon size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Node">
            <IconButton
              onClick={onDelete}
              size="small"
              className="!p-1.5 !text-slate-400 hover:!text-red-600 hover:!bg-red-50 !rounded-md"
            >
              <DeleteIcon size={14} />
            </IconButton>
          </Tooltip>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <Tooltip title={isExpanded ? "Dock to side" : "Expand"}>
            <IconButton
              onClick={toggleExpand}
              size="small"
              className="!p-1.5 !text-slate-500 hover:!text-slate-800 hover:!bg-slate-100 !rounded-md"
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              size="small"
              className="!p-1.5 !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !rounded-md"
            >
              <CloseIcon size={14} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};


const REACT_AGENT_CONFIG_KEYS = [
  'model',
  'user_query',
  'max_iterations',
  'temperature',
  'response_format',
  'return_trace',
  'fallback_answer',
];

const REACT_AGENT_MEMORY_KEYS = [
  'memory_window',
  'memory_mode',
  'persist_memory',
  'memory_context',
];

const getParamByKey = (params = [], key) => params.find((param) => param?.key === key);
const withParamValue = (params = [], key, value, fallbackType = 'string') => {
  const exists = params.some((param) => param?.key === key);
  if (exists) {
    return params.map((param) => (param?.key === key ? { ...param, value } : param));
  }
  return [...params, { key, value, type: fallbackType }];
};

const sanitizeToolId = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);

const createEmptyToolParameter = () => ({
  name: 'input_name',
  type: 'string',
  required: false,
  description: 'Explain the value the LLM must provide for this input.',
  example: '',
  enum: null,
});

const valueToConfigValue = (value) => {
  if (value === undefined || value === null) return '';
  return value;
};

const getNodeInputParameters = (tool = {}) =>
  Array.isArray(tool.inputParameters)
    ? tool.inputParameters
    : Array.isArray(tool.inputs)
      ? tool.inputs
      : [];

const toolToCanonicalSchema = (tool = {}) => {
  const inputParameters = getNodeInputParameters(tool);
  const config = inputParameters.reduce((acc, param) => {
    const key = param?.key || param?.name;
    if (!key) return acc;
    acc[key] = valueToConfigValue(param.value);
    return acc;
  }, {});

  return {
    name: tool.displayName || tool.name || tool.tool_name || 'Selected Tool',
    description: tool.description || 'Describe what this tool returns and when the agent should use it.',
    node_type: tool.type || tool.node_type || 'API caller',
    config,
    parameters: [],
  };
};

const findRegisteredToolForSchema = (schema = {}, registeredTools = []) => {
  const schemaName = String(schema.name || schema.tool_name || '').toLowerCase();
  const schemaType = String(schema.node_type || schema.type || '').toLowerCase();
  const configKeys = new Set(Object.keys(schema.config || {}));

  return registeredTools.find((tool) => {
    const names = [tool.name, tool.displayName, tool.tool_name].map((value) => String(value || '').toLowerCase());
    const type = String(tool.type || tool.node_type || '').toLowerCase();
    const inputKeys = getNodeInputParameters(tool).map((input) => input?.key || input?.name).filter(Boolean);
    const configMatches = inputKeys.length > 0 && inputKeys.every((key) => configKeys.has(key));

    return (schemaName && names.includes(schemaName))
      || (schemaType && type === schemaType && configMatches)
      || (schemaType && type === schemaType && schemaName && names.some((name) => name.includes(schemaName)));
  });
};

const FieldShell = ({ label, hint, children, badge }) => (
  <div className="space-y-1.5">
    <div className="flex items-start justify-between gap-2">
      <div>
        <label className="text-[11.5px] font-semibold text-slate-700">{label}</label>
        {hint && <p className="text-[10.5px] text-slate-400 leading-snug">{hint}</p>}
      </div>
      {badge && <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{badge}</span>}
    </div>
    {children}
  </div>
);

const reactInputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-800 placeholder:text-slate-300 outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-200";

const SimpleInput = ({ value, onChange, placeholder, mono }) => (
  <input
    value={value ?? ''}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className={`${reactInputClass} ${mono ? 'font-mono' : ''}`}
  />
);

const SimpleTextarea = ({ value, onChange, placeholder, rows = 4, mono }) => (
  <textarea
    value={value ?? ''}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`${reactInputClass} resize-y leading-relaxed ${mono ? 'font-mono text-[11.5px]' : ''}`}
  />
);

const ReactAgentParameterCard = ({ param, nodeColor, localInputParams, onInputChange }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    {getParameterComponent(
      { ...param, type: param.type || (param.key === 'system_prompt' || param.key === 'memory_context' ? 'textarea' : 'string') },
      nodeColor,
      (params) => onInputChange(params),
      localInputParams,
      'inputParameters'
    )}
  </div>
);

const ReactAgentConfigPanel = ({ localInputParams, onInputChange, nodeColor }) => {
  const fields = REACT_AGENT_CONFIG_KEYS.map((key) => getParamByKey(localInputParams, key)).filter(Boolean);
  const hints = {
    model: 'Model id/provider name used by the ReAct loop.',
    user_query: 'The user task. Templates like {{CHAT_QUERY}} are supported.',
    max_iterations: 'Maximum think/tool/observe cycles before stopping.',
    temperature: 'Lower values are deterministic; higher values are more creative.',
    response_format: 'Final answer format expected from the agent.',
    return_trace: 'Return intermediate reasoning/tool trace for debugging.',
    fallback_answer: 'Safe answer when the agent cannot finish.',
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot size={15} className="text-emerald-600" />
          <h4 className="text-[13px] font-semibold text-slate-800">Agent Configuration</h4>
        </div>
        <p className="text-[11.5px] text-slate-500">Core runtime settings that control how the ReAct agent plans, calls tools, and formats the final reply.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((param) => (
          <div key={param.key} className={param.key === 'fallback_answer' || param.key === 'user_query' ? 'md:col-span-2' : ''}>
            <div className="mb-1 text-[10.5px] text-slate-400">{hints[param.key]}</div>
            <ReactAgentParameterCard param={param} nodeColor={nodeColor} localInputParams={localInputParams} onInputChange={onInputChange} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ReactAgentPromptPanel = ({ localInputParams, onInputChange, nodeColor }) => {
  const prompt = getParamByKey(localInputParams, 'system_prompt');
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center gap-2 mb-1">
          <TerminalSquare size={15} className="text-slate-600" />
          <h4 className="text-[13px] font-semibold text-slate-800">System Prompt</h4>
        </div>
        <p className="text-[11.5px] text-slate-500">Give the agent its role, allowed behaviours, tool-use rules, and final answer constraints.</p>
      </div>
      {prompt ? (
        <ReactAgentParameterCard param={{ ...prompt, type: 'textarea' }} nodeColor={nodeColor} localInputParams={localInputParams} onInputChange={onInputChange} />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-[12px] text-slate-400">No system_prompt field found.</div>
      )}
    </div>
  );
};

const ReactAgentMemoryPanel = ({ localInputParams, onInputChange, nodeColor }) => {
  const fields = REACT_AGENT_MEMORY_KEYS.map((key) => getParamByKey(localInputParams, key)).filter(Boolean);
  const hints = {
    memory_window: 'How many recent messages/turns should be included.',
    memory_mode: 'How memory is selected. Example: auto, none, summary.',
    persist_memory: 'Whether conversation memory is stored across sessions.',
    memory_context: 'Static context injected into memory, such as store, user, or currency.',
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={15} className="text-violet-600" />
          <h4 className="text-[13px] font-semibold text-slate-800">Memory</h4>
        </div>
        <p className="text-[11.5px] text-slate-500">Configure what the agent remembers and which session variables are added to its context.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((param) => (
          <div key={param.key} className={param.key === 'memory_context' ? 'md:col-span-2' : ''}>
            <div className="mb-1 text-[10.5px] text-slate-400">{hints[param.key]}</div>
            <ReactAgentParameterCard param={param} nodeColor={nodeColor} localInputParams={localInputParams} onInputChange={onInputChange} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ReactAgentToolsPanel = ({ localInputParams, onInputChange, availableTools = [] }) => {
  const toolsParam = getParamByKey(localInputParams, 'tools');
  const tools = Array.isArray(toolsParam?.value) ? toolsParam.value : [];
  const [openIndex, setOpenIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (openIndex > Math.max(tools.length - 1, 0)) setOpenIndex(Math.max(tools.length - 1, 0));
  }, [tools.length, openIndex]);

  const updateTools = (nextTools) => onInputChange(withParamValue(localInputParams, 'tools', nextTools, 'array'));
  const updateTool = (index, patch) => updateTools(tools.map((tool, idx) => (idx === index ? { ...tool, ...patch } : tool)));
  const updateToolConfig = (index, config) => updateTool(index, { config });
  const updateToolParameters = (index, parameters) => updateTool(index, { parameters });

  const addSelectedTool = (toolSchema) => {
    const next = [...tools, toolSchema];
    updateTools(next);
    setOpenIndex(next.length - 1);
    setPickerOpen(false);
  };

  const removeTool = (index) => {
    updateTools(tools.filter((_, idx) => idx !== index));
    setOpenIndex((current) => Math.max(0, Math.min(current, tools.length - 2)));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={15} className="text-indigo-600" />
              <h4 className="text-[13px] font-semibold text-slate-800">Tools</h4>
            </div>
            <p className="text-[11.5px] text-slate-500">Choose registered tools the agent can call. Each selected tool stores its node input values inside the tool config.</p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <Plus size={13} /> Add tool
          </button>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center bg-white">
          <Wrench size={22} className="mx-auto mb-2 text-slate-300" />
          <p className="text-[12px] font-medium text-slate-500">No tools selected</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Click Add tool to search registered tools and attach one to this agent.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map((tool, index) => {
            const isOpen = openIndex === index;
            const safeId = sanitizeToolId(tool.name || tool.tool_name);
            const parameters = Array.isArray(tool.parameters || tool.args) ? (tool.parameters || tool.args) : [];
            const config = tool.config && typeof tool.config === 'object' && !Array.isArray(tool.config) ? tool.config : {};
            return (
              <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Wrench size={14} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-slate-800">{tool.name || tool.tool_name || 'Unnamed Tool'}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[10.5px] text-slate-400">id: {safeId || 'generated from name'} · {Object.keys(config).length} config value{Object.keys(config).length === 1 ? '' : 's'} · {parameters.length} dynamic parameter{parameters.length === 1 ? '' : 's'}</p>
                  </div>
                  <button type="button" onClick={(event) => { event.stopPropagation(); removeTool(index); }} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                </button>

                {isOpen && (
                  <div className="space-y-5 border-t border-slate-100 bg-slate-50/30 p-4">
                    <div className="grid grid-cols-1 gap-3">
                      <FieldShell label="Tool name" hint="Shown to the model and converted to a safe callable id automatically." badge={safeId || 'safe id'}>
                        <SimpleInput value={tool.name || tool.tool_name || ''} onChange={(value) => updateTool(index, { name: value, node_type: tool.node_type || tool.type || 'API caller' })} placeholder="Get Product Details" />
                      </FieldShell>
                      <FieldShell label="Description" hint="Tell the model exactly what the tool returns and when it should call it.">
                        <SimpleTextarea value={tool.description || ''} onChange={(value) => updateTool(index, { description: value })} rows={3} placeholder="Get full details of one product by numeric id..." />
                      </FieldShell>
                    </div>

                    <ToolConfigEditor config={config} registeredTool={findRegisteredToolForSchema(tool, availableTools)} onChange={(configValue) => updateToolConfig(index, configValue)} />
                    <ToolParameterEditor parameters={parameters} onChange={(nextParams) => updateToolParameters(index, nextParams)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddToolPickerDialog
        open={pickerOpen}
        availableTools={availableTools}
        onClose={() => setPickerOpen(false)}
        onAdd={addSelectedTool}
      />
    </div>
  );
};

const AddToolPickerDialog = ({ open, availableTools = [], onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [draftConfig, setDraftConfig] = useState({});

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedTool(null);
      setDraftConfig({});
    }
  }, [open]);

  const filteredTools = availableTools.filter((tool) => {
    const haystack = `${tool.name || ''} ${tool.displayName || ''} ${tool.description || ''} ${tool.type || ''}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  const handleSelect = (tool) => {
    setSelectedTool(tool);
    setDraftConfig(toolToCanonicalSchema(tool).config || {});
  };

  const handleConfigValueChange = (key, value) => {
    setDraftConfig((current) => ({ ...current, [key]: value }));
  };

  const handleAdd = () => {
    if (!selectedTool) return;
    onAdd({ ...toolToCanonicalSchema(selectedTool), config: draftConfig });
  };

  const selectedInputs = getNodeInputParameters(selectedTool || {});

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 60px -24px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
        },
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">Add tool to ReAct Agent</h3>
          <p className="mt-0.5 text-[11.5px] text-slate-400">Search registered tools, review its node inputs, then attach it to the agent.</p>
        </div>
        <IconButton onClick={onClose} size="small" className="!rounded-md !text-slate-400 hover:!bg-slate-100 hover:!text-slate-700">
          <CloseIcon size={15} />
        </IconButton>
      </div>

      <div className="grid max-h-[68vh] grid-cols-1 overflow-hidden md:grid-cols-12">
        <div className="border-r border-slate-100 bg-slate-50/50 p-4 md:col-span-5">
          <div className="relative mb-3">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[12.5px] text-slate-800 placeholder:text-slate-300 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-1.5 overflow-y-auto pr-1 md:max-h-[52vh]">
            {filteredTools.length > 0 ? filteredTools.map((tool, index) => {
              const selected = selectedTool === tool;
              return (
                <button
                  key={tool.id || tool.key || index}
                  type="button"
                  onClick={() => handleSelect(tool)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${selected ? 'border-slate-400 bg-white' : 'border-transparent hover:border-slate-200 hover:bg-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600"><Wrench size={13} /></div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-slate-800">{tool.displayName || tool.name || 'Unnamed tool'}</p>
                      <p className="truncate text-[10.5px] text-slate-400">{tool.type || tool.node_type || 'Registered tool'}</p>
                    </div>
                  </div>
                  {tool.description && <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-snug text-slate-500">{tool.description}</p>}
                </button>
              );
            }) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-[12px] text-slate-400">No tools found.</div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto p-5 md:col-span-7 md:max-h-[68vh]">
          {selectedTool ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Wrench size={14} /></div>
                  <div className="min-w-0">
                    <h4 className="truncate text-[13px] font-semibold text-slate-900">{selectedTool.displayName || selectedTool.name}</h4>
                    <p className="text-[10.5px] text-slate-400">The hidden node_type will be saved as <span className="font-mono">{selectedTool.type || selectedTool.node_type || 'API caller'}</span>.</p>
                  </div>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-500">{selectedTool.description || 'No description provided.'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h5 className="text-[12px] font-semibold text-slate-800">Node input values</h5>
                <p className="mt-0.5 text-[10.5px] text-slate-400">These values will be stored inside this tool's config. Use placeholders like {'{{product_id}}'} when the agent should fill a value later.</p>
                <div className="mt-3 space-y-3">
                  {selectedInputs.length > 0 ? selectedInputs.map((input) => {
                    const key = input.key || input.name;
                    return (
                      <div key={key} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="mb-1.5 flex items-start justify-between gap-2">
                          <div>
                            <label className="font-mono text-[11.5px] font-semibold text-slate-700">{key}</label>
                            {input.description && <p className="mt-0.5 text-[10.5px] leading-snug text-slate-400">{input.description}</p>}
                          </div>
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-slate-500">{input.type || 'text'}</span>
                        </div>
                        <textarea
                          value={typeof draftConfig[key] === 'object' ? JSON.stringify(draftConfig[key], null, 2) : String(draftConfig[key] ?? '')}
                          onChange={(event) => handleConfigValueChange(key, event.target.value)}
                          rows={typeof draftConfig[key] === 'object' ? 3 : 1}
                          placeholder={input.example !== undefined ? String(input.example) : `Enter ${key}`}
                          className={`${reactInputClass} font-mono text-[11.5px] resize-y`}
                        />
                      </div>
                    );
                  }) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-[11.5px] text-slate-400">This tool has no configurable node inputs.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
              <div>
                <Search size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[12px] font-semibold text-slate-600">Select a tool to review</p>
                <p className="mt-1 text-[11px] text-slate-400">Pick from the registered tools list on the left.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="button" onClick={handleAdd} disabled={!selectedTool} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
          <Plus size={13} /> Add selected tool
        </button>
      </div>
    </Dialog>
  );
};


const ToolConfigEditor = ({ config, registeredTool, onChange }) => {
  const entries = Object.entries(config || {});
  const registeredInputs = getNodeInputParameters(registeredTool);
  const metaByKey = registeredInputs.reduce((acc, input) => {
    const key = input?.key || input?.name;
    if (key) acc[key] = input;
    return acc;
  }, {});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const parseConfigValue = (raw) => {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('{{')) return raw;
    try {
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed);
    } catch (_) {}
    return raw;
  };

  const setConfigValue = (key, value) => onChange({ ...(config || {}), [key]: parseConfigValue(value) });
  const removeConfigKey = (key) => {
    const next = { ...(config || {}) };
    delete next[key];
    onChange(next);
  };
  const addConfigKey = () => {
    if (!newKey.trim()) return;
    setConfigValue(newKey.trim(), newValue);
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-start gap-2">
        <Database size={14} className="mt-0.5 text-slate-500" />
        <div>
          <h5 className="text-[12px] font-semibold text-slate-800">Config</h5>
          <p className="text-[10.5px] text-slate-400">Exactly the inputParameters expected by the selected node, as a flat object. Use {'{{placeholder}}'} values for LLM-filled inputs.</p>
        </div>
      </div>
      <div className="space-y-2">
        {entries.map(([key, value]) => {
          const meta = metaByKey[key];
          return (
            <div key={key} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11.5px] font-semibold text-slate-700">{key}</p>
                  {meta?.description && <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-slate-400">{meta.description}</p>}
                </div>
                {meta?.type && <span className="rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-slate-500 border border-slate-200">{meta.type}</span>}
              </div>
              <div className="grid grid-cols-12 gap-2 items-start">
                <textarea value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')} onChange={(event) => setConfigValue(key, event.target.value)} rows={typeof value === 'object' ? 3 : 1} className={`${reactInputClass} col-span-11 font-mono text-[11.5px] resize-y`} />
                <button onClick={() => removeConfigKey(key)} className="col-span-1 mt-1 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-12 gap-2 items-center border-t border-slate-100 pt-2">
          <div className="col-span-4"><SimpleInput value={newKey} onChange={setNewKey} placeholder="timeout" mono /></div>
          <div className="col-span-7"><SimpleInput value={newValue} onChange={setNewValue} placeholder="20 or {{value}} or JSON" mono /></div>
          <button onClick={addConfigKey} className="col-span-1 rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Plus size={13} /></button>
        </div>
      </div>
    </div>
  );
};

const ToolParameterEditor = ({ parameters, onChange }) => {
  const updateParam = (idx, patch) => onChange(parameters.map((param, index) => (index === idx ? { ...param, ...patch } : param)));
  const removeParam = (idx) => onChange(parameters.filter((_, index) => index !== idx));
  const addParam = () => onChange([...(parameters || []), createEmptyToolParameter()]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h5 className="text-[12.5px] font-semibold text-slate-800">Dynamic Parameters</h5>
          <p className="mt-0.5 text-[10.5px] leading-snug text-slate-400">Arguments the agent must decide at runtime before calling this tool. Example: product_id or search query.</p>
        </div>
        <button type="button" onClick={addParam} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300">
          <Plus size={12} /> Add field
        </button>
      </div>
      {parameters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
          <p className="text-[12px] font-medium text-slate-500">No dynamic parameters</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Use config placeholders like {'{{q}}'} and add matching dynamic parameters only when the model should fill them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parameters.map((param, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11.5px] font-semibold text-slate-700">Dynamic field {idx + 1}</span>
                  <p className="text-[10.5px] text-slate-400">Define one value the LLM can supply to the tool.</p>
                </div>
                <button type="button" onClick={() => removeParam(idx)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-5">
                  <FieldShell label="Parameter name" hint="Must match the placeholder used in config, for example {{product_id}}.">
                    <SimpleInput value={param.name || param.key || ''} onChange={(value) => updateParam(idx, { name: value })} placeholder="product_id" mono />
                  </FieldShell>
                </div>
                <div className="md:col-span-3">
                  <FieldShell label="Type" hint="Expected value type.">
                    <select value={param.type || 'string'} onChange={(event) => updateParam(idx, { type: event.target.value })} className={reactInputClass}>
                      {['string', 'integer', 'number', 'boolean', 'object', 'array'].map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </FieldShell>
                </div>
                <div className="md:col-span-4">
                  <FieldShell label="Example" hint="Helps users and the model understand the value.">
                    <SimpleInput value={param.example ?? ''} onChange={(value) => updateParam(idx, { example: value })} placeholder="121" />
                  </FieldShell>
                </div>
                <div className="md:col-span-12">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600">
                    <input type="checkbox" checked={Boolean(param.required)} onChange={(event) => updateParam(idx, { required: event.target.checked })} />
                    Required before calling this tool
                  </label>
                </div>
                <div className="md:col-span-12">
                  <FieldShell label="Description" hint="Tell the agent exactly how to choose this value.">
                    <SimpleTextarea value={param.description || ''} onChange={(value) => updateParam(idx, { description: value })} rows={2} placeholder="Numeric product id returned by search_products." />
                  </FieldShell>
                </div>
                <div className="md:col-span-12">
                  <FieldShell label="Allowed values" hint="Optional comma separated list. Leave empty when any value is allowed.">
                    <SimpleInput value={Array.isArray(param.enum) ? param.enum.join(', ') : (param.enum || '')} onChange={(value) => updateParam(idx, { enum: value ? value.split(',').map((v) => v.trim()).filter(Boolean) : null })} placeholder="asc, desc" />
                  </FieldShell>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const ReactAgentOutputPanel = ({ localOutputParams, onOutputParamUpdate, nodeColor }) => (
  <div className="space-y-4">
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 mb-1">
        <OutputIcon size={15} className="text-slate-600" />
        <h4 className="text-[13px] font-semibold text-slate-800">Output</h4>
      </div>
      <p className="text-[11.5px] text-slate-500">Map the ReAct agent final answer into an output variable for downstream nodes.</p>
    </div>
    {localOutputParams?.length > 0 ? (
      <div className="space-y-3">
        {localOutputParams.map((param, index) => (
          <OutputParameterComponents key={index} param={param} index={index} color={nodeColor} onUpdate={(updated) => onOutputParamUpdate(index, updated)} />
        ))}
      </div>
    ) : (
      <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg">
        <OutputIcon size={20} className="mx-auto text-slate-300 mb-2" />
        <p className="text-[12px] font-medium text-slate-500">No Output Parameters</p>
      </div>
    )}
  </div>
);

const NodeDetailsModal = ({
  flowId,
  open,
  onClose,
  node,
  onDelete,
  onUpdateParameters,
  disabled,
  loading,
  sections = {
    displayBasicInformation: true,
    displayInputParameters: true,
    displayOutputParameters: true,
  },
  flow,
  onOpenExecutionOutput,
}) => {
  const dispatch = useDispatch();
  const registeredTools = useSelector((state) => state.studio.tools || []);
  // Default to big screen centered modal
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [localInputParams, setLocalInputParams] = useState([]);
  const [localOutputParams, setLocalOutputParams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [nodeTestOpen, setNodeTestOpen] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  useEffect(() => {
    if (node?.data) {
      setLocalInputParams(node.data.inputParameters || []);
      setLocalOutputParams(node.data.outputParameters || []);
      setActiveTab(0);
      setIsDirty(false);
    }
  }, [node]);

  const nodeDocs = getNodeDocs(node);

  const handleInputChange = (updatedParams) => {
    setLocalInputParams(updatedParams);
    setIsDirty(true);
  };

  const handleOutputParamUpdate = (index, updatedParam) => {
    const updated = [...localOutputParams];
    updated[index] = updatedParam;
    setLocalOutputParams(updated);
    setIsDirty(true);
  };

  const handleCopyExample = () => {
    if (nodeDocs?.exampleConfig) {
      navigator.clipboard.writeText(JSON.stringify(nodeDocs.exampleConfig, null, 2));
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    }
  };

  const handleTestClick = () => {
    if (!node?.id) return;
    setNodeTestOpen(true);
  };

  const handleSaveChanges = () => {
    if (node && isDirty) {
      dispatch(
        updateNode({
          flow: flow,
          nodeId: node.id,
          updatedNode: localInputParams,
          parameter: 'inputParameters',
        })
      );

      dispatch(
        updateNode({
          flow: flow,
          nodeId: node.id,
          updatedNode: localOutputParams,
          parameter: 'outputParameters',
        })
      );

      setIsDirty(false);
    }
  };

  const handleUpdateName = (newName) => {
    if (node && node.id) {
      dispatch(
        updateNode({
          flow: flow,
          nodeId: node.id,
          updatedNode: newName,
          parameter: 'displayName',
        })
      );
    }
  };

  const handleDelete = () => {
    if (onDelete && node) {
      onDelete(node);
      onClose();
    }
  };

  if (!node) return null;

  const { type, data } = node;
  const {
    name,
    description,
    version,
    isPublic,
    createdBy,
    status,
    tags,
  } = data || {};

  const nodeColor = getNodeColor(type || data?.type);
  const isReactAgentNode = [type, data?.type, data?.nodeType].some((value) => String(value || '').toLowerCase().startsWith('react_agent'));

  const basicInfo = [
    { label: 'Created By', value: createdBy || 'User', icon: <PersonIcon size={14} /> },
    { label: 'Version', value: version || '1.0.0', icon: <SettingsIcon size={14} /> },
    { label: 'Visibility', value: isPublic ? 'Public' : 'Private', icon: <PublicIcon size={14} /> },
    { label: 'Status', value: status ? 'Active' : 'Draft', icon: <CodeIcon size={14} /> },
  ];

  const headerProps = {
    title: node?.data?.displayName || node?.data?.name || node?.name,
    type: node?.data?.type || node?.type,
    color: nodeColor,
    onClose,
    onDelete: handleDelete,
    onUpdateName: handleUpdateName,
    handleSaveChanges,
    isDirty,
    disabled,
    loading,
    handleTestClick,
    isExpanded,
    toggleExpand: () => setIsExpanded(!isExpanded),
  };

  return (
    <>
      {/* ─── EXPANDED CENTERED MODAL VIEW (DEFAULT) ─── */}
      {isExpanded ? (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '82vh',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Main Area */}
            <div className="lg:col-span-8 border-r border-slate-100 flex flex-col h-full overflow-hidden">
              {/* Pill-style tab bar */}
              <div className="flex items-center gap-0.5 px-5 py-1.5 border-b border-slate-100 bg-slate-50/50">
                {(isReactAgentNode
                  ? [
                      { idx: 0, icon: <Sliders size={13} />, label: 'Configuration' },
                      { idx: 1, icon: <TerminalSquare size={13} />, label: 'Prompt' },
                      { idx: 2, icon: <Brain size={13} />, label: 'Memory' },
                      { idx: 3, icon: <Wrench size={13} />, label: `Tools (${(getParamByKey(localInputParams, 'tools')?.value || []).length || 0})` },
                      { idx: 4, icon: <OutputIcon size={13} />, label: `Output (${localOutputParams?.length || 0})` },
                    ]
                  : [
                      { idx: 0, icon: <InputIcon size={13} />, label: `Inputs (${localInputParams?.length || 0})` },
                      { idx: 1, icon: <OutputIcon size={13} />, label: `Outputs (${localOutputParams?.length || 0})` },
                      { idx: 2, icon: <BookOpen size={13} />, label: "Docs" },
                    ]
                ).map((t) => (
                  <button
                    key={t.idx}
                    onClick={() => setActiveTab(t.idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                      activeTab === t.idx
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {isReactAgentNode && activeTab === 0 && (
                  <ReactAgentConfigPanel localInputParams={localInputParams} onInputChange={handleInputChange} nodeColor={nodeColor} />
                )}
                {isReactAgentNode && activeTab === 1 && (
                  <ReactAgentPromptPanel localInputParams={localInputParams} onInputChange={handleInputChange} nodeColor={nodeColor} />
                )}
                {isReactAgentNode && activeTab === 2 && (
                  <ReactAgentMemoryPanel localInputParams={localInputParams} onInputChange={handleInputChange} nodeColor={nodeColor} />
                )}
                {isReactAgentNode && activeTab === 3 && (
                  <ReactAgentToolsPanel localInputParams={localInputParams} onInputChange={handleInputChange} availableTools={registeredTools} />
                )}
                {isReactAgentNode && activeTab === 4 && (
                  <ReactAgentOutputPanel localOutputParams={localOutputParams} onOutputParamUpdate={handleOutputParamUpdate} nodeColor={nodeColor} />
                )}

                {/* Tab 0: Input Parameters */}
                {!isReactAgentNode && activeTab === 0 && (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-[13px] font-semibold text-slate-800">Input Parameters</h4>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Configure values and connectors for this node.
                      </p>
                    </div>

                    {localInputParams?.length > 0 ? (
                      <div className="space-y-3">
                        {localInputParams.map((param, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                          >
                            {getParameterComponent(param, nodeColor, (params) => handleInputChange(params), localInputParams, 'inputParameters')}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg">
                        <Sliders size={20} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[12px] font-medium text-slate-500">No Input Parameters</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">This node has no configurable inputs.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 1: Output Parameters */}
                {!isReactAgentNode && activeTab === 1 && (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-[13px] font-semibold text-slate-800">Output Parameters</h4>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Map output values to downstream nodes.
                      </p>
                    </div>

                    {localOutputParams?.length > 0 ? (
                      <div className="space-y-3">
                        {localOutputParams.map((param, index) => (
                          <OutputParameterComponents
                            key={index}
                            param={param}
                            index={index}
                            color={nodeColor}
                            onUpdate={(updated) => handleOutputParamUpdate(index, updated)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg">
                        <OutputIcon size={20} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[12px] font-medium text-slate-500">No Output Parameters</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">This node has no configured outputs.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Documentation */}
                {!isReactAgentNode && activeTab === 2 && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-slate-600" />
                        <h4 className="text-[13px] font-semibold text-slate-800">
                          {toDisplayString(nodeDocs?.title, "Node Documentation")}
                        </h4>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {toDisplayString(nodeDocs?.summary) || toDisplayString(description)}
                      </p>
                      {nodeDocs?.whenToUse && (
                        <div className="mt-3 text-[11.5px] text-slate-600 bg-white p-2.5 rounded-md border border-slate-200">
                          <span className="font-semibold text-slate-700">When to use: </span>
                          {toDisplayString(nodeDocs.whenToUse)}
                        </div>
                      )}
                    </div>

                    {nodeDocs?.parameters?.length > 0 && (
                      <div>
                        <h5 className="text-[12px] font-semibold text-slate-700 mb-2">Field Reference</h5>
                        <div className="space-y-2">
                          {nodeDocs.parameters.map((p, pIdx) => (
                            <div key={pIdx} className="p-3 rounded-md border border-slate-200 bg-white">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[11.5px] font-semibold text-slate-800">{toDisplayString(p.name)}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                  {toDisplayString(p.type, "text")} · {p.required ? "required" : "optional"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{toDisplayString(p.description)}</p>
                              {toDisplayString(p.example) && (
                                <div className="mt-1.5 font-mono text-[10.5px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 whitespace-pre-wrap break-words max-h-28 overflow-auto">
                                  <span className="text-slate-400">e.g. </span>
                                  {toDisplayString(p.example)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nodeDocs?.exampleWorkflow && (
                      <div>
                        <h5 className="text-[12px] font-semibold text-slate-700 mb-1.5">Pipeline Example</h5>
                        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-[11px] font-mono text-slate-600 overflow-x-auto">
                          {toDisplayString(nodeDocs.exampleWorkflow)}
                        </div>
                      </div>
                    )}

                    {nodeDocs?.exampleConfig && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-[12px] font-semibold text-slate-700">Sample Payload</h5>
                          <button
                            onClick={handleCopyExample}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                          >
                            {copiedExample ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            <span>{copiedExample ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono overflow-auto max-h-44 leading-relaxed">
                          <code>{JSON.stringify(nodeDocs.exampleConfig, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between bg-white">
                <span className="text-[11px] text-slate-400">
                  {isDirty ? 'You have unsaved changes' : 'Up to date'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={!isDirty || disabled || loading}
                    className="px-3.5 py-1.5 text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {/* Node Info Card */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
                  <InfoIcon size={13} className="text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-700">Details</span>
                </div>
                <DescriptionSection description={description} />
                <TagsSection tags={tags} />
                <div className="pt-2 border-t border-slate-100 space-y-0">
                  {basicInfo.map((item) => (
                    <InfoItem key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Quick Test Card */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <PlayIcon size={13} className="text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-700">Quick Test</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Run this node in isolation to preview output.
                </p>
                <button
                  onClick={handleTestClick}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 rounded-md transition-colors"
                >
                  <PlayIcon size={12} /> Run Test
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      ) : (
        /* ─── DOCKED RIGHT DRAWER VIEW ─── */
        <Drawer
          anchor="right"
          open={open}
          onClose={onClose}
          PaperProps={{
            sx: {
              width: 520,
              maxWidth: '100%',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isReactAgentNode ? (
              <>
                <CustomAccordion title="Configuration" icon={<Sliders size={14} />} emptyStateMessage="No configuration fields.">
                  <ReactAgentConfigPanel localInputParams={localInputParams} onInputChange={handleInputChange} nodeColor={nodeColor} />
                </CustomAccordion>
                <CustomAccordion title="Prompt" icon={<TerminalSquare size={14} />} emptyStateMessage="No prompt fields.">
                  <ReactAgentPromptPanel localInputParams={localInputParams} onInputChange={handleInputChange} nodeColor={nodeColor} />
                </CustomAccordion>
                <CustomAccordion title="Memory" icon={<Brain size={14} />} emptyStateMessage="No memory fields.">
                  <ReactAgentMemoryPanel localInputParams={localInputParams} onInputChange={handleInputChange} nodeColor={nodeColor} />
                </CustomAccordion>
                <CustomAccordion title="Tools" icon={<Wrench size={14} />} emptyStateMessage="No tools configured.">
                  <ReactAgentToolsPanel localInputParams={localInputParams} onInputChange={handleInputChange} availableTools={registeredTools} />
                </CustomAccordion>
                <CustomAccordion title="Output" icon={<OutputIcon size={14} />} emptyStateMessage="No output parameters configured.">
                  <ReactAgentOutputPanel localOutputParams={localOutputParams} onOutputParamUpdate={handleOutputParamUpdate} nodeColor={nodeColor} />
                </CustomAccordion>
              </>
            ) : (
              <>
                {sections.displayInputParameters && (
                  <CustomAccordion
                    title="Input Parameters"
                    icon={<InputIcon size={14} />}
                    emptyStateMessage="No input parameters available."
                  >
                    <div className="space-y-2.5">
                      {localInputParams.map((param, index) => (
                        <div key={index} className="p-3 rounded-md border border-slate-200 bg-white">
                          {getParameterComponent(param, nodeColor, (params) => handleInputChange(params), localInputParams, 'inputParameters')}
                        </div>
                      ))}
                    </div>
                  </CustomAccordion>
                )}

                {sections.displayOutputParameters && (
                  <CustomAccordion
                    title="Output Parameters"
                    icon={<OutputIcon size={14} />}
                    emptyStateMessage="No output parameters configured."
                  >
                    <div className="space-y-2.5">
                      {localOutputParams.map((param, index) => (
                        <OutputParameterComponents
                          key={index}
                          param={param}
                          index={index}
                          color={nodeColor}
                          onUpdate={(updated) => handleOutputParamUpdate(index, updated)}
                        />
                      ))}
                    </div>
                  </CustomAccordion>
                )}

                {sections.displayBasicInformation && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <DescriptionSection description={description} />
                    <TagsSection tags={tags} />
                    <div className="pt-2 border-t border-slate-100">
                      {basicInfo.map((item) => (
                        <InfoItem key={item.label} {...item} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Drawer>
      )}

      <NodeTestModal
        open={nodeTestOpen}
        onClose={() => setNodeTestOpen(false)}
        node={node}
      />
    </>
  );
};

export default NodeDetailsModal;
