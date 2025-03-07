// useLocation.ts
import { useState, useEffect } from "react";
import * as Location from "expo-location";

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [initialRegion, setInitialRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | undefined>(undefined);

  // Get the initial location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  // Watch the location for updates
  useEffect(() => {
    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 2000,
      },
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      }
    );
    return () => {
      subscription.then((sub) => sub.remove());
    };
  }, []);

  return { currentLocation, initialRegion };
};
