import { supabase } from "@/supabaseClient";

export const searchFoodItems = async (query: string) => {
  if (!query) return [];

  const { data, error } = await supabase
    .from("fooditem")
    .select("*")
    .ilike("food_name", `%${query}%`);

  if (error) {
    console.error("Error fetching food items:", error);
    return [];
  }

  return data;
};
