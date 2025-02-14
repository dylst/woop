import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/supabaseClient";

export default function AuthorModerationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const foodItemId = params.foodItemId ? String(params.foodItemId) : "1";

  const [reviews, setReviews] = useState<any[]>([]);

  // Fetch reviews including user information
  const fetchReviews = async () => {
    if (!foodItemId) return;

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("review")
      .select(`
        id, 
        review_text, 
        rating, 
        review_date, 
        profile_id,
        profile:profile_id (username, first_name, last_name)
      `)
      .eq("food_item_id", String(foodItemId));

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return;
    }

    setReviews(reviewsData || []);
  };

  useEffect(() => {
    fetchReviews();
  }, [foodItemId]);

  // Delete a review
  const handleDeleteReview = async (reviewId: number) => {
    console.log(" ",reviewId);
  
    const { data, error } = await supabase
      .from("review")
      .delete()
      .eq("id", reviewId);
  
    if (error) {
      console.error("❌ Error deleting review from Supabase:", error.message);
      return;
    }
  
  
    // Remove from state to update UI
    setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <Pressable 
            onPress={() => router.push({ 
              pathname: "/food/[foodItemId]", 
              params: { foodItemId: foodItemId } 
            })}
          >
           <Ionicons name="chevron-back" size={28} color="#333" style={styles.backButton} />
          </Pressable>
      </View>

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewContainer}>
              <Text style={styles.reviewUser}>
                {review.profile?.first_name || review.profile?.username || "Anonymous"}
              </Text>
              <Text style={styles.reviewTitle}>{review.review_text}</Text>
              <Text style={styles.reviewMeta}>
                Rating: {review.rating} | Date: {new Date(review.review_date).toLocaleDateString()}
              </Text>

              {/* Delete Button */}
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteReview(review.id)}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.noReviews}>No reviews yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topNav: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 2,
  },
  backButton: {
    padding: 10,
  },
  contentContainer: {
    padding: 20,
    marginTop: 50,
  },
  reviewContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    position: "relative", // Ensures the delete button is positioned correctly
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewMeta: {
    fontSize: 14,
    color: "gray",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noReviews: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  deleteButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
  },
});
