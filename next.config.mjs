/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.1.4',
    '192.168.*',
    '192.168.*.*',
    '*.local',
  ],
};

export default nextConfig;
