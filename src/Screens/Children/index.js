import React, {useEffect} from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import routes from '../../Navigation/routes';
import {getImagePath} from '../../Service/axios';
import {asyncGetAllMyChildren} from '../../Stores/actions/user.action';
import {useAppSelector} from '../../Stores/hooks';
import {
  selectChildren,
  selectSelectedChild,
  setSelectedChild,
} from '../../Stores/slices/class.slice';
import {colors} from '../../theme/colors';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const PRIMARY = colors.theme.primary;

function classroomLabel(classroom) {
  if (!classroom || typeof classroom === 'string') {
    return '';
  }
  const name = classroom.classroomName || classroom.classroomId || '';
  const grade = classroom.classroomGrade;
  if (name && grade) {
    return `${name} • Grade ${grade}`;
  }
  return name || (grade ? `Grade ${grade}` : '');
}

function childName(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim() || 'Child';
}

export default function Children() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const active = selectedChild || children[0];

  useEffect(() => {
    dispatch(asyncGetAllMyChildren());
  }, [dispatch]);

  const selectChild = child => {
    dispatch(setSelectedChild(child));
  };

  const openProfile = child => {
    dispatch(setSelectedChild(child));
    navigation.navigate(routes.screens.childProfile, {childId: child._id});
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 12) + 10,
            paddingBottom: 100 + insets.bottom,
            paddingHorizontal: 18,
            flexGrow: 1,
          }}>
          <Text style={styles.title}>Children</Text>
          <Text style={styles.subtitle}>
            {children.length
              ? 'The selected child is used across Home, attendance and homework.'
              : 'Link a child to personalize the app.'}
          </Text>

          {children.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No children linked</Text>
              <Text style={styles.emptyCopy}>
                Link a child to view their profile, class and school updates.
              </Text>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate(routes.screens.addChild)}
                activeOpacity={0.85}>
                <Text style={styles.linkBtnText}>+ Link Child</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {active ? (
                <LinearGradient
                  colors={['#1A73C7', '#035392']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.featured}>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Selected</Text>
                  </View>
                  <View style={styles.featuredRow}>
                    <Image
                      source={
                        active.image
                          ? {uri: getImagePath(active.image)}
                          : profile_icon
                      }
                      style={styles.featuredPhoto}
                    />
                    <View style={styles.featuredCopy}>
                      <Text style={styles.featuredName} numberOfLines={1}>
                        {childName(active)}
                      </Text>
                      {classroomLabel(active.classroom) ? (
                        <Text style={styles.featuredMeta} numberOfLines={1}>
                          {classroomLabel(active.classroom)}
                        </Text>
                      ) : (
                        <Text style={styles.featuredMeta}>Class not assigned</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => openProfile(active)}
                    activeOpacity={0.85}>
                    <Text style={styles.profileBtnText}>View profile</Text>
                    <Ionicons name="arrow-forward" size={16} color={PRIMARY} />
                  </TouchableOpacity>
                </LinearGradient>
              ) : null}

              <Text style={styles.section}>
                {children.length > 1 ? 'Switch child' : 'Linked child'}
              </Text>
              {children.map(child => {
                const selected = active?._id === child._id;
                const klass = classroomLabel(child.classroom);
                return (
                  <TouchableOpacity
                    key={child._id}
                    style={[styles.card, selected && styles.cardSelected]}
                    onPress={() => selectChild(child)}
                    activeOpacity={0.85}>
                    <Image
                      source={
                        child.image
                          ? {uri: getImagePath(child.image)}
                          : profile_icon
                      }
                      style={styles.photo}
                    />
                    <View style={styles.copy}>
                      <Text style={styles.name} numberOfLines={1}>
                        {childName(child)}
                      </Text>
                      {klass ? (
                        <Text style={styles.meta} numberOfLines={1}>
                          {klass}
                        </Text>
                      ) : null}
                    </View>
                    {selected ? (
                      <View style={styles.selectedDot}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => openProfile(child)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <Ionicons name="chevron-forward" size={18} color={MUTED} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate(routes.screens.addChild)}
                activeOpacity={0.85}>
                <Text style={styles.linkBtnText}>+ Link Child</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 24,
    color: NAVY,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  featured: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  activeBadgeText: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  featuredCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  featuredName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  featuredMeta: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },
  profileBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 42,
  },
  profileBtnText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: PRIMARY,
  },
  section: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#F3F7FC',
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  copy: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  meta: {
    marginTop: 3,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
  },
  selectedDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkBtn: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  linkBtnText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
