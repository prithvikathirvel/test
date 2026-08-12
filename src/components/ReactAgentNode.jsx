import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Bot, Wrench, Settings2, Plus } from 'lucide-react';

function ReActAgentNode({ id, data, selected }) {
    return (
        <div className={`w-80 bg-white rounded-2xl shadow-xl transition-all ${selected ? 'ring-4 ring-indigo-500' : 'border border-gray-200'}`}>
            {/* Input Handle (Top) */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-t-2xl border-b border-indigo-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Autonomous ReAct Agent</h3>
                        <p className="text-xs text-indigo-600 font-medium">{data.model}</p>
                    </div>
                </div>
                <Settings2 size={16} className="text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors" />
            </div>

            {/* Body: Prompt & Memory */}
            <div className="p-4 bg-white">
                <div className="mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Prompt</label>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 italic bg-gray-50 p-2 rounded-md border border-gray-100">
                        "{data.system_prompt}"
                    </p>
                </div>

                {/* Body: Attached Tools */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Attached Tools ({data.tools?.length || 0})</span>
                    </label>

                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {data.tools?.map((tool, idx) => (
                            <div key={idx} className="flex items-center p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                                <Wrench size={12} className="text-slate-400 mr-2" />
                                <span className="font-medium text-slate-700 flex-1 truncate">{tool.name}</span>
                                <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-slate-400 border border-slate-200 uppercase">
                                    {tool.node_type}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Add Tool Button (Triggers Right Sidebar in real app) */}
                    <button
                        onClick={() => data.onAddTool(id)}
                        className="mt-3 w-full flex items-center justify-center py-2 border-2 border-dashed border-indigo-200 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                    >
                        <Plus size={14} className="mr-1" /> Add Capability / Tool
                    </button>
                </div>
            </div>

            {/* Output Handle (Bottom) */}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    );
}

// Custom nodes are re-rendered on every store update unless memoized.
export default memo(ReActAgentNode);
