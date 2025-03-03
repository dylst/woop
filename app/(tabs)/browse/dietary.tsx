import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	Image,
	Platform,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import TopBar from "@/components/ui/TopBar";

interface BrowseCardProps {
	browseCardName: string;
	image: any;
}

export default function Dietary() {
	const [searchText, setSearchText] = useState("");
	const router = useRouter();

	const dietaryTypes = {
		glutenFree: {
			name: "Gluten Free",
			image: require("@/assets/images/dietary/GlutenFree.png"),
		},
		halal: {
			name: "Halal",
			image: require("@/assets/images/dietary/Halal.png"),
		},
		lactoseFree: {
			name: "Lactose Free",
			image: require("@/assets/images/dietary/LactoseFree.png"),
		},
		meat: {
			name: "Meat",
			image: require("@/assets/images/dietary/Meat.png"),
		},
		nutFree: {
			name: "Nut Free",
			image: require("@/assets/images/dietary/NoNut.png"),
		},
		noShellfish: {
			name: "No Shellfish",
			image: require("@/assets/images/dietary/NoShellfish.png"),
		},
		organic: {
			name: "Organic",
			image: require("@/assets/images/dietary/Organic.png"),
		},
		shellfish: {
			name: "Shellfish",
			image: require("@/assets/images/dietary/Shellfish.png"),
		},
		soyFree: {
			name: "Soy Free",
			image: require("@/assets/images/dietary/SoyFree.png"),
		},
		spicy: {
			name: "Spicy",
			image: require("@/assets/images/dietary/Spicy.png"),
		},
		sweets: {
			name: "Sweets",
			image: require("@/assets/images/dietary/Sweets.png"),
		},
		vegan: {
			name: "Vegan",
			image: require("@/assets/images/dietary/Vegan.png"),
		},
		vegetarian: {
			name: "Vegetarian",
			image: require("@/assets/images/dietary/Vegetarian.png"),
		},
		yogurt: {
			name: "Yogurt",
			image: require("@/assets/images/dietary/Yogurt.png"),
		},
	};

	const BrowseCard = ({ browseCardName, image }: BrowseCardProps) => (
		<View style={styles.card}>
			<Image
				source={image}
				style={styles.cardImage}
			/>
			<Text style={styles.cardText}>{browseCardName}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView>
				{/* <TouchableOpacity
				style={styles.backButton}
				onPress={() => router.back()}
			>
				<Ionicons
					name='arrow-back'
					size={24}
					color='#333'
				/>
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity> */}
				<View style={styles.topBarContainer}>
					<TopBar type="back" backType="replace" replaceRoute="/browse" title="Dietary" />
				</View>
				<View style={styles.container}>
					{/* Search Bar */}

					<View style={styles.gridContainer}>
						{Object.values(dietaryTypes).map((dietary, index) => (
							<BrowseCard
								key={index}
								browseCardName={dietary.name}
								image={dietary.image}
							/>
						))}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "white",
		padding: 20,
	},

	topBarContainer: {
		// paddingHorizontal: 20,
		width: "100%",
		maxWidth: 800,
		alignSelf: "center",
		marginBottom: 10,
	},

	container: {
		flex: 1,
		alignItems: "center", // Center horizontally
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
		// Remove boxShadow and use platform-specific shadows
		...Platform.select({
			web: {
				boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
			},
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 4,
			},
			android: {
				elevation: 4,
			},
		}),
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
	backButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		marginLeft: 10,
	},
	backButtonText: {
		marginLeft: 8,
		fontSize: 16,
		color: "#333",
	},
});
