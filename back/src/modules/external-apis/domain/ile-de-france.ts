const ILE_DE_FRANCE_DEPARTMENTS = new Set([
  '75',
  '77',
  '78',
  '91',
  '92',
  '93',
  '94',
  '95',
]);

export const isIleDeFranceDepartment = (departmentCode?: string): boolean =>
  !!departmentCode && ILE_DE_FRANCE_DEPARTMENTS.has(departmentCode);

export const isIleDeFrancePostalCode = (postalCode?: string): boolean =>
  isIleDeFranceDepartment(postalCode?.slice(0, 2));
