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
 
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  },
  assetPrefix: '/agent-studio/',
  basePath: '/agent-studio',
  skipTrailingSlashRedirect: true,
  trailingSlash: true
};
 
module.exports = nextConfig;
