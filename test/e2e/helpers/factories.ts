const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export function makeUser(label = 'user') {
  const s = uid();
  return {
    email: `e2e_${label}_${s}@test.com`,
    password: 'Test@12345',
    fullName: `E2E ${label} ${s}`,
  };
}

export function makeItem(label = 'item') {
  return { name: `e2e-${label}-${uid()}`, unit: 'kg' };
}

export function makeList(label = 'list') {
  return { name: `E2E ${label} ${uid()}` };
}
