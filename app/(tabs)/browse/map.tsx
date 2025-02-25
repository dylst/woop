import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Camera } from "react-native-maps";
import {
	StyleSheet,
	View,
	TouchableOpacity,
	ActivityIndicator,
	Text,
} from "react-native";
import { mapService } from "@/app/api/services/mapService";
import { Map } from "@/types/map.types";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MapScreen = () => {
	const router = useRouter();
	const [markers, setMarkers] = useState<Map[] | null>(null);
	const mapRef = useRef<MapView | null>(null); // ✅ Use ref to control the map

	useEffect(() => {
		async function fetchData() {
			try {
				const data = await mapService.fetchMarkerLongLang("Long Beach");
				setMarkers(data);
			} catch (error) {
				console.error("Error fetching markers:", error);
			}
		}
		fetchData();
	}, []);

	const initialRegion = {
		latitude: 33.7701,
		longitude: -118.1937,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	};

	// ✅ Function to Zoom In
	const zoomIn = () => {
		if (mapRef.current) {
			mapRef.current.getCamera().then((camera: Camera) => {
				mapRef.current?.animateCamera({
					center: camera.center,
					zoom: camera.zoom + 1, // 🔍 Zoom In
				});
			});
		}
	};

	// ✅ Function to Zoom Out
	const zoomOut = () => {
		if (mapRef.current) {
			mapRef.current.getCamera().then((camera: Camera) => {
				mapRef.current?.animateCamera({
					center: camera.center,
					zoom: camera.zoom - 1, // 🔎 Zoom Out
				});
			});
		}
	};

	return (
		<View style={styles.container}>
			{/* Back Button */}
			<TouchableOpacity
				onPress={() => router.back()}
				style={styles.backButton}
			>
				<Ionicons
					name='arrow-back'
					size={24}
					color='black'
				/>
			</TouchableOpacity>

			{/* Show loading indicator until markers are fetched */}
			{!markers ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator
						size='large'
						color='#007AFF'
					/>
					<Text style={styles.loadingText}>Loading Map...</Text>
				</View>
			) : (
				<>
					<MapView
						ref={mapRef} // ✅ Attach ref to MapView
						provider={PROVIDER_GOOGLE}
						style={styles.map}
						initialRegion={initialRegion}
						zoomEnabled={true}
						zoomControlEnabled={false} // Hide built-in controls
						scrollEnabled={true}
						pitchEnabled={true}
					>
						{markers.map((marker, index) => (
							<Marker
								key={index}
								title={marker.name}
								coordinate={{
									latitude: parseFloat(marker.latitude),
									longitude: parseFloat(marker.longitude),
								}}
							/>
						))}
					</MapView>
					<View style={styles.zoomButtonsContainer}>
						<TouchableOpacity
							style={styles.zoomInButton}
							onPress={zoomIn}
						>
							<Ionicons
								name='add'
								size={24}
								color='black'
							/>
						</TouchableOpacity>

						{/* ✅ Zoom Out Button */}
						<TouchableOpacity
							style={styles.zoomOutButton}
							onPress={zoomOut}
						>
							<Ionicons
								name='remove'
								size={24}
								color='black'
							/>
						</TouchableOpacity>
					</View>
					{/* ✅ Zoom In Button */}
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	map: {
		flex: 1,
	},

	backButton: {
		position: "absolute",
		top: 50,
		left: 20,
		backgroundColor: "white",
		padding: 10,
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 5,
		zIndex: 10,
	},

	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8f8f8",
	},

	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: "#333",
	},

	zoomInButton: {
		position: "absolute",
		bottom: 135,
		right: 20,
		backgroundColor: "white",
		padding: 10,
		borderRadius: 50,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 5,
		zIndex: 10,
	},

	zoomOutButton: {
		position: "absolute",
		bottom: 80,
		right: 20,
		backgroundColor: "white",
		padding: 10,
		borderRadius: 50,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 5,
		zIndex: 10,
	},
	zoomButtonsContainer: {
		position: "absolute",
		bottom: 20,
		right: 20,
	}
});

export default MapScreen;
