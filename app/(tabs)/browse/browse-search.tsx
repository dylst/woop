import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { Restaurant } from "@/types/restaurant.types";

export default function BrowseSearchResults() {
	const { query, results } = useLocalSearchParams(); // Retrieve params
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

	useEffect(() => {
		if (results) {
			try {
				setRestaurants(JSON.parse(results as string)); // Parse the stringified JSON
			} catch (error) {
				console.error("Failed to parse results:", error);
			}
		}
	}, [results]);

	return (
		<View style={{ padding: 20, backgroundColor: "white", flex: 1 }}>
			<Text style={{ fontSize: 18, fontWeight: "bold" }}>
				Search Results for: {query}
			</Text>

			<FlatList
				data={restaurants}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ddd",}}>
						<Text style={{ fontSize: 16, color: "black" }}>{item.restaurantName}</Text>
						<Text>
							{item.address}, {item.cityName}, {item.stateName}
						</Text>
					</View>
				)}
			/>
		</View>
	);
}