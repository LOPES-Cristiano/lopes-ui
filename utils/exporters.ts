/**
 * Exportadores client-side sem dependências externas para planilhas Excel estilizadas
 * (SpreadsheetML `.xls`), arquivos CSV com UTF-8 BOM e relatórios HTML prontos para impressão/PDF.
 */

import { escapeHtml } from './sanitize';

export type ExcelCellFormat =
  | 'text'
  | 'center'
  | 'integer'
  | 'number'
  | 'currency'
  | 'currencyBold'
  | 'percent'
  | 'positive'
  | 'negative';

export interface ExcelColumnDef<TRow = Record<string, unknown>> {
  key: string;
  header: string;
  width?: number;
  format?: ExcelCellFormat;
  getValue?: (row: TRow, rowIndex: number) => string | number | null | undefined;
  /** Valor ou agregador opcional para a linha de totalização no rodapé. */
  totalValue?: string | number | ((rows: readonly TRow[]) => string | number | null | undefined);
}

export interface ExcelSheetConfig<TRow = Record<string, unknown>> {
  name: string;
  title?: string;
  subtitle?: string;
  columns: readonly ExcelColumnDef<TRow>[];
  rows: readonly TRow[];
  showTotalsRow?: boolean;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').trim();
  return (cleaned || 'Planilha').slice(0, 31);
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function resolveStyleId(format: ExcelCellFormat = 'text', isTotal = false): string {
  if (isTotal) {
    if (format === 'currency' || format === 'currencyBold') return 'sTotalCurrency';
    if (format === 'percent') return 'sTotalPercent';
    if (format === 'integer') return 'sTotalInteger';
    if (format === 'number') return 'sTotalNumber';
    return 'sTotalText';
  }
  switch (format) {
    case 'center':
      return 'sCenter';
    case 'integer':
      return 'sInteger';
    case 'number':
      return 'sNumber';
    case 'currency':
      return 'sCurrency';
    case 'currencyBold':
      return 'sCurrencyBold';
    case 'percent':
      return 'sPercent';
    case 'positive':
      return 'sPos';
    case 'negative':
      return 'sNeg';
    default:
      return 'sText';
  }
}

function buildCellXml(
  raw: string | number | null | undefined,
  format: ExcelCellFormat = 'text',
  isTotal = false,
): string {
  const styleId = resolveStyleId(format, isTotal);
  const isNumericFormat =
    format === 'integer' ||
    format === 'number' ||
    format === 'currency' ||
    format === 'currencyBold' ||
    format === 'percent';

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const val =
      format === 'percent'
        ? (raw / 100).toFixed(6)
        : format === 'integer'
          ? String(Math.round(raw))
          : raw.toFixed(2);
    return `<Cell ss:StyleID="${styleId}"><Data ss:Type="Number">${val}</Data></Cell>`;
  }

  if (isNumericFormat && (raw === null || raw === undefined || raw === '')) {
    return `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">—</Data></Cell>`;
  }

  return `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${escapeXml(String(raw ?? ''))}</Data></Cell>`;
}

/**
 * Gera o conteúdo XML SpreadsheetML (`.xls`) com múltiplas abas, formatos numéricos/monetários nativos
 * do Excel, cabeçalhos estilizados e linha opcional de totais.
 */
