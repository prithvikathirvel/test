const inputNodes = [
  {
    id: "input_0",
    key: "Start",
    name: "Start Node",
    type: "start",
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
    // interrupt: true,
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
    "id": "decision_0",
    "key": "Decision",
    "name": "Decision Node",
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
            "operator": "",
            "comparisonValue": "",
            "nextNode": ""
          }
        ],
        "type": "condition"
      }
    ],
    "outputParameters": [
      {
        "key": "output",
        "value": "decision_result",
        "type": "string"
      }
    ]
  },  
  {
    "node_id": "question_node",
    "name": "Question Node",
    "displayName": "Technology Stack Question",
    "type": "inputs",
    "description": "Ask user about technology stack",
    "next": [],
    "interrupt": true,
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
        "key": "output",
        "value": "selected_choice",
        "type": "string"
      }
    ]
  }, 

  {
    "node_id": "classifier_node",
    "name": "Question Classifier",
    "displayName": "Question Classifier",
    "type": "classifier",
    "description": "Classify customer query",
    "interrupt": false,
    "next": [],
    "inputParameters": [
      {
        "key": "input_text",
        "value": "{{user_enquiry}}",
        "type": "string"
      },
      {
        "key": "classifications",
        "value": [
          {
            "label": "After-sales service",
            "description": "Questions about warranty, returns, repairs, refunds, AppleCare",
            "keywords": ["warranty", "return", "refund", "repair", "broken", "AppleCare", "replace"]
          },
          {
            "label": "Product usage",
            "description": "How to use iPhone features, setup, configuration, troubleshooting",
            "keywords": ["how to", "setup", "configure", "use", "settings", "feature", "install"]
          },
          {
            "label": "Purchase inquiry",
            "description": "Questions about pricing, models, availability, specifications",
            "keywords": ["price", "cost", "buy", "purchase", "model", "specs", "available"]
          },
          {
            "label": "Other questions",
            "description": "General inquiries or unrelated questions",
            "keywords": ["general", "other", "feedback"]
          }
        ],
        "type": "array"
      },
      {
        "key": "model",
        "value": "Gemini",
        "type": "string"
      },
      {
        "key": "enable_memory",
        "value": true,
        "type": "boolean"
      },
      {
        "key": "memory_window",
        "value": 3,
        "type": "number"
      },
      {
        "key": "instructions",
        "value": "Focus on the primary intent. If question mentions multiple topics, classify by the main concern.",
        "type": "string"
      }
    ],
    "outputParameters": [
      {
        "key": "output",
        "value": "question_category",
        "type": "string"
      }
    ]
  }

  


  
 

  

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