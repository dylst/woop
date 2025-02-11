import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import FoodItemDetailPage from "@/app/food/[foodItemId]";

interface FoodItem {
  id: string;
  food_name: string;
  photos: string;
  restaurant_name: string;
  price_range: string;
  cuisine_type: string[];
  dietary_tags: string[];
}

export default function BrowseSearch() {
  const { query } = useLocalSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("fooditem")
          .select("*")
          .ilike("food_name", `%${query}%`);

        if (error) {
          console.error("Error fetching search results:", error);
          return;
        }

        setSearchResults(data || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <View style={styles.container}>
      <Text style={styles.searchTitle}>Results for "{query}"</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#65C5E3" />
          <Text>Searching...</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <Text style={styles.noResults}>No results found</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={styles.resultItem}
              onPress={() => router.push(`/food/${item.id}`)} // ✅ Routes to [foodItemId].tsx
            >
              <Image source={{ uri: item.photos }} style={styles.foodImage} />
              <View style={styles.infoContainer}>
                <Text style={styles.restaurantName}>{item.food_name}</Text>
                <Text style={styles.cuisineType}>
                  {item.restaurant_name} • {item.price_range}
                </Text>
                <Text style={styles.tags}>
                  {item.cuisine_type.join(", ")} | {item.dietary_tags.join(", ")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noResults: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "500",
  },
  cuisineType: {
    fontSize: 14,
    color: "#666",
  },
  tags: {
    fontSize: 12,
    color: "#888",
  },
});

