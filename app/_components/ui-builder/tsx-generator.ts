import type { UICanvasConfig, UICanvasElement, UICodeExportMode } from "./types";

function escJsxText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function q(val: unknown, fallback = ""): string {
  const s = typeof val === "string" ? val : typeof val === "number" ? String(val) : fallback;
  return JSON.stringify(s);
}

function asStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return fallback;
}

function asNum(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBool(val: unknown, fallback = false): boolean {
  return typeof val === "boolean" ? val : fallback;
}

function indentBlock(code: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => (line.trim() ? `${pad}${line}` : ""))
    .join("\n");
}

function sanitizeIdentifier(raw: string, fallback = "GeneratedLopesScreen"): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, "");
  if (!cleaned) return fallback;
  return /^[0-9]/.test(cleaned) ? `Screen${cleaned}` : cleaned;
}

const SPAN_CLASS_MAP: Record<number, string> = {
  1: "col-span-12 sm:col-span-6 lg:col-span-1",
  2: "col-span-12 sm:col-span-6 lg:col-span-2",
  3: "col-span-12 sm:col-span-6 lg:col-span-3",
  4: "col-span-12 md:col-span-6 lg:col-span-4",
  5: "col-span-12 lg:col-span-5",
  6: "col-span-12 lg:col-span-6",
  7: "col-span-12 lg:col-span-7",
  8: "col-span-12 lg:col-span-8",
  9: "col-span-12 lg:col-span-9",
  10: "col-span-12 lg:col-span-10",
  11: "col-span-12 lg:col-span-11",
  12: "col-span-12",
};

interface GenContext {
  lopesImports: Set<string>;
  lucideImports: Set<string>;
  stateVars: { varName: string; setterName: string; comment: string }[];
  overlayModalsJsx: string[];
}

function registerIcon(ctx: GenContext, iconName: unknown): string | null {
  if (typeof iconName !== "string" || !iconName.trim() || iconName === "none") return null;
  const clean = iconName === "Calendar" ? "Calendar as CalendarIcon" : iconName === "Barcode" ? "Barcode as BarcodeIcon" : iconName;
  ctx.lucideImports.add(clean);
  if (iconName === "Calendar") return "CalendarIcon";
  if (iconName === "Barcode") return "BarcodeIcon";
  return iconName;
}

