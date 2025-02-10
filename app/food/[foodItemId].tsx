import TopBar from "@/components/ui/TopBar";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from '@/supabaseClient';
import { Colors } from '@/constants/Colors';

export default function FoodItemDetailPage() {
  const router = useRouter();
  const { foodItemId } = useLocalSearchParams();

  const [isFavorite, setIsFavorites] = useState(false);
  const [itemData, setItemData] = useState<any>(null);

  // TESTING FETCHING ITEM FROM DATABASE
  // DUMMY DATA FOR RELATED FOOD ITEMS
  const [relatedFavorites, setRelatedFavorites] = useState<number[]>([]);
  const TEST_USER_ID = 10;

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

  const photoRatings = [
    { label: "5", percentage: 80, color: "#E64A19", image: "photo1.jpg" },
    { label: "4", percentage: 30, color: "#F57C00", image: "photo2.jpg" },
    { label: "3", percentage: 15, color: "#FFB300", image: "photo3.jpg" },
    { label: "2", percentage: 10, color: "#FFCA28", image: "photo4.jpg" },
    { label: "1", percentage: 5, color: "#FFD54F", image: "photo5.jpg" },
  ];

  const handlePhotoClick = (image: string) => {
    console.log("Opening photo:", image); // Replace with a full-screen image viewer later
  };

  const checkIfFavorite = async () => {
    if (!foodItemId) return;
    const { data, error } = await supabase
      .from("favorite")
      .select("id")
      .eq("user_id", TEST_USER_ID)
      .eq("food_item_id", foodItemId)
      .maybeSingle();

    if (!error && data) {
      setIsFavorites(true);
    }
  };

  useEffect(() => {
    fetchFoodItem();
    checkIfFavorite();
  }, []);

  const handleFavoriteToggle = async () => {
    try {
      const foodId = Number(foodItemId);
      if (!isFavorite) {
        const { error } = await supabase
          .from("favorite")
          .insert({
            user_id: TEST_USER_ID,
            food_item_id: foodId,
          });

        if (error) {
          console.log("Error adding favorite:", error);
          return;
        }

        setIsFavorites(true);
      } else {
        const { error } = await supabase
          .from("favorite")
          .delete()
          .eq("user_id", TEST_USER_ID)
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

  const cuisineType = itemData?.cuisine_type ?? [];
  const dietaryTags = itemData?.dietary_tags ?? [];

  const cuisineText = cuisineType.join(", ");
  const dietaryText = dietaryTags.join(", ");

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
      text: "Add Review",
      onPress: () => router.push("/review-textbox"),
    },
    {
      icon: "camera-outline" as const,
      text: "Add Photo",
      onPress: () => console.log("Add Photo Pressed"),
    },
    {
      icon: "map-outline" as const,
      text: "View Map",
      onPress: () => console.log("View Map Pressed"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#333"
            style={styles.backButton}
          />
        </Pressable>
      </View>

      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: itemData?.photos }}
          style={styles.foodImage}
        />

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
          <Pressable style={styles.heartIcon} onPress={handleFavoriteToggle}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={"#fff"}
            />
          </Pressable>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>4.9</Text>
            <Ionicons name="star" size={18} color="#FFD700" />
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
                color="#65C5E3"
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
                    <View style={styles.ratingRow}>
                        <Text style={styles.boldText}>Overall Rating</Text>
                        <View style={styles.starRow}>
                            {[...Array(5)].map((_, index) => (
                                <Ionicons key={index} name="star" size={16} color="#FFD700" />
                            ))}
                        </View>
                        <Text style={styles.reviewCount}>3,304 reviews</Text>
                    </View>

                    {/* View Reviews Button */}
                    <Pressable onPress={() => router.push("/reviews")} style={styles.viewReviewsButton}>
                        <Text style={styles.viewReviewsText}>View Reviews →</Text>
                    </Pressable>
                </View>

                {/* Photos Section */}
                <View style={styles.photosContainer}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    {photoRatings.map((item, index) => (
                        <View key={index} style={styles.photoRow}>
                            <Text style={styles.photoLabel}>{item.label}</Text>
                            <Pressable onPress={() => handlePhotoClick(item.image)}>
                                <View style={[styles.photoBar, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                            </Pressable>
                        </View>
                    ))}
                </View>
            </View>

            {/* Blue Divider */}
            <View style={styles.blueDivider} />

            {/* Related Food Items */}
            <View style={styles.relatedContainer}>
                <Text style={styles.sectionTitle}>Related Food Items</Text>
                {relatedFood.map((item) => (
                    <View key={item.id} style={styles.foodItem}>
                        <Image source={item.image} style={styles.foodImageSmall} />
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
                        <Pressable onPress={() => handleRelatedFavoriteToggle(item.id)}>
                            <Ionicons
                                name={relatedFavorites.includes(item.id) ? "heart" : "heart-outline"}
                                size={24}
                                color="#000"
                            />
                        </Pressable>
                    </View>
                ))}
            </View>
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
        shadowColor: '#000',
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
        top: 25, // Adjust to ensure it's placed correctly
        left: 20,
        zIndex: 2, // Keeps it above the image
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

    overlayContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent black for contrast
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
        fontWeight: "bold",
    },

    foodLocation: {
        color: "white",
        fontSize: 14,
    },

    heartIcon: {
        marginRight: 10,
    },

    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Light background for contrast
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    ratingText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginRight: 4,
    },

    categoryContainer: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 15,
    },

    categoryText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },

    actionButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 70,
        marginBottom: 10,
    },

    actionButton: {
        alignItems: "center",
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
        fontSize: 14,
        color: "#333",
    },

    reviewsPhotosContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderColor: "#E0E0E0",
    },

    reviewsContainer: {
        flex: 1,
    },

    photosContainer: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },

    ratingColumn: {
        flexDirection: "column",
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

    reviewCountText: {
        fontSize: 12,
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

    photoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },

    photoLabel: {
        width: 20,
        fontSize: 14,
        fontWeight: "bold",
    },

    photoBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E64A19",
        flex: 1,
        marginLeft: 5,
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

    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    reviewCount: {
        fontSize: 12,
        color: "#666",
        marginLeft: 5,
    },
});