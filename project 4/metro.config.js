const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  
  return {
    ...config,
    transformer: {
      ...config.transformer,
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      ...config.resolver,
      sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
      assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
    },
  };
})();