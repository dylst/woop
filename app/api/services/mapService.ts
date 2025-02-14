import { axiosInstance } from '../config/axios';
import {supabase} from "@/supabaseClient";
import {Map} from "@/types/map.types";

export const mapService = {
    fetchMarkerLongLang: async (city: string): Promise<Map[]> => {
        try{
            const {data, error} = await supabase.from('restaurant').select('*').ilike('city', city);
            console.log(data)
            if (error) {
                console.log(error);
            }

            const responseData = data?.map((map) => ({
                name: map.name,
                longitude: map.longitude,
                latitude: map.latitude
            })) || [];

            console.log(responseData);

            return responseData;
        }catch (e){
            console.log(e);
            return [];
        }
    }
}