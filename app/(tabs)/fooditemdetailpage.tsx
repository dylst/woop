import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';

// Define Navigation Types
type RootStackParamList = {
  FoodDetails: undefined;
  Reviews: undefined;
  Photos: undefined;
};

type FoodItemDetailProps = {
  navigation: NavigationProp<RootStackParamList, 'FoodDetails'>;
};

// Sample Data
const foodDetails = {
  title: "Will's Coughing Soup",
  imageSource: require("@/assets/images/Willsoup.png"),
  rating: 4.9,
  description: 'Soup · Vietnamese · Vegetarian',
  reviews: [
    { id: '1', reviewer: 'Diane', comment: 'Best soup ever! It helped me recover.', rating: 5 },
    { id: '2', reviewer: 'John', comment: 'Delicious and comforting.', rating: 5 },
    { id: '3', reviewer: 'Kyle', comment: 'Amazing Soup but a little expensive.', rating: 4},
    { id: '4', reviewer: 'Dylan', comment: 'Recommend coming here for your first time!', rating: 5},
    { id: '5', reviewer: 'Melody', comment: 'Lovely place and amazing food!', rating: 5}

  ],
  photos: [
    require('@/assets/images/soupone.png'),
    require("@/assets/images/souptwo.png"),
    require("@/assets/images/soupthree.png"),
    require("@/assets/images/soupfour.png"),
  ],
  relatedItems: [
    { id: '1', title: "Melody's Baba Noodles", image: require("@/assets/images/backshoot-noods.png") },
    { id: '2', title: "Jay's Instant Ramen", image: require("@/assets/images/Jay's-noods.png") },
  ],
};

const Tab = createMaterialTopTabNavigator();

// Reviews Tab
const ReviewsTab = () => (
  <ScrollView style={styles.tabContainer}>
    {foodDetails.reviews.map((review) => (
      <View key={review.id} style={styles.reviewCard}>
        <Text style={styles.reviewer}>{review.reviewer}</Text>
        <Text>{review.comment}</Text>
        <View style={styles.starsContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <Ionicons
              key={index}
              name={index < review.rating ? 'star' : 'star-outline'}
              size={18}
              color={index < review.rating ? 'gold' : '#ccc'}
            />
          ))}
        </View>
      </View>
    ))}
  </ScrollView>
);

// Photos Tab
const PhotosTab = () => (
  <FlatList
    data={foodDetails.photos}
    keyExtractor={(_, index) => index.toString()}
    numColumns={2} // Two columns for the grid layout
    renderItem={({ item }) => (
      <View style={styles.photoWrapper}>
        <Image source={item} style={styles.photo} />
        <Text style={styles.photoCaption}>{item.caption}</Text>
      </View>
    )}
    contentContainerStyle={styles.photoGrid}
  />
);

// Main Component
const FoodItemDetailPage: React.FC<FoodItemDetailProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Food Image and Details */}
      <View style={styles.imageContainer}>
        <Image source={foodDetails.imageSource} style={styles.foodImage} />
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodTitle}>{foodDetails.title}</Text>
        <Text style={styles.foodRating}>⭐ {foodDetails.rating}</Text>
        <Text style={styles.foodDescription}>{foodDetails.description}</Text>
      </View>

      {/* Tabs for Reviews and Photos */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'white',
          tabBarIndicatorStyle: { backgroundColor: 'white' },
        }}
      >
        <Tab.Screen 
        name="Reviews" component={ReviewsTab} />
        <Tab.Screen name="Photos" component={PhotosTab} />
      </Tab.Navigator>

      {/* Related Food Items */}
      <View style={styles.relatedSection}>
        <Text style={styles.relatedTitle}>Related Food Items</Text>
        <FlatList
          data={foodDetails.relatedItems}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.relatedCard}>
              <Image source={item.image} style={styles.relatedImage} />
              <Text style={styles.relatedTextBold}>{item.title}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.lightteal },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 1 },
  imageContainer: {
    backgroundColor: Colors.primary.lightteal,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  foodImage: { width: '100%', height: 250, resizeMode: 'cover' },
  foodInfo: { padding: 16, backgroundColor: 'lightgray', alignItems: 'center' },
  foodTitle: { fontSize: 24, fontWeight: 'bold' },
  foodRating: { fontSize: 18, color: 'black', marginVertical: 4 },
  foodDescription: { fontSize: 16, color: '#555' },
  tabContainer: { padding: 16 },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewer: { fontSize: 16, fontWeight: 'bold' },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  // photoGrid: { padding: 8 },
  // photo: { width: '48%', height: 120, margin: 4, borderRadius: 8 },
  photoGrid: {
    paddingHorizontal: 8,
    backgroundColor: 'black', // Light background for gallery
  },
  
  photoWrapper: {
    flex: 1, // Ensures equal width distribution
    margin: 4, // Adds spacing between photos
    // aspectRatio: 1,
    // borderRadius: 8,
    // overflow: 'hidden',
    alignItems: 'center', // Centers the image
    justifyContent: 'center',
  },
  
  photo: {
    width: '100%', // Takes full width of the wrapper
    height: 150, // Fixed height for uniformity
    resizeMode: 'cover', // Ensures the image fills its container
    borderRadius: 8, // Optional: Rounded corners
  },
  photoCaption: {
    marginTop: 4,
    fontSize: 12,
    color: 'white', // Light gray text for captions
    textAlign: 'center',
  },
  relatedSection: { marginTop: 5},
  relatedTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 },
  relatedCard: { marginHorizontal: 8, alignItems: 'center' },
  relatedImage: { width: 100, height: 100, borderRadius: 8 },
  relatedText: { marginTop: 4, fontSize: 14, textAlign: 'center' },
  relatedTextBold: {
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold', // Makes the text bold
  },
  
});

export default FoodItemDetailPage;
