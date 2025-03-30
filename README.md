
## Development Setup

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Flow Execution

The application uses a local API endpoint to execute flows:

- **Endpoint**: `http://127.0.0.1:5000/execute-graph`
- **Method**: POST
- **Request Body**: 
  ```json
  {
    "agent_id": "flowId"
  }
  ```

Make sure the backend service is running on port 5000 before executing flows.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
