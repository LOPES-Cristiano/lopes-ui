/**
 * Utilitários para formatação, máscara e validação de documentos cadastrais brasileiros
 * (incluindo suporte ao CNPJ Alfanumérico 2026 da Receita Federal — `AA.AAA.AAA/AAAA-99`).
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function onlyDigits(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Remove caracteres não alfanuméricos e converte letras para maiúsculas (padrão CNPJ Alfanumérico 2026)
 */
export function onlyAlphanumericUpper(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

/**
 * Aplica máscara progressiva de CNPJ numérico ou alfanumérico (`AA.AAA.AAA/AAAA-99`)
 */
export function maskCnpjAlphanumeric(value: string | null | undefined): string {
  const clean = onlyAlphanumericUpper(value).slice(0, 14);
  if (!clean) return '';
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  }
  const base = clean.slice(0, 12);
  const dv = clean.slice(12).replace(/\D/g, '').slice(0, 2);
  return dv
    ? `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}/${base.slice(8, 12)}-${dv}`
    : `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}/${base.slice(8, 12)}`;
}

/**
 * Formata CPF (`000.000.000-00`) ou CNPJ numérico/alfanumérico (`AA.AAA.AAA/AAAA-99`)
 */
export function formatCpfCnpj(value: string | null | undefined): string {
  if (!value) return '-';
  const hasLetters = /[A-Za-z]/.test(value);
  if (hasLetters) {
    const alpha = onlyAlphanumericUpper(value);
    if (alpha.length === 14) {
      return `${alpha.slice(0, 2)}.${alpha.slice(2, 5)}.${alpha.slice(5, 8)}/${alpha.slice(8, 12)}-${alpha.slice(12, 14)}`;
    }
    return value;
  }
  const clean = onlyDigits(value);
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

/**
 * Valida dígitos verificadores de CPF (11 dígitos)
 */
export function isValidCPF(value: string | null | undefined): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(cpf[10]);
}

/**
 * Valida CNPJ numérico tradicional ou alfanumérico (IN RFB nº 2.229/2024: valor ASCII - 48 com módulo 11)
 */
export function isValidCNPJ(value: string | null | undefined): boolean {
  const cnpj = onlyAlphanumericUpper(value);
  if (cnpj.length !== 14) return false;
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj)) return false;
  if (/^([0-9A-Z])\1{13}$/.test(cnpj)) return false;

  const charVal = (ch: string): number => ch.charCodeAt(0) - 48;

  const calcDigit = (sliceLen: number): number => {
    let weight = 2;
    let sum = 0;
    for (let i = sliceLen - 1; i >= 0; i--) {
      sum += charVal(cnpj[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const dv1 = calcDigit(12);
  if (dv1 !== Number(cnpj[12])) return false;
  const dv2 = calcDigit(13);
  return dv2 === Number(cnpj[13]);
}

/**
 * Valida automaticamente CPF (11 dígitos) ou CNPJ numérico/alfanumérico (14 caracteres)
 */
export function isValidDocument(value: string | null | undefined): boolean {
  if (!value) return false;
  if (/[A-Za-z]/.test(value)) return isValidCNPJ(value);
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}

/**
 * Formata Telefone / Celular ((00) 0000-0000 ou (00) 00000-0000)
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '-';
  const clean = onlyDigits(value);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
}

/**
 * Formata CEP (00000-000)
 */
export function formatCep(value: string | null | undefined): string {
  if (!value) return '-';
  const clean = onlyDigits(value);
  if (clean.length === 8) {
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
}

/** Alias semântico para limpeza de documento (numérico ou alfanumérico em maiúsculas) */
export const cleanDocument = onlyAlphanumericUpper;

/** Alias semântico para máscara progressiva de CNPJ alfanumérico 2026 */
export const formatCnpjAlpha = maskCnpjAlphanumeric;

/** Alias camelCase para `isValidCNPJ` */
export const isValidCnpj = isValidCNPJ;

/** Alias camelCase para `isValidCPF` */
export const isValidCpf = isValidCPF;
