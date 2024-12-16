import React from 'react'
import {
    TouchableOpacity,
    Image,
    View,
    Text,
    StyleSheet,
    ImageSourcePropType,
    StyleProp,
    ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturedCardProps {
    imageSource: ImageSourcePropType | { uri: string };
    title: string;
    restaurantName: string;
    addressLine: string;
    // onPress: () => void;
    style?: StyleProp<ViewStyle>;
    // rating: number;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
    imageSource,
    title,
    restaurantName,
    addressLine,
    // onPress,
    style,
    // rating
}) => {
  return (
    <TouchableOpacity style={[styles.card, style]}>
            <Image source={imageSource} style={styles.cardImage} />
            <View style={styles.cardDescription}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardAddress}>{restaurantName}</Text>
              <Text style={styles.cardAddress}>{addressLine}</Text>
              {/* <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="gold" />
                <Text style={styles.cardRating}>{rating}</Text>
              </View> */}
            </View>
          </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    card: {
        width: 250,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 16,
        elevation: 2,
      },
      cardDescription: {
        marginTop: 10,
        margin: 16,
      },
      cardImage: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 19,
        borderTopRightRadius: 19,
      },
      cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      cardAddress: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
      },
      ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
      },
      cardRating: {
        marginLeft: 4,
        fontSize: 14,
        color: '#333',
      },
})

export default FeaturedCard;