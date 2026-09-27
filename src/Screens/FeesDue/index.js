import React, {useCallback, useMemo, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import ChildSwitcher from '../../Components/ChildSwitcher';
import routes from '../../Navigation/routes';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {useAppSelector} from '../../Stores/hooks';
import {selectChildren, selectSelectedChild, setSelectedChild} from '../../Stores/slices/class.slice';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE = '#F4F5F8';
const BLUE = '#035392';
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const FILTERS = [
  {key: 'ALL', label: 'All'},
  {key: 'UNPAID', label: 'Unpaid'},
  {key: 'PAID', label: 'Paid'},
];

function money(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return '—';
  }
  return value.toLocaleString(undefined, {maximumFractionDigits: 0});
}

function monthName(month) {
  return MONTHS[Number(month) - 1] || 'Fee';
}

function childLabel(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim();
}

export default function FeesDue() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const children = useAppSelector(selectChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const [fees, setFees] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const childId = selectedChild?._id;

  useFocusEffect(
    useCallback(() => {
      if (!childId) {
        setFees([]);
        return undefined;
      }
      let active = true;
      setLoading(true);
      callApi({
        path: allApiPaths.getPath('getAllChildVouchers', {childId}),
        headers: {'Cache-Control': 'no-cache', Pragma: 'no-cache'},
        options: {params: {page: 1, limit: 100, _: Date.now()}},
      })
        .then(res => {
          if (!active) {
            return;
          }
          const docs = Array.isArray(res?.data?.docs) ? res.data.docs : [];
          setFees(res?.status ? docs : []);
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
      return () => {
        active = false;
      };
    }, [childId]),
  );

  const visible = useMemo(() => {
    return fees.filter(item => {
      if (filter === 'PAID') {
        return item.isPaid;
      }
      if (filter === 'UNPAID') {
        return !item.isPaid;
      }
      return true;
    });
  }, [fees, filter]);

  const unpaidTotal = fees
    .filter(item => !item.isPaid)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const paidCount = fees.filter(item => item.isPaid).length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 6}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{childLabel(selectedChild) || 'School'}</Text>
          <Text style={styles.headerTitle}>Fees</Text>
        </View>
        <View style={styles.switcher}>
          <ChildSwitcher
            childList={children}
            selected={selectedChild}
            onSelect={next => dispatch(setSelectedChild(next))}
            onAdd={() => navigation.navigate(routes.screens.addChild)}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.summary}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryLabel}>Unpaid</Text>
            <Text style={styles.summaryAmount}>{money(unpaidTotal)}</Text>
          </View>
          <Text style={styles.summaryMeta}>
            {paidCount} paid · {fees.length - paidCount} open
          </Text>
        </View>

        <View style={styles.filters}>
          {FILTERS.map(item => {
            const on = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filter, on && styles.filterOn]}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.85}>
                <Text style={[styles.filterText, on && styles.filterTextOn]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!childId ? (
          <Empty title="No student linked" body="Link a student to see the fees added in admin." />
        ) : loading && fees.length === 0 ? (
          <Empty title="Loading fees" body="Fetching this student’s vouchers." />
        ) : visible.length === 0 ? (
          <Empty
            title={filter === 'ALL' ? 'No fees yet' : `No ${filter.toLowerCase()} fees`}
            body="Vouchers added for this student in admin show up here."
          />
        ) : (
          visible.map(item => <FeeCard key={item._id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}

function FeeCard({item}) {
  const paid = Boolean(item.isPaid);
  const due = item.dueDate ? moment(item.dueDate) : null;
  const paidOn = item.paymentDate ? moment(item.paymentDate) : null;
  return (
    <View style={styles.card}>
      <View style={[styles.dateBox, {backgroundColor: paid ? '#D7F0DC' : '#F8D8D8'}]}>
        <Text style={styles.dateDay}>{item.month ? String(item.month).padStart(2, '0') : '—'}</Text>
        <Text style={styles.dateMonth}>{monthName(item.month).slice(0, 3)}</Text>
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardKicker}>{paid ? 'Paid' : 'Unpaid'}</Text>
        <Text style={styles.cardTitle}>
          {monthName(item.month)} {item.year || ''}
        </Text>
        <Text style={styles.cardWhen}>
          {paid && paidOn?.isValid()
            ? `Paid ${paidOn.format('D MMM YYYY')}`
            : due?.isValid()
              ? `Due ${due.format('D MMM YYYY')}`
              : 'No due date'}
          {item.receiptNo ? ` · ${item.receiptNo}` : ''}
        </Text>
      </View>
      <Text style={styles.amount}>{money(item.amount)}</Text>
    </View>
  );
}

function Empty({title, body}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
      </View>
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: PAGE},
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    paddingRight: 18,
    paddingBottom: 8,
  },
  backBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0, paddingTop: 2},
  switcher: {marginLeft: 12},
  eyebrow: {fontFamily: fonts.euclidCircularA.medium, fontSize: 13, color: MUTED},
  headerTitle: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: NAVY,
  },
  scroll: {paddingHorizontal: 18, paddingBottom: 32},
  summary: {
    backgroundColor: BLUE,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  summaryCopy: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'},
  summaryLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#D6E6F8',
  },
  summaryAmount: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: '#FFFFFF',
  },
  summaryMeta: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: '#D6E6F8',
  },
  filters: {flexDirection: 'row', gap: 8, marginBottom: 14},
  filter: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#E7F1FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOn: {backgroundColor: BLUE},
  filterText: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 13, color: BLUE},
  filterTextOn: {color: '#FFFFFF'},
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  dateBox: {
    width: 58,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateDay: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 18,
    color: NAVY,
  },
  dateMonth: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 12,
    color: NAVY,
    textTransform: 'uppercase',
  },
  cardCopy: {flex: 1, minWidth: 0},
  cardKicker: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BLUE,
  },
  cardTitle: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  cardWhen: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 13,
    color: MUTED,
  },
  amount: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
  },
  emptyCopy: {flex: 1, minWidth: 0, paddingTop: 4},
  emptyTitle: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 16, color: NAVY},
  emptyBody: {
    marginTop: 4,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});
