import { supabase } from '@/supabaseClient';

export interface RatingInfo {
    average: number;
    count: number;
}

export const fetchRatings = async (itemIds: string[]): Promise<{ [key: string]: RatingInfo }> => {
    if (itemIds.length === 0) return {};

    const { data, error } = await supabase
        .from('review')
        .select('food_item_id, rating')
        .in('food_item_id', itemIds);

    if (error) {
        console.error('Error fetching ratings:', error);
        return {};
    }
    if (!data) return {};

    const map: { [key: string]: { sum: number, count: number } } = {};

    data.forEach((row) => {
        if (!map[row.food_item_id]) {
            map[row.food_item_id] = { sum: 0, count: 0 };
        }
        map[row.food_item_id].sum += row.rating;
        map[row.food_item_id].count += 1;
    });

    const finalMap: { [key: string]: RatingInfo } = {};
    for (const fid in map) {
        const sum = map[fid].sum;
        const count = map[fid].count;
        finalMap[fid] = {
            average: count === 0 ? 0 : sum / count,
            count,
        };
    }    
    
    return finalMap;
};