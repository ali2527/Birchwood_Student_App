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

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE_BG = '#F4F5F8';
const BLUE = '#2F5BEA';

export default function Assessments() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const modules = useAppSelector(selectModules);
  const selectedChild = useAppSelector(selectSelectedChild);
  const children = useAppSelector(selectChildren);
  const child = selectedChild || children[0];
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!child?._id || modules.assessments === false) {
      setDocs([]);
      return;
    }
    const res = await callApi({
      path: allApiPaths.getPath('getPublishedAssessmentsByChild', {
        childId: child._id,
      }),
    });
    setDocs(res?.data?.docs || []);
  }, [child?._id, modules.assessments]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>Assessments</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {child
              ? `${child.firstName || ''} ${child.lastName || ''}`.trim()
              : 'Select a child'}
          </Text>
        </View>
      </View>

      {modules.assessments === false ? (
        <Text style={styles.empty}>Assessments are disabled for this school.</Text>
      ) : loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={BLUE} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 18,
            paddingBottom: BAR_H + insets.bottom + 24,
          }}>
          {!docs.length ? (
            <View style={styles.card}>
              <Ionicons name="clipboard-outline" size={28} color={BLUE} />
              <Text style={styles.emptyTitle}>No assessments yet</Text>
              <Text style={styles.emptyBody}>
                When the teacher publishes a class assessment, scores will show here.
              </Text>
            </View>
          ) : (
            docs.map(item => (
              <View key={item.assessment._id} style={styles.card}>
                <Text style={styles.title}>{item.assessment.title}</Text>
                <Text style={styles.meta}>
                  {item.assessment.subject}
                  {item.assessment.assessmentDate
                    ? ` · ${moment(item.assessment.assessmentDate).format('D MMM YYYY')}`
                    : ''}
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
  headerTitle: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 20, color: NAVY},
  headerSub: {marginTop: 2, fontFamily: fonts.euclidCircularA.regular, fontSize: 13, color: MUTED},
  empty: {marginTop: 40, textAlign: 'center', color: MUTED},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  emptyTitle: {
    marginTop: 10,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 16,
    color: NAVY,
  },
  emptyBody: {
    marginTop: 6,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  title: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 16, color: NAVY},
  meta: {marginTop: 4, fontFamily: fonts.euclidCircularA.regular, fontSize: 12, color: MUTED},
  score: {marginTop: 10, fontFamily: fonts.euclidCircularA.semiBold, fontSize: 15, color: BLUE},
  remark: {marginTop: 6, fontFamily: fonts.euclidCircularA.regular, fontSize: 13, color: NAVY},
});
