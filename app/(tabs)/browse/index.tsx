import { Image } from "react-native";
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
				<TopBar
					type='back'
					title='search'
					backType='replace'
					replaceRoute='/'
				/>
			</View>

			<View style={styles.buttonContainer}>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse/cuisine")}
				>
					<Image
						source={require("@/assets/images/cuisines.png")}
						style={styles.buttonImage}
					/>
				</Pressable>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse/dietary")}
				>
					<Image
						source={require("@/assets/images/Dietary.png")}
						style={styles.buttonImage}
					/>
				</Pressable>
				<Pressable
					style={styles.button}
					onPress={() => router.push("/browse/map")}
				>
					<Image
						source={require("@/assets/images/Location.png")}
						style={styles.buttonImage}
					/>
				</Pressable>
			</View>
			<View style={styles.separator} />
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
	separator: {
		height: 4,
		backgroundColor: "#89D5ED", // Using your app's blue color
		width: "100%",
		marginTop: 60, // Position it below the back button
		opacity: 0.5, // Makes it slightly transparent
		zIndex: 5,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-around", // Even spacing
		marginBottom: 20,
		alignSelf: "center",
		width: "90%", // Adjust width for responsiveness
		marginTop: 20,
	},
	button: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1, // Makes buttons take equal width
		marginHorizontal: 8, // Adds spacing between buttons
		backgroundColor: "transparent", // Removes background
	},
	buttonImage: {
		width: 100, // Adjust size for better visibility
		height: 100,
		resizeMode: "contain", // Prevents stretching
	},
});
