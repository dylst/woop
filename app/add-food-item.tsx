import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AddFoodItemForm from '@/app/components/AddFoodItemForm';
import { ThemedText } from '@/components/ThemedText';

export default function AddFoodItemScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="close" 
          size={24} 
          onPress={() => router.back()} 
          style={styles.closeIcon}
        />
        <ThemedText style={styles.title}>Add Food Item</ThemedText>
      </View>
      <AddFoodItemForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeIcon: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
}); 