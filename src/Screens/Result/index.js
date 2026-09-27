import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {useAppSelector} from '../../Stores/hooks';
import {selectSelectedChild, selectChildren} from '../../Stores/slices/class.slice';
import {selectModules} from '../../Stores/slices/modules.slice';
import {BAR_H} from '../../Components/AppFooter/shape';
import routes from '../../Navigation/routes';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const BLUE = '#2F5BEA';

function childName(child) {
  return `${child?.firstName || ''} ${child?.lastName || ''}`.trim() || 'Student';
}

function kindLabel(kind) {
  switch (String(kind || '').toUpperCase()) {
    case 'EXAM':
      return 'Exam';
    case 'QUIZ':
      return 'Quiz';
    case 'ASSIGNMENT':
      return 'Assignment';
    default:
      return 'Test';
  }
}

export default function Result() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const modules = useAppSelector(selectModules);
  const selectedChild = useAppSelector(selectSelectedChild);
  const children = useAppSelector(selectChildren);
  const child = selectedChild || children[0];
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!child?._id || modules.results === false) {
      setDocs([]);
      return;
    }
    const res = await callApi({
      path: allApiPaths.getPath('getPublishedAssessmentsByChild', {
        childId: child._id,
      }),
    });
    setDocs(res?.data?.docs || []);
    if (!res?.status && res?.message) {
      setError(res.message);
    }
  }, [child?._id, modules.results]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await load();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 8}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Results</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {child ? childName(child) : 'Select a child first'}
          </Text>
        </View>
      </View>

      {modules.results === false ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={28} color={BLUE} />
          <Text style={styles.emptyTitle}>Results disabled</Text>
          <Text style={styles.emptyBody}>Results are turned off for this school.</Text>
        </View>
      ) : !child ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={28} color={BLUE} />
          <Text style={styles.emptyTitle}>No child selected</Text>
          <Text style={styles.emptyBody}>
            Link or select a student to see published scores.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate(routes.screens.addChild)}
            activeOpacity={0.85}>
            <Text style={styles.ctaText}>Add child</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={BLUE} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 18,
            paddingBottom: BAR_H + insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!docs.length ? (
            <View style={styles.card}>
              <Ionicons name="trophy-outline" size={28} color={BLUE} />
              <Text style={styles.emptyTitle}>No results yet</Text>
              <Text style={styles.emptyBody}>
                When the teacher publishes a test, quiz, or exam, scores show here.
              </Text>
            </View>
          ) : (
            docs.map(item => (
              <View key={item.assessment._id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.title}>{item.assessment.title}</Text>
                  <Text style={styles.badge}>{kindLabel(item.assessment.kind)}</Text>
                </View>
                <Text style={styles.meta}>
                  {[item.assessment.subject, item.assessment.assessmentDate
                    ? moment(item.assessment.assessmentDate).format('D MMM YYYY')
                    : null]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text style={styles.score}>
                  {item.obtained == null
                    ? 'Not marked'
                    : `${item.obtained}/${item.maxMarks} · ${item.percentage}% · ${item.grade}`}
                </Text>
                {item.remarks ? <Text style={styles.remark}>{item.remarks}</Text> : null}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: PAGE_BG},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E8EE',
  },
  backBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1},
  headerTitle: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 20, color: NAVY},
  headerSub: {marginTop: 2, fontFamily: fonts.euclidCircularA.regular, fontSize: 13, color: MUTED},
  empty: {
    margin: 18,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  cta: {
    marginTop: 14,
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaText: {color: '#FFF', fontFamily: fonts.euclidCircularA.semiBold},
  error: {color: '#E11D48', marginBottom: 12, fontFamily: fonts.euclidCircularA.regular},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {flex: 1, fontFamily: fonts.euclidCircularA.semiBold, fontSize: 16, color: NAVY},
  badge: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 11,
    color: BLUE,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  meta: {marginTop: 4, fontFamily: fonts.euclidCircularA.regular, fontSize: 12, color: MUTED},
  score: {marginTop: 10, fontFamily: fonts.euclidCircularA.semiBold, fontSize: 15, color: BLUE},
  remark: {marginTop: 6, fontFamily: fonts.euclidCircularA.regular, fontSize: 13, color: NAVY},
});
