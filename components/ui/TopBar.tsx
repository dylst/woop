import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/ui/SearchBar';

const TopBar = () => {
  return (
    <View>
        <View style={styles.topBar}>
            <Text style={styles.greeting}>Hey there,<br/>Kyle!</Text>
            <View style={styles.topBarIcons}>
            <Ionicons name="notifications" size={24} color="#000" />
            <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.avatar}
            />
            </View>
        </View>
        <SearchBar/>
    </View>
  )
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
})

export default TopBar;