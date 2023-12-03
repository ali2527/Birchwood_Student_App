import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const BackArrow = () => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
            <IonicIcon name='arrow-back-outline' size={25} color={colors.theme.primary} />
        </TouchableOpacity>
    );
};

