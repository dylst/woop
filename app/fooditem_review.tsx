import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/supabaseClient";
import { useUser } from "./context/UserContext";

export default function AuthorModerationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const foodItemId = params.foodItemId ? String(params.foodItemId) : "1";

  const { user } = useUser();
  const userId = user?.id;

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

  // send like notification to the reviewer
  const handleLikeReview = async (review: any) => {
    if (!userId) return;

    // Prevent user from liking their own review
    if (review.profile_id === userId) {
      console.log("You cannot like your own review.");
      return;
    }

    // Check if the like notification already exists
    const { data: existingNotification, error: checkError } = await supabase
      .from("notification")
      .select("id")
      .eq("notification_type", "liked")
      .eq("sender_profile_id", userId)
      .eq("review_id", review.id);

    if (checkError) {
      console.error("Error checking for existing like notification:", checkError);
      return;
    }
    if (existingNotification && existingNotification.length > 0) {
      Alert.alert("Woops!", "You have already liked this review.");
      return;
    }

    const { data, error } = await supabase
      .from('notification')
      .insert({
        notification_type: "liked",
        sender_profile_id: userId,
        receiver_profile_id: review.profile_id,
        food_item_id: foodItemId,
        review_id: review.id,
        title: null,
        description: null
      });

      if (error) {
        if (error.code === "23505") {
          Alert.alert("Woops!", "You have already liked this review.");
          return;
        }
        console.error("Error sending like notifications:", error);
        return;
      }
      
      console.log("Like notification sent:", data);
      // Alert the user that they have liked the review.
      Alert.alert("Review Liked!", "You have liked this review.");
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <Pressable 
            onPress={() => router.back()}
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

              {review.profile_id !== userId && (
                <Pressable style={styles.likeButton} onPress={() => handleLikeReview(review)}>
                  <Ionicons name="thumbs-up" size={20} color="green" />
                </Pressable>
              )}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  contentContainer: {
    padding: 20,
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
  likeButton: {
    position: "absolute",
    right: 40,
    top: 10,
    padding: 5,
    marginRight: 20,
  },
  deleteButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
  },
});
