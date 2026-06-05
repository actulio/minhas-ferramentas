/**
 * Utility to calculate CPF check digit.
 */
function calculateCPFCheckDigit(base: string, weight: number): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[i], 10) * (weight - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Utility to calculate CNPJ check digit.
 */
function calculateCNPJCheckDigit(base: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[i], 10) * weights[i];
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Validates a CPF string.
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;

  // CPF cannot be all identical digits
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  const base = cleanCPF.slice(0, 9);
  const dg1 = calculateCPFCheckDigit(base, 10);
  const dg2 = calculateCPFCheckDigit(base + dg1, 11);

  return cleanCPF.slice(9) === `${dg1}${dg2}`;
}

/**
 * Validates a CNPJ string.
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14) return false;

  // CNPJ cannot be all identical digits
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  const base = cleanCNPJ.slice(0, 12);
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dg1 = calculateCNPJCheckDigit(base, weights1);

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dg2 = calculateCNPJCheckDigit(base + dg1, weights2);

  return cleanCNPJ.slice(12) === `${dg1}${dg2}`;
}

/**
 * Generates a valid CPF.
 */
export function generateCPF(formatted = true): string {
  let base = "";
  // Ensure we don't accidentally generate a sequence of identical digits
  do {
    base = "";
    for (let i = 0; i < 9; i++) {
      base += Math.floor(Math.random() * 10).toString();
    }
  } while (/^(\d)\1{8}$/.test(base));

  const dg1 = calculateCPFCheckDigit(base, 10);
  const dg2 = calculateCPFCheckDigit(base + dg1, 11);
  const full = base + dg1 + dg2;

  if (formatted) {
    return `${full.slice(0, 3)}.${full.slice(3, 6)}.${full.slice(6, 9)}-${full.slice(9)}`;
  }
  return full;
}

/**
 * Generates a valid CNPJ.
 */
export function generateCNPJ(formatted = true): string {
  let base = "";
  // 8 random digits + 0001 (standard headquarters suffix)
  do {
    base = "";
    for (let i = 0; i < 8; i++) {
      base += Math.floor(Math.random() * 10).toString();
    }
  } while (/^(\d)\1{7}$/.test(base));

  base += "0001";

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dg1 = calculateCNPJCheckDigit(base, weights1);

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dg2 = calculateCNPJCheckDigit(base + dg1, weights2);
  const full = base + dg1 + dg2;

  if (formatted) {
    return `${full.slice(0, 2)}.${full.slice(2, 5)}.${full.slice(5, 8)}/${full.slice(8, 12)}-${full.slice(12)}`;
  }
  return full;
}
