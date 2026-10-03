import React, {memo, useCallback, useMemo, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import routes from '../../Navigation/routes';
import {useAppSelector} from '../../Stores/hooks';
import {useChatList} from '../../Query/chats';
import {selectModules} from '../../Stores/slices/modules.slice';
import {selectUnreadNotificationCount} from '../../Stores/slices/notification.slice';
import {WIDTH} from '../../theme/units';
import MoreSheet from '../MoreSheet';
import {BAR_H, HILL_H, footerPath} from './shape';
import {openPageDrawer} from '../../Utils/openPageDrawer';

const MUTED = '#8B93A7';
const ACTIVE = '#035392';
const ICON_SIZE = 22;

const TABS = [
  {
    key: 'chat',
    icon: 'chatbubble-ellipses-outline',
    screen: routes.screens.teacherChat,
  },
  {
    key: 'attendance',
    icon: 'calendar-outline',
    screen: routes.screens.attendanceLog,
  },
  {key: 'home', icon: 'grid-outline', screen: routes.screens.homeScreen},
  {
    key: 'feed',
    icon: 'newspaper-outline',
    screen: routes.screens.activityScreen,
  },
  {key: 'more', icon: 'settings-outline', screen: null},
];

const TabButton = memo(function TabButton({
  tab,
  selected,
  onPress,
  raised,
  showDot,
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
        {showDot ? <View style={styles.dot} /> : null}
      </View>
    </TouchableOpacity>
  );
});

function TabRow({activeKey, onPress, flush, showChatDot, showMoreDot, chatOn}) {
  return (
    <View style={[styles.row, flush && styles.rowFlush]}>
      {TABS.map((tab, index) => tab.key === 'chat' && !chatOn ? (
        <View key={tab.key} style={styles.tabItem} />
      ) : (
        <TabButton
          key={tab.key}
          tab={tab}
          selected={tab.key === activeKey}
          raised={tab.key === 'home' && !flush}
          showDot={
            tab.key === 'chat'
              ? showChatDot
              : tab.key === 'more'
                ? showMoreDot
                : false
          }
          onPress={() => onPress(tab, index)}
        />
      ))}
    </View>
  );
}

function AppFooter({state, navigation} = {}) {
  const insets = useSafeAreaInsets();
  const modules = useAppSelector(selectModules);
  const chatOn = modules.chat !== false;
  const unreadNotifications = useAppSelector(selectUnreadNotificationCount);
  const chatsQuery = useChatList('parent');
  const unreadChats = (chatsQuery.data || []).reduce((sum, chat) => {
    const count = Number(chat?.parentUnread ?? chat?.unreadMessage ?? 0);
    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);
  const showChatDot = unreadChats > 0;
  const showMoreDot = unreadNotifications > 0;
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
      if (tab.key === 'chat' && !chatOn) {
        return;
      }
      if (tab.key === 'more') {
        setMoreOpen(open => !open);
        return;
      }
      setMoreOpen(false);
      if (!navigation || !tab.screen) {
        return;
      }
      if (tab.key === 'attendance') {
        if (routeIndex !== index) {
          navigation.navigate(tab.screen);
        }
        openPageDrawer('attendance');
        return;
      }
      if (tab.key === 'home') {
        if (routeIndex === index) {
          return;
        }
        navigation.navigate(tab.screen);
        return;
      }
      if (routeIndex === index) {
        return;
      }
      navigation.navigate(tab.screen);
    },
    [chatOn, navigation, routeIndex],
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
        showChatDot={showChatDot}
        showMoreDot={showMoreDot}
        chatOn={chatOn}
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
            showChatDot={showChatDot}
            showMoreDot={showMoreDot}
            chatOn={chatOn}
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
  dot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
