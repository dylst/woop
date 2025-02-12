//
// TODO:
// Use top bar for search and buttons
import TopBar from "@/components/ui/TopBar";
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

			{/* Page Title */}
			<View style={styles.topBarContainer}>
				<TopBar type="back" title='search'/>
			</View>

			{/* Buttons Row */}
			<View style={styles.buttonContainer}>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse/cuisine")}
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
					onPress={() => router.push("/browse/dietary")}
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
					onPress={() => {
						console.log("Navigating to map...");
						router.push("/browse/map");
					}}
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
	},
	topNav: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		marginBottom: 10,
	},
	topBarContainer: {
		width: "100%",
		maxWidth: 800,
		alignSelf: "center",
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
		width: "80%", //
		maxWidth: 1200,
		alignSelf: "center",
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
		gap: 50,
		marginBottom: 20,
		alignSelf: "center",
		maxWidth: 1000,
		width: "100%",
		marginTop: 20,
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
		marginBottom: 20,
		maxWidth: 800,
		alignItems: "center",
		alignSelf: "center",
		width: "90%",
	},
	historyTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 20,
		textAlign: "center",
	},
	historyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderRadius: 12,
		backgroundColor: "#F9F9F9",
		marginBottom: 12,
		borderColor: "#E0E0E0",
		borderWidth: 1,
		width: "100%",
		maxWidth: 800,
	},
	historyName: {
		fontSize: 18,
		color: "#333",
		fontWeight: "500",
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
