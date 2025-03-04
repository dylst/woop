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
    // Sanitize the keyword to prevent SQL injection
    const sanitizedKeyword = keyword.replace(/[%_]/g, '');
    const likePattern = `%${sanitizedKeyword}%`;
    const lowerKeyword = sanitizedKeyword.toLowerCase();

    // Get the basic search results first - using proper operators for different field types
    let query = supabase
      .from('fooditem')
      .select(
        'id, food_name, restaurant_name, photos, price_range, cuisine_type, dietary_tags, description'
      )
      // Use ilike for text fields
      .or(
        `food_name.ilike.${likePattern},description.ilike.${likePattern},restaurant_name.ilike.${likePattern}`
      )
      .limit(100);

    // Execute the query
    const { data, error } = await query;

    // If there was an error or no data, return empty array
    if (error) {
      console.error('Error searching food items:', error);
      return [];
    }

    // Since we can't use SQL for searching within array elements through Supabase API,
    // we'll filter the results in JavaScript to include items where array elements match
    const allResults = (data || []).filter((item) => {
      // First check if this item was already included in the text search results
      const matchesText =
        (item.food_name &&
          item.food_name.toLowerCase().includes(lowerKeyword)) ||
        (item.description &&
          item.description.toLowerCase().includes(lowerKeyword)) ||
        (item.restaurant_name &&
          item.restaurant_name.toLowerCase().includes(lowerKeyword));

      if (matchesText) return true;

      // Check arrays (cuisine_type and dietary_tags)
      const matchesCuisine = item.cuisine_type?.some((cuisine: string) =>
        cuisine.toLowerCase().includes(lowerKeyword)
      );

      const matchesDietary = item.dietary_tags?.some((tag: string) =>
        tag.toLowerCase().includes(lowerKeyword)
      );

      return matchesCuisine || matchesDietary;
    });

    // If no filters, just return the results
    if (!filters || Object.keys(filters).length === 0) {
      return allResults;
    }

    // Apply price range filter
    let filteredResults = allResults;
    if (filters.priceRange && filters.priceRange.length > 0) {
      filteredResults = filteredResults.filter((item) =>
        filters.priceRange!.includes(item.price_range)
      );
    }

    // If we need to filter by rating, fetch ratings for these items
    if (filters.minRating && filters.minRating > 0) {
      // Extract food item IDs for rating lookup
      const foodIds = filteredResults.map((item) => item.id);

      if (foodIds.length === 0) {
        return [];
      }

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

      if (restaurantNames.length === 0) {
        return [];
      }

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
