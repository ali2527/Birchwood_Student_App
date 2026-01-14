const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  server: {
    enhanceMiddleware: (middleware) => {
      return middleware;
    },
    // Allow connections from network (for physical devices)
    rewriteRequestUrl: (url) => {
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        return url;
      }
      return url;
    },
  },
  watchFolders: [],
  // Enable faster reloads
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
