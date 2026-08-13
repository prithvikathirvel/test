module.exports = {
  apps: [
    {
      name: "agent-studio-frontend-v2",
      cwd: __dirname,
      script: "npm",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        AGENT_STUDIO_API_DESTINATION: process.env.AGENT_STUDIO_API_DESTINATION,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        ENGINE_URL: process.env.ENGINE_URL,
        AUTH_LOGIN_URL: process.env.AUTH_LOGIN_URL

      }
    }
  ]
};
