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
  HelpCircle,
  Dot
} from 'lucide-react';
import { useSelector } from "react-redux";
import { memo, useMemo } from "react";
import { Tooltip } from "@mui/material";

const getNodeIcon = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  
  switch (type?.toLowerCase()) {
    case "decision": return <GitBranch size={16} />;
    case "iterator": return <RotateCcw size={16} />;
    case "inputs": return <TextCursorInput size={16} />;
    case "output": return <CloudUpload size={16} />;
    case "question": return <HelpCircle size={16} />;
    case "conditions": return <GitBranch size={16} />;
    case "condition": return <GitBranch size={16} />;
    case "start": return <Circle size={16} />;
  }
  
  if (!item) return <Workflow size={16} />;

  switch (item.type?.toLowerCase()) {
    case "tool": return <Workflow size={16} />;
    case "agent": return <Bot size={16} />;
    case "model": return <Database size={16} />;
    case "agentflow": return <Circle size={16} />;
    default: return <Circle size={16} />;
  }
};

const getNodeAccent = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  
  switch (item?.type?.toLowerCase() || type?.toLowerCase()) {
    case "tool": return "bg-gradient-to-r from-blue-500 to-blue-600";
    case "agent": return "bg-gradient-to-r from-emerald-500 to-emerald-600";
    case "model": return "bg-gradient-to-r from-purple-500 to-purple-600";
    case "inputs": return "bg-gradient-to-r from-cyan-500 to-cyan-600";
    case "output": return "bg-gradient-to-r from-orange-500 to-orange-600";
    case "agentflow": return "bg-gradient-to-r from-pink-500 to-pink-600";
    case "decision": return "bg-gradient-to-r from-amber-500 to-amber-600";
    case "iterator": return "bg-gradient-to-r from-indigo-500 to-indigo-600";
    case "question": return "bg-gradient-to-r from-violet-500 to-violet-600";
    case "conditions": return "bg-gradient-to-r from-amber-500 to-amber-600";
    case "condition": return "bg-gradient-to-r from-amber-500 to-amber-600";
    case "start": return "bg-gradient-to-r from-green-500 to-green-600";
    default: return "bg-gradient-to-r from-gray-400 to-gray-500";
  }
};

