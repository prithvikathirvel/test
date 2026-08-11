# Sify Aurora - Dictionary & Parameter Resolver API Specification (2026 Enterprise Architecture)

This document defines the architectural contract, API schemas, and runtime resolution mechanics for the **Dictionary Feature** in Sify Aurora.

---

## 1. Architectural Overview & Vision in 2026

In modern enterprise agentic pipelines (2026+), hardcoding configurations, model system prompts, connection strings, and guardrail rules directly inside canvas nodes creates severe operational fragility. 

The **Dictionary System** introduces a two-tier variable hierarchy:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             VARIABLE HIERARCHY                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tier 1: Global Dictionary (Workspace Scope)                                │
│  - Stored globally across the workspace                                     │
│  - Referenced in ANY Agent Flow via {{global.KEY_NAME}}                     │
│  - Use cases: Centralized API gateways, safety guardrails, global constants │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tier 2: Flow-Scoped Inputs ("Configure Inputs" / Flow Dictionary)          │
│  - Scoped strictly to the specific Agent Flow                               │
│  - Referenced in any node within the flow via {{KEY_NAME}} or {{inputs.KEY}}│
│  - Use cases: Flow prompt templates, customer query triggers, local limits  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tier 3: Runtime Node Outputs (Graph Execution Scope)                       │
│  - Emitted by executed nodes (e.g. {{sql_node.query_result}})                │
│  - Passed downstream along directed DAG edges                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Parameter Resolution Priority
When an expression like `{{VARIABLE_KEY}}` is resolved at execution time, the backend **Parameter Resolver Engine** evaluates references in the following priority order:
1. **Local Node Execution Context / Upstream Output Variables**
2. **Flow-Scoped Input Variables (`flow.inputs`)**
3. **Global Workspace Dictionary (`global.*`)**
4. **Fallback Default / System Environment Secrets**

---

## 2. REST API Endpoints

### A. List Global Dictionaries
Retrieve all registered global dictionaries in the active workspace.

- **Endpoint:** `GET /api/dictionary`
- **Query Parameters (Optional):**
  - `type` (string): Filter by type (`text`, `number`, `boolean`, `object`, `array`)
  - `search` (string): Case-insensitive keyword search against `key` or `description`
  - `page` (number): Default `1`
  - `limit` (number): Default `50`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`

#### Success Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "total": 4,
    "page": 1,
    "limit": 50,
    "items": [
      {
        "id": "dict-01",
        "key": "API_GATEWAY_ENDPOINTS",
        "type": "object",
        "description": "Centralized internal API microservice endpoints",
        "value": {
          "crm_service": "https://crm.internal.corp/v1",
          "billing_service": "https://billing.internal.corp/v2",
          "auth_service": "https://auth.internal.corp/oauth",
          "vector_store": "https://qdrant.internal.corp:6333"
        },
        "created_by": "admin@sify.com",
        "created_at": "2026-08-11T08:00:00.000Z",
        "updated_at": "2026-08-11T09:30:00.000Z"
      },
      {
        "id": "dict-02",
        "key": "DEFAULT_AGENT_PROMPT_GUARDRAILS",
        "type": "array",
        "description": "Mandatory compliance guidelines injected into agent prompts",
        "value": [
          "Never reveal internal database connection credentials or API tokens.",
          "Verify customer account ownership before returning transaction history.",
          "Escalate to human support when customer sentiment drops below -0.6."
        ],
        "created_by": "admin@sify.com",
        "created_at": "2026-08-10T12:00:00.000Z",
        "updated_at": "2026-08-11T09:30:00.000Z"
      },
      {
        "id": "dict-03",
        "key": "MAX_AGENT_REASONING_LOOPS",
        "type": "number",
        "description": "Maximum execution loops permitted per agent",
        "value": 12,
        "created_by": "admin@sify.com",
        "created_at": "2026-08-09T10:00:00.000Z",
        "updated_at": "2026-08-11T09:30:00.000Z"
      },
      {
        "id": "dict-04",
        "key": "ACTIVE_ENVIRONMENT",
        "type": "text",
        "description": "Active deployment cluster target",
        "value": "production-us-east-1",
        "created_by": "admin@sify.com",
        "created_at": "2026-08-08T10:00:00.000Z",
        "updated_at": "2026-08-11T09:30:00.000Z"
      }
    ]
  }
}
```

