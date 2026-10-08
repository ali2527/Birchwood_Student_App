export const PLACEHOLDER_COLOR = '#B0B7C3';

export const PHONE_COUNTRIES = [
  {iso: 'US', name: 'United States', dial: '1', flag: '🇺🇸', localLength: 10, mask: 'us'},
  {iso: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦', localLength: 10, mask: 'us'},
  {iso: 'GB', name: 'United Kingdom', dial: '44', flag: '🇬🇧', localLength: 10, mask: 'uk'},
  {iso: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰', localLength: 10, mask: 'pk'},
  {iso: 'IN', name: 'India', dial: '91', flag: '🇮🇳', localLength: 10, mask: 'in'},
  {iso: 'AE', name: 'United Arab Emirates', dial: '971', flag: '🇦🇪', localLength: 9, mask: 'ae'},
  {iso: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦', localLength: 9, mask: 'ae'},
  {iso: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺', localLength: 9, mask: 'au'},
  {iso: 'NZ', name: 'New Zealand', dial: '64', flag: '🇳🇿', localLength: 9, mask: 'au'},
  {iso: 'DE', name: 'Germany', dial: '49', flag: '🇩🇪', localLength: 11, mask: 'groups'},
  {iso: 'FR', name: 'France', dial: '33', flag: '🇫🇷', localLength: 9, mask: 'fr'},
  {iso: 'IT', name: 'Italy', dial: '39', flag: '🇮🇹', localLength: 10, mask: 'groups'},
  {iso: 'ES', name: 'Spain', dial: '34', flag: '🇪🇸', localLength: 9, mask: 'ae'},
  {iso: 'NL', name: 'Netherlands', dial: '31', flag: '🇳🇱', localLength: 9, mask: 'ae'},
  {iso: 'BE', name: 'Belgium', dial: '32', flag: '🇧🇪', localLength: 9, mask: 'ae'},
  {iso: 'CH', name: 'Switzerland', dial: '41', flag: '🇨🇭', localLength: 9, mask: 'ae'},
  {iso: 'SE', name: 'Sweden', dial: '46', flag: '🇸🇪', localLength: 9, mask: 'ae'},
  {iso: 'NO', name: 'Norway', dial: '47', flag: '🇳🇴', localLength: 8, mask: 'no'},
  {iso: 'DK', name: 'Denmark', dial: '45', flag: '🇩🇰', localLength: 8, mask: 'no'},
  {iso: 'IE', name: 'Ireland', dial: '353', flag: '🇮🇪', localLength: 9, mask: 'ae'},
  {iso: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹', localLength: 9, mask: 'ae'},
  {iso: 'PL', name: 'Poland', dial: '48', flag: '🇵🇱', localLength: 9, mask: 'ae'},
  {iso: 'TR', name: 'Turkey', dial: '90', flag: '🇹🇷', localLength: 10, mask: 'tr'},
  {iso: 'EG', name: 'Egypt', dial: '20', flag: '🇪🇬', localLength: 10, mask: 'pk'},
  {iso: 'ZA', name: 'South Africa', dial: '27', flag: '🇿🇦', localLength: 9, mask: 'ae'},
  {iso: 'NG', name: 'Nigeria', dial: '234', flag: '🇳🇬', localLength: 10, mask: 'pk'},
  {iso: 'KE', name: 'Kenya', dial: '254', flag: '🇰🇪', localLength: 9, mask: 'ae'},
  {iso: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭', localLength: 10, mask: 'pk'},
  {iso: 'ID', name: 'Indonesia', dial: '62', flag: '🇮🇩', localLength: 11, mask: 'groups'},
  {iso: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾', localLength: 10, mask: 'pk'},
  {iso: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬', localLength: 8, mask: 'no'},
  {iso: 'BD', name: 'Bangladesh', dial: '880', flag: '🇧🇩', localLength: 10, mask: 'pk'},
  {iso: 'QA', name: 'Qatar', dial: '974', flag: '🇶🇦', localLength: 8, mask: 'no'},
  {iso: 'KW', name: 'Kuwait', dial: '965', flag: '🇰🇼', localLength: 8, mask: 'no'},
  {iso: 'OM', name: 'Oman', dial: '968', flag: '🇴🇲', localLength: 8, mask: 'no'},
  {iso: 'BH', name: 'Bahrain', dial: '973', flag: '🇧🇭', localLength: 8, mask: 'no'},
  {iso: 'JO', name: 'Jordan', dial: '962', flag: '🇯🇴', localLength: 9, mask: 'ae'},
  {iso: 'MX', name: 'Mexico', dial: '52', flag: '🇲🇽', localLength: 10, mask: 'us'},
  {iso: 'BR', name: 'Brazil', dial: '55', flag: '🇧🇷', localLength: 11, mask: 'br'},
  {iso: 'CN', name: 'China', dial: '86', flag: '🇨🇳', localLength: 11, mask: 'groups'},
  {iso: 'JP', name: 'Japan', dial: '81', flag: '🇯🇵', localLength: 10, mask: 'pk'},
  {iso: 'KR', name: 'South Korea', dial: '82', flag: '🇰🇷', localLength: 10, mask: 'pk'},
];

export const DEFAULT_PHONE_COUNTRY = 'US';

export function getPhoneCountry(iso) {
  return (
    PHONE_COUNTRIES.find(item => item.iso === iso) ||
    PHONE_COUNTRIES.find(item => item.iso === DEFAULT_PHONE_COUNTRY) ||
    PHONE_COUNTRIES[0]
  );
}

export function parsePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return {iso: DEFAULT_PHONE_COUNTRY, local: ''};
  }

  // A 10-digit number has no country code. Checking dial codes first turns
  // 5550201234 into Brazil (+55) and a broken local mask.
  if (digits.length === 10) {
    return {iso: DEFAULT_PHONE_COUNTRY, local: digits};
  }

  const ranked = [...PHONE_COUNTRIES].sort((a, b) => {
    if (b.dial.length !== a.dial.length) {
      return b.dial.length - a.dial.length;
    }
    if (a.iso === DEFAULT_PHONE_COUNTRY) {
      return -1;
    }
    if (b.iso === DEFAULT_PHONE_COUNTRY) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  for (const country of ranked) {
    const local = digits.slice(country.dial.length);
    if (digits.startsWith(country.dial) && local.length === country.localLength) {
      return {iso: country.iso, local};
    }
  }

  if (digits.length === 10) {
    return {iso: DEFAULT_PHONE_COUNTRY, local: digits};
  }

  const fallback = getPhoneCountry(DEFAULT_PHONE_COUNTRY);
  return {iso: fallback.iso, local: digits.slice(0, fallback.localLength)};
}

export function unmaskPhone(value, iso = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(iso);
  let digits = String(value || '').replace(/\D/g, '');
  if (
    digits.startsWith(country.dial) &&
    digits.length > country.localLength
  ) {
    digits = digits.slice(country.dial.length);
  }
  return digits.slice(0, country.localLength);
}

export function maskPhone(value, iso = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(iso);
  const digits = unmaskPhone(value, country.iso);
  return formatLocal(digits, country);
}

export function phonePlaceholder(iso = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(iso);
  const sample = '555020123456'.slice(0, country.localLength);
  return formatLocal(sample, country);
}

export function toPhonePayload(value, iso = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(iso);
  const local = unmaskPhone(value, country.iso);
  return local ? `+${country.dial}${local}` : '';
}

function formatLocal(digits, country) {
  if (!digits) {
    return '';
  }
  switch (country.mask) {
    case 'us':
      return usMask(digits);
    case 'uk':
      return splitAt(digits, [4, 6]);
    case 'pk':
      return splitAt(digits, [3, 7]);
    case 'in':
      return splitAt(digits, [5, 5]);
    case 'ae':
      return splitAt(digits, [2, 3, 4]);
    case 'au':
      return splitAt(digits, [3, 3, 3]);
    case 'fr':
      return splitAt(digits, [1, 2, 2, 2, 2]);
    case 'tr':
      return splitAt(digits, [3, 3, 4]);
    case 'no':
      return splitAt(digits, [4, 4]);
    case 'br':
      return brMask(digits);
    default:
      return splitAt(digits, [3, 3, 3, 3]);
  }
}

function usMask(digits) {
  if (digits.length <= 3) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function brMask(digits) {
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function splitAt(digits, sizes) {
  const parts = [];
  let cursor = 0;
  for (const size of sizes) {
    if (cursor >= digits.length) {
      break;
    }
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.filter(Boolean).join(' ');
}
