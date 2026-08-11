# Node Documentation & Example API Specification

This document defines the schema and API contract for providing node documentation, parameter references, and working examples to the Sify Aurora Studio UI.

---

## 1. Overview & Architecture

When a user selects a node on the canvas (or inspects a tool in the Node Library), the UI displays a **Docs & Examples** tab that informs the user:
1. **Summary & When to Use:** Purpose of the node and typical workflow placement.
2. **Parameters Reference:** Detailed field specifications (data type, required/optional, validation rules, description).
3. **Outputs Reference:** Data variables emitted downstream.
4. **Working Examples:** Sample configurations and copyable JSON payloads.

---

## 2. API Endpoints

### A. Get Documentation for a Specific Node Type
- **Endpoint:** `GET /api/nodes/{node_id}/docs` (or `GET /api/docs/nodes/{node_type}`)
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

### Success Response (`200 OK`):
```json
{
  "node_id": "sql_database_query",
  "title": "SQL Database Query Tool",
  "summary": "Enables autonomous agents to inspect database schemas, construct dialect-aware SQL queries, and retrieve structured tabular records.",
  "category": "Data & Storage",
  "whenToUse": "Use this node when your agent needs to answer questions from a relational database (PostgreSQL, MySQL, SQLite) or extract reporting metrics dynamically.",
  "parameters": [
    {
      "name": "DB_URI",
      "type": "string",
      "required": true,
      "description": "Full connection string (e.g. postgresql://user:password@localhost:5432/my_db).",
      "example": "postgresql://readonly_user:secret@db.internal:5432/analytics"
    },
    {
      "name": "USER_QUERY",
      "type": "string",
      "required": true,
      "description": "The incoming natural language question or dynamic SQL prompt passed from the previous agent node.",
      "example": "Calculate total revenue by region for Q3 2026."
    },
    {
      "name": "TABLE_NAMES",
      "type": "array",
      "required": false,
      "description": "Optional list of table names to restrict schema introspection.",
      "example": "[\"customers\", \"orders\", \"invoices\"]"
    }
  ],
  "outputs": [
    {
      "name": "query_result",
      "type": "object",
      "description": "Structured JSON response containing fetched records, row count, and execution time."
    }
  ],
  "exampleWorkflow": "User Chat Prompt -> SQL Agent -> SQL Database Tool -> Data Summarizer -> Chatbot Output",
  "exampleConfig": {
    "DB_URI": "postgresql://demo_user:demo_pass@127.0.0.1:5432/prod_db",
    "USER_QUERY": "{{CHAT_QUERY}}",
    "TABLE_NAMES": ["users", "subscriptions", "payments"]
  }
}
```

---

### B. Bulk Fetch All Node Documentation
- **Endpoint:** `GET /api/docs/nodes`
- **Response:**
```json
{
  "nodes": {
    "sql_database": { ... },
    "agent": { ... },
    "model": { ... },
    "decision": { ... },
    "mcp_tool": { ... }
  }
}
```

---

## 3. Node Specification Field Definitions

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Human-readable node title displayed in the modal header. |
| `summary` | `string` | 1-2 sentence description explaining the node's function. |
| `category` | `string` | Categorization (e.g., `Core Agentic Engine`, `Data & Storage`, `Flow Logic`). |
| `whenToUse` | `string` | Practical advice on when to choose this node over alternatives. |
| `parameters` | `array[object]` | Field-by-field reference guide for all configurable inputs. |
| `parameters[i].name` | `string` | Key/Name of the input parameter. |
| `parameters[i].type` | `string` | Data type (`string`, `number`, `boolean`, `object`, `array`, `file`). |
| `parameters[i].required` | `boolean` | Whether execution will fail without this value. |
| `parameters[i].description` | `string` | Helpful tooltip explanation for the user. |
| `parameters[i].example` | `string` | Practical sample input value. |
| `outputs` | `array[object]` | List of output variables emitted for downstream nodes. |
| `exampleWorkflow` | `string` | Visual pipeline text describing recommended node connections. |
| `exampleConfig` | `object` | Copyable JSON payload that can be pasted directly into node parameters. |

---

## 4. Example Payloads by Node Type

### 1. Autonomous Agent Node
```json
{
  "title": "Autonomous AI Agent",
  "summary": "Core reasoning node powered by an LLM that autonomously decides which tools to invoke, executes reasoning loops (ReAct), and formats final answers.",
  "category": "Core Agentic Engine",
  "whenToUse": "Use as the primary brain of your workflow to orchestrate multi-step reasoning, plan tool calls, and converse with users.",
  "parameters": [
    {
      "name": "system_prompt",
      "type": "string",
      "required": true,
      "description": "Defines the agent's persona, operational rules, constraints, and instructions.",
      "example": "You are a customer support agent. Always verify user ID before retrieving orders."
    },
    {
      "name": "model",
      "type": "string",
      "required": true,
      "description": "The underlying LLM powering this agent.",
      "example": "gpt-4o"
    },
    {
      "name": "temperature",
      "type": "number",
      "required": false,
      "description": "Sampling temperature between 0.0 (strict) and 1.0 (creative).",
      "example": "0.1"
    }
  ],
  "outputs": [
    {
      "name": "response",
      "type": "string",
      "description": "The agent's synthesized response text."
    },
    {
      "name": "tool_calls",
      "type": "array",
      "description": "List of tools invoked during reasoning."
    }
  ],
  "exampleWorkflow": "Input Trigger -> Autonomous Agent -> [Database Tool] -> Final Output",
  "exampleConfig": {
    "system_prompt": "You are an intelligent triage agent. Classify tickets into Technical, Billing, or General.",
    "model": "gpt-4o",
    "temperature": 0.1
  }
}
```

### 2. MCP Filesystem Tool
```json
{
  "title": "MCP Read File Tool",
  "summary": "Reads full or partial text contents of a file from an allowed directory via the Model Context Protocol.",
  "category": "MCP Integrations",
  "whenToUse": "Use when an agent needs to examine log files, configuration files, or data dumps on a server.",
  "parameters": [
    {
      "name": "server_id",
      "type": "string",
      "required": true,
      "description": "ID of the registered MCP server.",
      "example": "filesystem"
    },
    {
      "name": "tool_name",
      "type": "string",
      "required": true,
      "description": "Name of the tool to execute.",
      "example": "read_file"
    },
    {
      "name": "arguments",
      "type": "object",
      "required": true,
      "description": "Tool parameters conforming to MCP schema.",
      "example": "{\"path\": \"/var/logs/app.log\", \"head\": 50}"
    }
  ],
  "outputs": [
    {
      "name": "output",
      "type": "object",
      "description": "Contents of the file."
    }
  ],
  "exampleWorkflow": "Error Log Alert -> MCP Read File -> AI Summarizer -> Slack Webhook",
  "exampleConfig": {
    "server_id": "filesystem",
    "tool_name": "read_file",
    "arguments": {
      "path": "/var/log/nginx/access.log",
      "head": 100
    }
  }
}
```
