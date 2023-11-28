import { StyleSheet, Text } from 'react-native';

import React from 'react';
import styles from './styles';

const EuclidCircularASemiBoldItalic = props => {
    return (
        <Text
            allowFontScaling={false}
            adjustsFontSizeToFit={false}
            ellipsizeMode="tail"
            {...props}
            style={[styles.text, styles.euclidCircularASemiBoldItalic, props.style]}>
            {props.text}
        </Text>
    );
};

export default EuclidCircularASemiBoldItalic;