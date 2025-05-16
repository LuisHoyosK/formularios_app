const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // otras opciones que ya tengas, como reactStrictMode, etc.
};

module.exports = nextConfig;
