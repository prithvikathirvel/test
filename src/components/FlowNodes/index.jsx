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
import { useMemo } from "react";

const getNodeIcon = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  
  switch (type?.toLowerCase()) {
    case "decision": return <GitBranch size={16} />;
    case "iterator": return <RotateCcw size={16} />;
    case "inputs": return <TextCursorInput size={16} />;
    case "output": return <CloudUpload size={16} />;
    case "question": return <HelpCircle size={16} />;
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

function CustomNode({ data, type }) {
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

  // Extract question text and options from inputParameters for question nodes
  const questionData = useMemo(() => {
    if (nodeType !== "question" || !data.inputParameters) return { text: "", options: [] };
    
    const questionTextParam = data.inputParameters.find(param => param.key === "question_text");
    const optionsParam = data.inputParameters.find(param => param.key === "options");
    
    const questionText = questionTextParam?.value || "";
    const options = [];
    
    if (optionsParam?.value && typeof optionsParam.value === "object") {
      Object.entries(optionsParam.value).forEach(([key, value], index) => {
        options.push({
          id: key,
          label: value,
          color: optionColors[index % optionColors.length]
        });
      });
    }
    
    return { text: questionText, options };
  }, [nodeType, data.inputParameters, optionColors]);

  return (
    <div className="relative min-w-[280px] bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/60 backdrop-blur-sm">
      
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-t-xl ${accent} relative overflow-hidden`}>
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
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 bg-white/90 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-white/90 text-xs font-medium">Ready</span>
        </div>
      </div>

      {/* Question Content */}
      {nodeType === "question" && questionData.text && (
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
            {questionData.text}
          </p>
          
          {/* Options List with inline handles */}
          {questionData.options.length > 0 && (
            <div className="space-y-3">
              {questionData.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3 group relative pr-6">
                  {/* <div className={`w-2.5 h-2.5 rounded-full ${option.color.bg} shadow-sm flex-shrink-0`}></div> */}
                  <span className="text-xs text-gray-500 font-medium flex-shrink-0 min-w-[50px]">
                    Option{index + 1}:
                  </span>
                  <span className="text-sm text-gray-800 font-medium truncate flex-1">
                    {option.label}
                  </span>
                  
                  {/* Handle positioned right next to this specific option */}
                  <Handle
                    key={option.id}
                    id={option.id}
                    type="source"
                    position={Position.Right}
                    className="!w-3 !h-3 border-2 border-white shadow-md !absolute !right-0 !top-1/2 !transform !-translate-y-1/2"
                    style={{ 
                      background: option.color.hex,
                      right: -6
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div> 
      )}

      {/* Regular Node Body */}
      {nodeType !== "question" && (
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
      )}

      {/* --- HANDLES --- */}

      {/* Input Handle */}
      {(nodeType !== "inputs") && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-white bg-gray-400 shadow-md hover:bg-gray-500 transition-colors"
          style={{ left: -6 }}
        />
      )}

      {/* Regular Output Handle */}
      {nodeType !== "output" && nodeType !== "decision" && nodeType !== "iterator" && nodeType !== "question" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-white bg-gray-400 shadow-md hover:bg-gray-500 transition-colors"
          style={{ right: -6 }}
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
            style={{ right: -6, top: '40%' }}
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-red-500 shadow-md hover:bg-red-600 transition-colors"
            style={{ right: -6, top: '60%' }}
          />
        </>
      )}

      {/* Iterator Node Handles */}
      {nodeType === "iterator" && (
        <>
          <Handle
            id="loop"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-blue-500 shadow-md hover:bg-blue-600 transition-colors"
            style={{ right: -6, top: '40%' }}
          />
          <Handle
            id="complete"
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white bg-gray-500 shadow-md hover:bg-gray-600 transition-colors"
            style={{ right: -6, top: '60%' }}
          />
        </>
      )}
    </div>
  );
}

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