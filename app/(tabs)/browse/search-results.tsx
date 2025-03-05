import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '@/components/ui/TopBar';
import { searchFoodItems } from '@/app/api/search';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';
import FilterChip from '@/components/ui/FilterChip';

interface FoodItem {
  id: string;
  food_name: string;
  restaurant_name: string;
  photos: string[];
  price_range: number;
  cuisine_type: string;
  dietary_tags: string[];
  description: string;
  rating?: number;
}

export default function SearchResults() {
  const router = useRouter();
  const { fromFilters } = useLocalSearchParams();
  const {
    selectedCuisines,
    selectedDietary,
    priceRange,
    maxDistance,
    removeCuisine,
    removeDietary,
    setPriceRange,
    setMaxDistance,
  } = useSearchFiltersStore();

  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  // Fetch results when screen loads or filters change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Combine search terms from cuisines and dietary for keyword search
        const searchTerms = [...selectedCuisines, ...selectedDietary].join(' ');

        // Use our enhanced searchFoodItems function with filters
        const filteredResults = await searchFoodItems(searchTerms, {
          priceRange: priceRange.length
            ? [priceRange[0], priceRange[1]]
            : undefined,
          maxDistance: maxDistance < 50 ? maxDistance : undefined,
          userLocation: userLocation
            ? {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }
            : undefined,
        });

        // Type assertion to ensure results match FoodItem interface
        setResults(filteredResults as FoodItem[]);
      } catch (error) {
        console.error('Error fetching filtered results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [
    selectedCuisines,
    selectedDietary,
    priceRange,
    maxDistance,
    userLocation,
  ]);

  // Handle removing a filter
  const handleRemoveFilter = (type: string, value: string) => {
    if (type === 'cuisine') {
      removeCuisine(value);
    } else if (type === 'dietary') {
      removeDietary(value);
    } else if (type === 'price') {
      setPriceRange([]);
    } else if (type === 'distance') {
      setMaxDistance(50);
    }
  };

  // Navigate to edit filters
  const goToFilters = () => {
    router.push('/browse/filters');
  };

  // Render a single food item
  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <Pressable
      style={styles.foodItem}
      onPress={() => router.push(`/food/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.photos && item.photos.length > 0
              ? item.photos[0]
              : 'https://via.placeholder.com/150',
        }}
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.food_name}</Text>
        <Text style={styles.restaurantName}>{item.restaurant_name}</Text>

        <View style={styles.detailsRow}>
          {item.price_range && (
            <Text style={styles.priceTag}>{'$'.repeat(item.price_range)}</Text>
          )}

          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name='star' size={16} color='#FFD700' />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar type='back' title='Search Results' />

      {/* Active Filters Section */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Active Filters:</Text>

        <View style={styles.filterChipsContainer}>
          {selectedCuisines.map((cuisine) => (
            <FilterChip
              key={`cuisine-${cuisine}`}
              label={cuisine}
              onRemove={() => handleRemoveFilter('cuisine', cuisine)}
            />
          ))}

          {selectedDietary.map((diet) => (
            <FilterChip
              key={`dietary-${diet}`}
              label={diet}
              onRemove={() => handleRemoveFilter('dietary', diet)}
            />
          ))}

          {priceRange.length > 0 && (
            <FilterChip
              label={`${'$'.repeat(priceRange[0])} - ${'$'.repeat(
                priceRange[1]
              )}`}
              onRemove={() => handleRemoveFilter('price', '')}
            />
          )}

          {maxDistance < 50 && (
            <FilterChip
              label={`Within ${maxDistance}km`}
              onRemove={() => handleRemoveFilter('distance', '')}
            />
          )}
        </View>

        <Pressable style={styles.editFiltersButton} onPress={goToFilters}>
          <Ionicons name='options-outline' size={16} color='#65C5E3' />
          <Text style={styles.editFiltersText}>Edit Filters</Text>
        </Pressable>
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#65C5E3' />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name='search-outline' size={60} color='#CCC' />
          <Text style={styles.noResultsText}>No results found</Text>
          <Text style={styles.noResultsSubText}>
            Try adjusting your filters
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  filtersContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  editFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 8,
  },
  editFiltersText: {
    color: '#65C5E3',
    marginLeft: 5,
    fontWeight: '500',
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
  listContainer: {
    padding: 15,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceTag: {
    fontSize: 14,
    color: '#65C5E3',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
    color: '#666',
    marginTop: 10,
  },
  noResultsSubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
});
