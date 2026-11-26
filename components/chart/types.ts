import type React from "react";

export type ChartColor =
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "violet"
  | "zinc"
  | "teal"
  | "orange"
  | "cyan";

export type ChartType =
  | "bar"
  | "horizontal-bar"
  | "area"
  | "line"
  | "composed"
  | "donut"
  | "pie"
  | "radial"
  | "radar"
  | "funnel";

export type ChartVariant = "2d" | "3d";
export type ChartCurve = "smooth" | "linear" | "step";
export type ChartBarShape = "prism" | "cylinder";

export interface ChartSeries {
  key: string;
  label: string;
  color?: ChartColor;
  /** No modo 'composed', define se a série é renderizada como barra, linha ou área */
  renderAs?: "bar" | "line" | "area";
  /** Estilo tracejado para séries de linha/meta */
  dashed?: boolean;
}

export interface ChartDataPoint {
  label: string;
  color?: ChartColor | (string & {});
  [key: string]: string | number | undefined;
}

export interface ResolvedChartSeries {
  key: string;
  label: string;
  color: ChartColor;
  renderAs?: "bar" | "line" | "area";
  dashed?: boolean;
}

export interface ChartProps {
  /** Identificador de controle de acesso RBAC */
  componentId?: string;
  /** Oculta quando acesso for negado (default: true) */
  hideIfDenied?: boolean;
  /** Tipo de visualização do gráfico */
  type?: ChartType;
  /** Dimensão visual: '2d' vetorial de alta precisão ou '3d' isométrico (kit isométrico Lopes UI) */
  variant?: ChartVariant;
  /** Exibe seletor rápido 2D / 3D no cabeçalho do gráfico */
  allowVariantToggle?: boolean;
  /** Formato das colunas no modo 3D (prism = bloco chanfrado, cylinder = cilindro) */
  barShape?: ChartBarShape;
  /** Interpolação de curvas nos gráficos de linha, área e composto */
  curve?: ChartCurve;
  /** Dados do gráfico */
  data: ChartDataPoint[];
  /** Séries para gráficos cartesianos e radar */
  series?: ChartSeries[];
  /** Chave de valor para gráficos de série única (donut, pie, radial, funnel) */
  valueKey?: string;
  /** Altura do gráfico em pixels */
  height?: number;
  /** Título opcional no cabeçalho do card */
  title?: string;
  /** Subtítulo / descrição opcional */
  subtitle?: string;
  /** Slot extra no cabeçalho (ações, filtros, badges) */
  headerExtra?: React.ReactNode;
  /** Exibe legenda das séries */
  showLegend?: boolean;
  /** Permite clicar nos itens da legenda para mostrar/ocultar séries (default: true) */
  interactiveLegend?: boolean;
  /** Exibe linhas de grade e eixos */
  showGrid?: boolean;
  /** Exibe rótulos de valor diretamente sobre barras/fatias/etapas */
  showValues?: boolean;
  /** Empilha barras no modo bar / horizontal-bar */
  stacked?: boolean;
  /** Exibe a base/bancada isométrica nos gráficos 3D (default: true) */
  showBench?: boolean;
  /** Ângulo azimutal da câmera isométrica 3D em graus (default: 36) */
  azimuth?: number;
  /** Ângulo de elevação da câmera isométrica 3D em graus (default: 26) */
  elevation?: number;
  /** Função para formatar valores numéricos nos tooltips e legendas */
  valueFormatter?: (value: number) => string;
  /** Função opcional para formatar rótulos compactos nos eixos */
  axisFormatter?: (value: number) => string;
  /** Texto central no gráfico Donut / Radial */
  centerLabel?: string;
  /** Subtexto central no gráfico Donut / Radial */
  centerSublabel?: string;
  /** Valor máximo de referência para gráfico radial/gauge (default: 100) */
  maxReference?: number;
  /** Mensagem exibida quando data estiver vazio */
  emptyMessage?: string;
  /** Callback ao clicar em um ponto/barra/fatia */
  onDataPointClick?: (point: ChartDataPoint, index: number) => void;
  /** Envolve em container com borda/card */
  bordered?: boolean;
  className?: string;
}
