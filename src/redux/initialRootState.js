import {inputNodes, outputNodes, prebuiltFlows} from "@/utils/dataModels";

// Initial state for knowledge slice
const initialKnowledgeState = {
  sources: [],
  loading: false,
  error: null,
  uploadStatus: 'idle',
  uploadProgress: 0,
};

// Initial state for knowledge graph slice
const initialKnowledgeGraphState = {
  connections: [],
  connectionsLoading: false,
  connectionsError: null,
  selectedConnectionId: null,
  healthStatus: {},
  serverHealth: 'checking',
  step: 1,
  uploadSession: null,
  sessionExpired: false,
  graphs: [],
  graphsLoading: false,
  graphsError: null,
};

const initialRootState = {
  auth: {
    isAuthenticated: false,
    user: null,
    authLoader: false, 
    authError: null,
    sessionHydrated: false,
  },
  knowledge: initialKnowledgeState,
  knowledgeGraph: initialKnowledgeGraphState,
  studio: {
    tools: [],
    agents: [],
    models: [],
    inputs: inputNodes,
    outputs: outputNodes,
    prebuiltFlows: prebuiltFlows,
    agentFlows: [],
    flow:{}, 
    flowListLoader: false, 
    studioLoader: false,
    newFlowId: null,
    studioComponentLoader: false, 
    studioError: null,
    flows: [],
    studioSaveFlowLoader: false, 
    studioUpdateFlowLoader: false,
    getAllFlowsLoader: false,
    specification:{},
    flowOutput: null,
    isFlowRunning:false,
    sessionId: null,
    tokenUsage: null,
    priceUsage: null,
    mcpTools: [],
    mcpToolLoader: false,
  }
}

export default initialRootState;