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
  import { Colors } from "@/constants/Colors";
  
  export default function AuthorModerationPage() {
    const router = useRouter();
    const { foodItemId } = useLocalSearchParams();
    const [reviews, setReviews] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
  
    const fetchReviewsAndComments = async () => {
      if (!foodItemId) return;
      
      // Fetch reviews related to the foodItemId
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("review")
        .select("id, review_text, rating")
        .eq("food_item_id", foodItemId);
  
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        return;
      }
  
      setReviews(reviewsData);
      
      if (reviewsData.length === 0) return;
  
      // Extract review IDs
      const reviewIds = reviewsData.map((review) => review.id);
      
      // Fetch comments related to those reviews
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("id, comment_text, review_id")
        .in("review_id", reviewIds);
  
      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        return;
      }
  
      setComments(commentsData);
    };
  
    const deleteComment = async (commentId: number) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
  
      if (error) {
        console.error("Error deleting comment:", error);
        return;
      }
  
      setComments(comments.filter((comment) => comment.id !== commentId));
    };
  
    useEffect(() => {
      fetchReviewsAndComments();
    }, []);
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#333" style={styles.backButton} />
          </Pressable>
        </View>
  
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>{review.review_text}</Text>
                <Text style={styles.reviewMeta}>Rating: {review.rating}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>No reviews yet.</Text>
          )}
  
          <Text style={styles.sectionTitle}>Comments</Text>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentContainer}>
                <Text style={styles.commentText}>{comment.comment_text}</Text>
                <Pressable onPress={() => deleteComment(comment.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>No comments yet.</Text>
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
    commentContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    commentText: {
      fontSize: 16,
    },
    noComments: {
      fontSize: 16,
      color: "gray",
      textAlign: "center",
    },
  });
  