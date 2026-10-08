import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {getImagePath} from '../Service/axios';

const STORAGE_KEY = '@birchwood/chat-downloads';
const PATHS_KEY = '@birchwood/chat-download-paths';

function isRasterImage(file) {
  return /\.(jpe?g|png|webp|gif|heic|heif)(\?|$)/i.test(String(file || ''));
}

function normalizeFileUri(path) {
  const value = String(path || '');
  if (!value) return '';
  if (/^(file|content|https?):/i.test(value)) return value;
  if (value.startsWith('/')) return `file://${value}`;
  return value;
}

async function readSaved() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch (error) {
    return [];
  }
}

async function readPaths() {
  try {
    const raw = await AsyncStorage.getItem(PATHS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

async function writePaths(paths) {
  await AsyncStorage.setItem(PATHS_KEY, JSON.stringify(paths || {}));
}

export async function rememberDownload(file, localUri) {
  const saved = await readSaved();
  if (!saved.includes(file)) {
    saved.push(file);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  if (localUri) {
    const paths = await readPaths();
    paths[file] = localUri;
    await writePaths(paths);
  }
}

export async function localPathFor(file) {
  if (!file) return '';
  const paths = await readPaths();
  return paths[file] || '';
}

/**
 * Downloads a chat photo into app documents so it remains after a reload
 * and after the server purges undownloaded attachments.
 */
export function useChatDownloads() {
  const [savedFiles, setSavedFiles] = useState({});
  const [localPaths, setLocalPaths] = useState({});
  const [missingFiles, setMissingFiles] = useState({});
  const [downloading, setDownloading] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    Promise.all([readSaved(), readPaths()]).then(([list, paths]) => {
      if (cancel) return;
      const next = {};
      const kept = {};
      list.forEach(file => {
        next[file] = true;
        const path = normalizeFileUri(paths?.[file] || '');
        if (path) kept[file] = path;
      });
      setSavedFiles(next);
      setLocalPaths(kept);
      setReady(true);
    });
    return () => {
      cancel = true;
    };
  }, []);

  const downloadFile = useCallback(
    async file => {
      if (!file) return '';
      const existing = normalizeFileUri(localPaths[file] || '');
      if (savedFiles[file] && existing && (/^file:/i.test(existing) || !isRasterImage(file))) {
        return existing;
      }
      setDownloading(file);
      try {
        const remote = getImagePath(file);
        let localUri = remote;
        if (isRasterImage(file)) {
          const out = await ImageResizer.createResizedImage(
            remote,
            2048,
            2048,
            'JPEG',
            92,
            0,
            'chat-downloads',
            false,
            {mode: 'contain', onlyScaleDown: true},
          );
          localUri = normalizeFileUri(out?.uri || out?.path || '');
        }
        if (!localUri) {
          throw new Error('download failed');
        }
        await rememberDownload(file, localUri);
        setSavedFiles(prev => ({...prev, [file]: true}));
        setLocalPaths(prev => ({...prev, [file]: localUri}));
        setMissingFiles(prev => {
          const next = {...prev};
          delete next[file];
          return next;
        });
        return localUri;
      } catch (error) {
        setMissingFiles(prev => ({...prev, [file]: true}));
        throw error;
      } finally {
        setDownloading(current => (current === file ? '' : current));
      }
    },
    [localPaths, savedFiles],
  );

  const finishDownload = useCallback(file => {
    if (file) {
      setDownloading(current => (current === file ? '' : current));
    }
  }, []);

  const releaseLocalPath = useCallback(async file => {
    if (!file) return;
    const paths = await readPaths();
    if (!paths[file]) return;
    delete paths[file];
    await writePaths(paths);
    setLocalPaths(prev => {
      const next = {...prev};
      delete next[file];
      return next;
    });
  }, []);

  const forgetDownload = useCallback(async file => {
    if (!file) {
      return;
    }
    const saved = (await readSaved()).filter(item => item !== file);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const paths = await readPaths();
    delete paths[file];
    await writePaths(paths);
    setSavedFiles(prev => {
      const next = {...prev};
      delete next[file];
      return next;
    });
    setLocalPaths(prev => {
      const next = {...prev};
      delete next[file];
      return next;
    });
    setMissingFiles(prev => ({...prev, [file]: true}));
    setDownloading(current => (current === file ? '' : current));
  }, []);

  const markMissing = useCallback(file => {
    if (!file) return;
    setMissingFiles(prev => ({...prev, [file]: true}));
  }, []);

  const isSaved = useCallback(
    (file, mine, attachment) => {
      if (file && savedFiles[file]) {
        return true;
      }
      // Own sends can use the remote URL until the server expires/purges them.
      if (mine && file && !attachment?.expired) {
        return true;
      }
      return false;
    },
    [savedFiles],
  );

  const isMissing = useCallback(
    (file, attachment) =>
      Boolean(
        (file && missingFiles[file]) ||
          attachment?.expired ||
          (attachment && !attachment.file && (attachment.name || attachment.mime)),
      ),
    [missingFiles],
  );

  const localUri = useCallback(file => (file && localPaths[file]) || '', [localPaths]);

  return {
    ready,
    downloading,
    downloadFile,
    finishDownload,
    releaseLocalPath,
    forgetDownload,
    markMissing,
    isSaved,
    isMissing,
    localUri,
  };
}