---

### B. Create Global Dictionary Variable
Register a new global key-value store entry.

- **Endpoint:** `POST /api/dictionary`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`

#### Request Payload:
```json
{
  "key": "SLACK_ALERT_WEBHOOKS",
  "type": "object",
  "description": "Departmental Slack incoming webhook channels for agent notifications",
  "value": {
    "devops_channel": "https://hooks.slack.com/services/T00/B00/XXXX1",
    "security_alerts": "https://hooks.slack.com/services/T00/B00/XXXX2",
    "customer_success": "https://hooks.slack.com/services/T00/B00/XXXX3"
  }
}
```

#### Validation Rules:
1. `key`: Required, string, alphanumeric and underscores only (`^[A-Z0-9_]+$`), max 64 characters, unique per workspace.
2. `type`: Required, enum: `["text", "number", "boolean", "object", "array"]`.
3. `value`: Must conform strictly to the specified `type`:
   - If `type === "object"`: Must be a valid JSON Object.
   - If `type === "array"`: Must be a valid JSON Array.
   - If `type === "number"`: Must be a finite numeric value.
   - If `type === "boolean"`: Must be boolean (`true` / `false`).
   - If `type === "text"`: String.

#### Success Response (`201 Created`):
```json
{
  "status": "success",
  "message": "Global variable registered successfully",
  "data": {
    "id": "dict-05",
    "key": "SLACK_ALERT_WEBHOOKS",
    "type": "object",
    "description": "Departmental Slack incoming webhook channels for agent notifications",
    "value": {
      "devops_channel": "https://hooks.slack.com/services/T00/B00/XXXX1",
      "security_alerts": "https://hooks.slack.com/services/T00/B00/XXXX2",
      "customer_success": "https://hooks.slack.com/services/T00/B00/XXXX3"
    },
    "created_at": "2026-08-11T10:15:00.000Z",
    "updated_at": "2026-08-11T10:15:00.000Z"
  }
}
```

#### Error Response (`409 Conflict` - Duplicate Key):
```json
{
  "status": "error",
  "code": "DUPLICATE_KEY",
  "message": "Global dictionary variable with key 'SLACK_ALERT_WEBHOOKS' already exists."
}
```

---

### C. Update Global Dictionary Variable
- **Endpoint:** `PUT /api/dictionary/:id`
- **Request Payload:**
```json
{
  "key": "SLACK_ALERT_WEBHOOKS",
  "type": "object",
  "description": "Updated slack channels with escalation routing",
  "value": {
    "devops_channel": "https://hooks.slack.com/services/T00/B00/XXXX1",
    "security_alerts": "https://hooks.slack.com/services/T00/B00/XXXX2",
    "customer_success": "https://hooks.slack.com/services/T00/B00/XXXX3",
    "tier_1_escalation": "https://hooks.slack.com/services/T00/B00/XXXX4"
  }
}
```
- **Success Response (`200 OK`)**: Returns the updated dictionary record.

---

### D. Delete Global Dictionary Variable
- **Endpoint:** `DELETE /api/dictionary/:id`
- **Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Global dictionary variable 'SLACK_ALERT_WEBHOOKS' deleted."
}
```

---

## 3. Flow-Scoped Inputs ("Configure Inputs") Schema

Flow-scoped inputs are persisted directly within the Flow Specification document in MongoDB / PostgreSQL under `flow.inputs`:

