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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  topReviewContainer: {
    borderColor: "gold",
    borderWidth: 2,
  },
  topReviewBadge: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "gold",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    fontWeight: "bold",
    zIndex: 1,
  },
});

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
        fooditem (
          food_name,
          photos
        ),
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

  // Compute the top review based on views (make sure your "review" table has a "views" column)
  const topReviewId =
    reviews.length > 0
      ? reviews.reduce(
          (maxReview, review) =>
            review.views > maxReview.views ? review : maxReview,
          reviews[0]
        ).id
      : null;

  // Delete a review
  const handleDeleteReview = async (reviewId: number) => {
    const { data, error } = await supabase
      .from("review")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("❌ Error deleting review from Supabase:", error.message);
      return;
    }

    // Remove from state to update UI
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== reviewId)
    );
  };

  // Send like notification to the reviewer
  const handleLikeReview = async (review: any) => {
    if (!userId) return;

    // Prevent user from liking their own review
    if (review.profile_id === userId) {
      console.log("You cannot like your own review.");
      return;
    }

    const { data: likeData, error: likeError } = await supabase
      .from("review_likes")
      .insert({
        review_id: review.id,
        sender_profile_id: userId,
      });

    if (likeError) {
      if (likeError.code === "23505") {
        Alert.alert("Woops!", "You have already liked this review.");
        return;
      }
      console.error("Error inserting review like:", likeError);
      return;
    }

    const titleText = "Food review liked!";
    const foodName = review.fooditem?.food_name || "this food item";
    const descriptionText = `Someone has liked your review for ${foodName}!`;

    const { data, error } = await supabase.from("notification").insert({
      notification_type: "liked",
      receiver_profile_id: review.profile_id,
      food_item_id: foodItemId,
      review_id: review.id,
      title: titleText,
      description: descriptionText,
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
    Alert.alert("Review Liked!", "You have liked this review.");
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            const isTopReview = review.id === topReviewId;
            return (
              <View
                key={index}
                style={[
                  styles.reviewContainer,
                  isTopReview && styles.topReviewContainer,
                ]}
              >
                {isTopReview && (
                  <Text style={styles.topReviewBadge}>Top Review</Text>
                )}
                <Text style={styles.reviewUser}>
                  {review.profile?.first_name ||
                    review.profile?.username ||
                    "Anonymous"}
                </Text>
                <Text style={styles.reviewTitle}>{review.review_text}</Text>
                <Text style={styles.reviewMeta}>
                  Rating: {review.rating} | Date:{" "}
                  {new Date(review.review_date).toLocaleDateString()}
                </Text>
                {review.profile_id !== userId && (
                  <Pressable
                    style={styles.likeButton}
                    onPress={() => handleLikeReview(review)}
                  >
                    <Ionicons name="thumbs-up" size={20} color="green" />
                  </Pressable>
                )}
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReview(review.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </Pressable>
              </View>
            );
          })
        ) : (
          <Text style={styles.noReviews}>No reviews yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
