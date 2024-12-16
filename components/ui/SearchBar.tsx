import React from 'react'
import {
    View,
    TextInput,
    StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const SearchBar = () => {
  return (
    <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#2897ba" />
        <TextInput
          placeholder="Search food item..."
          style={styles.searchInput}
        />
      </View>
  )
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#c2effd',
        borderStyle: 'solid',
        borderWidth: 1,
        backgroundColor: 'rgba(194,239,253,0.2)',
        padding: 10,
        borderRadius: 50,
        elevation: 2,
      },
      searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#2897ba',
      },
})
export default SearchBar;