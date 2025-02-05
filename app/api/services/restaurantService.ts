import { axiosInstance } from "../config/axios";
import { Restaurant } from "@/types/restaurant.types";
import {supabase} from "@/supabaseClient";

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

			// if (!response.data || !Array.isArray(response.data.restaurants)) {
			// 	throw new Error("API did not return an expected 'restaurants' array.");
			// }

			return response.data.restaurants; 
		} catch (error) {
			console.error(
				"Error fetching restaurants:",
				error instanceof Error ? error.message : "An unknown error occurred"
			);
			throw error;
		}
	},
	getRestaurantByZipCode: async (
		zipCode: string,
		page: number = 0
	): Promise<Restaurant[]> => {
		try {
			console.log(
				"Fetching restaurants from:",
				`${axiosInstance.defaults.baseURL}/restaurants/location/${zipCode}/${page}`
			);

			const response = await axiosInstance.get(
				`restaurants/location/zipcode/${zipCode}/${page}`
			);

			console.log("Raw API Response:", response.data);

			if (!response.data || !Array.isArray(response.data.restaurants)) {
				console.error("API did not return an expected 'restaurants' array.");

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
	getRestaurantByNameSupabase: async (name: string): Promise<Restaurant[]> => {
		try {
			console.log("🔍 Searching for:", name);
			const trimmedName = name.trim();
			const { data, error } = await supabase
				.from("restaurant")
				.select("*")
				.ilike("name", `${trimmedName}%`);

			console.log("Supabase Query:", `ilike("name", "${name}%")`);
			console.log("Supabase Response:", data);

			if (error) {
				console.error("Supabase Error:", error);
				return [];
			}

			return data?.map((restaurant) => ({
				id: restaurant.id,
				restaurantName: restaurant.name,
				address: restaurant.addressLin,
				zipCode: restaurant.zipCode,
				stateName: restaurant.state,
				cityName: restaurant.city,
			})) || [];
		} catch (error) {
			console.error("Error fetching restaurants:", error);
			return [];
		}
	}

};





export default restaurantService;
