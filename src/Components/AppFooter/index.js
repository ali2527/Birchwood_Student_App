import React, {memo, useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import routes from '../../Navigation/routes';
import {useAppSelector} from '../../Stores/hooks';
import {selectUnreadNotificationCount} from '../../Stores/slices/notification.slice';
import {WIDTH} from '../../theme/units';
import MoreSheet from '../MoreSheet';
import {BAR_H, HILL_H, footerPath} from './shape';

const MUTED = '#C3C8D2';
const ACTIVE = '#035392';
const ICON_SIZE = 22;

const TABS = [
  {key: 'children', icon: 'people-outline', screen: routes.screens.children},
  {
    key: 'calendar',
    icon: 'calendar-outline',
    screen: routes.screens.schoolCalendar,
  },
  {key: 'home', icon: 'grid-outline', screen: routes.screens.homeScreen},
  {
    key: 'notices',
    icon: 'notifications-outline',
    screen: routes.screens.notifications,
  },
  {key: 'more', icon: 'settings-outline', screen: null},
];

const TabButton = memo(function TabButton({
  tab,
  selected,
  onPress,
  raised,
  badgeCount,
}) {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tab.key}
      accessibilityState={{selected}}>
      <View style={[styles.iconSlot, raised && styles.iconSlotRaised]}>
        <Ionicons
          name={tab.icon}
          size={raised ? 26 : ICON_SIZE}
          color={selected ? ACTIVE : MUTED}
          allowFontScaling={false}
        />
        {badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

function TabRow({activeKey, onPress, flush, unreadCount}) {
  return (
    <View style={[styles.row, flush && styles.rowFlush]}>
      {TABS.map((tab, index) => (
        <TabButton
          key={tab.key}
          tab={tab}
          selected={tab.key === activeKey}
          raised={tab.key === 'home' && !flush}
          badgeCount={tab.key === 'notices' ? unreadCount : 0}
          onPress={() => onPress(tab, index)}
        />
      ))}
    </View>
  );
}

function AppFooter({state, navigation} = {}) {
  const insets = useSafeAreaInsets();
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const [moreOpen, setMoreOpen] = useState(false);
  const [barWidth, setBarWidth] = useState(WIDTH);
  const inset = insets.bottom;
  const svgH = HILL_H + BAR_H + inset;
  const d = useMemo(
    () => footerPath(barWidth || WIDTH, inset),
    [barWidth, inset],
  );

  const routeIndex = typeof state?.index === 'number' ? state.index : 2;
  const activeIndex = moreOpen ? TABS.length - 1 : routeIndex;
  const activeKey = TABS[activeIndex]?.key;

  const onPress = useCallback(
    (tab, index) => {
      if (tab.key === 'more') {
        setMoreOpen(open => !open);
        return;
      }
      setMoreOpen(false);
      if (!navigation || !tab.screen) {
        return;
      }
      if (tab.screen === routes.screens.notifications) {
        const parent = navigation.getParent?.();
        if (parent) {
          parent.navigate(tab.screen);
        } else {
          navigation.navigate(tab.screen);
        }
        return;
      }
      if (routeIndex === index) {
        return;
      }
      navigation.navigate(tab.screen);
    },
    [navigation, routeIndex],
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, {height: svgH}]}
      onLayout={event => {
        const next = event.nativeEvent.layout.width;
        if (next && Math.abs(next - barWidth) > 1) {
          setBarWidth(next);
        }
      }}>
      <Svg
        pointerEvents="none"
        width={barWidth}
        height={svgH}
        viewBox={`0 0 ${barWidth} ${svgH}`}
        style={styles.svg}>
        <Path d={d} fill="#FFFFFF" />
      </Svg>
      <TabRow
        activeKey={activeKey}
        onPress={onPress}
        unreadCount={unreadCount}
      />
      <MoreSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        barWidth={barWidth}
        inset={inset}
        footer={
          <TabRow
            activeKey={activeKey}
            onPress={onPress}
            flush
            unreadCount={unreadCount}
          />
        }
      />
    </View>
  );
}

export function TabScreenChrome({children}) {
  return children;
}

export default AppFooter;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    marginTop: HILL_H,
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  rowFlush: {
    marginTop: 0,
  },
  tabItem: {
    flex: 1,
    height: BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  iconSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotRaised: {
    width: 28,
    height: 28,
    transform: [{translateY: -8}],
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
