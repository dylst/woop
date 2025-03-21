import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { Colors } from '@/constants/Colors';
import { useUser } from '../context/UserContext';
import { fetchRatings, RatingInfo } from '@/hooks/fetchHelper';

// to position back button within safe area view
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StarRating from '@/components/ui/StarRating';

export default function FoodItemDetailPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = useUser();
  const { foodItemId } = useLocalSearchParams();
  const featuredId = null;

  const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});

  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingsBar, setRatingsBar] = useState<any[]>([]);
  const [isFavorite, setIsFavorites] = useState(false);
  const [itemData, setItemData] = useState<any>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  const [barContainerWidth, setBarContainerWidth] = useState<number>(0);

  // TESTING FETCHING ITEM FROM DATABASE
  // DUMMY DATA FOR RELATED FOOD ITEMS
  const [relatedFavorites, setRelatedFavorites] = useState<number[]>([]);
  // const TEST_USER_ID = 10;

  const userId = user?.id;

  const featuredScale = useRef(new Animated.Value(0)).current;

  const computeRatings = (reviews: any[]) => {
    const counts: { [key: string]: number } = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    reviews.forEach((review) => {
      const ratingValue = Math.round(review.rating);
      if (ratingValue >= 1 && ratingValue <= 5) {
        counts[String(ratingValue)]++;
      }
    });

    const total = reviews.length;
    return [
      { label: '5', percentage: total > 0 ? (counts['5'] / total) * 100 : 0, color: '#E64A19', count: counts['5'] },
      { label: '4', percentage: total > 0 ? (counts['4'] / total) * 100 : 0, color: '#F57C00', count: counts['4'] },
      { label: '3', percentage: total > 0 ? (counts['3'] / total) * 100 : 0, color: '#FFB300', count: counts['3'] },
      { label: '2', percentage: total > 0 ? (counts['2'] / total) * 100 : 0, color: '#FFCA28', count: counts['2'] },
      { label: '1', percentage: total > 0 ? (counts['1'] / total) * 100 : 0, color: '#FFD54F', count: counts['1'] },
    ];
  };

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

  const fetchReviews = async () => {
    if (!foodItemId) return;

    const { data, error } = await supabase
      .from("review")
      .select("rating")
      .eq("food_item_id", foodItemId)

    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }

    setRatingsBar(data);
    const computedRatings = computeRatings(data);
    setRatingsBar(computedRatings);
  };

  const fetchFeatured = async () => {
    if (!foodItemId) return;

    const { data, error } = await supabase
      .from('featured_items')
      .select('food_item_id, food_name')
      .eq("food_item_id", foodItemId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching featured items:", error)
    }

    setIsFeatured(!!data);
  }

  // const photoRatings = [
  //   { label: '5', percentage: 80, color: '#E64A19', image: 'photo1.jpg' },
  //   { label: '4', percentage: 30, color: '#F57C00', image: 'photo2.jpg' },
  //   { label: '3', percentage: 15, color: '#FFB300', image: 'photo3.jpg' },
  //   { label: '2', percentage: 10, color: '#FFCA28', image: 'photo4.jpg' },
  //   { label: '1', percentage: 5, color: '#FFD54F', image: 'photo5.jpg' },
  // ];

  const handlePhotoClick = (image: string) => {
    console.log('Opening photo:', image); // Replace with a full-screen image viewer later
  };

  const checkIfFavorite = async () => {
    if (!foodItemId) return;
    const { data, error } = await supabase
      .from('favorite')
      .select('id')
      .eq('profile_id', userId)
      .eq('food_item_id', foodItemId)
      .maybeSingle();

    if (!error && data) {
      setIsFavorites(true);
    }
  };

  // fetch ratings from reviews
  const loadRatings = async (itemIds: string[]) => {
    try {
      const ratings = await fetchRatings(itemIds);
      setRatingMap(ratings);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchFoodItem();
    checkIfFavorite();

  }, []);

  // load ratings
  useEffect(() => {
    if (foodItemId) {
      loadRatings([String(foodItemId)])
    }
  }, [foodItemId]);

  useEffect(() => {
    if (foodItemId) {
      fetchReviews();
      fetchFeatured();
    }
  }, [foodItemId]);

  useEffect(() => {
    if (isFeatured) {
      Animated.spring(featuredScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(featuredScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isFeatured, featuredScale])

  const handleFavoriteToggle = async () => {
    try {
      const foodId = Number(foodItemId);
      if (!isFavorite) {
        const { error } = await supabase.from('favorite').insert({
          profile_id: userId,
          food_item_id: foodId,
        });

        if (error) {
          console.log('Error adding favorite:', error);
          return;
        }

        setIsFavorites(true);
      } else {
        const { error } = await supabase
          .from('favorite')
          .delete()
          .eq('profile_id', userId)
          .eq('food_item_id', foodId);

        if (error) {
          console.log('Error removing favorite:', error);
          return;
        }

        setIsFavorites(false);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const cuisineType = itemData?.cuisine_type ?? [];
  const dietaryTags = itemData?.dietary_tags ?? [];

  const cuisineText = cuisineType.join(', ');
  const dietaryText = dietaryTags.join(', ');

  // DUMMY DATA FOR RELATED FOOD ITEMS
  const relatedFood = [
    {
      id: 1,
      name: "Melody's Boba Noodles",
      description: 'A good helping of boba and backshots',
      rating: 4,
      reviews: 35,
      image: require('@/assets/images/backshoot-noods.png'),
    },
    {
      id: 2,
      name: "Jay's Instant Ramen",
      description: 'Ramen you can buy in stores but with a twist',
      rating: 3.5,
      reviews: 35,
      image: require("@/assets/images/Jay's-noods.png"),
    },
  ];

  const handleRelatedFavoriteToggle = (id: number) => {
    setRelatedFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  // Define action buttons with their onPress actions
  const actionButtons = [
    {
      icon: 'star-outline' as const,
      text: 'Write Review',
      onPress: () => router.push(`/review-textbox?foodItemId=${foodItemId}`),
    },
    {
      icon: 'camera-outline' as const,
      text: 'Add Photo',
      onPress: () => console.log('Add Photo Pressed'),
    },
    {
      icon: 'map-outline' as const,
      text: 'View Map',
      onPress: () => console.log('View Map Pressed'),
    },
    {
      icon: 'create-outline' as const,
      text: 'Suggest Edit',
      onPress: () => router.push(`/food/suggest-edit/${foodItemId}`),
    },
  ];

  const imageUrl =
    Array.isArray(itemData?.photos) && itemData?.photos.length > 0
      ? itemData.photos[0]
      : '';

  const ratingInfo = ratingMap[String(foodItemId)];
  const average = ratingInfo?.average || 0;
  const count = ratingInfo?.count || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Top Navigation */}
        <View style={[styles.topNav, { top: insets.top - 50 }]}>
          <Pressable onPress={() => router.back()}>
            <Ionicons
              name='chevron-back'
              size={28}
              color='#333'
              style={styles.backButton}
            />
          </Pressable>
          {isFeatured && (
            <Animated.View style={[styles.featuredContainer,
            {
              transform: [{
                scale: featuredScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })
              }]
            }]}>
              <Ionicons name='star-sharp' size={28} color='#ffffff' />
            </Animated.View>
          )}
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.foodImage} />
          ) : (
            <View style={[styles.foodImage, styles.noImage]}>
              <Ionicons name="images" size={108} color="fff" />
            </View>
          )}

          {/* Overlay */}
          <View style={styles.overlayContainer}>
            <View style={styles.overlayContent}>
              <Text style={styles.foodTitle}>
                {itemData?.food_name || 'Food Name'}
              </Text>
              <Text style={styles.foodLocation}>
                {itemData?.restaurant_name || 'Restaurant name'}
              </Text>
            </View>
            {/* Add Item to Favorites */}
            <Pressable style={styles.heartIcon} onPress={handleFavoriteToggle}>
              <Ionicons
                name={isFavorite ? 'heart-sharp' : 'heart-outline'}
                size={36}
                color={'#ff1800'}
              />
            </Pressable>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                {ratingMap[String(foodItemId)]
                  ? ratingMap[String(foodItemId)].average.toFixed(1)
                  : '0.0'}
              </Text>
              <Ionicons name='star' size={28} color='#FFD700' />
            </View>
          </View>
        </View>

        {/* Food Category */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>
            {itemData?.price_range || '$'}
            {cuisineText || dietaryText ? ' • ' : ''}
            {cuisineText}
            {cuisineText && dietaryText ? ', ' : ''}
            {dietaryText}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {actionButtons.map((button, index) => (
            <Pressable
              key={index}
              style={styles.actionButton}
              onPress={button.onPress}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={button.icon} size={24} color='#65C5E3' />
              </View>
              <Text style={styles.buttonText}>{button.text}</Text>
            </Pressable>
          ))}
        </View>

        {/* Reviews & Photos Section */}
        <View style={styles.reviewsPhotosContainer}>
          {/* Reviews Section */}
          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.ratingColumn}>
              <Text style={styles.boldText}>Overall Rating</Text>
              <View style={styles.starRow}>
                <StarRating average={average} size={24} />
              </View>
              <Text style={styles.reviewCount}>{count === 1 ? `1 review` : `${count} reviews`}</Text>
            </View>

            {/* View Reviews Button */}
            <Pressable
              onPress={() => router.push({
                pathname: "/fooditem_review",
                params: { foodItemId: String(foodItemId) }  // Convert to string
              })}
              style={styles.viewReviewsButton}
            >
              <Text style={styles.viewReviewsText}>View Reviews →</Text>
            </Pressable>
          </View>

          {/* Photos Section */}
          {/* <View style={styles.photosContainer}>
            <Text style={styles.sectionTitle}>Photos</Text>
            {ratingsBar.map((item, index) => (
              <View key={index} style={styles.photoRow}>
                <Text style={styles.photoLabel}>{item.label}</Text>
                <Pressable onPress={() => handlePhotoClick(item.image)}>
                  <View style={[styles.photoBar, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                </Pressable>
              </View>
            ))}
          </View> */}

          {/* Ratings Distribution */}
          <View style={styles.ratingsDistribution}>
            {ratingsBar.map((item) => (
              <View style={styles.ratingRow} key={item.label}>
                <Text style={styles.ratingLabel}>{item.label}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFilled,
                      {
                        flex: item.percentage / 100,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.barEmpty,
                      {
                        flex: 1 - item.percentage / 100,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Blue Divider */}
        <View style={styles.blueDivider} />

        {/* Related Food Items */}
        <View style={styles.relatedContainer}>
          <Text style={styles.sectionTitle}>Related Food Items</Text>
          {relatedFood.map((item) => (
            <View key={item.id} style={styles.foodItem}>
              <Image source={item.image} style={styles.foodImageSmall} />
              <View style={styles.foodDetails}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodDescription}>{item.description}</Text>
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.rating ? 'star' : 'star-outline'}
                      size={16}
                      color={i < item.rating ? '#FFD700' : '#D3D3D3'}
                    />
                  ))}
                  <Text style={styles.reviewCount}>({item.reviews})</Text>
                </View>
              </View>
              <Pressable onPress={() => handleRelatedFavoriteToggle(item.id)}>
                <Ionicons
                  name={
                    relatedFavorites.includes(item.id) ? 'heart' : 'heart-outline'
                  }
                  size={24}
                  color='#000'
                />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  blueBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 65, // Adjust height as needed
    backgroundColor: '#B3E5FC', // Light blue color
    zIndex: 1, // Ensures it's above other elements
  },

  backButton: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderRadius: 50,
    backgroundColor: '#fff',
    color: Colors.primary.darkteal,
    width: 40,
    height: 40,
    padding: 4,
    paddingLeft: 5,
    paddingTop: 6,
  },
  topNav: {
    position: 'absolute',
    top: 10, // Adjust to ensure it's placed correctly
    left: 10,
    right: 10,
    zIndex: 2, // Keeps it above the image
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    width: 40,
    height: 40,
    padding: 4,
    paddingLeft: 6,
    paddingTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imageContainer: {
    position: 'relative', // Allows overlay to be absolutely positioned inside
    width: '100%',
    height: 250, // Adjust height as needed
    overflow: 'hidden',
  },

  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  noImage: {
    backgroundColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)', // Semi-transparent black for contrast
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overlayContent: {
    flex: 1,
  },

  foodTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },

  foodLocation: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  heartIcon: {
    marginRight: 10,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Light background for contrast
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  ratingText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginRight: 4,
  },

  categoryContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 10,
    marginBottom: 10,
  },

  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  iconCircle: {
    width: 50,
    height: 50,
    backgroundColor: '#E3F7FF', // Light blue background
    borderRadius: 25, // Circular button
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },

  reviewsPhotosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },

  reviewsContainer: {
    flex: 1,
  },

  ratingsDistribution: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  ratingColumn: {
    marginBottom: 10,
  },

  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  starRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },

  reviewCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },

  viewReviewsButton: {
    marginTop: 5,
  },

  viewReviewsText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingLabel: {
    width: 20,
    marginRight: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },

  barContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    height: 8,
  },

  barFilled: {
    // dynamic color set inline
  },
  barEmpty: {
    backgroundColor: '#eee',
  },

  blueDivider: {
    height: 6,
    backgroundColor: '#B3E5FC', // Light blue bar
    width: '100%',
    marginVertical: 10,
  },

  relatedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  foodImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },

  foodDetails: {
    flex: 1,
  },

  foodName: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },

  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
});
