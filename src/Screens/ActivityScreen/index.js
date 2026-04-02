
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { asyncGetAllPosts } from '../../Stores/actions/post.action';
import { useAppSelector } from '../../Stores/hooks';
import { selectSelectedChild } from '../../Stores/slices/class.slice';
import { selectAppLoader } from '../../Stores/slices/common.slice';
import { resetPostState, selectPosts } from '../../Stores/slices/post.slice';
import { BackArrow } from '../../Components/BackArrow';
import GlroyBold from '../../Components/GlroyBoldText';
import PostItem from '../../Components/PostItem';
import CustomStatusBar from '../../Components/StatusBar';
import VectorIcon from '../../Components/VectorIcons';
import { colors } from '../../theme/colors';

const ActivityScreen = () => {
    const dispatch = useDispatch();
    const posts = useAppSelector(selectPosts);
    const loading = useAppSelector(selectAppLoader);
    const selectedChild = useAppSelector(selectSelectedChild);
    const [activeFilter, setActiveFilter] = useState('All');

    const getClassroomId = (child) => {
        if (!child?.classroom) return null;
        if (typeof child.classroom === 'string') return child.classroom;
        return child.classroom._id || child.classroom.classroomId || child.classroom.id;
    };

    const classroomId = getClassroomId(selectedChild);
    const childrenId = selectedChild?._id;

    const filters = ['All', 'Reading', 'Playing', 'Eating', 'Sleeping'];

    useEffect(() => {
        if (classroomId && childrenId) {
            dispatch(resetPostState());
            dispatch(asyncGetAllPosts({
                classroom: classroomId,
                children: childrenId
            }));
        }
    }, [dispatch, classroomId, childrenId]);

    const filteredPosts = activeFilter === 'All'
        ? posts
        : posts.filter(post => (post.type || post.activityType)?.toLowerCase().includes(activeFilter.toLowerCase()));

    const renderFilterChip = (filter) => {
        const isActive = activeFilter === filter;
        return (
            <TouchableOpacity
                key={filter}
                style={[styles.chip, isActive && styles.activeChip]}
                onPress={() => setActiveFilter(filter)}
            >
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                    {filter}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <CustomStatusBar backgroundColor={colors.theme.white} barStyle="dark-content" />

            <View style={styles.header}>
                <BackArrow />
                <GlroyBold text="Today's Activities" _style={styles.headerTitle} />
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {filters.map(filter => renderFilterChip(filter))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.theme.primary} />
                    <Text style={styles.loadingText}>Fetching activities...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredPosts}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <PostItem item={item} />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <VectorIcon type="Ionicons" name="calendar-outline" size={60} color="#DDD" />
                            <Text style={styles.emptyText}>No activities found for {activeFilter}</Text>
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
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.theme.white,
    },
    headerTitle: {
        fontSize: 20,
        marginLeft: 15,
        color: colors.text.black,
    },
    filterWrapper: {
        backgroundColor: colors.theme.white,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterContainer: {
        paddingHorizontal: 15,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeChip: {
        backgroundColor: colors.theme.primary,
        borderColor: colors.theme.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeChipText: {
        color: colors.theme.white,
    },
    listContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: colors.text.grey,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: colors.text.grey,
        textAlign: 'center',
    },
});

export default ActivityScreen;
