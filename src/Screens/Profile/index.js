import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useEffect } from 'react'
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
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';
import { useAppDispatch, useAppSelector } from '../../Stores/hooks';
import { asyncGetUserProfile, asyncGetAllMyChildren } from '../../Stores/actions/user.action';
import { selectUserProfile } from '../../Stores/slices/user.slice';
import { selectChildren } from '../../Stores/slices/class.slice';
import UserProfileCircle from '../../Components/ProfileCircle';

export default function Profile() {

    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const profile = useAppSelector(selectUserProfile);
    const children = useAppSelector(selectChildren);

    console.log('children:::', children);

    useEffect(() => {
        dispatch(asyncGetUserProfile());
        dispatch(asyncGetAllMyChildren());
    }, [dispatch]);

    const getProfileImage = (index) => {
        const images = [dp1, dp2, dp3];
        return images[index % 3];
    };

    const renderProfileDetails = () => {
        if (!profile?._id) return null;

        return (
            <View style={styles.profileDetailsContainer}>
                {/* Profile Header Section */}
                <View style={styles.profileHeaderSection}>
                    <View style={styles.profileImageContainer}>
                        <UserProfileCircle
                            profileUri={profile?.image || dp1}
                            disabled={true}
                            _style={styles.profileImage}
                        />
                        <TouchableOpacity
                            onPress={() => navigation.navigate(routes.screens.profileForm)}
                            style={styles.editButton}
                        >
                            <Ionicon name="create-outline" size={16} color={colors.theme.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.profileHeaderContent}>
                        <View style={styles.nameRow}>
                            <GlroyBold
                                text={`${profile?.fatherFirstName || profile?.firstName || ''} ${profile?.fatherLastName || profile?.lastName || ''}`.trim()}
                                _style={styles.profileName}
                            />

                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Contact Information Section */}
                <View style={styles.infoSection}>
                    {profile?.email && (
                        <View style={[styles.infoRow, styles.infoRowSpacing]}>
                            <View style={styles.iconContainer}>
                                <Ionicon name="mail-outline" size={18} color={colors.theme.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <GrayMediumText text={profile.email} _style={styles.infoValue} />
                            </View>
                        </View>
                    )}

                    {profile?.phone && (
                        <View style={[styles.infoRow, styles.infoRowSpacing]}>
                            <View style={styles.iconContainer}>
                                <Ionicon name="call-outline" size={18} color={colors.theme.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <GrayMediumText text={profile.phone} _style={styles.infoValue} />
                            </View>
                        </View>
                    )}

                    {(profile?.address || profile?.city || profile?.state) && (
                        <View style={[styles.infoRow, styles.infoRowSpacing]}>
                            <View style={styles.iconContainer}>
                                <Ionicon name="location-outline" size={18} color={colors.theme.secondary} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <GrayMediumText
                                    text={[profile?.address, profile?.city, profile?.state].filter(Boolean).join(', ')}
                                    _style={styles.infoValue}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Section Divider */}
                <View style={styles.sectionDivider} />

                {/* Children Section Header */}
                <View style={styles.childrenSectionHeader}>
                    <Text style={styles.childrenSectionTitle}>My Children</Text>
                    <TouchableOpacity
                        style={styles.addChildBtn}
                        onPress={() => navigation.navigate(routes.screens.addChild)}
                    >
                        <Ionicon name="add" size={16} color={colors.theme.white} />
                        <Text style={styles.addChildBtnText}>Assign Child</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.item}>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                <Image
                    source={item?.image ? { uri: item.image } : getProfileImage(index)}
                    style={styles.dpStyle}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <GlroyBold text={`${item?.firstName || ''} ${item?.lastName || ''}`.trim()} />
                    <GrayMediumText
                        text={`Class ${item?.classroom?.classroomName || 'N/A'} | Roll no: ${item?.rollNumber || 'N/A'}`}
                        _style={{ fontSize: 12 }}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate(routes.screens.profileForm)}
                    style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', padding: 5 }}
                >
                    <Text style={{ fontSize: 10, fontWeight: 'bold', marginHorizontal: 3 }}>
                        Edit
                    </Text>
                    <Image source={edit} style={styles.editIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicon name="chevron-back-outline" size={18} color={colors.theme.white} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>My Profile</Text>
                    </View>
                </View>
            </TopBar>
            <FlatList
                data={children}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListHeaderComponent={renderProfileDetails}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No children found</Text>
                    </View>
                }
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
        justifyContent: 'space-between',
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
        margin: 15,
        padding: 10
    },
    dpStyle: {
        height: 50,
        width: 50,
        borderRadius: 25,
        resizeMode: 'contain'
    },
    editIcon: {
        height: 10,
        width: 10,
        resizeMode: 'contain'
    },
    profileDetailsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,


    },
    profileHeaderSection: {
        alignItems: 'center',

    },
    profileImageContainer: {
        marginBottom: 15,
    },
    profileImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
    },
    profileHeaderContent: {
        width: '100%',
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 24,
        color: colors.text.black,
    },
    editButton: {
        padding: 6,
        position: 'absolute',
        bottom: -6,
        right: 0,
        backgroundColor: colors.theme.primary,
        borderRadius: 100,
        elevation: 5,

    },
    divider: {
        height: 1,
        backgroundColor: colors.theme.secondary,
        opacity: 0.2,
        marginBottom: 20,
    },
    infoSection: {
        // gap: 20, // Not supported in older RN versions
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoRowSpacing: {
        marginBottom: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.theme.secondary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: colors.text.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
        color: colors.text.black,
        lineHeight: 20,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: colors.theme.secondary,
        opacity: 0.1,
        marginTop: 20,
        marginBottom: 10,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.text.gray,
    },
    childrenSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    childrenSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.black,
    },
    addChildBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.theme.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addChildBtnText: {
        color: colors.theme.white,
        fontWeight: '600',
        fontSize: 12,
        marginLeft: 4,
    }
})