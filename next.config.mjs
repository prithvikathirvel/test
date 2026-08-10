/** @type {import('next').NextConfig} */
const API_DESTINATION = process.env.AGENT_STUDIO_API_DESTINATION || 'http://223.30.168.13/ai/api/agent-studio';
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['*'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/agent-studio/',
        basePath: false,
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_DESTINATION}/:path*`
      }
    ];
  },
  assetPrefix: '/agent-studio/',
  basePath: '/agent-studio',
  skipTrailingSlashRedirect: true,
  trailingSlash: true
};

export default nextConfig;
