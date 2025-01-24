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

			console.log("Response Data:", response.data);

			if (!response.data) {
				throw new Error("No data received from API");
			}

			return response.data;
		} catch (error) {
			console.error(
				"Error fetching restaurants:",
				error instanceof Error ? error.message : 'An unknown error occurred'
			);
			throw error;
		}
	},
};

export default restaurantService;
