import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	Image,
	Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";

interface BrowseCardProps {
	browseCardName: string;
}

export default function Dietary() {
	const [searchText, setSearchText] = useState("");
	const router = useRouter();

	const dietaryTypes = {
		vegetarian: "Vegetarian",
		vegan: "Vegan",
		glutenFree: "Gluten Free",
		keto: "Keto",
		paleo: "Paleo",
		nutFree: "Nut Free",
		lactoseFree: "Lactose Free",
		pescatarian: "Pescatarian",
	};

	const BrowseCard = ({ browseCardName }: BrowseCardProps) => (
		<View style={styles.card}>
			<Image
				source={require("@/assets/images/react-logo.png")}
				style={styles.cardImage}
			/>
			<Text style={styles.cardText}>{browseCardName}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Ionicons
						name='search'
						size={20}
						color='#89D5ED'
					/>
					<TextInput
						style={styles.searchInput}
						placeholder='Search dietary restrictions...'
						value={searchText}
						onChangeText={setSearchText}
						placeholderTextColor='#999'
					/>
				</View>

				<View style={styles.gridContainer}>
					{Object.values(dietaryTypes).map((dietary, index) => (
						<BrowseCard
							key={index}
							browseCardName={dietary}
						/>
					))}
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "white",
	},
	container: {
		flex: 1,
		alignItems: "center", // Center horizontally
		paddingTop: 20, // Space from top
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "90%", // Control width
		borderWidth: 1,
		padding: 12,
		borderColor: "#89D5ED",
		borderRadius: 8,
		paddingHorizontal: 10,
		marginTop: 10,
	},
	searchIcon: {
		marginRight: 10,
	},
	inputSearch: {
		flex: 1,
		height: 40,
		fontSize: 16,
		outline: "none",
		...Platform.select({
			ios: {
				// iOS specific styles
				shadowColor: "transparent",
			},
			android: {
				// Android specific styles
				elevation: 0,
			},
		}),
	},

	searchInput: {
		marginLeft: 8,
		flex: 1,
		fontSize: 16,
		color: "#333",
	},
	cardText: {
		flexWrap: "wrap", // Allow text to wrap
		fontSize: 14, // Smaller font size
	},
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		padding: 16,
	},
	card: {
		width: "48%",
		marginBottom: 16,
		borderRadius: 20,
		backgroundColor: "white",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
		boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Web-specific shadow
	},
	cardImage: {
		width: 50, // Fixed width for thumbnail
		height: 50, // Fixed height for thumbnail
		borderRadius: 8, // Rounded corners
		marginRight: 8, // Space between image and text
	},

	custineTitleText: {
		marginTop: 20,
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},

	titleAndDropDownContainer: {},

	headerContainer: {
		width: "90%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	mapButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#89D5ED",
		alignSelf: "flex-end",
		marginRight: 20,
		marginBottom: 10,
	},
	mapButtonText: {
		marginLeft: 8,
		color: "#89D5ED",
		fontWeight: "500",
	},
	cancelButton: {
		padding: 8,
	},
});

