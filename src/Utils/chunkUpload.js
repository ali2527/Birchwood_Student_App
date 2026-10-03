import {BASE_URL} from '../Service/axios';
import {store} from '../Stores';

const IMAGE_MAX = 800 * 1024;
const DOCUMENT_MAX = 2 * 1024 * 1024;

function readBlob(uri) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => resolve(request.response);
    request.onerror = () => reject(new Error('Could not read the file'));
    request.responseType = 'blob';
    request.open('GET', uri, true);
    request.send();
  });
}

async function authed(path, init) {
  const token = store.getState().user?.token;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token || ''}`,
      ...(init.headers || {}),
    },
  });
  return response.json();
}

function maxBytes(mime, name) {
  const label = `${mime} ${name || ''}`.toLowerCase();
  if (label.includes('image/') || /\.(jpe?g|png|webp)\b/.test(label)) {
    return IMAGE_MAX;
  }
  return DOCUMENT_MAX;
}

/** Sends a photo or document in pieces. The server appends each piece into one file. */
export async function uploadChatFile(chatId, file, onProgress) {
  const blob = await readBlob(file.uri);
  if (!blob?.size) {
    throw new Error('Could not read the file');
  }
  const mime = file.type || blob.type || 'application/octet-stream';
  const limit = maxBytes(mime, file.name);
  if (blob.size > limit) {
    if (limit === IMAGE_MAX) throw new Error('Keep the photo under 800 KB');
    if (String(mime).startsWith('audio/')) throw new Error('Keep the voice message under 2 MB');
    throw new Error('Keep the document under 2 MB');
  }
  const started = await authed('message/startAttachment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      chatId,
      fileName: file.name || 'file',
      mime,
      size: blob.size,
      duration: Math.max(0, Math.round(Number(file.duration) || 0)),
      waveform: Array.isArray(file.waveform) ? file.waveform.slice(0, 48) : [],
    }),
  });
  if (!started?.status || !started.data?.uploadId) {
    throw new Error(started?.message || 'Could not start the file');
  }
  const uploadId = started.data.uploadId;
  const chunkSize = Number(started.data.chunkSize) || 48 * 1024;
  let offset = 0;
  let index = 0;
  while (offset < blob.size) {
    const slice = blob.slice(offset, Math.min(offset + chunkSize, blob.size));
    const saved = await authed('message/attachmentChunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-upload-id': uploadId,
        'x-chunk-index': String(index),
      },
      body: slice,
    });
    if (!saved?.status) {
      throw new Error(saved?.message || 'A piece of the file failed');
    }
    offset += chunkSize;
    index += 1;
    if (onProgress) onProgress(Math.min(offset, blob.size) / blob.size);
  }
  const finished = await authed('message/finishAttachment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({uploadId}),
  });
  if (!finished?.status) {
    throw new Error(finished?.message || 'Could not send the file');
  }
  return finished.data?.message;
}

export function uploadChatPhoto(chatId, file, onProgress) {
  return uploadChatFile(chatId, file, onProgress);
}
