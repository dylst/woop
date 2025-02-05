import React, {useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    FlatList, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';
import TopBar from '@/components/ui/TopBar';

interface FavoriteItem {
  user_id: string;
  food_item_id: string;

  food_name: string;
  photos: string;
  restaurant_name: string;
}

const favorites = ({ userId }: { userId: string}) => {
  // TEST_ID
  userId = '10';

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const fetchFavorites = async () => {
      const { data, error } = await supabase
      .from('favorite')
      .select(`
        user_id,
        food_item_id,
        fooditem (
          food_name,
          photos,
          restaurant_name
        )
      `)
      .eq('user_id', userId)

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      } 

      if (!data) return;

      const flattened = data.map((fav: any) => ({
        user_id: fav.user_id,
        food_item_id: fav.food_item_id,
        food_name: fav.fooditem?.food_name || '',
        photos: fav.fooditem?.photos || '',
        restaurant_name: fav.fooditem?.restaurant_name || '',
      }));

      setFavorites(flattened);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

    // Remove item from both state and Supabase
    const handleRemoveItem = async (id: string) => {
      // Remove from Supabase
      const { error } = await supabase
        .from('favorite')
        .delete()
        .eq('id', id);
  
      if (error) {
        console.error(error);
      } else {
        // Remove from the local state (UI)
        setFavorites((prevFavorites) => prevFavorites.filter((item) => item.food_item_id !== id));
      }
    };

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.photos}} style={styles.itemImage} />

        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{item.food_name}</Text>
          <Text style={styles.itemComment}>{item.restaurant_name}</Text>

          {/* <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name="star"
                size={16}
                color="#FFD700"
                style={{ marginRight: 2}}
              />
            ))}
            <Text style={styles.ratingCount}>({item.rating_count ?? 10 })</Text>
          </View> */}
        </View>
        <Ionicons
                name='close-outline'
                size={28}
                onPress={() => handleRemoveItem(item.food_item_id)}

              />
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <TopBar/>

      <Text style={styles.myFavoritesLabel}>My Favorites</Text>
      <FlatList<FavoriteItem>
        data={favorites}
        keyExtractor={(item) => item.food_item_id.toString()}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </ScrollView>
  )
};

export default favorites

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 50,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  myFavoritesLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,  }
  ,
  itemImage: {
    width: 60,
    height: 60,
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
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  }
});