function renderElementJsx(el: UICanvasElement, ctx: GenContext, nestedChildrenJsx?: string): string {
  const p = el.props;
  const cidProp = el.componentId ? ` componentId=${q(el.componentId)}` : "";

  switch (el.type) {
    case "container_panel": {
      const title = asStr(p.title);
      const subtitle = asStr(p.subtitle);
      const showHeader = asBool(p.showHeader, true);
      return [
        `<section${el.componentId ? ` data-component-id=${q(el.componentId)}` : ""} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs space-y-4">`,
        ...(showHeader && (title || subtitle)
          ? [
              `  <header className="border-b border-zinc-100 dark:border-zinc-800 pb-3">`,
              ...(title ? [`    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${escJsxText(title)}</h3>`] : []),
              ...(subtitle ? [`    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">${escJsxText(subtitle)}</p>`] : []),
              `  </header>`,
            ]
          : []),
        ...(nestedChildrenJsx ? [indentBlock(nestedChildrenJsx, 2)] : []),
        `</section>`,
      ].join("\n");
    }

    case "card": {
      ctx.lopesImports.add("Card");
      ctx.lopesImports.add("CardHeader");
      ctx.lopesImports.add("CardBody");
      const showFooter = asBool(p.showFooter, true);
      const footerPrimary = asStr(p.footerPrimary);
      const footerSecondary = asStr(p.footerSecondary);
      const badgeText = asStr(p.badgeText);
      if (badgeText) ctx.lopesImports.add("Badge");
      if (showFooter && (footerPrimary || footerSecondary)) {
        ctx.lopesImports.add("CardFooter");
        ctx.lopesImports.add("Button");
      }
      const iconSym = registerIcon(ctx, p.iconName);

      return [
        `<Card${cidProp} variant=${q(p.variant, "default")} color=${q(p.color, "primary")} shadow=${q(p.shadow, "sm")} accent={${asBool(p.accent, true)}}>`,
        `  <CardHeader`,
        `    title=${q(p.title, "Card")}`,
        `    description=${q(p.description)}`,
        ...(iconSym ? [`    icon={${iconSym}}`] : []),
        ...(badgeText ? [`    action={<Badge label=${q(badgeText)} variant="primary" size="sm" />}`] : []),
        `  />`,
        ...(asStr(p.body)
          ? [
              `  <CardBody className="text-sm text-zinc-600 dark:text-zinc-300">`,
              `    ${escJsxText(asStr(p.body))}`,
              `  </CardBody>`,
            ]
          : []),
        ...(showFooter && (footerPrimary || footerSecondary)
          ? [
              `  <CardFooter align="right" divider>`,
              ...(footerSecondary ? [`    <Button size="sm" variant="outline">${escJsxText(footerSecondary)}</Button>`] : []),
              ...(footerPrimary ? [`    <Button size="sm" variant="primary">${escJsxText(footerPrimary)}</Button>`] : []),
              `  </CardFooter>`,
            ]
          : []),
        `</Card>`,
      ].join("\n");
    }

    case "typography": {
      const level = asStr(p.level, "h2");
      const tag = level === "h1" ? "h1" : level === "h3" ? "h3" : level === "body" || level === "eyebrow" ? "p" : "h2";
      const cls =
        level === "h1"
          ? "text-2xl font-bold text-zinc-900 dark:text-zinc-100"
          : level === "h3"
            ? "text-base font-semibold text-zinc-900 dark:text-zinc-100"
            : level === "eyebrow"
              ? "text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400"
              : "text-lg font-bold text-zinc-900 dark:text-zinc-100";
      const subtext = asStr(p.subtext);
      return [
        `<div>`,
        `  <${tag} className="${cls}">${escJsxText(asStr(p.text, "Título"))}</${tag}>`,
        ...(subtext ? [`  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">${escJsxText(subtext)}</p>`] : []),
        `</div>`,
      ].join("\n");
    }

    case "separator": {
      ctx.lopesImports.add("Separator");
      const label = asStr(p.label);
      return `<Separator orientation=${q(p.orientation, "horizontal")}${label ? ` label=${q(label)} labelAlign=${q(p.labelAlign, "center")}` : ""} />`;
    }

    case "page_header": {
      ctx.lopesImports.add("PageHeader");
      const iconSym = registerIcon(ctx, p.iconName);
      const badgeText = asStr(p.badgeText);
      const primary = asStr(p.primaryAction);
      const secondary = asStr(p.secondaryAction);
      if (badgeText) ctx.lopesImports.add("StatusBadge");
      if (primary || secondary) ctx.lopesImports.add("Button");

      return [
        `<PageHeader${cidProp}`,
        `  title=${q(p.title, "Título da Página")}`,
        `  description=${q(p.description)}`,
        ...(iconSym ? [`  icon={${iconSym}}`] : []),
        ...(badgeText ? [`  badge={<StatusBadge label=${q(badgeText)} tone="success" size="xs" dot pulse />}`] : []),
        ...(primary || secondary
          ? [
              `  actions={`,
              `    <div className="flex items-center gap-2">`,
              ...(secondary ? [`      <Button size="sm" variant="outline">${escJsxText(secondary)}</Button>`] : []),
              ...(primary ? [`      <Button size="sm" variant="primary">${escJsxText(primary)}</Button>`] : []),
              `    </div>`,
              `  }`,
            ]
          : []),
        `/>`,
      ].join("\n");
    }

    case "breadcrumb": {
      ctx.lopesImports.add("Breadcrumb");
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : []);
      return `<Breadcrumb${cidProp} separator=${q(p.separator, "chevron")} homeIcon={${asBool(p.homeIcon, true)}} items={${items}} />`;
    }

    case "tabs": {
      ctx.lopesImports.add("Tabs");
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : [], null, 2);
      return `<Tabs variant=${q(p.variant, "pills")} size=${q(p.size, "md")} fullWidth={${asBool(p.fullWidth, false)}} items={${indentBlock(items, 2).trimStart()}} />`;
    }

    case "segmented_control": {
      ctx.lopesImports.add("SegmentedControl");
      const data = JSON.stringify(Array.isArray(p.items) ? p.items : []);
      return `<SegmentedControl${cidProp} size=${q(p.size, "sm")} variant=${q(p.variant, "default")} fullWidth={${asBool(p.fullWidth, true)}} defaultValue=${q(p.defaultValue)} data={${data}} />`;
    }

    case "stepper": {
      ctx.lopesImports.add("Stepper");
      const steps = JSON.stringify(Array.isArray(p.steps) ? p.steps : []);
      return `<Stepper${cidProp} activeStep={${asNum(p.activeStep, 1)}} orientation=${q(p.orientation, "horizontal")} variant=${q(p.variant, "default")} size=${q(p.size, "sm")} steps={${steps}} />`;
    }

    case "stat_card": {
      ctx.lopesImports.add("StatCard");
      const iconSym = registerIcon(ctx, p.iconName);
      const rawSpark = Array.isArray(p.sparkValues) ? p.sparkValues : [55, 64, 72, 81, 90];
      const sparkJson = JSON.stringify(rawSpark.map((v) => ({ value: asNum(v, 50) })));
      return [
        `<StatCard${cidProp}`,
        `  title=${q(p.title, "KPI")}`,
        `  value=${q(p.value, "0")}`,
        ...(asStr(p.unit) ? [`  unit=${q(p.unit)}`] : []),
        `  color=${q(p.color, "indigo")}`,
        ...(iconSym ? [`  icon={${iconSym}}`] : []),
        `  trend={{ value: ${asNum(p.trendValue, 0)}, label: ${q(p.trendLabel, "vs. mês anterior")} }}`,
        ...(asBool(p.showSparkline, true) ? [`  spark={${sparkJson}}`] : []),
        ...(p.progress !== undefined ? [`  progress={${asNum(p.progress, 80)}} progressLabel=${q(p.progressLabel)}`] : []),
        `/>`,
      ].join("\n");
    }

    case "chart": {
      ctx.lopesImports.add("Chart");
      const seriesJson = JSON.stringify(Array.isArray(p.series) ? p.series : [], null, 2);
      const dataJson = JSON.stringify(Array.isArray(p.data) ? p.data : [], null, 2);
      return [
        `<Chart${cidProp}`,
        `  type=${q(p.type, "bar")}`,
        `  title=${q(p.title)}`,
        `  subtitle=${q(p.subtitle)}`,
        `  height={${Math.max(180, el.height - 108)}}`,
        `  showLegend={${asBool(p.showLegend, true)}}`,
        `  showGrid={${asBool(p.showGrid, true)}}`,
        `  stacked={${asBool(p.stacked, false)}}`,
        `  series={${indentBlock(seriesJson, 2).trimStart()}}`,
        `  data={${indentBlock(dataJson, 2).trimStart()}}`,
        `/>`,
      ].join("\n");
    }

    case "progress": {
      ctx.lopesImports.add("Progress");
      return `<Progress label=${q(p.label)} value={${asNum(p.value, 75)}} max={${asNum(p.max, 100)}} variant=${q(p.variant, "linear")} tone=${q(p.tone, "primary")} size=${q(p.size, "md")} showValue={${asBool(p.showValue, true)}} />`;
    }

    case "service_status_card": {
      ctx.lopesImports.add("ServiceStatusCard");
      const iconSym = registerIcon(ctx, p.iconName);
      return `<ServiceStatusCard${cidProp} name=${q(p.name)} description=${q(p.description)} status=${q(p.status, "operational")} latencyMs={${asNum(p.latencyMs, 60)}} uptimePct={${asNum(p.uptimePct, 99.96)}}${iconSym ? ` icon={${iconSym}}` : ""} />`;
    }

    case "table": {
      ctx.lopesImports.add("Table");
      const cols = JSON.stringify(Array.isArray(p.columns) ? p.columns : [], null, 2);
      const rows = JSON.stringify(Array.isArray(p.rows) ? p.rows : [], null, 2);
      return [
        `<Table${cidProp}`,
        `  variant=${q(p.variant, "default")}`,
        `  size=${q(p.size, "sm")}`,
        `  zebra={${asBool(p.zebra, true)}}`,
        `  hoverable={${asBool(p.hoverable, true)}}`,
        `  stickyHeader={${asBool(p.stickyHeader, true)}}`,
        `  columns={${indentBlock(cols, 2).trimStart()}}`,
        `  rows={${indentBlock(rows, 2).trimStart()}}`,
        `/>`,
      ].join("\n");
    }

    case "filter_bar": {
      ctx.lopesImports.add("FilterBar");
      const filters = JSON.stringify(Array.isArray(p.filters) ? p.filters : []);
      return `<FilterBar clearAllLabel=${q(p.clearAllLabel, "Limpar tudo")} filters={${filters}} />`;
    }

    case "description_list": {
      ctx.lopesImports.add("DescriptionList");
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : [], null, 2);
      return [
        `<DescriptionList${cidProp}`,
        `  title=${q(p.title)}`,
        `  subtitle=${q(p.subtitle)}`,
        `  layout=${q(p.layout, "grid")}`,
        `  columns={${asNum(p.columns, 2)}}`,
        `  bordered={${asBool(p.bordered, true)}}`,
        `  striped={${asBool(p.striped, true)}}`,
        `  size=${q(p.size, "sm")}`,
        `  items={${indentBlock(items, 2).trimStart()}}`,
        `/>`,
      ].join("\n");
    }

    case "kanban_board": {
      ctx.lopesImports.add("KanbanBoard");
      const cols = JSON.stringify(Array.isArray(p.columns) ? p.columns : [], null, 2);
      return `<KanbanBoard columns={${indentBlock(cols, 2).trimStart()}} />`;
    }

    case "timeline": {
      ctx.lopesImports.add("Timeline");
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : [], null, 2);
      return `<Timeline${cidProp} size=${q(p.size, "sm")} connectorStyle=${q(p.connectorStyle, "solid")} items={${indentBlock(items, 2).trimStart()}} />`;
    }

    case "activity_feed": {
      ctx.lopesImports.add("ActivityFeed");
      const rawEvents = Array.isArray(p.events) ? p.events : [];
      const mapped = rawEvents.map((ev, idx) => {
        const obj = (ev && typeof ev === "object" ? ev : {}) as Record<string, unknown>;
        return {
          id: asStr(obj.id, `ev_${idx + 1}`),
          title: asStr(obj.title),
          description: asStr(obj.description),
          color: asStr(obj.color, "indigo"),
          actor: asStr(obj.actorName)
            ? { name: asStr(obj.actorName), initials: asStr(obj.actorInitials) }
            : undefined,
          timestamp: asStr(obj.timestamp, "Agora"),
        };
      });
      return `<ActivityFeed${cidProp} events={${indentBlock(JSON.stringify(mapped, null, 2), 2).trimStart()}} />`;
    }

    case "accordion": {
      ctx.lopesImports.add("Accordion");
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : [], null, 2);
      return `<Accordion${cidProp} variant=${q(p.variant, "bordered")} size=${q(p.size, "sm")} multiple={${asBool(p.multiple, false)}} items={${indentBlock(items, 2).trimStart()}} />`;
    }

    case "tree_view": {
      ctx.lopesImports.add("TreeView");
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : [], null, 2);
      return `<TreeView size=${q(p.size, "sm")} showLines={${asBool(p.showLines, true)}} selectionMode=${q(p.selectionMode, "single")} items={${indentBlock(items, 2).trimStart()}} />`;
    }

    case "transfer_list": {
      ctx.lopesImports.add("TransferList");
      const src = JSON.stringify(Array.isArray(p.sourceItems) ? p.sourceItems : [], null, 2);
      const tgt = JSON.stringify(Array.isArray(p.targetItems) ? p.targetItems : [], null, 2);
      return `<TransferList sourceTitle=${q(p.sourceTitle)} targetTitle=${q(p.targetTitle)} sourceItems={${indentBlock(src, 2).trimStart()}} targetItems={${indentBlock(tgt, 2).trimStart()}} />`;
    }

    case "calendar": {
      ctx.lopesImports.add("Calendar");
      return `<Calendar size=${q(p.size, "sm")} fillWidth={${asBool(p.fillWidth, true)}} showWeekNumbers={${asBool(p.showWeekNumbers, false)}} />`;
    }

    case "text_field": {
      ctx.lopesImports.add("TextField");
      const mask = asStr(p.mask, "none");
      return `<TextField${cidProp}${asStr(p.label) ? ` label=${q(p.label)}` : ""} placeholder=${q(p.placeholder)} defaultValue=${q(p.defaultValue)}${mask && mask !== "none" ? ` mask=${q(mask)}` : ""} variant=${q(p.variant, "default")} size=${q(p.size, "md")} required={${asBool(p.required, false)}} />`;
    }

    case "textarea_field": {
      ctx.lopesImports.add("TextareaField");
      return `<TextareaField${cidProp} label=${q(p.label)} placeholder=${q(p.placeholder)} rows={${asNum(p.rows, 3)}} showCount={${asBool(p.showCount, true)}} size=${q(p.size, "md")} />`;
    }

    case "number_field": {
      ctx.lopesImports.add("NumberField");
      return `<NumberField${cidProp} label=${q(p.label)} defaultValue={${asNum(p.defaultValue, 1)}} showControls={${asBool(p.showControls, true)}}${asStr(p.suffix) ? ` suffix=${q(p.suffix)}` : ""} size=${q(p.size, "md")} />`;
    }

    case "price_input": {
      ctx.lopesImports.add("PriceInput");
      return `<PriceInput${cidProp} label=${q(p.label)} defaultValue={${asNum(p.defaultValue, 0)}} currency=${q(p.currency, "BRL")} size=${q(p.size, "md")} required={${asBool(p.required, false)}} />`;
    }

    case "select_field": {
      ctx.lopesImports.add("SelectField");
      const options = JSON.stringify(Array.isArray(p.options) ? p.options : []);
      return `<SelectField${cidProp} label=${q(p.label)} placeholder=${q(p.placeholder)} defaultValue=${q(p.defaultValue)} searchable={${asBool(p.searchable, true)}} clearable={${asBool(p.clearable, false)}} size=${q(p.size, "md")} options={${options}} />`;
    }

    case "date_picker_field": {
      ctx.lopesImports.add("DatePickerField");
      return `<DatePickerField${cidProp} label=${q(p.label)} defaultValue=${q(p.defaultValue)} size=${q(p.size, "md")} clearable={${asBool(p.clearable, true)}} required={${asBool(p.required, false)}} />`;
    }

    case "switch_field": {
      ctx.lopesImports.add("Switch");
      return `<Switch${cidProp} label=${q(p.label)} description=${q(p.description)} defaultChecked={${asBool(p.defaultChecked, true)}} color=${q(p.color, "indigo")} size=${q(p.size, "md")} />`;
    }

    case "checkbox_field": {
      ctx.lopesImports.add("Checkbox");
      return `<Checkbox${cidProp} label=${q(p.label)} description=${q(p.description)} defaultChecked={${asBool(p.defaultChecked, true)}} size=${q(p.size, "sm")} />`;
    }

    case "slider_field": {
      ctx.lopesImports.add("SliderField");
      return `<SliderField${cidProp} label=${q(p.label)} defaultValue={${asNum(p.defaultValue, 20)}} min={${asNum(p.min, 0)}} max={${asNum(p.max, 100)}} step={${asNum(p.step, 5)}} showValue={${asBool(p.showValue, true)}} />`;
    }

    case "rating_field": {
      ctx.lopesImports.add("RatingField");
      return `<RatingField${cidProp} label=${q(p.label)} defaultValue={${asNum(p.defaultValue, 5)}} max={${asNum(p.max, 5)}} tone=${q(p.tone, "amber")} size=${q(p.size, "md")} showValue={${asBool(p.showValue, true)}} />`;
    }

    case "file_dropzone": {
      ctx.lopesImports.add("FileDropzone");
      return `<FileDropzone${cidProp} title=${q(p.title)} description=${q(p.description)} accept=${q(p.accept, "image/*,.pdf")} compact={${asBool(p.compact, true)}} />`;
    }

    case "cascader_field": {
      ctx.lopesImports.add("CascaderField");
      const optionsJson = JSON.stringify(Array.isArray(p.options) ? p.options : [], null, 2);
      const defaultPathJson = JSON.stringify(Array.isArray(p.defaultValue) ? p.defaultValue : []);
      return [
        `<CascaderField${cidProp}`,
        `  label=${q(p.label)}`,
        `  placeholder=${q(p.placeholder)}`,
        `  defaultValue={${defaultPathJson}}`,
        `  expandTrigger=${q(p.expandTrigger, "hover")}`,
        `  searchable={${asBool(p.searchable, true)}}`,
        `  clearable={${asBool(p.clearable, true)}}`,
        `  size=${q(p.size, "md")}`,
        `  options={${indentBlock(optionsJson, 2).trimStart()}}`,
        `/>`,
      ].join("\n");
    }

    case "tree_select_field": {
      ctx.lopesImports.add("TreeSelectField");
      const treeJson = JSON.stringify(Array.isArray(p.treeData) ? p.treeData : [], null, 2);
      return [
        `<TreeSelectField${cidProp}`,
        `  label=${q(p.label)}`,
        `  placeholder=${q(p.placeholder)}`,
        `  defaultValue=${q(p.defaultValue)}`,
        `  searchable={${asBool(p.searchable, true)}}`,
        `  clearable={${asBool(p.clearable, true)}}`,
        `  treeDefaultExpandAll={${asBool(p.treeDefaultExpandAll, true)}}`,
        `  size=${q(p.size, "md")}`,
        `  treeData={${indentBlock(treeJson, 2).trimStart()}}`,
        `/>`,
      ].join("\n");
    }

    case "tags_input": {
      ctx.lopesImports.add("TagsInput");
      const tagsJson = JSON.stringify(Array.isArray(p.defaultValue) ? p.defaultValue : []);
      return `<TagsInput${cidProp} label=${q(p.label)} mode=${q(p.mode, "inline-add")} addButtonLabel=${q(p.addButtonLabel, "Nova Tag")} color=${q(p.color, "primary")} defaultValue={${tagsJson}} />`;
    }

    case "signature_pad": {
      ctx.lopesImports.add("SignaturePad");
      return `<SignaturePad${cidProp} signerName=${q(p.signerName)} signerDocument=${q(p.signerDocument)} placeholder=${q(p.placeholder)} height={${asNum(p.height, 140)}} showToolbar={${asBool(p.showToolbar, true)}} showBaseline={${asBool(p.showBaseline, true)}} />`;
    }

    case "code_editor": {
      ctx.lopesImports.add("CodeEditor");
      return `<CodeEditor${cidProp} title=${q(p.title)} language=${q(p.language, "json")} variant=${q(p.variant, "dark")} height={${Math.max(160, el.height - 64)}} showToolbar={${asBool(p.showToolbar, true)}} showLineNumbers={${asBool(p.showLineNumbers, true)}} defaultValue={${q(p.defaultValue)}} />`;
    }

    case "button": {
      ctx.lopesImports.add("Button");
      const iconSym = registerIcon(ctx, p.iconName);
      return `<Button${cidProp} variant=${q(p.variant, "primary")} size=${q(p.size, "md")} fullWidth={${asBool(p.fullWidth, true)}}${iconSym ? ` leftIcon={<${iconSym} size={15} />}` : ""}>${escJsxText(asStr(p.label, "Botão"))}</Button>`;
    }

    case "badge": {
      ctx.lopesImports.add("Badge");
      return `<Badge${cidProp} label=${q(p.label)} variant=${q(p.variant, "primary")} appearance=${q(p.appearance, "soft")} size=${q(p.size, "md")} dot={${asBool(p.dot, true)}} />`;
    }

    case "status_badge": {
      ctx.lopesImports.add("StatusBadge");
      return `<StatusBadge${cidProp} label=${q(p.label)} tone=${q(p.tone, "success")} size=${q(p.size, "md")} dot={${asBool(p.dot, true)}} pulse={${asBool(p.pulse, true)}} />`;
    }

    case "avatar": {
      ctx.lopesImports.add("Avatar");
      return [
        `<div className="flex items-center gap-3">`,
        `  <Avatar${cidProp} name=${q(p.name)} size=${q(p.size, "md")} shape=${q(p.shape, "circle")} status=${q(p.status, "online")} />`,
        `  <div>`,
        `    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${escJsxText(asStr(p.name))}</p>`,
        `    <p className="text-xs text-zinc-500 dark:text-zinc-400">${escJsxText(asStr(p.role))}</p>`,
        `  </div>`,
        `</div>`,
      ].join("\n");
    }

    case "barcode": {
      ctx.lopesImports.add("Barcode");
      const groupDigits = asNum(p.groupDigits, 0);
      return `<Barcode${cidProp} value=${q(p.value)} label=${q(p.label)} sublabel=${q(p.sublabel)} height={${asNum(p.height, 46)}}${groupDigits > 0 ? ` groupDigits={${groupDigits}}` : ""} showValue={${asBool(p.showValue, true)}} copyable={${asBool(p.copyable, true)}} />`;
    }

    case "qrcode": {
      ctx.lopesImports.add("QRCode");
      return `<QRCode${cidProp} value=${q(p.value)} title=${q(p.title)} caption=${q(p.caption)} size={${asNum(p.size, 152)}} moduleStyle=${q(p.moduleStyle, "rounded")} status=${q(p.status, "active")} errorLevel=${q(p.errorLevel, "M")} copyable={${asBool(p.copyable, true)}} downloadable={${asBool(p.downloadable, true)}} />`;
    }

    case "alert": {
      ctx.lopesImports.add("Alert");
      return `<Alert${cidProp} title=${q(p.title)} description=${q(p.description)} variant=${q(p.variant, "info")} accent=${q(p.accent, "left")} dismissible={${asBool(p.dismissible, false)}} />`;
    }

    case "callout": {
      ctx.lopesImports.add("Callout");
      return `<Callout${cidProp} variant=${q(p.variant, "tip")} title=${q(p.title)} collapsible={${asBool(p.collapsible, false)}}>${escJsxText(asStr(p.body))}</Callout>`;
    }

    case "empty_state": {
      ctx.lopesImports.add("EmptyState");
      return `<EmptyState${cidProp} preset=${q(p.preset, "search")} title=${q(p.title)} description=${q(p.description)} size=${q(p.size, "sm")} />`;
    }

    case "result": {
      ctx.lopesImports.add("Result");
      const primary = asStr(p.primaryAction);
      const secondary = asStr(p.secondaryAction);
      if (primary || secondary) ctx.lopesImports.add("Button");
      return [
        `<Result${cidProp}`,
        `  status=${q(p.status, "success")}`,
        `  title=${q(p.title)}`,
        `  subTitle=${q(p.subTitle)}`,
        `  size=${q(p.size, "sm")}`,
        `  bordered={${asBool(p.bordered, true)}}`,
        ...(primary || secondary
          ? [
              `  extra={`,
              `    <>`,
              ...(secondary ? [`      <Button size="sm" variant="outline">${escJsxText(secondary)}</Button>`] : []),
              ...(primary ? [`      <Button size="sm" variant="primary">${escJsxText(primary)}</Button>`] : []),
              `    </>`,
              `  }`,
            ]
          : []),
        `/>`,
      ].join("\n");
    }

    case "skeleton": {
      ctx.lopesImports.add("Skeleton");
      const preset = asStr(p.preset, "card");
      const animation = q(p.animation, "wave");
      const rows = asNum(p.rows, 3);
      if (preset === "table") {
        return `<Skeleton.Table rows={${rows}} columns={4} animation=${animation} />`;
      }
      if (preset === "paragraph") {
        return `<Skeleton active animation=${animation} avatar={${asBool(p.hasAvatar, true)}} paragraph={{ rows: ${rows} }} />`;
      }
      return `<Skeleton.Card hasAvatar={${asBool(p.hasAvatar, true)}} hasImage={${asBool(p.hasImage, false)}} lines={${rows}} animation=${animation} />`;
    }

    case "modal_trigger": {
      ctx.lopesImports.add("Button");
      ctx.lopesImports.add("Modal");
      const idx = ctx.stateVars.length + 1;
      const varName = `modalOpen${idx}`;
      const setterName = `setModalOpen${idx}`;
      ctx.stateVars.push({ varName, setterName, comment: el.name });
      ctx.overlayModalsJsx.push(
        [
          `<Modal`,
          `  open={${varName}}`,
          `  onClose={() => ${setterName}(false)}`,
          `  title=${q(p.modalTitle)}`,
          `  description=${q(p.modalDescription)}`,
          `  size=${q(p.size, "md")}`,
          `  footer={`,
          `    <div className="flex justify-end gap-2">`,
          `      <Button variant="outline" size="sm" onClick={() => ${setterName}(false)}>Fechar</Button>`,
          `      <Button variant="primary" size="sm" onClick={() => ${setterName}(false)}>${escJsxText(asStr(p.confirmLabel, "Confirmar"))}</Button>`,
          `    </div>`,
          `  }`,
          `>`,
          `  <p className="text-sm text-zinc-700 dark:text-zinc-300">${escJsxText(asStr(p.modalBody))}</p>`,
          `</Modal>`,
        ].join("\n"),
      );
      return `<Button${cidProp} variant="primary" fullWidth onClick={() => ${setterName}(true)}>${escJsxText(asStr(p.triggerLabel, "Abrir Modal"))}</Button>`;
    }

    case "drawer_trigger": {
      ctx.lopesImports.add("Button");
      ctx.lopesImports.add("Drawer");
      const idx = ctx.stateVars.length + 1;
      const varName = `drawerOpen${idx}`;
      const setterName = `setDrawerOpen${idx}`;
      ctx.stateVars.push({ varName, setterName, comment: el.name });
      ctx.overlayModalsJsx.push(
        [
          `<Drawer`,
          `  open={${varName}}`,
          `  onClose={() => ${setterName}(false)}`,
          `  title=${q(p.drawerTitle)}`,
          `  description=${q(p.drawerDescription)}`,
          `  side=${q(p.side, "right")}`,
          `  size=${q(p.size, "md")}`,
          `>`,
          `  <p className="text-sm text-zinc-700 dark:text-zinc-300">${escJsxText(asStr(p.drawerBody))}</p>`,
          `</Drawer>`,
        ].join("\n"),
      );
      return `<Button${cidProp} variant="outline" fullWidth onClick={() => ${setterName}(true)}>${escJsxText(asStr(p.triggerLabel, "Abrir Drawer"))}</Button>`;
    }

    case "confirm_dialog_trigger": {
      ctx.lopesImports.add("Button");
      ctx.lopesImports.add("ConfirmDialog");
      const idx = ctx.stateVars.length + 1;
      const varName = `confirmOpen${idx}`;
      const setterName = `setConfirmOpen${idx}`;
      ctx.stateVars.push({ varName, setterName, comment: el.name });
      ctx.overlayModalsJsx.push(
        [
          `<ConfirmDialog`,
          `  open={${varName}}`,
          `  onClose={() => ${setterName}(false)}`,
          `  onConfirm={() => ${setterName}(false)}`,
          `  title=${q(p.dialogTitle)}`,
          `  description=${q(p.dialogDescription)}`,
          `  variant=${q(p.variant, "danger")}`,
          `  confirmLabel=${q(p.confirmLabel, "Confirmar")}`,
          `  cancelLabel=${q(p.cancelLabel, "Cancelar")}`,
          `/>`,
        ].join("\n"),
      );
      return `<Button${cidProp} variant="destructive" fullWidth onClick={() => ${setterName}(true)}>${escJsxText(asStr(p.triggerLabel, "Confirmar Ação"))}</Button>`;
    }

    default:
      return `<div />`;
  }
}

