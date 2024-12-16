import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface ReviewItemProps {
  image: any;
  title: string;
  description: string;
  rating: number;
  reviewCount?: number;
  distance?: string;
}

// Mock data
const recentReviews = [
  {
    id: '1',
    image: require('@/assets/images/try_something_new_dietary.png'),
    title: 'Sushi Paradise',
    description: 'Best sushi in town! Fresh and delicious.',
    rating: 5,
    reviewCount: 42,
  },
  {
    id: '2',
    image: require('@/assets/images/food/bakeries.jpg'),
    title: "Mario's Pizza",
    description: 'Authentic Italian pizza, great atmosphere',
    rating: 4,
    reviewCount: 28,
  },
];

const nearbyItems = [
  {
    id: '1',
    image: require('@/assets/images/food/american.jpg'),
    title: 'Gourmet Burger',
    description: 'Classic American burgers',
    rating: 4,
    distance: '0.3 mi',
  },
  {
    id: '2',
    image: require('@/assets/images/food/barbecue.jpg'),
    title: 'Street Tacos',
    description: 'Authentic Mexican street food',
    rating: 5,
    distance: '0.5 mi',
  },
  {
    id: '3',
    image: require('@/assets/images/try_something_new_cuisine.png'),
    title: 'Beef Pho',
    description: 'Popular Vietnamese noodle soup',
    rating: 5,
    distance: '0.5 mi',
  },
  {
    id: '4',
    image: require('@/assets/images/food/barbecue.jpg'),
    title: 'Nashville Hot Chicken Tenders',
    description: 'Spicy fried chicken tenders',
    rating: 5,
    distance: '0.8 mi',
  },
];

const ReviewItem: React.FC<ReviewItemProps> = ({
  image,
  title,
  description,
  rating,
  reviewCount,
  distance,
}) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewContent}>
      <Image source={image} style={styles.reviewImage} />
      <View style={styles.reviewDetails}>
        <ThemedText style={styles.reviewTitle}>{title}</ThemedText>
        <ThemedText style={styles.reviewDescription}>{description}</ThemedText>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <ThemedText key={i} style={styles.starIcon}>
              {i < rating ? '★' : '☆'}
            </ThemedText>
          ))}
          {reviewCount && (
            <ThemedText style={styles.reviewCount}>({reviewCount})</ThemedText>
          )}
          {distance && (
            <ThemedText style={styles.distance}>{distance}</ThemedText>
          )}
        </View>
      </View>
    </View>
  </View>
);

const ReviewsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={Colors.primary.lightteal}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recent Reviews Section */}
        <View style={styles.recentSection}>
          <ThemedText style={styles.sectionTitle}>Recent Reviews</ThemedText>
          {recentReviews.map((review) => (
            <ReviewItem key={review.id} {...review} />
          ))}
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Nearby Food Items Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nearby Food Items</ThemedText>
          {nearbyItems.map((item) => (
            <ReviewItem key={item.id} {...item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    marginBottom: 30,
  },
  recentSection: {
    marginBottom: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  separator: {
    height: 10,
    backgroundColor: Colors.primary.lightteal,
  },
  reviewItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  reviewContent: {
    flexDirection: 'row',
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewDetails: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  reviewDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#FFD700',
    fontSize: 16,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  distance: {
    marginLeft: 'auto',
    fontSize: 14,
    color: Colors.primary.darkteal,
  },
});

export default ReviewsScreen;
