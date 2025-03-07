import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Camera } from "react-native-maps";
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
import { Colors } from "@/constants/Colors";
import { useLocation } from "@/hooks/useLocation";

const formatHours = (hours?: string): string[] => {
	if (!hours || typeof hours !== "string") return [];

	const safeHours = hours.length > 200 ? hours.substring(0, 200) : hours;
	return safeHours.split(" | ").map(line => line.trim());
}

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

	const { currentLocation, initialRegion: userInitialRegion } = useLocation();

	const initialRegion = {
		latitude: 33.7701,
		longitude: -118.1937,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	};
	
	// Compute the region for the MapView
	const computedRegion =
    currentLocation || userInitialRegion
      ? {
          latitude: (currentLocation || userInitialRegion)!.latitude,
          longitude: (currentLocation || userInitialRegion)!.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }
      : initialRegion;

	// ✅ Function to Zoom In
	const zoomIn = () => {
		if (mapRef.current) {
			mapRef.current.getCamera().then((camera: Camera) => {
				const currentZoom = camera.zoom ?? 15;
				mapRef.current?.animateCamera({
					center: camera.center,
					zoom: currentZoom + 1, // 🔍 Zoom In
				});
			});
		}
	};

	// ✅ Function to Zoom Out
	const zoomOut = () => {
		if (mapRef.current) {
			mapRef.current.getCamera().then((camera: Camera) => {
				const currentZoom = camera.zoom ?? 15;
				mapRef.current?.animateCamera({
					center: camera.center,
					zoom: currentZoom - 1, // 🔎 Zoom Out
				});
			});
		}
	};
	
	if (!markers) {
		return (
		  <View style={styles.loadingContainer}>
			<ActivityIndicator size="large" color="#007AFF" />
			<Text style={styles.loadingText}>Loading Map...</Text>
		  </View>
		);
	  }
	

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
						region={computedRegion}
						zoomEnabled={true}
						zoomControlEnabled={false} // Hide built-in controls
						scrollEnabled={true}
						pitchEnabled={true}
					>
						{markers.map((marker, index) => {
							const formattedHours = formatHours(marker.hours);

							const zipcodeString = marker.zipcode != null && Number.isSafeInteger(marker.zipcode)
								? marker.zipcode.toString()
								: '';

							const websiteUrl = marker.webUrl;

							return (
								<Marker
									key={index}
									// title={marker.name}
									// description={marker.addressLin}
									coordinate={{
										latitude: parseFloat(marker.latitude),
										longitude: parseFloat(marker.longitude),
									}}
								>
									<Callout>
										<View style={styles.mapMarkerContainer}>
											<Text style={styles.mapMarkerTitle}>{marker.name}</Text>
											<Text style={styles.mapMarkerDescription}>
												{`${marker.addressLin ?? ''}, ${marker.city ?? ''}, ${marker.state ?? ''} ${zipcodeString}`}
											</Text>
											{formattedHours.length > 0 ? (
												formattedHours.map((block, i) => (
													<Text key={i} style={styles.hoursText}>{block}</Text>
												))
											) : (
												<Text style={styles.hoursText}>Hours not available</Text>
											)}
											{websiteUrl ? (
												<Text style={styles.urlText}>{websiteUrl}</Text>
											) : ('')}
										</View>
									</Callout>
								</Marker>
							)
						}
						)}
						 {/* Render a marker for the user's current location */}
						 {currentLocation && (
							<Marker
								coordinate={currentLocation}
								title="You are here"
								pinColor="blue" // 🔵
							/>
						)}
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
	},

	mapMarkerContainer: {
		width: 250,
		padding: 6,
	},

	mapMarkerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: Colors.primary.darkteal,
		marginBottom: 6,
	},

	mapMarkerDescription: {
		fontSize: 14,
		color: '#333',
	},

	hoursText: {
		fontSize: 13,
		marginTop: 4,
		color: '#333',
	},

	urlText: {
		marginTop: 4,
		fontSize: 10,
		color: Colors.primary.darkteal,
	}
});

export default MapScreen;
