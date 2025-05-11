import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	Pressable,
	Image,
	ScrollView,
	Animated,
	Alert,
	Modal,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/supabaseClient";
import { Colors } from "@/constants/Colors";
import { useUser } from "../context/UserContext";
import { fetchRatings, RatingInfo } from "@/hooks/fetchHelper";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
// to position back button within safe area view
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StarRating from "@/components/ui/StarRating";
import { userRecommendationService } from "../api/services/userRecommendationService";

export default function FoodItemDetailPage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const { user } = useUser();
	const { foodItemId } = useLocalSearchParams();

	const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});

	const [reviews, setReviews] = useState<any[]>([]);
	const [ratingsBar, setRatingsBar] = useState<any[]>([]);
	const [isFavorite, setIsFavorites] = useState(false);
	const [tags, setTags] = useState<any[]>([]);
	const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
	const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
	const [tagModalVisible, setTagModalVisible] = useState(false);

	const [itemData, setItemData] = useState<any>(null);
	const [isFeatured, setIsFeatured] = useState(false);
	const [imageUri, setImageUri] = useState<string>("");
	const [reviewImageUri, setReviewImageUri] = useState<string>("");
	const [uploading, setUploading] = useState(false);
	const [showingUploadStatus, setShowingUploadStatus] = useState(false);
	const [uploadProgress, setUploadProgress] = useState("Uploading...");
	const [barContainerWidth, setBarContainerWidth] = useState<number>(0);
	const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
	const [uploadType, setUploadType] = useState<"main" | "review">("review");
	// Add new state variables for hiding recommendations
	const [hiddenRecommendations, setHiddenRecommendations] = useState<number[]>(
		[]
	);
	const [hideConfirmVisible, setHideConfirmVisible] = useState(false);
	const [itemToHide, setItemToHide] = useState<number | null>(null);

	// Select image from library
	const selectImage = async (photoType: "main" | "review" = "review") => {
		try {
			// Set the upload type based on the button pressed
			setUploadType(photoType);

			// Request media library permissions
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (status !== "granted") {
				Alert.alert(
					"Permission needed",
					"Sorry, we need camera roll permissions to make this work!"
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 0.8,
				allowsEditing: true,
				aspect: [4, 3],
			});

			if (!result.canceled && result.assets.length > 0) {
				const selectedUri = result.assets[0].uri;
				// Set the appropriate state variable based on photo type
				if (photoType === "main") {
					setImageUri(selectedUri);
				} else {
					setReviewImageUri(selectedUri);
				}
				// Show preview modal instead of auto uploading
				setImagePreviewVisible(true);
			}
		} catch (error) {
			console.error("Error selecting image:", error);
			Alert.alert("Error", "Failed to open photo library. Please try again.");
			return;
		}
	};

	{
		/* Upload image to Supabase */
	}
	const uploadImage = async (uri: string, type: "main" | "review") => {
		if (!uri) return;

		try {
			setUploading(true);
			setShowingUploadStatus(true);
			setUploadProgress("Preparing upload...");

			// Get filename from URI
			const fileName = uri.split("/").pop() || `food_${Date.now()}.jpg`;

			setUploadProgress("Reading file...");
			const base64 = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
			});
			const fileData = decode(base64);

			// Upload to Supabase
			setUploadProgress("Uploading to server...");
			const { data, error } = await supabase.storage
				.from("image-reviews") // Using the image-reviews bucket
				.upload(`fooditems/${fileName}`, fileData, {
					contentType: "image/jpeg",
				});

			if (error) {
				console.error("Error uploading image:", error);
				setUploading(false);
				setShowingUploadStatus(false);
				Alert.alert(
					"Upload Failed",
					"There was an error uploading your image. Please try again."
				);
				return;
			}

			const { data: publicData } = supabase.storage
				.from("image-reviews") // Using the same bucket here
				.getPublicUrl(`fooditems/${fileName}`);

			const imageUrl = publicData.publicUrl;

			// Update food item with new image based on upload type
			setUploadProgress("Updating record...");
			if (type === "main") {
				await updateMainFoodImage(foodItemId, imageUrl);
			} else {
				await updateReviewPhotos(foodItemId, imageUrl);
			}

			// Refresh food item data to show the new image
			setUploadProgress("Success!");
			setTimeout(() => {
				setUploading(false);
				setShowingUploadStatus(false);
				fetchFoodItem(); // Refresh the food item to show new image
			}, 1000);
		} catch (error) {
			console.error("Error in upload process:", error);
			setUploading(false);
			setShowingUploadStatus(false);
			Alert.alert(
				"Upload Failed",
				"There was an error processing your image. Please try again."
			);
		}
	};

	const updateMainFoodImage = async (foodItemId: any, imageUrl: string) => {
		try {
			// First, get the current photos array
			const { data: currentItem, error: fetchError } = await supabase
				.from("fooditem")
				.select("photos")
				.eq("id", foodItemId)
				.single();

			if (fetchError) {
				console.error("Error fetching current food item:", fetchError);
				throw fetchError;
			}

			// Prepare the new photos array
			let updatedPhotos = [];
			if (currentItem && currentItem.photos && Array.isArray(currentItem.photos)) {
				// Add the new photo to the beginning of the array so it shows first
				updatedPhotos = [imageUrl, ...currentItem.photos];
			} else {
				// If no photos exist yet, create a new array with just this photo
				updatedPhotos = [imageUrl];
			}

			// Update the food item with the new photos array
			const { data, error } = await supabase
				.from("fooditem")
				.update({ photos: updatedPhotos })
				.eq("id", foodItemId);

			if (error) {
				console.error("Error updating food item main photos:", error);
				throw error;
			} else {
				console.log("Food item main photos updated successfully:", data);
				return data;
			}
		} catch (error) {
			console.error("Error in updateMainFoodImage:", error);
			throw error;
		}
	};

	const updateReviewPhotos = async (foodItemId: any, imageUrl: string) => {
		try {
			// First, get the current review_photos array
			const { data: currentItem, error: fetchError } = await supabase
				.from("fooditem")
				.select("review_photos")
				.eq("id", foodItemId)
				.single();

			if (fetchError) {
				console.error("Error fetching current food item:", fetchError);
				throw fetchError;
			}

			// Prepare the new review_photos array
			let updatedReviewPhotos = [];
			if (
				currentItem &&
				currentItem.review_photos &&
				Array.isArray(currentItem.review_photos)
			) {
				// Add the new photo to the beginning of the array so it shows first
				updatedReviewPhotos = [imageUrl, ...currentItem.review_photos];
			} else {
				// If no review photos exist yet, create a new array with just this photo
				updatedReviewPhotos = [imageUrl];
			}

			// Update the food item with the new review_photos array
			const { data, error } = await supabase
				.from("fooditem")
				.update({ review_photos: updatedReviewPhotos })
				.eq("id", foodItemId);

			if (error) {
				console.error("Error updating food item review photos:", error);
				throw error;
			} else {
				console.log("Food item review photos updated successfully:", data);
				return data;
			}
		} catch (error) {
			console.error("Error in updateReviewPhotos:", error);
			throw error;
		}
	};

	const [relatedFavorites, setRelatedFavorites] = useState<number[]>([]);
	// const TEST_USER_ID = 10;

	const userId = user?.id;

	const featuredScale = useRef(new Animated.Value(0)).current;

	const computeRatings = (reviews: any[]) => {
		const counts: { [key: string]: number } = {
			"5": 0,
			"4": 0,
			"3": 0,
			"2": 0,
			"1": 0,
		};
		reviews.forEach((review) => {
			const ratingValue = Math.round(review.rating);
			if (ratingValue >= 1 && ratingValue <= 5) {
				counts[String(ratingValue)]++;
			}
		});

		const total = reviews.length;
		return [
			{
				label: "5",
				percentage: total > 0 ? (counts["5"] / total) * 100 : 0,
				color: "#E64A19",
				count: counts["5"],
			},
			{
				label: "4",
				percentage: total > 0 ? (counts["4"] / total) * 100 : 0,
				color: "#F57C00",
				count: counts["4"],
			},
			{
				label: "3",
				percentage: total > 0 ? (counts["3"] / total) * 100 : 0,
				color: "#FFB300",
				count: counts["3"],
			},
			{
				label: "2",
				percentage: total > 0 ? (counts["2"] / total) * 100 : 0,
				color: "#FFCA28",
				count: counts["2"],
			},
			{
				label: "1",
				percentage: total > 0 ? (counts["1"] / total) * 100 : 0,
				color: "#FFD54F",
				count: counts["1"],
			},
		];
	};

	const fetchFoodItem = async () => {
		if (!foodItemId) return;
		const { data, error } = await supabase
			.from("fooditem")
			.select("*")
			.eq("id", foodItemId)
			.maybeSingle();

		if (error) {
			console.log("Error fetching food item:", error);
			return;
		}

		setItemData(data);
	};

	const fetchReviews = async () => {
		if (!foodItemId) return;

		const { data, error } = await supabase
			.from("review")
			.select("rating")
			.eq("food_item_id", foodItemId);

		if (error) {
			console.error("Error fetching reviews:", error);
			return;
		}

		setRatingsBar(data);
		const computedRatings = computeRatings(data);
		setRatingsBar(computedRatings);
	};

	const fetchFeatured = async () => {
		if (!foodItemId) return;

		const { data, error } = await supabase
			.from("featured_items")
			.select("food_item_id, food_name")
			.eq("food_item_id", foodItemId)
			.maybeSingle();

		if (error) {
			console.error("Error fetching featured items:", error);
		}

		setIsFeatured(!!data);
	};

	const fetchTags = async () => {
		const { data, error } = await supabase.from("tags").select("*");

		if (error) {
			console.log("Error fetching tags:", error);
			return;
		}

		setTags(data);
	};

	// const photoRatings = [
	//   { label: '5', percentage: 80, color: '#E64A19', image: 'photo1.jpg' },
	//   { label: '4', percentage: 30, color: '#F57C00', image: 'photo2.jpg' },
	//   { label: '3', percentage: 15, color: '#FFB300', image: 'photo3.jpg' },
	//   { label: '2', percentage: 10, color: '#FFCA28', image: 'photo4.jpg' },
	//   { label: '1', percentage: 5, color: '#FFD54F', image: 'photo5.jpg' },
	// ];

	const handlePhotoClick = (image: string) => {
		console.log("Opening photo:", image); // Replace with a full-screen image viewer later
	};

	const checkIfFavorite = async () => {
		if (!foodItemId) return;
		const { data, error } = await supabase
			.from("favorite")
			.select("id")
			.eq("profile_id", userId)
			.eq("food_item_id", foodItemId)
			.maybeSingle();

		if (!error && data) {
			setIsFavorites(true);
		}
	};

	// fetch ratings from reviews
	const loadRatings = async (itemIds: string[]) => {
		try {
			const ratings = await fetchRatings(itemIds);
			setRatingMap(ratings);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchFoodItem();
		checkIfFavorite();
		fetchTags();
	}, []);

	// load ratings
	useEffect(() => {
		if (foodItemId) {
			loadRatings([String(foodItemId)]);
		}
	}, [foodItemId]);

	useEffect(() => {
		if (foodItemId) {
			fetchReviews();
			fetchFeatured();
		}
	}, [foodItemId]);

	useEffect(() => {
		if (isFeatured) {
			Animated.spring(featuredScale, {
				toValue: 1,
				friction: 5,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(featuredScale, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}, [isFeatured, featuredScale]);

	const handleFavoriteToggle = async () => {
		try {
			const foodId = Number(foodItemId);
			if (!isFavorite) {
				const { error } = await supabase.from("favorite").insert({
					profile_id: userId,
					food_item_id: foodId,
				});

				if (error) {
					console.log("Error adding favorite:", error);
					return;
				}

				await userRecommendationService.hideRecommendation(String(foodId));

				setIsFavorites(true);
			} else {
				const { error } = await supabase
					.from("favorite")
					.delete()
					.eq("profile_id", userId)
					.eq("food_item_id", foodId);

				if (error) {
					console.log("Error removing favorite:", error);
					return;
				}

				setIsFavorites(false);
			}
		} catch (err) {
			console.error("Favorite toggle error:", err);
		}
	};

	// add cuisine or dietary tags
	const handleAddTag = async (newCuisines: string[], newDietary: string[]) => {
		if (!foodItemId) return;

		const currentCuisines: string[] = itemData?.cuisine_type ?? [];
		const currentDietary: string[] = itemData?.dietary_tags ?? [];

		const mergedCuisines: string[] = Array.from(
			new Set([...currentCuisines, ...newCuisines])
		);
		const mergedDietary: string[] = Array.from(
			new Set([...currentDietary, ...newDietary])
		);

		try {
			const { data, error } = await supabase
				.from("fooditem")
				.update({
					cuisine_type: mergedCuisines,
					dietary_tags: mergedDietary,
				})
				.eq("id", foodItemId);

			if (error) {
				console.log("Error updating tags:", error);
				return;
			}

			setItemData((prev: any) => ({
				...prev,
				cuisine_type: mergedCuisines,
				dietary_tags: mergedDietary,
			}));

			console.log("Tags updated successfully");
		} catch (err) {
			console.log("Error updating tags in handleAddTag:", err);
		}
	};

	const handleSubmitTags = async () => {
		await handleAddTag(selectedCuisines, selectedDietary);
		setSelectedCuisines([]);
		setSelectedDietary([]);
		setTagModalVisible(false);
	};

	const cuisineType = itemData?.cuisine_type ?? [];
	const dietaryTags = itemData?.dietary_tags ?? [];

	const cuisineText = cuisineType.join(", ");
	const dietaryText = dietaryTags.join(", ");

	const renderTag = (
		data: string[],
		selected: string[],
		toggleFn: (val: string) => void,
		category?: "cuisine" | "dietary"
	) => {
		return (
			<View
				style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20 }}
			>
				{data.map((tag) => {
					const isActive = selected.includes(tag);
					return (
						<Pressable
							key={tag}
							onPress={() => toggleFn(tag)}
							style={[styles.tag, isActive && styles.tagActive]}
						>
							{category === "cuisine" && (
								<Ionicons
									name={isActive ? "fast-food" : "fast-food-outline"}
									size={14}
									color={isActive ? "#fcfcfc" : Colors.primary.lightteal}
									style={isActive ? styles.tagIconActive : styles.tagIcon}
								/>
							)}
							{category === "dietary" && (
								<Ionicons
									name={isActive ? "leaf" : "leaf-outline"}
									size={14}
									color={isActive ? "#fcfcfc" : Colors.primary.lightteal}
									style={isActive ? styles.tagIconActive : styles.tagIcon}
								/>
							)}
							<Text style={[styles.tagText, isActive && styles.tagTextActive]}>
								{tag}
							</Text>
						</Pressable>
					);
				})}
			</View>
		);
	};

	// DUMMY DATA FOR RELATED FOOD ITEMS
	const relatedFood = [
		{
			id: 1,
			name: "Melody's Boba Noodles",
			description: "A good helping of boba and backshots",
			rating: 4,
			reviews: 35,
			image: require("@/assets/images/backshoot-noods.png"),
		},
		{
			id: 2,
			name: "Jay's Instant Ramen",
			description: "Ramen you can buy in stores but with a twist",
			rating: 3.5,
			reviews: 35,
			image: require("@/assets/images/Jay's-noods.png"),
		},
	];

	const handleRelatedFavoriteToggle = (id: number) => {
		setRelatedFavorites((prev) =>
			prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
		);
	};

	// Define action buttons with their onPress actions
	const actionButtons = [
		{
			icon: "star-outline" as const,
			text: "Write Review",
			onPress: () => router.push(`/review-textbox?foodItemId=${foodItemId}`),
		},
		{
			icon: "camera-outline" as const,
			text: "Add Photo",
			onPress: () => selectImage("review"),
		},
		{
			icon: "map-outline" as const,
			text: "View Map",
			onPress: () => console.log("View Map Pressed"),
		},
		{
			icon: "create-outline" as const,
			text: "Suggest Edit",
			onPress: () => router.push(`/food/suggest-edit/${foodItemId}`),
		},
	];

	const imageUrl =
		Array.isArray(itemData?.photos) && itemData?.photos.length > 0
			? itemData.photos[0]
			: "";

	const ratingInfo = ratingMap[String(foodItemId)];
	const average = ratingInfo?.average || 0;
	const count = ratingInfo?.count || 0;

	// Add function to handle hiding confirmation
	const showHideConfirmation = (id: number) => {
		setItemToHide(id);
		setHideConfirmVisible(true);
	};

	// Add function to hide a recommendation
	const handleHideRecommendation = () => {
		if (itemToHide !== null) {
			setHiddenRecommendations((prev) => [...prev, itemToHide]);
			// Here you could also persist this preference to Supabase if needed
			// await supabase.from("hidden_recommendations").insert({
			//   user_id: userId,
			//   recommendation_id: itemToHide,
			// });
			setHideConfirmVisible(false);
			setItemToHide(null);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView>
				{/* Top Navigation */}
				<View style={[styles.topNav, { top: insets.top - 50 }]}>
					<Pressable onPress={() => router.back()}>
						<Ionicons
							name='chevron-back'
							size={28}
							color='#333'
							style={styles.backButton}
						/>
					</Pressable>
					{isFeatured && (
						<Animated.View
							style={[
								styles.featuredContainer,
								{
									transform: [
										{
											scale: featuredScale.interpolate({
												inputRange: [0, 1],
												outputRange: [0, 1],
											}),
										},
									],
								},
							]}
						>
							<Ionicons
								name='star-sharp'
								size={28}
								color='#ffffff'
							/>
						</Animated.View>
					)}
				</View>

				{/* Image Container */}
				<View style={styles.imageContainer}>
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							style={styles.foodImage}
						/>
					) : (
						<View style={[styles.foodImage, styles.noImage]}>
							<Ionicons
								name='images'
								size={108}
								color='fff'
							/>
						</View>
					)}

					{/* Overlay */}
					<View style={styles.overlayContainer}>
						<View style={styles.overlayContent}>
							<Text style={styles.foodTitle}>
								{itemData?.food_name || "Food Name"}
							</Text>
							<Text style={styles.foodLocation}>
								{itemData?.restaurant_name || "Restaurant name"}
							</Text>
						</View>
						{/* Add Item to Favorites */}
						<Pressable
							style={styles.heartIcon}
							onPress={handleFavoriteToggle}
						>
							<Ionicons
								name={isFavorite ? "heart-sharp" : "heart-outline"}
								size={36}
								color={"#ff1800"}
							/>
						</Pressable>
						<View style={styles.ratingContainer}>
							<Text style={styles.ratingText}>
								{ratingMap[String(foodItemId)]
									? ratingMap[String(foodItemId)].average.toFixed(1)
									: "0.0"}
							</Text>
							<Ionicons
								name='star'
								size={28}
								color='#FFD700'
							/>
						</View>
					</View>
				</View>

				{/* Food Category */}
				<View style={styles.categoryContainer}>
					<Text style={styles.categoryText}>
						{itemData?.price_range || "$"}
						{cuisineText || dietaryText ? " • " : ""}
						{cuisineText}
						{cuisineText && dietaryText ? ", " : ""}
						{dietaryText}
					</Text>
					{/* Add Cuisine/Dietary tags button */}
					<Pressable
						onPress={() => setTagModalVisible(true)}
						style={styles.addTagContainer}
					>
						<View style={styles.addTagButton}>
							<Ionicons
								name='add-sharp'
								size={16}
								color='#65C5E3'
							/>
						</View>
					</Pressable>
				</View>

				{/* Action Buttons */}
				<View style={styles.actionButtonsContainer}>
					{actionButtons.map((button, index) => (
						<Pressable
							key={index}
							style={styles.actionButton}
							onPress={button.onPress}
						>
							<View style={styles.iconCircle}>
								<Ionicons
									name={button.icon}
									size={24}
									color='#65C5E3'
								/>
							</View>
							<Text style={styles.buttonText}>{button.text}</Text>
						</Pressable>
					))}
				</View>

				{/* Reviews & Photos Section */}
				<View style={styles.reviewsPhotosContainer}>
					{/* Reviews Section */}
					<View style={styles.reviewsContainer}>
						<Text style={styles.sectionTitle}>Reviews</Text>
						<View style={styles.ratingColumn}>
							<Text style={styles.boldText}>Overall Rating</Text>
							<View style={styles.starRow}>
								<StarRating
									average={average}
									size={24}
								/>
							</View>
							<Text style={styles.reviewCount}>
								{count === 1 ? `1 review` : `${count} reviews`}
							</Text>
						</View>

						{/* View Reviews Button */}
						<Pressable
							onPress={() =>
								router.push({
									pathname: "/fooditem_review",
									params: { foodItemId: String(foodItemId) }, // Convert to string
								})
							}
							style={styles.viewReviewsButton}
						>
							<Text style={styles.viewReviewsText}>View Reviews →</Text>
						</Pressable>
					</View>

					{/* Photos Section */}
					{/* <View style={styles.photosContainer}>
            <Text style={styles.sectionTitle}>Photos</Text>
            {ratingsBar.map((item, index) => (
              <View key={index} style={styles.photoRow}>
                <Text style={styles.photoLabel}>{item.label}</Text>
                <Pressable onPress={() => handlePhotoClick(item.image)}>
                  <View style={[styles.photoBar, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                </Pressable>
              </View>
            ))}
          </View> */}

					{/* Ratings Distribution */}
					<View style={styles.ratingsDistribution}>
						{ratingsBar.map((item) => (
							<View
								style={styles.ratingRow}
								key={item.label}
							>
								<Text style={styles.ratingLabel}>{item.label}</Text>
								<View style={styles.barContainer}>
									<View
										style={[
											styles.barFilled,
											{
												flex: item.percentage / 100,
												backgroundColor: item.color,
											},
										]}
									/>
									<View
										style={[
											styles.barEmpty,
											{
												flex: 1 - item.percentage / 100,
											},
										]}
									/>
								</View>
							</View>
						))}
					</View>
				</View>

				{/* Blue Divider */}
				<View style={styles.blueDivider} />

				{/* Related Food Items */}
				<View style={styles.relatedContainer}>
					<Text style={styles.sectionTitle}>Related Food Items</Text>
					{relatedFood
						.filter((item) => !hiddenRecommendations.includes(item.id))
						.map((item) => (
							<View
								key={item.id}
								style={styles.foodItem}
							>
								<Image
									source={item.image}
									style={styles.foodImageSmall}
								/>
								<View style={styles.foodDetails}>
									<Text style={styles.foodName}>{item.name}</Text>
									<Text style={styles.foodDescription}>{item.description}</Text>
									<View style={styles.ratingRow}>
										{[...Array(5)].map((_, i) => (
											<Ionicons
												key={i}
												name={i < item.rating ? "star" : "star-outline"}
												size={16}
												color={i < item.rating ? "#FFD700" : "#D3D3D3"}
											/>
										))}
										<Text style={styles.reviewCount}>({item.reviews})</Text>
									</View>
								</View>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<Pressable
										onPress={() => handleRelatedFavoriteToggle(item.id)}
										style={{ marginLeft: 8, padding: 4 }}
									>
										<Ionicons
											name={relatedFavorites.includes(item.id) ? "heart" : "heart-outline"}
											size={24}
											color='#000'
										/>
									</Pressable>
									<Pressable
										onPress={() => showHideConfirmation(item.id)}
										style={{ marginLeft: 8, padding: 4 }}
									>
										<Ionicons
											name='close-circle-outline'
											size={24}
											color='#666'
										/>
									</Pressable>
								</View>
							</View>
						))}
					{hiddenRecommendations.length === relatedFood.length && (
						<Text
							style={{
								fontSize: 16,
								color: "#666",
								fontStyle: "italic",
								textAlign: "center",
								marginTop: 20,
							}}
						>
							No recommendations available
						</Text>
					)}
				</View>

				{/* Blue Divider */}
				<View style={styles.blueDivider} />

				{/* Review Photos Section */}
				<View style={styles.reviewPhotosContainer}>
					<Text style={styles.sectionTitle}>Review Photos</Text>

					{/* Check if review_photos exists and has items */}
					{itemData?.review_photos && itemData.review_photos.length > 0 ? (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.reviewPhotosScroll}
						>
							{itemData.review_photos.map((photo: string, index: number) => (
								<Pressable
									key={index}
									onPress={() => handlePhotoClick(photo)}
									style={styles.reviewPhotoItem}
								>
									<Image
										source={{ uri: photo }}
										style={styles.reviewPhoto}
									/>
								</Pressable>
							))}
						</ScrollView>
					) : (
						<Text style={styles.noPhotosText}>No review photos yet</Text>
					)}
				</View>
			</ScrollView>

			{/* Modal for Tag Input */}
			<Modal
				visible={tagModalVisible}
				transparent={true}
				animationType='slide'
				onRequestClose={() => setTagModalVisible(false)}
			>
				<View style={styles.tagModalOverlay}>
					<View style={styles.tagModalContainer}>
						<ScrollView style={styles.tagModalBox}>
							{/* cuisine tags */}
							<Text style={styles.tagModalTitle}>Cuisine Tags</Text>
							{renderTag(
								tags
									.filter((t: any) => t.category === "cuisine")
									.map((t: any) => t.name),
								selectedCuisines,
								(val: string) => {
									if (selectedCuisines.includes(val)) {
										setSelectedCuisines(selectedCuisines.filter((item) => item !== val));
									} else {
										setSelectedCuisines([...selectedCuisines, val]);
									}
								},
								"cuisine"
							)}
							{/* dietary tags */}
							<Text style={styles.tagModalTitle}>Dietary Tags</Text>
							{renderTag(
								tags
									.filter((t: any) => t.category === "dietary")
									.map((t: any) => t.name),
								selectedDietary,
								(val: string) => {
									if (selectedDietary.includes(val)) {
										setSelectedDietary(selectedDietary.filter((item) => item !== val));
									} else {
										setSelectedDietary([...selectedDietary, val]);
									}
								},
								"dietary"
							)}
						</ScrollView>
						<View style={styles.tagModalButtons}>
							<Pressable
								style={[
									styles.tagModalSubmitButton,
									selectedCuisines.length === 0 &&
										selectedDietary.length === 0 &&
										styles.tagModalSubmitButtonDisabled,
								]}
								onPress={handleSubmitTags}
								disabled={selectedCuisines.length === 0 && selectedDietary.length === 0}
							>
								<Text
									style={[
										styles.tagModalButtonText,
										selectedCuisines.length === 0 &&
											selectedDietary.length === 0 &&
											styles.tagModalButtonDisabledText,
									]}
								>
									Submit
								</Text>
							</Pressable>
							<Pressable
								style={styles.tagModalCancelButton}
								onPress={() => setTagModalVisible(false)}
							>
								<Text style={styles.tagModalButtonText}>Cancel</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Image Preview Modal */}
			<Modal
				transparent={true}
				visible={imagePreviewVisible}
				animationType='slide'
			>
				<View style={styles.modalOverlay}>
					<View style={styles.previewModalContent}>
						<Text style={styles.modalTitle}>Add Photo</Text>

						{uploadType === "main" && imageUri ? (
							<Image
								source={{ uri: imageUri }}
								style={styles.previewImage}
							/>
						) : uploadType === "review" && reviewImageUri ? (
							<Image
								source={{ uri: reviewImageUri }}
								style={styles.previewImage}
							/>
						) : null}

						{/* Photo Type Selection */}
						<View style={styles.photoTypeContainer}>
							<Text style={styles.photoTypeLabel}>Select Photo Type:</Text>
							<View style={styles.radioButtonContainer}>
								<Pressable
									style={styles.radioOption}
									onPress={() => setUploadType("main")}
								>
									<View style={styles.radioCircle}>
										{uploadType === "main" && <View style={styles.selectedRadio} />}
									</View>
									<Text style={styles.radioText}>Main Food Photo</Text>
								</Pressable>

								<Pressable
									style={styles.radioOption}
									onPress={() => setUploadType("review")}
								>
									<View style={styles.radioCircle}>
										{uploadType === "review" && <View style={styles.selectedRadio} />}
									</View>
									<Text style={styles.radioText}>Review Photo</Text>
								</Pressable>
							</View>
						</View>

						<View style={styles.buttonRow}>
							<Pressable
								style={[styles.button, styles.cancelButton]}
								onPress={() => {
									setImagePreviewVisible(false);
									if (uploadType === "main") {
										setImageUri("");
									} else {
										setReviewImageUri("");
									}
								}}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</Pressable>

							<Pressable
								style={[styles.button, styles.uploadButton]}
								onPress={() => {
									setImagePreviewVisible(false);
									if (uploadType === "main" && imageUri) {
										uploadImage(imageUri, "main");
									} else if (uploadType === "review" && reviewImageUri) {
										uploadImage(reviewImageUri, "review");
									}
								}}
							>
								<Text style={styles.modalButtonText}>Upload</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Upload Progress Modal */}
			<Modal
				transparent={true}
				visible={showingUploadStatus}
				animationType='fade'
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalText}>{uploadProgress}</Text>
						{uploading && (
							<ActivityIndicator
								size='small'
								color={Colors.primary.darkteal}
							/>
						)}
					</View>
				</View>
			</Modal>

			{/* Hide Confirmation Modal */}
			<Modal
				transparent={true}
				visible={hideConfirmVisible}
				animationType='fade'
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Hide Recommendation</Text>
						<Text style={styles.modalText}>
							Are you sure you want to hide this recommendation? We'll use this
							feedback to improve future suggestions.
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
								style={[
									styles.button,
									{
										backgroundColor: "#FF6347",
										paddingVertical: 12,
										paddingHorizontal: 30,
										borderRadius: 8,
										minWidth: "40%",
										alignItems: "center",
									},
								]}
								onPress={handleHideRecommendation}
							>
								<Text style={styles.modalButtonText}>Hide</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},

	blueBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 65, // Adjust height as needed
		backgroundColor: "#B3E5FC", // Light blue color
		zIndex: 1, // Ensures it's above other elements
	},

	backButton: {
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 1, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		borderRadius: 50,
		backgroundColor: "#fff",
		color: Colors.primary.darkteal,
		width: 40,
		height: 40,
		padding: 4,
		paddingLeft: 5,
		paddingTop: 6,
	},
	topNav: {
		position: "absolute",
		top: 10, // Adjust to ensure it's placed correctly
		left: 10,
		right: 10,
		zIndex: 2, // Keeps it above the image
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	featuredContainer: {
		backgroundColor: "#FFD700",
		borderRadius: 50,
		width: 40,
		height: 40,
		padding: 4,
		paddingLeft: 6,
		paddingTop: 5,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 1, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
	},
	imageContainer: {
		position: "relative", // Allows overlay to be absolutely positioned inside
		width: "100%",
		height: 250, // Adjust height as needed
		overflow: "hidden",
	},

	foodImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},

	noImage: {
		backgroundColor: "#aaa",
		justifyContent: "center",
		alignItems: "center",
	},

	overlayContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.55)", // Semi-transparent black for contrast
		padding: 15,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	overlayContent: {
		flex: 1,
	},

	foodTitle: {
		color: "white",
		fontSize: 20,
		fontWeight: "800",
	},

	foodLocation: {
		color: "white",
		fontSize: 14,
		fontWeight: "700",
	},

	heartIcon: {
		marginRight: 10,
	},

	ratingContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.65)", // Light background for contrast
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 20,
	},

	ratingText: {
		fontSize: 20,
		fontWeight: "900",
		color: "#333",
		marginRight: 4,
	},

	categoryContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
		marginBottom: 15,
		marginHorizontal: 30,
	},

	categoryText: {
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
	},

	addTagContainer: {
		marginHorizontal: 5,
	},

	addTagButton: {
		width: 20,
		height: 20,
		backgroundColor: "#E3F7FF",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},

	actionButtonsContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		marginHorizontal: 10,
		marginBottom: 10,
	},

	actionButton: {
		flex: 1,
		alignItems: "center",
		marginHorizontal: 5,
	},

	iconCircle: {
		width: 50,
		height: 50,
		backgroundColor: "#E3F7FF", // Light blue background
		borderRadius: 25, // Circular button
		justifyContent: "center",
		alignItems: "center",
	},

	buttonText: {
		marginTop: 5,
		fontSize: 12,
		color: "#333",
	},

	reviewsPhotosContainer: {
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderTopWidth: 1,
		borderColor: "#E0E0E0",
	},

	reviewsContainer: {
		flex: 1,
	},

	ratingsDistribution: {
		flex: 1,
	},

	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 5,
	},

	ratingColumn: {
		marginBottom: 10,
	},

	boldText: {
		fontWeight: "bold",
		fontSize: 16,
	},

	starRow: {
		flexDirection: "row",
		marginVertical: 5,
	},

	reviewCount: {
		fontSize: 14,
		color: "#666",
		marginLeft: 5,
	},

	viewReviewsButton: {
		marginTop: 5,
	},

	viewReviewsText: {
		fontSize: 14,
		color: "#007AFF",
		textDecorationLine: "underline",
	},

	ratingRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},

	ratingLabel: {
		width: 20,
		marginRight: 8,
		fontSize: 16,
		fontWeight: "bold",
	},

	barContainer: {
		flex: 1,
		flexDirection: "row",
		borderRadius: 4,
		overflow: "hidden",
		height: 8,
	},

	barFilled: {
		// dynamic color set inline
	},
	barEmpty: {
		backgroundColor: "#eee",
	},

	blueDivider: {
		height: 6,
		backgroundColor: "#B3E5FC", // Light blue bar
		width: "100%",
		marginVertical: 10,
	},

	relatedContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
	},

	foodItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
	},

	foodImageSmall: {
		width: 60,
		height: 60,
		borderRadius: 10,
		marginRight: 10,
	},

	foodDetails: {
		flex: 1,
	},

	foodName: {
		fontWeight: "bold",
		fontSize: 16,
	},

	foodDescription: {
		fontSize: 14,
		color: "#666",
		marginBottom: 5,
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		minWidth: 250,
	},
	modalText: {
		fontSize: 16,
		marginBottom: 15,
		textAlign: "center",
	},
	loadingIndicator: {
		height: 10,
		width: 10,
		borderRadius: 5,
		backgroundColor: Colors.primary.darkteal,
	},
	previewModalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		width: "90%",
		maxWidth: 500,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 15,
	},
	previewImage: {
		width: "100%",
		height: 300,
		borderRadius: 8,
		marginBottom: 20,
		resizeMode: "cover",
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		minWidth: "40%",
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: "#f0f0f0",
	},
	uploadButton: {
		backgroundColor: Colors.primary.darkteal,
	},
	modalButtonText: {
		fontWeight: "600",
		color: "#fff",
	},
	cancelButtonText: {
		fontWeight: "600",
		color: "#333",
	},
	reviewPhotosContainer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderTopWidth: 1,
		borderColor: "#E0E0E0",
	},
	reviewPhotosScroll: {
		marginTop: 10,
	},
	reviewPhotoItem: {
		marginRight: 15,
		borderRadius: 8,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	reviewPhoto: {
		width: 150,
		height: 150,
		borderRadius: 8,
	},
	noPhotosText: {
		fontSize: 16,
		color: "#666",
		fontStyle: "italic",
		marginTop: 10,
		textAlign: "center",
	},
	photoTypeContainer: {
		marginBottom: 20,
		padding: 20,
	},
	photoTypeLabel: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 15,
	},
	radioButtonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	radioOption: {
		flexDirection: "row",
		alignItems: "center",
		padding: 15,
		marginVertical: 10,
	},
	radioCircle: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#333",
		marginRight: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	selectedRadio: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#333",
	},
	radioText: {
		fontSize: 16,
	},
	// Add new styles for the hide functionality
	itemActionButtons: {
		flexDirection: "row",
		alignItems: "center",
	},

	actionIcon: {
		marginLeft: 8,
		padding: 4,
	},

	noRecommendationsText: {
		fontSize: 16,
		color: "#666",
		fontStyle: "italic",
		textAlign: "center",
		marginTop: 20,
	},

	confirmButton: {
		backgroundColor: "#FF6347", // tomato red for the hide button
	},

	// tag modal
	tagModalOverlay: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 20,
	},
	tagModalContainer: {
		backgroundColor: "#fff",
		borderRadius: 10,
		paddingVertical: 15,
		maxHeight: "80%",
	},
	tagModalBox: {
		paddingVertical: 5,
		marginVertical: 15,
	},
	tagModalTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 15,
		textAlign: "center",
	},
	tagModalButtons: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	tagModalSubmitButton: {
		backgroundColor: Colors.primary.lightteal,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
	},
	tagModalSubmitButtonDisabled: {
		backgroundColor: "#ccc",
	},
	tagModalButtonDisabledText: {
		color: "#fff",
	},
	tagModalCancelButton: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	tagModalButtonText: {
		fontSize: 14,
		color: Colors.primary.darkteal,
	},

	tag: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		borderRadius: 20,
		borderWidth: 1,
		borderColor: Colors.primary.darkteal,
		backgroundColor: Colors.primary.lightTealTranslucent20,
		marginRight: 3,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginVertical: 4,
	},
	tagIcon: {
		marginRight: 4,
		color: Colors.primary.darkteal,
	},
	tagText: {
		fontSize: 13,
		color: Colors.primary.darkteal,
	},
	tagActive: {
		backgroundColor: Colors.primary.darkteal,
		borderColor: Colors.primary.darkteal,
	},
	tagTextActive: {
		color: "#fff",
	},
	tagIconActive: {
		marginRight: 4,
		color: "#fff",
	},
});
