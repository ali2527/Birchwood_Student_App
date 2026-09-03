import React from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { vh, vw } from '../../theme/units';
import { colors } from '../../theme/colors';
import GlroyBold from '../../Components/GlroyBoldText';
import routes from '../../Navigation/routes';
import { schoolGallery } from '../../Assets';
import { useAppDispatch } from '../../Stores/hooks';
import { asyncSignOut } from '../../Stores/actions/user.action';
const EmptyDashboard = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();

    const handleLinkChild = () => {
        navigation.navigate(routes.screens.addChild);
    };

    const handleLogout = () => {
        dispatch(asyncSignOut());
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.theme.white} />
            <View style={styles.content}>
                <Image
                    source={schoolGallery.smiling_child}
                    style={styles.illustration}
                    resizeMode="cover"
                />

                <GlroyBold
                    text="No children linked yet"
                    _style={styles.title}
                />

                <Text style={styles.subtitle}>
                    Link your child to start receiving school updates
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLinkChild}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Link Child</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default EmptyDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.theme.white,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: vw * 10,
    },
    illustration: {
        width: vw * 80,
        height: vh * 40,
        marginBottom: vh * 4,
        borderRadius: 20,
        overflow: 'hidden',
    },
    title: {
        fontSize: 24,
        color: colors.text.black,
        textAlign: 'center',
        marginBottom: vh * 1.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.gray,
        textAlign: 'center',
        marginBottom: vh * 2,
        lineHeight: 24,
    },
    button: {
        backgroundColor: colors.theme.primary || '#4CAF50', // Fallback to a green if primary not defined
        paddingVertical: vh * 2,
        paddingHorizontal: vw * 15,
        borderRadius: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: colors.theme.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: vh * 2,
        paddingVertical: vh * 1.4,
        paddingHorizontal: vw * 10,
    },
    logoutText: {
        color: colors.theme.mehron,
        fontSize: 16,
        fontWeight: '600',
    },
});
