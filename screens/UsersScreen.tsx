import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Button,
} from 'react-native';
import { useFetchUsers } from '@/hooks/useFetchUsers';
import { useCreateUser } from '@/hooks/useCreateUser';
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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGetUsers = async () => {
    setIsLoading(true);
    const usersData = await useFetchUsers();
    setUsers(usersData);
    setIsLoading(false);
  };

  const handleCreateUser = async () => {
    const newUser = await useCreateUser(name, email, city, state);
    if (newUser) {
      setUsers([...users, ...newUser]);
      setShowForm(false);
      setName('');
      setEmail('');
      setCity('');
      setState('');
    }
    setShowForm(false);
    setIsSubmitted(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Users List</ThemedText>
      <Pressable style={styles.button} onPress={handleGetUsers}>
        <ThemedText style={styles.buttonText}>Get Users</ThemedText>
      </Pressable>
      <Pressable style={styles.button} onPress={() => setShowForm(!showForm)}>
        <ThemedText style={styles.buttonText}>Create User</ThemedText>
      </Pressable>
      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder='Name'
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder='City'
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder='State'
            value={state}
            onChangeText={setState}
          />
          <Button title='Submit' onPress={handleCreateUser} />
          {isSubmitted && <Text style={styles.text}>User Created!</Text>}
        </View>
      )}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>{item.email}</Text>
            <Text style={styles.text}>{item.city}</Text>
            <Text style={styles.text}>{item.state}</Text>
          </View>
        )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: 'white',
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    color: 'white',
  },
  text: {
    color: 'white',
  },
});

export default UsersScreen;
