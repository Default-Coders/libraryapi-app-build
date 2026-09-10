export function onlyDigits(value: string | null | undefined, maxLength?: number) {
  const digits = (value ?? '').replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

export function maskPhone(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskIsbn(value: string | null | undefined) {
  const digits = onlyDigits(value, 13);
  if (digits.length <= 10) {
    return [digits.slice(0, 1), digits.slice(1, 5), digits.slice(5, 9), digits.slice(9, 10)]
      .filter(Boolean)
      .join('-');
  }
  return [digits.slice(0, 3), digits.slice(3, 4), digits.slice(4, 8), digits.slice(8, 12), digits.slice(12, 13)]
    .filter(Boolean)
    .join('-');
}
