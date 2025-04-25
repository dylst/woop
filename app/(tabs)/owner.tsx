import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, Image,
  Pressable, ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
import TopBar from '@/components/ui/TopBar';
import { Colors } from '@/constants/Colors';
import { ActivityIndicator } from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import { difference } from 'next/dist/build/utils';
// import { DeepDiff } from 'deep-diff';
const diff = require('deep-diff');


type Difference = { field: string; old: any; new: any; suggestion_id:number };
type FoodItemDiff = { food_item_id: number; differences: Difference[] };

// Define the KeyBy type for the response
type KeyBy<T, K extends keyof T> = {
  [key in T[K] & (string | number | symbol)]: T;
};


const favorites = () => {
  const router = useRouter();
  const { user } = useUser();
  const [changes, setChanges] = useState<KeyBy<FoodItemDiff, 'food_item_id'>>({});

  
  const userId = user?.id;

  const [foodItemIds, setFoodItemIds] = useState<number[]>([]);
  
  const [isSortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortButtonPosition, setSortButtonPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  const screenWidth = Dimensions.get('window').width;
     
  const fetchFoodItems = async (ids: number[]) => {
    const { data, error } = await supabase
         .from('fooditem')
         .select(`food_name,
         cuisine_type,
         dietary_tags,
         price_range,
         restaurant_name,
         description,
         id
         `)
            .in('id', ids);
   
       if (error) {
         console.log(error);
         return;
       }
       return data;
 }
  
  
 const keyBy = <T, K extends keyof T>(array: T[], key: K): KeyBy<T, K> => {
  return array.reduce((acc, item) => {
    acc[item[key] as T[K] & (string | number | symbol)] = item;
    return acc;
  }, {} as KeyBy<T, K>);
};

  
  const fetchSuggestions = async () => {
    const { data, error } = await supabase
      .from("food_item_suggestions")
      .select(`food_name,
        cuisine_type,
        dietary_tags,
        price_range,
        restaurant_name,
        description,
        suggestion_id:id,
        id:food_item_id
        `)

      if (error) {
      console.log("Error fetching item");
      return;
    }
    const uniqueFoodItemIds = [...new Set(data.map((item) => item.id))];
    setFoodItemIds(uniqueFoodItemIds);
    fetchFoodItems(uniqueFoodItemIds);
    const foodItems = await fetchFoodItems(uniqueFoodItemIds);
    const foodItemsById = keyBy(foodItems ??[], "id");

    
    const foodItemsDiff = data.map((suggestedItem) => {
      const originalItem = foodItemsById[suggestedItem.id];

      // If the original item exists, compare the two items
      if (originalItem) {
        const differences = diff(originalItem, suggestedItem); // Get the diff using deep-diff
        const formattedDiff = formatEditedChanges(differences);
        const formattedDiffWithSuggestionId = formattedDiff.map((diff) => ({
          ...diff,
          suggestion_id: suggestedItem.suggestion_id, // Add suggestion_id
        })); 
        return { food_item_id: suggestedItem.id, differences: formattedDiffWithSuggestionId };     }
        return null; // If no match, return null

    }).filter((item) => item != null);
    
    console.log("Food Item Differences:", keyBy(foodItemsDiff, 'food_item_id'));
    const keyedChanges = keyBy(foodItemsDiff as FoodItemDiff[], 'food_item_id');
    setChanges(keyedChanges);
  };
 
  function formatEditedChanges(differences: any[]): Array<{ field: string; old: any; new: any }> {
    return differences
      .filter(change => change.kind === 'E') // Filter for 'Edited' changes only
      .map(change => {
        const { path, lhs, rhs } = change;
          
        // Format the edited change
        return {field:path[0], old: lhs, new: rhs}
      });
  }

  async function acceptChange(foodItemId: number, difference:Difference) {
    console.log(difference)
    try {
      const {data, error} = await supabase
      .from('fooditem')
      .update({[difference.field]: difference.new})
      .eq('id', foodItemId);
      
      if(error){
        return console.error(error);
      }
      const {error: deleteError} = await supabase
      .from('food_item_suggestions')
      .delete()
      .eq('id', difference.suggestion_id);
      
      if(deleteError){
        return console.error(deleteError);
      }
      
      fetchSuggestions();
    }
    catch(error) {
      console.error('error accepting suggestion', error);
    }
  }

  async function denyChange(difference:Difference) {
    console.log(difference)
    try {
      const {error: deleteError} = await supabase
      .from('food_item_suggestions')
      .delete()
      .eq('id', difference.suggestion_id);
      
      if(deleteError){
        return console.error(deleteError);
      }
      
      fetchSuggestions();
    }
    catch(error){
      console.error('error accepting suggestion', error);
    }
  }

  const renderChangeItem = ({ item, index }: { item: FoodItemDiff; index: number }) => (
    <View style={styles.changeItem}>
      <Text style={styles.changeText}>Change ID: {item.food_item_id}</Text>
      <FlatList
        data={item.differences}
        keyExtractor={(difference, diffIndex) => `${index}-${diffIndex}`} // Using index for both the change and difference
        renderItem={({ item: difference }) => (
          <View style={styles.differenceContainer}>
            <Text style={styles.differenceText}>Field: {difference.field}</Text>
            <Text style={styles.differenceText}>Old Value: {difference.old}</Text>
            <Text style={styles.differenceText}>New Value: {difference.new}</Text>
          </View>
        )}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => acceptChange(item.food_item_id, item.differences[0])}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => denyChange(item.differences[0])}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    fetchSuggestions()
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar type="back" title='Owner' />
      <View style={styles.container}>
      <Text style={styles.title}>Changes List</Text>
      <FlatList
        data={Object.values(changes)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderChangeItem}
      />
    </View>
    </SafeAreaView>
  )
};



export default favorites

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWoops: {
    fontSize: 48,
    color: '#999',
  },
  emptyText: {
    fontSize: 28,
    color: '#999',
    paddingVertical: 20,
    paddingHorizontal: 40,
    textAlign: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  myFavoritesLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sortButtonText: {
    fontSize: 16,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sortMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderColor: Colors.primary.darkteal,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '60%',
  },
  sortOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.primary.darkteal,
  },
  sortOptionText: {
    fontSize: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary.darkteal,
    backgroundColor: Colors.primary.lightTealTranslucent20,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 4,
  },
  tagIcon: {
    marginRight: 4,
    color: Colors.primary.darkteal,
  },
  tagText: {
    fontSize: 14,
    color: Colors.primary.darkteal,
  },
  tagActive: {
    backgroundColor: Colors.primary.darkteal,
    borderColor: Colors.primary.darkteal,
  },
  tagTextActive: {
    color: '#fff',
  },
  tagIconActive: {
    marginRight: 4,
    color: '#fff',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemComment: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  itemTagContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  changeItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  changeText: {
    fontSize: 16,
    marginBottom: 5,
  },
  differenceContainer: {
    marginBottom: 10,
  },
  differenceText: {
    fontSize: 14,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});