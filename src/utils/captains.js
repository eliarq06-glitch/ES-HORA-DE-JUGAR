export const FIXED_CAPTAINS = {
  santiago: '/captains/c1.jpg',
  andres: '/captains/c2.jpg',
  danilo: '/captains/c3.jpg',
  luis: '/captains/c4.jpg'
};

export const getCaptainImage = (firstName) => {
  if (!firstName) return null;
  const name = firstName.toLowerCase();
  if (name.includes('santiago')) return FIXED_CAPTAINS.santiago;
  if (name.includes('andres')) return FIXED_CAPTAINS.andres;
  if (name.includes('danilo')) return FIXED_CAPTAINS.danilo;
  if (name.includes('luis')) return FIXED_CAPTAINS.luis;
  return null;
};
