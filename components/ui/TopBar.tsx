import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/ui/SearchBar';
import { useNavigation } from 'expo-router';

const TopBar = ({
  type = 'home',
  name = 'Kyle',
  title = '',
}) => {
  const navigation = useNavigation();

  // list of greetings
  const greetingTemplates = [
    "Hey there,\n{name}!",
    "What are you feeling,\n{name}?",
    "Did you eat yet,\n{name}?",
    "Review a food,\n{name}!",
    "What's up,\n{name}?",
    "Woop!"
  ];

  // randomize greeting on each page load
  const greeting = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * greetingTemplates.length);
    return greetingTemplates[randomIndex].replace('{name}', name);
  }, [greetingTemplates, name]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View>
      <View style={styles.topBar}>
      {type === 'home' ? (
        <Text style={styles.greeting}>{greeting}</Text>
      ) : (
          <TouchableOpacity style={styles.backContainer} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#000"/>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        {type !== 'home' && (
        <Text style={styles.title}>{title}</Text>
        )}
      </View>

        <View style={styles.topBarIcons}>
          <Ionicons name='notifications' size={24} color='#000' />
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={styles.avatar}
          />
        </View>
      </View>
      <SearchBar />
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 1,
    paddingBottom: 2,
  }
});

export default TopBar;