```json
{
  "id": "flow-9921",
  "name": "Customer Support & Triage Agent",
  "inputs": [
    {
      "key": "USER_QUERY",
      "type": "text",
      "value": "How do I upgrade my enterprise tier subscription?",
      "description": "Incoming user chat query trigger"
    },
    {
      "key": "CUSTOMER_ACCOUNT_ID",
      "type": "text",
      "value": "acc_enterprise_8829"
    },
    {
      "key": "SEARCH_FILTERS",
      "type": "object",
      "value": {
        "region": "NA",
        "include_archived": false,
        "max_results": 10
      }
    },
    {
      "key": "ALLOWED_TOPICS",
      "type": "array",
      "value": ["billing", "api_usage", "sla_support", "onboarding"]
    }
  ],
  "graphSpec": {
    "nodes": [ ... ],
    "edges": [ ... ]
  }
}
```

---

## 4. Parameter Resolver Implementation Example (Node.js / Python)

```javascript
/**
 * Resolves template string expressions using hierarchical variable dictionaries.
 * 
 * @param {string} templateString - e.g. "Query database at {{global.API_GATEWAY_ENDPOINTS.crm_service}} with {{USER_QUERY}}"
 * @param {Object} flowInputs - Local flow variables dictionary
 * @param {Object} globalDict - Global workspace dictionary
 * @param {Object} nodeOutputs - Runtime node execution outputs
 * @returns {any} Resolved string, object, or array
 */
function resolveParameters(templateString, flowInputs = {}, globalDict = {}, nodeOutputs = {}) {
  if (typeof templateString !== 'string') return templateString;

  // Regex to match {{variable_path}}
  const REGEX = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

  return templateString.replace(REGEX, (match, path) => {
    // 1. Check Global prefix: {{global.KEY_NAME}} or {{global.KEY.nested_field}}
    if (path.startsWith('global.')) {
      const subPath = path.replace(/^global\./, '');
      return getNestedProperty(globalDict, subPath) ?? match;
    }

    // 2. Check Explicit Inputs prefix: {{inputs.KEY_NAME}}
    if (path.startsWith('inputs.')) {
      const subPath = path.replace(/^inputs\./, '');
      return getNestedProperty(flowInputs, subPath) ?? match;
    }

    // 3. Check Runtime Node Outputs: {{node_id.var_name}}
    const nodeVal = getNestedProperty(nodeOutputs, path);
    if (nodeVal !== undefined) return formatValue(nodeVal);

    // 4. Check Local Flow Inputs by key: {{USER_QUERY}}
    const inputVal = getNestedProperty(flowInputs, path);
    if (inputVal !== undefined) return formatValue(inputVal);

    // 5. Check Global Dictionary fallback by key: {{API_GATEWAY_ENDPOINTS}}
    const globalVal = getNestedProperty(globalDict, path);
    if (globalVal !== undefined) return formatValue(globalVal);

    // Unresolved: return original template tag
    return match;
  });
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
}

function formatValue(val) {
  return typeof val === 'object' ? JSON.stringify(val) : String(val);
}
```

---

## 5. How Dictionary Transforms Agentic Workflows in 2026

1. **Zero-Code Multi-Environment Promotion:**
   - Swap `ACTIVE_ENVIRONMENT` from `"staging"` to `"production"` globally across 100+ flows without opening each individual flow canvas.
2. **Centralized Enterprise Guardrails:**
   - Update `DEFAULT_AGENT_PROMPT_GUARDRAILS` once in the Global Dictionary to immediately enforce new regulatory compliance rules across all agents.
3. **Complex Nested Payload Support:**
   - Supports deep nested JSON objects, array of JSON schemas, and structured dictionaries required by advanced tool callers (e.g. MCP Servers, OpenAPI specs, GraphQL endpoints).
4. **Sub-Millisecond Parameter Resolution:**
   - Global and Flow Dictionaries are cached in-memory (Redis / RAM), resolving parameter tags in `<1ms` prior to LLM or tool dispatch.
