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
import TopBar from "@/components/ui/TopBar";
interface BrowseCardProps {
	browseCardName: string;
	image: any;
}

export default function Cuisine() {
	const [searchText, setSearchText] = useState("");
	const router = useRouter();

	const cuisineTypes = {
		american: {
			name: "American",
			image: require("@/assets/images/food/american.jpg"),
		},
		chilean: {
			name: "Chilean",
			image: require("@/assets/images/food/Chilean.png"),
		},
		chinese: {
			name: "Chinese",
			image: require("@/assets/images/food/Chinese.png"),
		},
		filipino: {
			name: "Filipino",
			image: require("@/assets/images/food/Filipino.png"),
		},
		french: {
			name: "French",
			image: require("@/assets/images/food/French.png"),
		},
		greek: {
			name: "Greek",
			image: require("@/assets/images/food/Greek.png"),
		},
		indonesian: {
			name: "Indonesian",
			image: require("@/assets/images/food/Indonesian.png"),
		},
		japanese: {
			name: "Japanese",
			image: require("@/assets/images/food/Japanese.png"),
		},
		mediterranean: {
			name: "Mediterranean",
			image: require("@/assets/images/food/Mediterranean.png"),
		},
		mexican: {
			name: "Mexican",
			image: require("@/assets/images/food/Mexican.png"),
		},
		spanish: {
			name: "Spanish",
			image: require("@/assets/images/food/Spanish.png"),
		},
		taiwanese: {
			name: "Taiwanese",
			image: require("@/assets/images/food/Taiwanese.png"),
		},
		thai: {
			name: "Thai",
			image: require("@/assets/images/food/Thai.png"),
		},
		vietnamese: {
			name: "Vietnamese",
			image: require("@/assets/images/food/Vietnamese.png"),
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
			<View style={styles.topBarContainer}>
				<TopBar />
			</View>
			<View style={styles.container}>
				{/* <View style={styles.searchContainer}>
					<Ionicons
						name='search'
						size={20}
						color='#89D5ED'
					/>
					<TextInput
						style={styles.searchInput}
						placeholder='Search cuisines...'
						value={searchText}
						onChangeText={setSearchText}
						placeholderTextColor='#999'
					/>
				</View> */}

				<View style={styles.gridContainer}>
					{Object.values(cuisineTypes).map((cuisine, index) => (
						<BrowseCard
							key={index}
							browseCardName={cuisine.name}
							image={cuisine.image}
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
	},
	topBarContainer: {
		paddingHorizontal: 20,
		width: "100%",
		maxWidth: 800,
		alignSelf: "center",
		marginBottom: 10,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "90%", // Control width
		borderWidth: 1,
		borderColor: "#89D5ED",
		borderRadius: 8,
		paddingHorizontal: 10,
		marginTop: 20, // Add margin from top
		marginBottom: 20, // Add margin before grid
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		marginLeft: 8,
		flex: 1,
		fontSize: 16,
		color: "#333",
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
});
