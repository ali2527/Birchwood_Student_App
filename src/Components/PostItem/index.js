
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { vh, vw } from '../../theme/units';
import GlroyBold from '../GlroyBoldText';
import moment from 'moment';
import VectorIcon from '../VectorIcons';
import { useNavigation } from '@react-navigation/native';
import routes from '../../Navigation/routes';

import { getImagePath } from '../../Service/axios';

const PostItem = ({ item }) => {
    const navigation = useNavigation();

    const activityTitle = item.activity?.title || item.type || 'Activity';

    const getActivityIcon = (title) => {
        const t = title?.toLowerCase() || '';
        if (t.includes('read')) return { name: 'book', color: '#4CAF50' };
        if (t.includes('play')) return { name: 'game-controller', color: '#2196F3' };
        if (t.includes('eat') || t.includes('food')) return { name: 'restaurant', color: '#FF9800' };
        if (t.includes('sleep')) return { name: 'bed', color: '#9C27B0' };
        return { name: 'star', color: colors.theme.primary };
    };

    const iconData = getActivityIcon(activityTitle);

    const handlePress = () => {
        navigation.navigate(routes.screens.activityDetail, { item });
    };

    const isWholeClass = item.type === 'CLASS' || !item.children || item.children.length === 0;

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={handlePress}>
            {/* Header: Icon, Type, Time */}
            <View style={styles.header}>
                <View style={[styles.iconWrapper, { backgroundColor: iconData.color + '15' }]}>
                    <VectorIcon type="Ionicons" name={iconData.name} size={18} color={iconData.color} />
                </View>
                <View style={styles.headerInfo}>
                    <GlroyBold text={activityTitle.toUpperCase()} _style={[styles.typeText, { color: iconData.color }]} />
                    <Text style={styles.timeText}>
                        {moment(item.createdAt).calendar(null, {
                            sameDay: '[Today] h:mm A',
                            lastDay: '[Yesterday] h:mm A',
                            sameElse: 'MMM D, h:mm A'
                        })}
                    </Text>
                </View>
                <View style={styles.labelWrapper}>
                    <View style={styles.labelBadge}>
                        <Text style={styles.labelText}>{isWholeClass ? 'Whole Class' : item.childName}</Text>
                    </View>
                </View>
            </View>

            {/* Images: Horizontal Scroll if multiple */}
            <View style={styles.imageGallery}>
                {item.images && item.images.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled={item.images.length > 1}>
                        {item.images.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: getImagePath(img) }}
                                style={[styles.postImage, { width: item.images.length > 1 ? vw * 80 : vw * 85 }]}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                ) : null}
            </View>

            {/* Content Preview */}
            <View style={styles.content}>
                <Text style={styles.noteText} numberOfLines={2}>
                    {item.content || item.description || 'No additional notes.'}
                </Text>
            </View>

            {/* Footer: Like Action */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.likeBtn} activeOpacity={0.7}>
                    <VectorIcon type="Ionicons" name="heart-outline" size={20} color="#666" />
                    <Text style={styles.footerText}>Like</Text>
                </TouchableOpacity>
                <View style={styles.likesCount}>
                    <VectorIcon type="Ionicons" name="heart" size={12} color="#FF5252" />
                    <Text style={styles.likesText}>{item.likes?.length || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.theme.white,
        marginBottom: 20,
        borderRadius: 16,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    timeText: {
        fontSize: 11,
        color: colors.text.grey,
        marginTop: 1,
    },
    labelWrapper: {
        alignItems: 'flex-end',
    },
    labelBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    labelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text.grey,
    },
    imageGallery: {
        marginHorizontal: -5,
        marginBottom: 10,
    },
    postImage: {
        height: vh * 22,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    content: {
        marginBottom: 12,
    },
    noteText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    likeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    likesCount: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF525210',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    likesText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#FF5252',
        fontWeight: 'bold',
    },
});

export default PostItem;
