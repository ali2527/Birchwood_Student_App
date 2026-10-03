import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const STORAGE_KEY = '@birchwood/chat-downloads';

async function readSaved() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch (error) {
    return [];
  }
}

export async function rememberDownload(file) {
  const saved = await readSaved();
  if (!saved.includes(file)) {
    saved.push(file);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
}

/** Photos stay on the server until this chat explicitly asks for one. */
export function useChatDownloads() {
  const [savedFiles, setSavedFiles] = useState({});
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    readSaved().then(list => {
      const next = {};
      list.forEach(file => {
        next[file] = true;
      });
      setSavedFiles(next);
    });
  }, []);

  const downloadFile = useCallback(async file => {
    if (!file || savedFiles[file]) {
      return;
    }
    setDownloading(file);
    await rememberDownload(file);
    setSavedFiles(prev => ({...prev, [file]: true}));
  }, [savedFiles]);

  const finishDownload = useCallback(file => {
    if (file) {
      setDownloading(current => (current === file ? '' : current));
    }
  }, []);

  const forgetDownload = useCallback(async file => {
    if (!file) {
      return;
    }
    const saved = (await readSaved()).filter(item => item !== file);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setSavedFiles(prev => {
      const next = {...prev};
      delete next[file];
      return next;
    });
    setDownloading(current => (current === file ? '' : current));
  }, []);

  const isSaved = useCallback(
    (file, mine) => Boolean(mine || (file && savedFiles[file])),
    [savedFiles],
  );

  return {downloading, downloadFile, finishDownload, forgetDownload, isSaved};
}
