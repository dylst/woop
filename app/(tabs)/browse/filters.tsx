import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSearchFiltersStore } from '@/store/searchFiltersStore';
import TopBar from '@/components/ui/TopBar';

export default function Filters() {
  const router = useRouter();
  const {
    selectedCuisines,
    selectedDietary,
    priceRange,
    maxDistance,
    setPriceRange,
    setMaxDistance,
    resetFilters,
  } = useSearchFiltersStore();

  // Local state for UI interaction
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [localDistance, setLocalDistance] = useState<number>(50);

  // Initialize local state from store when component mounts
  useEffect(() => {
    setSelectedPrices(priceRange);
    setLocalDistance(maxDistance);
  }, [priceRange, maxDistance]);

  // Distance options
  const distanceOptions = [10, 20, 30, 40, 50];

  // Check if any changes have been made
  const hasChanges =
    !arraysEqual(selectedPrices, priceRange) || localDistance !== maxDistance;

  // Helper function to compare arrays
  function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((val, idx) => val === sortedB[idx]);
  }

  // Apply filters and navigate back
  const applyFilters = () => {
    saveFilters();
    router.back();
  };

  // Save filters without navigating
  const saveFilters = () => {
    // Save to store
    setPriceRange(selectedPrices);
    setMaxDistance(localDistance);
  };

  // Reset all filters to default values
  const handleResetFilters = () => {
    resetFilters();
    setSelectedPrices([]);
    setLocalDistance(50);
  };

  // Handle toggling price range selection
  const togglePriceSelection = (price: number) => {
    setSelectedPrices((prev) => {
      if (prev.includes(price)) {
        return prev.filter((p) => p !== price);
      } else {
        return [...prev, price];
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar type='back' title='Filters' />

      <ScrollView style={styles.scrollContainer}>
        {/* Category Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.categoryButtons}>
            <Pressable
              style={styles.categoryButton}
              onPress={() => {
                // Save current filters before navigating
                saveFilters();
                router.push('/browse/cuisine');
              }}
            >
              <Ionicons name='restaurant-outline' size={24} color='#333' />
              <Text style={styles.categoryButtonText}>Cuisines</Text>
              {selectedCuisines.length > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {selectedCuisines.length}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.categoryButton}
              onPress={() => {
                // Save current filters before navigating
                saveFilters();
                router.push('/browse/dietary');
              }}
            >
              <Ionicons name='nutrition-outline' size={24} color='#333' />
              <Text style={styles.categoryButtonText}>Dietary</Text>
              {selectedDietary.length > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{selectedDietary.length}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.categoryButton}
              onPress={() => {
                // Save current filters before navigating
                saveFilters();
                router.push('/browse/map');
              }}
            >
              <Ionicons name='map-outline' size={24} color='#333' />
              <Text style={styles.categoryButtonText}>View Map</Text>
            </Pressable>
          </View>
        </View>

        {/* Price Range Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <Text style={styles.sectionSubtitle}>
            Select one or more price points
          </Text>

          <View style={styles.priceButtons}>
            {[1, 2, 3, 4].map((price) => (
              <Pressable
                key={`price-${price}`}
                style={[
                  styles.priceButton,
                  selectedPrices.includes(price) && styles.selectedPriceButton,
                ]}
                onPress={() => togglePriceSelection(price)}
              >
                <Text
                  style={[
                    styles.priceButtonText,
                    selectedPrices.includes(price) &&
                      styles.selectedPriceButtonText,
                  ]}
                >
                  {'$'.repeat(price)}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedPrices.length > 0 && (
            <Text style={styles.selectionInfo}>
              {selectedPrices.length === 1
                ? `Selected: ${'$'.repeat(selectedPrices[0])}`
                : `Range: ${'$'.repeat(
                    Math.min(...selectedPrices)
                  )} - ${'$'.repeat(Math.max(...selectedPrices))}`}
            </Text>
          )}
        </View>

        {/* Distance Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Distance</Text>

          <View style={styles.distanceButtons}>
            {distanceOptions.map((distance) => (
              <Pressable
                key={`distance-${distance}`}
                style={[
                  styles.distanceButton,
                  localDistance === distance && styles.selectedDistanceButton,
                ]}
                onPress={() => setLocalDistance(distance)}
              >
                <Text
                  style={[
                    styles.distanceButtonText,
                    localDistance === distance &&
                      styles.selectedDistanceButtonText,
                  ]}
                >
                  {distance === 50 ? 'Any' : `${distance} mi`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.resetButton} onPress={handleResetFilters}>
            <Text style={styles.resetButtonText}>Reset All</Text>
          </Pressable>

          <Pressable
            style={[styles.applyButton, !hasChanges && styles.disabledButton]}
            onPress={applyFilters}
            disabled={!hasChanges}
          >
            <Text style={styles.applyButtonText}>Save Filters</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  priceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedPriceButton: {
    backgroundColor: '#65C5E3',
  },
  priceButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedPriceButtonText: {
    color: 'white',
  },
  selectionInfo: {
    marginTop: 15,
    textAlign: 'center',
    color: '#555',
    fontStyle: 'italic',
  },
  distanceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  distanceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedDistanceButton: {
    backgroundColor: '#65C5E3',
  },
  distanceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedDistanceButtonText: {
    color: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 15,
  },
  resetButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  applyButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#65C5E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
