import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl
} from 'react-native';
import FeaturedCard from '@/components/ui/FeaturedCard';
import FiltersHomeNav from '@/components/ui/FiltersHomeNav';
import TopBar from '@/components/ui/TopBar';
import { supabase } from '@/supabaseClient';
import { ActivityIndicator } from 'react-native-paper';
import { fetchRatings, RatingInfo } from '@/hooks/fetchHelper';
import { Route } from 'expo-router';


const filtersItems = [
  {
    id: '1',
    title: 'Cuisine',
    imageSource: require('@/assets/images/try_something_new_cuisine.png'),
    routePath: '/browse/cuisine' as Route,
  },
  {
    id: '2',
    title: 'Dietary',
    imageSource: require('@/assets/images/try_something_new_dietary.png'),
    routePath: '/browse/dietary' as Route,
  }
]

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Randomized featured items with random food items from database
  // const shuffleFeaturedItems = <T,>(array: T[]): T[] => {
  //   const newArray = array.slice();
  //   for (let i = newArray.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  //   }
  //   return newArray;
  // }

  const fetchFeaturedItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('featured_items')
      .select(`
        food_item_id,
        food_name,
        restaurant_name,
        average_rating,
        review_count,
        fooditem:food_item_id (photos)`)
      .order('average_rating', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching food items:", error);
    } else if (data) {
      // const randomFive = shuffleFeaturedItems(data).slice(0, 5); // shuffle the featured items
      setFeaturedItems(data);
    }
    setLoading(false);
  };

  // const fetchRatings = async (itemIds: string[]) => {
  //   if (itemIds.length === 0) return;
  //   setLoading(true);

  //   try {
  //     const { data, error } = await supabase
  //       .from('review')
  //       .select('food_item_id, rating')
  //       .in('food_item_id', itemIds);

  //     if (error) {
  //       console.error('Error fetching ratings:', error);
  //       return;
  //     }
  //     if (!data) return;

  //     const map: { [key: string]: { sum: number, count: number } } = {};

  //     data.forEach((row) => {
  //       if (!map[row.food_item_id]) {
  //         map[row.food_item_id] = { sum: 0, count: 0 };
  //       }
  //       map[row.food_item_id].sum += row.rating;
  //       map[row.food_item_id].count += 1;
  //     });

  //     const finalMap: { [key: string]: RatingInfo } = {};
  //     for (const fid in map) {
  //       const sum = map[fid].sum;
  //       const count = map[fid].count;
  //       finalMap[fid] = {
  //         average: count === 0 ? 0 : sum / count,
  //         count,
  //       };
  //     }

  //     setRatingMap(finalMap);

  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const loadRatings = async (itemIds: string[]) => {
    try {
      const ratings = await fetchRatings(itemIds);
      setRatingMap(ratings);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  useEffect(() => {
    if (featuredItems.length > 0) {
      const itemIds = featuredItems
        .map((item) => item.id)
        .filter((id) => id !== undefined && id !== null);
      if (itemIds.length > 0) {
        loadRatings(itemIds);
      }
    }
  }, [featuredItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeaturedItems().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }
  return (

    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {/* Top Bar */}
        <TopBar type="home" />



        {/* Best in Town Section */}
        <Text style={styles.sectionTitle}>Best in Town!</Text>

        <View style={styles.newSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollViewPadding}>
            {featuredItems.map((item, index) => {
              const imageUrl = item.fooditem?.photos?.[0] ?? '';
              const round = ratingMap?.[item.food_item_id]?.average?.toFixed(1)??""
              return (
                <FeaturedCard
                  key={item.food_item_id}
                  id={item.food_item_id}
                  photos={{ uri: imageUrl }}
                  foodName={item.food_name}
                  restaurantName={item.restaurant_name}
                  rating={round}
                  style={styles.shadowProp}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Try Something New Section */}
        <Text style={styles.sectionTitle}>Try something new!</Text>

        <View style={styles.browseSection}>
          {filtersItems.map((item) => (
            <FiltersHomeNav
              key={item.id}
              imageSource={item.imageSource}
              title={item.title}
              routePath={item.routePath}
              style={styles.shadowProp}
            />
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewPadding: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  newSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  browseSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  }
});

export default HomePage;