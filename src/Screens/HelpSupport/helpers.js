export const CATEGORIES = [
  {value: 'GENERAL', label: 'General'},
  {value: 'FEES', label: 'Fees'},
  {value: 'HOMEWORK', label: 'Homework'},
  {value: 'ATTENDANCE', label: 'Attendance'},
  {value: 'OTHER', label: 'Other'},
];

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || 'Open';
}

export function isClosedTicket(status) {
  return status === 'CLOSED';
}

export function categoryLabel(category) {
  return CATEGORIES.find(item => item.value === category)?.label || 'General';
}

const PRIORITY_LABELS = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export function priorityLabel(priority) {
  return PRIORITY_LABELS[priority] || 'Normal';
}

export function priorityColors(priority) {
  switch (priority) {
    case 'URGENT':
      return {bg: '#FEE2E2', text: '#B91C1C'};
    case 'HIGH':
      return {bg: '#FFEDD5', text: '#C2410C'};
    case 'LOW':
      return {bg: '#F1F5F9', text: '#64748B'};
    default:
      return {bg: '#E8F1F8', text: '#035392'};
  }
}

export function statusColors(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return {bg: '#FEF3C7', text: '#B45309'};
    case 'WAITING':
      return {bg: '#EEF2FF', text: '#4338CA'};
    case 'RESOLVED':
      return {bg: '#DCFCE7', text: '#15803D'};
    case 'CLOSED':
      return {bg: '#F1F5F9', text: '#64748B'};
    default:
      return {bg: '#E8F1F8', text: '#035392'};
  }
}

export const OFFICE = {
  email: 'support@birchwood.school',
  phone: '+92 300 0000000',
  emailHref: 'mailto:support@birchwood.school',
  phoneHref: 'tel:+923000000000',
};
