/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_BASE_URI: "http://localhost:8888",
  },
};

module.exports = nextConfig;
