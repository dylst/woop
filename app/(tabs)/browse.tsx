import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";

export default function Browse() {
	const [searchText, setSearchText] = useState("");
	const router = useRouter();

	const historyItems = [
		{ name: "Sushi Station", date: "2 days ago" },
		{ name: "Pizza Palace", date: "Last week" },
		{ name: "Taco Temple", date: "2 weeks ago" },
	];

	return (
		<SafeAreaView style={styles.container}>
			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<Ionicons
					name='search'
					size={20}
					color='#666'
				/>
				<TextInput
					style={styles.searchInput}
					placeholder='Search foods...'
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
					<Text style={styles.buttonText}>Cuisine</Text>
				</Pressable>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse_tabs/dietary")}
				>
					<Text style={styles.buttonText}>Dietary</Text>
				</Pressable>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse_tabs/map")}
				>
					<Text style={styles.buttonText}>Map</Text>
				</Pressable>
			</View>

			{/* Divider */}
			<View style={styles.titleDivider} />
			{/* History Section */}
			<View style={styles.historyContainer}>
				<Text style={styles.historyTitle}>Recent Food History</Text>
				{historyItems.map((item, index) => (
					<View
						key={index}
						style={styles.historyItem}
					>
						<Text style={styles.historyName}>{item.name}</Text>
						<Text style={styles.historyDate}>{item.date}</Text>
					</View>
				))}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		padding: 16,
		alignItems: "center", // Add this
	},
	searchContainer: {
		width: "100%",
		maxWidth: 800,
		alignSelf: "center", // Add this
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		padding: 12,
		borderRadius: 12,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#89D5ED",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		marginTop: 20,
	},
	searchInput: {
		marginLeft: 8,
		flex: 1,
		fontSize: 16,
		color: "#333",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#89D5ED",
		padding: 14,
		borderRadius: 12,
		width: "30%",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	buttonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 16,
	},
	divider: {
		height: 2,
		backgroundColor: "#89D5ED20",
		marginVertical: 20,
	},
	historyContainer: {
		flex: 1,
		backgroundColor: "white",
		padding: 20,
		width: "100%",
		maxWidth: 800,
		alignSelf: "center",
	},
	historyTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 24, // Increased from 16
	},
	historyItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 16,
		paddingHorizontal: 16, // Increased from 12
		borderRadius: 8,
		backgroundColor: "white",
		marginBottom: 16, // Increased from 12
		borderWidth: 1,
		borderColor: "#89D5ED20",
		maxWidth: 800,
		width: "100%",
	},
	historyName: {
		fontSize: 16,
		color: "#333",
		fontWeight: "500",
	},
	historyDate: {
		color: "#89D5ED",
		fontSize: 14,
	},
	titleDivider: {
		height: 20,
		backgroundColor: "#65C5E340", 
		width: "100%",
		marginVertical: 20,
		alignSelf: "center",
	},
});
