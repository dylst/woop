import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { TextInput, Button } from 'react-native-paper';

type FormData = {
  foodName: string;
  cuisineType: string;
  dietaryTags: string[];
  priceRange: string;
  location: string;
  description: string;
  photos: string[];
};

const CUISINE_TYPES = [
  'American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 
  'Indian', 'Thai', 'Mediterranean', 'Other'
];

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

export default function AddFoodItemForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    // TODO: Add API call here
  };

  return (
    <ScrollView style={styles.container}>
      <Controller
        control={control}
        rules={{ required: 'Food name is required' }}
        name="foodName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Food Name"
            onChangeText={onChange}
            value={value}
            style={styles.input}
            error={!!errors.foodName}
          />
        )}
      />
      {errors.foodName && (
        <ThemedText style={styles.errorText}>{errors.foodName.message}</ThemedText>
      )}

      {/* Add other form fields here */}
      
      <Button 
        mode="contained" 
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      >
        Submit
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
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: Colors.primary.darkteal,
  },
}); 