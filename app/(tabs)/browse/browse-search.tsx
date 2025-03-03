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
  const [initialResults, setInitialResults] = useState(
    JSON.parse(results as string)
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriceRange, setFilterPriceRange] = useState<string[]>(
    priceRange ? (priceRange as string).split(',') : []
  );
  const [filterMinRating, setFilterMinRating] = useState<number>(
    minRating ? Number(minRating) : 0
  );
  const [filterMaxDistance, setFilterMaxDistance] = useState<number>(
    maxDistance ? Number(maxDistance) : 10 // Default to 10 miles
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filteredResults, setFilteredResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      } else {
        // If no filters, use initial results
        setFilteredResults(initialResults);
      }
    };

    applyFilters();
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

    // Update URL params to reflect current filters
    router.setParams({
      query: query as string,
      results: results as string,
      priceRange: filterPriceRange.join(','),
      minRating: filterMinRating.toString(),
      maxDistance: filterMaxDistance.toString(),
    });
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
      if (!filteredResults.length) return;

      // Get all food item IDs
      const foodIds = filteredResults
        .filter((item: any) => item.id)
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
          <TopBar type='back' title='search' />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.searchTitle}>Results for "{query}"</Text>
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

        {showFilters && (
          <ScrollView style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceFilters}>
              {['$', '$$', '$$$', '$$$$'].map((price) => (
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
                  {price}
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
                onValueChange={(value: number | number[]) =>
                  setFilterMinRating(Array.isArray(value) ? value[0] : value)
                }
                minimumValue={0}
                maximumValue={5}
                step={0.5}
                trackClickable={true}
              />
              <View style={styles.starsContainer}>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Ionicons
                      key={i}
                      name={
                        i < Math.floor(filterMinRating)
                          ? 'star'
                          : i < filterMinRating
                          ? 'star-half'
                          : 'star-outline'
                      }
                      size={24}
                      color='#FFD700'
                    />
                  ))}
              </View>
            </View>

            <Text style={styles.filterSectionTitle}>
              Maximum Distance: {filterMaxDistance.toFixed(1)} miles
            </Text>
            <View style={styles.distanceSliderContainer}>
              <View style={styles.sliderLabels}>
                <Text>0</Text>
                <Text>50</Text>
              </View>
              <Slider
                value={filterMaxDistance}
                onValueChange={(value: number | number[]) =>
                  setFilterMaxDistance(Array.isArray(value) ? value[0] : value)
                }
                minimumValue={0.5}
                maximumValue={50}
                step={0.5}
                trackClickable={true}
              />
            </View>

            <View style={styles.filterButtonsContainer}>
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
                loading={loading}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </View>
          </ScrollView>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#65C5E3' />
            <Text style={styles.loadingText}>Filtering results...</Text>
          </View>
        ) : filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.resultItem}
                onPress={() => router.push(`/food/${item.id}`)}
              >
                {item.photos && item.photos.length > 0 && (
                  <Image
                    source={{ uri: item.photos[0] }}
                    style={styles.resultImage}
                  />
                )}
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>{item.food_name}</Text>
                  {item.restaurant_name && (
                    <Text style={styles.subtitle}>{item.restaurant_name}</Text>
                  )}
                  <View style={styles.detailsRow}>
                    {item.price_range && (
                      <Text style={styles.price}>{item.price_range}</Text>
                    )}
                    {ratingsMap[item.id] && (
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>
                          {ratingsMap[item.id].average.toFixed(1)}
                        </Text>
                        <Ionicons name='star' size={16} color='#FFD700' />
                        <Text style={styles.ratingCount}>
                          ({ratingsMap[item.id].count})
                        </Text>
                      </View>
                    )}
                    {userLocation && item.restaurant_distance && (
                      <Text style={styles.distance}>
                        {item.restaurant_distance.toFixed(1)} mi
                      </Text>
                    )}
                  </View>
                  {item.cuisine_type && (
                    <Text style={styles.subtitle}>
                      Cuisine:{' '}
                      {typeof item.cuisine_type === 'string'
                        ? item.cuisine_type
                        : Array.isArray(item.cuisine_type)
                        ? item.cuisine_type.join(', ')
                        : ''}
                    </Text>
                  )}
                  {item.dietary_tags && (
                    <Text style={styles.subtitle}>
                      Dietary:{' '}
                      {typeof item.dietary_tags === 'string'
                        ? item.dietary_tags
                        : Array.isArray(item.dietary_tags)
                        ? item.dietary_tags.join(', ')
                        : ''}
                    </Text>
                  )}
                </View>
              </Pressable>
            )}
          />
        ) : (
          <Text style={styles.noResultsText}>
            No results found matching your filters.
          </Text>
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
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  topBarContainer: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  filterButton: {
    borderRadius: 20,
    backgroundColor: '#65C5E3',
  },
  filtersContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  priceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  priceChip: {
    margin: 4,
    backgroundColor: '#fff',
  },
  selectedChip: {
    backgroundColor: '#65C5E3',
  },
  selectedChipText: {
    color: '#fff',
  },
  ratingSliderContainer: {
    marginBottom: 12,
  },
  distanceSliderContainer: {
    marginBottom: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#65C5E3',
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#65C5E3',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#65C5E3',
  },
});
