import { View, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { restaurantService } from "@/app/api/services/restaurantService";
import { supabase } from "@/supabaseClient";
const SearchBar = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();


	const handleSearchDb = async (name: string) => {
		try{
			setLoading(true);
			const results = await restaurantService.getRestaurantByNameSupabase(name);
			console.log("Search Results:", typeof results, results);
			router.push({
				pathname: "/(tabs)/browse/browse-search",
				params: {
					query: searchQuery,
					results: JSON.stringify(results),
				},
			});
		}catch (e){
			console.error("Failed catching restaurant:", e);
		}
	}


	const handleSearch = async () => {
		if (searchQuery.trim()) {
			try {
				setLoading(true);
				const results = await restaurantService.getRestaurantByCity("CA", "Cerritos", 0);
				console.log("Search Results:", typeof results, results);

				for (const restaurant of results) {
					const { error } = await supabase
						.from("restaurant")
						.insert([
							{
								name: restaurant.restaurantName,
								addressLin: restaurant.address,
								city: restaurant.cityName,
								state: restaurant.stateName,
								zipcode: restaurant.zipCode.substring(0,5),
								webUrl: restaurant.webUrl,
								hours: restaurant.hoursInterval,
								cuisineType: restaurant.cuisineType,
								idRestaurant: restaurant.id,
								latitude: restaurant.latitude,
								longitude: restaurant.longitude,
							},
						])
						

					if (error){
						console.error("Error inserting restaurant:", error);
					}
				}


				router.push({
					pathname: "/(tabs)/browse/browse-search",
					params: {
						query: searchQuery,
						results: JSON.stringify(results),
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
		marginHorizontal: 10,
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		color: "#2897ba",
	},
});

export default SearchBar;
