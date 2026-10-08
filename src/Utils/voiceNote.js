import {PermissionsAndroid, Platform, TurboModuleRegistry} from 'react-native';

function loadSound() {
  if (!TurboModuleRegistry.get('NitroModules')) return null;
  try {
    return require('react-native-nitro-sound').default;
  } catch {
    return null;
  }
}

const WAVE_BARS = 28;
let voiceSamples = [];

function meterLevel(db) {
  const value = Number(db);
  if (!Number.isFinite(value)) return 0.14;
  return Math.max(0.14, Math.min(1, (value + 42) / 42));
}

export function takeVoiceWave(count = WAVE_BARS) {
  const source = voiceSamples.slice();
  if (!source.length) return [];
  const bars = [];
  const bucket = source.length / count;
  for (let i = 0; i < count; i += 1) {
    const start = Math.floor(i * bucket);
    const end = Math.min(source.length, Math.max(start + 1, Math.floor((i + 1) * bucket)));
    let peak = 0.14;
    for (let j = start; j < end; j += 1) peak = Math.max(peak, source[j]);
    bars.push(Math.round(Math.max(0.14, Math.min(1, peak)) * 100));
  }
  return bars;
}

export async function startVoice(onLevel) {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone',
        message: 'Birchwood uses the microphone to send a voice message.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Allow the microphone to send a voice message');
    }
  }
  const Sound = loadSound();
  if (!Sound) return null;
  try {
    await Sound.stopPlayer();
  } catch {
    // nothing was playing
  }
  voiceSamples = [];
  Sound.setSubscriptionDuration(0.08);
  Sound.addRecordBackListener(event => {
    const level = meterLevel(event?.currentMetering);
    voiceSamples.push(level);
    if (voiceSamples.length > 2400) voiceSamples.shift();
    if (onLevel) onLevel(level);
  });
  try {
    return await Sound.startRecorder(undefined, undefined, true);
  } catch (error) {
    try {
      Sound.removeRecordBackListener();
    } catch {
      // the listener was not attached
    }
    throw error;
  }
}

export async function stopVoice() {
  const Sound = loadSound();
  if (!Sound) return '';
  const path = await Sound.stopRecorder();
  try {
    Sound.removeRecordBackListener();
  } catch {
    // no record listener was attached
  }
  return path;
}

export function voiceUpload(path) {
  const clean = String(path || '');
  if (!clean || clean.includes('already stopped')) return null;
  const ext = clean.toLowerCase().includes('.m4a') ? 'm4a' : 'mp4';
  const uri =
    clean.startsWith('file://') || clean.startsWith('content://')
      ? clean
      : `file://${clean}`;
  return {uri, name: `voice.${ext}`, type: 'audio/mp4'};
}
