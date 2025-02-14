import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { TextInput, Button, HelperText, Chip, List } from 'react-native-paper';
import { PhotoUploadScreen } from './PhotoUploadScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

type FormData = {
  foodName: string;
  cuisineType: string;
  dietaryTags: string[];
  priceRange: number;
  restaurantName: string;
  description: string;
  photos: string[];
  rating: number;
  reviewText: string;
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
// another test
export default function AddFoodItemForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      foodName: '',
      cuisineType: '',
      dietaryTags: [],
      priceRange: 1,
      restaurantName: '',
      description: '',
      photos: [],
      rating: 0,
      reviewText: '',
    },
  });
  const [showCuisineDropdown, setShowCuisineDropdown] = React.useState(false);
  const [selectedDietaryTags, setSelectedDietaryTags] = React.useState<
    string[]
  >([]);
  const [showPhotoUpload, setShowPhotoUpload] = React.useState(false);
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        alert('You must be logged in to submit a food item.');
        return;
      }

      const priceRangeToSymbol = (price: number) => '$'.repeat(price);

      // Upload photos
      const photoUrls = await Promise.all(
        photos.map(async (photoUri) => {
          const fileExt = photoUri.startsWith('data:')
            ? photoUri.match(/data:(.*?);/)?.[1]?.split('/')[1] || 'jpg'
            : photoUri.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

          let fileData;
          if (Platform.OS === 'web') {
            const response = await fetch(photoUri);
            fileData = await response.blob();
          } else {
            const base64 = await FileSystem.readAsStringAsync(photoUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            fileData = decode(base64);
          }

          const { error: uploadError } = await Promise.race([
            supabase.storage.from('food-images').upload(fileName, fileData, {
              contentType: `image/${fileExt}`,
              upsert: false,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Upload timeout')), 30000)
            ),
          ]);

          if (uploadError) throw uploadError;

          const { data: publicData } = supabase.storage
            .from('food-images')
            .getPublicUrl(fileName);
          return publicData.publicUrl;
        })
      );

      // Check if the food item exists using foodName and restaurantName
      const { data: existingFoodItems, error: fetchError } = await supabase
        .from('fooditem')
        .select('*')
        .eq('food_name', data.foodName)
        .eq('restaurant_name', data.restaurantName);
      if (fetchError) throw fetchError;

      let foodItemId;
      if (existingFoodItems && existingFoodItems.length > 0) {
        foodItemId = existingFoodItems[0].id;
      } else {
        const { data: newFoodItems, error: foodError } = await supabase
          .from('fooditem')
          .insert([
            {
              food_name: data.foodName,
              cuisine_type: [data.cuisineType],
              dietary_tags: data.dietaryTags,
              price_range: priceRangeToSymbol(data.priceRange),
              restaurant_name: data.restaurantName,
              description: data.description,
              photos: photoUrls,
            },
          ])
          .select();
        if (foodError || !newFoodItems || newFoodItems.length === 0)
          throw foodError;
        foodItemId = newFoodItems[0].id;
      }

      // Insert a new review for the food item
      const { error: reviewError } = await supabase.from('review').insert([
        {
          food_item_id: foodItemId,
          rating: data.rating,
          review_text: data.reviewText,
          review_date: new Date().toISOString(),
          profile_id: user.id,
        },
      ]);
      if (reviewError) throw reviewError;

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error)
        console.error('Error details:', error.message);
    }
  };

  const handlePhotosSelected = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    setValue('photos', newPhotos);
    setShowPhotoUpload(false);
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
            Your submission has been saved successfully
          </ThemedText>
          <Button
            mode='contained'
            onPress={() => {
              setShowSuccessModal(false);
              router.push('/(tabs)');
            }}
            style={styles.modalButton}
          >
            Back to Home
          </Button>
        </View>
      </View>
    </Modal>
  );

  return (
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
              error={!!errors.foodName}
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
              onPointerLeave={() => setShowCuisineDropdown(false)}
              mode='outlined'
              right={<TextInput.Icon icon='menu-down' />}
              activeOutlineColor={Colors.primary.darkteal}
              style={styles.input}
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
        render={({ field: { onChange } }) => (
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Dietary Tags</ThemedText>
            <View style={styles.chipContainer}>
              {DIETARY_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  selected={selectedDietaryTags.includes(tag)}
                  onPress={() => {
                    const newTags = selectedDietaryTags.includes(tag)
                      ? selectedDietaryTags.filter((t: string) => t !== tag)
                      : [...selectedDietaryTags, tag];
                    setSelectedDietaryTags(newTags);
                    onChange(newTags);
                  }}
                  style={styles.chip}
                  textStyle={{ textAlign: 'center', flex: 1 }}
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
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceButton,
                    value === price && styles.selectedPriceButton,
                  ]}
                  onPress={() => onChange(price)}
                >
                  <ThemedText
                    style={[
                      styles.priceText,
                      value === price && styles.selectedPriceText,
                    ]}
                  >
                    {'$'.repeat(price)}
                  </ThemedText>
                </TouchableOpacity>
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
          <TextInput
            label='Restaurant Name'
            onChangeText={onChange}
            value={value}
            style={styles.input}
            mode='outlined'
            activeOutlineColor={Colors.primary.darkteal}
          />
        )}
      />
      {/* Description */}
      <Controller
        control={control}
        name='description'
        render={({ field: { onChange, value } }) => (
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
        )}
      />
      {/* Rating */}
      <Controller
        control={control}
        name='rating'
        rules={{ required: 'Rating is required' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Rating</ThemedText>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onChange(star)}>
                  <Ionicons
                    name={star <= value ? 'star' : 'star-outline'}
                    size={24}
                    color='#FFD700'
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
      {/* Review Text */}
      <Controller
        control={control}
        name='reviewText'
        rules={{ required: 'Review text is required' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              label='Review Text'
              value={value}
              onChangeText={onChange}
              style={styles.input}
              multiline
              mode='outlined'
            />
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <Button
          mode='outlined'
          onPress={() => setShowPhotoUpload(true)}
          style={styles.photoButton}
          icon='camera'
          textColor={Colors.primary.darkteal}
        >
          Add Photos
        </Button>

        {/* Photo Preview Section */}
        {photos.length > 0 && (
          <ScrollView horizontal style={styles.photoPreviewContainer}>
            {photos.map((photo, index) => (
              <View key={photo} style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => {
                    const newPhotos = photos.filter((_, i) => i !== index);
                    setPhotos(newPhotos);
                    setValue('photos', newPhotos);
                  }}
                >
                  <MaterialIcons name='close' size={20} color='white' />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <Modal
          visible={showPhotoUpload}
          animationType='slide'
          presentationStyle='fullScreen'
        >
          <PhotoUploadScreen
            onClose={() => setShowPhotoUpload(false)}
            onSelectImages={handlePhotosSelected}
            maxImages={5}
            initialPhotos={photos}
          />
        </Modal>
      </View>
      <Button
        mode='contained'
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      >
        Done
      </Button>
      <SuccessModal />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: 'black',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
    backgroundColor: Colors.primary.lightteal,
    padding: 4,
    minWidth: 100,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: 'white',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: Colors.primary.darkteal,
  },
  photoButton: {
    borderColor: 'black',
    borderWidth: 1,
    color: 'black',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceButton: {
    flex: 1,
    padding: 12,
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
  photoPreviewContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  photoPreview: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary.darkteal,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButton: {
    backgroundColor: Colors.primary.darkteal,
    width: '100%',
    marginTop: 10,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
