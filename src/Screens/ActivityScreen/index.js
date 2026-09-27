import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import ChildSwitcher from '../../Components/ChildSwitcher';
import PostItem from '../../Components/PostItem';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import {
  asyncGetAllActivities,
  asyncGetAllChildPosts,
} from '../../Stores/actions/post.action';
import {asyncGetAllMyChildren} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import {
  selectActivities,
  selectPosts,
} from '../../Stores/slices/post.slice';
import {WIDTH} from '../../theme/units';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PRIMARY = '#035392';
const PAGE_BG = '#F4F5F8';
const ALL_FILTER = 'all';
const CIRCLE = 56;
const BONE = '#E6EAF1';

function Bone({style}) {
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <Animated.View style={[styles.bone, style, {opacity: pulse}]} />;
}

function FeedSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2].map(key => (
        <View key={key} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <Bone style={styles.skeletonAvatar} />
            <View style={styles.skeletonHeaderCopy}>
              <Bone style={styles.skeletonLineLg} />
              <Bone style={styles.skeletonLineSm} />
            </View>
          </View>
          <Bone style={styles.skeletonCaption} />
          <Bone style={styles.skeletonCaptionShort} />
          <Bone style={styles.skeletonMedia} />
          <View style={styles.skeletonActions}>
            <Bone style={styles.skeletonAction} />
            <Bone style={styles.skeletonAction} />
            <Bone style={styles.skeletonAction} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function ActivityScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);

  const activities = useAppSelector(selectActivities);
  const posts = useAppSelector(selectPosts);
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);

  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [refreshing, setRefreshing] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  const child = selectedChild || children[0] || null;

  useEffect(() => {
    dispatch(asyncGetAllMyChildren());
    dispatch(asyncGetAllActivities({page: 1, limit: 100}));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedChild && children[0]) {
      dispatch(setSelectedChild(children[0]));
    }
  }, [children, selectedChild, dispatch]);

  useEffect(() => {
    if (!child?._id) {
      setFeedLoading(false);
      return;
    }

    let cancelled = false;
    setActiveFilter(ALL_FILTER);
    setFeedLoading(true);

    (async () => {
      try {
        await dispatch(asyncGetAllChildPosts({childId: child._id}));
      } finally {
        if (!cancelled) {
          setFeedLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, child?._id]);

  const onRefresh = useCallback(async () => {
    if (!child?._id) {
      return;
    }
    setRefreshing(true);
    try {
      await dispatch(asyncGetAllChildPosts({childId: child._id}));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, child?._id]);

  const activityCircles = useMemo(
    () => [
      {_id: ALL_FILTER, title: 'All', image: null},
      ...activities
        .filter(item => item?.status !== 'INACTIVE')
        .map(item => ({
          _id: item._id,
          title: item.title || 'Activity',
          image: item.image || null,
        })),
    ],
    [activities],
  );

  const filteredPosts = useMemo(() => {
    if (activeFilter === ALL_FILTER) {
      return posts;
    }
    return posts.filter(post => {
      const activityId =
        typeof post.activity === 'string'
          ? post.activity
          : post.activity?._id;
      return activityId === activeFilter;
    });
  }, [activeFilter, posts]);

  const activeCategoryTitle =
    activityCircles.find(item => item._id === activeFilter)?.title || 'All';

  const childFirst = child?.firstName || 'your child';
  const showSkeleton = feedLoading && !refreshing;

  const listHeader = (
    <View style={styles.listHeader}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.circleRow}>
        {activityCircles.map(item => {
          const active = activeFilter === item._id;
          return (
            <TouchableOpacity
              key={item._id}
              style={styles.circleItem}
              onPress={() => setActiveFilter(item._id)}
              activeOpacity={0.85}
              disabled={showSkeleton}>
              <View
                style={[
                  styles.circleRing,
                  active && styles.circleRingActive,
                ]}>
                <View style={styles.circleInner}>
                  {item._id === ALL_FILTER ? (
                    <Ionicons
                      name="apps-outline"
                      size={22}
                      color={active ? PRIMARY : MUTED}
                    />
                  ) : item.image ? (
                    <Image
                      source={{uri: getImagePath(item.image)}}
                      style={styles.circleImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.circleInitial}>
                      {(item.title || 'A').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                style={[styles.circleLabel, active && styles.circleLabelActive]}
                numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View
        style={[
          styles.topBar,
          {paddingTop: Math.max(insets.top, 10) + 4},
        ]}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Moments</Text>
          <Text style={styles.titleMeta} numberOfLines={1}>
            {childFirst}
            {activeFilter !== ALL_FILTER ? ` · ${activeCategoryTitle}` : ''}
          </Text>
        </View>
        <ChildSwitcher
          childList={children}
          selected={child}
          onSelect={next => {
            if (next?._id && next._id !== child?._id) {
              setFeedLoading(true);
            }
            dispatch(setSelectedChild(next));
          }}
          onAdd={() => navigation.navigate(routes.screens.addChild)}
        />
      </View>

      {showSkeleton ? (
        <View style={{flex: 1}}>
          {listHeader}
          <FeedSkeleton />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredPosts}
          keyExtractor={item => item._id}
          renderItem={({item, index}) => (
            <PostItem item={item} />
          )}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[
            styles.list,
            {paddingBottom: 110 + insets.bottom},
            !filteredPosts.length && styles.listGrow,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="newspaper-outline" size={30} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>
                {!child?._id ? 'Pick a child' : 'No updates yet'}
              </Text>
              <Text style={styles.emptyBody}>
                {!child?._id
                  ? 'Select a child above to see their classroom moments.'
                  : activeFilter !== ALL_FILTER
                    ? `Nothing in ${activeCategoryTitle} for ${childFirst} right now.`
                    : `When teachers share photos of ${childFirst}, they'll show up here.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: PAGE_BG,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  titleMeta: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  listHeader: {
    backgroundColor: PAGE_BG,
    paddingTop: 4,
  },
  circleRow: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  circleItem: {
    width: 66,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  circleRing: {
    width: CIRCLE + 5,
    height: CIRCLE + 5,
    borderRadius: (CIRCLE + 5) / 2,
    borderWidth: 1.5,
    borderColor: '#E4E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  circleRingActive: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  circleInner: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  circleInitial: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: PRIMARY,
  },
  circleLabel: {
    marginTop: 5,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 10,
    color: MUTED,
    textAlign: 'center',
    width: '100%',
  },
  circleLabelActive: {
    color: PRIMARY,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E9F0',
    marginBottom: 2,
  },
  list: {
    paddingHorizontal: 14,
    backgroundColor: PAGE_BG,
  },
  listGrow: {
    flexGrow: 1,
  },
  skeletonWrap: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    padding: 12,
    marginBottom: 10,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  skeletonHeaderCopy: {
    flex: 1,
    marginLeft: 9,
    gap: 6,
  },
  skeletonLineLg: {
    width: '48%',
    height: 11,
    borderRadius: 6,
  },
  skeletonLineSm: {
    width: '34%',
    height: 9,
    borderRadius: 5,
  },
  skeletonCaption: {
    width: '92%',
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  skeletonCaptionShort: {
    width: '64%',
    height: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonMedia: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  skeletonAction: {
    width: '28%',
    height: 14,
    borderRadius: 7,
  },
  bone: {
    backgroundColor: BONE,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: NAVY,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: WIDTH * 0.78,
  },
});
