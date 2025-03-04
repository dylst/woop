import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/ui/SearchBar';
import { useNavigation, useRouter } from 'expo-router';
import { useUser } from '@/app/context/UserContext';
import { supabase } from '@/supabaseClient';

const TopBar = ({ type = 'home', title = '' }) => {
  const router = useRouter();

  const { user } = useUser();
  const userId = user?.id;

  const [userData, setUserData] = useState<any>(null);
  // Store a stable random index that won't change on re-renders
  const randomIndexRef = useRef(0);

  // Initialize the random index only once
  useEffect(() => {
    randomIndexRef.current = Math.floor(
      Math.random() * greetingTemplates.length
    );
  }, []);

  const fetchProfile = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('profile')
      .select(
        `
        username,
        first_name,
        avatar`
      )
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.log('Error fetching profile:', error);
      return;
    }

    setUserData(data);
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const name = userData?.first_name || userData?.username;

  // list of greetings
  const greetingTemplates = [
    'Hey there,\n{name}!',
    'What are you feeling,\n{name}?',
    'Did you eat yet,\n{name}?',
    'Review a food,\n{name}!',
    "What's up,\n{name}?",
    'Woop!',
  ];

  // Use the stable random index with useMemo
  const greeting = useMemo(() => {
    return greetingTemplates[randomIndexRef.current].replace(
      '{name}',
      name || ''
    );
  }, [name]);

  const handleNavigationPress = () => {
    router.push(`/notifications`);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View>
      <View style={styles.topBar}>
        {type === 'home' ? (
          <Text style={styles.greeting}>{greeting}</Text>
        ) : (
          <TouchableOpacity
            style={styles.backContainer}
            onPress={handleBackPress}
          >
            <Ionicons name='chevron-back' size={24} color='#000' />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {type !== 'home' && <Text style={styles.title}>{title}</Text>}
        </View>

        <TouchableOpacity style={styles.topBarIcons}>
          <Pressable onPress={() => handleNavigationPress()}>
            <Ionicons name='notifications' size={24} color='#000' />
          </Pressable>
          <Pressable onPress={() => router.push('/profile')}>
            <Image source={{ uri: userData?.avatar }} style={styles.avatar} />
          </Pressable>
        </TouchableOpacity>
      </View>
      {/* Search Bar that was visibile on every screen */}
      {/* <SearchBar /> */}
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
    // paddingTop: 12,
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
    width: 44,
    height: 44,
    borderRadius: 50,
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
  },
});

export default TopBar;