const getOptionColors = () => [
  { bg: 'bg-blue-500', hex: '#3B82F6' },
  { bg: 'bg-emerald-500', hex: '#10B981' },
  { bg: 'bg-orange-500', hex: '#F97316' },
  { bg: 'bg-rose-500', hex: '#F43F5E' },
  { bg: 'bg-purple-500', hex: '#A855F7' },
  { bg: 'bg-cyan-500', hex: '#06B6D4' },
  { bg: 'bg-amber-500', hex: '#F59E0B' },
  { bg: 'bg-pink-500', hex: '#EC4899' }
];

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
  const optionColors = getOptionColors();

  // Extract condition data from inputParameters for condition nodes
  const conditionData = useMemo(() => {
    if ((nodeType !== "conditions" && nodeType !== "condition") || !data.inputParameters) {
      return { conditions: [] };
    }

    const conditionParam = data.inputParameters.find(param => param.type === 'condition');
    const conditions = conditionParam?.value || [];

    return { conditions };
  }, [nodeType, data.inputParameters]);

  // Extract options data from inputParameters for question and inputs nodes
  const questionData = useMemo(() => {
    // Show options for question type OR inputs type with Question Node name
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

  // Check if should show options based on node type and name
  const shouldShowOptionsUI = nodeType === "question" || 
                             (nodeType === "inputs" && (data.name === "Question Node" || data.displayName === "Question Node"));

  // Process options to handle dynamic variables or stringified JSON
  const displayOptions = useMemo(() => {
    let opts = questionData.options;

    // Handle case where opts might be an array of characters
    if (Array.isArray(opts) && opts.length > 0 && opts.every(v => typeof v === 'string' && v.length === 1)) {
      opts = opts.join('');
    }

    // Handle case where opts might be an object map of characters (numeric keys)
    if (typeof opts === 'object' && opts !== null && !Array.isArray(opts)) {
      const keys = Object.keys(opts);
      if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)) && typeof opts[k] === 'string' && opts[k].length === 1)) {
        opts = Object.values(opts).join('');
      }
    }

    if (typeof opts === 'string') {
      try {
        // Try to parse if it's a valid JSON string (but not a template variable)
        const trimmed = opts.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        }
      } catch (e) {
        // Ignore parsing errors for template variables like {{abc}}
      }
    }
    return opts;
  }, [questionData.options]);

  // Helper to detect dynamic template variables
  const isDynamic = (val) => {
    if (!val) return false;
    const str = String(val).trim();
    return str.startsWith('{{') && str.endsWith('}}');
  };

  return (
    <div className="relative min-w-[250px] bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/60 backdrop-blur-sm">
      
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3.5 !rounded-md ${accent} relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-white/10 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
          {nodeType === "iterator" ? (
            <div className="text-white animate-spin">{icon}</div>
          ) : (
            <div className="text-white">{icon}</div>
          )}
        </div>
        
        <div className="relative z-10 flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">
            {data.displayName || data.name}
          </h3>
          <p className="text-white/80 text-xs capitalize mt-0.5 font-medium">
            {nodeType}
          </p>
        </div>
        
        {/* <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 bg-white/90 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-white/90 text-xs font-medium">Ready</span>
        </div> */}
      </div>

      {/* Question/Options Content */}
      {shouldShowOptionsUI && (
        <div className="px-5 py-5 border-b border-gray-100">
          {questionData.questionText && !isDynamic(questionData.questionText) && (
            <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4 break-words">
              {questionData.questionText.length > 40 
                ? `${questionData.questionText.substring(0, 40)}...` 
                : questionData.questionText}
            </p>
          )}

          {/* Options List */}
          {displayOptions && typeof displayOptions === 'object' && !isDynamic(displayOptions) && Object.keys(displayOptions).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-3">
                {Object.keys(displayOptions).length} option{Object.keys(displayOptions).length !== 1 ? 's' : ''}:
              </p>
              
              {Object.entries(displayOptions).map(([key, value], index) => {
                const colorIndex = index % optionColors.length;
                const color = optionColors[colorIndex];
                
                return (
                  <div key={key} className="flex justify-between gap-3 group bg-gray-100 p-2 px-4 rounded-lg">
                    <div>Option {index + 1}</div>
                    <span className="text-sm text-gray-800 font-medium truncate">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Condition Content */}
      {(nodeType === "conditions" || nodeType === "condition") && Array.isArray(conditionData.conditions) && conditionData.conditions.length > 0 && (
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
            {conditionData.conditions.length} condition{conditionData.conditions.length !== 1 ? 's' : ''}
          </p>

          {/* Conditions List with inline handles */}
          <div className="space-y-3">
            {conditionData.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-3 group relative pr-6 border-1 border-gray-300 p-2 rounded-md">
               {/* <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                  Condition {index + 1}:
                </span> */}
              <span className="text-sm text-gray-800 font-medium truncate flex gap-3 items-center">
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 border-1 border-gray-300 px-2 py-1 rounded">{condition.operator}</span>
                  <span className="text-xs text-gray-500 font-medium">{condition.comparisonValue || '(no value)'}</span>
                </span>

                {/* Handle positioned right next to this specific condition */}
                <Handle
                  key={index}
                  id={index.toString()}
                  type="source"
                  position={Position.Right}
                  className="!w-3 !h-3 border-2 border-white shadow-md !absolute !right-0 !top-1/2 !transform !-translate-y-1/2"
                  style={{
                    background: 'gray',
                    width: 10,
                    height: 10,
                    right: -6
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Node Body */}
      {/* {!shouldShowOptionsUI && (
        <div className="px-4 py-3.5">
          {data.description && (
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {data.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      )} */}

      {/* --- HANDLES --- */}

      {/* Input Handle - exclude start node type */}
      {nodeType !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-15 h-15 border-2 border-white bg-gray-400 shadow-md hover:bg-gray-500 transition-colors"
          style={{ 
            background: "gray",
            width: 10,
            height: 10,
            left: -6,
            zIndex: 10
          }}
        />
      )}

      {/* Regular Output Handle */}
      {nodeType !== "output" && nodeType !== "decision" && nodeType !== "iterator" && nodeType !== "conditions" && nodeType !== "condition" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-15 h-15 border-2 border-white bg-gray-400 shadow-md hover:bg-gray-500 transition-colors"
          style={{ right: -6,width: 10,height: 10,backgroundColor: 'gray',zIndex: 1000 }}
        />
      )}

      {/* Decision Node Handles */}
      {nodeType === "decision" && (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-emerald-500 shadow-md hover:bg-emerald-600 transition-colors"
            style={{ right: -6, top: '40%',width: 10,height: 10,backgroundColor: 'gray' }}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-red-500 shadow-md hover:bg-red-600 transition-colors"
            style={{ right: -6, top: '60%',width: 10,height: 10,backgroundColor: 'gray' }}
          />
        </>
      )}

      {/* Iterator Node Handles */}
      {nodeType === "iterator" && (
        <>
         <Tooltip title="Complete">

         <Handle
            id="loop"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-blue-500 shadow-md hover:bg-blue-600 transition-colors"
            style={{ right: -6, top: '40%',width: 10,height: 10,backgroundColor: 'gray' }}
          />

         </Tooltip>
          <Handle
            id="complete"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-gray-500 shadow-md hover:bg-gray-600 transition-colors"
            style={{ right: -6, top: '70%',width: 10,height: 10,backgroundColor: 'gray' }}
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