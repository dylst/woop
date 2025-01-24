import { View, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { restaurantService } from "../../app/api/services/restaurantService";

const SearchBar = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSearch = async () => {
		if (searchQuery.trim()) {
			try {
				setLoading(true);
				const results = await restaurantService.getRestaurantsByState("CA", 0);
        
				// Filter results based on search query
				const filteredResults = results.filter(
					(restaurant) =>
						restaurant.restaurantName
							.toLowerCase()
							.includes(searchQuery.toLowerCase()) ||
						restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase())
				);

				router.push({
					pathname: "/(tabs)/browse/browse-search",
					params: {
						query: searchQuery,
						results: JSON.stringify(filteredResults),
					},
				});
			} catch (error) {
				console.error("Search failed:", error);
			} finally {
				setLoading(false);
			}
		}
	};

	return (
		<View style={styles.searchContainer}>
			{loading ? (
				<ActivityIndicator
					size='small'
					color='#89D5ED'
				/>
			) : (
				<Ionicons
					name='search'
					size={20}
					color='#89D5ED'
				/>
			)}
			<TextInput
				style={styles.searchInput}
				placeholder='Search restaurants...'
				value={searchQuery}
				onChangeText={setSearchQuery}
				onSubmitEditing={handleSearch}
				editable={!loading}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#c2effd",
		borderStyle: "solid",
		borderWidth: 1,
		backgroundColor: "rgba(194,239,253,0.2)",
		padding: 10,
		borderRadius: 50,
		elevation: 2,
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		color: "#2897ba",
	},
});

export default SearchBar;
