import { Handle, Position } from "reactflow";
import { 
  Bot, 
  Workflow, 
  Database, 
  Circle, 
  CloudUpload, 
  GitBranch, 
  RotateCcw, 
  TextCursorInput,
  HelpCircle
} from 'lucide-react';
import { useSelector } from "react-redux";
import { memo, useMemo } from "react";
import { Tooltip } from "@mui/material";

const getNodeIcon = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  
  switch (type?.toLowerCase()) {
    case "decision": return <GitBranch size={15} />;
    case "iterator": return <RotateCcw size={15} />;
    case "inputs": return <TextCursorInput size={15} />;
    case "output": return <CloudUpload size={15} />;
    case "question": return <HelpCircle size={15} />;
    case "conditions": return <GitBranch size={15} />;
    case "condition": return <GitBranch size={15} />;
    case "start": return <Circle size={15} />;
  }
  
  if (!item) return <Workflow size={15} />;

  switch (item.type?.toLowerCase()) {
    case "tool": return <Workflow size={15} />;
    case "agent": return <Bot size={15} />;
    case "model": return <Database size={15} />;
    case "agentflow": return <Circle size={15} />;
    default: return <Circle size={15} />;
  }
};

// Minimalist executive SaaS colors (no rainbow toy colors!)
const getNodeAccent = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  
  switch (item?.type?.toLowerCase() || type?.toLowerCase()) {
    case "tool": return "bg-zinc-800 text-white";
    case "agent": return "bg-[#0d47a1] text-white";
    case "model": return "bg-zinc-900 text-white";
    case "inputs": return "bg-slate-700 text-white";
    case "output": return "bg-zinc-900 text-white";
    case "agentflow": return "bg-[#0d47a1] text-white";
    case "decision": return "bg-zinc-800 text-white";
    case "iterator": return "bg-zinc-800 text-white";
    case "question": return "bg-[#0d47a1] text-white";
    case "conditions": return "bg-zinc-800 text-white";
    case "condition": return "bg-zinc-800 text-white";
    case "start": return "bg-[#0d47a1] text-white";
    default: return "bg-zinc-900 text-white";
  }
};

