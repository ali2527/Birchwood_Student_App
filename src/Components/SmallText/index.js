import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme/colors'

const SmallText = ({text, _style}) => {
  return (<Text style={{...styles.text, ..._style}}>{text}</Text>)
}

export default SmallText

const styles = StyleSheet.create({
    text:{
        fontSize: 12,
        color:colors.theme.primary
    }
})