import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import fonts from '../../Assets/fonts';
import {callApi} from '../../Service/api';
import {allApiPaths} from '../../Service/apiPaths';
import {getImagePath} from '../../Service/axios';
import {WIDTH} from '../../theme/units';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';
const PAGE = '#F4F5F8';
const BLUE = '#035392';
const GAP = 12;
const TILE = (WIDTH - 36 - GAP) / 2;

export default function SchoolAlbums() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      callApi({
        path: allApiPaths.getPath('getActiveGalleries'),
        headers: {'Cache-Control': 'no-cache', Pragma: 'no-cache'},
        options: {params: {_: Date.now()}},
      })
        .then(res => {
          if (!active) {
            return;
          }
          const list = Array.isArray(res?.data?.galleries) ? res.data.galleries : [];
          setAlbums(res?.status ? list.filter(item => (item.images || []).length) : []);
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const openAlbum = item => {
    setAlbum(item);
    setPhotoIndex(-1);
  };

  const closeViewer = () => setPhotoIndex(-1);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE} />
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 10) + 6}]}>
        <TouchableOpacity
          onPress={() => (album ? setAlbum(null) : navigation.goBack())}
          style={styles.backBtn}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>School</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {album ? album.title : 'Gallery'}
          </Text>
        </View>
      </View>

      {album ? (
        <AlbumView album={album} onOpen={setPhotoIndex} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {loading && albums.length === 0 ? (
            <Empty title="Loading albums" body="Fetching photos added in admin." />
          ) : albums.length === 0 ? (
            <Empty title="No albums yet" body="Photos added in the admin gallery show up here." />
          ) : (
            <View style={styles.grid}>
              {albums.map(item => {
                const cover = item.images?.[0];
                const count = item.images?.length || 0;
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.tile}
                    activeOpacity={0.9}
                    onPress={() => openAlbum(item)}>
                    <Image source={{uri: getImagePath(cover)}} style={styles.cover} />
                    <View style={styles.tileCopy}>
                      <Text style={styles.tileTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.tileMeta}>
                        {count} {count === 1 ? 'photo' : 'photos'}
                        {item.createdAt ? ` · ${moment(item.createdAt).format('D MMM')}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={Boolean(album) && photoIndex >= 0} transparent animationType="fade" onRequestClose={closeViewer}>
        <View style={styles.viewer}>
          <Pressable style={styles.viewerClose} onPress={closeViewer}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <FlatList
            data={album?.images || []}
            horizontal
            pagingEnabled
            initialScrollIndex={Math.max(photoIndex, 0)}
            getItemLayout={(_, index) => ({length: WIDTH, offset: WIDTH * index, index})}
            keyExtractor={(name, index) => `${name}-${index}`}
            renderItem={({item}) => (
              <View style={styles.viewerPage}>
                <Image source={{uri: getImagePath(item)}} style={styles.viewerImage} resizeMode="contain" />
              </View>
            )}
            onMomentumScrollEnd={event => {
              const index = Math.round(event.nativeEvent.contentOffset.x / WIDTH);
              setPhotoIndex(index);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

function AlbumView({album, onOpen}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {album.caption ? <Text style={styles.caption}>{album.caption}</Text> : null}
      <View style={styles.grid}>
        {(album.images || []).map((name, index) => (
          <TouchableOpacity key={`${name}-${index}`} style={styles.photo} activeOpacity={0.9} onPress={() => onOpen(index)}>
            <Image source={{uri: getImagePath(name)}} style={styles.photoImage} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function Empty({title, body}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name="images-outline" size={22} color="#FFFFFF" />
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
  eyebrow: {fontFamily: fonts.euclidCircularA.medium, fontSize: 13, color: MUTED},
  headerTitle: {
    marginTop: 2,
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 22,
    letterSpacing: -0.3,
    color: NAVY,
  },
  scroll: {paddingHorizontal: 18, paddingBottom: 32},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: GAP},
  tile: {
    width: TILE,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cover: {width: '100%', height: TILE * 0.78, backgroundColor: '#E7F1FA'},
  tileCopy: {paddingHorizontal: 10, paddingVertical: 10},
  tileTitle: {fontFamily: fonts.euclidCircularA.semiBold, fontSize: 14, color: NAVY},
  tileMeta: {marginTop: 2, fontFamily: fonts.euclidCircularA.medium, fontSize: 12, color: MUTED},
  caption: {
    marginBottom: 12,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  photo: {
    width: TILE,
    height: TILE,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E7F1FA',
  },
  photoImage: {width: '100%', height: '100%'},
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
  viewer: {flex: 1, backgroundColor: '#0F1F4B'},
  viewerClose: {
    position: 'absolute',
    top: 48,
    right: 18,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  viewerPage: {width: WIDTH, flex: 1, alignItems: 'center', justifyContent: 'center'},
  viewerImage: {width: WIDTH, height: '80%'},
});
