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
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chip, Button, Menu } from 'react-native-paper';
import { supabase } from '@/supabaseClient';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import {
  searchFoodItems,
  calculateDistance,
  SortMethod,
} from '@/app/api/search';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';

// Maps for cuisine and dietary display names
const cuisineDisplayNames: Record<string, string> = {
  american: 'American',
  chinese: 'Chinese',
  mexican: 'Mexican',
  italian: 'Italian',
  japanese: 'Japanese',
  thai: 'Thai',
  indian: 'Indian',
  korean: 'Korean',
  mediterranean: 'Mediterranean',
  greek: 'Greek',
  french: 'French',
  spanish: 'Spanish',
  vietnamese: 'Vietnamese',
  turkish: 'Turkish',
  lebanese: 'Lebanese',
  caribbean: 'Caribbean',
};

const dietaryDisplayNames: Record<string, string> = {
  glutenFree: 'Gluten Free',
  halal: 'Halal',
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  keto: 'Keto',
  dairyFree: 'Dairy Free',
  nutFree: 'Nut Free',
  organic: 'Organic',
  soyFree: 'Soy Free',
  sugarFree: 'Sugar Free',
  paleo: 'Paleo',
  pescatarian: 'Pescatarian',
};

// Sorting options display names
const sortMethodDisplayNames: Record<string, string> = {
  [SortMethod.BEST_MATCH]: 'Best Match',
  [SortMethod.HIGHEST_RATED]: 'Highest Rated',
  [SortMethod.MOST_REVIEWED]: 'Most Reviewed',
  [SortMethod.NEWEST]: 'Newest Reviews',
};

