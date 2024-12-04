import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import Carousel from 'react-native-snap-carousel';

const featuredItems = [
  {
    id: '1',
    title: 'Orange Chicken',
    rating: '4.6',
    image: require('@/assets/images/react-logo.png'),
    address: 'Kin Long Beach, 740 E Broadway Long Beach, CA 90802',
  },
  {
    id: '2',
    title: 'Beef Pho',
    rating: '4.5',
    image: require('@/assets/images/react-logo.png'),
    address: 'Kin Long Beach, 740 E Broadway Long Beach, CA 90802',  
  },
]

// Carousel Card Component
// const CarouselCard = ({ item }) => {
//   return (
//     <View style={styles.card}>
      
//     </View>
//   )
// }

const HomePage = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Hey there, Kyle!</Text>
        <View style={styles.topBarIcons}>
          <Ionicons name="notifications" size={24} color="#000" />
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#2897ba" />
        <TextInput
          placeholder="Search food item..."
          style={styles.searchInput}
        />
      </View>

      {/* Best in Town Section */}
      <Text style={styles.sectionTitle}>Best in Town!</Text>
      <View style={styles.newSection}>
        <TouchableOpacity style={[styles.card, styles.shadowProp]}>
          <Image
            source={require('@/assets/images/try_something_new_cuisine.png')}
            style={styles.cardImage}
          />
          <View style={styles.cardDescription}>
            <Text style={styles.cardTitle}>Orange Chicken</Text>
            <Text style={styles.cardAddress}>Kin Long Beach</Text>
            <Text style={styles.cardAddress}>740 E Broadway Long Beach, CA 90802</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="gold" />
              <Text style={styles.cardRating}>4.6</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Try Something New Section */}
      <Text style={styles.sectionTitle}>Try something new!</Text>
      <View style={styles.newSection}>
        <TouchableOpacity style={[styles.newBox, styles.shadowProp]}>
          <Image
            source={require('@/assets/images/try_something_new_cuisine.png')}
            style={styles.newImage}
          />
          <Text style={styles.newBoxText}>Cuisine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.newBox, styles.shadowProp]}>
          <Image
            source={require('@/assets/images/try_something_new_dietary.png')}
            style={styles.newImage}
          />
          <Text style={styles.newBoxText}>Dietary</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#c2effd',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: 'rgba(194,239,253,0.2)',
    padding: 10,
    borderRadius: 50,
    marginBottom: 16,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#2897ba',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  card: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
  },
  cardDescription: {
    margin: 16,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  newSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    alignItems: 'center',
  },
  newImage: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  newBoxText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 16,
    paddingBottom: 16,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 15,
  }
});

export default HomePage;