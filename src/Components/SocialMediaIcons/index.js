import React from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { icons } from '../../Assets/icons'

const SocialMediaIcons = () => {
    return (
        <View style={styles.icons_container}>
            <TouchableOpacity>
                <Image source={icons.facebook} style={styles.icon} resizeMode='contain' />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image source={icons.twitter} style={styles.icon} resizeMode='contain' />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image source={icons.instagram} style={styles.icon} resizeMode='contain' />
            </TouchableOpacity>
        </View>
    )
}

export default SocialMediaIcons

const styles = StyleSheet.create({
    icons_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        marginTop: 10
      },
      icon: {
        height: 35,
        width: 35,
        borderRadius: 35 / 2,
        margin: 10
      },
})