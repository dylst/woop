import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	Pressable,
	FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";

export default function Browse() {
	const [searchText, setSearchText] = useState("");
	const router = useRouter();

	const historyItems = [
		{ name: "Beef Pho with Meatballs" },
		{ name: "Spicy Chicken Wings" },
		{ name: "Quesabirria Tacos" },
		{ name: "Sushi" },
	];

	return (
		<SafeAreaView style={styles.container}>
			{/* Top Navigation */}
			<View style={styles.topNav}>
				<Pressable onPress={() => router.back()}>
					<Ionicons
						name='chevron-back'
						size={28}
						color='#333'
					/>
				</Pressable>
				<Text style={styles.pageTitle}>Search</Text>
				<Ionicons
					name='notifications-outline'
					size={24}
					color='#333'
				/>
			</View>

			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<Ionicons
					name='search'
					size={20}
					color='#666'
				/>
				<TextInput
					style={styles.searchInput}
					placeholder='Search food item...'
					value={searchText}
					onChangeText={setSearchText}
				/>
			</View>

			{/* Buttons Row */}
			<View style={styles.buttonContainer}>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse_tabs/cuisine")}
				>
					<Ionicons
						name='restaurant-outline'
						size={24}
						color='white'
					/>
					<Text style={styles.buttonText}>Cuisine</Text>
				</Pressable>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse_tabs/dietary")}
				>
					<Ionicons
						name='nutrition-outline'
						size={24}
						color='white'
					/>
					<Text style={styles.buttonText}>Dietary</Text>
				</Pressable>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse_tabs/map")}
				>
					<Ionicons
						name='location-outline'
						size={24}
						color='white'
					/>
					<Text style={styles.buttonText}>Location</Text>
				</Pressable>
			</View>

			{/* History Section */}
			<View style={styles.historyContainer}>
				<Text style={styles.historyTitle}>History</Text>
				<FlatList
					data={historyItems}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({ item }) => (
						<View style={styles.historyItem}>
							<Text style={styles.historyName}>{item.name}</Text>
							<Ionicons
								name='close'
								size={20}
								color='#666'
							/>
						</View>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		padding: 16,
	},
	topNav: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	pageTitle: {
		padding: 24,
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F1F1F1",
		padding: 12,
		borderRadius: 8,
		marginBottom: 20,
		width: "80%", // Reduced from 100%
		maxWidth: 1200, // Add maximum width
		alignSelf: "center", // Center the container
	},
	searchInput: {
		marginLeft: 8,
		flex: 1,
		fontSize: 16,
		color: "#333",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "center", 
		gap: 50	,
		marginBottom: 20,
		alignSelf: "center",
		maxWidth: 1000,
		width: "100%",
	},
	button: {
		backgroundColor: "#65C5E3",
		paddingVertical: 10, 
		paddingHorizontal: 15, 
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		width: "25%",	
	},
	buttonText: {
		color: "white",
		fontWeight: "600",
		marginTop: 4,
	},
	historyContainer: {
		flex: 1,
		marginBottom: 10,
	},
	historyTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 12,
	},
	historyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		backgroundColor: "#F9F9F9",
		marginBottom: 8,
		borderColor: "#E0E0E0",
		borderWidth: 1,
	},
	historyName: {
		fontSize: 16,
		color: "#333",
	},
	bottomNav: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 12,
		borderTopWidth: 1,
		borderColor: "#E0E0E0",
		backgroundColor: "white",
	},
	navItem: {
		alignItems: "center",
	},
	navText: {
		fontSize: 12,
		color: "#666",
		marginTop: 4,
	},
	navTextActive: {
		fontSize: 12,
		color: "#65C5E3",
		marginTop: 4,
		fontWeight: "bold",
	},
});
