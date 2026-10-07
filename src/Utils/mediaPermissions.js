import {PermissionsAndroid, Platform} from 'react-native';

async function ask(permission, rationale) {
  const already = await PermissionsAndroid.check(permission);
  if (already) return {ok: true, forever: false};
  const result = await PermissionsAndroid.request(permission, rationale);
  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return {ok: true, forever: false};
  }
  return {
    ok: false,
    forever: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}

/** Camera is declared in the manifest, so Android requires a runtime grant before launchCamera. */
export async function ensureCameraPermission() {
  if (Platform.OS !== 'android') return {ok: true, forever: false};
  return ask(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera',
    message: 'Birchwood uses the camera to send a photo in chat.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });
}

/** Gallery: Android 13+ uses the system photo picker (no runtime grant). Older APIs need storage. */
export async function ensureGalleryPermission() {
  if (Platform.OS !== 'android') return {ok: true, forever: false};
  const api = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
  if (api >= 33) return {ok: true, forever: false};
  return ask(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
    title: 'Photos',
    message: 'Birchwood needs photo access to send an image in chat.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });
}
