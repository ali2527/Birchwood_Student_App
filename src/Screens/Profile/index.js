import { StyleSheet, Text, View, FlatList, Platform, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { vh, vw } from '../../theme/units'
import GlroyBold from '../../Components/GlroyBoldText';
import { colors } from '../../theme/colors';
import GrayMediumText from '../../Components/GrayMediumText';
import Ionicon from 'react-native-vector-icons/Ionicons';
import TopBar from '../../Components/TopBar';
import dp1 from '../../Assets/icons/dp1.png';
import dp2 from '../../Assets/icons/dp2.png';
import dp3 from '../../Assets/icons/dp3.png';
import edit from '../../Assets/icons/edit.png';

export default function Profile() {

    const studentData = [
        {
            id: 1,
            name: 'Allen',
            roll_no: '04',
            class: 'XI-B'
        },
        {
            id: 2,
            name: 'Bob',
            roll_no: '04',
            class: 'XI-B'
        },
        {
            id: 3,
            name: 'Alli',
            roll_no: '04',
            class: 'XI-B'
        }
    ]

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={{flexDirection:'row', alignItems:'center', position:'relative'}}>
               <Image source={item.id == 3 ? dp3 : item.id == 2 ? dp2 : dp1} style={styles.dpStyle}/>
               <View style={{marginLeft:10, flex:1}}>
                   <GlroyBold text={item.name}/>
                   <GrayMediumText text={`Class ${item.class} | Roll no: ${item.roll_no}`} 
                    _style={{fontSize:12}}
                   />
               </View>
               <TouchableOpacity style={{alignSelf:'flex-start', flexDirection:'row', alignItems:'center', padding:5}}>
                   <Text style={{fontSize:10,fontWeight:'bold', marginHorizontal:3}}>
                      Edit
                   </Text>
                   <Image source={edit} style={styles.editIcon}/>
               </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicon name="chevron-back-outline" size={18} color={colors.theme.white} />
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>My Profile</Text>
                    </View>
                    <TouchableOpacity style={styles.editContainer}>
                        <Ionicon name="add-outline" size={15} color={colors.theme.white} style={styles.addIcon} />
                        <Text style={{ color: colors.theme.secondary, fontWeight: 'bold', fontSize: 13 }}>Add</Text>
                    </TouchableOpacity>
                </View>
            </TopBar>
            <FlatList
                data={studentData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </>

    )
}

const styles = StyleSheet.create({
    header: {
        margin: 10,
        bottom: vh * 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: colors.theme.white,
        borderRadius: 15,
        padding: 3,
        bottom: 3
    },
    addIcon: {
        // height:20,
        // width:20,
        backgroundColor: colors.theme.secondary,
        borderRadius: 10,
        marginHorizontal: 5
    },
    item: {
        borderWidth: 1,
        borderColor: colors.theme.secondary,
        borderRadius: 10,
        margin:15,
        padding:10
    },
    dpStyle:{
        height:50,
        width:50,
        borderRadius:25,
        resizeMode:'contain'
    },
    editIcon:{
        height:10,
        width:10,
        resizeMode:'contain'
    }
    
})