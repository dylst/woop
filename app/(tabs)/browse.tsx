import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "react-native";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput } from "react-native";
// Teal color used in figma: 89D5ED
interface CuisineCardProps {
	cuisineName: string;
}

const Favorites = () => {
	const [text, setText] = useState("");

	const cusineTypes = {
		american: "American",
		italian: "Italian",
		mexican: "Mexican",
		chinese: "Chinese",
		japanese: "Japanese",
		indian: "Indian",
		french: "French",
		mediterranean: "Mediterranean",
	};

	const cusineArray = Object.values(cusineTypes);

	const CuisineCard = ({ cuisineName }: CuisineCardProps) => (
		<View style={styles.card}>
			<Image
				source={require("@/assets/images/react-logo.png")} // Placeholder image
				style={styles.cardImage}
			/>
			<Text style={styles.cardText}>{cuisineName}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.searchContainer}>
					<Ionicons
						name='search'
						size={24}
						color={"#89D5ED"}
					/>
					<TextInput
						style={styles.inputSearch}
						placeholder='Search food item...'
						value={text}
						onChangeText={setText}
						placeholderTextColor='#999'
						selectionColor='#89D5ED' // Changes text selection color
						cursorColor='#89D5ED' // Changes cursor color
						autoFocus={false}
					/>
				</View>
				<View>
					<Text style={styles.custineTitleText}>Favorite Cusines</Text>
					
				</View>
				<View>
					<View style={styles.gridContainer}>
						{cusineArray.map((cuisine, index) => (
							<CuisineCard
								key={index}
								cuisineName={cuisine}
							/>
						))}
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
};

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

	cusineContainer: {},
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
});

export default Favorites;
