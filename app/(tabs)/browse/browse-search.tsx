import { View, Text, FlatList, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Restaurant } from "@/types/restaurant.types";
import SearchBar from "@/components/ui/SearchBar";
export default function BrowseSearch() {
	const { query, results } = useLocalSearchParams();
	const searchResults: Restaurant[] = JSON.parse(results as string);

	return (
		<View style={styles.container}>
			<SearchBar />
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
				contentInsetAdjustmentBehavior='automatic'
				automaticallyAdjustContentInsets={true}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 16,
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: Platform.OS === "ios" ? 44 : 16, // Accounts for iOS status bar
		backgroundColor: "#ffffff",
	},
	searchTitle: {
		fontSize: 17, // iOS standard title size
		fontWeight: "600",
		marginBottom: 12,
		color: "#000000",
	},
	resultItem: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#C6C6C8", // iOS standard separator color
	},
	restaurantName: {
		fontSize: 17, // iOS standard text size
		fontWeight: "500",
		color: "#000000",
	},
	cuisineType: {
		fontSize: 15, // iOS standard secondary text size
		color: "#8E8E93", // iOS standard secondary text color
		marginTop: 4,
	},
});
