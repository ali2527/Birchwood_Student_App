
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../Stores/hooks';
import { asyncGetAllPosts } from '../../Stores/actions/post.action';
import { selectPosts } from '../../Stores/slices/post.slice';
import { selectAppLoader } from '../../Stores/slices/common.slice';

import PostItem from '../../Components/PostItem';
import { colors } from '../../theme/colors';
import CustomStatusBar from '../../Components/StatusBar';
import { BackArrow } from '../../Components/BackArrow';
import GlroyBold from '../../Components/GlroyBoldText';
import { vh, vw } from '../../theme/units';

const ActivityScreen = () => {
    const dispatch = useDispatch();
    const posts = useAppSelector(selectPosts);
    const loading = useAppSelector(selectAppLoader);
    const [activeTab, setActiveTab] = useState('Reading'); // 'Reading' | 'Writing'

    console.log('ActivityScreen posts:', JSON.stringify(posts, null, 2));
    console.log('ActivityScreen loading:', loading);

    useEffect(() => {
        dispatch(asyncGetAllPosts({
            // classroom: '66063d21c2efe1ca511d4438',
            // children: '661dfc656899986a0a20e094',
            // pass tab info if API supported it, e.g., type: activeTab
        }));
    }, [dispatch]);

    const renderTab = (title) => (
        <TouchableOpacity
            style={[styles.tab, activeTab === title && styles.activeTab]}
            onPress={() => setActiveTab(title)}
        >
            <Text style={[styles.tabText, activeTab === title && styles.activeTabText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomStatusBar backgroundColor={colors.theme.white} barStyle="dark-content" />

            <View style={styles.header}>
                <BackArrow />
                <GlroyBold text="Posts" _style={styles.headerTitle} />
            </View>

            <View style={styles.tabContainer}>
                {renderTab('Painting')}
                {renderTab('Reading')}
                {renderTab('Play Time')}
                {renderTab('Story Time')}
            </View>

            {loading ? (
                <View style={[styles.loaderContainer, { flex: 1, justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <PostItem item={item} />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>No posts found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.theme.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 20,
        marginLeft: 15,
        color: colors.text.black,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 10,
        backgroundColor: colors.theme.lightGray, // Fallback or existing gray
        borderRadius: 25,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: colors.theme.secondary, // Or a primary color
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.grey,
    },
    activeTabText: {
        color: colors.theme.white,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
});

export default ActivityScreen;
