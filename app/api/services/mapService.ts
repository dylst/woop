import { axiosInstance } from "../config/axios";
import { supabase } from "@/supabaseClient";
import { Map } from "@/types/map.types";
import { useEffect } from "react";


export const mapService = {

	fetchMarkerLongLang: async (city: string): Promise<Map[]> => {
		try {
			const { data, error } = await supabase
				.from("restaurant")
				.select("*")
				.ilike("city", city);
			console.log(data);
			if (error) {
				console.log(error);
			}

			const responseData =
				data?.map((map) => ({
					name: map.name,
					addressLin: map.addressLin,
					city: map.city,
					state: map.state,
					zipcode: map.zipcode,
					hours: map.hours,
					longitude: map.longitude,
					latitude: map.latitude,
					webUrl: map.webUrl,
				})) || [];

			console.log(responseData);

			return responseData;
		} catch (e) {
			console.log(e);
			return [];
		}
	},
};
