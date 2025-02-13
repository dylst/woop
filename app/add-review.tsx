import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/supabaseClient'; // Make sure your Supabase client is imported
import { ThemedText } from '@/components/ThemedText';
import { Restaurant } from '@/types/restaurant.types';
import { useUser } from './context/UserContext';

//
// Helper function for rendering stars based on the average rating
function renderStars(average: number) {
  const stars = [];
  const floorVal = Math.floor(average);
  const decimal = average - floorVal;
  const hasHalf = decimal >= 0.5;

  for (let i = 0; i < floorVal && i < 5; i++) {
    stars.push(
      <Ionicons
        key={`full-${i}`}
        name="star"
        size={12}
        color="#ffd700"
        style={{ marginRight: 2 }}
      />
    );
  }
  if (hasHalf && floorVal < 5) {
    stars.push(
      <Ionicons
        key="half"
        name="star-half"
        size={12}
        color="#ffd700"
        style={{ marginRight: 2 }}
      />
    );
  }
  const noStars = floorVal + (hasHalf ? 1 : 0);
  for (let i = noStars; i < 5; i++) {
    stars.push(
      <Ionicons
        key={`empty-${i}`}
        name="star"
        size={12}
        color="#ccc"
        style={{ marginRight: 2 }}
      />
    );
  }
  return stars;
}

//
// Define your FavoriteItem and RatingInfo types (or import them)
type FavoriteItem = {
  profile_id: string;
  food_item_id: string;
  food_name?: string;
  photos?: string;
  restaurant_name?: string;
  price_range?: string;
  cuisine_type?: string[];
  dietary_tags?: string[];
  date_added?: string;
};

type RatingInfo = {
  average: number;
  count: number;
};

