// Built-in comprehensive Node Documentation & Example Library
export const DEFAULT_NODE_DOCS = {
  // Tools
  "sql_database": {
    title: "SQL Database Query Tool",
    summary: "Enables autonomous agents to inspect database schemas, construct dialect-aware SQL queries, and retrieve structured tabular data.",
    category: "Data & Storage",
    whenToUse: "Use this node when your agent needs to answer questions from a relational database (PostgreSQL, MySQL, SQLite) or extract reporting metrics dynamically.",
    parameters: [
      {
        name: "DB_URI",
        type: "string",
        required: true,
        description: "Full connection string (e.g., postgresql://user:password@localhost:5432/my_db).",
        example: "postgresql://readonly_user:secret@db.internal:5432/analytics"
      },
      {
        name: "USER_QUERY",
        type: "string",
        required: true,
        description: "The incoming natural language question or dynamic SQL prompt passed from the previous agent node.",
        example: "Calculate total revenue by region for Q3 2026."
      },
      {
        name: "TABLE_NAMES",
        type: "array",
        required: false,
        description: "Optional list of table names to restrict schema introspection.",
        example: '["customers", "orders", "invoices"]'
      }
    ],
    outputs: [
      {
        name: "query_result",
        type: "object",
        description: "Structured JSON response containing fetched records, row count, and execution time."
      }
    ],
    exampleWorkflow: "User Chat Prompt -> SQL Agent -> SQL Database Tool -> Data Summarizer -> Chatbot Output",
    exampleConfig: {
      DB_URI: "postgresql://demo_user:demo_pass@127.0.0.1:5432/prod_db",
      USER_QUERY: "{{CHAT_QUERY}}",
      TABLE_NAMES: ["users", "subscriptions", "payments"]
    }
  },

  "agent": {
    title: "Autonomous AI Agent",
    summary: "Core reasoning node powered by an LLM that autonomously decides which tools to invoke, executes reasoning loops (ReAct), and formats final answers.",
    category: "Core Agentic Engine",
    whenToUse: "Use as the primary brain of your workflow to orchestrate multi-step reasoning, plan tool calls, and converse with users.",
    parameters: [
      {
        name: "system_prompt",
        type: "string",
        required: true,
        description: "Defines the agent's persona, operational rules, constraints, and instructions.",
        example: "You are a senior technical support specialist. Always verify customer identity before querying records."
      },
      {
        name: "model",
        type: "string",
        required: true,
        description: "The underlying LLM powering this agent (e.g. gpt-4o, claude-3-5-sonnet, gemini-1.5-pro).",
        example: "gpt-4o"
      },
      {
        name: "temperature",
        type: "number",
        required: false,
        description: "Sampling temperature between 0.0 (strict/deterministic) and 1.0 (creative).",
        example: "0.2"
      }
    ],
    outputs: [
      {
        name: "response",
        type: "string",
        description: "The agent's synthesized response text."
      },
      {
        name: "tool_calls",
        type: "array",
        description: "List of tools invoked during reasoning."
      }
    ],
    exampleWorkflow: "Input Trigger -> Autonomous Agent -> [Tool 1, Tool 2] -> Final Response Output",
    exampleConfig: {
      system_prompt: "You are an intelligent triage agent. Classify tickets into Technical, Billing, or General.",
      model: "gpt-4o",
      temperature: 0.1
    }
  },

  "model": {
    title: "Language Model (LLM)",
    summary: "Direct single-turn or conversational completion provider for generative text, code generation, and structured JSON generation.",
    category: "Foundational Models",
    whenToUse: "Use when you need direct text generation or structured JSON extraction without autonomous multi-step tool loops.",
    parameters: [
      {
        name: "provider",
        type: "string",
        required: true,
        description: "AI model vendor (OpenAI, Anthropic, Google, Ollama).",
        example: "anthropic"
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "The prompt text or template with variables.",
        example: "Summarize the following document in 3 bullet points: {{DOCUMENT_TEXT}}"
      }
    ],
    outputs: [
      {
        name: "completion",
        type: "string",
        description: "Generated response text from the model."
      }
    ],
    exampleWorkflow: "Document Extractor -> Language Model -> Slack Notification",
    exampleConfig: {
      provider: "openai",
      prompt: "Extract name, email, and phone number from this text:\n{{RAW_TEXT}}"
    }
  },

  "mcp_tool": {
    title: "Model Context Protocol (MCP) Tool",
    summary: "Standardized tool caller connecting to local or remote MCP servers (Filesystem, GitHub, Brave Search, PostgreSQL).",
    category: "MCP Integrations",
    whenToUse: "Use to interact with external operating systems, read files, execute shell commands, or query SaaS APIs via MCP standard.",
    parameters: [
      {
        name: "server_id",
        type: "string",
        required: true,
        description: "Identifies the registered MCP server connection.",
        example: "filesystem"
      },
      {
        name: "tool_name",
        type: "string",
        required: true,
        description: "The exact tool method exposed by the MCP server.",
        example: "read_file"
      },
      {
        name: "arguments",
        type: "object",
        required: true,
        description: "JSON arguments payload conforming to the tool's JSON schema.",
        example: '{"path": "/home/user/data.csv"}'
      }
    ],
    outputs: [
      {
        name: "output",
        type: "object",
        description: "Execution result returned by the MCP server."
      }
    ],
    exampleWorkflow: "Agent Reasoning -> MCP Filesystem Tool -> Markdown Report Generator",
    exampleConfig: {
      server_id: "filesystem",
      tool_name: "read_file",
      arguments: { path: "/var/logs/app.log" }
    }
  },

  "decision": {
    title: "Conditional Branch / Decision Router",
    summary: "Evaluates rules or expression conditions to route workflow execution along different branching paths (Condition Met vs Not Met).",
    category: "Flow Logic",
    whenToUse: "Use to branch logic based on sentiment, confidence threshold, user intent, or error status.",
    parameters: [
      {
        name: "condition",
        type: "string",
        required: true,
        description: "Expression to evaluate (e.g. {{score}} > 0.8 or {{status}} == 'APPROVED').",
        example: "{{confidence_score}} >= 0.75"
      }
    ],
    outputs: [
      {
        name: "branch_taken",
        type: "string",
        description: "The path evaluated ('true' or 'false')."
      }
    ],
    exampleWorkflow: "Sentiment Analysis -> Decision Router -> [Positive: Auto-Reply | Negative: Escalation Agent]",
    exampleConfig: {
      condition: "{{intent}} == 'escalate_to_human'"
    }
  }
};

