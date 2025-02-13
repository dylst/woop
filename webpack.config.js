// webpack.config.js

// module.exports = async function (env, argv) {
//     const config = await createExpoWebpackConfigAsync(env, argv);

//     config.resolve.alias['react-native-maps'] = '@teovilla/react-native-web-maps';

//     return config;
// };

const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    config.resolve.alias['react-native-maps'] = '@teovilla/react-native-web-maps';

	return config;
};

