import { axiosInstance } from "../config/axios";
import { Restaurant } from "../../../types/restaurant.types";

export const restaurantService = {
	getRestaurantsByState: async (
		state: string,
		page: number = 0
	): Promise<Restaurant[]> => {
		try {
			console.log(
				"Fetching restaurants from:",
				`${axiosInstance.defaults.baseURL}/restaurants/location/state/${state}/${page}`
			);

			const response = await axiosInstance.get(
				`/restaurants/location/state/${state}/${page}`
			);

			console.log("Raw API Response:", response.data);

			if (!response.data || !Array.isArray(response.data.restaurants)) {
				throw new Error("API did not return an expected 'restaurants' array.");
			}

			return response.data.restaurants; 
		} catch (error) {
			console.error(
				"Error fetching restaurants:",
				error instanceof Error ? error.message : "An unknown error occurred"
			);
			throw error;
		}
	},
};

export default restaurantService;
