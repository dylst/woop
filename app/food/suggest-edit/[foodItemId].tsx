import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, HelperText, Chip, List } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Define the form data type for editing
type FormData = {
  foodName: string;
  cuisineType: string;
  dietaryTags: string[];
  priceRange: number;
  restaurantName: string;
  description: string;
};

const CUISINE_TYPES = [
  'American',
  'Italian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
  'Other',
];

const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Halal',
  'Kosher',
  'Pescatarian',
  'Keto',
  'Nut-Free',
];

export default function SuggestEditFoodItemForm() {
  const { foodItemId } = useLocalSearchParams();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      foodName: '',
      cuisineType: '',
      dietaryTags: [],
      priceRange: 1,
      restaurantName: '',
      description: '',
    },
  });
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase
        .from('fooditem')
        .select('*')
        .eq('id', foodItemId)
        .maybeSingle();
      if (error) {
        Alert.alert('Error fetching item');
        return;
      }
      if (data) {
        setValue('foodName', data.food_name);
        setValue(
          'cuisineType',
          (data.cuisine_type && data.cuisine_type[0]) || ''
        );
        setValue('dietaryTags', data.dietary_tags);
        const priceNumber = data.price_range ? data.price_range.length : 1;
        setValue('priceRange', priceNumber);
        setValue('restaurantName', data.restaurant_name);
        setValue('description', data.description);
        setSelectedDietaryTags(data.dietary_tags);
        setOriginalData({
          foodName: data.food_name,
          cuisineType: (data.cuisine_type && data.cuisine_type[0]) || '',
          dietaryTags: data.dietary_tags,
          priceRange: priceNumber,
          restaurantName: data.restaurant_name,
          description: data.description,
        });
      }
    }
    fetchItem();
  }, [foodItemId, setValue]);

  // Helper that returns purple if changed, darkteal otherwise
  const getActiveOutlineColor = (field: keyof FormData, currentValue: any) => {
    if (!originalData) return Colors.primary.darkteal;
    if (
      Array.isArray(currentValue) &&
      Array.isArray(originalData[field] as any)
    ) {
      return currentValue.join(',') !==
        (originalData[field] as string[]).join(',')
        ? Colors.primary.purple
        : Colors.primary.darkteal;
    } else {
      return currentValue !== originalData[field]
        ? Colors.primary.purple
        : Colors.primary.darkteal;
    }
  };

  const onSubmit = async (d: FormData) => {
    const priceRangeToSymbol = (price: number) => '$'.repeat(price);
    const { error } = await supabase
      .from('fooditem')
      .update({
        food_name: d.foodName,
        cuisine_type: [d.cuisineType],
        dietary_tags: d.dietaryTags,
        price_range: priceRangeToSymbol(d.priceRange),
        restaurant_name: d.restaurantName,
        description: d.description,
      })
      .eq('id', foodItemId);
    if (error) {
      Alert.alert('Error updating item', error.message);
    } else {
      setShowSuccessModal(true);
    }
  };

  const SuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType='fade'>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name='checkmark-circle'
              size={80}
              color={Colors.primary.darkteal}
            />
          </View>
          <ThemedText style={styles.modalTitle}>Woop!</ThemedText>
          <ThemedText style={styles.modalMessage}>
            Your submission has been successfully uploaded
          </ThemedText>
          <Button
            mode='contained'
            onPress={() => {
              setShowSuccessModal(false);
              router.push(`/food/${foodItemId}`);
            }}
            style={styles.modalButton}
          >
            Back to Food Item
          </Button>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <Ionicons
          name='arrow-back'
          size={24}
          onPress={() => router.back()}
          style={styles.closeIcon}
        />
        <ThemedText style={styles.title}>Suggest Edit</ThemedText>
        <Ionicons
          name='help'
          size={24}
          onPress={() => console.log('help')}
          style={styles.closeIcon}
        />
      </View>
      <ScrollView style={styles.container}>
        {/* Food Name */}
        <Controller
          control={control}
          rules={{ required: 'Food name is required' }}
          name='foodName'
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label='Food Item Name'
                onChangeText={onChange}
                value={value}
                style={styles.input}
                mode='outlined'
                activeOutlineColor={Colors.primary.darkteal}
              />
              {errors.foodName && (
                <HelperText type='error'>{errors.foodName.message}</HelperText>
              )}
            </View>
          )}
        />
        {/* Cuisine Type */}
        <Controller
          control={control}
          rules={{ required: 'Cuisine type is required' }}
          name='cuisineType'
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label='Cuisine Type'
                value={value}
                onFocus={() => setShowCuisineDropdown(true)}
                onBlur={() => setShowCuisineDropdown(false)}
                mode='outlined'
                activeOutlineColor={Colors.primary.darkteal}
              />
              {showCuisineDropdown && (
                <List.Section style={styles.dropdown}>
                  {CUISINE_TYPES.map((cuisine) => (
                    <List.Item
                      key={cuisine}
                      title={cuisine}
                      onPress={() => {
                        onChange(cuisine);
                        setShowCuisineDropdown(false);
                      }}
                    />
                  ))}
                </List.Section>
              )}
            </View>
          )}
        />
        {/* Dietary Tags */}
        <Controller
          control={control}
          name='dietaryTags'
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Dietary Tags</ThemedText>
              <View style={styles.chipContainer}>
                {DIETARY_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    selected={selectedDietaryTags.includes(tag)}
                    onPress={() => {
                      const newTags = selectedDietaryTags.includes(tag)
                        ? selectedDietaryTags.filter((t) => t !== tag)
                        : [...selectedDietaryTags, tag];
                      setSelectedDietaryTags(newTags);
                      onChange(newTags);
                    }}
                    style={styles.chip}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        />
        {/* Price Range */}
        <Controller
          control={control}
          name='priceRange'
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Price Range</ThemedText>
              <View style={styles.priceContainer}>
                {[1, 2, 3, 4].map((price) => (
                  <Button
                    key={price}
                    onPress={() => onChange(price)}
                    style={[
                      styles.priceButton,
                      value === price && styles.selectedPriceButton,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.priceText,
                        value === price && styles.selectedPriceText,
                      ]}
                    >
                      {'$'.repeat(price)}
                    </ThemedText>
                  </Button>
                ))}
              </View>
            </View>
          )}
        />
        {/* Restaurant Name */}
        <Controller
          control={control}
          name='restaurantName'
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label='Restaurant Name'
                onChangeText={onChange}
                value={value}
                style={styles.input}
                mode='outlined'
                activeOutlineColor={Colors.primary.darkteal}
              />
            </View>
          )}
        />
        {/* Description */}
        <Controller
          control={control}
          name='description'
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label='Description'
                onChangeText={onChange}
                value={value}
                style={styles.input}
                multiline
                numberOfLines={4}
                mode='outlined'
                activeOutlineColor={Colors.primary.darkteal}
              />
            </View>
          )}
        />
        <Button
          mode='contained'
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
        >
          Submit Edit
        </Button>
        <Button
          mode='outlined'
          onPress={() => setDeleteModalVisible(true)}
          style={styles.deleteButton}
          textColor='red'
        >
          Suggest Delete
        </Button>
        <Button
          mode='outlined'
          onPress={() => router.push(`/food/${foodItemId}`)}
          style={styles.cancelButton}
          textColor='gray'
        >
          Cancel
        </Button>
        <SuccessModal />
        <Modal visible={deleteModalVisible} transparent animationType='fade'>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.deleteModalTitle}>
                Suggest Delete
              </ThemedText>
              <TextInput
                label='Reason'
                placeholder='Food item is no longer available...'
                value={deleteReason}
                onChangeText={setDeleteReason}
                mode='outlined'
                activeOutlineColor='gray'
                style={[styles.deleteInput]}
              />
              <View style={styles.deleteButtonContainer}>
                <Button
                  mode='contained'
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setShowSuccessModal(true);
                  }}
                  style={[styles.deleteModalButton, { flex: 1 }]}
                >
                  Submit
                </Button>
                <Button
                  mode='outlined'
                  textColor='gray'
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeleteReason('');
                  }}
                  style={[styles.deleteModalCancelButton, { flex: 1 }]}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
  },
  closeIcon: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'black' },
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  inputContainer: { marginBottom: 16 },
  input: { backgroundColor: 'white' },
  label: { fontSize: 16, marginBottom: 8, color: 'black' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: 'white',
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 8, backgroundColor: Colors.primary.lightteal },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceButton: {
    flex: 1,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.darkteal,
    alignItems: 'center',
  },
  selectedPriceButton: {
    backgroundColor: Colors.primary.darkteal,
  },
  priceText: {
    color: Colors.primary.darkteal,
    fontSize: 16,
  },
  selectedPriceText: {
    color: 'white',
  },
  submitButton: { marginTop: 24, backgroundColor: Colors.primary.darkteal },
  deleteButton: { marginTop: 12, borderColor: 'red' },
  cancelButton: { marginTop: 12, borderColor: 'gray' },
  deleteModalButton: {
    borderColor: Colors.primary.darkteal,
    backgroundColor: Colors.primary.purple,
    marginRight: 5,
  },
  deleteModalCancelButton: {
    borderColor: 'gray',
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    width: '90%',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary.darkteal,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButton: {
    marginTop: 10,
    width: '100%',
    backgroundColor: Colors.primary.darkteal,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary.purple,
    textAlign: 'center',
  },
  deleteButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 5,
  },
  deleteInput: {
    height: 100,
    width: '100%',
    backgroundColor: 'white',
  },
});
