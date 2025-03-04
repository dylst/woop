import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '@/components/ui/TopBar';
import { useState, useEffect } from 'react';
import { Slider } from '@miblanchard/react-native-slider';
import { Chip, Button } from 'react-native-paper';
import { supabase } from '@/supabaseClient';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { searchFoodItems, calculateDistance } from '@/app/api/search';

export default function BrowseSearch() {
  const { query, results, priceRange, minRating, maxDistance } =
    useLocalSearchParams();

  // Safely parse initial results with error handling
  const [initialResults, setInitialResults] = useState<any[]>(() => {
    try {
      // Only parse if results is a valid string
      if (typeof results === 'string' && results.trim()) {
        return JSON.parse(results);
      }
      return []; // Default to empty array if results is not valid
    } catch (error) {
      console.error('Error parsing results:', error);
      return []; // Return empty array on parse error
    }
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filterPriceRange, setFilterPriceRange] = useState<string[]>(
    priceRange && typeof priceRange === 'string' ? priceRange.split(',') : []
  );
  const [filterMinRating, setFilterMinRating] = useState<number>(
    minRating && !isNaN(Number(minRating)) ? Number(minRating) : 0
  );
  const [filterMaxDistance, setFilterMaxDistance] = useState<number>(
    maxDistance && !isNaN(Number(maxDistance)) ? Number(maxDistance) : 10 // Default to 10 miles
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initial search if query exists but no results were passed
  useEffect(() => {
    const performInitialSearch = async () => {
      // Only run this effect if we have a query but no initialResults
      if (query && initialResults.length === 0) {
        setLoading(true);
        try {
          const searchResults = await searchFoodItems(query as string);
          setInitialResults(searchResults);
          setFilteredResults(searchResults);
        } catch (error) {
          console.error('Error performing initial search:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    performInitialSearch();
  }, [query, initialResults.length]);

  // Get user's location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const applyFilters = async () => {
      // Only apply filters if we have at least one filter active
      if (
        (filterPriceRange.length > 0 ||
          filterMinRating > 0 ||
          filterMaxDistance < 10) &&
        query
      ) {
        setLoading(true);
        try {
          // Use the searchFoodItems function with filters
          const filtered = await searchFoodItems(query as string, {
            priceRange:
              filterPriceRange.length > 0
                ? filterPriceRange.map(Number)
                : undefined,
            minRating: filterMinRating > 0 ? filterMinRating : undefined,
            maxDistance: filterMaxDistance > 0 ? filterMaxDistance : undefined,
            userLocation: userLocation || undefined,
          });

          setFilteredResults(filtered);
        } catch (error) {
          console.error('Error applying filters:', error);
          setFilteredResults(initialResults);
        } finally {
          setLoading(false);
        }
      } else if (initialResults.length > 0) {
        // If no filters but we have initial results, use them
        setFilteredResults(initialResults);
      }
    };

    // Only call applyFilters if we have a query
    if (query) {
      applyFilters();
    }
  }, [
    filterPriceRange,
    filterMinRating,
    filterMaxDistance,
    userLocation,
    query,
    initialResults,
  ]);

  const handleApplyFilters = () => {
    setShowFilters(false);

    // Only update URL params if we have results to filter
    if (query) {
      // Update URL params to reflect current filters
      router.setParams({
        query: query as string,
        priceRange: filterPriceRange.join(','),
        minRating: filterMinRating.toString(),
        maxDistance: filterMaxDistance.toString(),
      });
    }
  };

  const resetFilters = () => {
    setFilterPriceRange([]);
    setFilterMinRating(0);
    setFilterMaxDistance(10);
  };

  const togglePriceFilter = (price: string) => {
    if (filterPriceRange.includes(price)) {
      setFilterPriceRange(filterPriceRange.filter((p) => p !== price));
    } else {
      setFilterPriceRange([...filterPriceRange, price]);
    }
  };

  // Create a map to store ratings for display
  const [ratingsMap, setRatingsMap] = useState<{
    [key: string]: { average: number; count: number };
  }>({});

  // Fetch ratings for display
  useEffect(() => {
    const fetchRatings = async () => {
      if (!filteredResults || !filteredResults.length) return;

      // Get all food item IDs
      const foodIds = filteredResults
        .filter((item: any) => item && item.id)
        .map((item: any) => item.id);

      if (!foodIds.length) return;

      try {
        const { data, error } = await supabase
          .from('review')
          .select('food_item_id, rating')
          .in('food_item_id', foodIds);

        if (error) {
          console.error('Error fetching ratings for display:', error);
          return;
        }

        // Calculate average ratings
        const map: { [key: string]: { sum: number; count: number } } = {};
        data?.forEach((review) => {
          if (!map[review.food_item_id]) {
            map[review.food_item_id] = { sum: 0, count: 0 };
          }
          map[review.food_item_id].sum += review.rating;
          map[review.food_item_id].count += 1;
        });

        // Convert to averages
        const averagesMap: {
          [key: string]: { average: number; count: number };
        } = {};
        Object.keys(map).forEach((id) => {
          const { sum, count } = map[id];
          averagesMap[id] = {
            average: count > 0 ? sum / count : 0,
            count,
          };
        });

        setRatingsMap(averagesMap);
      } catch (error) {
        console.error('Error in ratings fetch:', error);
      }
    };

    fetchRatings();
  }, [filteredResults]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <TopBar type='back' title='Search Results' />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.searchTitle}>Results for "{query || ''}"</Text>
          <Button
            mode='contained'
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
            icon='filter-variant'
            loading={loading}
            disabled={loading}
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#65C5E3' />
            <Text style={styles.loadingText}>Loading results...</Text>
          </View>
        )}

        {!loading && filteredResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name='search-outline' size={48} color='#CCCCCC' />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your filters or search for something else
            </Text>
          </View>
        )}

        {showFilters && (
          <ScrollView style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceFilters}>
              {['1', '2', '3', '4'].map((price) => (
                <Chip
                  key={price}
                  selected={filterPriceRange.includes(price)}
                  onPress={() => togglePriceFilter(price)}
                  style={[
                    styles.priceChip,
                    filterPriceRange.includes(price) && styles.selectedChip,
                  ]}
                  textStyle={
                    filterPriceRange.includes(price)
                      ? styles.selectedChipText
                      : {}
                  }
                >
                  {'$'.repeat(Number(price))}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>
              Minimum Rating: {filterMinRating.toFixed(1)}
            </Text>
            <View style={styles.ratingSliderContainer}>
              <View style={styles.sliderLabels}>
                <Text>0</Text>
                <Text>5</Text>
              </View>
              <Slider
                value={filterMinRating}
                onValueChange={(values) =>
                  setFilterMinRating(Number(values[0]))
                }
                minimumValue={0}
                maximumValue={5}
                step={0.5}
                minimumTrackTintColor='#65C5E3'
                maximumTrackTintColor='#D3D3D3'
                thumbTintColor='#65C5E3'
              />
            </View>

            <Text style={styles.filterSectionTitle}>
              Maximum Distance: {filterMaxDistance} miles
            </Text>
            <View style={styles.distanceSliderContainer}>
              <View style={styles.sliderLabels}>
                <Text>1</Text>
                <Text>50</Text>
              </View>
              <Slider
                value={filterMaxDistance}
                onValueChange={(values) =>
                  setFilterMaxDistance(Number(values[0]))
                }
                minimumValue={1}
                maximumValue={50}
                step={1}
                minimumTrackTintColor='#65C5E3'
                maximumTrackTintColor='#D3D3D3'
                thumbTintColor='#65C5E3'
              />
            </View>

            <View style={styles.filterActions}>
              <Button
                mode='outlined'
                onPress={resetFilters}
                style={styles.resetButton}
              >
                Reset
              </Button>
              <Button
                mode='contained'
                onPress={handleApplyFilters}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
          </ScrollView>
        )}

        {!loading && filteredResults.length > 0 && (
          <FlatList
            data={filteredResults}
            keyExtractor={(item, index) => `${item?.id || 'item'}-${index}`}
            renderItem={({ item }) => (
              <Pressable
                style={styles.resultItem}
                onPress={() => {
                  if (item?.id) {
                    router.push(`/food/${item.id}`);
                  }
                }}
              >
                <Image
                  source={{
                    uri: item.photos?.[0] || 'https://via.placeholder.com/100',
                  }}
                  style={styles.foodImage}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.foodName}>{item.food_name}</Text>
                  <Text style={styles.restaurantName}>
                    {item.restaurant_name}
                  </Text>

                  {ratingsMap[item.id] && (
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>
                        {ratingsMap[item.id].average.toFixed(1)} ⭐
                        <Text style={styles.ratingCount}>
                          ({ratingsMap[item.id].count})
                        </Text>
                      </Text>
                    </View>
                  )}

                  {item.price_range && (
                    <Text style={styles.priceText}>
                      {'$'.repeat(item.price_range)}
                    </Text>
                  )}
                </View>
              </Pressable>
            )}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  topBarContainer: {
    width: '100%',
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  filterButton: {
    backgroundColor: '#65C5E3',
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  priceFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  priceChip: {
    marginHorizontal: 5,
  },
  selectedChip: {
    backgroundColor: '#65C5E3',
  },
  selectedChipText: {
    color: 'white',
  },
  ratingSliderContainer: {
    marginBottom: 20,
  },
  distanceSliderContainer: {
    marginBottom: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resetButton: {
    flex: 1,
    marginRight: 10,
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#65C5E3',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 10,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingCount: {
    fontSize: 12,
    color: '#777',
  },
  priceText: {
    fontSize: 14,
    color: '#65C5E3',
    fontWeight: '500',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    color: '#333',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});
