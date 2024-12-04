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

const HomePage = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Top Bar */}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollViewPadding}>
          <TouchableOpacity style={[styles.card, styles.shadowProp]}>
            <Image
              source={require('@/assets/images/try_something_new_cuisine.png')}
              style={styles.cardImage}
            />
            <View style={styles.cardDescription}>
              <Text style={styles.cardTitle}>Orange Chicken</Text>
              <Text style={styles.cardAddress}>Kin Long Beach</Text>
              <Text style={styles.cardAddress}>740 E Broadway Long Beach, CA 90802</Text>
              {/* <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="gold" />
                <Text style={styles.cardRating}>4.6</Text>
              </View> */}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.shadowProp]}>
            <Image
              source={require('@/assets/images/try_something_new_cuisine.png')}
              style={styles.cardImage}
            />
            <View style={styles.cardDescription}>
              <Text style={styles.cardTitle}>Orange Chicken</Text>
              <Text style={styles.cardAddress}>Kin Long Beach</Text>
              <Text style={styles.cardAddress}>740 E Broadway Long Beach, CA 90802</Text>
              {/* <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="gold" />
                <Text style={styles.cardRating}>4.6</Text>
              </View> */}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.shadowProp]}>
            <Image
              source={require('@/assets/images/try_something_new_cuisine.png')}
              style={styles.cardImage}
            />
            <View style={styles.cardDescription}>
              <Text style={styles.cardTitle}>Orange Chicken</Text>
              <Text style={styles.cardAddress}>Kin Long Beach</Text>
              <Text style={styles.cardAddress}>740 E Broadway Long Beach, CA 90802</Text>
              {/* <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="gold" />
                <Text style={styles.cardRating}>4.6</Text>
              </View> */}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.shadowProp]}>
            <Image
              source={require('@/assets/images/try_something_new_cuisine.png')}
              style={styles.cardImage}
            />
            <View style={styles.cardDescription}>
              <Text style={styles.cardTitle}>Orange Chicken</Text>
              <Text style={styles.cardAddress}>Kin Long Beach</Text>
              <Text style={styles.cardAddress}>740 E Broadway Long Beach, CA 90802</Text>
              {/* <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="gold" />
                <Text style={styles.cardRating}>4.6</Text>
              </View> */}
            </View>
          </TouchableOpacity>
        </ScrollView>
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
    paddingTop: 50,
    padding: 16,
  },
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
  scrollViewPadding: {
    paddingBottom: 16,
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
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#2897ba',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  card: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 16,
    elevation: 2,
  },
  cardDescription: {
    marginTop: 10,
    margin: 16,
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardAddress: {
    fontSize: 10,
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
    height: 290,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    alignItems: 'center',
  },
  newImage: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  newBoxText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20,
    paddingBottom: 16,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 6,
  }
});

export default HomePage;