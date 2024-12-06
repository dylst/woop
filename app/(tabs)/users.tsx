import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

interface UserItemProps {
  image: string;
  name: string;
  stats: { icon: keyof typeof Ionicons.glyphMap; count: number }[];
}

const UserItem: React.FC<UserItemProps> = ({ image, name, stats }) => (
  <View style={styles.headerContent}>
    <Image source={{ uri: image }} style={styles.userImage} />
    <ThemedText style={styles.userName}>{name}</ThemedText>
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <Ionicons name={stat.icon} size={16} color={Colors.primary.darkteal} />
          <ThemedText style={styles.statText}>{stat.count}</ThemedText>
        </View>
      ))}
    </View>
  </View>
);

interface UserScreenProps {
  users: UserItemProps[];
}

const UserScreen: React.FC<UserScreenProps> = ({ users = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.primary.lightteal}
      />
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <View key={index}>
              <UserItem {...user} />
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="create-outline" size={24} color={Colors.primary.darkteal} />
                  <ThemedText style={styles.actionButtonText}>Add Review</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="camera-outline" size={24} color={Colors.primary.darkteal} />
                  <ThemedText style={styles.actionButtonText}>Add Photo</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('/preferences')}
                >
                  <Ionicons name="options-outline" size={24} color={Colors.primary.darkteal} />
                  <ThemedText style={styles.actionButtonText}>Preferences</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.separator} />
            </View>
          ))
        ) : (
          <ThemedText style={styles.noUsersText}>No users found.</ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  headerContent: {
    alignItems: 'center',
    padding: 20,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statText: {
    marginLeft: 4,
    fontSize: 16,
    color: Colors.primary.darkteal,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  separator: {
    height: 10,
    backgroundColor: Colors.primary.lightteal,
    marginVertical: 10,
  },
  noUsersText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default UserScreen;
