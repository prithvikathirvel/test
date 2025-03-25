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
    type: "inputs",
    status: "active",
    description: "Get Text from user",
    tags: ["text", "input"],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System"
  },
  {
    key: "File",
    name: "File Node",
    type: "inputs",
    status: "active",
    description: "Get File from user",
    tags: ["file", "input"],
    createdAt: '',
    updatedAt: '',
    createdBy: "System",
    updatedBy: "System",
    id: "input_2",
    inputParameters: [{
      key: "File",
      value: "",
      type: "file"
    }]
  },

]


export default inputNodes;