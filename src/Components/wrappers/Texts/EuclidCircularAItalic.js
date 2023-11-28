import { StyleSheet, Text } from 'react-native';

import React from 'react';
import styles from './styles';

const EuclidCircularAItalic = props => {
    return (
        <Text
            allowFontScaling={false}
            adjustsFontSizeToFit={false}
            ellipsizeMode="tail"
            {...props}
            style={[styles.text, styles.euclidCircularAItalic, props.style]}>
            {props.text}
        </Text>
    );
};

export default EuclidCircularAItalic;