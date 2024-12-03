import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
// import supabase in a future implementation

const PreferencesScreen = () => {
  // Initial state will eventually be populated from Supabase
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

  // This will be used when we integrate Supabase
  useEffect(() => {
    // fetchUserPreferences();
  }, []);

  // Example of how we'll fetch preferences later
  /*
  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();
      
      if (error) throw error;
      
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };
  */

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

  const handleSave = async () => {
    // This will be implemented when we add Supabase
    /*
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          ...preferences
        });

      if (error) throw error;
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
    */
  };

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
            See more of what <br /> you love
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your selections will help us give you better results and
            recommendations when you explore on Woop.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Food & Drink</ThemedText>
          <View style={styles.optionsContainer}>
            {['American', 'Bakeries', 'Barbecue'].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.optionButton,
                  preferences.food.includes(item) && styles.activeItem,
                ]}
                onPress={() => toggleFood(item)}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    preferences.food.includes(item) && styles.activeText,
                  ]}
                >
                  {item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <TouchableOpacity style={styles.seeMore}>
            <ThemedText style={styles.seeMoreText}>See More</ThemedText>
          </TouchableOpacity>
        </View>

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

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          <View style={styles.notificationContainer}>
            <View style={styles.notificationItem}>
              <ThemedText style={styles.notificationText}>
                Push Notifications
              </ThemedText>
              {/* Add a switch component here */}
            </View>
            <View style={styles.notificationItem}>
              <ThemedText style={styles.notificationText}>
                Email Notifications
              </ThemedText>
              {/* Add a switch component here */}
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
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
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
});

export default PreferencesScreen;
