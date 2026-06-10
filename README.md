# Agent Studio Frontend

An advanced, canvas-based visual builder for designing, testing, and deploying AI Agent workflows. Built with **Next.js 15**, **ReactFlow**, and **Redux Toolkit**, this studio provides a seamless experience for orchestrating complex LLM-powered applications.

## 🚀 Key Features

- **Visual Flow Builder**: A drag-and-drop canvas powered by `ReactFlow` for orchestrating agentic workflows.
- **Diverse Node Library**:
  - **Input Nodes**: Start, Text Input, Question Nodes.
  - **Tool Nodes**: Knowledge Retrieval (RAG), API Callers.
  - **Control Nodes**: Decision Logic, Iterators, Classifiers.
  - **Agent Nodes**: LLM Invokers for direct model interaction.
  - **Output Nodes**: End, Response Formatters.
- **Knowledge Base Management**: Interface for managing data sources and vector databases for Retrieval Augmented Generation (RAG).
- **Integrated Chatbot Sandbox**: Real-time testing of agent flows within a built-in chat interface.
- **Dynamic Configuration**: Detailed property panels for configuring node parameters, variables, and logic.
- **State Persistence**: Redux-backed state management with persistence for a robust development experience.
- **Responsive Design**: Modern UI built with Tailwind CSS and MUI, featuring elegant animations with Framer Motion.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Canvas**: [ReactFlow](https://reactflow.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [MUI (Material UI)](https://mui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) & [MUI Icons](https://mui.com/material-ui/material-icons/)
- **Code Editor**: [CodeMirror](https://codemirror.net/) (for JSON and logic editing)
- **API Client**: [Axios](https://axios-http.com/)

## 📂 Project Structure

```text
src/
├── app/                # Next.js App Router (Pages & Layouts)
│   ├── dashboard/      # Overview of flows and agents
│   ├── knowledge/      # Knowledge base management
│   ├── login/          # Authentication pages
│   └── studio/         # The core Flow Builder canvas
├── components/         # Reusable UI components
│   ├── studio/         # Flow builder specific components (Sidebar, Modals, Chat)
│   ├── FlowNodes/      # Custom ReactFlow node implementations
│   └── common/         # Shared UI elements (Buttons, Inputs, etc.)
├── redux/              # Global state management
│   ├── slices/         # Feature-specific state (studio, flow, knowledge, auth)
│   └── store.js        # Redux store configuration
├── utils/              # Helper functions and data models
│   └── dataModels.js   # Definitions for node types and initial states
└── hooks/              # Custom React hooks
```

## 🚥 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agent-studio-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add necessary backend URLs:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

### Development

Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm run start
```

## 🔌 API Integration

The frontend expects a backend service (typically a Python/Flask or Node.js server) to handle flow execution.

- **Flow Execution Endpoint**: `POST /execute-graph`
- **Request Payload**:
  ```json
  {
    "agent_id": "uuid-of-the-flow",
    "inputs": { ... }
  }
  ```

## 🧪 Testing Flows

Use the integrated **Studio ChatBot** to interact with your flows in real-time. The chatbot sends messages to the agent execution engine and renders the responses, allowing you to debug logic and prompt performance instantly.

---

Built with ❤️ by the Agent Studio Team.
