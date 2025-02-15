import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors.primary.darkteal,
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: {
          borderTopColor: Colors.primary.lightteal,
          backgroundColor: Colors.primary.lightteal,
          height: 85,
          paddingTop: 16,
          ...Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
              backgroundColor: Colors.primary.darkteal,
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          // color: "#000000",
          marginTop: -4,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons
                name='home'
                size={28}
                color={focused ? Colors.primary.darkteal : color}
                style={styles.tabIcon}
              />
            </View>
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name='browse'
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons
                name='search'
                size={28}
                color={focused ? Colors.primary.darkteal : color}
                style={styles.tabIcon}
              />
            </View>
          ),
          tabBarLabel: 'Browse',
        }}
      />
      <Tabs.Screen
        name='favorites'
        options={{
          title: "Favorites",
          tabBarIcon: ({ focused, color }) => (
            <View style={[focused ? styles.activeTab : null]}>
              <Ionicons
                name="heart"
                size={28}
                color={focused ? Colors.primary.darkteal : color}
                style={styles.tabIcon}
              />
            </View>
          ),
          tabBarLabel: "Favorites",
        }}
      />
      <Tabs.Screen
        name='reviews'
        options={{
          title: 'Reviews',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons
                name='star'
                size={28}
                color={focused ? Colors.primary.darkteal : color}
                style={styles.tabIcon}
              />
            </View>
          ),
          tabBarLabel: 'Reviews',
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons
                name='person'
                size={28}
                color={focused ? Colors.primary.darkteal : color}
                style={styles.tabIcon}
              />
            </View>
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    // backgroundColor: "rgba(137, 213, 237, 0.6)",
    // borderRadius: 50,
    // padding: 20,
  },
  tabIcon: {
    marginTop: -12,
    paddingTop: 4,
    paddingBottom: 4,
  },
});
