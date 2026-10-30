"use client";

import React, { useState } from "react";
import Accordion, { type AccordionItem, type AccordionVariant } from "@/components/Accordion";
import ActivityFeed, { type ActivityEvent, type ActivityEventColor } from "@/components/ActivityFeed";
import Alert, { type AlertAccent, type AlertVariant } from "@/components/Alert";
import Avatar, { type AvatarShape, type AvatarSize, type AvatarStatus } from "@/components/Avatar";
import Badge, { type BadgeAppearance, type BadgeSize, type BadgeVariant } from "@/components/Badge";
import Barcode from "@/components/Barcode";
import Breadcrumb, { type BreadcrumbItem, type BreadcrumbSeparator } from "@/components/Breadcrumb";
import Button, { type ButtonProps } from "@/components/Button";
import Calendar from "@/components/Calendar";
import Callout, { type CalloutVariant } from "@/components/Callout";
import Card, {
  CardBody,
  CardFooter,
  CardHeader,
  type CardColor,
  type CardRadius,
  type CardShadow,
  type CardVariant,
} from "@/components/Card";
import Chart, { type ChartColor, type ChartDataPoint, type ChartSeries } from "@/components/Chart";
import CodeEditor, {
  type CodeEditorLanguage,
  type CodeEditorVariant,
} from "@/components/CodeEditor";
import ConfirmDialog, { type ConfirmDialogVariant } from "@/components/ConfirmDialog";
import DescriptionList, { type DescriptionItem } from "@/components/DescriptionList";
import Drawer, { type DrawerSide, type DrawerSize } from "@/components/Drawer";
import EmptyState, { type EmptyStatePreset } from "@/components/EmptyState";
import FileDropzone from "@/components/FileDropzone";
import FilterBar, { type FilterChip } from "@/components/FilterBar";
import CascaderField, { type CascaderOption } from "@/components/form/CascaderField";
import Checkbox from "@/components/form/Checkbox";
import DatePickerField from "@/components/form/DatePickerField";
import NumberField from "@/components/form/NumberField";
import RatingField, { type RatingSize, type RatingTone } from "@/components/form/RatingField";
import SelectField, { type SelectOption } from "@/components/form/SelectField";
import SliderField from "@/components/form/SliderField";
import Switch, { type SwitchProps } from "@/components/form/Switch";
import TagsInput, { type TagColor } from "@/components/form/TagsInput";
import TextareaField from "@/components/form/TextareaField";
import TextField, { type TextFieldMask, type TextFieldVariant } from "@/components/form/TextField";
import TreeSelectField, { type TreeSelectNode } from "@/components/form/TreeSelectField";
import KanbanBoard, { type KanbanColumn } from "@/components/KanbanBoard";
import Modal, { type ModalProps } from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import PriceInput from "@/components/PriceInput";
import Progress, { type ProgressSize, type ProgressTone } from "@/components/Progress";
import QRCode, {
  type QRCodeErrorLevel,
  type QRCodeModuleStyle,
  type QRCodeStatus,
} from "@/components/QRCode";
import Result, { type ResultStatus } from "@/components/Result";
import SegmentedControl, {
  type SegmentedControlItem,
  type SegmentedControlSize,
  type SegmentedControlVariant,
} from "@/components/SegmentedControl";
import Separator from "@/components/Separator";
import ServiceStatusCard, { type ServiceStatus } from "@/components/ServiceStatusCard";
import SignaturePad from "@/components/SignaturePad";
import Skeleton, { type SkeletonAnimation } from "@/components/Skeleton";
import StatCard, { type StatCardColor } from "@/components/StatCard";
import StatusBadge, { type StatusBadgeSize, type StatusTone } from "@/components/StatusBadge";
import Stepper, {
  type StepItem,
  type StepperOrientation,
  type StepperSize,
  type StepperVariant,
} from "@/components/Stepper";
import Table, { type TableColumn, type TableSize, type TableVariant } from "@/components/Table";
import Tabs, { type TabsItem, type TabsSize, type TabsVariant } from "@/components/Tabs";
import Timeline, { type ConnectorStyle, type TimelineColor, type TimelineItem, type TimelineSize } from "@/components/Timeline";
import toast from "@/components/Toast";
import TransferList, { type TransferListItem } from "@/components/TransferList";
import TreeView, { type TreeNode } from "@/components/TreeView";
import { cn } from "@/utils/cn";
import { resolveIcon } from "./catalog-and-defaults";
import type { UICanvasElement, UIElementStyle } from "./types";

function asStr(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return fallback;
}

