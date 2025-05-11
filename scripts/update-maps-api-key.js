const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Get API key from environment
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
	console.error("Error: GOOGLE_MAPS_API_KEY not found in .env file");
	process.exit(1);
}

console.log("Updating Google Maps API key in iOS files...");

// Update Info.plist
const infoPlistPath = path.resolve(__dirname, "../ios/woop/Info.plist");
let infoPlistContent = fs.readFileSync(infoPlistPath, "utf8");
infoPlistContent = infoPlistContent.replace(
	/<string>YOUR_ACTUAL_API_KEY<\/string>/g,
	`<string>${apiKey}</string>`
);
fs.writeFileSync(infoPlistPath, infoPlistContent);

// Update AppDelegate.mm
const appDelegatePath = path.resolve(__dirname, "../ios/woop/AppDelegate.mm");
let appDelegateContent = fs.readFileSync(appDelegatePath, "utf8");
appDelegateContent = appDelegateContent.replace(
	/provideAPIKey:@"YOUR_ACTUAL_API_KEY"/g,
	`provideAPIKey:@"${apiKey}"`
);
fs.writeFileSync(appDelegatePath, appDelegateContent);

console.log("API keys successfully updated!");
