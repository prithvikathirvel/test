"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  X,
  Bot,
  Play,
  GitBranch,
  Square,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Settings2,
  MessageSquare,
  Wrench,
  Brain,
  Zap,
  Database,
  Globe,
  Copy,
  Check,
  Search,
  ShoppingCart,
  Tag,
  List,
  BarChart3,
  User,
  Package,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

// ─── MOCK TOOL DATA ─────────────────────────────────────────────────────────

const TOOLS_DATA = [
  { id: "t1", name: "Search Products", description: "Search the catalogue by keywords.", node_type: "API caller", iconKey: "Search", config: { url: "https://dummyjson.com/products/search?q={{q}}&limit=5", method: "GET" }, parameters: [{ name: "q", type: "string", required: true, description: "Keywords to search for", example: "phone" }] },
  { id: "t2", name: "Get Product Details", description: "Full details of one product by numeric id.", node_type: "API caller", iconKey: "Package", config: { url: "https://dummyjson.com/products/{{product_id}}", method: "GET" }, parameters: [{ name: "product_id", type: "integer", required: true, description: "Numeric product id", example: "121" }] },
  { id: "t3", name: "List Categories", description: "Every product category in the store.", node_type: "API caller", iconKey: "List", config: { url: "https://dummyjson.com/products/category-list", method: "GET" }, parameters: [] },
  { id: "t4", name: "Products By Category", description: "List products from one specific category.", node_type: "API caller", iconKey: "Tag", config: { url: "https://dummyjson.com/products/category/{{category}}?limit=5", method: "GET" }, parameters: [{ name: "category", type: "string", required: true, description: "Category slug", example: "smartphones" }] },
  { id: "t5", name: "Browse Products", description: "Browse catalogue sorted by a field.", node_type: "API caller", iconKey: "BarChart3", config: { url: "https://dummyjson.com/products?sortBy={{sort_by}}&order={{order}}&limit=5", method: "GET" }, parameters: [{ name: "sort_by", type: "string", required: true, description: "Sort field", example: "price" }, { name: "order", type: "string", required: true, description: "asc or desc", example: "asc" }] },
  { id: "t6", name: "View Cart", description: "Show the shopper's current cart.", node_type: "API caller", iconKey: "ShoppingCart", config: { url: "https://dummyjson.com/carts/user/{{shopper_id}}", method: "GET" }, parameters: [] },
  { id: "t7", name: "Add To Cart", description: "Add a product to the shopper's cart.", node_type: "API caller", iconKey: "Plus", config: { url: "https://dummyjson.com/carts/add", method: "POST" }, parameters: [{ name: "product_id", type: "integer", required: true, description: "Product id to add", example: "144" }, { name: "quantity", type: "integer", required: true, description: "Units to add", example: "1" }] },
  { id: "t8", name: "Get Shopper Profile", description: "Shopper name, email, age and address.", node_type: "API caller", iconKey: "User", config: { url: "https://dummyjson.com/users/{{shopper_id}}", method: "GET" }, parameters: [] },
];

const ICON_MAP = { Search, Package, List, Tag, BarChart3, ShoppingCart, Plus, User, Wrench, Globe, Database, Zap };
const getToolIcon = (key) => ICON_MAP[key] || Wrench;

const SYSTEM_PROMPT = `You are the shopping assistant for {{store_name}}. All prices are in {{currency}}.

How to help:
- Product hunting → search_products
- Categories → list_categories  
- Browse by category → products_by_category
- Sort/rank → browse_products
- Details of ONE item → get_product_details
- Cart → view_cart / add_to_cart
- Profile → get_shopper_profile

Rules:
- Never invent product ids or prices
- Present as HTML list: <b>title</b> – price – rating (id: N)
- Keep answers under 120 words`;

// ─── FLOW CANVAS DATA ────────────────────────────────────────────────────────

