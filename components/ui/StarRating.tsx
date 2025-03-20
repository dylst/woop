import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StarRatingProps = {
    average: number;
    size?: number;
    fullColor?: string;
    emptyColor?: string;
    style?: ViewStyle;
}

const StarRating: React.FC<StarRatingProps> = ({
    average,
    size = 12,
    fullColor = "#ffd700",
    emptyColor = "#ccc",
    style,
}) => {
    const stars = [];
    // Integer part
    const floorVal = Math.floor(average);
    // Decimal part
    const decimal = average - floorVal;
    // Half star
    const hasHalf = decimal >= 0.5

    // full star
    for (let i = 0; i < floorVal && i < 5; i++) {
        stars.push(<Ionicons key={`full-${i}`} name="star" size={size} color={fullColor} style={{ marginRight: 2 }} />)
    }

    if (hasHalf && floorVal < 5) {
        stars.push(<Ionicons key="half" name="star-half" size={size} color={fullColor} style={{ marginRight: 2 }} />)
    }

    const noStars = floorVal + (hasHalf ? 1 : 0);
    for (let i = noStars; i < 5; i++) {
        stars.push(<Ionicons key={`empty-${i}`} name="star" size={size} color={emptyColor} style={{ marginRight: 2 }} />)
    }

    return <View style={[{ flexDirection: 'row' }, style]}>{stars}</View>;
}

export default StarRating;