function buildResponsiveRowsJsx(
  items: UICanvasElement[],
  referenceWidth: number,
  ctx: GenContext,
  childrenMap?: Map<string, UICanvasElement[]>,
): string {
  if (items.length === 0) return "";
  const sortedByY = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: UICanvasElement[][] = [];

  for (const el of sortedByY) {
    const lastRow = rows[rows.length - 1];
    if (!lastRow) {
      rows.push([el]);
      continue;
    }
    const rowTop = Math.min(...lastRow.map((r) => r.y));
    const rowMid = rowTop + Math.min(...lastRow.map((r) => r.height)) * 0.45;
    if (Math.abs(el.y - rowTop) <= 28 || el.y < rowMid) {
      lastRow.push(el);
    } else {
      rows.push([el]);
    }
  }

  const rowBlocks: string[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    if (row.length === 1 && row[0].width >= referenceWidth * 0.85) {
      const el = row[0];
      const nested = childrenMap?.get(el.id);
      const nestedJsx =
        nested && nested.length > 0
          ? buildResponsiveRowsJsx(nested, Math.max(240, el.width - 40), ctx)
          : undefined;
      rowBlocks.push(renderElementJsx(el, ctx, nestedJsx));
      continue;
    }

    const colBlocks = row.map((el) => {
      const rawSpan = Math.round((el.width / Math.max(240, referenceWidth)) * 12);
      const span = Math.max(2, Math.min(12, rawSpan));
      const nested = childrenMap?.get(el.id);
      const nestedJsx =
        nested && nested.length > 0
          ? buildResponsiveRowsJsx(nested, Math.max(240, el.width - 40), ctx)
          : undefined;
      return [
        `<div className="${SPAN_CLASS_MAP[span] || "col-span-12"}">`,
        indentBlock(renderElementJsx(el, ctx, nestedJsx), 2),
        `</div>`,
      ].join("\n");
    });

    rowBlocks.push(
      [
        `<div className="grid grid-cols-12 gap-4 items-stretch">`,
        indentBlock(colBlocks.join("\n"), 2),
        `</div>`,
      ].join("\n"),
    );
  }

  return rowBlocks.join("\n\n");
}

