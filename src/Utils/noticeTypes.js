/**
 * Notice category labels/icons/colors — keep in sync with admin
 * (Birchwood_Admin notificationHelpers typeIcon / typeAccent / NOTIFICATION_TYPES).
 */
export const NOTICE_TYPES = [
  {value: 'GENERAL', label: 'General', icon: 'information-circle-outline'},
  {value: 'ANNOUNCEMENT', label: 'Announcement', icon: 'megaphone-outline'},
  {value: 'ALERT', label: 'Alert', icon: 'warning-outline'},
  {value: 'EVENT', label: 'Event', icon: 'calendar-outline'},
  {value: 'HOLIDAY', label: 'Holiday', icon: 'sunny-outline'},
  {value: 'REMINDER', label: 'Reminder', icon: 'time-outline'},
  {value: 'POLICY', label: 'Policy', icon: 'document-text-outline'},
];

const FALLBACK = {
  value: 'NOTIFICATION',
  label: 'Notice',
  icon: 'notifications-outline',
};

const TYPE_ACCENTS = {
  ALERT: {bg: '#FEF2F2', color: '#DC2626', border: '#FECACA'},
  ANNOUNCEMENT: {bg: '#FFFBEB', color: '#D97706', border: '#FDE68A'},
  EVENT: {bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE'},
  HOLIDAY: {bg: '#ECFDF5', color: '#059669', border: '#A7F3D0'},
  REMINDER: {bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA'},
  POLICY: {bg: '#F8FAFC', color: '#475569', border: '#CBD5E1'},
  GENERAL: {bg: '#F0F9FF', color: '#0284C7', border: '#BAE6FD'},
  NOTIFICATION: {bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE'},
};

export function noticeTypeMeta(type) {
  const key = String(type || '').toUpperCase();
  return NOTICE_TYPES.find(item => item.value === key) || FALLBACK;
}

export function noticeTypeLabel(type) {
  return noticeTypeMeta(type).label;
}

export function noticeTypeIcon(type) {
  return noticeTypeMeta(type).icon;
}

export function noticeTypeAccent(type) {
  const key = String(type || '').toUpperCase();
  return TYPE_ACCENTS[key] || TYPE_ACCENTS.NOTIFICATION;
}

export function isSchoolNotice(item) {
  if (!item) {
    return false;
  }
  return Boolean(item.broadcastId) || item.source === 'NOTICE';
}
