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
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { mapService } from "@/app/api/services/mapService";
import { Map } from "@/types/map.types";
import MapView, {
  Marker,
  MarkerClusterer,
  Region,
  ClusterProps,
} from "@teovilla/react-native-web-maps";

function ClusterComponent(props: ClusterProps<{ onPress(): void }>) {
  return (
    <Marker
      onPress={props.onPress}
      coordinate={props.coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.cluster}>
        <Text style={styles.clusterText}>{props.pointCount}</Text>
      </View>
    </Marker>
  );
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const router = useRouter();
  const [markers, setMarkers] = useState<Map[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        setIsLoading(true);
        const res = await mapService.fetchMarkerLongLang("Long Beach");
        setMarkers(res);
      } catch (error) {
        console.error("Error fetching markers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarkers();
  }, []);

  const loadingFallback = useMemo(() => (
    <View style={styles.loadingContainer}>
      <Text>Loading Map...</Text>
    </View>
  ), []);

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const memoizedMarkers = useMemo(() =>
    markers.map((m, index) => (
      <Marker
        key={m.id || index}
        coordinate={{
          latitude: parseFloat(m.latitude),
          longitude: parseFloat(m.longitude),
        }}
      />
    )),
    [markers]
  );

  const handleClusterPress = useCallback((cluster: any) => {
    mapRef.current?.animateCamera({
      center: cluster.coordinate,
      zoom: cluster.expansionZoom + 3,
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        provider="google"
        ref={mapRef}
        googleMapsApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        loadingFallback={loadingFallback}
        minZoomLevel={2}
        maxZoomLevel={20}
      >
        <MarkerClusterer
          region={region}
          renderCluster={(cluster) => (
            <ClusterComponent
              {...cluster}
              onPress={() => handleClusterPress(cluster)}
            />
          )}
        >
          {memoizedMarkers}
        </MarkerClusterer>
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search for restaurants, cuisines..."
            style={styles.searchInput}
            placeholderTextColor="#666"
          />
        </View>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: "4%",
    marginTop: "10%",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
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
  cluster: {
    backgroundColor: "salmon",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterText: {
    color: 'white',
    fontWeight: "700",
  },
});