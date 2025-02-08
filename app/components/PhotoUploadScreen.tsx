import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface PhotoUploadScreenProps {
  onClose: () => void;
  onSelectImages: (images: Array<string>) => void;
  maxImages?: number;
  initialPhotos?: string[];
}

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({
  onClose,
  onSelectImages,
  maxImages = 5,
  initialPhotos = [],
}: PhotoUploadScreenProps) => {
  const [selectedPhotos, setSelectedPhotos] =
    React.useState<string[]>(initialPhotos);

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
      const newPhotos = [...selectedPhotos, result.assets[0].uri];
      setSelectedPhotos(newPhotos);
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
      selectionLimit: maxImages - selectedPhotos.length,
    });

    if (!result.canceled) {
      const newPhotos = [
        ...selectedPhotos,
        ...result.assets.map((asset) => asset.uri),
      ];
      setSelectedPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((photos) => photos.filter((_, i) => i !== index));
  };

  const handleDone = () => {
    onSelectImages(selectedPhotos);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <ThemedText style={styles.closeButton}>Close</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Add Photos</ThemedText>
        <TouchableOpacity onPress={handleDone}>
          <ThemedText style={styles.doneButton}>Done</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.previewContainer}>
        {selectedPhotos.length > 0 && (
          <View style={styles.photoGrid}>
            {selectedPhotos.map((photo, index) => (
              <View key={photo} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(index)}
                >
                  <MaterialIcons name='close' size={20} color='white' />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.optionsContainer}>
        {selectedPhotos.length < maxImages && (
          <>
            <TouchableOpacity style={styles.option} onPress={takePhoto}>
              <MaterialIcons name='camera-alt' size={32} color='white' />
              <ThemedText style={styles.optionText}>Take Photo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={selectFromGallery}>
              <MaterialIcons
                name='add-photo-alternate'
                size={32}
                color='white'
              />
              <ThemedText style={styles.optionText}>Select More</ThemedText>
            </TouchableOpacity>
          </>
        )}
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
    paddingTop: 60,
  },
  closeButton: {
    color: 'white',
    fontSize: 16,
  },
  doneButton: {
    color: Colors.primary.darkteal,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
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
