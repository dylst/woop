import React, { useState } from 'react';
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

const screenHeight = Dimensions.get('window').height;

export default function AddReviewScreen() {
  // Assume the restaurant name is passed as a route parameter
  const { restaurantName } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Dummy tag options; adjust as needed
  const availableTags = ['Delicious', 'Spicy', 'Friendly', 'Worth It', 'Overpriced'];

  // When a star is pressed, update the rating (1 to 5)
  const handleStarPress = (starIndex: number) => {
    setRating(starIndex);
  };

  // Toggle a tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Called when "Post Review" is pressed
  const handlePostReview = () => {
    console.log("Review posted:", { rating, reviewText, selectedTags });
    // Add review submission logic here...
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} style={styles.closeIcon} />
        </Pressable>
        <ThemedText style={styles.title}>
          Review for {restaurantName || "Restaurant"}
        </ThemedText>
        <Pressable onPress={() => console.log("help")}>
          <Ionicons name="help" size={24} style={styles.closeIcon} />
        </Pressable>
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
          <Text style={styles.sectionText}>
            Tell us about your experience
          </Text>
          {/* Tags Row */}
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
          {/* Text Input */}
          <TextInput
            style={styles.textBox}
            placeholder="Write your review here..."
            multiline
            value={reviewText}
            onChangeText={setReviewText}
          />
          {/* Picture Option */}
          <Pressable
            style={styles.pictureOption}
            onPress={() => console.log("Picture option pressed")}
          >
            <Ionicons name="camera" size={24} color="#65C5E3" />
            <Text style={styles.pictureText}>Add Picture</Text>
          </Pressable>
        </View>

        {/* Spacer so content scrolls above the fixed button */}
        <View style={{ height: screenHeight * 0.25 }} />
      </ScrollView>

      {/* Post Review Button fixed 20% from the bottom */}
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
    height: screenHeight * 0.35, // approximately 35% of the screen height
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
    bottom: '20%', // fixed 20% from the bottom
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
