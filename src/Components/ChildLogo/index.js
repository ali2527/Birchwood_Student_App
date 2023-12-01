import React from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'
import chil_logo from '../../Assets/images/logo/child_logo.png';

const ChildLogo = ({_style}) => {
  return (
   <Image 
    source={chil_logo} 
    style={{...styles.img, ..._style}}
    resizeMode='contain'
    />
  )
}

export default ChildLogo

const styles = StyleSheet.create({
    img:{

        //   backgroundColor:'red',
        //  height:'100%',
        // width:'80%'
        // flex:1
    }
})