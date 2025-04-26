import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Image, Pressable, Text, TouchableOpacity, TextInput, Platform, Alert } from 'react-native'
import { useUser } from './context/UserContext'
import { supabase } from '@/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// fallback to default avatar URL when current URI is empty (to avoid source.uri empty string warning)
const defaultAvatar = "https://kwunuyczgqvpnfsdueyl.supabase.co/storage/v1/object/public/avatars//default_avatar.jpg";

const profileSettings = () => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const [userData, setUserData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    avatar: '' as string,
    first_name: '' as string,
    last_name: '' as string,
    city: '' as string,
    state: '' as string,
  });


  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile", error);
        return;
      }

      setUserData(data);
    } catch (error) {
      console.log("Error fetching profile:", error);
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      setSettings({
        avatar: userData.avatar,
        first_name: userData.first_name,
        last_name: userData.last_name,
        city: userData.city,
        state: userData.state,
      });
    }
  }, [userData])

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleAvatarEdit = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // create unique filename
      const asset = result.assets[0];

      const fileExt = asset.uri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      try {
        // Validate file size (limit to 3MB)
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        if (fileInfo.exists && fileInfo.size !== undefined && fileInfo.size > 3 * 1024 * 1024) {
          alert("The selected image is too large. Please choose an image smaller than 3MB.");
          return;
        }

        let fileData;
        if (Platform.OS === 'web') {
          // On web, fetch the blob directly
          const response = await fetch(asset.uri);
          fileData = await response.blob();
        } else {
          // On native, read the file as a base64 string then decode it
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          fileData = decode(base64);
        }

        // Upload blob/fileData to the avatars bucket with contentType defined
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, fileData, {
            contentType: `image/${fileExt}`,
            upsert: false, // Ensure we're inserting a new file
          });

        if (uploadError) {
          console.error('Error uploading details:', uploadError);
          alert(`Upload failed: ${uploadError.message}`);
          return;
        };

        // retrieve public URL for uploaded avatar
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const publicURL = data?.publicUrl;
        if (!publicURL) {
          throw new Error("Failed to retrieve public URL");
        };


        // update local state and mark changes for save
        setSettings({ ...settings, avatar: publicURL });

        // update avatar in profile table immediately
        const { error: updateError } = await supabase
          .from('profile')
          .update({ avatar: publicURL })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          alert(`Profile update failed: ${updateError.message}`);
          return;
        };
      } catch (err: any) {
        console.error('Unexpected error:', err);
        alert(`Unexpected error: ${err.message}`);
      }
    }
  }

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profile').update(
        {
          first_name: settings.first_name,
          last_name: settings.last_name,
          city: settings.city,
          state: settings.state,
        }).eq('id', userId);

      if (error) throw error;

      setHasChanges(false);
    } catch (error: any) {
      console.error('Error saving profile settings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Alert.alert("Logged Out", "You have been signed out.")
    router.replace('/users');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cancel button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/profile')}
            style={styles.cancelButton}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Profile Avatar and Username*/}
        <View style={styles.headerContent}>
          {/* Avatar */}
          <View>
            <Image
              source={{
                uri: settings.avatar && settings.avatar.trim() !== ''
                  ? settings.avatar
                  : defaultAvatar,
              }}
              style={styles.profileAvatar}
              resizeMode='cover' />
            <Pressable
              style={styles.avatarEdit}
              onPress={handleAvatarEdit}>
              <Ionicons name="pencil-sharp" size={24} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.username}>@{userData?.username}</Text>
        </View>

        {/* TextInputs */}
        <View style={styles.textInputContainer}>
          {/* First Name */}
          <View style={styles.textInputRow}>
            <Text style={styles.textBoxTitle}>
              First Name
            </Text>
            <TextInput
              style={styles.textBox}
              value={settings.first_name}
              onChangeText={(text) => {
                setSettings({ ...settings, first_name: text })
                setHasChanges(true);
              }}
            />
          </View>

          {/* Last Name */}
          <View style={styles.textInputRow}>
            <Text style={styles.textBoxTitle}>
              Last Name
            </Text>
            <TextInput
              style={styles.textBox}
              value={settings.last_name}
              onChangeText={(text) => {
                setSettings({ ...settings, last_name: text })
                setHasChanges(true);
              }}
            />
          </View>

          {/* City */}
          <View style={styles.textInputRow}>
            <Text style={styles.textBoxTitle}>
              City
            </Text>
            <TextInput
              style={styles.textBox}
              value={settings.city}
              onChangeText={(text) => {
                setSettings({ ...settings, city: text })
                setHasChanges(true);
              }}
            />
          </View>

          {/* State */}
          <View style={styles.textInputRow}>
            <Text style={styles.textBoxTitle}>
              State
            </Text>
            <TextInput
              style={styles.textBox}
              value={settings.state}
              onChangeText={(text) => {
                setSettings({ ...settings, state: text })
                setHasChanges(true);
              }}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <ThemedText style={styles.buttonText}>
              Save Settings
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logout}
          onPress={handleLogout}>
          <ThemedText style={styles.buttonText}>
            Logout
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.primary.darkteal,
  },
  headerContent: {
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    alignSelf: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary.teal,
    borderRadius: 20,
    padding: 4,
    zIndex: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
    color: Colors.primary.darkteal,
  },
  textInputContainer: {
    flex: 1,
    marginVertical: 10,
    paddingVertical: 20,
    borderTopWidth: 4,
    borderTopColor: Colors.primary.teal,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primary.teal,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 4,
  },
  textBoxTitle: {
    width: "30%",
    color: '#555',
    fontSize: 18,
  },
  textBox: {
    flex: 1,
    fontSize: 18,
    height: 40,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: Colors.primary.darkteal,
    borderRadius: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary.darkteal,
    margin: 20,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  logout: {
    backgroundColor: '#cc3a2b',
    borderRadius: 25,
    margin: 20,
    padding: 15,
    alignItems: 'center',
  },
})

export default profileSettings;