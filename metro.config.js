const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Alias `react-native-maps` to `@teovilla/react-native-web-maps`
config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'react-native-maps': require.resolve('@teovilla/react-native-web-maps'),
};

module.exports = config;
