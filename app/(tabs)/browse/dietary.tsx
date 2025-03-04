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

  // Create our dietary types data
  const dietaryTypes: DietaryType[] = [
    { id: 'glutenFree', name: 'Gluten Free' },
    { id: 'halal', name: 'Halal' },
    { id: 'vegan', name: 'Vegan' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'keto', name: 'Keto' },
    { id: 'dairyFree', name: 'Dairy Free' },
    { id: 'nutFree', name: 'Nut Free' },
    { id: 'organic', name: 'Organic' },
    { id: 'soyFree', name: 'Soy Free' },
    { id: 'sugarFree', name: 'Sugar Free' },
    { id: 'paleo', name: 'Paleo' },
    { id: 'pescatarian', name: 'Pescatarian' },
  ];

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
    const isSelected = selected.includes(item.id);

    return (
      <Pressable
        style={[
          styles.dietaryButton,
          isSelected && styles.selectedDietaryButton,
        ]}
        onPress={() => toggleDietary(item.id)}
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
      <TopBar type='back' title='Dietary Preferences' />

      <View style={styles.searchContainer}>
        <Ionicons name='search' size={20} color='#999' />
        <TextInput
          style={styles.searchInput}
          placeholder='Search dietary preferences'
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredDietary}
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
