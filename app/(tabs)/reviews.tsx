import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Pressable,
  Text,
  FlatList,
  RefreshControl,
  Modal,
  Button,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import { supabase } from '@/supabaseClient';
import { useUser } from '../context/UserContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StarRating from '@/components/ui/StarRating';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReviewItem {
  profile_id: string;
  food_item_id: string;
  food_name?: string;
  photos?: string[];
  restaurant_name?: string;
  price_range?: string;
  cuisine_type?: string[];
  dietary_tags?: string[];
  review_id?: string;
  id: string;
  review_text: string;
  rating: number;
}

type EditModalProps = {
  isModalVisible: boolean;
  handleSave: (reviewId: string, reviewText: string, rating: number) => void;
  closeModal: () => void;
  reviewItem: ReviewItem;

}

const EditModal = ({ isModalVisible, handleSave, closeModal, reviewItem }: EditModalProps) => {
  const [inputText, setInputText] = useState<string>(reviewItem.review_text);
  const [rating, setRating] = useState(reviewItem.rating)
  return (
    <Modal
      visible={isModalVisible}
      onRequestClose={closeModal} // Handle back button press on Android
      transparent={true} // Allows you to see the background
      animationType="slide" // Modal slide-up animation
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.itemTitle}>{reviewItem.food_name}</Text>
          <Text style={styles.itemComment}>{reviewItem.restaurant_name}</Text>
          <View style={styles.ratingRow}>
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
          {/* TextInput (Textbox) */}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText} // Update state with the input
            placeholder="Type here..."
          />

          {/* Save and Cancel Buttons */}
          <View style={styles.buttonsContainer}>
            <Button title="Save" onPress={() => handleSave(reviewItem.id, inputText, rating)} />
            <Button title="Cancel" onPress={closeModal} />
          </View>
        </View>
      </View>
    </Modal>
  )
};

const ReviewsScreen = () => {
  const insets = useSafeAreaInsets();
  const [editItem, setEditItem] = useState<ReviewItem | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const handlePress = (foodItemId: string) => {
    router.push(`/food/${foodItemId}`)
  };


  const handleEdit = (item: ReviewItem) => {
    setIsModalVisble(true);
    setEditItem(item);
  }

  const [isModalVisible, setIsModalVisble] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: ReviewItem }) => {
    const cuisineText = item.cuisine_type?.join(' ');
    const dietaryText = item.dietary_tags?.join(' ');

    const imageUrl = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : '';

    return (
      <Pressable
        style={styles.card}
        onPress={() => handlePress(item.food_item_id)}
      >
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{item.food_name}</Text>
          <Text style={styles.itemComment}>{item.restaurant_name}</Text>
          <Text style={styles.itemComment}>{item.review_text.slice(0, 50)}{item.review_text.length > 50 && '...'}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingAverage}>{item.rating ? (item.rating.toFixed(1)) : '0.0'}</Text>
            <StarRating average={item.rating} />
          </View>
          <View style={styles.itemTagContainer}>
            <Text style={styles.itemTagPrice}>{item.price_range}</Text>
            <Text style={styles.itemTag}>{cuisineText?.split(" ", 2).join(" ")} {dietaryText?.split(" ", 2).join(" ")}</Text>
          </View>
        </View>

        {item.profile_id == userId ?
          <>
            <Ionicons
              name='create-outline'
              size={28}
              onPress={() => handleEdit(item)}
            />
            <Ionicons
              name='close-outline'
              size={28}
              onPress={() => handleRemoveItem(item.id)}
            />
          </> : null}
      </Pressable>
    );
  };

  const userId = user?.id;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('review')
        .select(`
          id,
          profile_id,
          food_item_id,
          fooditem (
            food_name,
            photos,
            restaurant_name,
            price_range,
            cuisine_type,
            dietary_tags
          ),
          review_date,
          review_text, 
          rating
        `)
        .eq('profile_id', userId)
        .order('review_date', { ascending: false })

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      if (!data) return;

      const flattened = data.map((review: any) => ({
        profile_id: review.profile_id,
        food_item_id: review.food_item_id,
        food_name: review.fooditem?.food_name || '',
        photos: review.fooditem?.photos || [],
        restaurant_name: review.fooditem?.restaurant_name || '',
        price_range: review.fooditem?.price_range || '',
        cuisine_type: review.fooditem?.cuisine_type || [],
        dietary_tags: review.fooditem?.dietary_tags || [],
        review_date: review.review_date || '',
        id: review.id,
        review_text: review.review_text,
        rating: review.rating,
      }));

      setReviews(flattened);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchReviews();
    }
  }, [userId]);
  // Remove item from both state and Supabase
  const handleRemoveItem = async (id: string) => {
    // Remove from Supabase
    const { error } = await supabase
      .from('review')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }
    // Remove from the local state (UI)
    setReviews((prevReviews) => prevReviews.filter((item) => item.id !== id));

  };

  const handleUpdateReview = async (reviewId: string, reviewText: string, rating: number) => {
    try {
      const { data, error } = await supabase
        .from('review')
        .update({ review_text: reviewText, rating })
        .eq('id', reviewId);

      if (error) {
        console.error(error);
        return;
      }
      await onRefresh();
      setIsModalVisble(false);
    } catch (e) {
      console.error('Error:', e);
    }

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={Colors.primary.lightteal}
      />
      {/* Top Bar */}
      <TopBar type='back' title='reviews' />

      {/* Recent Reviews Section */}
      <View style={styles.recentSection}>
        <ThemedText style={styles.sectionTitle}>Your Reviews</ThemedText>
        {editItem ? <EditModal isModalVisible={isModalVisible} handleSave={handleUpdateReview} closeModal={() => setIsModalVisble(false)} reviewItem={editItem} /> : null}
      </View>

      <FlatList<ReviewItem>
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWoops: {
    fontSize: 48,
    color: '#999',
  },
  emptyText: {
    fontSize: 28,
    color: '#999',
    paddingVertical: 20,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  myFavoritesLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sortButtonText: {
    fontSize: 16,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sortMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderColor: Colors.primary.darkteal,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '60%',
  },
  sortOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.primary.darkteal,
  },
  sortOptionText: {
    fontSize: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary.darkteal,
    backgroundColor: Colors.primary.lightTealTranslucent20,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 4,
  },
  tagIcon: {
    marginRight: 4,
    color: Colors.primary.darkteal,
  },
  tagText: {
    fontSize: 14,
    color: Colors.primary.darkteal,
  },
  tagActive: {
    backgroundColor: Colors.primary.darkteal,
    borderColor: Colors.primary.darkteal,
  },
  tagTextActive: {
    color: '#fff',
  },
  tagIconActive: {
    marginRight: 4,
    color: '#fff',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemComment: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
    marginRight: 2,
  },
  itemTagContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 2,
  },
  itemTag: {
    marginRight: 4,
    color: '#555',
    fontSize: 14,
  },
  itemTagPrice: {
    marginRight: 10,
    color: '#555',
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  ratingAverage: {
    color: "#555",
    fontSize: 14,
    marginRight: 3,
  },
  ratingCount: {
    marginLeft: 3,
    fontSize: 10,
    color: '#999',
  },
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background overlay
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});



export default ReviewsScreen;
