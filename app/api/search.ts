import { supabase } from '@/supabaseClient';

export const searchFoodItems = async (keyword: string) => {
    try {
        const { data, error } = await supabase
            .from("fooditem")
            .select("*")
            .or(
                `food_name.ilike.%${keyword}%, 
                cuisine_type.ilike.%${keyword}%, 
                dietary_tags.ilike.%${keyword}%, 
                description.ilike.%${keyword}%`
            );

        if (error) {
            console.error("Error searching food items:", error);
            return [];
        }

        return data;
    } catch (err) {
        console.error("Unexpected error:", err);
        return [];
    }
};