export default function BrowseSearch() {
  const { query, results } = useLocalSearchParams();
  const router = useRouter();

  // Access filters from store
  const {
    selectedCuisines,
    selectedDietary,
    priceRange,
    maxDistance,
    sortMethod,
    setSortMethod,
  } = useSearchFiltersStore();

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
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const performInitialSearch = async () => {
      if (query && initialResults.length === 0) {
        setLoading(true);
        try {
          const { results, hasMore } = await searchFoodItems(query as string, {
            sortBy: sortMethod,
          });
          setInitialResults(results);
          setFilteredResults(results);
          setHasMoreResults(hasMore);
          setCurrentPage(0);
        } catch (error) {
          console.error('Error performing initial search:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    performInitialSearch();
  }, [query, initialResults.length, sortMethod]);

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

  // Apply filters when they change or when initial results change
  useEffect(() => {
    const applyFilters = async () => {
      // Only apply filters if we have initial results and a query
      if (initialResults.length > 0 && query) {
        setLoading(true);
        try {
          // Check if any filters are active
          const hasActiveFilters =
            (priceRange && priceRange.length > 0) ||
            (maxDistance && maxDistance < 50) ||
            (selectedCuisines && selectedCuisines.length > 0) ||
            (selectedDietary && selectedDietary.length > 0);

          if (hasActiveFilters) {
            // Use the searchFoodItems function with filters from store
            const { results, hasMore } = await searchFoodItems(
              query as string,
              {
                priceRange: priceRange.length > 0 ? priceRange : undefined,
                maxDistance: maxDistance < 50 ? maxDistance : undefined,
                userLocation: userLocation || undefined,
                selectedCuisines:
                  selectedCuisines.length > 0 ? selectedCuisines : undefined,
                selectedDietary:
                  selectedDietary.length > 0 ? selectedDietary : undefined,
                sortBy: sortMethod,
              }
            );
            setFilteredResults(results);
            setHasMoreResults(hasMore);
            setCurrentPage(0); // Reset page when filters change
          } else {
            // Just apply sorting if no other filters
            const { results, hasMore } = await searchFoodItems(
              query as string,
              {
                sortBy: sortMethod,
              }
            );
            setFilteredResults(results);
            setHasMoreResults(hasMore);
            setCurrentPage(0);
          }
        } catch (error) {
          console.error('Error applying filters:', error);
          setFilteredResults(initialResults);
        } finally {
          setLoading(false);
        }
      }
    };

    // Only call applyFilters if we have a query
    if (query) {
      applyFilters();
    }
  }, [
    priceRange,
    maxDistance,
    selectedCuisines,
    selectedDietary,
    userLocation,
    initialResults,
    query,
    sortMethod,
  ]);

  const goToFilters = useCallback(() => {
    router.push('/browse/filters');
  }, [router]);

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

  const loadMoreResults = async () => {
    if (!hasMoreResults || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      // Create the filter object based on current filters
      const filterOptions = {
        priceRange: priceRange.length > 0 ? priceRange : undefined,
        maxDistance: maxDistance < 50 ? maxDistance : undefined,
        userLocation: userLocation || undefined,
        selectedCuisines:
          selectedCuisines.length > 0 ? selectedCuisines : undefined,
        selectedDietary:
          selectedDietary.length > 0 ? selectedDietary : undefined,
        sortBy: sortMethod,
      };

      // Call searchFoodItems with next page
      const { results, hasMore } = await searchFoodItems(
        query as string,
        filterOptions,
        false,
        nextPage,
        20 // pageSize
      );

      // Append new results to existing results
      setFilteredResults((prev) => [...prev, ...results]);
      // setInitialResults((prev) => [...prev, ...results]);
      setHasMoreResults(hasMore);
      setCurrentPage(nextPage);

      console.log(
        `Loaded page ${nextPage}, got ${results.length} more results. Has more: ${hasMore}`
      );
    } catch (error) {
      console.error('Error loading more results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handler for sort method change
  const handleSortMethodChange = (method: SortMethod) => {
    setSortMethod(method);
    setShowSortMenu(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedDietary.length > 0 ||
    priceRange.length > 0 ||
    maxDistance < 50;

  // Memoize the TopBar component to prevent re-renders
  const MemoizedTopBar = useMemo(() => {
    return (
      <View style={styles.topBarContainer}>
        <TopBar type='back' title='Search Results' />
      </View>
    );
  }, []); // Empty dependency array means this only renders once

  // Render active filters as horizontal scrollable chips
  const renderActiveFilters = useCallback(() => {
    if (!hasActiveFilters) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersChipContainer}
        style={styles.filtersChipScroll}
      >
        {selectedCuisines.map((cuisine) => (
          <Chip
            key={`cuisine-${cuisine}`}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            mode='flat'
          >
            {cuisineDisplayNames[cuisine] || cuisine}
          </Chip>
        ))}

        {selectedDietary.map((diet) => (
          <Chip
            key={`diet-${diet}`}
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            mode='flat'
          >
            {dietaryDisplayNames[diet] || diet}
          </Chip>
        ))}

        {priceRange.length > 0 && (
          <Chip
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            mode='flat'
          >
            {priceRange.length === 1
              ? `${'$'.repeat(priceRange[0])}`
              : `${'$'.repeat(Math.min(...priceRange))}-${'$'.repeat(
                  Math.max(...priceRange)
                )}`}
          </Chip>
        )}

        {maxDistance < 50 && (
          <Chip
            style={styles.filterChip}
            textStyle={styles.filterChipText}
            mode='flat'
          >
            {`${maxDistance} mi`}
          </Chip>
        )}

        <Pressable onPress={goToFilters} style={styles.editFiltersButton}>
          <Text style={styles.editFiltersText}>Edit Filters</Text>
        </Pressable>
      </ScrollView>
    );
  }, [
    selectedCuisines,
    selectedDietary,
    priceRange,
    maxDistance,
    hasActiveFilters,
    goToFilters,
  ]);

  // Memoize the search title to prevent re-renders
  const SearchTitle = useMemo(() => {
    return <Text style={styles.searchTitle}>Results for "{query || ''}"</Text>;
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {MemoizedTopBar}

        <View style={styles.headerContainer}>
          {SearchTitle}
          <View style={styles.actionsContainer}>
            <Menu
              visible={showSortMenu}
              onDismiss={() => setShowSortMenu(false)}
              anchor={
                <Button
                  mode='outlined'
                  onPress={() => setShowSortMenu(true)}
                  style={styles.sortButton}
                  labelStyle={styles.sortButtonLabel}
                  icon='sort'
                >
                  {sortMethodDisplayNames[sortMethod]}
                </Button>
              }
            >
              {Object.values(SortMethod).map((method) => (
                <Menu.Item
                  key={method}
                  onPress={() => handleSortMethodChange(method)}
                  title={sortMethodDisplayNames[method]}
                  titleStyle={
                    sortMethod === method ? styles.selectedSortItem : undefined
                  }
                />
              ))}
            </Menu>

            {!hasActiveFilters && (
              <Button
                mode='contained'
                onPress={goToFilters}
                style={styles.filterButton}
                icon='filter-variant'
                labelStyle={styles.filterButtonLabel}
              >
                Filters
              </Button>
            )}
          </View>
        </View>

        {/* Active Filters Display */}
        {renderActiveFilters()}

        <View style={styles.resultsWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#65C5E3' />
              <Text style={styles.loadingText}>Loading results...</Text>
            </View>
          ) : filteredResults.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name='search-outline' size={60} color='#CCC' />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.resultItem}
                  onPress={() => {
                    router.push({
                      pathname: '/food/[foodItemId]',
                      params: { foodItemId: item.id },
                    });
                  }}
                >
                  <Image
                    source={{
                      uri:
                        item.photos?.[0] || 'https://via.placeholder.com/100',
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
                        {'$'.repeat(item.price_range.length)}
                      </Text>
                    )}

                    {item.rankingScore !== undefined && (
                      <View style={styles.rankingScoreContainer}>
                        <Text style={styles.rankingScoreText}>
                          Match: {Math.round(item.rankingScore * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              )}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
              ListFooterComponent={
                <View style={styles.loadMoreContainer}>
                  {hasMoreResults ? (
                    <Pressable
                      style={styles.loadMoreButton}
                      onPress={loadMoreResults}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <ActivityIndicator size='small' color='#65C5E3' />
                      ) : (
                        <Text style={styles.loadMoreButtonText}>
                          Load More Results
                        </Text>
                      )}
                    </Pressable>
                  ) : filteredResults.length > 0 ? (
                    <Text style={styles.endOfResultsText}>End of results</Text>
                  ) : null}
                </View>
              }
            />
          )}
        </View>
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
    marginBottom: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
    height: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  filterButton: {
    backgroundColor: '#65C5E3',
    height: 32,
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterButtonLabel: {
    fontSize: 12,
    marginVertical: 0,
  },
  sortButton: {
    height: 32,
    justifyContent: 'center',
    borderColor: '#65C5E3',
  },
  sortButtonLabel: {
    fontSize: 12,
    color: '#65C5E3',
    marginVertical: 0,
  },
  selectedSortItem: {
    fontWeight: 'bold',
    color: '#65C5E3',
  },
  filtersChipContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersChipScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#EDF8FC',
    height: 34,
    borderRadius: 17,
  },
  filterChipText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  editFiltersButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 17,
    backgroundColor: '#65C5E3',
    justifyContent: 'center',
    alignItems: 'center',
    height: 34,
  },
  editFiltersText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  resultsWrapper: {
    flex: 1,
    marginTop: 2,
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
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderRadius: 8,
    marginBottom: 8,
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
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
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
    marginTop: 2,
  },
  rankingScoreContainer: {
    marginTop: 4,
  },
  rankingScoreText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 8,
  },
  loadMoreContainer: {
    marginVertical: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  loadMoreButton: {
    backgroundColor: '#EDF8FC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '60%',
    borderWidth: 1,
    borderColor: '#65C5E3',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadMoreButtonText: {
    fontWeight: '500',
    color: '#65C5E3',
    fontSize: 16,
  },
  endOfResultsText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
});
