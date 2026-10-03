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
