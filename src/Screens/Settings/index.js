import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { vh, vw } from '../../theme/units'
import { colors } from '../../theme/colors'
import Ionicon from 'react-native-vector-icons/Ionicons'
import TopBar from '../../Components/TopBar'
import { useNavigation } from '@react-navigation/native'
import routes from '../../Navigation/routes'
import { useAppDispatch } from '../../Stores/hooks'
import { asyncSignOut } from '../../Stores/actions/user.action'

export default function Settings() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

    const handleLogout = () => {
        dispatch(asyncSignOut());
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.theme.white }}>
            <TopBar>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicon name="chevron-back-outline" size={18} color={colors.theme.white} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text.white, marginLeft: 10, fontWeight: 'bold', bottom: 1 }}>Settings</Text>
                    </View>
                </View>
            </TopBar>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionTitle}>Account & Settings</Text>

                {/* My Profile Link - Navigates to Profile Screen as requested */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => navigation.navigate(routes.screens.profile)}
                >
                    <View style={styles.settingIconContainer}>
                        <Ionicon name="person-outline" size={20} color={colors.theme.primary} />
                    </View>
                    <Text style={styles.settingText}>My Profile</Text>
                    <Ionicon name="chevron-forward-outline" size={18} color={colors.text.gray} />
                </TouchableOpacity>

                {/* Notification Toggle */}
                <View style={[styles.settingItem, { paddingVertical: 10 }]}>
                    <View style={styles.settingIconContainer}>
                        <Ionicon
                            name={isNotificationEnabled ? "notifications-outline" : "notifications-off-outline"}
                            size={20}
                            color={isNotificationEnabled ? colors.theme.primary : colors.text.gray}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.settingText}>Notifications</Text>
                        <Text style={styles.settingSubtext}>{isNotificationEnabled ? 'Enabled' : 'Disabled'}</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#767577', true: colors.theme.primary + '30' }}
                        thumbColor={isNotificationEnabled ? colors.theme.primary : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setIsNotificationEnabled(prev => !prev)}
                        value={isNotificationEnabled}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.settingItem, styles.logoutItem]}
                    onPress={handleLogout}
                >
                    <View style={[styles.settingIconContainer, { backgroundColor: '#FF525215' }]}>
                        <Ionicon name="log-out-outline" size={20} color="#FF5252" />
                    </View>
                    <Text style={[styles.settingText, { color: '#FF5252' }]}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        margin: 10,
        bottom: vh * 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.black,
        marginBottom: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.theme.secondary + '10',
    },
    settingIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.theme.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    settingText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.black,
        flex: 1,
    },
    settingSubtext: {
        fontSize: 12,
        color: colors.text.gray,
        marginTop: 1,
    },
    logoutItem: {
        borderBottomWidth: 0,
        marginTop: 10,
    },
})