/**
 * Coerces any parameter value into something React can render as a text child.
 *
 * Node input parameters legitimately hold objects and arrays (e.g. the MCP tool
 * `arguments` payload, or `TABLE_NAMES: []`). Those values were being copied
 * straight into `docs.parameters[].example`, which the docs tab renders as
 * `{p.example}` — React then throws
 * "Objects are not valid as a React child (found: object with keys {...})",
 * blanking the whole modal. Pretty-printed JSON keeps the docs readable while
 * remaining a valid React child.
 */
export const toDisplayString = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

/**
 * Normalises a docs object so every field the docs tab renders as a text child
 * is guaranteed to be a string. Applied to backend-supplied docs too, since we
 * do not control that payload.
 */
const normalizeDocs = (docs) => {
  if (!docs || typeof docs !== "object") return docs;
  return {
    ...docs,
    title: toDisplayString(docs.title, "Node"),
    summary: toDisplayString(docs.summary),
    category: toDisplayString(docs.category),
    whenToUse: toDisplayString(docs.whenToUse),
    exampleWorkflow: toDisplayString(docs.exampleWorkflow),
    parameters: Array.isArray(docs.parameters)
      ? docs.parameters.map((p) => ({
          ...p,
          name: toDisplayString(p?.name),
          type: toDisplayString(p?.type, "text"),
          description: toDisplayString(p?.description),
          example: toDisplayString(p?.example),
        }))
      : [],
    outputs: Array.isArray(docs.outputs)
      ? docs.outputs.map((o) => ({
          ...o,
          name: toDisplayString(o?.name),
          type: toDisplayString(o?.type, "text"),
          description: toDisplayString(o?.description),
        }))
      : [],
  };
};

export const getNodeDocs = (node) => {
  if (!node) return null;
  
  // 1. Check if node backend already provided custom docs
  if (node.data?.docs || node.docs) {
    return normalizeDocs(node.data?.docs || node.docs);
  }

  // 2. Lookup by node name or type in library
  const typeKey = (node.data?.type || node.type || "").toLowerCase();
  const nameKey = (node.data?.name || node.name || "").toLowerCase().replace(/\s+/g, "_");

  if (DEFAULT_NODE_DOCS[nameKey]) return normalizeDocs(DEFAULT_NODE_DOCS[nameKey]);
  if (DEFAULT_NODE_DOCS[typeKey]) return normalizeDocs(DEFAULT_NODE_DOCS[typeKey]);

  // Generic fallback documentation
  return {
    title: toDisplayString(node.data?.name || node.name, "Custom Node"),
    summary: toDisplayString(
      node.data?.description || node.description,
      "Processes inputs and outputs within the workflow graph."
    ),
    category: "Workflow Component",
    whenToUse: "Configure this component to process upstream variables and emit outputs to downstream connected nodes.",
    parameters: (node.data?.inputParameters || []).map(p => ({
      name: toDisplayString(p.key || p.name, "parameter"),
      type: toDisplayString(p.type, "text"),
      required: true,
      description: toDisplayString(
        p.description,
        `Configures the ${toDisplayString(p.key || p.name, "value")} variable for this node.`
      ),
      // Objects/arrays are pretty-printed instead of leaking into JSX.
      example: toDisplayString(p.value, "{{INPUT_VALUE}}")
    })),
    outputs: (node.data?.outputParameters || []).map(p => ({
      name: toDisplayString(p.key || p.name, "output"),
      type: toDisplayString(p.type, "text"),
      description: `Emits output value to connected nodes.`
    })),
    exampleWorkflow: "Previous Node -> Current Node -> Next Node",
    exampleConfig: (node.data?.inputParameters || []).reduce((acc, p) => {
      acc[p.key || p.name] = p.value || "sample_value";
      return acc;
    }, {})
  };
};
