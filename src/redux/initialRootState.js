const initialRootState = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
  studio: {
    tools: {
      data: [
      ],
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
      data: [{
        "id": "input-001",
        "name": "Text Input",
        "type": "input",
        "description": "Basic text input component",
        "sections": [
          {
            "title": "Configuration",
            "items": [
              {
                "id": "config-002",
                "label": "Data Type",
                "value": "string",
                "type": "dataType"
              },
              {
                "id": "config-003",
                "label": "Required",
                "value": true,
                "type": "required"
              }
            ]
          }
        ],
        "status": "active",
        "version": "1.0.0",
        "isPublic": true,
        "createdBy": "Prithiv"
      }],
      loading: false,
      error: null
    },
    flow: {
      nodes: [],
      edges: [],
      viewMode: 'graph',  
      specification: null,
      loading: false,
      error: null
    }
  }
}

export default initialRootState;