require("dotenv").config();

module.exports = {
	expo: {
		name: "woop",
		slug: "woop",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/AppIcon@3x.png",
		scheme: "myapp",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
			bundleIdentifier: "com.anonymous.woop",
			infoPlist: {
				NSLocationWhenInUseUsageDescription:
					"We need your location to find food items near you and calculate distances to restaurants.",
				NSLocationAlwaysAndWhenInUseUsageDescription:
					"We need your location to find food items near you and calculate distances to restaurants.",
				NSLocationAlwaysUsageDescription:
					"We need your location to find food items near you and calculate distances to restaurants.",
			},
			config: {
				googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			package: "com.anonymous.woop",
			permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
			config: {
				googleMaps: {
					apiKey: process.env.GOOGLE_MAPS_API_KEY,
				},
			},
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},
		plugins: [
			"expo-router",
			"./plugins/withMapsFixed", // Add this line for Google Maps iOS fix
			[
				"expo-splash-screen",
				{
					image: "./assets/images/splash-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
	},
};
