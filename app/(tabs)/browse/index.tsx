import { Image } from 'react-native';
import TopBar from '@/components/ui/TopBar';
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
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';
import FilterChip from '@/components/ui/FilterChip';

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

  // Handle search submission
  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/browse/browse-search',
        params: { query: searchText },
      });
    }
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name='search' size={20} color='#999' />
        <TextInput
          style={styles.searchInput}
          placeholder='Search for food...'
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType='search'
          onSubmitEditing={handleSearch}
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

      {/* Active Filters */}
      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
          style={styles.filtersScroll}
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
  },
  filtersScroll: {
    flexGrow: 0,
    marginBottom: 10,
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
});
