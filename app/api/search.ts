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
  selectedCuisines?: string[];
  selectedDietary?: string[];
}

/**
 * Converts a numeric price range (1-4) to a literal dollar sign string ("$" to "$$$$")
 */
const convertPriceToSymbol = (price: number): string => {
  return '$'.repeat(price);
};

export const searchFoodItems = async (
  keyword: string,
  filters?: FilterOptions
) => {
  try {
    console.log('-------- SEARCH DEBUG START --------');
    console.log('Search called with keyword:', keyword);
    console.log('Filters applied:', JSON.stringify(filters, null, 2));

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
      );

    // Apply price range filter directly in query if provided
    if (filters?.priceRange && filters.priceRange.length > 0) {
      // Convert numeric price ranges to literal "$" strings
      const priceSymbols = filters.priceRange.map((price) =>
        convertPriceToSymbol(price)
      );
      console.log(
        'Applying price range filter directly in query with symbols:',
        priceSymbols
      );

      // Use the .in() operator for the price_range column
      query = query.in('price_range', priceSymbols);
    }

    // Apply limit to query
    query = query.limit(100);

    // Execute the query
    const { data, error } = await query;

    // If there was an error or no data, return empty array
    if (error) {
      console.error('Error searching food items:', error);
      return [];
    }

    console.log(`Initial search returned ${data?.length || 0} results`);

    // Log a sample of the initial results
    if (data && data.length > 0) {
      console.log('Sample of first result:');
      const sample = data[0];
      console.log({
        id: sample.id,
        food_name: sample.food_name,
        cuisine_type: sample.cuisine_type,
        dietary_tags: sample.dietary_tags,
        price_range: sample.price_range,
      });
    }

    // Since we can't use SQL for searching within array elements through Supabase API,
    // we'll filter the results in JavaScript to include items where array elements match
    let allResults = (data || []).filter((item) => {
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
      // First ensure arrays exist and are properly formatted
      const cuisineArray = Array.isArray(item.cuisine_type)
        ? item.cuisine_type
        : typeof item.cuisine_type === 'string'
        ? [item.cuisine_type]
        : [];

      const dietaryArray = Array.isArray(item.dietary_tags)
        ? item.dietary_tags
        : typeof item.dietary_tags === 'string'
        ? [item.dietary_tags]
        : [];

      const matchesCuisine = cuisineArray.some((cuisine: string) =>
        cuisine.toLowerCase().includes(lowerKeyword)
      );

      const matchesDietary = dietaryArray.some((tag: string) =>
        tag.toLowerCase().includes(lowerKeyword)
      );

      return matchesCuisine || matchesDietary;
    });

    console.log(`After text search filtering: ${allResults.length} results`);

    // If no filters, just return the results
    if (!filters || Object.keys(filters).length === 0) {
      console.log('No filters applied, returning all results');
      console.log('-------- SEARCH DEBUG END --------');
      return allResults;
    }

    // Make a copy of initial results for debugging
    const initialFilteredResults = [...allResults];

    // Apply cuisine and dietary filters
    if (filters.selectedCuisines && filters.selectedCuisines.length > 0) {
      // OR logic for cuisines - any selected cuisine type is acceptable
      const beforeCount = allResults.length;
      console.log('APPLYING CUISINE FILTER:');
      console.log('Selected cuisines:', filters.selectedCuisines);

      // Log some sample cuisine data from results
      const cuisineSamples = allResults.slice(0, 3).map((item) => ({
        id: item.id,
        cuisine_type: Array.isArray(item.cuisine_type)
          ? item.cuisine_type
          : typeof item.cuisine_type === 'string'
          ? [item.cuisine_type]
          : [],
      }));
      console.log('Sample cuisine data from results:', cuisineSamples);

      allResults = allResults.filter((item) => {
        // Ensure cuisine_type is always an array and normalize values for comparison
        const cuisineArray = Array.isArray(item.cuisine_type)
          ? item.cuisine_type.map((c: string) => c.toLowerCase().trim())
          : typeof item.cuisine_type === 'string'
          ? [item.cuisine_type.toLowerCase().trim()]
          : [];

        // Log the actual cuisine types for this item
        console.log(`Item ${item.id} cuisine types:`, cuisineArray);

        // Check if ANY of the selected cuisines match the item's cuisine types (case insensitive)
        const normalizedSelectedCuisines = filters.selectedCuisines!.map((c) =>
          c.toLowerCase().trim()
        );

        const matches = normalizedSelectedCuisines.some(
          (cuisine) =>
            cuisineArray.includes(cuisine) ||
            cuisineArray.some((c) => c.includes(cuisine) || cuisine.includes(c))
        );

        console.log(`Item ${item.id} cuisine match: ${matches}`);
        return matches;
      });
      console.log(
        `After cuisine filter: ${beforeCount} -> ${allResults.length} results`
      );
    }

    if (filters.selectedDietary && filters.selectedDietary.length > 0) {
      // AND logic for dietary - all selected dietary restrictions must be met
      const beforeCount = allResults.length;
      console.log('APPLYING DIETARY FILTER:');
      console.log('Selected dietary tags:', filters.selectedDietary);

      // Log some sample dietary data from results
      const dietarySamples = allResults.slice(0, 3).map((item) => ({
        id: item.id,
        dietary_tags: Array.isArray(item.dietary_tags)
          ? item.dietary_tags
          : typeof item.dietary_tags === 'string'
          ? [item.dietary_tags]
          : [],
      }));
      console.log('Sample dietary data from results:', dietarySamples);

      allResults = allResults.filter((item) => {
        // Ensure dietary_tags is always an array and normalize values
        const dietaryArray = Array.isArray(item.dietary_tags)
          ? item.dietary_tags.map((t: string) => t.toLowerCase().trim())
          : typeof item.dietary_tags === 'string'
          ? [item.dietary_tags.toLowerCase().trim()]
          : [];

        // Log the actual dietary tags for this item
        console.log(`Item ${item.id} dietary tags:`, dietaryArray);

        // Check if ALL of the selected dietary tags are included in the item's dietary tags (case insensitive)
        const normalizedSelectedDietary = filters.selectedDietary!.map((t) =>
          t.toLowerCase().trim()
        );

        const matches = normalizedSelectedDietary.every(
          (tag) =>
            dietaryArray.includes(tag) ||
            dietaryArray.some((t) => t.includes(tag) || tag.includes(t))
        );

        console.log(`Item ${item.id} dietary match: ${matches}`);
        return matches;
      });
      console.log(
        `After dietary filter: ${beforeCount} -> ${allResults.length} results`
      );
    }

    // We've already applied price range filter in the initial query
    console.log('Price range filter was applied directly in database query');

    // If we've filtered out all results, let's debug why
    if (allResults.length === 0 && initialFilteredResults.length > 0) {
      console.log('ALL RESULTS WERE FILTERED OUT. EXAMINING INITIAL RESULTS:');
      initialFilteredResults.forEach((item, index) => {
        if (index < 5) {
          // Limit to first 5 for brevity
          console.log(`Item ${item.id}:`, {
            food_name: item.food_name,
            cuisine_type: item.cuisine_type,
            dietary_tags: item.dietary_tags,
            price_range: item.price_range,
          });
        }
      });
    }

    // Distance filtering (unchanged)
    if (
      filters.maxDistance &&
      filters.maxDistance > 0 &&
      filters.userLocation
    ) {
      // Extract unique restaurant names using an object as a map
      const restaurantNamesMap: { [key: string]: boolean } = {};
      allResults.forEach((item) => {
        if (item.restaurant_name) {
          restaurantNamesMap[item.restaurant_name] = true;
        }
      });
      const restaurantNames = Object.keys(restaurantNamesMap);

      if (restaurantNames.length === 0) {
        console.log('No restaurant names found for distance filtering');
        console.log('-------- SEARCH DEBUG END --------');
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
        const beforeCount = allResults.length;
        console.log('APPLYING DISTANCE FILTER:');
        console.log('Max distance:', filters.maxDistance);

        allResults = allResults.filter((item) => {
          const restaurant = restaurantMap[item.restaurant_name];
          if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
            console.log(`Item ${item.id} has no location data, skipping`);
            return false; // Skip if no location data
          }

          const distance = calculateDistance(
            filters.userLocation!.latitude,
            filters.userLocation!.longitude,
            parseFloat(restaurant.latitude),
            parseFloat(restaurant.longitude)
          );

          const matches = distance <= filters.maxDistance!;
          console.log(
            `Item ${item.id} distance ${distance.toFixed(
              1
            )} miles match: ${matches}`
          );
          return matches;
        });
        console.log(
          `After distance filter: ${beforeCount} -> ${allResults.length} results`
        );
      }
    }

    console.log(`Final search results count: ${allResults.length}`);
    console.log('-------- SEARCH DEBUG END --------');
    return allResults;
  } catch (err) {
    console.error('Unexpected error:', err);
    console.log('-------- SEARCH DEBUG END (ERROR) --------');
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
