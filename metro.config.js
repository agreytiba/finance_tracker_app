const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add WASM support to the resolver
config.resolver.sourceExts.push('wasm');

// Configure transformer to handle WASM files
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Add WASM asset handling
config.resolver.assetExts.push('wasm');

// Configure Metro to properly handle WASM files
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
