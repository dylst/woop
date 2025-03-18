import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/supabaseClient";
import { useUser } from "./context/UserContext";
import TopBar from "@/components/ui/TopBar";

function renderStars(average: number) {
  const stars = [];
  // Integer part
  const floorVal = Math.floor(average);
  // Decimal part
  const decimal = average - floorVal;
  // Half star
  const hasHalf = decimal >= 0.5

  // full star
  for (let i = 0; i < floorVal && i < 5; i++) {
    stars.push(<Ionicons key={`full-${i}`} name="star" size={12} color="#ffd700" style={{ marginRight: 2 }} />)
  }

  if (hasHalf && floorVal < 5) {
    stars.push(<Ionicons key="half" name="star-half" size={12} color="#ffd700" style={{ marginRight: 2 }} />)
  }

  const noStars = floorVal + (hasHalf ? 1 : 0);
  for (let i = noStars; i < 5; i++) {
    stars.push(<Ionicons key={`empty-${i}`} name="star" size={12} color="#ccc" style={{ marginRight: 2 }} />)
  }

  return stars;
}

export default function AuthorModerationPage() {
  // const router = useRouter();
  const params = useLocalSearchParams();
  const foodItemId = params.foodItemId ? String(params.foodItemId) : "1";

  const { user } = useUser();
  const userId = user?.id;

  const [reviews, setReviews] = useState<any[]>([]);
  const [itemData, setItemData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFoodItem = async () => {
    if (!foodItemId) return;
    const { data, error } = await supabase
      .from('fooditem')
      .select('*')
      .eq('id', foodItemId)
      .maybeSingle();

    if (error) {
      console.log('Error fetching food item:', error);
      return;
    }

    setItemData(data);
  };

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
        profile:profile_id (username, first_name, last_name, avatar)
      `)
      .eq("food_item_id", String(foodItemId));

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return;
    }

    setReviews(reviewsData || []);
  };

  useEffect(() => {
    fetchFoodItem();
    fetchReviews();
  }, [foodItemId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews().then(() => setRefreshing(false));
  }, []);

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

    // Notifications 
    // notifs descriptions
    const titleText = "Food review liked!";
    const foodName = review.fooditem?.food_name || "this food item";
    const descriptionText = `Someone has liked your review for ${foodName}!`;

    // insert notifications into database
    const { data, error } = await supabase.from("notification").insert({
      notification_type: "liked",
      receiver_profile_id: review.profile_id,
      food_item_id: foodItemId,
      review_id: review.id,
      title: titleText,
      description: descriptionText,
    });

    // if notification row already exists with error code 23505, then user has already liked the review
    if (error) {
      if (error.code === "23505") {
        Alert.alert("Woops!", "You have already liked this review.");
        return;
      }
      console.error("Error sending like notifications:", error);
      return;
    }

    // liked notification confirmation
    console.log("Like notification sent:", data);
    Alert.alert("Review Liked!", "You have liked this review.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <TopBar type="back" title="Reviews" />

        <View style={styles.foodItemContainer}>
          <Text style={styles.foodItemInfo}>{itemData?.food_name}</Text>
        </View>

        <View style={styles.contentContainer}>
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
                  <View style={styles.userContainer}>
                    <Image
                      source={{ uri: review.profile?.avatar }}
                      style={styles.profileImage}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.userInfoUsername}>
                        {review.profile?.username ||
                          "Anonymous"}
                      </Text>
                      <Text style={styles.userInfoMeta}>
                        {new Date(review.review_date).toLocaleDateString()}
                      </Text>
                      <Text>
                        {renderStars(review.rating)}
                      </Text>
                    </View>
                    {review.profile_id !== userId ? (
                      <Pressable
                        style={[styles.actionButton, {backgroundColor: '#f0c051'}]}
                        onPress={() => handleLikeReview(review)}
                      >
                        <Ionicons name="thumbs-up-sharp" size={16} color="white"/>
                        <Text style={styles.actionText}>LIKE</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={[styles.actionButton, {backgroundColor: '#ed6358'}]}
                        onPress={() => handleDeleteReview(review.id)}
                      >
                        <Ionicons name="trash-sharp" size={16} color="white"/>
                        <Text style={styles.actionText}>DELETE</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.reviewDescription}>{review.review_text}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noReviews}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    padding: 20,
  },
  foodItemContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  foodItemInfo: {
    fontSize: 24,
    fontWeight: '700',
  },
  foodItemData: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    padding: 4,
    alignItems: 'center',
  },
  profileImage: {
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userInfoUsername: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  userInfoMeta: {
    fontSize: 14,
    color: '#333',
    paddingBottom: 4,
  },
  reviewContainer: {
    flexDirection: 'column',
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 20,
    position: "relative", // Ensures the delete button is positioned correctly
  },
  reviewDescription: {
    fontSize: 16,
    padding: 4,
  },
  noReviews: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 20,
    padding: 7,
  },
  actionText: {
    marginHorizontal: 3,
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  topReviewContainer: {
    borderColor: "#f0c051",
    borderWidth: 2,
  },
  topReviewBadge: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#f0c051",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    fontWeight: "bold",
    zIndex: 1,
  },
});