function asNum(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBool(val: unknown, fallback = false): boolean {
  if (typeof val === "boolean") return val;
  return fallback;
}

const SHADOW_MAP: Record<NonNullable<UIElementStyle["shadow"]>, string> = {
  none: "",
  xs: "shadow-2xs",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

export function getEditablePrimaryPropKey(type: UICanvasElement["type"]): string | null {
  switch (type) {
    case "typography":
      return "text";
    case "button":
    case "badge":
    case "status_badge":
    case "progress":
    case "text_field":
    case "textarea_field":
    case "number_field":
    case "price_input":
    case "select_field":
    case "cascader_field":
    case "tree_select_field":
    case "tags_input":
    case "date_picker_field":
    case "switch_field":
    case "checkbox_field":
    case "slider_field":
    case "rating_field":
    case "barcode":
    case "separator":
      return "label";
    case "page_header":
    case "card":
    case "container_panel":
    case "stat_card":
    case "chart":
    case "description_list":
    case "activity_feed":
    case "file_dropzone":
    case "code_editor":
    case "qrcode":
    case "alert":
    case "callout":
    case "empty_state":
    case "result":
      return "title";
    case "signature_pad":
      return "signerName";
    case "service_status_card":
    case "avatar":
      return "name";
    case "modal_trigger":
    case "drawer_trigger":
    case "confirm_dialog_trigger":
      return "triggerLabel";
    default:
      return null;
  }
}

export interface ElementRendererProps {
  element: UICanvasElement;
  interactive?: boolean;
  isInlineEditing?: boolean;
  onCommitInlineText?: (nextValue: string) => void;
  onCancelInlineEdit?: () => void;
}

function resolveStatusToneFromText(text: string): StatusTone {
  const lower = text.toLowerCase();
  if (
    lower.includes("entregue") ||
    lower.includes("autorizada") ||
    lower.includes("conclu") ||
    lower.includes("aprovad") ||
    lower.includes("ativo")
  ) {
    return "success";
  }
  if (lower.includes("rota") || lower.includes("agendad") || lower.includes("separ")) {
    return "info";
  }
  if (lower.includes("pendente") || lower.includes("aguard")) {
    return "warning";
  }
  if (lower.includes("cancel") || lower.includes("erro") || lower.includes("atras")) {
    return "danger";
  }
  return "primary";
}

export default function ElementRenderer({
  element,
  interactive = false,
  isInlineEditing = false,
  onCommitInlineText,
  onCancelInlineEdit,
}: ElementRendererProps) {
  const p = element.props;
  const st = element.style;

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [stepperIdx, setStepperIdx] = useState<number | null>(null);
  const [removedFilterIds, setRemovedFilterIds] = useState<string[]>([]);
  const [transferState, setTransferState] = useState<{
    source: TransferListItem[];
    target: TransferListItem[];
  } | null>(null);

  const primaryKey = getEditablePrimaryPropKey(element.type);
  const currentPrimaryText = primaryKey ? asStr(p[primaryKey], element.name) : "";

  const wrapperInlineStyle: React.CSSProperties = {};
  if (st?.background && st.background !== "transparent") {
    wrapperInlineStyle.backgroundColor = st.background;
  }
  if (st?.borderWidth && st.borderStyle && st.borderStyle !== "none") {
    wrapperInlineStyle.borderWidth = `${st.borderWidth}px`;
    wrapperInlineStyle.borderStyle = st.borderStyle;
    wrapperInlineStyle.borderColor = st.borderColor || "#e4e4e7";
  }
  if (st?.borderRadius !== undefined) {
    wrapperInlineStyle.borderRadius = `${st.borderRadius}px`;
  }
  if (st?.padding !== undefined) {
    wrapperInlineStyle.padding = `${st.padding}px`;
  }
  if (st?.opacity !== undefined && st.opacity < 100) {
    wrapperInlineStyle.opacity = Math.max(0.1, Math.min(1, st.opacity / 100));
  }

  const renderComponent = (): React.ReactNode => {
    switch (element.type) {
      // ── 1. Estrutura & Superfícies ─────────────────────────────────────────
      case "container_panel": {
        const tone = asStr(p.tone, "surface");
        const dashed = asBool(p.dashed, false);
        const showHeader = asBool(p.showHeader, true);
        const title = asStr(p.title);
        const subtitle = asStr(p.subtitle);
        const toneClasses =
          tone === "muted"
            ? "bg-zinc-100/90 dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800"
            : tone === "brand"
              ? "bg-indigo-50/50 dark:bg-indigo-950/25 border-indigo-200/80 dark:border-indigo-900/60"
              : tone === "transparent"
                ? "bg-transparent border-zinc-300/70 dark:border-zinc-700/70"
                : "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 shadow-2xs";

        return (
          <div
            data-component-id={element.componentId}
            className={cn(
              "h-full w-full rounded-xl border flex flex-col overflow-hidden",
              dashed && "border-dashed",
              toneClasses,
            )}
          >
            {showHeader && (title || subtitle) && (
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
                {title && (
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0" />
          </div>
        );
      }

      case "card": {
        const IconComp = resolveIcon(p.iconName);
        const badgeText = asStr(p.badgeText);
        const showFooter = asBool(p.showFooter, true);
        const footerPrimary = asStr(p.footerPrimary);
        const footerSecondary = asStr(p.footerSecondary);

        return (
          <Card
            componentId={element.componentId}
            variant={asStr(p.variant, "default") as CardVariant}
            color={asStr(p.color, "primary") as CardColor}
            shadow={asStr(p.shadow, "sm") as CardShadow}
            radius={asStr(p.radius, "xl") as CardRadius}
            accent={asBool(p.accent, true)}
            className="h-full w-full justify-between"
          >
            <div>
              <CardHeader
                title={asStr(p.title, "Título do Card")}
                description={asStr(p.description)}
                icon={p.iconName ? IconComp : undefined}
                iconColor={asStr(p.color, "primary") as CardColor}
                action={
                  badgeText ? (
                    <Badge label={badgeText} variant="primary" size="sm" />
                  ) : undefined
                }
              />
              {asStr(p.body) && (
                <CardBody className="pt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {asStr(p.body)}
                </CardBody>
              )}
            </div>
            {showFooter && (footerPrimary || footerSecondary) && (
              <CardFooter align="right" divider className="mt-auto">
                {footerSecondary && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => interactive && toast.info(`Ação: ${footerSecondary}`)}
                  >
                    {footerSecondary}
                  </Button>
                )}
                {footerPrimary && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => interactive && toast.success(`Ação: ${footerPrimary}`)}
                  >
                    {footerPrimary}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        );
      }

      case "typography": {
        const level = asStr(p.level, "h2");
        const align = asStr(p.align, "left");
        const weight = asStr(p.weight, "bold");
        const tone = asStr(p.tone, "default");
        const text = asStr(p.text, "Título de Seção");
        const subtext = asStr(p.subtext);

        const sizeCls =
          level === "h1"
            ? "text-2xl tracking-tight"
            : level === "h2"
              ? "text-lg tracking-tight"
              : level === "h3"
                ? "text-base"
                : level === "eyebrow"
                  ? "text-[11px] uppercase tracking-widest"
                  : "text-sm";
        const weightCls =
          weight === "extrabold"
            ? "font-extrabold"
            : weight === "bold"
              ? "font-bold"
              : weight === "semibold"
                ? "font-semibold"
                : weight === "medium"
                  ? "font-medium"
                  : "font-normal";
        const toneCls =
          tone === "primary"
            ? "text-indigo-600 dark:text-indigo-400"
            : tone === "muted"
              ? "text-zinc-500 dark:text-zinc-400"
              : tone === "emerald"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-900 dark:text-zinc-100";
        const alignCls =
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

        return (
          <div
            data-component-id={element.componentId}
            className={cn("h-full w-full flex flex-col justify-center", alignCls)}
          >
            <div className={cn("leading-snug", sizeCls, weightCls, toneCls)}>{text}</div>
            {subtext && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
                {subtext}
              </p>
            )}
          </div>
        );
      }

      case "separator": {
        const orientation = asStr(p.orientation, "horizontal") as "horizontal" | "vertical";
        return (
          <div
            data-component-id={element.componentId}
            className={cn(
              "h-full w-full flex items-center",
              orientation === "vertical" ? "justify-center" : "",
            )}
          >
            <Separator
              orientation={orientation}
              label={asStr(p.label) || undefined}
              labelAlign={asStr(p.labelAlign, "center") as "start" | "center" | "end"}
            />
          </div>
        );
      }

      // ── 2. Navegação ───────────────────────────────────────────────────────
      case "page_header": {
        const IconComp = resolveIcon(p.iconName);
        const badgeText = asStr(p.badgeText);
        const primaryAction = asStr(p.primaryAction);
        const secondaryAction = asStr(p.secondaryAction);

        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-5 flex items-center shadow-2xs">
            <PageHeader
              componentId={element.componentId}
              noPadding
              className="w-full py-0"
              title={asStr(p.title, "Título da Página")}
              description={asStr(p.description) || undefined}
              icon={p.iconName ? IconComp : undefined}
              variant={asStr(p.variant, "default") as "default" | "muted" | "bordered"}
              badge={
                badgeText ? (
                  <StatusBadge label={badgeText} tone="success" size="xs" dot pulse />
                ) : undefined
              }
              actions={
                primaryAction || secondaryAction ? (
                  <div className="flex items-center gap-2">
                    {secondaryAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => interactive && toast.info(secondaryAction)}
                      >
                        {secondaryAction}
                      </Button>
                    )}
                    {primaryAction && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => interactive && toast.success(primaryAction)}
                      >
                        {primaryAction}
                      </Button>
                    )}
                  </div>
                ) : undefined
              }
            />
          </div>
        );
      }

      case "breadcrumb": {
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const items: BreadcrumbItem[] = rawItems.map((it) => {
          const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
          return {
            label: asStr(obj.label, "Item"),
            href: interactive ? asStr(obj.href) || undefined : undefined,
          };
        });
        return (
          <div className="h-full w-full flex items-center">
            <Breadcrumb
              componentId={element.componentId}
              items={items.length > 0 ? items : [{ label: "Lopes UI" }, { label: "Tela Atual" }]}
              separator={asStr(p.separator, "chevron") as BreadcrumbSeparator}
              homeIcon={asBool(p.homeIcon, true)}
            />
          </div>
        );
      }

      case "tabs": {
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const showContent = asBool(p.showPanelContent, true);
        const items: TabsItem[] = rawItems.map((it, idx) => {
          const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
          const val = asStr(obj.value, `tab_${idx + 1}`);
          const contentText = asStr(obj.content);
          return {
            value: val,
            label: asStr(obj.label, `Aba ${idx + 1}`),
            badge: asStr(obj.badge) || undefined,
            content:
              showContent && contentText ? (
                <div className="mt-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {contentText}
                </div>
              ) : undefined,
          };
        });
        return (
          <div data-component-id={element.componentId} className="h-full w-full overflow-hidden">
            <Tabs
              items={items}
              defaultValue={items[0]?.value}
              variant={asStr(p.variant, "pills") as TabsVariant}
              size={asStr(p.size, "md") as TabsSize}
              fullWidth={asBool(p.fullWidth, false)}
            />
          </div>
        );
      }

      case "segmented_control": {
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const data: SegmentedControlItem[] = rawItems.map((it, idx) => {
          const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
          return {
            value: asStr(obj.value, `opt_${idx + 1}`),
            label: asStr(obj.label, `Opção ${idx + 1}`),
          };
        });
        return (
          <div className="h-full w-full flex items-center">
            <SegmentedControl
              componentId={element.componentId}
              data={data.length > 0 ? data : ["Rondônia (69)", "Amazonas (92)"]}
              defaultValue={asStr(p.defaultValue) || data[0]?.value}
              size={asStr(p.size, "sm") as SegmentedControlSize}
              variant={asStr(p.variant, "default") as SegmentedControlVariant}
              radius={asStr(p.radius, "lg") as "md" | "lg" | "full"}
              fullWidth={asBool(p.fullWidth, true)}
            />
          </div>
        );
      }

      case "stepper": {
        const rawSteps = Array.isArray(p.steps) ? p.steps : [];
        const steps: StepItem[] = rawSteps.map((stItem, idx) => {
          const obj = (stItem && typeof stItem === "object" ? stItem : {}) as Record<string, unknown>;
          return {
            title: asStr(obj.title, `Etapa ${idx + 1}`),
            description: asStr(obj.description) || undefined,
          };
        });
        const activeStep = stepperIdx ?? asNum(p.activeStep, 1);
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 flex items-center shadow-2xs overflow-hidden">
            <Stepper
              componentId={element.componentId}
              steps={steps}
              activeStep={activeStep}
              onStepClick={interactive ? (idx) => setStepperIdx(idx) : undefined}
              clickable={interactive && asBool(p.clickable, true)}
              orientation={asStr(p.orientation, "horizontal") as StepperOrientation}
              variant={asStr(p.variant, "default") as StepperVariant}
              size={asStr(p.size, "sm") as StepperSize}
              className="w-full"
            />
          </div>
        );
      }

      // ── 3. KPIs & Gráficos ─────────────────────────────────────────────────
      case "stat_card": {
        const IconComp = resolveIcon(p.iconName);
        const showSpark = asBool(p.showSparkline, true);
        const rawSpark = Array.isArray(p.sparkValues) ? p.sparkValues : [50, 62, 58, 71, 79, 86];
        const spark = showSpark
          ? rawSpark.map((v) => ({ value: asNum(v, 50) }))
          : undefined;
        const progress = p.progress !== undefined && p.progress !== "" ? asNum(p.progress) : undefined;

        return (
          <StatCard
            componentId={element.componentId}
            title={asStr(p.title, "Indicador")}
            value={asStr(p.value, "R$ 0")}
            unit={asStr(p.unit) || undefined}
            color={asStr(p.color, "indigo") as StatCardColor}
            icon={IconComp}
            trend={
              p.trendValue !== undefined
                ? {
                    value: asNum(p.trendValue, 0),
                    label: asStr(p.trendLabel) || undefined,
                    inverted: asBool(p.trendInverted, false),
                  }
                : undefined
            }
            spark={spark}
            progress={progress}
            progressLabel={asStr(p.progressLabel) || undefined}
            className="h-full w-full"
          />
        );
      }

      case "chart": {
        const rawSeries = Array.isArray(p.series) ? p.series : [];
        const series: ChartSeries[] = rawSeries.map((s, idx) => {
          const obj = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
          return {
            key: asStr(obj.key, `s${idx + 1}`),
            label: asStr(obj.label, `Série ${idx + 1}`),
            color: asStr(obj.color, "indigo") as ChartColor,
          };
        });
        const rawData = Array.isArray(p.data) ? p.data : [];
        const data: ChartDataPoint[] = rawData.map((d, idx) => {
          const obj = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;
          const point: ChartDataPoint = { label: asStr(obj.label, `Item ${idx + 1}`) };
          for (const [k, v] of Object.entries(obj)) {
            if (k !== "label" && (typeof v === "number" || typeof v === "string")) {
              point[k] = typeof v === "number" ? v : asNum(v, 0);
            }
          }
          return point;
        });

        const chartInnerHeight = Math.max(120, element.height - 108);

        return (
          <Chart
            componentId={element.componentId}
            type={asStr(p.type, "bar") as "bar" | "area" | "line" | "donut"}
            title={asStr(p.title) || undefined}
            subtitle={asStr(p.subtitle) || undefined}
            series={series}
            data={data}
            height={chartInnerHeight}
            showLegend={asBool(p.showLegend, true)}
            showGrid={asBool(p.showGrid, true)}
            stacked={asBool(p.stacked, false)}
            bordered={asBool(p.bordered, true)}
            centerLabel={asStr(p.centerLabel) || undefined}
            centerSublabel={asStr(p.centerSublabel) || undefined}
            className="h-full w-full"
          />
        );
      }

      case "progress": {
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-4 py-3 flex items-center shadow-2xs">
            <Progress
              label={asStr(p.label) || undefined}
              value={asNum(p.value, 75)}
              max={asNum(p.max, 100)}
              variant={asStr(p.variant, "linear") as "linear" | "circular"}
              tone={asStr(p.tone, "primary") as ProgressTone}
              size={asStr(p.size, "md") as ProgressSize}
              showValue={asBool(p.showValue, true)}
              striped={asBool(p.striped, false)}
              className="w-full"
            />
          </div>
        );
      }

      case "service_status_card": {
        const IconComp = resolveIcon(p.iconName);
        return (
          <ServiceStatusCard
            componentId={element.componentId}
            name={asStr(p.name, "Serviço Fiscal SEFAZ RO/AM")}
            description={asStr(p.description) || undefined}
            status={asStr(p.status, "operational") as ServiceStatus}
            latencyMs={asNum(p.latencyMs, 62)}
            uptimePct={asNum(p.uptimePct, 99.95)}
            icon={IconComp}
            onRefresh={
              interactive
                ? () => {
                    toast.success("Telemetria SEFAZ RO/AM atualizada!");
                  }
                : undefined
            }
            className="h-full w-full"
          />
        );
      }

      // ── 4. Tabelas & Listas ────────────────────────────────────────────────
      case "table": {
        const rawCols = Array.isArray(p.columns) ? p.columns : [];
        const columns: TableColumn<Record<string, unknown>>[] = rawCols.map((c, idx) => {
          const obj = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
          const key = asStr(obj.key, `col_${idx + 1}`);
          const isStatusCol = key.toLowerCase().includes("status");
          return {
            key,
            label: asStr(obj.label, key),
            align: asStr(obj.align, "left") as "left" | "center" | "right",
            sortable: asBool(obj.sortable, true),
            render: isStatusCol
              ? (val) => {
                  const text = asStr(val, "Ativo");
                  return (
                    <StatusBadge
                      label={text}
                      tone={resolveStatusToneFromText(text)}
                      size="xs"
                      dot
                    />
                  );
                }
              : undefined,
          };
        });
        const rawRows = Array.isArray(p.rows) ? p.rows : [];
        const rows = rawRows.filter(
          (r): r is Record<string, unknown> => Boolean(r && typeof r === "object"),
        );

        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-auto shadow-2xs">
            <Table
              componentId={element.componentId}
              columns={columns}
              rows={rows}
              variant={asStr(p.variant, "default") as TableVariant}
              size={asStr(p.size, "sm") as TableSize}
              zebra={asBool(p.zebra, true)}
              hoverable={asBool(p.hoverable, true)}
              stickyHeader={asBool(p.stickyHeader, true)}
              onRowClick={
                interactive
                  ? (row) => toast.info(`Registro selecionado: ${asStr(Object.values(row)[0])}`)
                  : undefined
              }
            />
          </div>
        );
      }

      case "filter_bar": {
        const rawFilters = Array.isArray(p.filters) ? p.filters : [];
        const allChips: FilterChip[] = rawFilters.map((f, idx) => {
          const obj = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
          return {
            id: asStr(obj.id, `flt_${idx + 1}`),
            label: asStr(obj.label, "Filtro"),
            value: asStr(obj.value) || undefined,
          };
        });
        const visibleChips = interactive
          ? allChips.filter((c) => !removedFilterIds.includes(c.id))
          : allChips;

        if (interactive && visibleChips.length === 0 && allChips.length > 0) {
          return (
            <div className="h-full w-full flex items-center">
              <Button size="sm" variant="outline" onClick={() => setRemovedFilterIds([])}>
                Restaurar filtros padrão ({allChips.length})
              </Button>
            </div>
          );
        }

        return (
          <div className="h-full w-full flex items-center overflow-hidden">
            <FilterBar
              filters={visibleChips}
              clearAllLabel={asStr(p.clearAllLabel, "Limpar tudo")}
              onRemove={
                interactive
                  ? (id) => setRemovedFilterIds((prev) => [...prev, id])
                  : () => undefined
              }
              onClearAll={
                interactive
                  ? () => setRemovedFilterIds(allChips.map((c) => c.id))
                  : () => undefined
              }
            />
          </div>
        );
      }

      case "description_list": {
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const items: DescriptionItem[] = rawItems.map((it, idx) => {
          const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
          return {
            key: `dl_${idx}`,
            label: asStr(obj.label, "Campo"),
            value: asStr(obj.value, "-"),
            copyValue: interactive ? asStr(obj.copyValue) || undefined : undefined,
          };
        });
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 overflow-auto shadow-2xs">
            <DescriptionList
              componentId={element.componentId}
              title={asStr(p.title) || undefined}
              subtitle={asStr(p.subtitle) || undefined}
              layout={asStr(p.layout, "grid") as "horizontal" | "grid" | "stacked" | "table"}
              columns={(asNum(p.columns, 2) as 2 | 3 | 4) || 2}
              bordered={asBool(p.bordered, true)}
              striped={asBool(p.striped, true)}
              size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
              items={items}
            />
          </div>
        );
      }

      case "kanban_board": {
        const rawCols = Array.isArray(p.columns) ? p.columns : [];
        const columns = rawCols as KanbanColumn[];
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 overflow-auto shadow-2xs">
            <KanbanBoard columns={columns} />
          </div>
        );
      }

      case "timeline": {
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const items: TimelineItem[] = rawItems.map((it, idx) => {
          const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
          return {
            id: `tl_${idx}`,
            title: asStr(obj.title, `Evento ${idx + 1}`),
            description: asStr(obj.description) || undefined,
            date: asStr(obj.date) || undefined,
            color: asStr(obj.color, "primary") as TimelineColor,
            badge: asStr(obj.badge) || undefined,
          };
        });
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 overflow-auto shadow-2xs">
            <Timeline
              componentId={element.componentId}
              items={items}
              size={asStr(p.size, "sm") as TimelineSize}
              connectorStyle={asStr(p.connectorStyle, "solid") as ConnectorStyle}
            />
          </div>
        );
      }

      case "activity_feed": {
        const rawEvents = Array.isArray(p.events) ? p.events : [];
        const events: ActivityEvent[] = rawEvents.map((ev, idx) => {
          const obj = (ev && typeof ev === "object" ? ev : {}) as Record<string, unknown>;
          return {
            id: asStr(obj.id, `ev_${idx}`),
            title: asStr(obj.title, "Atividade"),
            description: asStr(obj.description) || undefined,
            color: asStr(obj.color, "indigo") as ActivityEventColor,
            actor: asStr(obj.actorName)
              ? {
                  name: asStr(obj.actorName),
                  initials: asStr(obj.actorInitials) || undefined,
                }
              : undefined,
            timestamp: asStr(obj.timestamp, "Agora"),
          };
        });
        const feedTitle = asStr(p.title);
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 flex flex-col overflow-hidden shadow-2xs">
            {feedTitle && (
              <div className="pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {feedTitle}
                </h4>
                <StatusBadge label="Ao Vivo" tone="success" size="xs" dot pulse />
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-auto">
              <ActivityFeed componentId={element.componentId} events={events} />
            </div>
          </div>
        );
      }

      case "accordion": {
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const items: AccordionItem[] = rawItems.map((it, idx) => {
          const obj = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
          return {
            id: asStr(obj.id, `ac_${idx}`),
            title: asStr(obj.title, `Seção ${idx + 1}`),
            badge: asStr(obj.badge) || undefined,
            defaultOpen: asBool(obj.defaultOpen, idx === 0),
            content: asStr(obj.content, ""),
          };
        });
        return (
          <div className="h-full w-full overflow-auto">
            <Accordion
              componentId={element.componentId}
              items={items}
              variant={asStr(p.variant, "bordered") as AccordionVariant}
              size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
              multiple={asBool(p.multiple, false)}
            />
          </div>
        );
      }

      case "tree_view": {
        const rawItems = Array.isArray(p.items) ? (p.items as TreeNode[]) : [];
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 overflow-auto shadow-2xs">
            <TreeView
              items={rawItems}
              size={asStr(p.size, "sm") as "sm" | "md"}
              showLines={asBool(p.showLines, true)}
              selectionMode={asStr(p.selectionMode, "single") as "none" | "single" | "multiple"}
            />
          </div>
        );
      }

      case "transfer_list": {
        const defaultSource = (Array.isArray(p.sourceItems) ? p.sourceItems : []) as TransferListItem[];
        const defaultTarget = (Array.isArray(p.targetItems) ? p.targetItems : []) as TransferListItem[];
        const currentSource = transferState ? transferState.source : defaultSource;
        const currentTarget = transferState ? transferState.target : defaultTarget;

        return (
          <div className="h-full w-full overflow-hidden">
            <TransferList
              sourceTitle={asStr(p.sourceTitle, "Vinculados")}
              targetTitle={asStr(p.targetTitle, "Disponíveis")}
              sourceItems={currentSource}
              targetItems={currentTarget}
              height={Math.max(220, element.height)}
              onChange={(nextSource, nextTarget) => {
                if (interactive) {
                  setTransferState({ source: nextSource, target: nextTarget });
                }
              }}
            />
          </div>
        );
      }

      case "calendar": {
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2 overflow-hidden shadow-2xs">
            <Calendar
              size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
              fillWidth={asBool(p.fillWidth, true)}
              showWeekNumbers={asBool(p.showWeekNumbers, false)}
            />
          </div>
        );
      }

      // ── 5. Formulários & Inputs ────────────────────────────────────────────
      case "text_field": {
        const maskRaw = asStr(p.mask, "none");
        const mask = maskRaw && maskRaw !== "none" ? (maskRaw as TextFieldMask) : undefined;
        return (
          <TextField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            placeholder={asStr(p.placeholder)}
            defaultValue={asStr(p.defaultValue)}
            helpText={asStr(p.helpText) || undefined}
            mask={mask}
            variant={asStr(p.variant, "default") as TextFieldVariant}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            required={asBool(p.required, false)}
            disabled={asBool(p.disabled, false)}
            className="w-full"
          />
        );
      }

      case "textarea_field": {
        return (
          <TextareaField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            placeholder={asStr(p.placeholder)}
            defaultValue={asStr(p.defaultValue)}
            rows={asNum(p.rows, 3)}
            showCount={asBool(p.showCount, true)}
            maxLength={p.maxLength ? asNum(p.maxLength, 250) : undefined}
            variant={asStr(p.variant, "default") as "default" | "filled" | "contained"}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            required={asBool(p.required, false)}
            className="w-full"
          />
        );
      }

      case "number_field": {
        return (
          <NumberField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            defaultValue={asNum(p.defaultValue, 1)}
            min={p.min !== undefined ? asNum(p.min) : undefined}
            max={p.max !== undefined ? asNum(p.max) : undefined}
            prefix={asStr(p.prefix) || undefined}
            suffix={asStr(p.suffix) || undefined}
            showControls={asBool(p.showControls, true)}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            variant={asStr(p.variant, "default") as "default" | "filled"}
            required={asBool(p.required, false)}
            className="w-full"
          />
        );
      }

      case "price_input": {
        return (
          <PriceInput
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            defaultValue={asNum(p.defaultValue, 0)}
            currency={asStr(p.currency, "BRL")}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            variant={asStr(p.variant, "default") as "default" | "filled" | "contained"}
            required={asBool(p.required, false)}
            helpText={asStr(p.helpText) || undefined}
            className="w-full"
          />
        );
      }

      case "select_field": {
        const rawOptions = Array.isArray(p.options) ? p.options : [];
        const options: SelectOption[] = rawOptions.map((o, idx) => {
          const obj = (o && typeof o === "object" ? o : {}) as Record<string, unknown>;
          return {
            value: asStr(obj.value, `opt_${idx}`),
            label: asStr(obj.label, `Opção ${idx + 1}`),
          };
        });
        return (
          <SelectField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            placeholder={asStr(p.placeholder, "Selecionar...")}
            defaultValue={asStr(p.defaultValue)}
            options={options}
            searchable={asBool(p.searchable, true)}
            clearable={asBool(p.clearable, false)}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            variant={asStr(p.variant, "default") as "default" | "filled"}
            required={asBool(p.required, false)}
            className="w-full"
          />
        );
      }

      case "date_picker_field": {
        return (
          <DatePickerField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            placeholder={asStr(p.placeholder, "dd/mm/aaaa")}
            defaultValue={asStr(p.defaultValue)}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            clearable={asBool(p.clearable, true)}
            required={asBool(p.required, false)}
            className="w-full"
          />
        );
      }

      case "switch_field": {
        return (
          <div className="h-full w-full flex items-center">
            <Switch
              componentId={element.componentId}
              label={asStr(p.label, "Opção")}
              description={asStr(p.description) || undefined}
              defaultChecked={asBool(p.defaultChecked, true)}
              color={asStr(p.color, "indigo") as NonNullable<SwitchProps["color"]>}
              size={asStr(p.size, "md") as "sm" | "md" | "lg"}
            />
          </div>
        );
      }

      case "checkbox_field": {
        return (
          <div className="h-full w-full flex items-center">
            <Checkbox
              componentId={element.componentId}
              label={asStr(p.label, "Confirmar item")}
              description={asStr(p.description) || undefined}
              defaultChecked={asBool(p.defaultChecked, true)}
              size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
            />
          </div>
        );
      }

      case "slider_field": {
        return (
          <SliderField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            defaultValue={asNum(p.defaultValue, 20)}
            min={asNum(p.min, 0)}
            max={asNum(p.max, 100)}
            step={asNum(p.step, 5)}
            showValue={asBool(p.showValue, true)}
            className="w-full"
          />
        );
      }

      case "rating_field": {
        return (
          <RatingField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            defaultValue={asNum(p.defaultValue, 5)}
            max={asNum(p.max, 5)}
            tone={asStr(p.tone, "amber") as RatingTone}
            size={asStr(p.size, "md") as RatingSize}
            showValue={asBool(p.showValue, true)}
          />
        );
      }

      case "file_dropzone": {
        return (
          <FileDropzone
            componentId={element.componentId}
            title={asStr(p.title, "Arraste arquivos aqui")}
            description={asStr(p.description) || undefined}
            accept={asStr(p.accept, "image/*,.pdf")}
            compact={asBool(p.compact, true)}
            className="h-full w-full"
          />
        );
      }

      case "cascader_field": {
        const rawOpts = Array.isArray(p.options) ? (p.options as CascaderOption[]) : [];
        const defaultPath = Array.isArray(p.defaultValue)
          ? p.defaultValue.map((v) => asStr(v)).filter(Boolean)
          : undefined;
        return (
          <CascaderField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            placeholder={asStr(p.placeholder, "Selecione...")}
            options={rawOpts}
            defaultValue={defaultPath}
            expandTrigger={asStr(p.expandTrigger, "hover") as "click" | "hover"}
            searchable={asBool(p.searchable, true)}
            clearable={asBool(p.clearable, true)}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
          />
        );
      }

      case "tree_select_field": {
        const rawTree = Array.isArray(p.treeData) ? (p.treeData as TreeSelectNode[]) : [];
        return (
          <TreeSelectField
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            placeholder={asStr(p.placeholder, "Selecione na árvore...")}
            treeData={rawTree}
            defaultValue={asStr(p.defaultValue) || undefined}
            searchable={asBool(p.searchable, true)}
            clearable={asBool(p.clearable, true)}
            treeDefaultExpandAll={asBool(p.treeDefaultExpandAll, true)}
            size={asStr(p.size, "md") as "sm" | "md" | "lg"}
          />
        );
      }

      case "tags_input": {
        const rawTags = Array.isArray(p.defaultValue)
          ? p.defaultValue.map((t) => asStr(t)).filter(Boolean)
          : ["Pronta Entrega RO/AM", "Montagem Inclusa"];
        return (
          <TagsInput
            componentId={element.componentId}
            label={asStr(p.label) || undefined}
            mode={asStr(p.mode, "inline-add") as "input" | "inline-add"}
            addButtonLabel={asStr(p.addButtonLabel, "Nova Tag")}
            color={asStr(p.color, "primary") as TagColor}
            defaultValue={rawTags}
          />
        );
      }

      case "signature_pad": {
        const padHeight = Math.max(96, Math.min(280, element.height - 84));
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 flex flex-col justify-center overflow-hidden shadow-2xs">
            <SignaturePad
              componentId={element.componentId}
              height={asNum(p.height, padHeight)}
              signerName={asStr(p.signerName) || undefined}
              signerDocument={asStr(p.signerDocument) || undefined}
              placeholder={asStr(p.placeholder) || undefined}
              showToolbar={asBool(p.showToolbar, true)}
              showBaseline={asBool(p.showBaseline, true)}
              readOnly={!interactive}
            />
          </div>
        );
      }

      case "code_editor": {
        const editorHeight = Math.max(120, element.height - 76);
        return (
          <div className="h-full w-full overflow-hidden">
            <CodeEditor
              componentId={element.componentId}
              title={asStr(p.title, "config-app.json")}
              language={asStr(p.language, "json") as CodeEditorLanguage}
              variant={asStr(p.variant, "dark") as CodeEditorVariant}
              defaultValue={asStr(p.defaultValue)}
              height={editorHeight}
              showToolbar={asBool(p.showToolbar, true)}
              showLineNumbers={asBool(p.showLineNumbers, true)}
              readOnly={!interactive}
              className="h-full"
            />
          </div>
        );
      }

      // ── 6. Ações & Identidade ──────────────────────────────────────────────
      case "button": {
        const IconComp = p.iconName && p.iconName !== "none" ? resolveIcon(p.iconName) : null;
        return (
          <div className="h-full w-full flex items-center">
            <Button
              componentId={element.componentId}
              variant={asStr(p.variant, "primary") as ButtonProps["variant"]}
              size={asStr(p.size, "md") as ButtonProps["size"]}
              fullWidth={asBool(p.fullWidth, true)}
              pill={asBool(p.pill, false)}
              disabled={asBool(p.disabled, false)}
              leftIcon={IconComp ? <IconComp size={15} /> : undefined}
              className="h-full"
              onClick={() => interactive && toast.success(`Botão acionado: ${asStr(p.label)}`)}
            >
              {asStr(p.label, "Botão")}
            </Button>
          </div>
        );
      }

      case "badge": {
        return (
          <div className="h-full w-full flex items-center">
            <Badge
              componentId={element.componentId}
              label={asStr(p.label, "Etiqueta")}
              variant={asStr(p.variant, "primary") as BadgeVariant}
              appearance={asStr(p.appearance, "soft") as BadgeAppearance}
              size={asStr(p.size, "md") as BadgeSize}
              dot={asBool(p.dot, true)}
            />
          </div>
        );
      }

      case "status_badge": {
        return (
          <div className="h-full w-full flex items-center">
            <StatusBadge
              componentId={element.componentId}
              label={asStr(p.label, "Operacional")}
              tone={asStr(p.tone, "success") as StatusTone}
              size={asStr(p.size, "md") as StatusBadgeSize}
              dot={asBool(p.dot, true)}
              pulse={asBool(p.pulse, true)}
              solid={asBool(p.solid, false)}
            />
          </div>
        );
      }

      case "avatar": {
        const name = asStr(p.name, "Consultor Comercial");
        const role = asStr(p.role);
        const showDetails = asBool(p.showDetails, true);
        return (
          <div className="h-full w-full flex items-center gap-3">
            <Avatar
              componentId={element.componentId}
              name={name}
              size={asStr(p.size, "md") as AvatarSize}
              shape={asStr(p.shape, "circle") as AvatarShape}
              status={asStr(p.status, "online") as AvatarStatus}
            />
            {showDetails && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {name}
                </p>
                {role && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{role}</p>
                )}
              </div>
            )}
          </div>
        );
      }

      case "barcode": {
        const groupDigits = asNum(p.groupDigits, 0);
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 flex items-center justify-center overflow-hidden shadow-2xs">
            <Barcode
              componentId={element.componentId}
              value={asStr(p.value, "7898641920485")}
              label={asStr(p.label) || undefined}
              sublabel={asStr(p.sublabel) || undefined}
              height={asNum(p.height, 46)}
              groupDigits={groupDigits > 0 ? groupDigits : undefined}
              showValue={asBool(p.showValue, true)}
              copyable={interactive && asBool(p.copyable, true)}
              className="w-full"
            />
          </div>
        );
      }

      case "qrcode": {
        return (
          <div className="h-full w-full flex items-center justify-center overflow-hidden">
            <QRCode
              componentId={element.componentId}
              value={asStr(p.value, "https://lopes-ui.com.br/pedido/PED-90482")}
              title={asStr(p.title) || undefined}
              caption={asStr(p.caption) || undefined}
              size={asNum(p.size, 152)}
              moduleStyle={asStr(p.moduleStyle, "rounded") as QRCodeModuleStyle}
              status={asStr(p.status, "active") as QRCodeStatus}
              errorLevel={asStr(p.errorLevel, "M") as QRCodeErrorLevel}
              copyable={interactive && asBool(p.copyable, true)}
              downloadable={interactive && asBool(p.downloadable, true)}
              onRefresh={
                interactive
                  ? () => {
                      toast.success("QR Code PIX / Rastreio regenerado!");
                    }
                  : undefined
              }
              className="w-full h-full justify-center"
            />
          </div>
        );
      }

      // ── 7. Feedback & Overlays ─────────────────────────────────────────────
      case "alert": {
        return (
          <Alert
            componentId={element.componentId}
            title={asStr(p.title, "Aviso Operacional")}
            description={asStr(p.description)}
            variant={asStr(p.variant, "info") as AlertVariant}
            accent={asStr(p.accent, "left") as AlertAccent}
            dismissible={asBool(p.dismissible, false)}
            className="h-full w-full"
          />
        );
      }

      case "callout": {
        return (
          <Callout
            componentId={element.componentId}
            variant={asStr(p.variant, "tip") as CalloutVariant}
            title={asStr(p.title, "Destaque Comercial")}
            collapsible={asBool(p.collapsible, false)}
            className="h-full w-full"
          >
            {asStr(p.body)}
          </Callout>
        );
      }

      case "empty_state": {
        const actionLabel = asStr(p.actionLabel);
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 p-4 flex items-center justify-center">
            <EmptyState
              componentId={element.componentId}
              preset={asStr(p.preset, "search") as EmptyStatePreset}
              title={asStr(p.title, "Nenhum resultado")}
              description={asStr(p.description)}
              size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
              actions={
                actionLabel
                  ? [
                      {
                        label: actionLabel,
                        variant: "primary",
                        onClick: () => interactive && toast.info(`Ação: ${actionLabel}`),
                      },
                    ]
                  : undefined
              }
            />
          </div>
        );
      }

      case "result": {
        const primaryAction = asStr(p.primaryAction);
        const secondaryAction = asStr(p.secondaryAction);
        return (
          <Result
            componentId={element.componentId}
            status={asStr(p.status, "success") as ResultStatus}
            title={asStr(p.title, "Operação Concluída")}
            subTitle={asStr(p.subTitle) || undefined}
            size={asStr(p.size, "sm") as "sm" | "md" | "lg"}
            bordered={asBool(p.bordered, true)}
            className="h-full w-full justify-center"
            extra={
              primaryAction || secondaryAction ? (
                <>
                  {secondaryAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => interactive && toast.info(secondaryAction)}
                    >
                      {secondaryAction}
                    </Button>
                  )}
                  {primaryAction && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => interactive && toast.success(primaryAction)}
                    >
                      {primaryAction}
                    </Button>
                  )}
                </>
              ) : undefined
            }
          />
        );
      }

      case "skeleton": {
        const preset = asStr(p.preset, "card");
        const animation = asStr(p.animation, "wave") as SkeletonAnimation;
        const rows = asNum(p.rows, 3);
        return (
          <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 flex items-center overflow-hidden shadow-2xs">
            {preset === "table" ? (
              <Skeleton.Table rows={rows} columns={4} animation={animation} className="w-full" />
            ) : preset === "paragraph" ? (
              <Skeleton
                active
                animation={animation}
                avatar={asBool(p.hasAvatar, true)}
                paragraph={{ rows }}
                className="w-full"
              />
            ) : (
              <Skeleton.Card
                hasAvatar={asBool(p.hasAvatar, true)}
                hasImage={asBool(p.hasImage, false)}
                lines={rows}
                animation={animation}
                className="w-full border-0 p-0 shadow-none"
              />
            )}
          </div>
        );
      }

      case "modal_trigger": {
        const ModalIcon = resolveIcon("AppWindow");
        return (
          <>
            <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ModalIcon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {asStr(p.modalTitle, "Modal Interativo")}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {asStr(p.modalDescription, "Clique no Preview para testar o diálogo")}
                    </p>
                  </div>
                </div>
                <Badge label="Modal" variant="info" size="xs" />
              </div>
              <Button
                componentId={element.componentId}
                size="sm"
                variant="primary"
                fullWidth
                onClick={() => interactive && setOverlayOpen(true)}
              >
                {asStr(p.triggerLabel, "Abrir Modal")}
              </Button>
            </div>
            {interactive && (
              <Modal
                open={overlayOpen}
                onClose={() => setOverlayOpen(false)}
                title={asStr(p.modalTitle, "Modal do Sistema")}
                description={asStr(p.modalDescription)}
                size={asStr(p.size, "md") as ModalProps["size"]}
                footer={
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setOverlayOpen(false)}>
                      Fechar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setOverlayOpen(false);
                        toast.success(asStr(p.confirmLabel, "Confirmado!"));
                      }}
                    >
                      {asStr(p.confirmLabel, "Confirmar")}
                    </Button>
                  </div>
                }
              >
                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {asStr(p.modalBody)}
                </div>
              </Modal>
            )}
          </>
        );
      }

      case "drawer_trigger": {
        const DrawerIcon = resolveIcon("PanelRight");
        return (
          <>
            <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-7 w-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <DrawerIcon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {asStr(p.drawerTitle, "Drawer Lateral")}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {asStr(p.drawerDescription, "Painel deslizante lateral")}
                    </p>
                  </div>
                </div>
                <Badge label="Drawer" variant="teal" size="xs" />
              </div>
              <Button
                componentId={element.componentId}
                size="sm"
                variant="outline"
                fullWidth
                onClick={() => interactive && setOverlayOpen(true)}
              >
                {asStr(p.triggerLabel, "Abrir Drawer")}
              </Button>
            </div>
            {interactive && (
              <Drawer
                open={overlayOpen}
                onClose={() => setOverlayOpen(false)}
                title={asStr(p.drawerTitle, "Painel Lateral")}
                description={asStr(p.drawerDescription)}
                side={asStr(p.side, "right") as DrawerSide}
                size={asStr(p.size, "md") as DrawerSize}
                footer={
                  <div className="flex justify-end">
                    <Button size="sm" variant="primary" onClick={() => setOverlayOpen(false)}>
                      Concluir Consulta
                    </Button>
                  </div>
                }
              >
                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {asStr(p.drawerBody)}
                </div>
              </Drawer>
            )}
          </>
        );
      }

      case "confirm_dialog_trigger": {
        const AlertIcon = resolveIcon("ShieldAlert");
        return (
          <>
            <div className="h-full w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertIcon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {asStr(p.dialogTitle, "Confirmação Crítica")}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {asStr(p.dialogDescription)}
                    </p>
                  </div>
                </div>
                <Badge label="Confirm" variant="danger" size="xs" />
              </div>
              <Button
                componentId={element.componentId}
                size="sm"
                variant="destructive"
                fullWidth
                onClick={() => interactive && setOverlayOpen(true)}
              >
                {asStr(p.triggerLabel, "Solicitar Confirmação")}
              </Button>
            </div>
            {interactive && (
              <ConfirmDialog
                open={overlayOpen}
                onClose={() => setOverlayOpen(false)}
                title={asStr(p.dialogTitle, "Confirmar operação?")}
                description={asStr(p.dialogDescription)}
                variant={asStr(p.variant, "danger") as ConfirmDialogVariant}
                confirmLabel={asStr(p.confirmLabel, "Confirmar")}
                cancelLabel={asStr(p.cancelLabel, "Cancelar")}
                onConfirm={() => {
                  setOverlayOpen(false);
                  toast.success("Operação confirmada!");
                }}
              />
            )}
          </>
        );
      }

      default:
        return (
          <div className="h-full w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-400">
            {element.name}
          </div>
        );
    }
  };

  return (
    <div
      style={wrapperInlineStyle}
      className={cn(
        "relative h-full w-full",
        st?.shadow && SHADOW_MAP[st.shadow],
        st?.overflow === "hidden"
          ? "overflow-hidden"
          : st?.overflow === "auto"
            ? "overflow-auto"
            : "overflow-visible",
        !interactive && "select-none",
        st?.customClassName,
      )}
    >
      <div className={cn("h-full w-full", !interactive && "pointer-events-none")}>
        {renderComponent()}
      </div>

      {isInlineEditing && primaryKey && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs rounded-lg ring-2 ring-indigo-500 p-2 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            autoFocus
            defaultValue={currentPrimaryText}
            aria-label={`Editar texto principal de ${element.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCommitInlineText?.(e.currentTarget.value);
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancelInlineEdit?.();
              }
            }}
            onBlur={(e) => onCommitInlineText?.(e.currentTarget.value)}
            className="w-full rounded-md border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
