import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme/colors'

const GrayMediumText = ({text, _style}) => {
  return (<Text style={{...styles.text, ..._style}}>{text}</Text>)
}

export default GrayMediumText

const styles = StyleSheet.create({
    text:{
        fontSize: 14,
        fontWeight: 'bold',
        color:colors.text.grey
    }
})