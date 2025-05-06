import React from "react";
import {
	TouchableOpacity,
	Image,
	View,
	Text,
	StyleSheet,
	ImageSourcePropType,
	StyleProp,
	ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFoodItemNavigation } from "@/hooks/navigationHelper";

interface FeaturedCardProps {
	id: string;
	photos: { uri: string };
	foodName: string;
	restaurantName: string;
	style?: StyleProp<ViewStyle>;
	rating: string;
	onHide?: (id: string) => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
	id,
	photos,
	foodName,
	restaurantName,
	style,
	rating,
	onHide,
}) => {
	const navigateToFoodItem = useFoodItemNavigation();

	const hasImage = photos?.uri;

	return (
		<TouchableOpacity
			style={[styles.card, style]}
			onPress={() => navigateToFoodItem(id)}
		>
			{hasImage ? (
				<Image
					source={photos}
					style={styles.cardImage}
				/>
			) : (
				<Ionicons
					name="image-sharp"
					size={48}
					color="#777"
				/>
			)}

			{onHide && (
				<TouchableOpacity
					style={styles.hideButton}
					onPress={(e) => {
						e.stopPropagation();
						onHide(id);
					}}
				>
					<Ionicons
						name='close-circle'
						size={24}
						color='#FFF'
					/>
				</TouchableOpacity>
			)}

			<View style={styles.cardDescriptionRow}>
				<View style={styles.cardDescription}>
					<Text style={styles.cardTitle}>{foodName}</Text>
					<Text style={styles.cardAddress}>{restaurantName}</Text>
				</View>
				<View style={styles.ratingContainer}>
					<Ionicons
						name='star'
						size={24}
						color='gold'
					/>
					<Text style={styles.cardRating}>{rating}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		width: 250,
		backgroundColor: "#fff",
		borderRadius: 20,
		marginRight: 16,
		elevation: 2,
	},
	cardDescriptionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 10,
		margin: 16,
	},
	cardDescription: {
		marginVertical: 4,
	},
	cardImage: {
		width: "100%",
		height: 140,
		borderTopLeftRadius: 19,
		borderTopRightRadius: 19,
		backgroundColor: "#ccc",
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: "700",
	},
	cardAddress: {
		fontSize: 11,
		fontWeight: "400",
		color: "#666",
		marginTop: 4,
	},
	ratingContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 4,
		marginHorizontal: 6,
	},
	cardRating: {
		marginLeft: 4,
		fontSize: 20,
		fontWeight: "800",
		color: "#333",
	},
	hideButton: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "rgba(0,0,0,0.5)",
		borderRadius: 12,
		zIndex: 5,
		padding: 2,
	},
});

export default FeaturedCard;
