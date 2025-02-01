import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

interface PhotoUploadScreenProps {
  onClose: () => void;
  onSelectImages: (images: Array<string>) => void;
  maxImages?: number;
}

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({
  onClose,
  onSelectImages,
  maxImages = 5,
}: PhotoUploadScreenProps) => {
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      onSelectImages([result.assets[0].uri]);
    }
  };

  const selectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
    });

    if (!result.canceled) {
      const imageUris = result.assets.map((asset) => asset.uri);
      onSelectImages(imageUris);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <ThemedText style={styles.closeButton}>Close</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Add Photos</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={takePhoto}>
          <MaterialIcons name='camera-alt' size={32} color='white' />
          <ThemedText style={styles.optionText}>Take Photo</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={selectFromGallery}>
          <MaterialIcons name='add-photo-alternate' size={32} color='white' />
          <ThemedText style={styles.optionText}>Select More</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 30,
  },
  closeButton: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  optionText: {
    color: 'white',
    marginTop: 8,
    fontSize: 16,
  },
});
