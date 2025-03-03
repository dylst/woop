import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { searchFoodItems } from '@/app/api/search';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to search restaurants in Supabase
  const searchRestaurants = async (keyword: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurant')
        .select('*')
        .or(
          `name.ilike.%${keyword}%,city.ilike.%${keyword}%,state.ilike.%${keyword}%`
        );

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching restaurants:', err);
      return [];
    }
  };

  // Function to handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const [foodResults, restaurantResults] = await Promise.all([
        searchFoodItems(searchQuery),
        searchRestaurants(searchQuery),
      ]);

      // Combine results and push to search results screen
      const results = [...foodResults, ...restaurantResults];

      router.push({
        pathname: '/(tabs)/browse/browse-search',
        params: {
          query: searchQuery,
          results: JSON.stringify(results),
        },
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.searchContainer}>
      {loading ? (
        <ActivityIndicator size='small' color='#89D5ED' />
      ) : (
        <Ionicons name='search' size={20} color='#89D5ED' />
      )}
      <TextInput
        style={styles.searchInput}
        placeholder='Search food or restaurants...'
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        editable={!loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#c2effd',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: 'rgba(194,239,253,0.2)',
    padding: 10,
    borderRadius: 50,
    elevation: 2,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#2897ba',
  },
});

export default SearchBar;
