import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	RefreshControl,
	Modal,
	Pressable,
} from "react-native";
import FeaturedCard from "@/components/ui/FeaturedCard";
import FiltersHomeNav from "@/components/ui/FiltersHomeNav";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/supabaseClient";
import { ActivityIndicator } from "react-native-paper";
import { fetchRatings, RatingInfo } from "@/hooks/fetchHelper";
import { Route } from "expo-router";
import { userRecommendationService } from "../api/services/userRecommendationService";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const filtersItems = [
	{
		id: "1",
		title: "Cuisine",
		imageSource: require("@/assets/images/try_something_new_cuisine.png"),
		routePath: "/browse/cuisine" as Route,
	},
	{
		id: "2",
		title: "Dietary",
		imageSource: require("@/assets/images/try_something_new_dietary.png"),
		routePath: "/browse/dietary" as Route,
	},
];

const HomePage = () => {
	const insets = useSafeAreaInsets();
	const { user } = useUser();
	const userId = user?.id;

	const [featuredItems, setFeaturedItems] = useState<any[]>([]);
	const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});
	const [recommendations, setRecommendations] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [recommendationsLoading, setRecommendationsLoading] = useState(false);

	// Add new state variables for hiding recommendations
	const [hiddenRecommendations, setHiddenRecommendations] = useState<string[]>(
		[]
	);
	const [hideConfirmVisible, setHideConfirmVisible] = useState(false);
	const [itemToHide, setItemToHide] = useState<string | null>(null);

	// Randomized featured items with random food items from database
	// const shuffleFeaturedItems = <T,>(array: T[]): T[] => {
	//   const newArray = array.slice();
	//   for (let i = newArray.length - 1; i > 0; i--) {
	//     const j = Math.floor(Math.random() * (i + 1));
	//     [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
	//   }
	//   return newArray;
	// }

	//Here is a section where I test the userRecommendationSystem.ts file

	// userRecommendationSystem.ts ENDS HERE

	async function ensureUserProfile(userId: string) {
		const { data, error } = await supabase
			.from("profile")
			.select("id")
			.eq("id", userId)
			.single();

		if (error || !data) {
			const { error: insertError } = await supabase.from("profile").insert({
				id: userId,
				created_at: new Date().toISOString(),
			});

			if (insertError) console.error("Error creating profile:", insertError);
			else console.log(`Created profile for user ${userId}`);
		}
	}

	const fetchFeaturedItems = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from("featured_items")
			.select(
				`
        food_item_id,
        food_name,
        restaurant_name,
        average_rating,
        review_count,
        fooditem:food_item_id (photos)`
			)
			.order("average_rating", { ascending: false })
			.limit(5);

		if (error) {
			console.error("Error fetching food items:", error);
		} else if (data) {
			// const randomFive = shuffleFeaturedItems(data).slice(0, 5); // shuffle the featured items
			setFeaturedItems(data);
		}
		setLoading(false);
	};

	// const fetchRatings = async (itemIds: string[]) => {
	//   if (itemIds.length === 0) return;
	//   setLoading(true);

	//   try {
	//     const { data, error } = await supabase
	//       .from('review')
	//       .select('food_item_id, rating')
	//       .in('food_item_id', itemIds);

	//     if (error) {
	//       console.error('Error fetching ratings:', error);
	//       return;
	//     }
	//     if (!data) return;

	//     const map: { [key: string]: { sum: number, count: number } } = {};

	//     data.forEach((row) => {
	//       if (!map[row.food_item_id]) {
	//         map[row.food_item_id] = { sum: 0, count: 0 };
	//       }
	//       map[row.food_item_id].sum += row.rating;
	//       map[row.food_item_id].count += 1;
	//     });

	//     const finalMap: { [key: string]: RatingInfo } = {};
	//     for (const fid in map) {
	//       const sum = map[fid].sum;
	//       const count = map[fid].count;
	//       finalMap[fid] = {
	//         average: count === 0 ? 0 : sum / count,
	//         count,
	//       };
	//     }

	//     setRatingMap(finalMap);

	//   } catch (error) {
	//     console.log(error);
	//   } finally {
	//     setLoading(false);
	//   }
	// }

	const loadRatings = async (itemIds: string[]) => {
		try {
			const ratings = await fetchRatings(itemIds);
			setRatingMap(ratings);
		} catch (error) {
			console.error(error);
		}
	};

	const onRefresh = useCallback(() => {
		setRefreshing(true);

		// Create a function to fetch both featured items and recommendations
		const fetchAllData = async () => {
			await Promise.all([fetchFeaturedItems(), fetchRecommendations()]);
			setRefreshing(false);
		};

		fetchAllData();
	}, []);

	// Extract the fetchRecommendations function to be reusable
	const fetchRecommendations = async () => {
		if (!userId) return;

		setRecommendationsLoading(true);
		try {
			// Get personalized recommendations
			const { data, error } =
				await userRecommendationService.getEnhancedPersonalizedRecommendations();

			if (error) {
				console.error("Error fetching recommendations:", error);
				return;
			}

			if (!data || data.length === 0) {
				console.log("No recommendations available");
				setRecommendations([]);
				return;
			}

			console.log(`Received ${data.length} recommendations from service`);

			// Store the recommendations in state
			setRecommendations(data);

			// Store the recommendations in Supabase
			console.log("Storing recommendations in Supabase...");
			const storeResult = await userRecommendationService.storeUserRecommendations(
				data
			);

			if (storeResult.error) {
				console.error("Error storing recommendations:", storeResult.error);
				// Continue execution even if storage fails - we can still display recommendations
			} else {
				console.log(`Successfully stored recommendations in Supabase`);
			}
		} catch (error) {
			console.error("Error in recommendation flow:", error);
		} finally {
			setRecommendationsLoading(false);
		}
	};

	useEffect(() => {
		console.log("Ensuring user profile");
		const setup = async () => {
			if (userId) {
				await ensureUserProfile(userId);
			}
		};

		setup();
	}, [userId]);

	useEffect(() => {
		fetchFeaturedItems();
		fetchRecommendations(); // Load recommendations on initial render
	}, []);

	useEffect(() => {
		if (featuredItems.length > 0) {
			const itemIds = featuredItems
				.map((item) => item.id)
				.filter((id) => id !== undefined && id !== null);

			if (itemIds.length > 0) {
				loadRatings(itemIds);
			}
		}
	}, [featuredItems]);

	// Add functions to handle hiding recommendations
	const showHideConfirmation = (id: string) => {
		setItemToHide(id);
		setHideConfirmVisible(true);
	};

	const handleHideRecommendation = async () => {
		if (itemToHide) {
			try {
				// Update local state to hide the recommendation immediately for responsive UI
				setHiddenRecommendations((prev) => [...prev, itemToHide]);

				// Use the userRecommendationService to hide the recommendation
				const { error } = await userRecommendationService.hideRecommendation(
					itemToHide
				);

				if (error) {
					console.error("Error removing recommendation:", error);
					// Revert state change if operation failed
					setHiddenRecommendations((prev) => prev.filter((id) => id !== itemToHide));
				} else {
					console.log("Recommendation removed successfully");
				}

				// Close the modal and reset itemToHide
				setHideConfirmVisible(false);
				setItemToHide(null);
			} catch (error) {
				console.error("Error in handleHideRecommendation:", error);
				// Close the modal but show an error
				setHideConfirmVisible(false);
				setItemToHide(null);
			}
		}
	};

	// Filter out hidden recommendations
	const visibleRecommendations = recommendations.filter(
		(item) => !hiddenRecommendations.includes(item.id)
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<ActivityIndicator
					size='large'
					color='#0000ff'
				/>
			</SafeAreaView>
		);
	}
	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
				contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
			>
				{/* Top Bar */}
				<TopBar type='home' />

				{/* Best in Town Section */}
				<Text style={styles.sectionTitle}>Best in Town!</Text>

				<View style={styles.newSection}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.scrollViewPadding}
					>
						{featuredItems.map((item, index) => {
							const imageUrl = item.fooditem?.photos?.[0] ?? "";
							const averageRating = item.average_rating?.toFixed(1) || "0.0";
							return (
								<FeaturedCard
									key={item.food_item_id}
									id={item.food_item_id}
									photos={{ uri: imageUrl }}
									foodName={item.food_name}
									restaurantName={item.restaurant_name}
									rating={averageRating}
									style={styles.shadowProp}
								/>
							);
						})}
					</ScrollView>
				</View>

				{/* Recommendations Section */}
				<Text style={styles.sectionTitle}>Recommended For You</Text>

				<View style={styles.newSection}>
					{recommendationsLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator
								size='small'
								color='#0000ff'
							/>
							<Text style={styles.loadingText}>
								Finding recommendations for you...
							</Text>
						</View>
					) : visibleRecommendations.length > 0 ? (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.scrollViewPadding}
						>
							{visibleRecommendations.map((item) => (
								<FeaturedCard
									key={item.id}
									id={item.id}
									photos={{ uri: item.photos?.[0] ?? "" }}
									foodName={item.food_name}
									restaurantName={item.restaurant_name}
									rating='New'
									style={styles.shadowProp}
									onHide={showHideConfirmation}
								/>
							))}
						</ScrollView>
					) : (
						<View style={styles.emptyStateContainer}>
							<Text style={styles.emptyStateText}>
								{hiddenRecommendations.length > 0 && recommendations.length > 0
									? "You've hidden all recommendations. Browse and rate more items to get new ones!"
									: "Browse and rate more items to get personalized recommendations!"}
							</Text>
						</View>
					)}
				</View>

				{/* Try Something New Section */}
				<Text style={styles.sectionTitle}>Try something new!</Text>

				<View style={styles.browseSection}>
					{filtersItems.map((item) => (
						<FiltersHomeNav
							key={item.id}
							imageSource={item.imageSource}
							title={item.title}
							routePath={item.routePath}
							style={styles.shadowProp}
						/>
					))}
				</View>

				{/* Hide Confirmation Modal */}
				<Modal
					transparent={true}
					visible={hideConfirmVisible}
					animationType='fade'
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>Remove Recommendation</Text>
							<Text style={styles.modalText}>
								Are you sure you want to remove this recommendation? We'll use this
								feedback to improve your future suggestions.
							</Text>
							<View style={styles.buttonRow}>
								<Pressable
									style={[styles.button, styles.cancelButton]}
									onPress={() => {
										setHideConfirmVisible(false);
										setItemToHide(null);
									}}
								>
									<Text style={styles.cancelButtonText}>Cancel</Text>
								</Pressable>
								<Pressable
									style={[styles.button, styles.confirmButton]}
									onPress={handleHideRecommendation}
								>
									<Text style={styles.confirmButtonText}>Remove</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scrollViewPadding: {
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	newSection: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "700",
		marginVertical: 10,
		paddingHorizontal: 20,
	},
	browseSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	shadowProp: {
		shadowColor: "#000",
		shadowOffset: { width: 4, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 6,
	},
	loadingContainer: {
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	loadingText: {
		marginTop: 8,
		color: "#666",
		fontSize: 14,
	},
	emptyStateContainer: {
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	emptyStateText: {
		color: "#666",
		fontSize: 14,
		textAlign: "center",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	modalContent: {
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		width: "100%",
		maxWidth: 400,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	modalText: {
		marginBottom: 20,
		textAlign: "center",
		fontSize: 14,
		lineHeight: 20,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		minWidth: "45%",
		alignItems: "center",
		justifyContent: "center",
	},
	cancelButton: {
		backgroundColor: "#f0f0f0",
		marginRight: 10,
	},
	confirmButton: {
		backgroundColor: "#FF6347",
	},
	cancelButtonText: {
		fontWeight: "600",
		color: "#333",
	},
	confirmButtonText: {
		fontWeight: "600",
		color: "#fff",
	},
});

export default HomePage;
