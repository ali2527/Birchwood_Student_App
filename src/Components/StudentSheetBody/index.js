import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fonts from '../../Assets/fonts';
import profile_icon from '../../Assets/images/profile_bg.png';
import {getImagePath} from '../../Service/axios';
import {attendanceDotColor} from '../../Screens/DailyAttendance/status';

export const STUDENT_SHEET = {
  BLUE: '#2F5BEA',
  BLUE_SOFT: '#6B8CFF',
  CARD: '#F3F4F8',
  INK: '#1A1D26',
  MUTED: '#9AA0B4',
};

const {BLUE, BLUE_SOFT, CARD, INK, MUTED} = STUDENT_SHEET;
const ACCENTS = ['#FF8A3D', '#7C5CFF', '#22C55E', '#FF6B5B', '#0EA5E9'];

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

function photoSource(child) {
  return child?.image ? {uri: getImagePath(child.image)} : profile_icon;
}

const ADD_SIZE = 36;

function DottedAddButton({onPress}) {
  const r = ADD_SIZE / 2 - 1.8;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Add child"
      style={styles.titleAdd}>
      <Svg width={ADD_SIZE} height={ADD_SIZE}>
        <Circle
          cx={ADD_SIZE / 2}
          cy={ADD_SIZE / 2}
          r={r}
          stroke={BLUE}
          strokeWidth={1.8}
          strokeDasharray="3 2.5"
          strokeLinecap="round"
          fill="#F4F7FF"
        />
      </Svg>
      <View style={styles.titleAddIcon} pointerEvents="none">
        <Ionicons name="add" size={20} color={BLUE} />
      </View>
    </TouchableOpacity>
  );
}

export default function StudentSheetBody({
  title,
  subtitle,
  childList = [],
  activeId,
  onSelectChild,
  onAdd,
  onOpenProfile,
  showAddButton = true,
  scrollEnabled = true,
  contentPaddingBottom = 16,
  onScroll,
  headerPanHandlers,
  style,
}) {
  return (
    <View style={[styles.sheetBody, style]}>
      <View {...(headerPanHandlers || {})}>
        <View style={styles.titleRow}>
          <View style={styles.titleSide} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {onAdd ? (
            <DottedAddButton onPress={onAdd} />
          ) : (
            <View style={styles.titleSide} />
          )}
        </View>
        {subtitle ? <Text style={styles.sheetSub}>{subtitle}</Text> : null}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={16}
        onScroll={onScroll}
        bounces={false}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: contentPaddingBottom,
        }}>
        {childList.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={[styles.taskIcon, {backgroundColor: BLUE}]}>
              <Ionicons name="person-add-outline" size={18} color="#FFF" />
            </View>
            <View style={styles.taskCopy}>
              <Text style={styles.taskName}>No children linked</Text>
              <View style={styles.taskLine} />
              <Text style={styles.taskMeta}>
                Link a child to view profile, class and updates
              </Text>
            </View>
          </View>
        ) : (
          childList.map((child, index) => {
            const selected = child._id === activeId;
            const klass = classroomLabel(child.classroom);
            const accent = ACCENTS[index % ACCENTS.length];
            return (
              <TouchableOpacity
                key={child._id}
                style={styles.taskRow}
                activeOpacity={0.85}
                onPress={() => onSelectChild?.(child)}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <View
                    style={[
                      styles.timeDot,
                      selected && {
                        borderColor: BLUE,
                        backgroundColor: BLUE,
                      },
                    ]}
                  />
                </View>
                <View
                  style={[styles.taskCard, selected && styles.taskCardSelected]}>
                  <View style={styles.avatarWrap}>
                    <Image source={photoSource(child)} style={styles.avatar} />
                    <View style={[styles.avatarRing, {borderColor: accent}]} />
                    <View
                      style={[
                        styles.statusDot,
                        {backgroundColor: attendanceDotColor(child)},
                      ]}
                    />
                  </View>
                  <View style={styles.taskCopy}>
                    <Text style={styles.taskName} numberOfLines={1}>
                      {childName(child)}
                    </Text>
                    <View style={styles.taskLine} />
                    <Text style={styles.taskMeta} numberOfLines={1}>
                      {klass || 'Class not assigned'}
                    </Text>
                  </View>
                  {selected ? (
                    <View style={styles.selectedDot}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  ) : onOpenProfile ? (
                    <TouchableOpacity
                      onPress={() => onOpenProfile(child)}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                      style={[styles.chevronBtn, {backgroundColor: CARD}]}>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={MUTED}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
        {onAdd && showAddButton ? (
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={onAdd}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add child">
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.linkBtnText}>Add child</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    color: INK,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSide: {
    width: 36,
    height: 36,
  },
  titleAdd: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleAddIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSub: {
    marginTop: 4,
    marginBottom: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeCol: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
  },
  timeText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: INK,
  },
  timeDot: {
    marginTop: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D0D4E0',
  },
  taskCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  taskCardSelected: {
    borderColor: BLUE_SOFT,
    backgroundColor: '#EEF2FF',
  },
  avatarWrap: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  statusDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    zIndex: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 2,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  taskName: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: INK,
  },
  taskLine: {
    marginTop: 8,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DADBE4',
  },
  taskMeta: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 12,
    color: MUTED,
  },
  selectedDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  linkBtn: {
    marginTop: 12,
    alignSelf: 'stretch',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BLUE,
    borderRadius: 14,
  },
  linkBtnText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
