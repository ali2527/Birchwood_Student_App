import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, Animated, Keyboard, View, Image, StatusBar } from 'react-native';
import main_bg_img from '../../Assets/images/animated_bg.png';
import right_icon from '../../Assets/images/icon_right.png';
import left_icon from '../../Assets/images/icon_left.png';


const AnimatedBackgroundImage = ({ children, source, additionalImage }) => {
    const [imageHeight] = useState(new Animated.Value(200)); // Initial height of the image
    const additionalImageHeight = new Animated.Value(320);
    const additionalImageMarginTop = new Animated.Value(-50);
    const statusBarHeight = StatusBar.currentHeight || 0;
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            Animated.parallel([
                Animated.timing(imageHeight, {
                    toValue: 100, // Adjust the value based on your design
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(additionalImageHeight, {
                    toValue: 190, // Adjust the value based on your design
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(additionalImageMarginTop, {
                    toValue: -20 - statusBarHeight, // Adjust the value based on your design (reduce margin top)
                    duration: 300,
                    useNativeDriver: false,
                  }),
            ]).start();
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            Animated.parallel([
                Animated.timing(imageHeight, {
                    toValue: 200, // Back to the initial height
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(additionalImageHeight, {
                    toValue: 320, // Back to the initial size
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(additionalImageMarginTop, {
                    toValue: -20 - statusBarHeight, // Back to the initial margin top
                    duration: 300,
                    useNativeDriver: false,
                  }),
            ]).start();
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [imageHeight, additionalImageHeight, additionalImageMarginTop]);

    return (
        <Animated.View style={[styles.container, { height: imageHeight }]}>
            <ImageBackground source={main_bg_img} style={styles.image} resizeMode="cover">
                <Image source={left_icon} style={styles.additionalImageLeft} />
                {/* <Image source={additionalImage} style={styles.additionalImageCenter} /> */}
                <Animated.Image
                    source={additionalImage}
                    style={[styles.additionalImageCenter, { height: additionalImageHeight,marginTop: additionalImageMarginTop }]}
                />
                <Image source={right_icon} style={styles.additionalImageRight} />

            </ImageBackground>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end', // Align content to the bottom
    },
    additionalImageCenter: {
        position: 'absolute',
        width: 200,
        height: 320,
        left: 50, // Position it in the middle horizontally
        bottom:-8,
        marginLeft: 15, // Center the image horizontally
        zIndex: 1, // Ensure the additional image is above the background image
        resizeMode: 'contain'

    },
    additionalImageLeft: {
        position: 'absolute',
        width: 30,
        height: 30,
        top: 100, // Position it in the middle vertically
        left: 80, // Position it in the middle horizontally
        transform: [{ translateX: -50 }, { translateY: -50 }], // Center the image
    },
    additionalImageRight: {
        position: 'absolute',
        width: 45,
        height: 45,
        bottom: 40,
        right: 5, // Position it in the middle vertically
        // left: 10, // Position it in the middle horizontally
        transform: [{ translateX: -50 }, { translateY: -50 }], // Center the image
    }
});

export default AnimatedBackgroundImage;