const CustomNode = memo(function CustomNode({ data, type }) {
  const tools = useSelector((state) => state.studio.tools);
  const agents = useSelector((state) => state.studio.agents);
  const models = useSelector((state) => state.studio.models);
  const inputs = useSelector((state) => state.studio.inputs);
  const outputs = useSelector((state) => state.studio.outputs);
  const agentflows = useSelector((state) => state.studio.flows);
  
  const accent = getNodeAccent(type, tools, agents, models, inputs, outputs, agentflows);
  const icon = getNodeIcon(type, tools, agents, models, inputs, outputs, agentflows);
  const nodeType = type?.toLowerCase() || data?.type?.toLowerCase();

  const conditionData = useMemo(() => {
    if ((nodeType !== "conditions" && nodeType !== "condition") || !data.inputParameters) {
      return { conditions: [] };
    }

    const conditionParam = data.inputParameters.find(param => param.type === 'condition');
    const conditions = conditionParam?.value || [];

    return { conditions };
  }, [nodeType, data.inputParameters]);

  const questionData = useMemo(() => {
    const shouldShowOptions = nodeType === "question" || 
                             (nodeType === "inputs" && (data.name === "Question Node" || data.displayName === "Question Node"));
    
    if (!shouldShowOptions || !data.inputParameters) {
      return { questionText: '', options: {} };
    }

    const questionTextParam = data.inputParameters.find(param => param.key === 'question_text');
    const optionsParam = data.inputParameters.find(param => param.key === 'options');
    
    return {
      questionText: questionTextParam?.value || '',
      options: optionsParam?.value || {}
    };
  }, [nodeType, data.inputParameters, data.name, data.displayName]);

  const shouldShowOptionsUI = nodeType === "question" || 
                             (nodeType === "inputs" && (data.name === "Question Node" || data.displayName === "Question Node"));

  const displayOptions = useMemo(() => {
    let opts = questionData.options;

    if (Array.isArray(opts) && opts.length > 0 && opts.every(v => typeof v === 'string' && v.length === 1)) {
      opts = opts.join('');
    }

    if (typeof opts === 'object' && opts !== null && !Array.isArray(opts)) {
      const keys = Object.keys(opts);
      if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)) && typeof opts[k] === 'string' && opts[k].length === 1)) {
        opts = Object.values(opts).join('');
      }
    }

    if (typeof opts === 'string') {
      try {
        const trimmed = opts.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return opts;
  }, [questionData.options]);

  const isDynamic = (val) => {
    if (!val) return false;
    const str = String(val).trim();
    return str.startsWith('{{') && str.endsWith('}}');
  };

  return (
    <div className="relative min-w-[240px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-zinc-200">
      
      {/* Sleek Minimal Header */}
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-t-xl ${accent}`}>
        <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center border border-white/15">
          {nodeType === "iterator" ? (
            <div className="text-white animate-spin">{icon}</div>
          ) : (
            <div className="text-white">{icon}</div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs leading-tight truncate">
            {data.displayName || data.name}
          </h3>
          <p className="text-white/70 text-[10px] uppercase font-mono mt-0.5">
            {nodeType}
          </p>
        </div>
      </div>

      {/* Question / Options Content */}
      {shouldShowOptionsUI && (
        <div className="p-3.5 border-b border-zinc-100">
          {questionData.questionText && !isDynamic(questionData.questionText) && (
            <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-3 break-words">
              {questionData.questionText.length > 45 
                ? `${questionData.questionText.substring(0, 45)}...` 
                : questionData.questionText}
            </p>
          )}

          {displayOptions && typeof displayOptions === 'object' && !isDynamic(displayOptions) && Object.keys(displayOptions).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-zinc-500 font-medium">
                {Object.keys(displayOptions).length} option{Object.keys(displayOptions).length !== 1 ? 's' : ''}:
              </p>
              
              {Object.entries(displayOptions).map(([key, value], index) => (
                <div key={key} className="flex justify-between items-center gap-2 bg-zinc-50 border border-zinc-200/70 p-1.5 px-2.5 rounded-md text-xs">
                  <span className="font-mono text-[10px] text-zinc-400">0{index + 1}</span>
                  <span className="text-zinc-800 font-medium truncate flex-1 text-right">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Condition Content */}
      {(nodeType === "conditions" || nodeType === "condition") && Array.isArray(conditionData.conditions) && conditionData.conditions.length > 0 && (
        <div className="p-3.5 border-b border-zinc-100">
          <p className="text-xs text-zinc-700 font-medium mb-3">
            {conditionData.conditions.length} condition{conditionData.conditions.length !== 1 ? 's' : ''}
          </p>

          <div className="space-y-2">
            {conditionData.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2 relative pr-6 bg-zinc-50 border border-zinc-200 p-1.5 rounded-md">
                <span className="text-xs font-mono bg-zinc-200/70 text-zinc-700 px-1.5 py-0.5 rounded">
                  {condition.operator}
                </span>
                <span className="text-xs text-zinc-800 font-medium truncate">
                  {condition.comparisonValue || '(no value)'}
                </span>

                <Handle
                  key={index}
                  id={index.toString()}
                  type="source"
                  position={Position.Right}
                  className="!w-2.5 !h-2.5 border-2 border-white bg-[#0d47a1] !absolute !right-0 !top-1/2 !-translate-y-1/2"
                  style={{ right: -5 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Handle */}
      {nodeType !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 border-2 border-white bg-[#0d47a1]"
          style={{ left: -5, zIndex: 10 }}
        />
      )}

      {/* Regular Output Handle */}
      {nodeType !== "output" && nodeType !== "decision" && nodeType !== "iterator" && nodeType !== "conditions" && nodeType !== "condition" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 border-2 border-white bg-[#0d47a1]"
          style={{ right: -5, zIndex: 10 }}
        />
      )}

      {/* Decision Node Handles */}
      {nodeType === "decision" && (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            className="w-2.5 h-2.5 border-2 border-white bg-emerald-600"
            style={{ right: -5, top: '40%' }}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            className="w-2.5 h-2.5 border-2 border-white bg-red-600"
            style={{ right: -5, top: '65%' }}
          />
        </>
      )}

      {/* Iterator Node Handles */}
      {nodeType === "iterator" && (
        <>
          <Tooltip title="Loop">
            <Handle
              id="loop"
              type="source"
              position={Position.Right}
              className="w-2.5 h-2.5 border-2 border-white bg-[#0d47a1]"
              style={{ right: -5, top: '40%' }}
            />
          </Tooltip>
          <Handle
            id="complete"
            type="source"
            position={Position.Right}
            className="w-2.5 h-2.5 border-2 border-white bg-zinc-600"
            style={{ right: -5, top: '70%' }}
            focusable={true}
          />
        </>
      )}
    </div>
  );
});

export const useNodeTypes = () => {
  const tools = useSelector((state) => state.studio.tools);
  const agents = useSelector((state) => state.studio.agents);
  const models = useSelector((state) => state.studio.models);
  const inputs = useSelector((state) => state.studio.inputs);
  const outputs = useSelector((state) => state.studio.outputs);
  const flows = useSelector((state) => state.studio.flows);
    
  return useMemo(() => {
    const nodeTypes = {
      decision: CustomNode,
      iterator: CustomNode,
      question: CustomNode,
      conditions: CustomNode,
      condition: CustomNode,
      inputs: CustomNode,
      start: CustomNode,
    };
        
    [...tools, ...agents, ...models, ...inputs, ...outputs].forEach(item => {
      if (item && item.type) {
        nodeTypes[item.type] = CustomNode;
      }
    });
    
    if (Array.isArray(flows)) {
      flows.forEach(flow => {
        if (flow && flow.type) {
          nodeTypes[flow.type] = CustomNode;
        }
      });
    }
        
    return nodeTypes;
  }, [tools, agents, models, inputs, outputs, flows]);
};

export default CustomNode;
