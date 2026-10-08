function clock(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi',
  });
}

export function attendanceDotColor(child) {
  switch (child?.attendanceDot) {
    case 'green':
      return '#22C55E';
    case 'blue':
      return '#3B82F6';
    case 'red':
      return '#EF4444';
    case 'none':
      return '#94A3B8';
    default:
      return child?.checkIn ? '#22C55E' : '#94A3B8';
  }
}

const DONE_OR_AWAY = new Set([
  'ABSENT',
  'LEAVE',
  'PICKED_UP',
  'EARLY_PICKUP',
  'WEEKEND',
  'HOLIDAY',
]);

/** Absent / leave / already picked-up children are never prompted for pickup. */
export function needsPickupPrompt(child) {
  if (!child || child.todayPrompt !== 'PICKUP') {
    return false;
  }
  return !DONE_OR_AWAY.has(child.todayStatus);
}

export function needsCheckInPrompt(child) {
  return child?.todayPrompt === 'CHECKIN';
}

export function attendanceStatusLabel(child) {
  const time = clock(child?.todayCheckIn);
  const pickup = clock(child?.todayCheckOut);
  switch (child?.todayStatus) {
    case 'PRESENT':
      return time ? `Present · ${time}` : 'Present';
    case 'LATE':
      return time ? `Late · ${time}` : 'Late';
    case 'PICKED_UP':
      return pickup ? `Picked up · ${pickup}` : 'Picked up';
    case 'EARLY_PICKUP':
      return pickup ? `Early pickup · ${pickup}` : 'Early pickup';
    case 'LEAVE':
      return 'On leave';
    case 'ABSENT':
      return 'Absent';
    case 'UNMARKED':
      if (child?.checkInOpen === false && child?.checkInOpensLabel) {
        return `Opens ${child.checkInOpensLabel}`;
      }
      return 'Not marked';
    case 'WEEKEND':
      return 'Weekend';
    case 'HOLIDAY':
      return 'School closed';
    default:
      return child?.checkIn ? 'Checked in' : 'Not marked';
  }
}
