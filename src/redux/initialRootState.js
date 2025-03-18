const initialRootState = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
  studio: {
    tools: {
      data: [
        {
            "_id": "67d8047470caa6365b4127ed",
            "name": "API caller",
            "type":"Tool",
            "createdBy": "Aakash",
            "updatedBy": "Aakash",
            "createdAt": "2025-03-17T11:16:04.490Z",
            "updatedAt": "2025-03-17T11:16:04.490Z"
        },
        {
            "_id": "67d80529a813bb2b019723cd",
            "name": "PDF Parser",
            "type":"Tool",
            "createdBy": "Aakash",
            "updatedBy": "Aakash",
            "createdAt": "2025-03-17T11:19:05.883Z",
            "updatedAt": "2025-03-17T11:19:05.883Z"
        },
        {
            "_id": "67d805f6abcc23bb1d65327e",
            "name": "Send Mail",
            "type":"Tool",
            "createdBy": "Aakash",
            "updatedBy": "Aakash",
            "createdAt": "2025-03-17T11:22:30.130Z",
            "updatedAt": "2025-03-17T11:22:30.130Z"
        }
    ],
      loading: false,
      error: null
    }, 
    agents: {
      data: [{
        "_id": "67d8047470caa6365b4127ed",
        "name": "PDF Summaizer",
        "type":"Agent",
        "capabilities":["pdfSummaizer"],
        "createdBy": "Aakash",
        "updatedBy": "Aakash",
        "createdAt": "2025-03-17T11:16:04.490Z",
        "updatedAt": "2025-03-17T11:16:04.490Z"
    }],
      loading: false,
      error: null
    }, 

    models : {
      data: 
      [{
        "_id": "67d8047470caa6365b4127ed",
        "name": "Gemini",
        "type":"Model",
        "createdBy": "Aakash",
        "updatedBy": "Aakash",
        "createdAt": "2025-03-17T11:16:04.490Z",
        "updatedAt": "2025-03-17T11:16:04.490Z"
    },
    {
      "_id": "67d8047470caa6365b4127ed",
      "name": "Chatgpt",
      "type":"Model",
      "createdBy": "Aakash",
      "updatedBy": "Aakash",
      "createdAt": "2025-03-17T11:16:04.490Z",
      "updatedAt": "2025-03-17T11:16:04.490Z"
  }
  ],
      loading: false,
      error: null
    }, 
    inputs: {
      data: [
        {
          "_id": "67d8047470caa6365b4127ed",
          "name": "Input Node",
          "type":"Input",
          "createdBy": "Aakash",
          "updatedBy": "Aakash",
          "createdAt": "2025-03-17T11:16:04.490Z",
          "updatedAt": "2025-03-17T11:16:04.490Z"
      }
      ],
      loading: false,
      error: null
    }
  }
};

export default initialRootState;