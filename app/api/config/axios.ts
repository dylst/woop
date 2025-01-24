import axios from "axios";
console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("API KEY:", process.env.EXPO_PUBLIC_API_KEY);
console.log("API HOST:", process.env.EXPO_PUBLIC_API_HOST);
export const axiosInstance = axios.create({
	baseURL: process.env.EXPO_PUBLIC_API_URL,
	headers: {
		"x-rapidapi-key": process.env.EXPO_PUBLIC_API_KEY,
		"x-rapidapi-host": process.env.EXPO_PUBLIC_API_HOST,
		"Content-Type": "application/x-www-form-urlencoded",
	},
});

export default axiosInstance;
