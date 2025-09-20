const inputNodes = [
  {
    id: "input_0",
    key: "Start",
    name: "Start Node",
    type: "inputs",
    status: "active",
    description: "Start Node",
    tags: ["start"],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System"
  },
  {
    id: "input_1",
    key: "Text",
    name: "Text Node",
    type: "node",
    status: "active",
    description: "Get Text from user",
    tags: ["text", "input"],
    inputParameters:[{
      key: "text",
      value: "",
      type: "string"
    }],
    outputParameters:[{
      key:"output",
      value:"",
      type:"string"
    }],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System"
  },
  {
    key: "file",
    name: "File Node",
    type: "input",
    status: "active",
    description: "Get File from user",
    tags: ["file", "input"],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System",
    id: "input_2",
    inputParameters: [{
      key: "file",
      value: "",
      type: "text"
    }], 
    outputParameters:[{
      key:"output",
      value:"",
      type:"string"
    }],
  },
  {
    id: "67dbef1fba68eac0121fad7034",
    name: "Ingestion Node",
    type: "agent",
    tags: [
      "Ingestion Node",
      "Ingestion Node"
    ],
    description: "Ingestion Node",
    tools: [],
    agents: [],
    inputParameters: [
      {
        key: "file name",
        value: "",
        type: "text"
      },
      {
        key: "file content",
        value: "",
        type: "string"
      },
      {
        key: "ingest url",
        value: "",
        type: "string"
      }
    ],
    outputParameters: [
      {
        key: "ingestionResponse",
        value: "",
        type: "string"
      }
    ],
    status: true,
    version: 1,
    isPublic: true,
    isActive: true,
    createdBy: "Sunitha",
    updatedBy: "Sunitha",
    createdAt: "2025-03-20T10:34:07.825Z",
    updatedAt: "2025-03-20T10:34:07.825Z"
  }, 
  // {
  //   "id": "decision_0",
  //   "key": "Decision",
  //   "name": "Decision Node",
  //   "type": "decision",
  //   "status": "active",
  //   "description": "Decision Node with two output paths",
  //   "tags": ["decision", "control"],
  //   "inputParameters": [
  //     {
  //       "key": "inputValue",
  //       "value": "",  
  //       "type": "text"
  //     },
  //     {
  //       "key":"decision",
  //       "value":[
  //         {
  //           "key": "condition",
  //           "value": "",      
  //           "type": "dropdown", 
  //           "dropdownOptions": [
  //            "greater_than",
  //            "less_than",
  //            "equal_to", 
  //            "not_equal_to", 
  //            "greater_than_or_equal_to", 
  //            "less_than_or_equal_to",
  //            "contains",
  //            "not_contains",
  //            "is_empty",
  //            "is_not_empty",
  //            "starts_with",
  //            "ends_with"
  //           ]
  //         }
  //       ],
  //       "type":"array"
  //     },
  //     {
  //       "key": "comparisonValue",
  //       "value": "",       
  //       "type": "text"
  //     }
  //   ],
  //   "outputParameters": [
  //     {
  //       "key": "output",
  //       "value": "", 
  //       "type": "text"
  //     }
  //   ],
  //   "next": ["node_if_true", "node_if_false"]  
  // }, 

  {
    "id": "decision_0",
    "key": "Decision",
    "name": "Decisionn Node",
    "displayName": "Evaluate Choice",
    "type": "conditions",
    "description": "Route flow based on selected choice",
    "tags": ["decision", "control"],
    "next": [
      "end_node_option1",
      "email_node",
      "end_node_option3",
      "end_node_option4"
    ],
    "inputParameters": [
      {
        "key": "inputValue",
        "value": "{{selected_choice}}",
        "type": "text"
      },
      {
        "key": "conditions",
        "value": [
          {
            "operator": "equal_to",
            "comparisonValue": "C++",
            "nextNode": "end_node_option1"
          },
          {
            "operator": "equal_to",
            "comparisonValue": "Java",
            "nextNode": "email_node"
          },
          {
            "operator": "equal_to",
            "comparisonValue": "Python",
            "nextNode": "end_node_option3"
          },
          {
            "operator": "equal_to",
            "comparisonValue": "Go",
            "nextNode": "end_node_option4"
          }
        ],
        "type": "condition"
      }
    ],
    "outputParameters": [
      {
        "key": "decision_result",
        "value": "",
        "type": "string"
      }
    ]
  },  

  // {
  //   "node_id": "decision_node",
  //   "name": "Decision Node",
  //   "displayName": "Evaluate Choice",
  //   "type": "decision",
  //   "description": "Route flow based on selected choice",
  //   "next": [
  //     "end_node_option1",
  //     "email_node",
  //     "end_node_option3",
  //     "end_node_option4"
  //   ],
  //   "inputParameters": [
  //     {
  //       "key": "inputValue",
  //       "value": "{{selected_choice}}",
  //       "type": "text"
  //     },
  //     {
  //       "key": "conditions",
  //       "value": [
  //         {
  //           "operator": {
  //             "type": "dropdown",
  //             "value": "equal_to",
  //             "dropdownOptions": [
  //               "equal_to",
  //               "not_equal_to",
  //               "greater_than",
  //               "less_than",
  //               "greater_than_or_equal_to",
  //               "less_than_or_equal_to",
  //               "contains",
  //               "not_contains",
  //               "is_empty",
  //               "is_not_empty",
  //               "starts_with",
  //               "ends_with"
  //             ]
  //           },
  //           "comparisonValue": "C++",
  //           "nextNode": "end_node_option1"
  //         },
  //         {
  //           "operator": {
  //             "type": "dropdown",
  //             "value": "equal_to",
  //             "dropdownOptions": [
  //               "equal_to",
  //               "not_equal_to",
  //               "greater_than",
  //               "less_than",
  //               "greater_than_or_equal_to",
  //               "less_than_or_equal_to",
  //               "contains",
  //               "not_contains",
  //               "is_empty",
  //               "is_not_empty",
  //               "starts_with",
  //               "ends_with"
  //             ]
  //           },
  //           "comparisonValue": "Java",
  //           "nextNode": "email_node"
  //         },
  //         {
  //           "operator": {
  //             "type": "dropdown",
  //             "value": "equal_to",
  //             "dropdownOptions": [
  //               "equal_to",
  //               "not_equal_to",
  //               "greater_than",
  //               "less_than",
  //               "greater_than_or_equal_to",
  //               "less_than_or_equal_to",
  //               "contains",
  //               "not_contains",
  //               "is_empty",
  //               "is_not_empty",
  //               "starts_with",
  //               "ends_with"
  //             ]
  //           },
  //           "comparisonValue": "Python",
  //           "nextNode": "end_node_option3"
  //         },
  //         {
  //           "operator": {
  //             "type": "dropdown",
  //             "value": "equal_to",
  //             "dropdownOptions": [
  //               "equal_to",
  //               "not_equal_to",
  //               "greater_than",
  //               "less_than",
  //               "greater_than_or_equal_to",
  //               "less_than_or_equal_to",
  //               "contains",
  //               "not_contains",
  //               "is_empty",
  //               "is_not_empty",
  //               "starts_with",
  //               "ends_with"
  //             ]
  //           },
  //           "comparisonValue": "Go",
  //           "nextNode": "end_node_option4"
  //         }
  //       ],
  //       "type": "list"
  //     }
  //   ],
  //   "outputParameters": [
  //     {
  //       "key": "decision_result",
  //       "value": "",
  //       "type": "string"
  //     }
  //   ]
  // },
  

  {
    id: "67dbef1fba68eac0121fad7034",
    name: "Code Node",
    type: "agent",
    tags: [
      "Code Node",
      "Code Node"
    ],
    description: "Code Node",
    tools: [],
    agents: [],
    inputParameters: [
      {
        key: "code",
        value: "",
        type: "code"
      },
    ],
    outputParameters: [
      {
        key: "response",
        value: "codeResponse",
        type: "string"
      }
    ],
    status: true,
    version: 1,
    isPublic: true,
    isActive: true,
    createdBy: "Sunitha",
    updatedBy: "Sunitha",
    createdAt: "2025-03-20T10:34:07.825Z",
    updatedAt: "2025-03-20T10:34:07.825Z"
  }, 
  {
    "node_id": "Iterator Node_node-1753342600957-xyzabcd123",
    "name": "Iterator Node",
    "displayName": "Iterator Node",
    "type": "iterator",
    "description": "Iterator Node that loops through each item in a list",
    "next": [],
    "loopPath": null,
    "completionPath": null,
    "inputParameters": [
      {
        "key": "array",
        "value": "",
        "type": "text"  
      },
      {
        "key": "iterationSteps",
        "value": 1,
        "type": "number"  
      },
      {
        "key": "iterationVariable",
        "value": "item",
        "type": "text"  
      }
    ],
    "outputParameters": [
      {
        "key": "output",
        "value": "currentItem",
        "type": "text"  
      }
    ]
  },
  {
    "node_id": "question_node",
    "name": "Question Node",
    "displayName": "Technology Stack Question",
    "type": "question",
    "description": "Ask user about technology stack",
    "next": [],
    "inputParameters": [
      {
        "key": "question_text",
        "value": "Question",
        "type": "string"
      },
      {
        "key": "options",
        "value":
          {
            "Option1": "C++",
            "Option2": "Java"
          },
        "type": "object"
      }
    ],
    "outputParameters": [
      {
        "key": "selected_choice",
        "value": "",
        "type": "string"
      }
    ]
  },
  {
    "node_id": "Template Renderer_node-1753342600958-defgh456",
    "name": "Template Renderer",
    "displayName": "Template Renderer",
    "type": "tool",
    "description": "Renders a template with provided data. Uses Jinja2 syntax like {{ variable_name }}.",
    "next": [],
    "inputParameters": [
      {
        "key": "templateContent",
        "value": "",
        "type": "string"
      },
      {
        "key": "templateData",
        "value": {},
        "type": "object",
        "description": "A JSON object with the data to fill the template.",
        "key_name":"Field Name",
        "key_value":"Field Type"
      },
      {
        "key": "submit",
        "value": "",
        "type": "string",
        "description": "Submit URL for the form."
      }
    ],
    "outputParameters": [
      {
        "key": "output",
        "value": "renderedOutput",
        "type": "string"
      }
    ]
  }, 

  


  
 

  

]

