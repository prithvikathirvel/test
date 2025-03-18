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
            "toolName": "API caller",
            "createdBy": "Aakash",
            "updatedBy": "Aakash",
            "createdAt": "2025-03-17T11:16:04.490Z",
            "updatedAt": "2025-03-17T11:16:04.490Z"
        },
        {
            "_id": "67d80529a813bb2b019723cd",
            "toolName": "PDF Parser",
            "createdBy": "Aakash",
            "updatedBy": "Aakash",
            "createdAt": "2025-03-17T11:19:05.883Z",
            "updatedAt": "2025-03-17T11:19:05.883Z"
        },
        {
            "_id": "67d805f6abcc23bb1d65327e",
            "toolName": "Send Mail",
            "createdBy": "Aakash",
            "updatedBy": "Aakash",
            "createdAt": "2025-03-17T11:22:30.130Z",
            "updatedAt": "2025-03-17T11:22:30.130Z"
        }
    ],
      loading: false,
      error: null
    }
  }
};

export default initialRootState;