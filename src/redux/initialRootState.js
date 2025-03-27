import {inputNodes, outputNodes} from "@/utils/dataModels";

const initialRootState = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
  studio: {
    tools: {
      data: [],
      loading: false,
      error: null
    },
    agents: {
      data: [],
      loading: false,
      error: null
    },
    models: {
      data: [],
      loading: false,
      error: null
    },
    inputs: {
      data: inputNodes,
      loading: false,
      error: null
    },
    outputs: {
      data: outputNodes,
      loading: false,
      error: null
    },
    agentFlows: {
      data: [],
      loading: false,
      error: null
    },
    flow: {
      data: {},
      loading: false,
      error: null
    },
    saveFlow: {
      loading: false,
      error: null
    }
  }
}

export default initialRootState;