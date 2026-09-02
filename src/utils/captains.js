export const FIXED_CAPTAINS = {
  santiago: '/captains/santiago.jpg',
  luis: '/captains/luis.jpg',
  fabricio: '/captains/fabricio.jpg',
  carlos: '/captains/carlos.jpg'
};

export const getCaptainImage = (firstName) => {
  if (!firstName) return null;
  const name = firstName.toLowerCase();
  if (name.includes('santiago')) return FIXED_CAPTAINS.santiago;
  if (name.includes('luis')) return FIXED_CAPTAINS.luis;
  if (name.includes('fabricio')) return FIXED_CAPTAINS.fabricio;
  if (name.includes('carlos')) return FIXED_CAPTAINS.carlos;
  return null;
};
