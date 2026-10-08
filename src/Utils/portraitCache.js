import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {getImagePath} from '../Service/axios';

const STORAGE_KEY = 'bw-portrait-thumbs-v1';
const MAX = 24;
const memory = new Map();
const pending = new Map();
const listeners = new Set();
let persistTimer = null;

function fileNameOf(value) {
  const raw = String(value || '').trim();
  if (
    !raw ||
    raw.startsWith('file:') ||
    raw.startsWith('data:') ||
    raw.startsWith('content:') ||
    /^https?:\/\//i.test(raw)
  ) {
    if (/^https?:\/\//i.test(raw)) {
      const path = raw.split('?')[0];
      return path.replace(/\\/g, '/').split('/').filter(Boolean).pop() || '';
    }
    return '';
  }
  return raw.replace(/\\/g, '/').split('/').filter(Boolean).pop() || '';
}

function emit() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch {
      // a subscriber unmounted
    }
  });
}

export function subscribePortraits(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function cachedPortrait(file) {
  const name = fileNameOf(file);
  return name ? memory.get(name) || '' : '';
}

function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const saved = {};
    [...memory.entries()].slice(-MAX).forEach(([key, value]) => {
      saved[key] = value;
    });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved)).catch(() => {});
  }, 300);
}

function readDataUrl(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const blob = xhr.response;
      if (!blob) {
        reject(new Error('empty'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('read'));
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    };
    xhr.onerror = () => reject(new Error('read'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri);
    xhr.send();
  });
}

export function warmPortrait(file) {
  const name = fileNameOf(file);
  if (!name || memory.has(name) || pending.has(name)) {
    return pending.get(name) || Promise.resolve();
  }
  const remote = getImagePath(name);
  if (!remote || !/^https?:\/\//i.test(remote)) {
    return Promise.resolve();
  }
  const job = ImageResizer.createResizedImage(
    remote,
    360,
    360,
    'JPEG',
    68,
    0,
    undefined,
    false,
    {mode: 'cover', onlyScaleDown: true},
  )
    .then(out => readDataUrl(out?.uri || out?.path))
    .then(dataUrl => {
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
        return;
      }
      memory.set(name, dataUrl);
      while (memory.size > MAX) {
        const oldest = memory.keys().next().value;
        memory.delete(oldest);
      }
      schedulePersist();
      emit();
    })
    .catch(() => {})
    .finally(() => {
      pending.delete(name);
    });
  pending.set(name, job);
  return job;
}

export function warmPortraits(files) {
  (files || []).filter(Boolean).forEach(warmPortrait);
}

AsyncStorage.getItem(STORAGE_KEY)
  .then(raw => {
    const saved = raw ? JSON.parse(raw) : {};
    Object.keys(saved || {}).forEach(key => {
      const value = saved[key];
      if (typeof value === 'string' && value.startsWith('data:image')) {
        memory.set(key, value);
      }
    });
    if (memory.size) {
      emit();
    }
  })
  .catch(() => {});
