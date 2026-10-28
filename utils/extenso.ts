/**
 * Converte um valor numérico monetário (em Reais) para sua representação por extenso em maiúsculas.
 * Exemplos:
 *   243.00        -> "DUZENTOS E QUARENTA E TRÊS REAIS"
 *   1500.50       -> "MIL E QUINHENTOS REAIS E CINQUENTA CENTAVOS"
 *   1000000.00    -> "UM MILHÃO DE REAIS"
 *   1000000000.00 -> "UM BILHÃO DE REAIS"
 *   1.00          -> "UM REAL"
 *   0.50          -> "CINQUENTA CENTAVOS"
 */

const UNIDADES = [
  '',
  'UM',
  'DOIS',
  'TRÊS',
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
  if (n <= 0 || n > 999) return '';
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

interface GrupoEscala {
  valor: number;
  texto: string;
}

export function numeroParaExtenso(valor: number): string {
  if (!Number.isFinite(valor) || valor == null || valor <= 0) return 'ZERO REAIS';

  const valorArredondado = Math.round(valor * 100) / 100;
  const parteInteira = Math.floor(valorArredondado);
  const centavos = Math.round((valorArredondado - parteInteira) * 100);

  let textoReais = '';

  if (parteInteira > 0) {
    const trilhoes = Math.floor(parteInteira / 1_000_000_000_000);
    const bilhoes = Math.floor((parteInteira % 1_000_000_000_000) / 1_000_000_000);
    const milhoes = Math.floor((parteInteira % 1_000_000_000) / 1_000_000);
    const milhares = Math.floor((parteInteira % 1_000_000) / 1_000);
    const unidades = parteInteira % 1_000;

    const grupos: GrupoEscala[] = [];

    if (trilhoes > 0) {
      grupos.push({
        valor: trilhoes,
        texto: trilhoes === 1 ? 'UM TRILHÃO' : `${converterCentena(trilhoes)} TRILHÕES`,
      });
    }
    if (bilhoes > 0) {
      grupos.push({
        valor: bilhoes,
        texto: bilhoes === 1 ? 'UM BILHÃO' : `${converterCentena(bilhoes)} BILHÕES`,
      });
    }
    if (milhoes > 0) {
      grupos.push({
        valor: milhoes,
        texto: milhoes === 1 ? 'UM MILHÃO' : `${converterCentena(milhoes)} MILHÕES`,
      });
    }
    if (milhares > 0) {
      grupos.push({
        valor: milhares,
        texto: milhares === 1 ? 'MIL' : `${converterCentena(milhares)} MIL`,
      });
    }
    if (unidades > 0) {
      grupos.push({
        valor: unidades,
        texto: converterCentena(unidades),
      });
    }

    // Conjunção gramatical brasileira: usa " E " antes do último grupo quando < 100 ou múltiplo exato de 100
    let textoBase = '';
    for (let i = 0; i < grupos.length; i++) {
      if (i === 0) {
        textoBase = grupos[i].texto;
      } else {
        const isLast = i === grupos.length - 1;
        const lastNeedsE = isLast && (unidades > 0 ? (unidades < 100 || unidades % 100 === 0) : grupos[i].valor <= 100 || grupos[i].valor % 100 === 0);
        textoBase += (lastNeedsE ? ' E ' : ', ') + grupos[i].texto;
      }
    }

    // Regra do "DE REAIS" quando termina exatamente em milhão/bilhão/trilhão (milhares === 0 && unidades === 0)
    const precisaDe = parteInteira >= 1_000_000 && parteInteira % 1_000_000 === 0;
    if (parteInteira === 1) {
      textoReais = `${textoBase} REAL`;
    } else if (precisaDe) {
      textoReais = `${textoBase} DE REAIS`;
    } else {
      textoReais = `${textoBase} REAIS`;
    }
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

export const valorMonetarioPorExtenso = numeroParaExtenso;
