const DEFAULT_SCHOOL_TIME_ZONE = 'Asia/Karachi';

export function schoolDayKey(value, timeZone = DEFAULT_SCHOOL_TIME_ZONE) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function schoolHourNow(timeZone = DEFAULT_SCHOOL_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = Number(parts.find(part => part.type === 'hour')?.value ?? '0');
  return hour === 24 ? 0 : hour;
}

/** Morning before noon, afternoon until 5pm, evening after that. */
export function schoolGreeting(timeZone = DEFAULT_SCHOOL_TIME_ZONE) {
  const hour = schoolHourNow(timeZone);
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function isOpenDayKey(key, days) {
  return (days || []).some(item => {
    const start = item?.startKey || '';
    const end = item?.endKey || start;
    return Boolean(start) && start <= key && key <= end;
  });
}

export function isLeaveDay(value, openDays, timeZone = DEFAULT_SCHOOL_TIME_ZONE) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return isSchoolWeekday(date, timeZone) || isOpenDayKey(schoolDayKey(date, timeZone), openDays);
}

export function isSchoolWeekday(value, timeZone = DEFAULT_SCHOOL_TIME_ZONE) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const name = new Intl.DateTimeFormat('en-US', {timeZone, weekday: 'short'}).format(date);
  return name !== 'Sat' && name !== 'Sun';
}

export function isCurrentSchoolDay(value, timeZone = DEFAULT_SCHOOL_TIME_ZONE) {
  const key = schoolDayKey(value, timeZone);
  return Boolean(key) && key === schoolDayKey(new Date(), timeZone);
}

const PRESENT_NOW = new Set(['PRESENT', 'LATE']);

/** Drop a punch that belongs to a previous school day, and ignore the sticky check-in flag. */
export function freshChild(child) {
  if (!child || typeof child !== 'object') {
    return child;
  }
  const stamp = child.todayCheckIn || child.todayAttendance?.checkIn || null;
  if (stamp && !isCurrentSchoolDay(stamp)) {
    return {
      ...child,
      checkIn: false,
      todayStatus: 'UNMARKED',
      todayCheckIn: null,
      todayCheckOut: null,
      todayPrompt: null,
      attendanceDot: 'red',
      earlyPickup: false,
      todayAttendance: undefined,
    };
  }
  if (child.todayStatus) {
    const checkedIn = PRESENT_NOW.has(child.todayStatus);
    if (Boolean(child.checkIn) === checkedIn) {
      return child;
    }
    return {...child, checkIn: checkedIn};
  }
  if (child.checkIn) {
    return {...child, checkIn: false};
  }
  return child;
}
