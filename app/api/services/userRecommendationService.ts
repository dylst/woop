import { supabase } from "@/supabaseClient";
import { getCurrentUserId } from "@/hooks/userUUID";
export const userRecommendationService = {
	async trackSearch(query: string) {
		const userId = await getCurrentUserId();
		if (!userId) return;
		console.log("userId from trackSearch", userId);

		const { data: existingRecord } = await supabase
			.from("user_history")
			.select("search_history")
			.eq("profile_id", userId)
			.single();

		if (existingRecord) {
			const currentHistory = existingRecord.search_history || [];

			console.log("Added to search history:", query);

			return supabase
				.from("user_history")
				.update({
					search_history: [...currentHistory, query],
				})
				.eq("profile_id", userId)
				.then((response) => {
					if (response.error) {
						console.error("Failed to update search history:", response.error);
					} else {
						console.log("Successfully updated search history in database!");
					}
					return response;
				});
		} else {
			console.log("Creating new search history with:", query); // Added log for this case

			return supabase
				.from("user_history")
				.insert({
					user_id: userId,
					search_history: [query],
				})
				.then((response) => {
					if (response.error) {
						console.error("Failed to create search history:", response.error);
					} else {
						console.log("Successfully created search history in database!");
					}
					return response;
				});
		}
	},

	async trackRestaurantView(restaurantId: string, restaurantData?: any) {
		const userId = await getCurrentUserId();
		if (!userId) return;

		return supabase.from("user_history").insert({
			user_id: userId,
			event_type: "view",
			restaurant_id: restaurantId,
			cuisine_type: restaurantData?.cuisineType,
			metadata: restaurantData,
		});
	},

	// Track favorites/bookmarks
	async trackFavorite(restaurantId: string, isFavorited: boolean) {
		const userId = await getCurrentUserId;

		if (!userId) return;

		return supabase.from("user_history").insert({
			user_id: userId,
			event_type: "favorite",
			restaurant_id: restaurantId,
			metadata: { isFavorited },
		});
	},
	async getUserReviews() {
		const userId = await getCurrentUserId();
		if (!userId) return { data: null, error: "No user logged in" };

		try {
			// Here we are going to select the reviews from the table to get the user review 
			const { data, error } = await supabase
				.from("review") 
				.select("review_text")
				.eq("profile_id", userId)
				.order("review_date", { ascending: false });

			if (error) throw error;

			console.log(`Found ${data?.length || 0} reviews for user ${userId}`);

		
			return {
				data,
				count: data?.length || 0,
				error: null,
			};
		} catch (error) {
			console.error("Error fetching user reviews:", error);
			return { data: null, error };
		}
	},
	async getPersonalizedRecommendations(limit = 10) {
		const userId = await getCurrentUserId();
		if (!userId) return { data: null, error: "No user logged in" };

		try {
			//  Get all user reviews
			const { data: userReviews, error: reviewError } = await supabase
				.from("review")
				.select("food_item_id")
				.eq("profile_id", userId);

			if (reviewError) throw reviewError;
			if (!userReviews || userReviews.length === 0) {
				return { data: [], error: "No review history found" };
			}

			const foodItemIds = userReviews.map((review) => review.food_item_id);
			const { data: reviewedFoods, error: foodError } = await supabase
				.from("fooditem")
				.select("id, cuisine_type, dietary_tags")
				.in("id", foodItemIds);

			if (foodError) throw foodError;

			//  Analyze patterns in user's reviewed foods and here I used frequency of cuisine types
			const cuisineFrequency: Record<string, number> = {};
			reviewedFoods.forEach((food) => {
				if (Array.isArray(food.cuisine_type)) {
					food.cuisine_type.forEach((cuisine) => {
						cuisineFrequency[cuisine] = (cuisineFrequency[cuisine] || 0) + 1;
					});
				} else if (typeof food.cuisine_type === "string") {
					cuisineFrequency[food.cuisine_type] =
						(cuisineFrequency[food.cuisine_type] || 0) + 1;
				}
			});

			// Sort cuisines by frequency
			const topCuisines = Object.entries(cuisineFrequency)
				.sort(([, countA], [, countB]) => Number(countB) - Number(countA))
				.slice(0, 3)
				.map(([cuisine]) => cuisine);

			console.log("User's top cuisine preferences:", topCuisines);

			// Find similar foods the user hasn't reviewed yet
			const { data: recommendations, error: recError } = await supabase
				.from("fooditem")
				.select("id, food_name, restaurant_name, price_range, cuisine_type")
				.not("id", "in", `(${foodItemIds.join(",")})`) // Exclude already reviewed items
				.filter("cuisine_type", "cs", `{${topCuisines[0]}}`) // Contains any top cuisine
				.limit(limit);

			if (recError) throw recError;

			return { data: recommendations || [], error: null };
		} catch (error) {
			console.error("Error generating recommendations:", error);
			return { data: null, error };
		}
	},
};
