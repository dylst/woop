import React from 'react'
import { 
    Image,
    Text,
    ImageSourcePropType, 
    StyleProp,
    TouchableOpacity, 
    ViewStyle,
    StyleSheet,
} from 'react-native';
import { Route, useRouter } from 'expo-router';

interface FiltersHomeProps {
    imageSource: ImageSourcePropType | { uri: string };
    title: string;
    style?: StyleProp<ViewStyle>;
    routePath?: Route;
}

const FiltersHomeNav: React.FC<FiltersHomeProps> = ({
    imageSource,
    title,
    style,
    routePath = '/browse',
}) => {
    const router = useRouter();

    const handlePress = () => {
      router.push(routePath);
    };

    return (
        <TouchableOpacity style={[styles.newBox, style]} onPress={handlePress}>
            <Image source={imageSource} style={styles.newImage} />
            <Text style={styles.newBoxText}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
      newBox: {
        width: '48%',
        height: 250,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 2,
        alignItems: 'center',
      },
      newImage: {
        width: '100%',
        height: '75%',
        borderTopLeftRadius: 19,
        borderTopRightRadius: 19,
      },
      newBoxText: {
        fontSize: 24,
        fontWeight: '800',
        paddingVertical: 16,
      },
})

export default FiltersHomeNav;