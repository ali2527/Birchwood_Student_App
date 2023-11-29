import React from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'
import main_logo from '../../Assets/images/logo/main_logo.png';

const MainLogo = ({_style}) => {
  return (
   <Image 
    source={main_logo} 
    style={{...styles.img, ..._style}}
    resizeMode='contain'
    />
  )
}

export default MainLogo

const styles = StyleSheet.create({
    img:{
        //  backgroundColor:'red',
        marginTop:5,
        height:70,
        width:'80%'
        // flex:1
    }
})