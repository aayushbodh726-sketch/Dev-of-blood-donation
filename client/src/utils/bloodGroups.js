export const BLOOD_GROUP_MAP = {
  'A_POS': 'A+',
  'A_NEG': 'A-',
  'B_POS': 'B+',
  'B_NEG': 'B-',
  'AB_POS': 'AB+',
  'AB_NEG': 'AB-',
  'O_POS': 'O+',
  'O_NEG': 'O-',
};

export const BLOOD_GROUP_REVERSE = Object.fromEntries(
  Object.entries(BLOOD_GROUP_MAP).map(([k, v]) => [v, k])
);

export const BLOOD_GROUP_OPTIONS = Object.entries(BLOOD_GROUP_MAP).map(([value, label]) => ({
  value,
  label,
}));

export function displayBloodGroup(apiValue) {
  return BLOOD_GROUP_MAP[apiValue] || apiValue;
}
