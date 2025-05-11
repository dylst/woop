const fs = require("fs");
const path = require("path");
require("dotenv").config();

const infoPlistPath = path.resolve(__dirname, "../ios/woop/Info.plist");

try {
	if (!process.env.GOOGLE_MAPS_API_KEY) {
		throw new Error(
			"GOOGLE_MAPS_API_KEY is not defined in the environment variables."
		);
	}

	if (!fs.existsSync(infoPlistPath)) {
		throw new Error(`Info.plist file not found at path: ${infoPlistPath}`);
	}

	let content = fs.readFileSync(infoPlistPath, "utf8");

	if (!content.includes("YOUR_API_KEY_HERE")) {
		throw new Error(
			"Placeholder 'YOUR_API_KEY_HERE' not found in Info.plist file."
		);
	}

	content = content.replace(
		"YOUR_API_KEY_HERE",
		process.env.GOOGLE_MAPS_API_KEY
	);
	fs.writeFileSync(infoPlistPath, content);

	console.log("Google Maps API key successfully added to Info.plist.");
} catch (error) {
	console.error(`Error setting up Google Maps API key: ${error.message}`);
	process.exit(1);
}
