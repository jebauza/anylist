export const removeNullFields = <T extends object>(
  dto: T,
  fields: (keyof T)[],
): Partial<T> => {
  const result = { ...dto };
  for (const field of fields) {
    if (result[field] === null) delete result[field];
  }
  return result;
};
