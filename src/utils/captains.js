export const FIXED_CAPTAINS = {
  fabricio: '/captains/c1.jpg',
  santiago: '/captains/c2.jpg',
  carlos: '/captains/c3.jpg',
  luis: '/captains/c4.jpg'
};

export const getCaptainImage = (firstName) => {
  if (!firstName) return null;
  const name = firstName.toLowerCase();
  if (name.includes('fabricio')) return FIXED_CAPTAINS.fabricio;
  if (name.includes('santiago')) return FIXED_CAPTAINS.santiago;
  if (name.includes('carlos')) return FIXED_CAPTAINS.carlos;
  if (name.includes('luis')) return FIXED_CAPTAINS.luis;
  return null;
};
