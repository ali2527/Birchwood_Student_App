import React from 'react';
import { Text } from 'react-native';
import styles from './styles';

const EuclidCircularAMedium = props => {
    return (
        <Text
            allowFontScaling={false}
            adjustsFontSizeToFit={false}
            ellipsizeMode="tail"
            {...props}
            style={[styles.text, styles.euclidCircularAMedium, props.style]}>
            {props.text}
        </Text>
    );
};

export default EuclidCircularAMedium;