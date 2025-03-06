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
			.eq("user_id", userId)
			.single();

		if (existingRecord) {
			const currentHistory = existingRecord.search_history || [];

			console.log("Added to search history:", query);

			return supabase
				.from("user_history")
				.update({
					search_history: [...currentHistory, query],
				})
				.eq("user_id", userId)
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

	// Track restaurant views
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
			// Query the reviews table for this user's reviews
			const { data, error } = await supabase
				.from("review") // Your reviews table name
				.select("review_text")
				.eq("profile_id", userId)
				.order("review_date", { ascending: false });

			if (error) throw error;

			console.log(`Found ${data?.length || 0} reviews for user ${userId}`);

			// Return the data as JSON
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
};