const INIT_NODES = [
  { id: "n1", type: "startNode", position: { x: 60, y: 210 }, data: { label: "Start", nodeType: "start" } },
  { id: "n2", type: "agentNode", position: { x: 280, y: 140 }, data: { label: "Shopping Assistant Brain", nodeType: "react_agent_v2", config: { model: "llama3", temperature: "0", max_iterations: "6", response_format: "html", user_query: "{{CHAT_QUERY}}", memory_mode: "auto", memory_window: "10", persist_memory: "true", memory_context: "Store: {{store_name}}. Shopper: {{shopper_id}}. Currency: {{currency}}.", return_trace: "true", fallback_answer: "Sorry, I could not finish that shopping request.", system_prompt: SYSTEM_PROMPT }, tools: TOOLS_DATA } },
  { id: "n3", type: "conditionNode", position: { x: 680, y: 195 }, data: { label: "Did it finish?", nodeType: "conditions", conditions: [{ operator: "equal_to", value: "COMPLETED", target: "n4" }, { operator: "not_equals", value: "COMPLETED", target: "n5" }] } },
  { id: "n4", type: "endNode", position: { x: 960, y: 145 }, data: { label: "End — answered", nodeType: "output" } },
  { id: "n5", type: "endNode", position: { x: 960, y: 295 }, data: { label: "End — partial", nodeType: "output" } },
];

const INIT_EDGES = [
  { id: "e12", source: "n1", target: "n2", type: "smoothstep", animated: true, style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "e23", source: "n2", target: "n3", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1.8 } },
  { id: "e34", source: "n3", sourceHandle: "h0", target: "n4", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 1.8 }, label: "yes" },
  { id: "e35", source: "n3", sourceHandle: "h1", target: "n5", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 1.8 }, label: "no" },
];

// ─── CUSTOM FLOW NODES ──────────────────────────────────────────────────────

function StartNode({ data, selected }) {
  return (
    <div className={`w-[100px] rounded-xl border-2 bg-white transition-shadow ${selected ? "border-emerald-400 shadow-lg shadow-emerald-100" : "border-emerald-200"}`}>
      <div className="h-1 rounded-t-[9px] bg-emerald-500" />
      <div className="flex flex-col items-center py-3 gap-1">
        <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center"><Play size={13} className="text-emerald-600 ml-0.5" /></div>
        <span className="text-[11px] font-semibold text-slate-700">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
    </div>
  );
}

function AgentNode({ data, selected }) {
  const tc = data.tools?.length || 0;
  return (
    <div className={`w-[260px] rounded-xl border bg-white transition-shadow ${selected ? "border-emerald-400 shadow-lg shadow-emerald-100" : "border-slate-200 hover:border-slate-300"}`} style={{ background: "linear-gradient(180deg,#fff,#f8fafc)" }}>
      <div className="h-1 rounded-t-[11px] bg-emerald-500" />
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm"><Bot size={15} className="text-white" /></div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{data.label}</h3>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 uppercase">ReAct v2</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-3 text-[10.5px] text-slate-400">
          <span className="flex items-center gap-1"><Wrench size={10} />{tc} tools</span>
          <span className="flex items-center gap-1"><Brain size={10} />{data.config?.model}</span>
          <span className="flex items-center gap-1"><RotateCcw size={10} />max {data.config?.max_iterations}</span>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
    </div>
  );
}

function ConditionNode({ data, selected }) {
  return (
    <div className={`w-[180px] rounded-xl border bg-white transition-shadow ${selected ? "border-amber-400 shadow-lg shadow-amber-50" : "border-slate-200 hover:border-slate-300"}`} style={{ background: "linear-gradient(180deg,#fff,#f8fafc)" }}>
      <div className="h-1 rounded-t-[11px] bg-amber-500" />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0"><GitBranch size={14} className="text-white" /></div>
          <div className="min-w-0">
            <h3 className="text-[12px] font-semibold text-slate-800 truncate">{data.label}</h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 font-medium uppercase">Condition</span>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {data.conditions?.map((c, i) => (
            <div key={i} className="relative flex items-center gap-1.5 text-[10px] bg-white rounded-md border border-slate-200 px-2 py-1 pr-4">
              <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-1 rounded">{c.operator === "equal_to" ? "==" : "!="}</span>
              <span className="text-slate-600 truncate">{c.value}</span>
              <Handle id={`h${i}`} type="source" position={Position.Right} className="!w-2 !h-2 !bg-amber-500 !border-2 !border-white !absolute !right-[-7px] !top-1/2 !-translate-y-1/2" />
            </div>
          ))}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white" />
    </div>
  );
}

