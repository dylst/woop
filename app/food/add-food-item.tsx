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
          name='arrow-back'
          size={24}
          onPress={() => router.back()}
          style={styles.closeIcon}
        />
        <ThemedText style={styles.title}>Create Food Item</ThemedText>
        <Ionicons
          name='help'
          size={24}
          onPress={() => console.log('help')}
          style={styles.closeIcon}
        />
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
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
  },
  closeIcon: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});
