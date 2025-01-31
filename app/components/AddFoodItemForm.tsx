import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { TextInput, Button, HelperText, Chip, List } from 'react-native-paper';
import Slider from '@react-native-community/slider';
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
  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
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
                      ? selectedDietaryTags.filter((t) => t !== tag)
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
            <ThemedText style={styles.label}>
              Price Range: {'$'.repeat(value)}
            </ThemedText>
            <Slider
              minimumValue={1}
              maximumValue={4}
              step={1}
              value={value}
              onValueChange={onChange}
              minimumTrackTintColor={Colors.primary.darkteal}
              thumbTintColor={Colors.primary.darkteal}
              maximumTrackTintColor='#d3d3d3'
            />
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
});
