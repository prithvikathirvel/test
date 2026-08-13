# Aurora feature ideas

Ideas that are uncommon in today’s agent builders (Langflow, Flowise, n8n AI, Vertex Agent Builder, CrewAI Studio) but would fit Sify Aurora’s visual-flow + dictionary + knowledge graph stack.

Each idea includes the problem, a concrete example, and a first slice we could ship.

---

## 1. Variable lineage (data provenance on the canvas)

**Problem.** Once a flow has ten nodes, nobody can answer “where did `{{TICKET_ID}}` come from, and who overwrote it?”

**Idea.** A read-only overlay that traces every `{{KEY}}` from the node that first wrote it, through every reader, to the final output. Click a variable chip on a node → the path lights up; side panel lists writes / reads / last value from the last run.

**Example.** Support triage flow:

```
Start  →  Parse ticket  →  Classify  →  Lookup CMDB  →  Draft reply
              writes              reads           reads
           TICKET_ID            TICKET_ID      ASSET_OWNER
```

Hover `ASSET_OWNER` on Draft reply → canvas highlights Lookup CMDB as the writer, and the panel shows `scope: global` vs a local override.

**First slice.** Parse `inputParameters` / `outputParameters` / `inputs[]` for `{{...}}` and draw a dashed overlay edge. No runtime required.

---

## 2. Spec diff & flow pull requests

**Problem.** Two people edit the same agent. Git diffs of 2k-line JSON specs are unreadable. There is no review ritual.

**Idea.** Treat a flow save as a commit. “Compare versions” renders a visual diff: added/removed nodes, changed parameters, dictionary keys that appeared or disappeared. Reviewers comment on a *node*, not a JSON line.

**Example.**

```
v1.3.2 → v1.4.0
 +  RAG node “Policy KB”
 ~  Classifier.prompt  (12 tokens changed)
 −  Hard-coded API_URL  (moved to global.API_GATEWAY)
```

Ship as a split view: left = previous graph, right = current, edges colour-coded.

**First slice.** Store `updatedAt` + previous `graphSpec` snapshot on save; render a node-level changelog under JSON Spec.

---

## 3. Shadow run / canary of a flow version

**Problem.** Deploying a new prompt or model is all-or-nothing. A bad change hits every production ticket.

**Idea.** A flow can run two versions in parallel. Production still answers from `v1`. `v2` executes in shadow, records output + latency + cost, and never replies to the user. A scorecard shows “v2 would have disagreed on 8% of turns.”

**Example.** Voice IVR: `v2` swaps Whisper for a new STT. After 500 shadow calls, word-error-rate and p95 latency are compared. Promote only if both improve.

**First slice.** “Run against last 20 sessions” button that replays stored inputs through the current canvas without publishing.

---

## 4. Contract tests between nodes

**Problem.** Changing an upstream node’s output shape silently breaks the next node. Users find out at runtime.

**Idea.** Each edge can carry a small schema: required keys, types, example payload. Studio validates the writer’s `outputParameters` against the reader’s `inputParameters` *before* save — the same way we already detect colliding output names.

**Example.**

```
Classifier.output = { intent: string, confidence: number }
Lookup.input     = { intent: string, site_id: string }   ✗ missing site_id
```

Save is blocked with “Fix node” (we already have this pattern in `FlowValidationModal`).

**First slice.** Infer the contract from existing `outputParameters` / `inputParameters` and warn on missing keys. No new backend.

---

## 5. Token & rupee budget per flow

**Problem.** A looped iterator + a large RAG context can spend thousands of rupees in one test run. There is no ceiling.

**Idea.** A budget on the flow: max tokens, max tool calls, max wall-clock. The canvas shows a live meter during Test Run. Crossing 80% warns; crossing 100% stops the run and marks the node that blew it.

**Example.**

```
Budget: ₹50 / 80k tokens / 20 tool calls
Run #4821  ████████░░  ₹41   63k tokens   14 calls
Stopped at “Deep research” — would exceed remaining ₹9.
```

**First slice.** Sum prompt + completion tokens from the existing run payload and surface them in the output drawer.

---

## 6. Human gate as a first-class node

**Problem.** High-risk actions (refunds, password resets, CMDB writes) need a person, but the only interrupt today is a generic flag.

