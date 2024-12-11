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


interface FiltersHomeProps {
    imageSource: ImageSourcePropType | { uri: string };
    title: string;
    style?: StyleProp<ViewStyle>;
}

const FiltersHomeNav: React.FC<FiltersHomeProps> = ({
    imageSource,
    title,
    style,
}) => {
    return (
        <TouchableOpacity style={[styles.newBox, style]}>
            <Image source={imageSource} style={styles.newImage} />
            <Text style={styles.newBoxText}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
      newBox: {
        width: '48%',
        height: 290,
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
        fontWeight: 'bold',
        paddingTop: 20,
        paddingBottom: 16,
      },
})

export default FiltersHomeNav;