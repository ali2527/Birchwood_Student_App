import { StyleSheet, Text, View, ImageBackground, StatusBar, Image, FlatList } from 'react-native'
import React, { useState } from 'react'
import { vh, vw } from '../../theme/units'
import main_bg_img from '../../Assets/images/animated_bg.png';
import GlroyBold from '../../Components/GlroyBoldText';
import profile_icon from '../../Assets/images/profile_bg.png';
import { colors } from '../../theme/colors';
import UserProfileCircle from '../../Components/ProfileCircle';
import student from '../../Assets/icons/student.png';

export default function HomeScreen() {
    const [profile, setProfile] = useState({
        name: 'Allen',
        year: '2023 - 2024',
        photo: ''
    })

    const data = Array.from({ length: 10 }, (_, index) => ({ id: index.toString(), title: `Item ${index + 1}` }));

    const renderItem = ({ item, index }) => {
        const isFirstColumn = index % 2 === 0;
        const isFirstChild = index === 0;
        const cardHeight = isFirstColumn ? (isFirstChild ? 60 : 40) : 40;

        return (
            <View style={[styles.card, { height: cardHeight }]}>
                <Text>{item.title}</Text>
            </View>
        );
    };

    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <ImageBackground
                source={main_bg_img}
                style={styles.bg_img}
                resizeMode='cover'
            >
                <View style={styles.profile_container}>
                    <View>
                        <GlroyBold
                            text={`Hi ${profile.name}`}
                            _style={styles.profile_text}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                            <View style={styles.student_year}>
                                <Text style={{ fontSize: 12 }}>{profile.year}</Text>
                            </View>
                            <View style={styles.student_icon}>
                                <Image
                                    source={student}
                                    style={styles.student_icon_img}
                                    resizeMode='contain'
                                    tintColor={colors.theme.primary}
                                />
                            </View>
                        </View>
                    </View>
                    <UserProfileCircle
                        profileUri={profile_icon}
                        disabled={true}
                        _style={styles.profilePhoto}
                    />
                </View>
            </ImageBackground>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
            />
        </>
    )
}

const styles = StyleSheet.create({
    bg_img: {
        height: vh * 30,
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    profile_text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.theme.white
    },
    profile_container: {
        marginTop: vh * 8,
        margin: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    student_year: {
        backgroundColor: colors.theme.white,
        paddingHorizontal: 12,
        padding: 1.5,
        borderRadius: 12
    },
    student_icon: {
        marginLeft: 5,
        height: 25,
        width: 25,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.theme.white
    },
    student_icon_img: {
        height: 15,
        width: 15
    },
    profilePhoto: {
        borderWidth: 2,
        borderColor: colors.theme.white
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#ececec',
        justifyContent: 'center',
        alignItems: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
      },
})