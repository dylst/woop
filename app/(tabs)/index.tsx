import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeaturedCard from '@/components/ui/FeaturedCard';
import FiltersHomeNav from '@/components/ui/FiltersHomeNav';
import TopBar from '@/components/ui/TopBar';
import { supabase } from '@/supabaseClient';
import { ActivityIndicator } from 'react-native-paper';


const filtersItems = [
  {
    id: '1',
    title: 'Cuisine',
    imageSource: require('@/assets/images/try_something_new_cuisine.png'),
  },
  {
    id: '2',
    title: 'Dietary',
    imageSource: require('@/assets/images/try_something_new_dietary.png'),
  }
]

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const shuffleFeaturedItems = <T,>(array: T[]): T[] => {
    const newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray;
  }

  const fetchFeaturedItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fooditem')
      .select(`
        id,
        food_name,
        restaurant_name,
        photos`);
    if (error) {
      console.error("Error fetching food items:", error);
    } else if (data) {
      const randomFive = shuffleFeaturedItems(data).slice(0, 5);
      setFeaturedItems(randomFive);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

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
            {featuredItems.map((item) => {
              const imageUrl = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : '';
              return (
                <FeaturedCard
                  key={item.id}
                  id={item.id}
                  photos={{ uri: imageUrl }}
                  foodName={item.food_name}
                  restaurantName={item.restaurant_name}
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
    fontWeight: 'bold',
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