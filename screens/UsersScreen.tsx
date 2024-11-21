// UsersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useFetchUsers } from '@/hooks/useFetchUsers';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
}

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(true); // Add state for button visibility

  const handleGetUsers = async () => {
    setIsLoading(true);
    const usersData = await useFetchUsers();
    setUsers(usersData);
    setIsLoading(false);
    setShowButton(false); // Hide button after fetching users
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type='title'>Users List</ThemedText>
      {showButton && ( // Conditionally render button
        <Pressable style={styles.button} onPress={handleGetUsers}>
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Loading...' : 'Get Users'}
          </ThemedText>
        </Pressable>
      )}
      {users.length > 0 && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ThemedView style={styles.userItem}>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText>{item.email}</ThemedText>
              <ThemedText>
                {item.city}, {item.state}
              </ThemedText>
            </ThemedView>
          )}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000', // Set background color to black
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Set text color to white
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    color: '#fff', // Set text color to white
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UsersScreen;
