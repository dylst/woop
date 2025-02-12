import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, Image,
  Pressable, ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
import TopBar from '@/components/ui/TopBar';
import { Colors } from '@/constants/Colors';
import { ActivityIndicator } from 'react-native-paper';
import { useUser } from '../context/UserContext';

interface FavoriteItem {
  user_id: string;
  food_item_id: string;

  food_name?: string;
  photos?: string[];
  restaurant_name?: string;
  price_range?: string;
  cuisine_type?: string[];
  dietary_tags?: string[];
  date_added?: string;
}

// Sorting
type SortMode = 'food_name_asc' | 'food_name_desc' |
  'restaurant_name_asc' | 'restaurant_name_desc' |
  'price_range_asc' | 'price_range_desc' |
  'date_added_newest' | 'date_added_oldest';

// Filtering: unionize both arrays
function hasOverlap(itemTags: string[] = [], selectedTags: string[] = []) {
  return itemTags.some((tag) => selectedTags.includes(tag))
}

// Review
interface RatingInfo {
  average: number,
  count: number,
}

interface Review {
  food_item_id: string;
  rating: number,
}

function renderStars(average: number) {
  const stars = [];
  // Integer part
  const floorVal = Math.floor(average);
  // Decimal part
  const decimal = average - floorVal;
  // Half star
  const hasHalf = decimal >= 0.5

  // full star
  for (let i = 0; i < floorVal && i < 5; i++) {
    stars.push(<Ionicons key={`full-${i}`} name="star" size={12} color="#ffd700" style={{ marginRight: 2 }} />)
  }

  if (hasHalf && floorVal < 5) {
    stars.push(<Ionicons key="half" name="star-half" size={12} color="#ffd700" style={{ marginRight: 2 }} />)
  }

  const noStars = floorVal + (hasHalf ? 1 : 0);
  for (let i = noStars; i < 5; i++) {
    stars.push(<Ionicons key={`empty-${i}`} name="star" size={12} color="#ccc" style={{ marginRight: 2 }} />)
  }

  return stars;
}

