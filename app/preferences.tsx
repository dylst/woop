import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
// import supabase in a future implementation
import { supabase } from '@/supabaseClient';
import { useUser } from './context/UserContext';
import * as Notifications from 'expo-notifications';

// Add this interface for food items
interface FoodItem {
  id: string;
  name: string;
  image: any; // You'll need to import these images
}

const PreferencesScreen = () => {
  const { user } = useUser();
  const userId = user?.id;

  const [preferences, setPreferences] = useState({
    food: [] as string[],
    dietary: [] as string[],
    notifications: {
      push: false,
      email: false,
    },
  });

  // For tracking unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserPreferences(userId);
    }
  }, [userId]);

  const fetchUserPreferences = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          food: data.food || [],
          dietary: data.dietary || [],
          notifications: {
            push: data.push || false,
            email: data.email || false,
          },
        });
      }
    } catch (error: any) {
      console.error('Error fetching preferences', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFood = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      food: prev.food.includes(item)
        ? prev.food.filter((i) => i !== item)
        : [...prev.food, item],
    }));
    setHasChanges(true);
  };

  const toggleDietary = (item: string) => {
    setPreferences((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(item)
        ? prev.dietary.filter((i) => i !== item)
        : [...prev.dietary, item],
    }));
    setHasChanges(true);
  };

  // enable or disable notifications

  const toggleNotification = (type: 'push' | 'email') => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
    setHasChanges(true);
  };

  // push notifications
  const handlePushToggle = async (value: boolean) => {
    // update local state first
    toggleNotification('push'); // toggles value in state
    if (!userId) return;
    if (value) {
      // enable push notifications
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Push notifications not granted.')
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      // update user profile with expo_push_token
      const { error } = await supabase
        .from('profile')
        .update({ expo_push_token: token })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating push token:', error);
      }
    } else {
      // disable push notifications: clear token from backend
      const { error } = await supabase
        .from('profile')
        .update({ expo_push_token: null })
        .eq('id', userId);
      
      if (error) {
        console.error('Error clearing push token:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('preferences').upsert(
        {
          profile_id: userId,
          food: preferences.food,
          dietary: preferences.dietary,
          push: preferences.notifications.push,
          email: preferences.notifications.email,
        },
        { onConflict: 'profile_id' }
      );

      if (error) throw error;

      setHasChanges(false);
    } catch (error: any) {
      console.error('Error saving preferences:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example food items array
  const foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'American',
      image: require('@/assets/images/food/american.jpg'),
    },
    {
      id: '2',
      name: 'Bakeries',
      image: require('@/assets/images/food/bakeries.jpg'),
    },
    {
      id: '3',
      name: 'Barbecue',
      image: require('@/assets/images/food/barbecue.jpg'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <ThemedText style={styles.cancelText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.learnMore}>
          <ThemedText style={styles.learnMoreText}>Learn more</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name='heart'
              size={32}
              color={Colors.primary.darkteal}
              style={styles.heartIcon}
            />
            <View style={styles.smallHeartContainer}>
              <Ionicons
                name='heart'
                size={16}
                color={Colors.primary.darkteal}
              />
            </View>
          </View>
          <ThemedText style={styles.title}>
            See more of what {'\n'} you love
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your selections will help us give you better results and
            recommendations when you explore on Woop.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Food & Drink</ThemedText>
          <View style={styles.foodGrid}>
            {foodItems.map((item) => (
              <View key={item.id} style={styles.foodItem}>
                <Pressable
                  onPress={() => toggleFood(item.name)}
                  style={styles.foodImageContainer}
                >
                  <Image
                    source={item.image}
                    style={[
                      styles.foodImage,
                      !preferences.food.includes(item.name) &&
                        styles.inactiveImage,
                    ]}
                  />
                  <View style={styles.heartIconContainer}>
                    <Ionicons
                      name={
                        preferences.food.includes(item.name)
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={24}
                      color='#FFF'
                    />
                  </View>
                </Pressable>
                <ThemedText style={styles.foodLabel}>{item.name}</ThemedText>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.seeMore}>
            <ThemedText style={styles.seeMoreText}>See More</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Dietary</ThemedText>
          <View style={styles.optionsContainer}>
            {[
              'Gluten-free',
              'Halal',
              'Keto',
              'Pescatarian',
              'Vegan',
              'Vegetarian',
            ].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.optionButton,
                  preferences.dietary.includes(item) && styles.activeItem,
                ]}
                onPress={() => toggleDietary(item)}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    preferences.dietary.includes(item) && styles.activeText,
                  ]}
                >
                  {item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          <View style={styles.notificationContainer}>
            <View style={styles.notificationItem}>
              <ThemedText style={styles.notificationText}>
                Push Notifications
              </ThemedText>
              <Switch
                trackColor={{
                  false: '#e2e2e2',
                  true: Colors.primary.darkteal,
                }}
                thumbColor={'#fff'}
                ios_backgroundColor='#e2e2e2'
                onValueChange={handlePushToggle}
                value={preferences.notifications.push}
              />
            </View>
            <View style={styles.notificationItem}>
              <ThemedText style={styles.notificationText}>
                Email Notifications
              </ThemedText>
              <Switch
                trackColor={{
                  false: '#e2e2e2',
                  true: Colors.primary.darkteal,
                }}
                thumbColor={'#fff'}
                ios_backgroundColor='#e2e2e2'
                onValueChange={() => toggleNotification('email')}
                value={preferences.notifications.email}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges}
        >
          <ThemedText style={styles.saveButtonText}>
            Save Preferences
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  learnMore: {
    padding: 8,
  },
  learnMoreText: {
    color: Colors.primary.darkteal,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  titleContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  optionText: {
    color: '#767676',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  optionButton: {
    minWidth: 100,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeItem: {
    backgroundColor: Colors.primary.darkteal,
    borderColor: Colors.primary.darkteal,
  },
  activeText: {
    color: '#fff',
  },
  seeMore: {
    marginTop: 15,
    alignItems: 'center',
  },
  seeMoreText: {
    color: Colors.primary.darkteal,
  },
  notificationContainer: {
    gap: 15,
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notificationText: {
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: Colors.primary.darkteal,
    margin: 20,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  iconContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heartIcon: {
    opacity: 1,
  },
  smallHeartContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 10,
  },
  foodItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  foodImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  inactiveImage: {
    opacity: 0.7,
  },
  heartIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  foodLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
  },
  separator: {
    height: 10,
    width: '100%',
    backgroundColor: Colors.primary.lightteal,
  },
});

export default PreferencesScreen;