function EndNode({ data, selected }) {
  return (
    <div className={`w-[130px] rounded-xl border bg-white transition-shadow ${selected ? "border-slate-400 shadow-lg shadow-slate-100" : "border-slate-200"}`}>
      <div className="h-1 rounded-t-[11px] bg-slate-400" />
      <div className="flex flex-col items-center py-3 gap-1">
        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center"><Square size={11} className="text-slate-500" /></div>
        <span className="text-[11px] font-semibold text-slate-600">{data.label}</span>
      </div>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white" />
    </div>
  );
}

const nodeTypes = { startNode: StartNode, agentNode: AgentNode, conditionNode: ConditionNode, endNode: EndNode };

// ─── FORM PRIMITIVES ─────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="mb-1.5">
        <label className="text-[11.5px] font-semibold text-slate-600">{label}</label>
        {hint && <p className="text-[10px] text-slate-400 leading-tight">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-[7px] text-[12.5px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-colors";

function TxtInput({ value, onChange, placeholder, mono }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} ${mono ? "font-mono" : ""}`} />;
}

function NumInput({ value, onChange, min, max }) {
  return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} min={min} max={max} className={`${inputCls} font-mono`} />;
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

function TxtArea({ value, onChange, rows = 5, mono, placeholder }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputCls} resize-y leading-relaxed ${mono ? "font-mono text-[11.5px]" : ""}`} />;
}

function Toggle({ on, onToggle, label }) {
  return (
    <button type="button" onClick={() => onToggle(!on)} className="flex items-center gap-2 group">
      <div className={`relative w-8 h-[18px] rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-200"}`}>
        <div className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[14px]" : "translate-x-[2px]"}`} />
      </div>
      {label && <span className="text-[11.5px] text-slate-600 group-hover:text-slate-800">{label}</span>}
    </button>
  );
}

// ─── TOOL CARD ───────────────────────────────────────────────────────────────

