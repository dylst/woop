import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/supabaseClient'; // Adjust the import path accordingly

const screenHeight = Dimensions.get('window').height;

type RatingInfo = {
  average: number;
  count: number;
};

export default function AddReviewScreen() {
  // Using 'restaurantName' parameter as a placeholder.
  const { restaurantName } = useLocalSearchParams();

  // States for the review form
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const availableTags = ['Delicious', 'Spicy', 'Friendly', 'Worth It', 'Overpriced'];

  // State for fetched ratings
  const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});

  // Dummy food item ID for testing (replace with a route parameter if needed)
  const dummyFoodItemId = '191';

  // For testing, you might have used a dummy user id.
  // **Option 1: Use Supabase Auth to get the current user id**
  // const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // useEffect(() => {
  //   const getCurrentUser = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     setCurrentUserId(user?.id || null);
  //   };
  //   getCurrentUser();
  // }, []);
  
  // **Option 2: For testing only, ensure a dummy user with id 100 exists in your "user" table**
  const dummyUserId = 100;

  // Function to fetch ratings for given food item IDs
  const fetchRatings = async (itemIds: string[]) => {
    if (itemIds.length === 0) return;

    const { data, error } = await supabase
      .from('review')
      .select('food_item_id, rating')
      .in('food_item_id', itemIds);

    if (error) {
      console.error('Error fetching ratings:', error);
      return;
    }
    if (!data) return;

    const map: { [key: string]: { sum: number; count: number } } = {};

    data.forEach((row: any) => {
      if (!map[row.food_item_id]) {
        map[row.food_item_id] = { sum: 0, count: 0 };
      }
      map[row.food_item_id].sum += row.rating;
      map[row.food_item_id].count += 1;
    });

    const finalMap: { [key: string]: RatingInfo } = {};
    for (const fid in map) {
      const sum = map[fid].sum;
      const count = map[fid].count;
      finalMap[fid] = {
        average: count === 0 ? 0 : sum / count,
        count,
      };
    }

    setRatingMap(finalMap);
  };

  // Fetch ratings when the component mounts
  useEffect(() => {
    fetchRatings([dummyFoodItemId]);
  }, []);

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePostReview = async () => {
    // If using authentication, replace dummyUserId with currentUserId.
    // if (!currentUserId) {
    //   console.error("No user logged in");
    //   return;
    // }
    const reviewData = {
      review_text: reviewText,
      user_id: dummyUserId, // Replace this with the authenticated user's id when available
      food_item_id: Number(dummyFoodItemId),
      rating: rating,
      review_date: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('review').insert([reviewData]);

    if (error) {
      console.error('Error posting review:', error);
    } else {
      console.log('Review posted successfully:', data);
    }
  };

  const currentRatingInfo = ratingMap[dummyFoodItemId];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} style={styles.closeIcon} />
        </Pressable>
        <ThemedText style={styles.title}>
          Review for {restaurantName || "Food Item"}
        </ThemedText>
        <Pressable onPress={() => console.log("help")}>
          <Ionicons name="help" size={24} style={styles.closeIcon} />
        </Pressable>
      </View>

      <View style={styles.currentRatingContainer}>
        {currentRatingInfo ? (
          <Text style={styles.currentRatingText}>
            Current Average Rating: {currentRatingInfo.average.toFixed(1)} ({currentRatingInfo.count} reviews)
          </Text>
        ) : (
          <Text style={styles.currentRatingText}>No ratings yet.</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionText}>
            How would you rate your experience?
          </Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => handleStarPress(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color="#FFD700"
                  style={styles.starIcon}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Review Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionText}>Tell us about your experience</Text>
          <View style={styles.tagContainer}>
            {availableTags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.textBox}
            placeholder="Write your review here..."
            multiline
            value={reviewText}
            onChangeText={setReviewText}
          />
          <Pressable
            style={styles.pictureOption}
            onPress={() => console.log("Picture option pressed")}
          >
            <Ionicons name="camera" size={24} color="#65C5E3" />
            <Text style={styles.pictureText}>Add Picture</Text>
          </Pressable>
        </View>

        <View style={{ height: screenHeight * 0.25 }} />
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeIcon: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  currentRatingContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  currentRatingText: {
    fontSize: 16,
    color: '#333',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#65C5E3',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: '#65C5E3',
  },
  tagText: {
    fontSize: 14,
    color: '#65C5E3',
  },
  tagTextSelected: {
    color: '#fff',
  },
  textBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: screenHeight * 0.35,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  pictureOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pictureText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#65C5E3',
  },
  postReviewContainer: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  postReviewButton: {
    backgroundColor: '#65C5E3',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  postReviewText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
