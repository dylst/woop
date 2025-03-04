import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TopBar from '@/components/ui/TopBar';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';

// Define the data structure
interface CuisineType {
  id: string;
  name: string;
}

export default function Cuisine() {
  const router = useRouter();
  const { selectedCuisines, setCuisines } = useSearchFiltersStore();

  // Local state for UI
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedCuisines);
  const [hasChanges, setHasChanges] = useState(false);

  // Create our cuisine types data
  const cuisineTypes: CuisineType[] = [
    { id: 'american', name: 'American' },
    { id: 'chinese', name: 'Chinese' },
    { id: 'mexican', name: 'Mexican' },
    { id: 'italian', name: 'Italian' },
    { id: 'japanese', name: 'Japanese' },
    { id: 'thai', name: 'Thai' },
    { id: 'indian', name: 'Indian' },
    { id: 'korean', name: 'Korean' },
    { id: 'mediterranean', name: 'Mediterranean' },
    { id: 'greek', name: 'Greek' },
    { id: 'french', name: 'French' },
    { id: 'spanish', name: 'Spanish' },
    { id: 'vietnamese', name: 'Vietnamese' },
    { id: 'turkish', name: 'Turkish' },
    { id: 'lebanese', name: 'Lebanese' },
    { id: 'caribbean', name: 'Caribbean' },
  ];

  // Check if we have changes compared to the stored filters
  useEffect(() => {
    // Sort both arrays to ensure consistent comparison
    const sortedSelected = [...selected].sort();
    const sortedStored = [...selectedCuisines].sort();

    // Compare length and contents
    const isDifferent =
      sortedSelected.length !== sortedStored.length ||
      sortedSelected.some((item, index) => item !== sortedStored[index]);

    setHasChanges(isDifferent);
  }, [selected, selectedCuisines]);

  // Filter cuisine types based on search text
  const filteredCuisines = cuisineTypes.filter((cuisine) =>
    cuisine.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle selection/deselection of a cuisine
  const toggleCuisine = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Save selected cuisines to store
  const saveSelections = () => {
    setCuisines(selected);
    router.back();
  };

  // Render each cuisine item
  const renderCuisineItem = ({ item }: { item: CuisineType }) => {
    const isSelected = selected.includes(item.id);

    return (
      <Pressable
        style={[
          styles.cuisineButton,
          isSelected && styles.selectedCuisineButton,
        ]}
        onPress={() => toggleCuisine(item.id)}
      >
        <Text
          style={[
            styles.cuisineButtonText,
            isSelected && styles.selectedCuisineButtonText,
          ]}
        >
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons
            name='checkmark'
            size={18}
            color='#FFFFFF'
            style={styles.checkIcon}
          />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar type='back' title='Cuisines' />

      <View style={styles.searchContainer}>
        <Ionicons name='search' size={20} color='#999' />
        <TextInput
          style={styles.searchInput}
          placeholder='Search cuisines'
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredCuisines}
        renderItem={renderCuisineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
      />

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            !hasChanges && styles.disabledButton,
          ]}
          onPress={saveSelections}
          disabled={!hasChanges}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  cuisineButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedCuisineButton: {
    backgroundColor: '#65C5E3',
  },
  cuisineButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedCuisineButtonText: {
    color: 'white',
  },
  checkIcon: {
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#65C5E3',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
