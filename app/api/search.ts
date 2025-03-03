import { supabase } from '@/supabaseClient';

// Filter options interface
interface FilterOptions {
  priceRange?: number[];
  minRating?: number;
  maxDistance?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export const searchFoodItems = async (
  keyword: string,
  filters?: FilterOptions
) => {
  try {
    // Get the basic search results first
    const { data, error } = await supabase
      .from('fooditem')
      .select(
        'id, food_name, restaurant_name, photos, price_range, cuisine_type, dietary_tags, description'
      )
      .or(
        `food_name.ilike.%${keyword}%, 
                cuisine_type.ilike.%${keyword}%, 
                dietary_tags.ilike.%${keyword}%, 
                description.ilike.%${keyword}%`
      )
      .limit(100); // Get more results to filter

    if (error) {
      console.error('Error searching food items:', error);
      return [];
    }

    // If no filters, just return the data
    if (!filters || Object.keys(filters).length === 0) {
      return data || [];
    }

    // Apply price range filter
    let filteredResults = data || [];
    if (filters.priceRange && filters.priceRange.length > 0) {
      filteredResults = filteredResults.filter((item) =>
        filters.priceRange!.includes(item.price_range)
      );
    }

    // If we need to filter by rating, fetch ratings for these items
    if (filters.minRating && filters.minRating > 0) {
      // Extract food item IDs for rating lookup
      const foodIds = filteredResults.map((item) => item.id);

      // Fetch ratings for these items
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('review')
        .select('food_item_id, rating')
        .in('food_item_id', foodIds);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
      } else if (ratingsData) {
        // Calculate average ratings
        const ratingsMap: { [key: string]: { sum: number; count: number } } =
          {};
        ratingsData.forEach((review) => {
          if (!ratingsMap[review.food_item_id]) {
            ratingsMap[review.food_item_id] = { sum: 0, count: 0 };
          }
          ratingsMap[review.food_item_id].sum += review.rating;
          ratingsMap[review.food_item_id].count += 1;
        });

        // Filter by minimum rating
        filteredResults = filteredResults.filter((item) => {
          const rating = ratingsMap[item.id];
          return rating && rating.sum / rating.count >= filters.minRating!;
        });
      }
    }

    // If we need to filter by distance, fetch restaurant locations
    if (
      filters.maxDistance &&
      filters.maxDistance > 0 &&
      filters.userLocation
    ) {
      // Extract unique restaurant names using an object as a map
      const restaurantNamesMap: { [key: string]: boolean } = {};
      filteredResults.forEach((item) => {
        if (item.restaurant_name) {
          restaurantNamesMap[item.restaurant_name] = true;
        }
      });
      const restaurantNames = Object.keys(restaurantNamesMap);

      // Fetch restaurant locations
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant')
        .select('name, latitude, longitude')
        .in('name', restaurantNames);

      if (restaurantError) {
        console.error('Error fetching restaurant locations:', restaurantError);
      } else if (restaurantData) {
        // Create a map for quick lookups
        const restaurantMap: {
          [key: string]: { latitude: string; longitude: string };
        } = {};
        restaurantData.forEach((restaurant) => {
          restaurantMap[restaurant.name] = {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          };
        });

        // Filter by distance
        filteredResults = filteredResults.filter((item) => {
          const restaurant = restaurantMap[item.restaurant_name];
          if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
            return false; // Skip if no location data
          }

          const distance = calculateDistance(
            filters.userLocation!.latitude,
            filters.userLocation!.longitude,
            parseFloat(restaurant.latitude),
            parseFloat(restaurant.longitude)
          );

          return distance <= filters.maxDistance!;
        });
      }
    }

    return filteredResults;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Helper function to calculate distance between two coordinates using the Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  // Convert to numbers if they're strings
  const latFrom = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
  const lonFrom = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
  const latTo = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
  const lonTo = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;

  // Haversine formula
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((latTo - latFrom) * Math.PI) / 180;
  const dLon = ((lonTo - lonFrom) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latFrom * Math.PI) / 180) *
      Math.cos((latTo * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles

  return distance;
};
