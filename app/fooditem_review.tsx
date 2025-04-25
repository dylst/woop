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
import StarRating from "@/components/ui/StarRating";
import { Colors } from "@/constants/Colors";

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
          restaurant_name,
          photos
        ),
        profile:profile_id (username, first_name, last_name, avatar),
        review_likes (sender_profile_id)
      `)
      .eq("food_item_id", String(foodItemId));

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return;
    }

    // map reviews to add Liked status and likeCount
    const reviewsWithLikes = reviewsData.map((review: any) => ({
      ...review,
      liked: userId
        ? review.review_likes?.some(
          (like: any) => like.sender_profile_id === userId
        ) : false,
      likeCount: review.review_likes ? review.review_likes.length : 0,
      isTop: false,
    }));

    // determine top review if at least one review has one like
    let topReview: any = null;
    reviewsWithLikes.forEach((review) => {
      if (review.likeCount > 0) {
        if (!topReview) {
          topReview = review;
        } else if (review.likeCount > topReview.likeCount) {
          topReview = review;
        } else if (review.likeCount === topReview.likeCount) {
          // tie breaker
          if (review.rating > topReview.rating) {
            topReview = review;
          } else if (review.rating === topReview.rating) {
            // if both ratings same, tie break by earliest creation date
            if (new Date(review.review_date) < new Date(topReview.review_date)) {
              topReview = review;
            }
          }
        }
      }
    });

    if (topReview) {
      topReview.isTop = true;
      // remove top review from rest of list to keep top review fixed as first review
      const remainingReviews = reviewsWithLikes.filter((review) =>
        review.id !== topReview.id);
      // sort remaining reviews in descending order by likeCount then by rating
      remainingReviews.sort((a, b) => {
        if (b.likeCount === a.likeCount) {
          return b.rating - a.rating;
        }
        return b.likeCount - a.likeCount;
      });
      setReviews([topReview, ...remainingReviews]);
    } else {
      // if no likes, sort by rating descending
      reviewsWithLikes.sort((a, b) => b.rating - a.rating);
      setReviews(reviewsWithLikes);
    }
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
  // const topReviewId =
  //   reviews.length > 0
  //     ? reviews.reduce(
  //       (maxReview, review) =>
  //         review.views > maxReview.views ? review : maxReview,
  //       reviews[0]
  //     ).id
  //     : null;

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

    // update state to mark review as liked
    setReviews((prevReviews) =>
      prevReviews.map((r) =>
        r.id === review.id
          ? { ...r, liked: true, likeCount: r.likeCount + 1 } : r
      )
    );

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
    console.log("Like notification sent");
    Alert.alert("Review Liked!", "You have liked this review.");
  };

  const handleUnlikeReview = async (review: any) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("review_likes")
      .delete()
      .eq("review_id", review.id)
      .eq("sender_profile_id", userId);

    if (error) {
      console.error("Error unliking review:", error);
    }

    // update state to mark review as unliked
    setReviews((prevReviews) =>
      prevReviews.map((r) =>
        r.id === review.id
          ? { ...r, liked: false, likeCount: Math.max(r.likeCount - 1, 0) } : r
      )
    );

    console.log("Review unliked:", data);
    Alert.alert("Review Unliked!", "You have unliked this review.")
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <TopBar type="back" title="Reviews" />

        <View style={styles.foodItemContainer}>
          <Text style={styles.foodItemInfo}>{itemData?.food_name}</Text>
          <Text style={styles.foodItemData}>{itemData?.restaurant_name}</Text>
        </View>

        <View style={styles.contentContainer}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => {
              const isTopReview = review.isTop;
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
                        @{review.profile?.username ||
                          "Anonymous"}
                      </Text>
                      <Text style={styles.userInfoMeta}>
                        {new Date(review.review_date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.reviewMeta}>
                        <StarRating average={review.rating} size={12}/> &bull; {review.likeCount > 0 ? (`${review.likeCount} ${review.likeCount === 1 ? "Like" : "Likes"}`) : 'No likes' }
                      </Text>
                    </View>
                    {review.profile_id !== userId ? (
                      // check if user has liked the review already
                      review.liked ? (
                        // user has already liked review, give option to unlike
                        <Pressable
                          style={[styles.actionButton, { backgroundColor: '#aaaaaa' }]}
                          onPress={() => handleUnlikeReview(review)}
                        >
                          <Ionicons name="heart-dislike-sharp" size={20} color="white" />
                          {/* <Text style={styles.actionText}>UNLIKE</Text> */}
                        </Pressable>
                      ) : (
                        // user has not liked review
                        <Pressable
                          style={[styles.actionButton, { backgroundColor: '#f0c051' }]}
                          onPress={() => handleLikeReview(review)}
                        >
                          <Ionicons name="heart-sharp" size={20} color="white" />
                          {/* <Text style={styles.actionText}>LIKE</Text> */}
                        </Pressable>
                      )
                    ) : (
                      // user can delete their own review
                      <Pressable
                        style={[styles.actionButton, { backgroundColor: '#ed6358' }]}
                        onPress={() => handleDeleteReview(review.id)}
                      >
                        <Ionicons name="trash-sharp" size={20} color="white" />
                        {/* <Text style={styles.actionText}>DELETE</Text> */}
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
    flexDirection: 'column',
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
    fontWeight: "800",
    marginBottom: 4,
    color: Colors.primary.darkteal,
  },
  userInfoMeta: {
    fontSize: 14,
    color: '#333',
    paddingBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    color: '#333',
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