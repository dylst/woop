import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeaturedCard from "@/components/ui/FeaturedCard";
import FiltersHomeNav from "@/components/ui/FiltersHomeNav";
import TopBar from "@/components/ui/TopBar";
import { useRouter } from "expo-router";

const featuredItems = [
  {
    id: "1",
    title: "Orange Chicken",
    imageSource: require("@/assets/images/food/orange_chicken.jpg"),
    restaurantName: "Kin Long Beach",
    addressLine: "740 E Broadway Long Beach, CA 90802",
    rating: 4.6,
  },
  {
    id: "2",
    title: "Beef Pho",
    imageSource: require("@/assets/images/food/beef_pho.jpg"),
    restaurantName: "PhoHolic",
    addressLine: "14932 Bushard St Westminster, CA 92683",
    rating: 4.5,
  },
  {
    id: "3",
    title: "Adobada Quesadilla",
    imageSource: require("@/assets/images/food/adobada_quesadilla.jpg"),
    restaurantName: "Tacomasa",
    addressLine: "4740 E 7th St #130, Long Beach, CA 90804",
    rating: 4.3,
  },
];

const filtersItems = [
  {
    id: "1",
    title: "Cuisine",
    imageSource: require("@/assets/images/try_something_new_cuisine.png"),
  },
  {
    id: "2",
    title: "Dietary",
    imageSource: require("@/assets/images/try_something_new_dietary.png"),
  },
];

const HomePage = () => {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <TopBar type="home" />

      {/* Search Bar */}
      
        

      {/* Best in Town Section */}
      <Text style={styles.sectionTitle}>Best in Town!</Text>

      <View style={styles.newSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollViewPadding}>
          {featuredItems.map((item) => (
            <FeaturedCard
              key={item.id}
              imageSource={item.imageSource}
              title={item.title}
              restaurantName={item.restaurantName}
              addressLine={item.addressLine}
              style={styles.shadowProp}
            />
          ))}
        </ScrollView>
      </View>

      {/* Try Something New Section */}
      <Text style={styles.sectionTitle}>Try something new!</Text>

      <View style={styles.newSection}>
        {filtersItems.map((item) => (
          <FiltersHomeNav
            key={item.id}
            imageSource={item.imageSource}
            title={item.title}
            style={styles.shadowProp}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#65C5E3",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 10,
  },
  newSection: {
    marginBottom: 20,
  },
  scrollViewPadding: {
    paddingHorizontal: 16,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default HomePage;
