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
    minRating,
    maxDistance,
    setPriceRange,
    setMinRating,
    setMaxDistance,
    resetFilters,
  } = useSearchFiltersStore();

  // Local state for UI interaction
  const [localPriceMin, setLocalPriceMin] = useState<number>(
    priceRange[0] || 1
  );
  const [localPriceMax, setLocalPriceMax] = useState<number>(
    priceRange[1] || 4
  );
  const [localRating, setLocalRating] = useState<number>(minRating);
  const [localDistance, setLocalDistance] = useState<number>(maxDistance);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);

  // Distance options
  const distanceOptions = [10, 20, 30, 40, 50];

  // Check if any changes have been made
  const hasChanges =
    localPriceMin !== (priceRange[0] || 1) ||
    localPriceMax !== (priceRange[1] || 4) ||
    localRating !== minRating ||
    localDistance !== maxDistance;

  // Apply filters and navigate back
  const applyFilters = () => {
    setPriceRange([localPriceMin, localPriceMax]);
    setMinRating(localRating);
    setMaxDistance(localDistance);
    router.back();
  };

  // Reset all filters to default values
  const handleResetFilters = () => {
    resetFilters();
    setLocalPriceMin(1);
    setLocalPriceMax(4);
    setLocalRating(0);
    setLocalDistance(50);
  };

  // Handle price button selection
  const handlePriceMinSelect = (price: number) => {
    if (price > localPriceMax) {
      setLocalPriceMax(price);
    }
    setLocalPriceMin(price);
  };

  const handlePriceMaxSelect = (price: number) => {
    if (price < localPriceMin) {
      setLocalPriceMin(price);
    }
    setLocalPriceMax(price);
  };

  // Handle rating selection
  const handleRatingSelect = (rating: number) => {
    setLocalRating(rating);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar type='back' title='Filters' />

      <ScrollView style={styles.scrollView}>
        {/* Category Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.categoryButtons}>
            <Pressable
              style={styles.categoryButton}
              onPress={() => router.push('/browse/cuisine')}
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

            <Pressable
              style={styles.categoryButton}
              onPress={() => router.push('/browse/map')}
            >
              <Ionicons name='map-outline' size={24} color='#333' />
              <Text style={styles.categoryButtonText}>View Map</Text>
            </Pressable>
          </View>
        </View>

        {/* Price Range Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Minimum Price</Text>
            <View style={styles.priceButtons}>
              {[1, 2, 3, 4].map((price) => (
                <Pressable
                  key={`min-${price}`}
                  style={[
                    styles.priceButton,
                    localPriceMin === price && styles.selectedPriceButton,
                  ]}
                  onPress={() => handlePriceMinSelect(price)}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      localPriceMin === price && styles.selectedPriceButtonText,
                    ]}
                  >
                    {'$'.repeat(price)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Maximum Price</Text>
            <View style={styles.priceButtons}>
              {[1, 2, 3, 4].map((price) => (
                <Pressable
                  key={`max-${price}`}
                  style={[
                    styles.priceButton,
                    localPriceMax === price && styles.selectedPriceButton,
                  ]}
                  onPress={() => handlePriceMaxSelect(price)}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      localPriceMax === price && styles.selectedPriceButtonText,
                    ]}
                  >
                    {'$'.repeat(price)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>

          <View style={styles.ratingButtons}>
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <Pressable
                key={`rating-${rating}`}
                style={[
                  styles.ratingButton,
                  localRating === rating && styles.selectedRatingButton,
                ]}
                onPress={() => handleRatingSelect(rating)}
              >
                <Text
                  style={[
                    styles.ratingButtonText,
                    localRating === rating && styles.selectedRatingButtonText,
                  ]}
                >
                  {rating === 0 ? 'Any' : `${rating}+`} {rating > 0 && '⭐'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Distance Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Distance</Text>

          <Pressable
            style={styles.dropdownButton}
            onPress={() => setDistanceModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {localDistance === 50 ? 'Any distance' : `${localDistance} miles`}
            </Text>
            <Ionicons name='chevron-down' size={20} color='#666' />
          </Pressable>

          {/* Distance Selection Modal */}
          <Modal
            animationType='slide'
            transparent={true}
            visible={distanceModalVisible}
            onRequestClose={() => setDistanceModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Maximum Distance</Text>

                <ScrollView style={styles.modalScrollView}>
                  <Pressable
                    style={styles.modalOption}
                    onPress={() => {
                      setLocalDistance(50);
                      setDistanceModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        localDistance === 50 && styles.selectedModalOptionText,
                      ]}
                    >
                      Any distance
                    </Text>
                    {localDistance === 50 && (
                      <Ionicons name='checkmark' size={20} color='#65C5E3' />
                    )}
                  </Pressable>

                  {distanceOptions.slice(0, -1).map((distance) => (
                    <Pressable
                      key={`distance-${distance}`}
                      style={styles.modalOption}
                      onPress={() => {
                        setLocalDistance(distance);
                        setDistanceModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          localDistance === distance &&
                            styles.selectedModalOptionText,
                        ]}
                      >
                        {distance} miles
                      </Text>
                      {localDistance === distance && (
                        <Ionicons name='checkmark' size={20} color='#65C5E3' />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable
                  style={styles.modalCancelButton}
                  onPress={() => setDistanceModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>

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
          <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  scrollView: {
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
    marginBottom: 15,
    color: '#333',
  },
  subSection: {
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#666',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  priceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
    color: '#666',
  },
  selectedPriceButtonText: {
    color: 'white',
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  ratingButton: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    margin: 5,
  },
  selectedRatingButton: {
    backgroundColor: '#65C5E3',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedRatingButtonText: {
    color: 'white',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalScrollView: {
    marginBottom: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalOptionText: {
    color: '#65C5E3',
    fontWeight: '500',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FA6E59',
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#65C5E3',
  },
  disabledButton: {
    backgroundColor: '#A8D4E5',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
