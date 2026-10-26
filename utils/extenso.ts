/**
 * Converte um valor numérico monetário (em Reais) para sua representação por extenso em maiúsculas.
 * Exemplo: 243.00 -> "DUZENTOS E QUARENTA E TRES REAIS"
 * Exemplo: 1500.50 -> "UM MIL E QUINHENTOS REAIS E CINQUENTA CENTAVOS"
 * Exemplo: 1.00 -> "UM REAL"
 * Exemplo: 0.50 -> "CINQUENTA CENTAVOS"
 */

const UNIDADES = [
  '',
  'UM',
  'DOIS',
  'TRES',
  'QUATRO',
  'CINCO',
  'SEIS',
  'SETE',
  'OITO',
  'NOVE',
  'DEZ',
  'ONZE',
  'DOZE',
  'TREZE',
  'QUATORZE',
  'QUINZE',
  'DEZESSEIS',
  'DEZESSETE',
  'DEZOITO',
  'DEZENOVE',
];

const DEZENAS = [
  '',
  '',
  'VINTE',
  'TRINTA',
  'QUARENTA',
  'CINQUENTA',
  'SESSENTA',
  'SETENTA',
  'OITENTA',
  'NOVENTA',
];

const CENTENAS = [
  '',
  'CENTO',
  'DUZENTOS',
  'TREZENTOS',
  'QUATROCENTOS',
  'QUINHENTOS',
  'SEISCENTOS',
  'SETECENTOS',
  'OITOCENTOS',
  'NOVECENTOS',
];

function converterCentena(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CEM';

  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const resto = n % 100;

  const partes: string[] = [];

  if (c > 0) {
    partes.push(CENTENAS[c]);
  }

  if (resto > 0) {
    if (resto < 20) {
      partes.push(UNIDADES[resto]);
    } else {
      if (d > 0) partes.push(DEZENAS[d]);
      if (u > 0) partes.push(UNIDADES[u]);
    }
  }

  return partes.join(' E ');
}

export function numeroParaExtenso(valor: number): string {
  if (isNaN(valor) || valor == null || valor < 0) return 'ZERO REAIS';
  if (valor === 0) return 'ZERO REAIS';

  const valorArredondado = Math.round(valor * 100) / 100;
  const parteInteira = Math.floor(valorArredondado);
  const centavos = Math.round((valorArredondado - parteInteira) * 100);

  const partesReais: string[] = [];

  if (parteInteira > 0) {
    const milhoes = Math.floor(parteInteira / 1_000_000);
    const milhares = Math.floor((parteInteira % 1_000_000) / 1_000);
    const unidades = parteInteira % 1_000;

    if (milhoes > 0) {
      partesReais.push(
        milhoes === 1
          ? 'UM MILHAO'
          : `${converterCentena(milhoes)} MILHOES`
      );
    }

    if (milhares > 0) {
      partesReais.push(
        milhares === 1
          ? 'UM MIL'
          : `${converterCentena(milhares)} MIL`
      );
    }

    if (unidades > 0) {
      partesReais.push(converterCentena(unidades));
    }
  }

  let textoReais = '';
  if (partesReais.length > 0) {
    const textoBase = partesReais.join(' E ');
    textoReais = parteInteira === 1 ? `${textoBase} REAL` : `${textoBase} REAIS`;
  }

  let textoCentavos = '';
  if (centavos > 0) {
    const extensoCentavos = converterCentena(centavos);
    textoCentavos = centavos === 1 ? `${extensoCentavos} CENTAVO` : `${extensoCentavos} CENTAVOS`;
  }

  if (textoReais && textoCentavos) {
    return `${textoReais} E ${textoCentavos}`;
  }

  if (textoReais) {
    return textoReais;
  }

  if (textoCentavos) {
    return textoCentavos;
  }

  return 'ZERO REAIS';
}
