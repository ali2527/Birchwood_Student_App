import React from 'react'
import { StyleSheet, Text, View } from 'react-native'


const GlroyBold = ({text, _style}) => {
  return (<Text style={{...styles.text, ..._style}}>{text}</Text>)
}

export default GlroyBold

const styles = StyleSheet.create({
    text:{
        fontFamily: 'Glory-Bold',
        fontSize: 16,
        fontWeight: 'bold',
    }
})