// Types for ranking algorithm
export interface RatingData {
  average: number;
  count: number;
  newestReview?: Date | null;
}

export interface RankingWeights {
  avgRating: number;
  reviewCount: number;
  recency: number;
  userPreference: number;
}

export interface UserPreferences {
  cuisines?: string[];
  dietary?: string[];
  priceRange?: number[];
}

// Default weights for ranking factors
const DEFAULT_WEIGHTS: RankingWeights = {
  avgRating: 0.5,
  reviewCount: 0.3,
  recency: 0.1,
  userPreference: 0.1,
};

/**
 * Calculates a ranking score for a food item based on multiple factors
 * @param foodItem The food item object from database
 * @param ratingsData Rating statistics for the food item
 * @param userPreferences User's preferred cuisines, dietary needs, etc.
 * @param customWeights Optional custom weights for different ranking factors
 * @returns A normalized score between 0-1 representing the item's overall ranking
 */
export const calculateRankingScore = (
  foodItem: any,
  ratingsData?: RatingData,
  userPreferences: UserPreferences = {},
  customWeights?: Partial<RankingWeights>
) => {
  // Use default weights merged with any custom weights
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...(customWeights || {}),
  };

  // Extract basic rating metrics with defaults
  const avgRating = ratingsData?.average || 0;
  const reviewCount = ratingsData?.count || 0;

  // 1. Rating score (normalized to 0-1)
  const ratingScore = avgRating / 5;

  // 2. Review count score (logarithmic scale to prevent popular items from dominating)
  // log10(100) ≈ 2, so this gives a reasonable curve up to ~100 reviews
  const reviewCountScore =
    reviewCount > 0 ? Math.min(Math.log10(reviewCount + 1) / 2, 1) : 0;

  // 3. Recency score based on most recent review
  const recencyScore = calculateRecencyScore(ratingsData?.newestReview);

  // 4. User preference matching score
  const preferenceScore = calculatePreferenceScore(foodItem, userPreferences);

  // Calculate final weighted score
  const finalScore =
    weights.avgRating * ratingScore +
    weights.reviewCount * reviewCountScore +
    weights.recency * recencyScore +
    weights.userPreference * preferenceScore;

  return finalScore;
};

/**
 * Calculates a recency score based on the newest review date
 * @param newestReview Date of the most recent review
 * @returns A score between 0-1 where newer items score higher
 */
const calculateRecencyScore = (newestReview?: Date | null): number => {
  if (!newestReview) return 0.5; // Default if no review date

  const now = new Date();
  const reviewDate = new Date(newestReview);

  // Calculate days since the review
  const daysSinceReview = Math.max(
    0,
    (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Score decreases as review gets older
  // 0 days = 1.0, 30 days = 0.5, 90+ days = 0.1
  if (daysSinceReview <= 0) return 1.0;
  if (daysSinceReview >= 90) return 0.1;

  // Linear decline for first 30 days
  if (daysSinceReview <= 30) {
    return 1.0 - daysSinceReview / 60;
  }

  // Slower decline after 30 days
  return 0.5 - (daysSinceReview - 30) / 120;
};

/**
 * Calculates a preference matching score based on user preferences
 * @param foodItem Food item object
 * @param userPreferences User's preferred cuisines, dietary needs, etc.
 * @returns A score between 0-1 where better matches score higher
 */
const calculatePreferenceScore = (
  foodItem: any,
  userPreferences: UserPreferences
): number => {
  let matchPoints = 0;
  let totalPoints = 0;

  // Match cuisine types
  if (
    userPreferences.cuisines &&
    userPreferences.cuisines.length > 0 &&
    foodItem.cuisine_type &&
    foodItem.cuisine_type.length > 0
  ) {
    totalPoints += 1;
    const normalizedFoodCuisines = Array.isArray(foodItem.cuisine_type)
      ? foodItem.cuisine_type.map((c: string) => c.toLowerCase())
      : [foodItem.cuisine_type.toLowerCase()];

    const normalizedPreferences = userPreferences.cuisines.map((c) =>
      c.toLowerCase()
    );

    // Calculate match ratio
    const matchingCuisines = normalizedPreferences.filter((c) =>
      normalizedFoodCuisines.includes(c)
    ).length;

    if (matchingCuisines > 0) {
      // Add points based on how many cuisines match
      matchPoints += matchingCuisines / normalizedPreferences.length;
    }
  }

  // Match dietary preferences - these are treated as essential
  if (
    userPreferences.dietary &&
    userPreferences.dietary.length > 0 &&
    foodItem.dietary_tags &&
    foodItem.dietary_tags.length > 0
  ) {
    totalPoints += 1.5; // Weigh dietary more heavily
    const normalizedFoodDietary = Array.isArray(foodItem.dietary_tags)
      ? foodItem.dietary_tags.map((d: string) => d.toLowerCase())
      : [foodItem.dietary_tags.toLowerCase()];

    const normalizedPreferences = userPreferences.dietary.map((d) =>
      d.toLowerCase()
    );

    // For dietary, we want a perfect match, or no points
    const allPreferencesMet = normalizedPreferences.every((d) =>
      normalizedFoodDietary.includes(d)
    );

    if (allPreferencesMet) {
      matchPoints += 1.5;
    }
  }

  // Match price preference
  if (
    userPreferences.priceRange &&
    userPreferences.priceRange.length > 0 &&
    foodItem.price_range
  ) {
    totalPoints += 1;

    // Convert price range string (like "$") to number for comparison
    const foodItemPriceLevel = foodItem.price_range.length;

    if (userPreferences.priceRange.includes(foodItemPriceLevel)) {
      matchPoints += 1;
    }
  }

  // Return normalized score or 0.5 if no preferences were available
  return totalPoints > 0 ? matchPoints / totalPoints : 0.5;
};

/**
 * Processes raw review data into rating statistics for each food item
 * @param reviewsData Array of review objects from the database
 * @returns Object mapping food IDs to rating statistics
 */
export const processRatingData = (
  reviewsData: any[]
): Record<string, RatingData> => {
  const ratingsByFoodId: Record<
    string,
    {
      ratings: number[];
      dates: string[];
    }
  > = {};

  reviewsData.forEach((review) => {
    const foodId = review.food_item_id;
    if (!ratingsByFoodId[foodId]) {
      ratingsByFoodId[foodId] = {
        ratings: [],
        dates: [],
      };
    }
    ratingsByFoodId[foodId].ratings.push(review.rating);
    ratingsByFoodId[foodId].dates.push(review.review_date);
  });

  // Calculate statistics for each food item
  const processedData: Record<string, RatingData> = {};

  Object.keys(ratingsByFoodId).forEach((foodId) => {
    const data = ratingsByFoodId[foodId];
    const sum = data.ratings.reduce((acc, rating) => acc + rating, 0);
    const count = data.ratings.length;
    const average = count > 0 ? sum / count : 0;

    // Calculate recency - newest review timestamp
    const newestReview =
      data.dates.length > 0
        ? new Date(Math.max(...data.dates.map((d) => new Date(d).getTime())))
        : null;

    processedData[foodId] = {
      average,
      count,
      newestReview,
    };
  });

  return processedData;
};