const favorites = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { user } = useUser();

  console.log(user)

  //eventually you would do user.id
  
  // TEST_ID
  userId = '10';
  

  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ratingMap, setRatingMap] = useState<{ [key: string]: RatingInfo }>({});

  // track all unique cuisines/dietary for this user
  const [allCuisines, setAllCuisines] = useState<string[]>([]);
  const [allDietary, setAllDietary] = useState<string[]>([]);
  const [allPrices, setAllPrices] = useState<string[]>([]);

  // Filtering
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  // Sorting
  const [sortMode, setSortMode] = useState<SortMode>('date_added_newest');

  const [isSortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortButtonPosition, setSortButtonPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const screenWidth = Dimensions.get('window').width;

  const handlePress = (foodItemId: string) => {
    router.push(`/food/${foodItemId}`)
  };

  const sortOptions: { label: string; value: SortMode }[] = [
    { label: 'Date Added (Newest to Oldest)', value: 'date_added_newest' },
    { label: 'Date Added (Oldest to Newest)', value: 'date_added_oldest' },
    { label: 'Food Name (A-Z)', value: 'food_name_asc' },
    { label: 'Food Name (Z-A)', value: 'food_name_desc' },
    { label: 'Restaurant Name (A-Z)', value: 'restaurant_name_asc' },
    { label: 'Restaurant Name (Z-A)', value: 'restaurant_name_desc' },
    { label: '$ Price Range (Low to High)', value: 'price_range_asc' },
    { label: '$ Price Range (High to Low)', value: 'price_range_desc' },
  ]

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite')
        .select(`
        id,
        user_id,
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
        .eq('user_id', userId)
        .order('date_added', { ascending: false })

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      if (!data) return;

      const flattened = data.map((fav: any) => ({
        user_id: fav.user_id,
        food_item_id: fav.food_item_id,
        food_name: fav.fooditem?.food_name || '',
        photos: fav.fooditem?.photos || [],
        restaurant_name: fav.fooditem?.restaurant_name || '',
        price_range: fav.fooditem?.price_range || '',
        cuisine_type: fav.fooditem?.cuisine_type || [],
        dietary_tags: fav.fooditem?.dietary_tags || [],
        date_added: fav.date_added || '',
      }));

      setFavorites(flattened);

      const cuisineSet = new Set<string>();
      const dietarySet = new Set<string>();
      const priceSet = new Set<string>();

      flattened.forEach((item) => {
        item.cuisine_type?.forEach((c: string) => cuisineSet.add(c));
        item.dietary_tags?.forEach((d: string) => dietarySet.add(d));
        if (item.price_range) {
          priceSet.add(item.price_range);
        }
      })

      const uniqueCuisines = Array.from(cuisineSet).sort();
      const uniqueDietary = Array.from(dietarySet).sort();
      const uniquePrices = Array.from(priceSet).sort((a, b) => a.length - b.length);

      setAllCuisines(uniqueCuisines);
      setAllDietary(uniqueDietary);
      setAllPrices(uniquePrices);

      // fetch ratings
      const itemIds = flattened.map((f) => f.food_item_id);
      fetchRatings(itemIds);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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

    data.forEach((row) => {
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

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Remove item from both state and Supabase
  const handleRemoveItem = async (id: string) => {
    // Remove from Supabase
    const { error } = await supabase
      .from('favorite')
      .delete()
      .eq('food_item_id', id);

    if (error) {
      console.error(error);
      return;
    }
    // Remove from the local state (UI)
    setFavorites((prevFavorites) => prevFavorites.filter((item) => item.food_item_id !== id));
  };

  // Toggle filters
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
  }

  // filter list
  const displayedFavorites = useMemo(() => {
    let filtered = [...favorites];

    const activeCuisine = selectedCuisines.length > 0;
    const activeDietary = selectedDietary.length > 0;
    const activePrice = selectedPrices.length > 0;


    if (activeCuisine || activeDietary || activePrice) {
      filtered = favorites.filter((item) => {
        return (
          (activeCuisine && hasOverlap(item.cuisine_type, selectedCuisines)) ||
          (activeDietary && hasOverlap(item.dietary_tags, selectedDietary)) ||
          (activePrice && item.price_range && selectedPrices.includes(item.price_range))
        );
      })
    }

    if (sortMode === 'date_added_oldest') {
      filtered = filtered.sort((a, b) =>
        new Date(a.date_added ?? '1970-01-01T00:00:00Z').getTime() -
        new Date(b.date_added ?? '1970-01-01T00:00:00Z').getTime())
    } else if (sortMode === 'date_added_newest') {
      filtered = filtered.sort((a, b) =>
        new Date(b.date_added ?? '1970-01-01T00:00:00Z').getTime() -
        new Date(a.date_added ?? '1970-01-01T00:00:00Z').getTime())
    } else if (sortMode === 'food_name_asc') {
      filtered = filtered.sort((a, b) => (a.food_name || '').localeCompare(b.food_name || ''));
    } else if (sortMode === 'food_name_desc') {
      filtered = filtered.sort((a, b) => (b.food_name || '').localeCompare(a.food_name || ''));
    } else if (sortMode === 'restaurant_name_asc') {
      filtered = filtered.sort((a, b) => (a.restaurant_name || '').localeCompare(b.restaurant_name || ''))
    } else if (sortMode === 'restaurant_name_desc') {
      filtered = filtered.sort((a, b) => (b.restaurant_name || '').localeCompare(a.restaurant_name || ''))
    } else if (sortMode === 'price_range_asc') {
      filtered = filtered.sort((a, b) => (a.price_range?.length || 0) - (b.price_range?.length || 0));
    } else if (sortMode === 'price_range_desc') {
      filtered = filtered.sort((a, b) => (b.price_range?.length || 0) - (a.price_range?.length || 0));
    }

    return filtered;
  }, [favorites, selectedCuisines, selectedDietary, selectedPrices, sortMode]);

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    const cuisineText = item.cuisine_type?.join(' ');
    const dietaryText = item.dietary_tags?.join(' ');

    const ratingInfo = ratingMap[item.food_item_id];
    const average = ratingInfo?.average || 0;
    const count = ratingInfo?.count || 0;

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
          <View style={styles.ratingRow}>
            <Text style={styles.ratingAverage}>{average ? (average.toFixed(1)) : '0.0'}</Text>
            {renderStars(average)}
            <Text style={styles.ratingCount}>({count === 1 ? `1 rating` : `${count} ratings`})</Text>
          </View>
          <View style={styles.itemTagContainer}>
            <Text style={styles.itemTagPrice}>{item.price_range}</Text>

            {cuisineText ? (
              <Text style={styles.itemTag}>{cuisineText}</Text>
            ) : null
            }
            {dietaryText ? (
              <Text style={styles.itemTag}>{dietaryText}</Text>
            ) : null
            }
          </View>
        </View>
        <Ionicons
          name='close-outline'
          size={28}
          onPress={() => handleRemoveItem(item.food_item_id)}

        />
      </Pressable>
    );
  };

  const renderTagRow = (
    data: string[],
    selected: string[],
    toggleFn: (val: string) => void,
    iconType?: 'food' | 'diet' | 'price'
  ) => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.map((tag) => {
          const isActive = selected.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => toggleFn(tag)}
              style={[
                styles.tag,
                isActive && styles.tagActive,
              ]}
            >
              {iconType === 'food' && (
                <Ionicons
                  name="fast-food"
                  size={16}
                  color={isActive ? '#fcfcfc' : Colors.primary.lightteal}
                  style={isActive ? styles.tagIconActive : styles.tagIcon}
                />
              )}
              {iconType === 'diet' && (
                <Ionicons
                  name="leaf-outline"
                  size={16}
                  color={isActive ? '#fcfcfc' : Colors.primary.lightteal}
                  style={isActive ? styles.tagIconActive : styles.tagIcon}
                />
              )}
              {iconType === 'price' && (
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={isActive ? '#fcfcfc' : Colors.primary.lightteal}
                  style={isActive ? styles.tagIconActive : styles.tagIcon}
                />
              )}
              <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                {tag}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar type="back" title='favorites' />

      <Text style={styles.myFavoritesLabel}>My Favorites</Text>
      {favorites.length > 0 ?
        <>
          {allCuisines.length > 0 && (
            <View style={styles.tagBlock}>
              {renderTagRow(allCuisines, selectedCuisines, toggleCuisine, 'food')}
            </View>
          )}
          {allDietary.length > 0 && (
            <View style={styles.tagBlock}>
              {renderTagRow(allDietary, selectedDietary, toggleDietary, 'diet')}
            </View>
          )}
          {allPrices.length > 0 && (
            <View style={styles.tagBlock}>
              {renderTagRow(allPrices, selectedPrices, togglePrice, 'price')}
            </View>
          )}

          <Pressable
            style={styles.sortButton}
            onPress={() => setSortMenuVisible(true)}
            onLayout={(event) => {
              setSortButtonPosition(event.nativeEvent.layout);
            }}>
            <Text style={styles.sortButtonText}>{getSortButtonText()}</Text>
            <Ionicons
              name={getSortIconName()}
              size={16}
              color="#000"
              style={{ marginLeft: 4 }}
            />
          </Pressable>

          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" hidesWhenStopped={true} />
          ) : (
            <FlatList<FavoriteItem>
              data={displayedFavorites}
              keyExtractor={(item) => item.food_item_id.toString()}
              renderItem={renderItem}
              showsHorizontalScrollIndicator={false}
            />
          )
          }

          {isSortMenuVisible && (
            <Pressable
              style={styles.dropdownOverlay}
              onPress={() => setSortMenuVisible(false)}>
              <Pressable
                style={[
                  styles.sortMenu,
                  {
                    top: sortButtonPosition.y + sortButtonPosition.height,
                    right: screenWidth - (sortButtonPosition.x + sortButtonPosition.width) + 10,
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
                    style={[styles.sortOption,
                    index === sortOptions.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <Text style={styles.sortOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </Pressable>
            </Pressable>
          )}
        </> : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyWoops}>Woops!</Text>
            <Text style={styles.emptyText}>You haven't added any favorites!</Text>
          </View>
        )
      }
    </SafeAreaView>
  )
};

export default favorites

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 5,
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
  tagBlock: {
    paddingHorizontal: 20,
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
  }
});