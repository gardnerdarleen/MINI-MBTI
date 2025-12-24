/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    // Polyfill fallbacks for browser
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      buffer: false,
      // Fix MetaMask SDK missing dependencies
      "@react-native-async-storage/async-storage": false,
    };
    
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Add alias for globalThis
    config.resolve.alias = {
      ...config.resolve.alias,
      globalThis: require.resolve("globalthis/polyfill"),
    };
    
    // Define global for browser
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          global: "globalThis",
        })
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;