//
// Your main component
export default function BusinessReviewScreen() {
  // --- NEARBY BUSINESSES (from URL parameters) ---
  const { query: queryParam, results } = useLocalSearchParams();
  const initialQuery = Array.isArray(queryParam) ? queryParam[0] : queryParam;
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');

  let nearbyBusinesses: Restaurant[] = [];
  try {
    nearbyBusinesses = results ? JSON.parse(results as string) : [];
  } catch (error) {
    console.error('Error parsing nearby results:', error);
  }

  // --- SUGGESTED BUSINESSES (Favorites) States ---
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter tag states
  const [allCuisines, setAllCuisines] = useState<string[]>([]);
  const [allDietary, setAllDietary] = useState<string[]>([]);
  const [allPrices, setAllPrices] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  // Sorting
  type SortMode =
    | 'food_name_asc'
    | 'food_name_desc'
    | 'restaurant_name_asc'
    | 'restaurant_name_desc'
    | 'price_range_asc'
    | 'price_range_desc'
    | 'date_added_newest'
    | 'date_added_oldest';

  const [sortMode, setSortMode] = useState<SortMode>('date_added_newest');
  const [isSortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortButtonPosition, setSortButtonPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const screenWidth = Dimensions.get('window').width;

  // --- API Call: Fetch Favorites from Supabase ---
  // (Make sure you have your user ID; here we hardcode it as '10')

  const { user } = useUser();
  const userId = user?.id;

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite')
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
          date_added
        `)
        .eq('profile_id', userId)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }
      if (!data) return;

      // Flatten the returned data structure
      const flattened = data.map((fav: any) => ({
        profile_id: fav.profile_id,
        food_item_id: fav.food_item_id,
        food_name: fav.fooditem?.food_name || '',
        photos: fav.fooditem?.photos || '',
        restaurant_name: fav.fooditem?.restaurant_name || '',
        price_range: fav.fooditem?.price_range || '',
        cuisine_type: fav.fooditem?.cuisine_type || [],
        dietary_tags: fav.fooditem?.dietary_tags || [],
        date_added: fav.date_added || '',
      }));

      setFavorites(flattened);

      // Extract unique tags for filtering
      const cuisineSet = new Set<string>();
      const dietarySet = new Set<string>();
      const priceSet = new Set<string>();

      flattened.forEach((item: FavoriteItem) => {
        item.cuisine_type?.forEach((c: string) => cuisineSet.add(c));
        item.dietary_tags?.forEach((d: string) => dietarySet.add(d));
        if (item.price_range) {
          priceSet.add(item.price_range);
        }
      });

      setAllCuisines(Array.from(cuisineSet).sort());
      setAllDietary(Array.from(dietarySet).sort());
      setAllPrices(Array.from(priceSet).sort((a, b) => a.length - b.length));

      // Fetch ratings for the favorites
      const itemIds = flattened.map((f: { food_item_id: any; }) => f.food_item_id);
      fetchRatings(itemIds);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API Call: Fetch Ratings ---
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
      const { sum, count } = map[fid];
      finalMap[fid] = {
        average: count === 0 ? 0 : sum / count,
        count,
      };
    }
    setRatingMap(finalMap);
  };

  // Run the API call when the component mounts
  useEffect(() => {
    fetchFavorites();
  }, []);

  // --- Filtering Helper ---
  function hasOverlap(itemTags: string[] = [], selectedTags: string[] = []) {
    return itemTags.some((tag) => selectedTags.includes(tag));
  }

  // --- Filter and sort favorites ---
  const displayedFavorites = useMemo(() => {
    let filtered = [...favorites];
    const activeCuisine = selectedCuisines.length > 0;
    const activeDietary = selectedDietary.length > 0;
    const activePrice = selectedPrices.length > 0;

    if (activeCuisine || activeDietary || activePrice) {
      filtered = filtered.filter((item) => {
        return (
          (activeCuisine && hasOverlap(item.cuisine_type, selectedCuisines)) ||
          (activeDietary && hasOverlap(item.dietary_tags, selectedDietary)) ||
          (activePrice &&
            item.price_range &&
            selectedPrices.includes(item.price_range))
        );
      });
    }

    // Apply sorting based on sortMode
    if (sortMode === 'date_added_oldest') {
      filtered = filtered.sort(
        (a, b) =>
          new Date(a.date_added ?? '1970-01-01T00:00:00Z').getTime() -
          new Date(b.date_added ?? '1970-01-01T00:00:00Z').getTime()
      );
    } else if (sortMode === 'date_added_newest') {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.date_added ?? '1970-01-01T00:00:00Z').getTime() -
          new Date(a.date_added ?? '1970-01-01T00:00:00Z').getTime()
      );
    } else if (sortMode === 'food_name_asc') {
      filtered = filtered.sort((a, b) =>
        (a.food_name || '').localeCompare(b.food_name || '')
      );
    } else if (sortMode === 'food_name_desc') {
      filtered = filtered.sort((a, b) =>
        (b.food_name || '').localeCompare(a.food_name || '')
      );
    } else if (sortMode === 'restaurant_name_asc') {
      filtered = filtered.sort((a, b) =>
        (a.restaurant_name || '').localeCompare(b.restaurant_name || '')
      );
    } else if (sortMode === 'restaurant_name_desc') {
      filtered = filtered.sort((a, b) =>
        (b.restaurant_name || '').localeCompare(a.restaurant_name || '')
      );
    } else if (sortMode === 'price_range_asc') {
      filtered = filtered.sort(
        (a, b) =>
          (a.price_range?.length || 0) - (b.price_range?.length || 0)
      );
    } else if (sortMode === 'price_range_desc') {
      filtered = filtered.sort(
        (a, b) =>
          (b.price_range?.length || 0) - (a.price_range?.length || 0)
      );
    }
    return filtered;
  }, [favorites, selectedCuisines, selectedDietary, selectedPrices, sortMode]);

  // --- Tag toggling functions ---
  const toggleCuisine = (tag: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };
  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };
  const togglePrice = (tag: string) => {
    setSelectedPrices((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  // --- Navigation handlers ---
  const handlePressNearby = (restaurantId: number) => {
    router.push(`/food/${restaurantId}`);
  };

  const handlePressSuggested = (foodItemId: string) => {
    router.push(`/food/${foodItemId}`);
  };

  // --- Render functions for list items ---
  const renderNearbyItem = ({ item }: { item: Restaurant }) => (
    <Pressable
      style={styles.nearbyItem}
      onPress={() => handlePressNearby(item.id)}
    >
      <Text style={styles.restaurantName}>{item.restaurantName}</Text>
      <Text style={styles.cuisineType}>{item.cuisineType}</Text>
    </Pressable>
  );

  const renderSuggestedItem = ({ item }: { item: FavoriteItem }) => {
    const ratingInfo = ratingMap[item.food_item_id] || { average: 0, count: 0 };
    return (
      <Pressable
        style={styles.card}
        onPress={() => handlePressSuggested(item.food_item_id)}
      >
        <Image source={{ uri: item.photos }} style={styles.itemImage} />
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{item.food_name}</Text>
          <Text style={styles.itemComment}>{item.restaurant_name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingAverage}>
              {ratingInfo.average.toFixed(1)}
            </Text>
            {renderStars(ratingInfo.average)}
            <Text style={styles.ratingCount}>
              ({ratingInfo.count} ratings)
            </Text>
          </View>
          <View style={styles.itemTagContainer}>
            <Text style={styles.itemTagPrice}>{item.price_range}</Text>
            {item.cuisine_type && (
              <Text style={styles.itemTag}>
                {item.cuisine_type.join(' ')}
              </Text>
            )}
            {item.dietary_tags && (
              <Text style={styles.itemTag}>
                {item.dietary_tags.join(' ')}
              </Text>
            )}
          </View>
        </View>
        <Ionicons
          name="close-outline"
          size={28}
          onPress={() => {
            /* Optionally, implement remove action */
          }}
        />
      </Pressable>
    );
  };

  // --- Render a horizontal row of tags for filtering ---
  const renderTagRow = (
    data: string[],
    selected: string[],
    toggleFn: (val: string) => void
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {data.map((tag) => {
        const isActive = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            onPress={() => toggleFn(tag)}
            style={[styles.tag, isActive && styles.tagActive]}
          >
            <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // --- Sorting Helpers ---
  const sortOptions: { label: string; value: SortMode }[] = [
    { label: 'Date Added (Newest)', value: 'date_added_newest' },
    { label: 'Date Added (Oldest)', value: 'date_added_oldest' },
    { label: 'Food Name (A-Z)', value: 'food_name_asc' },
    { label: 'Food Name (Z-A)', value: 'food_name_desc' },
    { label: 'Restaurant Name (A-Z)', value: 'restaurant_name_asc' },
    { label: 'Restaurant Name (Z-A)', value: 'restaurant_name_desc' },
    { label: '$ Price Range (Low to High)', value: 'price_range_asc' },
    { label: '$ Price Range (High to Low)', value: 'price_range_desc' },
  ];

  const getSortIconName = () => {
    switch (sortMode) {
      case 'date_added_oldest':
      case 'food_name_asc':
      case 'restaurant_name_asc':
      case 'price_range_asc':
        return 'caret-up-circle-outline';
      case 'date_added_newest':
      case 'food_name_desc':
      case 'restaurant_name_desc':
      case 'price_range_desc':
        return 'caret-down-circle-outline';
      default:
        return 'caret-down-circle-outline';
    }
  };

  const getSortButtonText = () => {
    const currentOption = sortOptions.find(
      (option) => option.value === sortMode
    );
    return currentOption ? currentOption.label : 'Sort';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={() => router.back()}
          style={styles.closeIcon}
        />
        <ThemedText style={styles.title}>
          Nearby & Suggested Hot Foods Items
        </ThemedText>
        <Ionicons
          name="help"
          size={24}
          onPress={() => console.log('help')}
          style={styles.closeIcon}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Nearby Businesses Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Food Items</Text>
        <FlatList
          data={nearbyBusinesses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNearbyItem}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Suggested Businesses Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested Foods For You!</Text>
        {/* Render filter tags */}
        <View style={styles.tagBlock}>
          {allCuisines.length > 0 &&
            renderTagRow(allCuisines, selectedCuisines, toggleCuisine)}
          {allDietary.length > 0 &&
            renderTagRow(allDietary, selectedDietary, toggleDietary)}
          {allPrices.length > 0 &&
            renderTagRow(allPrices, selectedPrices, togglePrice)}
        </View>
        <Pressable
          style={styles.sortButton}
          onPress={() => setSortMenuVisible(true)}
          onLayout={(event) =>
            setSortButtonPosition(event.nativeEvent.layout)
          }
        >
          <Text style={styles.sortButtonText}>{getSortButtonText()}</Text>
          <Ionicons
            name={getSortIconName()}
            size={16}
            color="#000"
            style={{ marginLeft: 4 }}
          />
        </Pressable>
        {isSortMenuVisible && (
          <Pressable
            style={styles.dropdownOverlay}
            onPress={() => setSortMenuVisible(false)}
          >
            <Pressable
              style={[
                styles.sortMenu,
                {
                  top: sortButtonPosition.y + sortButtonPosition.height,
                  right:
                    Dimensions.get('window').width -
                    (sortButtonPosition.x + sortButtonPosition.width) +
                    10,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSortMode(option.value);
                    setSortMenuVisible(false);
                  }}
                  style={[
                    styles.sortOption,
                    index === sortOptions.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.sortOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        )}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" hidesWhenStopped />
        ) : (
          <FlatList
            data={displayedFavorites}
            keyExtractor={(item) => item.food_item_id.toString()}
            renderItem={renderSuggestedItem}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {/* Other Content */}
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeIcon: {
    // Customize icon styling if needed
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Dark title text
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nearbyItem: {
    marginRight: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cuisineType: {
    fontSize: 14,
    color: '#666',
  },
  tagBlock: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#008080',
    backgroundColor: '#e0f7f7',
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 4,
  },
  tagActive: {
    backgroundColor: '#008080',
  },
  tagText: {
    fontSize: 14,
    color: '#008080',
  },
  tagTextActive: {
    color: '#fff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
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
    borderColor: '#008080',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '60%',
  },
  sortOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#008080',
  },
  sortOptionText: {
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 5,
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
    color: '#555',
    fontSize: 14,
    marginRight: 3,
  },
  ratingCount: {
    marginLeft: 3,
    fontSize: 10,
    color: '#999',
  },
});
