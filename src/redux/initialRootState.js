import {inputNodes, outputNodes, prebuiltFlows} from "@/utils/dataModels";

const initialRootState = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
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
    mcpTools: [],
    mcpToolLoader: false,
  }
}

export default initialRootState;