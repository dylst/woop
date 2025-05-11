const { withInfoPlist } = require("@expo/config-plugins");

module.exports = function withMapsFixed(config) {
	return withInfoPlist(config, (config) => {
		// Add GMSApiKey directly to Info.plist
		config.modResults.GMSApiKey = process.env.GOOGLE_MAPS_API_KEY;
		return config;
	});
};
