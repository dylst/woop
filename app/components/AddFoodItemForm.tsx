import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { TextInput, Button, HelperText, Chip, List } from 'react-native-paper';
import { PhotoUploadScreen } from './PhotoUploadScreen';
import { MaterialIcons } from '@expo/vector-icons';

type FormData = {
  foodName: string;
  cuisineType: string;
  dietaryTags: string[];
  priceRange: number;
  restaurantName: string;
  description: string;
  photos: string[];
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
    },
  });
  const [showCuisineDropdown, setShowCuisineDropdown] = React.useState(false);
  const [selectedDietaryTags, setSelectedDietaryTags] = React.useState<
    string[]
  >([]);
  const [showPhotoUpload, setShowPhotoUpload] = React.useState(false);
  const [photos, setPhotos] = React.useState<string[]>([]);

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  const handlePhotosSelected = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    setValue('photos', newPhotos);
    setShowPhotoUpload(false);
  };

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
      <View style={styles.inputContainer}>
        <Button
          mode='outlined'
          onPress={() => setShowPhotoUpload(true)}
          style={styles.photoButton}
          icon='camera'
          textColor={Colors.primary.darkteal}
          // iconColor={Colors.primary.darkteal}
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
});
