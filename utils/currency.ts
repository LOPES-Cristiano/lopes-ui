/**
 * Utilitários para formatação numérica e financeira
 */

/**
 * Formata um valor numérico para Moeda Brasileira (R$ 0,00)
 */
export function formatCurrency(value: number | null | undefined): string {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata um valor numérico como Porcentagem (ex: 15,50%)
 */
export function formatPercent(value: number | null | undefined, decimalPlaces = 2): string {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `${num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}%`;
}

/**
 * Formata um número com casas decimais configuráveis
 */
export function formatDecimal(
  value: number | null | undefined,
  minDecimals = 2,
  maxDecimals = 2,
): string {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

