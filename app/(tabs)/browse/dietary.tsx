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
interface DietaryType {
  id: string;
  name: string;
}

export default function Dietary() {
  const router = useRouter();
  const { selectedDietary, setDietary } = useSearchFiltersStore();

  // Local state for UI
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedDietary);
  const [hasChanges, setHasChanges] = useState(false);

  const [dietaryTypes, setDietaryTypes] = useState<DietaryType[]>([]);

  // fetch cuisine tags from fooditem
    const fetchExistingTags = async () => {
      const { data, error } = await supabase
        .from('fooditem')
        .select('dietary_tags');
  
      if (error) {
        console.log("Error fetching dietary tags from fooditem:", error);
        return;
      }
  
      // build set of existing tags
      const usedSet = new Set<string>();
      data.forEach((foodItem: any) => {
        if (Array.isArray(foodItem.dietary_tags)) {
          foodItem.dietary_tags.forEach((tag: string) => {
            usedSet.add(tag.toLowerCase());
          });
        }
      });
  
      // map to the DietaryType structure
      const mapped: DietaryType[] = Array.from(usedSet).map((tag) => ({
        id: tag,
        name: tag.charAt(0).toUpperCase() + tag.slice(1),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));;
      setDietaryTypes(mapped);
    }
  
    useEffect(() => {
      fetchExistingTags();
    }, [])

  // Check if we have changes compared to the stored filters
  useEffect(() => {
    // Sort both arrays to ensure consistent comparison
    const sortedSelected = [...selected].sort();
    const sortedStored = [...selectedDietary].sort();

    // Compare length and contents
    const isDifferent =
      sortedSelected.length !== sortedStored.length ||
      sortedSelected.some((item, index) => item !== sortedStored[index]);

    setHasChanges(isDifferent);
  }, [selected, selectedDietary]);

  // Filter dietary types based on search text
  const filteredDietary = dietaryTypes.filter((dietary) =>
    dietary.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle selection/deselection of a dietary restriction
  const toggleDietary = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Save selected dietary restrictions to store
  const saveSelections = () => {
    setDietary(selected);
    router.back();
  };

  // Render each dietary item
  const renderDietaryItem = ({ item }: { item: DietaryType }) => {
    const isSelected = selected.includes(item.name);

    return (
      <Pressable
        style={[
          styles.dietaryButton,
          isSelected && styles.selectedDietaryButton,
        ]}
        onPress={() => toggleDietary(item.name)}
      >
        <Text
          style={[
            styles.dietaryButtonText,
            isSelected && styles.selectedDietaryButtonText,
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
      <TopBar type='back' title='Dietary' replaceRoute='/browse'/>

      <FlatList
        data={dietaryTypes.filter((dietary) =>
        dietary.name.toLowerCase().includes(searchText.toLowerCase()))}
        renderItem={renderDietaryItem}
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
  dietaryButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedDietaryButton: {
    backgroundColor: '#65C5E3',
  },
  dietaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedDietaryButtonText: {
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
