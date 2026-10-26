/**
 * Utilitários para formatação e manipulação de documentos e dados cadastrais brasileiros
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function onlyDigits(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Formata CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
 */
export function formatCpfCnpj(value: string | null | undefined): string {
  if (!value) return '-';
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
