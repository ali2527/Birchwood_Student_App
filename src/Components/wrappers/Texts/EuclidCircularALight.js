import { StyleSheet, Text } from 'react-native';

import React from 'react';
import styles from './styles';

const EuclidCircularALight = props => {
    return (
        <Text
            allowFontScaling={false}
            adjustsFontSizeToFit={false}
            ellipsizeMode="tail"
            {...props}
            style={[styles.text, styles.euclidCircularALight, props.style]}>
            {props.text}
        </Text>
    );
};

export default EuclidCircularALight;