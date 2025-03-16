import { Image, ActivityIndicator } from 'react-native';
import TopBar from '@/components/ui/TopBar';
// Add this to your imports at the top
import { userRecommendationService } from '@/app/api/services/userRecommendationService';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';
import FilterChip from '@/components/ui/FilterChip';
import { searchFoodItems } from '@/app/api/search';
import { debounce } from '@/utils/debounce';

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

export default function Browse() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [predictiveResults, setPredictiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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

  // Calculate if any filters are active
  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedDietary.length > 0 ||
    priceRange.length > 0 ||
    maxDistance < 50;

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length >= 2) {
        setIsSearching(true);
        try {
          const {results} = await searchFoodItems(text, undefined, true);
          setPredictiveResults(results.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
          console.error('Error in predictive search:', error);
          setPredictiveResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPredictiveResults([]);
      }
    }, 300), // 300ms delay
    []
  );

  // Handle search text changes
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  // Clear predictive results when search is submitted
  const handleSearchSubmit = () => {
    userRecommendationService.trackSearch(searchText);
    setPredictiveResults([]);
    handleSearch();
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/browse/browse-search',
        params: { query: searchText },
      });
    }
  };

  // Handle selecting a predictive result
  const handleSelectPredictiveResult = (item: any) => {
    setSearchText(item.food_name);
    setPredictiveResults([]);
    router.push({
      pathname: '/browse/browse-search',
      params: { query: item.food_name },
    });
  };

  // Navigate to filters screen
  const goToFilters = () => {
    router.push('/browse/filters');
  };

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

  // Format price range for display
  const formatPriceRange = () => {
    if (priceRange.length === 0) return '';

    // If only one price point is selected
    if (priceRange.length === 1) {
      return `${'$'.repeat(priceRange[0])}`;
    }

    // Sort the price range
    const sortedPrices = [...priceRange].sort((a, b) => a - b);
    const min = sortedPrices[0];
    const max = sortedPrices[sortedPrices.length - 1];

    // If min and max are the same
    if (min === max) {
      return `${'$'.repeat(min)}`;
    }

    // Return the range
    return `${'$'.repeat(min)} - ${'$'.repeat(max)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Page Title */}
      <View style={styles.topBarContainer}>
        <TopBar type='home' title='Browse' />
      </View>

      {/* Search Bar and Predictive Results Container */}
      <View style={styles.searchAndResultsContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name='search' size={20} color='#999' />
          <TextInput
            style={styles.searchInput}
            placeholder='Search for food...'
            value={searchText}
            onChangeText={handleSearchTextChange}
            returnKeyType='search'
            onSubmitEditing={handleSearchSubmit}
            autoCapitalize='none'
          />
          <Pressable onPress={goToFilters} style={styles.filterButton}>
            <Ionicons
              name='options-outline'
              size={22}
              color={hasActiveFilters ? '#65C5E3' : '#666'}
            />
          </Pressable>
        </View>

        {/* Predictive Search Results */}
        {(predictiveResults.length > 0 || isSearching) && (
          <View style={styles.predictiveResultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='small' color='#65C5E3' />
              </View>
            ) : (
              predictiveResults.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.predictiveResultItem}
                  onPress={() => handleSelectPredictiveResult(item)}
                >
                  <View style={styles.predictiveResultContent}>
                    {item.photos && item.photos[0] ? (
                      <Image
                        source={{ uri: item.photos[0] }}
                        style={styles.predictiveResultImage}
                      />
                    ) : (
                      <View style={styles.predictiveResultImagePlaceholder}>
                        <Ionicons
                          name='fast-food-outline'
                          size={16}
                          color='#999'
                        />
                      </View>
                    )}
                    <View style={styles.predictiveResultTextContainer}>
                      <Text style={styles.predictiveFoodName}>
                        {item.food_name}
                      </Text>
                      <Text style={styles.predictiveRestaurantName}>
                        {item.restaurant_name}
                      </Text>
                    </View>
                    {item.price_range && (
                      <Text style={styles.predictivePriceText}>
                        {item.price_range}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>

      {/* Active Filters */}
      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
          style={[
            styles.filtersScroll,
            { marginTop: predictiveResults.length > 0 ? 60 : 0 },
          ]}
        >
          {selectedCuisines.map((cuisine) => (
            <FilterChip
              key={`cuisine-${cuisine}`}
              label={cuisineDisplayNames[cuisine] || cuisine}
              onRemove={() => handleRemoveFilter('cuisine', cuisine)}
            />
          ))}

          {selectedDietary.map((diet) => (
            <FilterChip
              key={`dietary-${diet}`}
              label={dietaryDisplayNames[diet] || diet}
              onRemove={() => handleRemoveFilter('dietary', diet)}
            />
          ))}

          {priceRange.length > 0 && (
            <FilterChip
              label={`Price: ${formatPriceRange()}`}
              onRemove={() => handleRemoveFilter('price', '')}
            />
          )}

          {maxDistance < 50 && (
            <FilterChip
              label={`Within ${maxDistance} mi`}
              onRemove={() => handleRemoveFilter('distance', '')}
            />
          )}
        </ScrollView>
      )}

      <View style={styles.separator} />

      {/* Content area */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>

        <View style={styles.categoryButtonsContainer}>
          <Pressable
            style={styles.categoryButton}
            onPress={() => router.push('/browse/cuisine')}
          >
            <Ionicons name='restaurant-outline' size={24} color='#333' />
            <Text style={styles.categoryButtonText}>Cuisines</Text>
            {selectedCuisines.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{selectedCuisines.length}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.categoryButton}
            onPress={() => router.push('/browse/dietary')}
          >
            <Ionicons name='nutrition-outline' size={24} color='#333' />
            <Text style={styles.categoryButtonText}>Dietary</Text>
            {selectedDietary.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{selectedDietary.length}</Text>
              </View>
            )}
          </Pressable>

          <Pressable style={styles.categoryButton} onPress={goToFilters}>
            <Ionicons name='options-outline' size={24} color='#333' />
            <Text style={styles.categoryButtonText}>All Filters</Text>
            {hasActiveFilters && (
              <View style={styles.badgeContainer}>
                <Ionicons name='checkmark' size={12} color='white' />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topBarContainer: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    marginBottom: 10,
  },
  searchAndResultsContainer: {
    position: 'relative',
    width: '100%',
    zIndex: 110,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(194,239,253,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 10,
    borderColor: '#c2effd',
    borderStyle: 'solid',
    borderWidth: 1,
    zIndex: 110,
    width: '95%',
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    padding: 8,
    marginLeft: 5,
  },
  filtersScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 0,
    zIndex: 90, // Ensure below search bar but above other content
  },
  filtersScroll: {
    flexGrow: 0,
    marginBottom: 10,
    zIndex: 0, // Ensure below predictive results
  },
  separator: {
    height: 4,
    backgroundColor: '#89D5ED',
    width: '100%',
    opacity: 0.5,
    zIndex: 5,
    marginTop: -4,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 5,
    position: 'relative',
  },
  categoryButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  badgeContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FA6E59',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  predictiveResultsContainer: {
    position: 'absolute',
    top: '100%', // Position right below the search container
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
    maxHeight: 300,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 5, // Add some space between search bar and results
  },
  predictiveResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  predictiveResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictiveResultImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  predictiveResultImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictiveResultTextContainer: {
    flex: 1,
  },
  predictiveFoodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  predictiveRestaurantName: {
    fontSize: 12,
    color: '#666',
  },
  predictivePriceText: {
    fontSize: 12,
    color: '#65C5E3',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