const outputNodes = [
  {
    id: "output_0",
    key: "End",
    name: "End Node",
    type: "output",
    status: "active",
    description: "End Node",
    inputParameters:[{
      key:"final_input", 
      value:"",
      type:"string"
    }],
    outputParameters:[{
      key:"output",
      value:"final_output", 
      type:"string"
    }],
    tags: ["end"],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System"
  },

  {
    id: "output_1",
    key: "response_formatter",
    name: "response_formatter",
    type: "outputs",
    status: "active",
    description: "Format the Output Based on User needs",
    tags: ["text", "output","formatter"],
    inputParameters: [{
      key: "template",
      value: "",
      type: "text"
    }],
    outputParameters: [{
      key: "formatted_output",
      value: "",
      type: "text"
    }],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System"
  }
]

const prebuiltFlows = [
  {
    name: "Travel Plan Flow",
    description: "Gets the current weather and required currency",
    type: "flow",
    graphSpec: {
      nodes: [
        {
          node_id: "67dbef1fba68ebc0121fad70",
          name: "Start Node",
          displayName: "Start Node",
          type: "input",
          description: "Start Node",
          next: ["67e694f8acffb296dfb3932e", "67e64d438da785d4b80d7b45"],
          inputParameters: [],
          outputParameters: []
        },
        {
          node_id: "67e694f8acffb296dfb3932e",
          name: "API caller",
          displayName: "Weather API Caller",
          type: "tool",
          description: "Fetches response from external API",
          next: ["67dbef1fbr78eac9021fahjuo89"],
          inputParameters: [
            {
              key: "method",
              value: "GET",
              type: "text"
            },
            {
              key: "url",
              value: "https://api.openweathermap.org/data/2.5/weather?q=Chennai&cnt=16&appid=5f4c13fe637de59ea1c94ef1cf06cc0d",
              type: "text"
            }
          ],
          outputParameters: [
            {
              key: "api_response",
              value: {},
              type: "json"
            }
          ]
        },
        {
          node_id: "67e64d438da785d4b80d7b45",
          name: "LLM invoker",
          displayName: "LLM invoker",
          type: "agent",
          description: "Invokes LLM for its response",
          next: ["67dbef1fbr78eac9021fahjuo89"],
          inputParameters: [
            {
              key: "prompt",
              value: "What is the currency conversion rate from Ottawa to Chennai?",
              type: "string"
            }
          ],
          outputParameters: [
            {
              key: "llm_response",
              value: "",
              type: "text"
            }
          ]
        },
        {
          node_id: "67dbef1fbr78eac9021fahjuo89",
          name: "End Node",
          displayName: "End Node",
          type: "output",
          description: "End Node",
          next: [],
          inputParameters: [],
          outputParameters: []
        }
      ],
      edges: [
        {
          from: "67dbef1fba68ebc0121fad70",
          to: "67e694f8acffb296dfb3932e"
        },
        {
          from: "67dbef1fba68ebc0121fad70",
          to: "67e64d438da785d4b80d7b45"
        },
        {
          from: "67e694f8acffb296dfb3932e",
          to: "67dbef1fbr78eac9021fahjuo89"
        },
        {
          from: "67e64d438da785d4b80d7b45",
          to: "67dbef1fbr78eac9021fahjuo89"
        }
      ]
    },
    status: "active",
    version: "1.0.0",
    isPublic: true,
    createdBy: "User",
    updatedAt: "2025-04-12T05:23:48.164Z",
    createdAt: "2025-04-01T09:41:10.598Z",
    id: "39e2d144-aae6-4a84-98f1-06555013404c1",
    agent_id: "39e2d144-aae6-4a84-98f1-06555013404c1",
    inputs:[{key:"check",value:"check1",type:"text"}]
  }
];

export { inputNodes, outputNodes, prebuiltFlows };