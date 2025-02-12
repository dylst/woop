import { View, Text, FlatList, StyleSheet, Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function BrowseSearch() {
    const { query, results } = useLocalSearchParams();
    const searchResults = JSON.parse(results as string);
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.searchTitle}>Results for "{query}"</Text>

            {searchResults.length > 0 ? (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Pressable 
                            style={styles.resultItem} 
                            onPress={() => router.push(`/food/${item.id}`)} // Navigate to food item details
                        >
                            {item.photos && item.photos.length > 0 && (
                                <Image source={{ uri: item.photos[0] }} style={styles.resultImage} />
                            )}

                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultTitle}>{item.food_name}</Text>
                                {item.restaurant_name && (
                                    <Text style={styles.subtitle}>{item.restaurant_name}</Text>
                                )}
                                {item.cuisine_type && (
                                    <Text style={styles.subtitle}>Cuisine: {item.cuisine_type.join(", ")}</Text>
                                )}
                                {item.dietary_tags && (
                                    <Text style={styles.subtitle}>Dietary: {item.dietary_tags.join(", ")}</Text>
                                )}
                            </View>
                        </Pressable>
                    )}
                />
            ) : (
                <Text style={styles.noResultsText}>No results found.</Text>
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
    searchTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    resultImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "500",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
    },
    noResultsText: {
        fontSize: 16,
        textAlign: "center",
        color: "#999",
        marginTop: 20,
    },
});

