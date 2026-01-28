
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { vh, vw } from '../../theme/units';
import GlroyBold from '../GlroyBoldText';
import GrayMediumText from '../GrayMediumText';
import moment from 'moment';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const PostItem = ({ item }) => {
    const { width } = useWindowDimensions();

    const renderMedia = () => {
        if (item.images && item.images.length > 0) {
            return (
                <Image
                    source={{ uri: item.images[0] }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            );
        }
        // Show placeholder when no image
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>No Image</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.authorContainer}>
                    <View style={styles.authorAvatar}>
                        {/* Placeholder for author avatar if available in 'author' object or use default */}
                        <Text style={styles.authorInitials}>
                            {/* naive initial extraction */}
                            A
                        </Text>
                    </View>
                    <View>
                        <GlroyBold text={'Admin'} _style={{ fontSize: 16 }} />
                        <GrayMediumText text={moment(item.createdAt).fromNow()} _style={{ fontSize: 12 }} />
                    </View>
                </View>
            </View>

            <View style={styles.content}>

                {item.content ? (
                    <RenderHtml
                        contentWidth={width}
                        source={{ html: item.content }}
                        baseStyle={{ color: colors.text.black }}
                    />
                ) : null}
            </View>

            {renderMedia()}

            {/* Interaction buttons (Like/Comment) could go here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.theme.white,
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        // ...appShadow // assuming appShadow is available globally or imported effectively, using simpler shadow for now if not
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.theme.lightGray, // Assuming this color exists or use a fallback
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    authorInitials: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.theme.primary, // Assuming primary color exists
    },
    content: {
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: vh * 25,
        borderRadius: 8,
        marginTop: 10,
    },
    placeholderContainer: {
        width: '100%',
        height: vh * 25,
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: colors.theme.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: colors.text.grey,
    },
});

export default PostItem;
