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
import { supabase } from '@/supabaseClient';

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

  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);

  // fetch cuisine tags from fooditem
  const fetchExistingTags = async () => {
    const { data, error } = await supabase
      .from('fooditem')
      .select('cuisine_type');

    if (error) {
      console.log("Error fetching cuisine tags from fooditem:", error);
      return;
    }

    // build set of existing tags
    const usedSet = new Set<string>();
    data.forEach((foodItem: any) => {
      if (Array.isArray(foodItem.cuisine_type)) {
        foodItem.cuisine_type.forEach((tag: string) => {
          usedSet.add(tag.toLowerCase());
        });
      }
    });

    // map to the CuisineType structure
    const mapped: CuisineType[] = Array.from(usedSet).map((tag) => ({
      id: tag,
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));;
    setCuisineTypes(mapped);
  }

  useEffect(() => {
    fetchExistingTags();
  }, [])

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
  const toggleCuisine = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      } else {
        return [...prev, name];
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
    const isSelected = selected.includes(item.name);

    return (
      <Pressable
        style={[
          styles.cuisineButton,
          isSelected && styles.selectedCuisineButton,
        ]}
        onPress={() => toggleCuisine(item.name)}
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
      <TopBar type='back' title='Cuisines' replaceRoute='/browse' />

      <FlatList
        data={cuisineTypes.filter((cuisine) => 
        cuisine.name.toLowerCase().includes(searchText.toLowerCase()))}
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
    marginBottom: 50,
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
