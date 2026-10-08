import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import profile_icon from '../../Assets/images/profile_bg.png';
import {getImagePath} from '../../Service/axios';
import {
  cachedPortrait,
  subscribePortraits,
  warmPortrait,
} from '../../Utils/portraitCache';

export default function Portrait({file, style, fallback = profile_icon}) {
  const [, setTick] = useState(0);

  useEffect(() => subscribePortraits(() => setTick(tick => tick + 1)), []);

  useEffect(() => {
    warmPortrait(file);
  }, [file]);

  const cached = cachedPortrait(file);
  if (cached) {
    return <Image source={{uri: cached}} style={style} fadeDuration={0} />;
  }

  const uri = getImagePath(file);
  if (!uri) {
    return <Image source={fallback} style={style} />;
  }
  if (
    uri.startsWith('file:') ||
    uri.startsWith('data:') ||
    uri.startsWith('content:')
  ) {
    return <Image source={{uri}} style={style} fadeDuration={0} />;
  }

  return (
    <Image
      source={{uri, cache: 'force-cache'}}
      style={style}
      fadeDuration={0}
    />
  );
}
