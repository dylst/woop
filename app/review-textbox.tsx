import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { SafeAreaView, StyleSheet, View, Text, Pressable, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from './context/UserContext';

const screenHeight = Dimensions.get('window').height;

// List of words to check against (this list can be expanded or replaced by a more robust solution)
const bannedWords = ['fuck', 'Fuck', 'Shit', 'shit', 'bitch' , 'Bitch'];

function containsInappropriateContent(text: string) {
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => lowerText.includes(word));
}

export default function AddReviewScreen() {
  const params = useLocalSearchParams();
  const { user } = useUser();
  const foodItemId = params.foodItemId || "5";  

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handlePostReview = async () => {
    if (!reviewText || rating === 0) {
      alert("Please provide a rating and review text.");
      return;
    }

    // Check for inappropriate content
    if (containsInappropriateContent(reviewText)) {
      alert("Your review contains inappropriate language. Please modify your review.");
      return;
    }

    const numericFoodItemId = Number(foodItemId);
    const numericRating = Number(rating);

    const { error } = await supabase
      .from("review")
      .insert([
        {
          profile_id: user?.id,
          food_item_id: numericFoodItemId,
          rating: numericRating,
          review_text: reviewText,
          review_date: new Date().toISOString(),
        }
      ]);

    if (!error) {
      alert("Review posted successfully!");
      router.push(`/food/${foodItemId}`);
    } else {
      alert("Failed to post review.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} style={styles.closeIcon} />
        </Pressable>
        <ThemedText style={styles.title}>Review Food Item</ThemedText>
        <Pressable onPress={() => console.log("help")}>
          <Ionicons name="help" size={24} style={styles.closeIcon} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(Number(star))}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={32}
                color="#FFD700"
                style={styles.starIcon}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionText}>Tell us about your experience</Text>
          <TextInput
            style={styles.textBox}
            placeholder="Write your review here..."
            multiline
            value={reviewText}
            onChangeText={setReviewText}
          />
        </View>
      </ScrollView>

      <View style={styles.postReviewContainer}>
        <Pressable style={styles.postReviewButton} onPress={handlePostReview}>
          <Text style={styles.postReviewText}>Post Review</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  closeIcon: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  section: { marginBottom: 20 },
  sectionText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  starRow: { flexDirection: 'row' },
  starIcon: { marginRight: 8 },
  textBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, height: 150, textAlignVertical: 'top' },
  postReviewContainer: { position: 'absolute', bottom: '20%', left: 0, right: 0, alignItems: 'center' },
  postReviewButton: { backgroundColor: '#65C5E3', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 30 },
  postReviewText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
