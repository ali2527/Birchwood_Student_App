import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import fonts from '../../Assets/fonts';
import {allApiPaths} from '../../Service/apiPaths';
import {callApi} from '../../Service/api';
import {getImagePath} from '../../Service/axios';
import {HEIGHT, WIDTH} from '../../theme/units';

const PAD = 18;
const GAP = 12;
const SLIDE_W = WIDTH - PAD * 2;
const SLIDE_H = Math.round(SLIDE_W * 0.52);
const STEP = SLIDE_W + GAP;
const AUTO_MS = 4500;
const LOOP_COPIES = 3;

function resolveImage(image) {
  if (!image) {
    return null;
  }
  if (typeof image === 'string') {
    return {uri: getImagePath(image)};
  }
  return image;
}

function loopedSlides(items) {
  if (items.length < 2) {
    return items.map((item, i) => ({
      ...item,
      _loopKey: String(item.id || item._id || i),
    }));
  }
  return Array.from({length: LOOP_COPIES}, (_, copy) =>
    items.map((item, i) => ({
      ...item,
      _loopKey: `${copy}-${item.id || item._id || i}`,
    })),
  ).flat();
}

export default function AdSlider({ads, onPressAd}) {
  const listRef = useRef(null);
  const indexRef = useRef(0);
  const [lightbox, setLightbox] = useState(null);
  const [items, setItems] = useState(() =>
    Array.isArray(ads) && ads.length ? ads : [],
  );
  const looping = items.length > 1;
  const slides = loopedSlides(items);
  const startIndex = looping ? items.length : 0;

  useEffect(() => {
    if (Array.isArray(ads)) {
      setItems(ads);
    }
  }, [ads]);

  useEffect(() => {
    if (Array.isArray(ads) && ads.length) {
      return undefined;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await callApi({
          path: allApiPaths.getPath('getActiveAdvertisements'),
        });
        if (!mounted || !res?.status) {
          return;
        }
        const list =
          res?.data?.advertisements ||
          res?.data?.docs ||
          (Array.isArray(res?.data) ? res.data : []);
        setItems(Array.isArray(list) ? list : []);
      } catch (error) {
        console.log('Failed to load advertisements', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ads]);

  useEffect(() => {
    indexRef.current = startIndex;
    if (!looping) {
      return undefined;
    }
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: startIndex * STEP,
        animated: false,
      });
    });
  }, [items.length, looping, startIndex]);

  useEffect(() => {
    if (!looping || lightbox) {
      return undefined;
    }
    const timer = setInterval(() => {
      const next = indexRef.current + 1;
      const wrapAt = items.length * (LOOP_COPIES - 1);
      listRef.current?.scrollToOffset({
        offset: next * STEP,
        animated: true,
      });
      if (next >= wrapAt) {
        const middle = items.length + (next % items.length);
        indexRef.current = middle;
        setTimeout(() => {
          listRef.current?.scrollToOffset({
            offset: middle * STEP,
            animated: false,
          });
        }, 350);
      } else {
        indexRef.current = next;
      }
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [looping, lightbox, items.length]);

  const snapToLoop = rawIndex => {
    if (!looping) {
      indexRef.current = 0;
      return;
    }
    const real = ((rawIndex % items.length) + items.length) % items.length;
    const middle = items.length + real;
    indexRef.current = middle;
    if (rawIndex !== middle) {
      listRef.current?.scrollToOffset({
        offset: middle * STEP,
        animated: false,
      });
    }
  };

  const onScrollEnd = event => {
    const raw = Math.round(event.nativeEvent.contentOffset.x / STEP);
    snapToLoop(raw);
  };

  const openAd = item => {
    if (onPressAd) {
      onPressAd(item);
      return;
    }
    setLightbox(item);
  };

  const closeLightbox = () => setLightbox(null);

  const openLink = () => {
    if (!lightbox?.link) {
      return;
    }
    Linking.openURL(lightbox.link).catch(() => {});
  };

  if (!items.length) {
    return null;
  }

  const lightboxSource = resolveImage(lightbox?.image);

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={item => item._loopKey}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={STEP}
        snapToAlignment="start"
        disableIntervalMomentum
        initialScrollIndex={startIndex}
        contentContainerStyle={styles.list}
        getItemLayout={(_, i) => ({
          length: STEP,
          offset: STEP * i,
          index: i,
        })}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        renderItem={({item}) => {
          const source = resolveImage(item.image);
          return (
            <Pressable
              onPress={() => openAd(item)}
              style={styles.slidePress}
              accessibilityRole="button"
              accessibilityLabel="Advertisement">
              <View style={styles.slide}>
                {source ? (
                  <Image
                    source={source}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.imageFallback]} />
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <Modal
        visible={Boolean(lightbox)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeLightbox}>
        <View style={styles.lightbox}>
          <Pressable
            style={styles.lightboxBackdrop}
            onPress={closeLightbox}
            accessibilityRole="button"
            accessibilityLabel="Close advertisement"
          />
          <Pressable
            style={styles.closeBtn}
            onPress={closeLightbox}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <View style={styles.lightboxBody} pointerEvents="box-none">
            {lightboxSource ? (
              <Image
                source={lightboxSource}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            ) : null}
            {lightbox?.link ? (
              <Pressable
                style={styles.linkBtn}
                onPress={openLink}
                accessibilityRole="link">
                <Text style={styles.linkText}>Open link</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
  },
  list: {
    paddingHorizontal: PAD,
  },
  slidePress: {
    width: SLIDE_W,
    marginRight: GAP,
  },
  slide: {
    width: SLIDE_W,
    height: SLIDE_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#D8DEE9',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: '#C5CEDC',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 32, 0.92)',
    justifyContent: 'center',
  },
  lightboxBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  lightboxBody: {
    width: WIDTH,
    maxHeight: HEIGHT * 0.86,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    marginTop: -2,
  },
  lightboxImage: {
    width: WIDTH - 32,
    height: HEIGHT * 0.62,
  },
  linkBtn: {
    marginTop: 18,
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#035392',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