function ToolCard({ tool, onRemove, onUpdate, open, onToggle }) {
  const Icon = getToolIcon(tool.iconKey);
  const pc = tool.parameters?.length || 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors">
      <button onClick={onToggle} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50/50 transition-colors">
        <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0"><Icon size={14} className="text-slate-500" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-semibold text-slate-800 truncate">{tool.name}</span>
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase shrink-0">{tool.node_type}</span>
          </div>
          <p className="text-[10.5px] text-slate-400 truncate mt-0.5">{tool.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {pc > 0 && <span className="text-[10px] font-medium text-slate-400">{pc} param{pc !== 1 ? "s" : ""}</span>}
          {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-3 py-3 space-y-3 bg-slate-50/30">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tool Name"><TxtInput value={tool.name} onChange={(v) => onUpdate({ ...tool, name: v })} /></Field>
            <Field label="Node Type">
              <Sel value={tool.node_type} onChange={(v) => onUpdate({ ...tool, node_type: v })} options={["API caller", "Knowledge Retrieval Node", "Web Search", "MCP Tool", "Mongo DB caller"]} />
            </Field>
          </div>
          <Field label="Description" hint="When the agent should use this tool">
            <TxtArea value={tool.description} onChange={(v) => onUpdate({ ...tool, description: v })} rows={2} />
          </Field>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Endpoint</span>
            <div className="grid grid-cols-[1fr_100px] gap-2 mt-1.5">
              <Field label="URL"><TxtInput value={tool.config?.url || ""} onChange={(v) => onUpdate({ ...tool, config: { ...tool.config, url: v } })} mono placeholder="https://..." /></Field>
              <Field label="Method"><Sel value={tool.config?.method || "GET"} onChange={(v) => onUpdate({ ...tool, config: { ...tool.config, method: v } })} options={["GET", "POST", "PUT", "PATCH", "DELETE"]} /></Field>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Parameters</span>
              <button onClick={() => onUpdate({ ...tool, parameters: [...(tool.parameters || []), { name: "", type: "string", required: true, description: "", example: "" }] })} className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-600 hover:text-emerald-700"><Plus size={12} /> Add</button>
            </div>
            {pc > 0 ? (
              <div className="space-y-1.5">
                {tool.parameters.map((p, pi) => (
                  <div key={pi} className="flex items-center gap-2 p-2 bg-white rounded-md border border-slate-200">
                    <input value={p.name} onChange={(e) => { const u = [...tool.parameters]; u[pi] = { ...p, name: e.target.value }; onUpdate({ ...tool, parameters: u }); }} placeholder="name" className="flex-1 px-2 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
                    <select value={p.type} onChange={(e) => { const u = [...tool.parameters]; u[pi] = { ...p, type: e.target.value }; onUpdate({ ...tool, parameters: u }); }} className="px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-none">
                      {["string", "integer", "number", "boolean", "array", "object"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input value={p.description} onChange={(e) => { const u = [...tool.parameters]; u[pi] = { ...p, description: e.target.value }; onUpdate({ ...tool, parameters: u }); }} placeholder="description" className="flex-[2] px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
                    <button onClick={() => onUpdate({ ...tool, parameters: tool.parameters.filter((_, j) => j !== pi) })} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10.5px] text-slate-400 italic">Auto-inferred from {"{{placeholders}}"} in URL/config</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button onClick={onRemove} className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600"><Trash2 size={11} /> Remove Tool</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD TOOL PANEL ──────────────────────────────────────────────────────────

const TEMPLATES = [
  { name: "API Caller", node_type: "API caller", iconKey: "Globe", description: "Call any REST endpoint." },
  { name: "Knowledge Retrieval", node_type: "Knowledge Retrieval Node", iconKey: "Database", description: "Search a vector KB." },
  { name: "Web Search", node_type: "Web Search", iconKey: "Search", description: "Search the public internet." },
  { name: "MCP Tool", node_type: "MCP Tool", iconKey: "Zap", description: "Connect to an MCP server." },
];

function AddToolPanel({ onAdd, onClose }) {
  return (
    <div className="p-3 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/30 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-emerald-800">Add a new tool</span>
        <button onClick={onClose} className="p-0.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => {
          const Icon = getToolIcon(t.iconKey);
          return (
            <button key={t.node_type} onClick={() => onAdd({ id: `t-${Date.now()}`, name: t.name, description: t.description, node_type: t.node_type, iconKey: t.iconKey, config: { url: "", method: "GET" }, parameters: [] })} className="flex items-center gap-2 p-2.5 bg-white rounded-md border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-colors">
              <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0"><Icon size={13} className="text-slate-500" /></div>
              <div className="min-w-0">
                <span className="text-[11.5px] font-medium text-slate-700 block truncate">{t.name}</span>
                <span className="text-[10px] text-slate-400 truncate block">{t.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── NODE DETAIL MODAL ───────────────────────────────────────────────────────

const AGENT_TABS = [
  { key: "config", label: "Configuration", icon: Settings2 },
  { key: "tools", label: "Tools", icon: Wrench },
  { key: "prompt", label: "Prompt & Memory", icon: MessageSquare },
  { key: "outputs", label: "Outputs", icon: ArrowRight },
];

const SIMPLE_TABS = [
  { key: "config", label: "Configuration", icon: Settings2 },
  { key: "info", label: "Info", icon: Info },
];

function NodeDetailModal({ node, onClose }) {
  const isAgent = node.data.nodeType === "react_agent_v2";
  const tabs = isAgent ? AGENT_TABS : SIMPLE_TABS;

  const [tab, setTab] = useState(tabs[0].key);
  const [config, setConfig] = useState(node.data.config || {});
  const [tools, setTools] = useState(node.data.tools || []);
  const [openTool, setOpenTool] = useState(null);
  const [addingTool, setAddingTool] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setConfig((c) => ({ ...c, [k]: v })); setDirty(true); };

  const accent = isAgent
    ? { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50", border: "border-emerald-200" }
    : node.data.nodeType === "conditions"
    ? { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-50", border: "border-amber-200" }
    : { bg: "bg-slate-400", text: "text-slate-600", light: "bg-slate-50", border: "border-slate-200" };

  const NodeIcon = isAgent ? Bot : node.data.nodeType === "conditions" ? GitBranch : node.data.nodeType === "start" ? Play : Square;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-[960px] h-[82vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-9 w-9 rounded-lg ${accent.bg} flex items-center justify-center shadow-sm`}>
              <NodeIcon size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[14.5px] font-semibold text-slate-900 truncate">{node.data.label}</h2>
              <span className={`text-[10px] font-semibold ${accent.text} ${accent.light} ${accent.border} border px-1.5 py-0.5 rounded-md uppercase tracking-wide`}>
                {node.data.nodeType?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved
              </span>
            )}
            <button onClick={() => setDirty(false)} disabled={!dirty} className="px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-colors">Save</button>
            <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X size={16} /></button>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex items-center gap-0.5 px-5 py-1.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          {tabs.map((t) => {
            const TIcon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${active ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-white/60"}`}>
                <TIcon size={13} />
                {t.label}
                {t.key === "tools" && tools.length > 0 && <span className="ml-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 rounded-full">{tools.length}</span>}
              </button>
            );
          })}
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">

          {/* CONFIG — Agent */}
          {tab === "config" && isAgent && (
            <div className="p-5 space-y-6 max-w-[640px]">
              <section>
                <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Model & Reasoning</h3>
                <p className="text-[11px] text-slate-400 mb-3">Core settings for how the agent thinks.</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Model">
                      <Sel value={config.model || "llama3"} onChange={(v) => set("model", v)} options={[{ value: "llama3", label: "Llama 3.3 70B" }, { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }, { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" }]} />
                    </Field>
                    <Field label="Temperature" hint="0 = deterministic, 1 = creative">
                      <NumInput value={config.temperature || "0"} onChange={(v) => set("temperature", v)} min={0} max={1} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Max Iterations" hint="Think→Act cycle budget">
                      <NumInput value={config.max_iterations || "6"} onChange={(v) => set("max_iterations", v)} min={1} max={20} />
                    </Field>
                    <Field label="Response Format">
                      <Sel value={config.response_format || "html"} onChange={(v) => set("response_format", v)} options={[{ value: "text", label: "Plain Text" }, { value: "html", label: "HTML" }, { value: "json", label: "JSON" }]} />
                    </Field>
                  </div>
                  <Field label="User Query Variable">
                    <TxtInput value={config.user_query || "{{CHAT_QUERY}}"} onChange={(v) => set("user_query", v)} mono />
                  </Field>
                </div>
              </section>

              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Behaviour</h3>
                <p className="text-[11px] text-slate-400 mb-3">Safety and fallback options.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-6">
                    <Toggle on={config.return_trace === "true"} onToggle={(v) => set("return_trace", v ? "true" : "false")} label="Return reasoning trace" />
                    <Toggle on={config.persist_memory === "true"} onToggle={(v) => set("persist_memory", v ? "true" : "false")} label="Persist memory to DB" />
                  </div>
                  <Field label="Fallback Answer" hint="Shown if the agent can't complete the request">
                    <TxtArea value={config.fallback_answer || ""} onChange={(v) => set("fallback_answer", v)} rows={2} />
                  </Field>
                </div>
              </section>
            </div>
          )}

          {/* TOOLS */}
          {tab === "tools" && isAgent && (
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-800">Tools ({tools.length})</h3>
                  <p className="text-[11px] text-slate-400">Capabilities the agent can invoke during reasoning.</p>
                </div>
                {!addingTool && (
                  <button onClick={() => setAddingTool(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"><Plus size={13} /> Add Tool</button>
                )}
              </div>

              {addingTool && <AddToolPanel onAdd={(t) => { setTools((prev) => [...prev, t]); setOpenTool(tools.length); setAddingTool(false); setDirty(true); }} onClose={() => setAddingTool(false)} />}

              {tools.length > 0 ? (
                <div className="space-y-2">
                  {tools.map((t, i) => (
                    <ToolCard key={t.id || i} tool={t} open={openTool === i} onToggle={() => setOpenTool(openTool === i ? null : i)} onUpdate={(u) => { setTools((prev) => prev.map((x, j) => (j === i ? u : x))); setDirty(true); }} onRemove={() => { setTools((prev) => prev.filter((_, j) => j !== i)); setOpenTool(null); setDirty(true); }} />
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center border border-dashed border-slate-200 rounded-lg">
                  <Wrench size={20} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[12px] font-medium text-slate-500">No tools configured</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">The agent will act as a memory-aware chat node.</p>
                </div>
              )}
            </div>
          )}

          {/* PROMPT & MEMORY */}
          {tab === "prompt" && isAgent && (
            <div className="p-5 space-y-6 max-w-[640px]">
              <section>
                <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">System Prompt</h3>
                <p className="text-[11px] text-slate-400 mb-2">Persona, policies, and instructions. Built-in rules are appended automatically.</p>
                <TxtArea value={config.system_prompt || ""} onChange={(v) => set("system_prompt", v)} rows={12} mono />
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Use {"{{variable}}"} to inject flow inputs.</p>
              </section>

              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Memory</h3>
                <p className="text-[11px] text-slate-400 mb-3">How conversation history is loaded and retained.</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Memory Mode" hint="Where history comes from">
                      <Sel value={config.memory_mode || "auto"} onChange={(v) => set("memory_mode", v)} options={[{ value: "auto", label: "Auto (richest source)" }, { value: "state", label: "Checkpoint only" }, { value: "db", label: "MongoDB only" }, { value: "off", label: "Stateless" }]} />
                    </Field>
                    <Field label="Memory Window" hint="Previous human turns to keep">
                      <NumInput value={config.memory_window || "10"} onChange={(v) => set("memory_window", v)} min={0} max={50} />
                    </Field>
                  </div>
                  <Field label="Memory Context" hint="Extra facts pinned into every turn">
                    <TxtArea value={config.memory_context || ""} onChange={(v) => set("memory_context", v)} rows={2} mono />
                  </Field>
                </div>
              </section>
            </div>
          )}

          {/* OUTPUTS */}
          {tab === "outputs" && isAgent && (
            <div className="p-5 max-w-[640px]">
              <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Output Variables</h3>
              <p className="text-[11px] text-slate-400 mb-4">Variables produced by this node for downstream use.</p>
              <div className="space-y-2">
                {[
                  { v: "{{shop_reply}}", d: "The final answer text" },
                  { v: "{{shop_reply_status}}", d: "COMPLETED | INCOMPLETE | FAILED" },
                  { v: "{{shop_reply_iterations}}", d: "Think→Act cycles used" },
                  { v: "{{shop_reply_tool_calls}}", d: "Tools called with arguments (JSON)" },
                  { v: "{{shop_reply_trace}}", d: "Full reasoning trace (when enabled)" },
                  { v: "{{execution_status}}", d: "Same as _status — for Decision Node" },
                ].map((item) => (
                  <div key={item.v} className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-md border border-slate-200">
                    <code className="text-[11.5px] font-mono font-semibold text-emerald-700">{item.v}</code>
                    <span className="text-[11px] text-slate-500">{item.d}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-lg border border-slate-200 bg-white">
                <Field label="Output Variable Name" hint="The key downstream nodes reference">
                  <TxtInput value="shop_reply" onChange={() => {}} mono />
                </Field>
              </div>
            </div>
          )}

          {/* CONFIG — simple nodes */}
          {tab === "config" && !isAgent && (
            <div className="p-5 max-w-[640px]">
              <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Node Configuration</h3>
              <p className="text-[11px] text-slate-400 mb-4">Parameters for this node.</p>
              {node.data.nodeType === "conditions" && node.data.conditions && (
                <div className="space-y-3">
                  <Field label="Input Value" hint="Variable to evaluate">
                    <TxtInput value="{{execution_status}}" onChange={() => {}} mono />
                  </Field>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11.5px] font-semibold text-slate-600">Conditions</label>
                      <button className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-600"><Plus size={12} /> Add</button>
                    </div>
                    <div className="space-y-2">
                      {node.data.conditions.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-white rounded-md border border-slate-200">
                          <select value={c.operator} readOnly className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono focus:outline-none">
                            <option value="equal_to">==</option>
                            <option value="not_equals">!=</option>
                          </select>
                          <input value={c.value} readOnly className="flex-1 px-2 py-1 text-[11px] font-mono bg-white border border-slate-200 rounded text-slate-800 focus:outline-none" />
                          <ArrowRight size={12} className="text-slate-400 shrink-0" />
                          <span className="text-[10.5px] font-medium text-slate-500 shrink-0">{c.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {(node.data.nodeType === "start" || node.data.nodeType === "output") && (
                <div className="py-14 text-center border border-dashed border-slate-200 rounded-lg">
                  <CheckCircle2 size={20} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[12px] font-medium text-slate-500">{node.data.nodeType === "start" ? "Start nodes have no configurable parameters." : "End nodes receive the final output automatically."}</p>
                </div>
              )}
            </div>
          )}

          {tab === "info" && !isAgent && (
            <div className="p-5 max-w-[640px]">
              <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Node Information</h3>
              <div className="divide-y divide-slate-100">
                {[{ l: "Node ID", v: node.id }, { l: "Type", v: node.data.nodeType }, { l: "Label", v: node.data.label }, { l: "Status", v: "Active" }, { l: "Version", v: "1.0.0" }].map((r) => (
                  <div key={r.l} className="flex items-center justify-between py-2.5">
                    <span className="text-[12px] text-slate-500">{r.l}</span>
                    <span className="text-[12px] font-medium text-slate-800">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [nodes, , onNodesChange] = useNodesState(INIT_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INIT_EDGES);
  const [selected, setSelected] = useState(null);

  const onNodeClick = useCallback((_, n) => setSelected(n), []);

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Sparkles size={15} className="text-white" /></div>
          <div>
            <h1 className="text-[14px] font-semibold text-slate-900">E-commerce Shopping Assistant</h1>
            <span className="text-[11px] text-slate-400">ReAct v2 · DummyJSON · 5 nodes · 8 tools</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">Export JSON</button>
          <button className="px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5"><Play size={12} /> Run Flow</button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#e2e8f0" />
          <Controls showInteractive={false} className="!bg-white !border-slate-200 !rounded-lg !shadow-sm" />
          <MiniMap
            nodeColor={(n) => n.type === "agentNode" ? "#10b981" : n.type === "conditionNode" ? "#f59e0b" : "#94a3b8"}
            maskColor="rgba(248,250,252,0.8)"
            className="!bg-white !border-slate-200 !rounded-lg"
          />
        </ReactFlow>

        {!selected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 shadow-sm text-[12px] text-slate-500 flex items-center gap-2">
            <Info size={13} className="text-slate-400" /> Click any node to configure it
          </div>
        )}
      </div>

      {selected && <NodeDetailModal node={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
