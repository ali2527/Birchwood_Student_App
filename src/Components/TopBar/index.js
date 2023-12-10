import { StyleSheet, Text, View, ImageBackground, StatusBar, } from 'react-native'
import React from 'react'
import main_bg_img from '../../Assets/images/animated_bg.png';
import { vh } from '../../theme/units';



export default function TopBar({ children }) {
    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <ImageBackground
                source={main_bg_img}
                style={[styles.bg_img]}
                resizeMode='cover'
            >
                {children}
                <View style={styles.whiteBorder} />
            </ImageBackground>
        </>
    )
}

const styles = StyleSheet.create({
    bg_img: {
        height: vh * 22,
        justifyContent: 'flex-end'
    },
    whiteBorder: {
        height: vh * 3,
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        backgroundColor: '#fff'
    },
})