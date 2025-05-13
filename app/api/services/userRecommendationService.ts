import { supabase } from "@/supabaseClient";
import { getCurrentUserId } from "@/hooks/userUUID";
import { teardownTraceSubscriber } from "next/dist/build/swc/generated-native";
import { log } from "console";
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
				.select("review_text, rating")
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
	async storeUserRecommendations(recommendations: any) {
		const userId = await getCurrentUserId();
		if (!userId || !recommendations || recommendations.length === 0) {
			console.log("No user ID or recommendations to store");
			return { data: null, error: null }; // Changed to return null error to avoid console errors
		}

		try {
			console.log(
				`Processing ${recommendations.length} food recommendations for user ${userId}`
			);

			// Convert to proper format with user ID and food item ID
			const recommendationsToInsert = recommendations.map((item: any) => ({
				user_id: userId,
				fooditem: item.id,
				created_at: new Date().toISOString(),
			}));

			// Check if recommendations already exist for this user
			const { data: existingRecs, error: existingError } = await supabase
				.from("user_recommendation")
				.select("fooditem")
				.eq("user_id", userId);

			if (existingError) {
				console.warn("Error checking existing recommendations:", existingError);
				// Continue processing even with error
			}

			// Filter out recommendations that already exist
			let newRecommendations = recommendationsToInsert;
			if (existingRecs && existingRecs.length > 0) {
				const existingFoodIds = new Set(
					existingRecs.map((rec: any) => rec.fooditem)
				);
				newRecommendations = recommendationsToInsert.filter(
					(rec: any) => !existingFoodIds.has(rec.fooditem)
				);
			}

			// If no new recommendations, just return success
			if (newRecommendations.length === 0) {
				console.log("All recommendations already exist for this user");
				return { data: null, error: null };
			}

			// Insert only new recommendations
			const { data, error } = await supabase
				.from("user_recommendation")
				.insert(newRecommendations);

			if (error) {
				// Don't log this as an error, just handle it gracefully
				console.log("Note: Some recommendations may already exist:", error.message);
				return { data: null, error: null };
			}

			console.log(
				`Successfully stored ${newRecommendations.length} new recommendations for user ${userId}`
			);
			return { data, error: null };
		} catch (error) {
			// Log the error but return null to avoid propagating the error
			console.log("Error in storeUserRecommendations:", error);
			return { data: null, error: null };
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
				return {
					data: [],
					error:
						"You need to review some foods before we can generate recommendations",
				};
			}
			console.log(`Found ${userReviews.length} reviews for user ${userId}`);

			// Get the user's favorited items to exclude them from recommendations
			const { data: favoritedItems, error: favoriteError } = await supabase
				.from("favorite")
				.select("food_item_id")
				.eq("profile_id", userId);

			if (favoriteError) {
				console.warn(
					"Error fetching favorites with user_id, trying profile_id:",
					favoriteError
				);
				// Try with profile_id if user_id fails
				const { data: favoritesByProfileId } = await supabase
					.from("favorite")
					.select("food_item_id")
					.eq("profile_id", userId);

				if (favoritesByProfileId && favoritesByProfileId.length > 0) {
					console.log(
						`Found ${favoritesByProfileId.length} favorites with profile_id`
					);
				}
			}

			// Combine reviewed items and favorited items to exclude from recommendations
			const foodItemIds = userReviews.map((review) => review.food_item_id);
			const favoritedIds = favoritedItems?.map((item) => item.food_item_id) || [];
			const excludeIds = [...new Set([...foodItemIds, ...favoritedIds])];

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
				.not("id", "in", `(${excludeIds.join(",")})`)
				.filter("cuisine_type", "cs", `{${topCuisines[0]}}`) // Contains any top cuisine
				.limit(limit);

			if (recError) throw recError;
			console.log(
				`Found ${recommendations?.length || 0} recommendations for user ${userId}`
			);
			if (!recommendations || recommendations.length === 0) {
				return { data: [], error: "No recommendations found" };
			}
			// const res  = await this.storeUserRecommendations(recommendations);
			// if (res.error) {
			// 	console.error("Failed to store recommendations:", res.error);
			// 	return { data: null, error: res.error };
			// }
			return { data: recommendations || [], error: null };
		} catch (error) {
			console.error("Error generating recommendations:", error);
			return { data: null, error };
		}
	},
	async hideRecommendation(foodItemId: string) {
		const userId = await getCurrentUserId();
		if (!userId) return { data: null, error: "No user logged in" };

		try {
			console.log(`Removing recommendation ${foodItemId} for user ${userId}`);

			// Delete from user_recommendation table
			const { data, error } = await supabase
				.from("user_recommendation")
				.delete()
				.eq("user_id", userId)
				.eq("fooditem", foodItemId)
				.select();

			if (error) {
				console.error("Error removing recommendation:", error);
				throw error;
			}

			console.log(`Successfully removed recommendation ${foodItemId}`);
			return { data, error: null };
		} catch (error) {
			console.error("Error removing recommendation:", error);
			return { data: null, error };
		}
	},
	async getViewedFoodItems() {
		const userId = await getCurrentUserId();
		if (!userId) return { data: [], error: "No user logged in" };

		try {
			// Get food items the user has reviewed
			const { data: reviewedItems, error: reviewError } = await supabase
				.from("review")
				.select("food_item_id")
				.eq("profile_id", userId);

			if (reviewError) throw reviewError;

			const viewedIds = reviewedItems.map((item) => item.food_item_id);
			return { data: viewedIds, error: null };
		} catch (error) {
			console.error("Error fetching viewed food items:", error);
			return { data: [], error };
		}
	},
	async getEnhancedPersonalizedRecommendations(limit = 10) {
		const userId = await getCurrentUserId();
		if (!userId) return { data: null, error: "No user logged in" };

		try {
			console.log(`Generating enhanced recommendations for user ${userId}`);

			// --- GET ALREADY VIEWED/RATED ITEMS ---
			const { data: viewedIds } = await this.getViewedFoodItems();

			// --- STEP 1: GATHER ALL USER DATA ---

			// Get reviews and their ratings
			const { data: userReviews, error: reviewError } = await supabase
				.from("review")
				.select("food_item_id, rating, review_date")
				.eq("profile_id", userId);

			if (reviewError) {
				console.warn("Error fetching reviews:", reviewError);
				// Continue execution even if reviews fail
			}

			// Get user favorites/likes - try both column names to be safe
			let userFavorites = null;
			const { data: favorites, error: favError } = await supabase
				.from("favorite")
				.select("food_item_id")
				.eq("user_id", userId); // Try user_id first

			if (favError) {
				console.warn(
					"Error fetching favorites with user_id, trying profile_id:",
					favError
				);
				// Try with profile_id if user_id fails
				const { data: favoritesByProfileId, error: profileFavError } =
					await supabase
						.from("favorite")
						.select("food_item_id")
						.eq("profile_id", userId);

				if (profileFavError) {
					console.warn("Error fetching favorites with profile_id:", profileFavError);
				} else if (favoritesByProfileId?.length > 0) {
					console.log(
						`Found ${favoritesByProfileId.length} favorites with profile_id`
					);
				}

				// Use whatever we found with profile_id
				if (favoritesByProfileId) {
					userFavorites = favoritesByProfileId;
				}
			} else {
				userFavorites = favorites;
			}

			// Get user view history - try both column names to be safe
			let userHistory = null;
			const { data: history, error: historyError } = await supabase
				.from("user_history")
				.select("restaurant_id, search_history, event_type")
				.eq("user_id", userId);

			if (historyError) {
				console.warn("Error fetching user history with user_id:", historyError);
				// Try with profile_id if user_id fails
				const { data: historyByProfileId, error: profileHistoryError } =
					await supabase
						.from("user_history")
						.select("restaurant_id, search_history, event_type")
						.eq("profile_id", userId);

				if (profileHistoryError) {
					console.warn(
						"Error fetching history with profile_id:",
						profileHistoryError
					);
				} else if (historyByProfileId?.length > 0) {
					console.log(
						`Found ${historyByProfileId.length} history records with profile_id`
					);
				}

				// Use whatever we found with profile_id
				if (historyByProfileId) {
					userHistory = historyByProfileId;
				}
			} else {
				userHistory = history;
			}

			// --- STEP 2: EXTRACT PREFERENCES ---

			// Check if we have ANY data to work with
			const hasReviews = userReviews && userReviews.length > 0;
			const hasFavorites = userFavorites && userFavorites.length > 0;
			const hasHistory = userHistory && userHistory.length > 0;

			// If no reviews or favorites, return early with a message
			if (!hasReviews && !hasFavorites) {
				console.log(
					"No reviews or favorites found - cannot generate recommendations"
				);
				return {
					data: [],
					error:
						"Please review or favorite some foods before we can make recommendations for you",
				};
			}

			// Process reviews - extract food items and ratings
			const reviewedFoodIds =
				userReviews?.map((review) => review.food_item_id) || [];

			// Get favorited food IDs to exclude from recommendations
			const favoritedFoodIds = userFavorites?.map((fav) => fav.food_item_id) || [];

			// Combine all IDs that should be excluded from recommendations
			const excludeFromRecommendationIds = [
				...new Set([...(viewedIds || []), ...reviewedFoodIds, ...favoritedFoodIds]),
			];

			// Get cuisine data from reviewed foods
			const { data: reviewedFoods, error: foodError } =
				reviewedFoodIds.length > 0
					? await supabase
							.from("fooditem")
							.select("id, cuisine_type, dietary_tags, restaurant_name")
							.in("id", reviewedFoodIds)
					: { data: [], error: null };

			if (foodError)
				console.warn("Error fetching reviewed food details:", foodError);

			// --- STEP 3: ANALYZE PATTERNS ---

			// Calculate cuisine preferences (weighted by ratings)
			const cuisinePreferences: Record<string, number> = {};

			// Process reviewed foods (with rating weight)
			if (reviewedFoods && reviewedFoods.length > 0) {
				reviewedFoods.forEach((food) => {
					if (!food.cuisine_type) return;

					// Find the rating for this food item
					const review = userReviews?.find((r) => r.food_item_id === food.id);
					const ratingWeight = review ? review.rating / 5 : 0.5; // Scale 0-1

					// Apply cuisine preference with rating weight
					if (Array.isArray(food.cuisine_type)) {
						food.cuisine_type.forEach((cuisine) => {
							cuisinePreferences[cuisine] =
								(cuisinePreferences[cuisine] || 0) + ratingWeight;
						});
					} else if (typeof food.cuisine_type === "string") {
						cuisinePreferences[food.cuisine_type] =
							(cuisinePreferences[food.cuisine_type] || 0) + ratingWeight;
					}
				});
			}

			// Process favorites directly - stronger weight
			if (hasFavorites) {
				const favoriteFoodIds = userFavorites?.map((f) => f.food_item_id) || [];

				if (favoriteFoodIds.length > 0) {
					const { data: favoriteFoods, error: favFoodError } = await supabase
						.from("fooditem")
						.select("id, cuisine_type")
						.in("id", favoriteFoodIds);

					if (favFoodError)
						console.warn("Error fetching favorite food details:", favFoodError);

					// Add stronger weight for favorites
					favoriteFoods?.forEach((food) => {
						if (!food.cuisine_type) return;

						// Higher weight for favorites (2.0)
						const favoriteWeight = 2.0;

						if (Array.isArray(food.cuisine_type)) {
							food.cuisine_type.forEach((cuisine) => {
								cuisinePreferences[cuisine] =
									(cuisinePreferences[cuisine] || 0) + favoriteWeight;
							});
						} else if (typeof food.cuisine_type === "string") {
							cuisinePreferences[food.cuisine_type] =
								(cuisinePreferences[food.cuisine_type] || 0) + favoriteWeight;
						}
					});
				}
			}

			// Process restaurant views and favorites
			const viewedRestaurants = new Set(
				userHistory
					?.filter((h) => h.event_type === "view" && h.restaurant_id)
					.map((h) => h.restaurant_id) || []
			);

			const favoritedRestaurants = new Set(
				userFavorites?.map((f) => f.food_item_id) || []
			);

			// Get restaurant data for viewed/favorited places
			const allRestaurantIds = [...viewedRestaurants, ...favoritedRestaurants];

			if (allRestaurantIds.length > 0) {
				const { data: restaurants } = await supabase
					.from("restaurant")
					.select("id, cuisine_type, name")
					.in("id", allRestaurantIds);

				// Add cuisine preferences from viewed/favorited restaurants
				restaurants?.forEach((restaurant) => {
					if (!restaurant.cuisine_type) return;

					const isFavorite = favoritedRestaurants.has(restaurant.id);
					const viewWeight = viewedRestaurants.has(restaurant.id) ? 0.3 : 0;
					const favoriteWeight = isFavorite ? 0.7 : 0;
					const totalWeight = viewWeight + favoriteWeight;

					if (Array.isArray(restaurant.cuisine_type)) {
						restaurant.cuisine_type.forEach((cuisine) => {
							cuisinePreferences[cuisine] =
								(cuisinePreferences[cuisine] || 0) + totalWeight;
						});
					} else if (typeof restaurant.cuisine_type === "string") {
						cuisinePreferences[restaurant.cuisine_type] =
							(cuisinePreferences[restaurant.cuisine_type] || 0) + totalWeight;
					}
				});
			}

			// Process search history
			const searchTerms =
				userHistory
					?.map((h) => h.search_history)
					.flat()
					.filter(Boolean) || [];

			if (searchTerms.length > 0) {
				const { data: allCuisines } = await supabase
					.from("fooditem")
					.select("cuisine_type")
					.limit(100);

				const uniqueCuisines = new Set<string>();
				allCuisines?.forEach((item) => {
					if (Array.isArray(item.cuisine_type)) {
						item.cuisine_type.forEach((c) => uniqueCuisines.add(c));
					} else if (typeof item.cuisine_type === "string") {
						uniqueCuisines.add(item.cuisine_type);
					}
				});

				// Match search terms against cuisines
				searchTerms.forEach((term) => {
					if (!term) return;
					const lowerTerm = term.toLowerCase();

					uniqueCuisines.forEach((cuisine) => {
						if (
							cuisine.toLowerCase().includes(lowerTerm) ||
							lowerTerm.includes(cuisine.toLowerCase())
						) {
							cuisinePreferences[cuisine] = (cuisinePreferences[cuisine] || 0) + 0.2;
						}
					});
				});
			}

			// --- STEP 4: GENERATE RECOMMENDATIONS ---

			// If we still couldn't determine cuisine preferences, use fallback
			if (Object.keys(cuisinePreferences).length === 0) {
				console.log("Could not determine cuisine preferences");
				return {
					data: [],
					error:
						"We need more information about your preferences to make recommendations",
				};
			}

			// Get top cuisines based on combined preferences
			const topCuisines = Object.entries(cuisinePreferences)
				.sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
				.slice(0, 3)
				.map(([cuisine]) => cuisine);

			console.log("User's top cuisine preferences (combined data):", topCuisines);

			// Find foods matching these cuisines that user hasn't reviewed
			let query = supabase
				.from("fooditem")
				.select(
					"id, food_name, restaurant_name, photos, price_range, cuisine_type"
				);

			// Exclude already reviewed items, viewed items, and favorited items
			if (excludeFromRecommendationIds.length > 0) {
				query = query.not(
					"id",
					"in",
					`(${excludeFromRecommendationIds.join(",")})`
				);
			}

			// Create OR conditions for multiple cuisines
			if (topCuisines.length > 1) {
				const cuisineFilters = topCuisines
					.map((cuisine) => `cuisine_type.cs.{${cuisine}}`)
					.join(",");

				query = query.or(cuisineFilters);
			} else {
				// Just one cuisine
				query = query.filter("cuisine_type", "cs", `{${topCuisines[0]}}`);
			}

			const { data: recommendations, error: recError } = await query
				.order("id")
				.limit(limit);

			if (recError) {
				console.error("Error fetching cuisine-based recommendations:", recError);
				return { data: [], error: "Could not fetch recommendations" };
			}

			console.log(
				`Found ${recommendations?.length || 0} enhanced recommendations`
			);

			// Add recommendation reason
			const enhancedRecommendations = recommendations?.map((item) => ({
				...item,
				recommendationReason: `Based on your ${
					topCuisines.length > 0
						? topCuisines.join(", ") + " preferences"
						: "activity"
				}`,
				cuisinePreferences: topCuisines.join(", "),
			}));

			return { data: enhancedRecommendations || [], error: null };
		} catch (error) {
			console.error("Error generating enhanced recommendations:", error);
			return { data: [], error: "Could not generate recommendations" };
		}
	},
};
