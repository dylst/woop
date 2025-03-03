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

export default function Browse() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const {
    selectedCuisines,
    selectedDietary,
    priceRange,
    minRating,
    maxDistance,
    removeCuisine,
    removeDietary,
    setPriceRange,
    setMinRating,
    setMaxDistance,
  } = useSearchFiltersStore();

  // Calculate if any filters are active
  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedDietary.length > 0 ||
    priceRange.length > 0 ||
    minRating > 0 ||
    maxDistance < 50;

  // Handle search submission
  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/browse/search-results',
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
    } else if (type === 'rating') {
      setMinRating(0);
    } else if (type === 'distance') {
      setMaxDistance(50);
    }
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
        >
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

          {minRating > 0 && (
            <FilterChip
              label={`${minRating.toFixed(1)}+ ⭐️`}
              onRemove={() => handleRemoveFilter('rating', '')}
            />
          )}

          {maxDistance < 50 && (
            <FilterChip
              label={`${maxDistance} miles max`}
              onRemove={() => handleRemoveFilter('distance', '')}
            />
          )}
        </ScrollView>
      )}

      <View style={styles.separator} />

      {/* Content area */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        {/* Add your content here */}
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
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 10,
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
    paddingBottom: 15,
  },
  separator: {
    height: 4,
    backgroundColor: '#89D5ED',
    width: '100%',
    opacity: 0.5,
    zIndex: 5,
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
});
