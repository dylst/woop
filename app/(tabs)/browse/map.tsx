import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	Dimensions,
	TextInput,
	Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView from '@teovilla/react-native-web-maps';


export default function MapScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>

			<MapView
				style={{ width: "100%", height: "100%" }}
				provider="google"
				googleMapsApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS} as any // Quick TypeScript bypass
				loadingFallback={
					<View>
						<Text>Loading Map...</Text>
					</View>
				}
			/>

				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<View style={styles.searchBar}>
						<Ionicons
							name='search'
							size={20}
							color='#666'
						/>
						<TextInput
							placeholder='Search for restaurants, cuisines...'
							style={styles.searchInput}
							placeholderTextColor='#666'
						/>
					</View>
				</View>

				{/* Popular Foods Bottom Sheet */}
				<View style={styles.bottomSheet}>
					<Text style={styles.bottomSheetTitle}>Popular Near You</Text>
					<View style={styles.popularItems}>
						<View style={styles.popularItem}>
							<Text style={styles.itemTitle}>Pizza</Text>
							<Text style={styles.itemSubtitle}>15+ places nearby</Text>
						</View>
						<View style={styles.popularItem}>
							<Text style={styles.itemTitle}>Sushi</Text>
							<Text style={styles.itemSubtitle}>8 places nearby</Text>
						</View>
					</View>
				</View>
			{/*</ImageBackground>*/}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backgroundImage: {
		flex: 1,
		width: "100%",
		height: "100%",
		resizeMode: "cover", // Add this to ImageBackground component
	},
	searchContainer: {
		padding: "4%",
		marginTop: "10%",
	},
	searchBar: {
		width: "92%",
		alignSelf: "center",
		backgroundColor: "white",
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		marginTop: "-5%",
	},
	searchInput: {
		flex: 1,
		marginLeft: 10,
		fontSize: 16,
		color: "#333",
		backgroundColor: "white",
	},
	popularItems: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		padding: "2%",
	},
	popularItem: {
		width: "48%",
		marginBottom: "2%",
	},
	bottomSheet: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		width: "100%",
		maxHeight: "40%",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	bottomSheetTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
		paddingHorizontal: 4,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	itemSubtitle: {
		fontSize: 14,
		color: "#666",
	},
	backButton: {
		position: "absolute",
		top: 50,
		left: 20,
		backgroundColor: "white",
		padding: 8,
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		zIndex: 1,
	},
});