export function generateTsxCode(
  config: UICanvasConfig,
  exportMode: UICodeExportMode = "responsive",
): string {
  const visibleElements = config.elements.filter((el) => !el.hidden);
  const componentName = sanitizeIdentifier(config.exportName, "LopesScreenPage");

  const ctx: GenContext = {
    lopesImports: new Set<string>(),
    lucideImports: new Set<string>(),
    stateVars: [],
    overlayModalsJsx: [],
  };

  let bodyJsx = "";

  if (visibleElements.length === 0) {
    bodyJsx = `      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center text-sm text-zinc-500">\n        Adicione componentes ao Canvas 2D para gerar o código TSX automaticamente.\n      </div>`;
  } else if (exportMode === "canvas2d") {
    const absBlocks = visibleElements.map((el, idx) => {
      const jsx = renderElementJsx(el, ctx);
      return [
        `<div`,
        `  style={{ left: ${el.x}, top: ${el.y}, width: ${el.width}, height: ${el.height}, zIndex: ${idx + 1} }}`,
        `  className="absolute"`,
        `>`,
        indentBlock(jsx, 2),
        `</div>`,
      ].join("\n");
    });

    const maxBottom = Math.max(
      config.height,
      ...visibleElements.map((e) => e.y + e.height + config.marginBottom),
    );

    bodyJsx = [
      `      <div`,
      `        style={{ width: ${config.width}, minHeight: ${maxBottom} }}`,
      `        className="relative mx-auto rounded-2xl bg-slate-50 dark:bg-zinc-950 overflow-x-auto"`,
      `      >`,
      indentBlock(absBlocks.join("\n"), 8),
      `      </div>`,
    ].join("\n");
  } else {
    // Auto-Responsive Flow/Grid Mode: detect container_panel enclosures first
    const panels = visibleElements.filter((el) => el.type === "container_panel");
    const childrenMap = new Map<string, UICanvasElement[]>();
    const claimedIds = new Set<string>();

    for (const panel of panels) {
      const enclosed = visibleElements.filter((candidate) => {
        if (candidate.id === panel.id || candidate.type === "container_panel") return false;
        const cx = candidate.x + candidate.width / 2;
        const cy = candidate.y + candidate.height / 2;
        return (
          cx >= panel.x &&
          cx <= panel.x + panel.width &&
          cy >= panel.y &&
          cy <= panel.y + panel.height
        );
      });
      if (enclosed.length > 0) {
        childrenMap.set(panel.id, enclosed);
        enclosed.forEach((c) => claimedIds.add(c.id));
      }
    }

    const topLevel = visibleElements.filter((el) => !claimedIds.has(el.id));
    const usableW = Math.max(320, config.width - config.marginLeft - config.marginRight);
    const flowJsx = buildResponsiveRowsJsx(topLevel, usableW, ctx, childrenMap);

    bodyJsx = [
      `      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">`,
      indentBlock(flowJsx, 8),
      `      </div>`,
    ].join("\n");
  }

  const reactImports = ctx.stateVars.length > 0 ? `import React, { useState } from "react";` : `import React from "react";`;
  const sortedLopes = Array.from(ctx.lopesImports).sort();
  const sortedLucide = Array.from(ctx.lucideImports).sort();

  const headerLines: string[] = [
    `"use client";`,
    ``,
    `// Tela gerada pelo Lopes UI Studio 2D`,
    `// Rota sugerida: ${config.route}`,
    reactImports,
  ];

  if (sortedLucide.length > 0) {
    headerLines.push(`import { ${sortedLucide.join(", ")} } from "lucide-react";`);
  }
  if (sortedLopes.length > 0) {
    headerLines.push(
      sortedLopes.length > 4
        ? `import {\n  ${sortedLopes.join(",\n  ")},\n} from "lopes-ui";`
        : `import { ${sortedLopes.join(", ")} } from "lopes-ui";`,
    );
  }

  const stateLines = ctx.stateVars.map(
    (sv) => `  const [${sv.varName}, ${sv.setterName}] = useState(false); // ${sv.comment}`,
  );

  const overlaysBlock =
    ctx.overlayModalsJsx.length > 0
      ? `\n${indentBlock(ctx.overlayModalsJsx.join("\n\n"), 6)}`
      : "";

  return [
    ...headerLines,
    ``,
    `export default function ${componentName}() {`,
    ...(stateLines.length > 0 ? [...stateLines, ``] : []),
    `  return (`,
    `    <main className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">`,
    bodyJsx,
    ...(overlaysBlock ? [overlaysBlock] : []),
    `    </main>`,
    `  );`,
    `}`,
    ``,
  ].join("\n");
}