**Idea.** An **Approval** node: assignee (role or user), SLA, payload preview, approve / reject handles. While waiting, the flow parks. The approver gets a deep link into Studio with the exact node highlighted.

**Example.** “Issue refund > ₹5,000” → Approval (Finance) → if approved, Payment tool; if rejected or SLA miss, draft a “needs manager” reply.

**First slice.** Reuse `interrupt: true` with a dedicated node type and two source handles (`approved` / `rejected`).

---

## 7. Persona replay (synthetic users)

**Problem.** Testers type “hi” five times. Real customers are angry, multilingual, or dump a 2-page ticket.

**Idea.** A small library of personas (Angry enterprise admin, First-time Hindi speaker, Auditor who only pastes logs). One click runs the flow against each persona’s canned transcript and scores: resolved? escalated? policy broken?

**Example.**

```
Persona: “Priya — first-time, Tamil, billing”
Turn 1: "என் பில் தவறு"
Expected: language detected, reply in Tamil, no refund without approval
Result:   ✗ replied in English
```

**First slice.** Store 3–5 transcripts as fixtures next to the flow and replay them through Test Run.

---

## 8. Semantic auto-map of variables

**Problem.** Dropping a sub-flow or swapping a model forces users to re-wire `{{user_query}}` to `{{CHAT_QUERY}}` by hand.

**Idea.** When a node is added, Aurora proposes mappings by name similarity + type (`user_query` ≈ `CHAT_QUERY`, both text). User confirms a checklist; nothing is silently rewritten.

**Example.** Adding the “Knowledge Graph lookup” node:

```
Suggested bindings
  node.entity_id   ←  flow.ASSET_ID     (exact)
  node.query       ←  flow.CHAT_QUERY   (alias)
  node.tenant      ←  global.TENANT_ID  (scope: global)
```

**First slice.** Levenshtein / token overlap over keys already in `inputs[]` and the new node’s `inputParameters`.

---

## 9. Policy lint on the spec

**Problem.** A prompt that says “ignore previous instructions” or a node that posts PII to an external webhook should not reach production unnoticed.

**Idea.** A linter that runs on Save / Deploy: secrets in prompts, unscoped globals, missing End node, public webhook without auth, knowledge sources marked “restricted”. Results land in the same validation modal we already use.

**Example.**

```
P1  HTTP node “Notify Slack” — Authorization header hard-coded
P2  Prompt on Classifier contains raw {{CUSTOMER_AADHAAR}}
I1  No timeout on Iterator
```

**First slice.** Regex + the existing `validateFlowOutputVariables` pipeline. No model required.

---

## 10. Run tape (time-travel debug)

**Problem.** A failed production turn is a blob of JSON. You cannot “step” the graph the way you step a debugger.

**Idea.** Every Test Run / production turn writes a *tape*: ordered events `{node_id, t, input, output, tokens}`. A scrubber under the canvas replays the tape; the active node highlights and its panel shows the value *at that instant*.

**Example.** Drag the scrubber to t=1.8s → Lookup CMDB is amber (in flight). At t=2.4s it turns green and `ASSET_OWNER = "noc-chennai"` appears.

**First slice.** Persist the existing chatbot/stream events against `sessionId` and let the output drawer jump to a node.

---

## What to build first

| Priority | Idea                         | Why first                                      | Needs backend? |
| -------- | ---------------------------- | ---------------------------------------------- | -------------- |
| 1        | Variable lineage             | Uses data we already have; unblocks debugging  | No             |
| 2        | Contract tests on edges      | Extends current validation modal               | No             |
| 3        | Policy lint                  | Cheap, high trust for enterprise buyers        | No             |
| 4        | Token / ₹ budget meter       | Uses run payload; stops surprise cost          | Light          |
| 5        | Spec diff                    | Makes multi-editor teams possible              | Snapshot store |
| 6        | Shadow run                   | Differentiator vs Flowise / Langflow           | Yes            |
| 7        | Approval node                | Needed for refunds / CMDB writes               | Yes            |
| 8        | Persona replay               | Makes QA real                                  | Fixtures only  |
| 9        | Semantic auto-map            | Saves time as catalogs grow                    | No             |
| 10       | Run tape                     | Best-in-class debug once events are stored     | Yes            |

Lineage + contract tests + policy lint can ship as a single “Inspect” pass on Save, reusing `FlowValidationModal`. That is the smallest package that would feel new in the market and still sit on the current architecture.
