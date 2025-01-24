import { View, Text, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Restaurant } from "@/types/restaurant.types";

export default function BrowseSearch() {
	const { query, results } = useLocalSearchParams();
	const searchResults: Restaurant[] = JSON.parse(results as string);

	return (
		<View style={styles.container}>
			<Text style={styles.searchTitle}>Results for "{query}"</Text>
			<FlatList
				data={searchResults}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View style={styles.resultItem}>
						<Text style={styles.restaurantName}>{item.restaurantName}</Text>
						<Text style={styles.cuisineType}>{item.cuisineType}</Text>
					</View>
				)}
			/>
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
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	restaurantName: {
		fontSize: 18,
		fontWeight: "500",
	},
	cuisineType: {
		fontSize: 14,
		color: "#666",
		marginTop: 4,
	},
});