export function buildStyledExcelXml<TRow = Record<string, unknown>>(
  sheets: readonly ExcelSheetConfig<TRow>[],
): string {
  const worksheetsXml = sheets
    .map((sheet) => {
      const colCount = Math.max(1, sheet.columns.length);
      const mergeAcross = colCount - 1;

      const columnsXml = sheet.columns
        .map((col) => `<Column ss:Width="${col.width ?? 120}"/>`)
        .join('\n   ');

      const titleRowXml = sheet.title
        ? `<Row ss:Height="26">
    <Cell ss:MergeAcross="${mergeAcross}" ss:StyleID="sTitle"><Data ss:Type="String">${escapeXml(sheet.title)}</Data></Cell>
   </Row>`
        : '';

      const subtitleRowXml = sheet.subtitle
        ? `<Row ss:Height="20">
    <Cell ss:MergeAcross="${mergeAcross}" ss:StyleID="sSub"><Data ss:Type="String">${escapeXml(sheet.subtitle)}</Data></Cell>
   </Row>`
        : '';

      const headerCellsXml = sheet.columns
        .map(
          (col) =>
            `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>`,
        )
        .join('\n    ');

      const dataRowsXml = sheet.rows
        .map((row, rowIndex) => {
          const cells = sheet.columns
            .map((col) => {
              const raw = col.getValue
                ? col.getValue(row, rowIndex)
                : ((row as Record<string, unknown>)[col.key] as string | number | null | undefined);
              return buildCellXml(raw, col.format ?? 'text', false);
            })
            .join('\n    ');
          return `<Row ss:Height="20">\n    ${cells}\n   </Row>`;
        })
        .join('\n   ');

      let totalsRowXml = '';
      if (sheet.showTotalsRow) {
        const totalCells = sheet.columns
          .map((col, idx) => {
            const resolved =
              typeof col.totalValue === 'function'
                ? col.totalValue(sheet.rows)
                : col.totalValue !== undefined
                  ? col.totalValue
                  : idx === 0
                    ? 'TOTAL'
                    : '';
            return buildCellXml(resolved, col.format ?? 'text', true);
          })
          .join('\n    ');
        totalsRowXml = `<Row ss:Height="22">\n    ${totalCells}\n   </Row>`;
      }

      return `<Worksheet ss:Name="${escapeXml(sanitizeSheetName(sheet.name))}">
  <Table>
   ${columnsXml}
   ${titleRowXml}
   ${subtitleRowXml}
   <Row ss:Height="24">
    ${headerCellsXml}
   </Row>
   ${dataRowsXml}
   ${totalsRowXml}
  </Table>
 </Worksheet>`;
    })
    .join('\n ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#18181B"/>
  </Style>
  <Style ss:ID="sTitle">
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sSub">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#3F3F46"/>
   <Interior ss:Color="#F4F4F5" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sHeader">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#27272A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="sText">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sInteger">
   <NumberFormat ss:Format="#,##0"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sNumber">
   <NumberFormat ss:Format="#,##0.00"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sCurrency">
   <NumberFormat ss:Format="&quot;R$&quot;\\ #,##0.00"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sCurrencyBold">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#3730A3"/>
   <NumberFormat ss:Format="&quot;R$&quot;\\ #,##0.00"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sPercent">
   <NumberFormat ss:Format="0.00%"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sPos">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sNeg">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sTotalText">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sTotalInteger">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sTotalNumber">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0.00"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sTotalCurrency">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;R$&quot;\\ #,##0.00"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="sTotalPercent">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="0.00%"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
 </Styles>
 ${worksheetsXml}
</Workbook>`;
}

/**
 * Baixa uma planilha Excel estilizada (`.xls` SpreadsheetML) diretamente no navegador.
 */
export function exportStyledExcelXml<TRow = Record<string, unknown>>(
  sheets: readonly ExcelSheetConfig<TRow>[],
  filename = 'relatorio.xls',
): void {
  const xml = buildStyledExcelXml(sheets);
  const safeName = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  const blob = new Blob(['\uFEFF', xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  triggerBlobDownload(blob, safeName);
}

/**
 * Baixa dados tabulares como CSV com UTF-8 BOM (compatível com Excel pt-BR usando `;`).
 */
export function exportCsv<TRow = Record<string, unknown>>(
  columns: readonly { key: string; header: string; getValue?: (row: TRow) => unknown }[],
  rows: readonly TRow[],
  filename = 'dados.csv',
  delimiter = ';',
): void {
  const escapeCsvCell = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes('"') || str.includes(delimiter) || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(delimiter);
  const bodyLines = rows.map((row) =>
    columns
      .map((col) =>
        escapeCsvCell(col.getValue ? col.getValue(row) : (row as Record<string, unknown>)[col.key]),
      )
      .join(delimiter),
  );

  const csv = [headerLine, ...bodyLines].join('\r\n');
  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  triggerBlobDownload(blob, safeName);
}

export interface PrintableReportConfig<TRow = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  organizationName?: string;
  generatedAtLabel?: string;
  orientation?: 'portrait' | 'landscape';
  columns: readonly {
    key: string;
    header: string;
    align?: 'left' | 'center' | 'right';
    getValue?: (row: TRow, index: number) => string | number | null | undefined;
  }[];
  rows: readonly TRow[];
}

/**
 * Gera um documento HTML A4 limpo e paginado com `@page` pronto para impressão ou exportação em PDF.
 */
export function generatePrintableReportHtml<TRow = Record<string, unknown>>(
  config: PrintableReportConfig<TRow>,
): string {
  const orientation = config.orientation ?? 'portrait';
  const generatedAt =
    config.generatedAtLabel ?? new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const ths = config.columns
    .map(
      (col) =>
        `<th style="text-align:${col.align ?? 'left'}">${escapeHtml(col.header)}</th>`,
    )
    .join('');

  const trs = config.rows
    .map((row, idx) => {
      const tds = config.columns
        .map((col) => {
          const val = col.getValue
            ? col.getValue(row, idx)
            : ((row as Record<string, unknown>)[col.key] as string | number | null | undefined);
          return `<td style="text-align:${col.align ?? 'left'}">${escapeHtml(val ?? '—')}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(config.title)}</title>
  <style>
    @page { size: A4 ${orientation}; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #18181b; margin: 0; font-size: 11px; }
    header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #18181b; padding-bottom: 8px; margin-bottom: 12px; }
    h1 { font-size: 16px; margin: 0; }
    .sub { color: #52525b; font-size: 11px; margin-top: 2px; }
    .meta { text-align: right; color: #52525b; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
    thead { display: table-header-group; }
    th { background: #f4f4f5; border-bottom: 1px solid #d4d4d8; padding: 6px 8px; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
    td { border-bottom: 1px solid #e4e4e7; padding: 6px 8px; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
  </style>
</head>
<body>
  <header>
    <div>
      ${config.organizationName ? `<div class="sub" style="font-weight:600;color:#18181b">${escapeHtml(config.organizationName)}</div>` : ''}
      <h1>${escapeHtml(config.title)}</h1>
      ${config.subtitle ? `<div class="sub">${escapeHtml(config.subtitle)}</div>` : ''}
    </div>
    <div class="meta">Emitido em ${escapeHtml(generatedAt)}<br/>Total: ${config.rows.length} registro(s)</div>
  </header>
  <table>
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>
</body>
</html>`;
}
