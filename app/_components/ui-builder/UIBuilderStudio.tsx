"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  Braces,
  Check,
  ChevronDown,
  Code2,
  Columns3,
  Copy,
  Crosshair,
  Download,
  Edit3,
  EyeOff,
  FileJson,
  Grid3X3,
  Group,
  Hand,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  MousePointer2,
  PanelLeft,
  PanelRight,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Scissors,
  Sparkles,
  Trash2,
  Undo2,
  Ungroup,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import CodeEditor from "@/components/CodeEditor";
import ConfirmDialog from "@/components/ConfirmDialog";
import StatusBadge from "@/components/StatusBadge";
import toast from "@/components/Toast";
import { cn } from "@/utils/cn";
import {
  alignElements,
  autoArrangeElements,
  cloneElements,
  deepClone,
  distributeElements,
  expandGroups,
  getSelectionBounds,
  groupElements,
  matchElementSize,
  moveLayer,
  normalizeCanvasConfig,
  reorderLayer,
  ungroupElements,
  type AlignMode,
} from "./canvas-actions";
import {
  DND_COMPONENT_MIME,
  UICatalogSidebar,
  UILayersPanel,
  UIShortcutsModal,
} from "./CanvasPanels";
import {
  CATALOG_BY_TYPE,
  createCatalogElement,
  resolveIcon,
  STUDIO_PRESETS,
} from "./catalog-and-defaults";
import ElementRenderer, { getEditablePrimaryPropKey } from "./ElementRenderer";
import { generateTsxCode } from "./tsx-generator";
import type {
  ResizeDirection,
  UICanvasConfig,
  UICanvasElement,
  UICodeExportMode,
  UIComponentType,
  UICompositeBlockDefinition,
  UIStudioMode,
} from "./types";
import UIBuilderInspector from "./UIBuilderInspector";
import UIJsonEditorModal from "./UIJsonEditorModal";

const STORAGE_KEY = "lopes_ui_studio_2d_v3";
const MAX_HISTORY = 40;
const RULER_SIZE = 24;
const CANVAS_PAD = 32;
const ZOOM_STEPS = [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.5, 2, 3, 4, 5];

const subscribeNoop = () => () => {};

function loadInitialStudioConfig(): UICanvasConfig {
  const defaultPreset = deepClone(STUDIO_PRESETS[0].config);
  if (typeof window === "undefined") return defaultPreset;
  try {
    window.localStorage.removeItem("lopes_ui_studio_2d_v2");
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultPreset;
    const parsed = JSON.parse(saved) as unknown;
    return normalizeCanvasConfig(parsed, defaultPreset);
  } catch {
    return defaultPreset;
  }
}

interface ContextMenuState {
  clientX: number;
  clientY: number;
  canvasX: number;
  canvasY: number;
  targetId: string | null;
}

interface InteractionSession {
  kind: "move" | "resize" | "group_resize" | "marquee" | "pan" | "guide";
  startClientX: number;
  startClientY: number;
  startCanvasX: number;
  startCanvasY: number;
  resizeDir?: ResizeDirection;
  targetIds?: string[];
  initialElements: UICanvasElement[];
  initialBounds?: { minX: number; minY: number; width: number; height: number };
  scrollStartLeft?: number;
  scrollStartTop?: number;
  guideAxis?: "x" | "y";
  guideIndex?: number;
  hasMoved: boolean;
}

const RESIZE_HANDLES: { dir: ResizeDirection; posCls: string; cursor: string }[] = [
  { dir: "nw", posCls: "-left-1.5 -top-1.5", cursor: "nwse-resize" },
  { dir: "n", posCls: "left-1/2 -translate-x-1/2 -top-1.5", cursor: "ns-resize" },
  { dir: "ne", posCls: "-right-1.5 -top-1.5", cursor: "nesw-resize" },
  { dir: "e", posCls: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
  { dir: "se", posCls: "-right-1.5 -bottom-1.5", cursor: "nwse-resize" },
  { dir: "s", posCls: "left-1/2 -translate-x-1/2 -bottom-1.5", cursor: "ns-resize" },
  { dir: "sw", posCls: "-left-1.5 -bottom-1.5", cursor: "nesw-resize" },
  { dir: "w", posCls: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
];

const QUICK_PRIMITIVES: { type: UIComponentType; short: string; icon: string }[] = [
  { type: "container_panel", short: "Seção", icon: "Square" },
  { type: "card", short: "Card", icon: "LayoutTemplate" },
  { type: "typography", short: "Texto", icon: "Heading" },
  { type: "stat_card", short: "KPI", icon: "TrendingUp" },
  { type: "chart", short: "Gráfico", icon: "BarChart3" },
  { type: "table", short: "Tabela", icon: "Table2" },
  { type: "text_field", short: "Input", icon: "Type" },
  { type: "button", short: "Botão", icon: "MousePointerClick" },
];

function UIBuilderStudioCore() {
  const [config, setConfig] = useState<UICanvasConfig>(loadInitialStudioConfig);
  const [history, setHistory] = useState<{ past: UICanvasConfig[]; future: UICanvasConfig[] }>({
    past: [],
    future: [],
  });

  const [mode, setMode] = useState<UIStudioMode>("canvas");
  const [codeExportMode, setCodeExportMode] = useState<UICodeExportMode>("responsive");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<UICanvasElement[]>([]);

  // Studio UI Toggles
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeftCatalog, setShowLeftCatalog] = useState(true);
  const [showRightInspector, setShowRightInspector] = useState(true);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presetsPos, setPresetsPos] = useState<{ top: number; left: number } | null>(null);

  // Viewport, Tool & Guides State
  const [activeTool, setActiveTool] = useState<"select" | "pan">("select");
  const [spacePressed, setSpacePressed] = useState(false);
  const [zoom, setZoom] = useState<number>(0.85);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [marqueeRect, setMarqueeRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [dropPreview, setDropPreview] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const presetsBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<InteractionSession | null>(null);
  const configRef = useRef<UICanvasConfig>(config);

  useEffect(() => {
    configRef.current = config;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage quota warnings
    }
  }, [config]);

  const updateConfig = useCallback(
    (updater: (prev: UICanvasConfig) => UICanvasConfig, commitHistory = true) => {
      setConfig((prev) => {
        const next = updater(prev);
        if (commitHistory) {
          setHistory((h) => ({
            past: [...h.past.slice(-(MAX_HISTORY - 1)), deepClone(prev)],
            future: [],
          }));
        }
        return next;
      });
    },
    [],
  );

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const currentSnapshot = deepClone(configRef.current);
      setConfig(previous);
      setSelectedIds([]);
      return {
        past: h.past.slice(0, -1),
        future: [currentSnapshot, ...h.future.slice(0, MAX_HISTORY - 1)],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const currentSnapshot = deepClone(configRef.current);
      setConfig(next);
      setSelectedIds([]);
      return {
        past: [...h.past.slice(-(MAX_HISTORY - 1)), currentSnapshot],
        future: h.future.slice(1),
      };
    });
  }, []);

  // Effective artboard height auto-grows when elements extend past initial fold
  const effectiveHeight = useMemo(() => {
    const maxElBottom = config.elements
      .filter((e) => !e.hidden)
      .reduce((acc, el) => Math.max(acc, el.y + el.height + config.marginBottom + 24), 0);
    return Math.max(config.height, maxElBottom);
  }, [config.elements, config.height, config.marginBottom]);

  const selectionBounds = useMemo(
    () => getSelectionBounds(config.elements, selectedIds),
    [config.elements, selectedIds],
  );

  const clientToCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const rect = artboardRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: Math.round((clientX - rect.left) / zoom),
        y: Math.round((clientY - rect.top) / zoom),
      };
    },
    [zoom],
  );

  const snapScalar = useCallback(
    (val: number) => {
      const step = config.snapGrid || 1;
      return step <= 1 ? Math.round(val) : Math.round(val / step) * step;
    },
    [config.snapGrid],
  );

  const fitZoomToViewport = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const availW = Math.max(320, vp.clientWidth - RULER_SIZE - CANVAS_PAD * 2 - 24);
    const ratio = Math.min(1.25, Math.max(0.25, Number((availW / config.width).toFixed(2))));
    setZoom(ratio);
  }, [config.width]);

  // Smart Magnetic Snap computation for dragging/resizing
  const computeSmartSnap = useCallback(
    (
      box: { x: number; y: number; width: number; height: number },
      ignoreIds: Set<string>,
      altBypass: boolean,
    ): { x: number; y: number; guidesX: number[]; guidesY: number[] } => {
      if (altBypass) {
        return { x: Math.round(box.x), y: Math.round(box.y), guidesX: [], guidesY: [] };
      }

      const threshold = Math.max(5, Math.round(6 / zoom));
      const xTargets: number[] = [
        config.marginLeft,
        Math.round(config.width / 2),
        config.width - config.marginRight,
        ...config.guides.x,
      ];
      const yTargets: number[] = [
        config.marginTop,
        config.height - config.marginBottom,
        ...config.guides.y,
      ];

      for (const other of config.elements) {
        if (other.hidden || ignoreIds.has(other.id)) continue;
        xTargets.push(other.x, Math.round(other.x + other.width / 2), other.x + other.width);
        yTargets.push(other.y, Math.round(other.y + other.height / 2), other.y + other.height);
      }

      let bestDx = Infinity;
      let snappedX = snapScalar(box.x);
      let matchedGuideX: number | null = null;
      const boxXAnchors = [
        { offset: 0, val: box.x },
        { offset: box.width / 2, val: box.x + box.width / 2 },
        { offset: box.width, val: box.x + box.width },
      ];

      for (const anchor of boxXAnchors) {
        for (const target of xTargets) {
          const diff = Math.abs(anchor.val - target);
          if (diff <= threshold && diff < bestDx) {
            bestDx = diff;
            snappedX = Math.round(target - anchor.offset);
            matchedGuideX = target;
          }
        }
      }

      let bestDy = Infinity;
      let snappedY = snapScalar(box.y);
      let matchedGuideY: number | null = null;
      const boxYAnchors = [
        { offset: 0, val: box.y },
        { offset: box.height / 2, val: box.y + box.height / 2 },
        { offset: box.height, val: box.y + box.height },
      ];

      for (const anchor of boxYAnchors) {
        for (const target of yTargets) {
          const diff = Math.abs(anchor.val - target);
          if (diff <= threshold && diff < bestDy) {
            bestDy = diff;
            snappedY = Math.round(target - anchor.offset);
            matchedGuideY = target;
          }
        }
      }

      return {
        x: Math.max(0, snappedX),
        y: Math.max(0, snappedY),
        guidesX: matchedGuideX !== null ? [matchedGuideX] : [],
        guidesY: matchedGuideY !== null ? [matchedGuideY] : [],
      };
    },
    [
      config.elements,
      config.guides.x,
      config.guides.y,
      config.height,
      config.marginBottom,
      config.marginLeft,
      config.marginRight,
      config.marginTop,
      config.width,
      snapScalar,
      zoom,
    ],
  );

  // ── Element Insertion & Actions ────────────────────────────────────────────
  const handleAddComponentAt = useCallback(
    (type: UIComponentType, targetX?: number, targetY?: number) => {
      const usableW = Math.max(240, config.width - config.marginLeft - config.marginRight);
      let nextX = targetX;
      let nextY = targetY;

      if (nextX === undefined || nextY === undefined) {
        const visible = config.elements.filter((e) => !e.hidden);
        const maxBottom =
          visible.length === 0
            ? config.marginTop
            : Math.max(...visible.map((e) => e.y + e.height)) + 16;
        nextX = config.marginLeft;
        nextY = snapScalar(maxBottom);
      } else {
        nextX = snapScalar(Math.max(0, Math.min(config.width - 80, nextX)));
        nextY = snapScalar(Math.max(0, nextY));
      }

      const created = createCatalogElement(type, nextX, nextY, config.componentIdPrefix);
      if (created.width > usableW && targetX === undefined) {
        created.width = usableW;
      }

      updateConfig((prev) => ({
        ...prev,
        elements: [...prev.elements, created],
      }));
      setSelectedIds([created.id]);
      if (mode !== "canvas") setMode("canvas");
    },
    [
      config.componentIdPrefix,
      config.elements,
      config.marginLeft,
      config.marginRight,
      config.marginTop,
      config.width,
      mode,
      snapScalar,
      updateConfig,
    ],
  );

  const handleAddCompositeBlock = useCallback(
    (block: UICompositeBlockDefinition) => {
      const usableW = Math.max(320, config.width - config.marginLeft - config.marginRight);
      const visible = config.elements.filter((e) => !e.hidden);
      const startY =
        visible.length === 0
          ? config.marginTop
          : snapScalar(Math.max(...visible.map((e) => e.y + e.height)) + 20);
      const built = block.build(config.marginLeft, startY, usableW);
      updateConfig((prev) => ({
        ...prev,
        elements: [...prev.elements, ...built],
      }));
      setSelectedIds(built.map((b) => b.id));
      toast.success(`Seção "${block.name}" inserida e agrupada na prancheta!`);
    },
    [
      config.elements,
      config.marginLeft,
      config.marginRight,
      config.marginTop,
      config.width,
      snapScalar,
      updateConfig,
    ],
  );

  const handleDuplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const idSet = new Set(selectedIds);
    const source = config.elements.filter((e) => idSet.has(e.id));
    if (source.length === 0) return;
    const step = Math.max(16, config.snapGrid * 2);
    const clones = cloneElements(source, step, step);
    updateConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, ...clones],
    }));
    setSelectedIds(clones.map((c) => c.id));
  }, [config.elements, config.snapGrid, selectedIds, updateConfig]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const idSet = new Set(selectedIds);
    const unlockedTargets = config.elements.filter((e) => idSet.has(e.id) && !e.locked);
    if (unlockedTargets.length === 0) {
      toast.warning("Os elementos selecionados estão bloqueados (Ctrl+L para desbloquear).");
      return;
    }
    const removeSet = new Set(unlockedTargets.map((e) => e.id));
    updateConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((e) => !removeSet.has(e.id)),
    }));
    setSelectedIds((prev) => prev.filter((id) => !removeSet.has(id)));
  }, [config.elements, selectedIds, updateConfig]);

  const handleAlign = useCallback(
    (alignMode: AlignMode, forceArtboard = false) => {
      if (selectedIds.length === 0) return;
      const artboardUsable = {
        left: config.marginLeft,
        top: config.marginTop,
        right: config.width - config.marginRight,
        bottom: effectiveHeight - config.marginBottom,
      };
      updateConfig((prev) => ({
        ...prev,
        elements: alignElements(
          prev.elements,
          selectedIds,
          alignMode,
          artboardUsable,
          forceArtboard,
        ),
      }));
    },
    [
      config.marginBottom,
      config.marginLeft,
      config.marginRight,
      config.marginTop,
      config.width,
      effectiveHeight,
      selectedIds,
      updateConfig,
    ],
  );

  const handleDistribute = useCallback(
    (axis: "H" | "V") => {
      updateConfig((prev) => ({
        ...prev,
        elements: distributeElements(prev.elements, selectedIds, axis),
      }));
    },
    [selectedIds, updateConfig],
  );

  const handleMatchSize = useCallback(
    (dim: "W" | "H" | "BOTH") => {
      updateConfig((prev) => ({
        ...prev,
        elements: matchElementSize(prev.elements, selectedIds, dim),
      }));
    },
    [selectedIds, updateConfig],
  );

  const handleAutoArrange = useCallback(
    (direction: "row" | "column", gap: number, equalizeSize = false) => {
      const usableW = Math.max(240, config.width - config.marginLeft - config.marginRight);
      updateConfig((prev) => ({
        ...prev,
        elements: autoArrangeElements(prev.elements, selectedIds, direction, gap, {
          equalizeSize,
          rowWidth: equalizeSize ? usableW : undefined,
          startX: equalizeSize ? config.marginLeft : undefined,
        }),
      }));
    },
    [config.marginLeft, config.marginRight, config.width, selectedIds, updateConfig],
  );

  const handleGroup = useCallback(() => {
    if (selectedIds.length < 2) return;
    updateConfig((prev) => {
      const res = groupElements(prev.elements, selectedIds);
      return { ...prev, elements: res.elements };
    });
    toast.success(`${selectedIds.length} elementos agrupados!`);
  }, [selectedIds, updateConfig]);

  const handleUngroup = useCallback(() => {
    if (selectedIds.length === 0) return;
    updateConfig((prev) => ({
      ...prev,
      elements: ungroupElements(prev.elements, selectedIds),
    }));
    toast.info("Grupo desfeito.");
  }, [selectedIds, updateConfig]);

  const handleMoveLayer = useCallback(
    (dir: "UP" | "DOWN", extreme = false) => {
      updateConfig((prev) => ({
        ...prev,
        elements: moveLayer(prev.elements, selectedIds, dir, extreme),
      }));
    },
    [selectedIds, updateConfig],
  );

  const handlePasteAt = useCallback(
    (atX?: number, atY?: number) => {
      if (clipboard.length === 0) return;
      let clones: UICanvasElement[];
      if (atX !== undefined && atY !== undefined) {
        const minX = Math.min(...clipboard.map((c) => c.x));
        const minY = Math.min(...clipboard.map((c) => c.y));
        clones = cloneElements(clipboard, snapScalar(atX) - minX, snapScalar(atY) - minY);
      } else {
        clones = cloneElements(clipboard, 20, 20);
      }
      updateConfig((prev) => ({
        ...prev,
        elements: [...prev.elements, ...clones],
      }));
      setSelectedIds(clones.map((c) => c.id));
    },
    [clipboard, snapScalar, updateConfig],
  );

  // ── Global Mouse Move / Mouse Up Interaction Engine ────────────────────────
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const sess = sessionRef.current;
      if (!sess) return;

      const dxClient = e.clientX - sess.startClientX;
      const dyClient = e.clientY - sess.startClientY;
      if (!sess.hasMoved && Math.hypot(dxClient, dyClient) > 2) {
        sess.hasMoved = true;
      }

      if (sess.kind === "pan") {
        const vp = viewportRef.current;
        if (vp && sess.scrollStartLeft !== undefined && sess.scrollStartTop !== undefined) {
          vp.scrollLeft = sess.scrollStartLeft - dxClient;
          vp.scrollTop = sess.scrollStartTop - dyClient;
        }
        return;
      }

      const pt = clientToCanvas(e.clientX, e.clientY);
      setMousePos(pt);

      if (sess.kind === "guide" && sess.guideAxis) {
        const coord = sess.guideAxis === "x" ? Math.max(0, pt.x) : Math.max(0, pt.y);
        setConfig((prev) => {
          const list = [...prev.guides[sess.guideAxis!]];
          if (sess.guideIndex !== undefined && sess.guideIndex < list.length) {
            list[sess.guideIndex] = coord;
          }
          return {
            ...prev,
            guides: {
              ...prev.guides,
              [sess.guideAxis!]: list,
            },
          };
        });
        return;
      }

      if (sess.kind === "marquee") {
        const x = Math.min(sess.startCanvasX, pt.x);
        const y = Math.min(sess.startCanvasY, pt.y);
        const width = Math.abs(pt.x - sess.startCanvasX);
        const height = Math.abs(pt.y - sess.startCanvasY);
        setMarqueeRect({ x, y, width, height });

        const hits = sess.initialElements
          .filter(
            (el) =>
              !el.hidden &&
              !(el.locked && el.type === "container_panel") &&
              el.x < x + width &&
              el.x + el.width > x &&
              el.y < y + height &&
              el.y + el.height > y,
          )
          .map((el) => el.id);
        setSelectedIds(expandGroups(sess.initialElements, hits));
        return;
      }

      const dxCanvas = (e.clientX - sess.startClientX) / zoom;
      const dyCanvas = (e.clientY - sess.startClientY) / zoom;

      if (sess.kind === "move" && sess.targetIds && sess.initialBounds) {
        const movingSet = new Set(sess.targetIds);
        const rawGroupBox = {
          x: sess.initialBounds.minX + dxCanvas,
          y: sess.initialBounds.minY + dyCanvas,
          width: sess.initialBounds.width,
          height: sess.initialBounds.height,
        };
        const snapped = computeSmartSnap(rawGroupBox, movingSet, e.altKey);
        setSnapGuides({ x: snapped.guidesX, y: snapped.guidesY });

        const appliedDx = snapped.x - sess.initialBounds.minX;
        const appliedDy = snapped.y - sess.initialBounds.minY;

        setConfig((prev) => ({
          ...prev,
          elements: prev.elements.map((el) => {
            if (!movingSet.has(el.id) || el.locked) return el;
            const orig = sess.initialElements.find((o) => o.id === el.id);
            if (!orig) return el;
            return {
              ...el,
              x: Math.max(0, Math.round(orig.x + appliedDx)),
              y: Math.max(0, Math.round(orig.y + appliedDy)),
            };
          }),
        }));
        return;
      }

      if (sess.kind === "resize" && sess.targetIds?.[0] && sess.resizeDir) {
        const targetId = sess.targetIds[0];
        const orig = sess.initialElements.find((o) => o.id === targetId);
        if (!orig || orig.locked) return;
        const meta = CATALOG_BY_TYPE[orig.type];
        const minW = meta?.minWidth || 40;
        const minH = meta?.minHeight || 28;
        const dir = sess.resizeDir;

        let nextX = orig.x;
        let nextY = orig.y;
        let nextW = orig.width;
        let nextH = orig.height;

        if (dir.includes("e")) {
          nextW = Math.max(minW, e.altKey ? orig.width + dxCanvas : snapScalar(orig.width + dxCanvas));
        }
        if (dir.includes("s")) {
          nextH = Math.max(minH, e.altKey ? orig.height + dyCanvas : snapScalar(orig.height + dyCanvas));
        }
        if (dir.includes("w")) {
          const candX = e.altKey ? orig.x + dxCanvas : snapScalar(orig.x + dxCanvas);
          const maxLeft = orig.x + orig.width - minW;
          nextX = Math.max(0, Math.min(maxLeft, candX));
          nextW = orig.width + (orig.x - nextX);
        }
        if (dir.includes("n")) {
          const candY = e.altKey ? orig.y + dyCanvas : snapScalar(orig.y + dyCanvas);
          const maxTop = orig.y + orig.height - minH;
          nextY = Math.max(0, Math.min(maxTop, candY));
          nextH = orig.height + (orig.y - nextY);
        }

        setConfig((prev) => ({
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === targetId
              ? {
                  ...el,
                  x: Math.round(nextX),
                  y: Math.round(nextY),
                  width: Math.round(nextW),
                  height: Math.round(nextH),
                }
              : el,
          ),
        }));
        return;
      }

      if (
        sess.kind === "group_resize" &&
        sess.targetIds &&
        sess.initialBounds &&
        sess.resizeDir
      ) {
        const movingSet = new Set(sess.targetIds);
        const ib = sess.initialBounds;
        const dir = sess.resizeDir;

        let newLeft = ib.minX;
        let newTop = ib.minY;
        let newRight = ib.minX + ib.width;
        let newBottom = ib.minY + ib.height;

        if (dir.includes("e")) newRight = Math.max(ib.minX + 80, snapScalar(newRight + dxCanvas));
        if (dir.includes("s")) newBottom = Math.max(ib.minY + 60, snapScalar(newBottom + dyCanvas));
        if (dir.includes("w")) newLeft = Math.max(0, Math.min(newRight - 80, snapScalar(newLeft + dxCanvas)));
        if (dir.includes("n")) newTop = Math.max(0, Math.min(newBottom - 60, snapScalar(newTop + dyCanvas)));

        const scaleX = (newRight - newLeft) / Math.max(1, ib.width);
        const scaleY = (newBottom - newTop) / Math.max(1, ib.height);

        setConfig((prev) => ({
          ...prev,
          elements: prev.elements.map((el) => {
            if (!movingSet.has(el.id) || el.locked) return el;
            const orig = sess.initialElements.find((o) => o.id === el.id);
            if (!orig) return el;
            const meta = CATALOG_BY_TYPE[orig.type];
            return {
              ...el,
              x: Math.round(newLeft + (orig.x - ib.minX) * scaleX),
              y: Math.round(newTop + (orig.y - ib.minY) * scaleY),
              width: Math.max(meta?.minWidth || 40, Math.round(orig.width * scaleX)),
              height: Math.max(meta?.minHeight || 28, Math.round(orig.height * scaleY)),
            };
          }),
        }));
      }
    };

    const handleWindowMouseUp = () => {
      const sess = sessionRef.current;
      if (!sess) return;

      if (
        sess.hasMoved &&
        (sess.kind === "move" ||
          sess.kind === "resize" ||
          sess.kind === "group_resize" ||
          sess.kind === "guide")
      ) {
        const snapshotBefore = {
          ...deepClone(configRef.current),
          elements: sess.initialElements,
        };
        setHistory((h) => ({
          past: [...h.past.slice(-(MAX_HISTORY - 1)), snapshotBefore],
          future: [],
        }));
      }

      sessionRef.current = null;
      setMarqueeRect(null);
      setSnapGuides({ x: [], y: [] });
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [clientToCanvas, computeSmartSnap, snapScalar, zoom]);

  // ── Ctrl + Wheel Precision Zoom on Viewport ────────────────────────────────
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        setZoom((z) => Math.min(5, Math.max(0.25, Number((z * factor).toFixed(2)))));
      }
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [mode]);

  // ── Comprehensive Studio Keyboard Shortcuts ────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        Boolean(target) &&
        (target!.tagName === "INPUT" ||
          target!.tagName === "TEXTAREA" ||
          target!.tagName === "SELECT" ||
          target!.isContentEditable);

      if (isTyping || inlineEditId || showJsonModal) return;

      if (e.code === "Space" && !spacePressed) {
        e.preventDefault();
        setSpacePressed(true);
        return;
      }

      if (e.key === "?" || e.key === "F1") {
        e.preventDefault();
        setShowShortcutsModal((v) => !v);
        return;
      }

      const mod = e.ctrlKey || e.metaKey;

      if (!mod && !e.altKey) {
        if (e.key === "v" || e.key === "V") {
          setActiveTool("select");
          return;
        }
        if (e.key === "h" || e.key === "H") {
          setActiveTool("pan");
          return;
        }
        if (e.key === "Escape") {
          setSelectedIds([]);
          setContextMenu(null);
          setPresetsOpen(false);
          return;
        }
      }

      if (mod && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (mod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (mod && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setSelectedIds(config.elements.filter((el) => !el.hidden).map((el) => el.id));
        return;
      }
      if (mod && e.shiftKey && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        const cur = new Set(selectedIds);
        setSelectedIds(
          config.elements.filter((el) => !el.hidden && !cur.has(el.id)).map((el) => el.id),
        );
        return;
      }
      if (mod && (e.key === "c" || e.key === "C") && selectedIds.length > 0) {
        e.preventDefault();
        const set = new Set(selectedIds);
        setClipboard(deepClone(config.elements.filter((el) => set.has(el.id))));
        toast.info(`${selectedIds.length} item(ns) copiado(s).`);
        return;
      }
      if (mod && (e.key === "x" || e.key === "X") && selectedIds.length > 0) {
        e.preventDefault();
        const set = new Set(selectedIds);
        setClipboard(deepClone(config.elements.filter((el) => set.has(el.id))));
        handleDeleteSelected();
        return;
      }
      if (mod && (e.key === "v" || e.key === "V") && clipboard.length > 0) {
        e.preventDefault();
        handlePasteAt();
        return;
      }
      if (mod && (e.key === "d" || e.key === "D") && selectedIds.length > 0) {
        e.preventDefault();
        handleDuplicateSelected();
        return;
      }
      if (mod && (e.key === "g" || e.key === "G")) {
        e.preventDefault();
        if (e.shiftKey) handleUngroup();
        else handleGroup();
        return;
      }
      if (mod && (e.key === "l" || e.key === "L") && selectedIds.length > 0) {
        e.preventDefault();
        const idSet = new Set(selectedIds);
        const allLocked = config.elements
          .filter((el) => idSet.has(el.id))
          .every((el) => el.locked);
        updateConfig((prev) => ({
          ...prev,
          elements: prev.elements.map((el) =>
            idSet.has(el.id) ? { ...el, locked: !allLocked } : el,
          ),
        }));
        return;
      }
      if (mod && (e.key === "]" || e.key === "[")) {
        e.preventDefault();
        handleMoveLayer(e.key === "]" ? "UP" : "DOWN", e.altKey);
        return;
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        fitZoomToViewport();
        return;
      }
      if (mod && e.key === "1") {
        e.preventDefault();
        setZoom(1);
        return;
      }
      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoom((z) => Math.min(5, Number((z + 0.15).toFixed(2))));
        return;
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(0.25, Number((z - 0.15).toFixed(2))));
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      if (
        selectedIds.length > 0 &&
        (e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown")
      ) {
        e.preventDefault();
        const baseStep = e.altKey ? 1 : e.shiftKey ? (config.snapGrid || 8) * 2 : config.snapGrid || 8;
        const dx = e.key === "ArrowLeft" ? -baseStep : e.key === "ArrowRight" ? baseStep : 0;
        const dy = e.key === "ArrowUp" ? -baseStep : e.key === "ArrowDown" ? baseStep : 0;
        const idSet = new Set(selectedIds);
        updateConfig((prev) => ({
          ...prev,
          elements: prev.elements.map((el) =>
            idSet.has(el.id) && !el.locked
              ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) }
              : el,
          ),
        }));
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpacePressed(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [
    clipboard.length,
    config.elements,
    config.snapGrid,
    fitZoomToViewport,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleGroup,
    handleMoveLayer,
    handlePasteAt,
    handleRedo,
    handleUndo,
    handleUngroup,
    inlineEditId,
    selectedIds,
    showJsonModal,
    spacePressed,
    updateConfig,
  ]);

  // ── Export / Import Helpers ────────────────────────────────────────────────
  const generatedTsx = useMemo(
    () => generateTsxCode(config, codeExportMode),
    [config, codeExportMode],
  );

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.exportName || "lopes-ui-layout"}.canvas.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Layout JSON exportado!");
  };

  const handleDownloadTsx = () => {
    const blob = new Blob([generatedTsx], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.exportName || "LopesScreenPage"}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Componente React (.tsx) baixado!");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown;
        const normalized = normalizeCanvasConfig(parsed, config);
        updateConfig(() => normalized);
        setSelectedIds([]);
        toast.success(`Layout "${normalized.title}" importado com sucesso!`);
      } catch {
        toast.error("Arquivo JSON inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Ruler Ticks Generator ──────────────────────────────────────────────────
  const xRulerTicks = useMemo(() => {
    const total = config.width + CANVAS_PAD * 2;
    const ticks: { pos: number; major: boolean; medium: boolean }[] = [];
    for (let px = 0; px <= total; px += 10) {
      ticks.push({ pos: px, major: px % 100 === 0, medium: px % 50 === 0 });
    }
    return ticks;
  }, [config.width]);

  const yRulerTicks = useMemo(() => {
    const total = effectiveHeight + CANVAS_PAD * 2;
    const ticks: { pos: number; major: boolean; medium: boolean }[] = [];
    for (let py = 0; py <= total; py += 10) {
      ticks.push({ pos: py, major: py % 100 === 0, medium: py % 50 === 0 });
    }
    return ticks;
  }, [effectiveHeight]);

  const isPanMode = activeTool === "pan" || spacePressed;
  const artboardBgCls =
    config.background === "white"
      ? "bg-white dark:bg-zinc-900"
      : config.background === "zinc"
        ? "bg-zinc-100 dark:bg-zinc-950"
        : config.background === "transparent"
          ? "bg-[repeating-conic-gradient(#e4e4e7_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]"
          : "bg-slate-50 dark:bg-zinc-950";

  return (
    <div
      onClick={() => {
        if (contextMenu) setContextMenu(null);
      }}
      className={cn(
        "flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden",
        isFullscreen ? "fixed inset-0 z-[500]" : "h-[calc(100vh-4rem)] w-full",
      )}
    >
      {/* Hidden JSON File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJsonFile}
        className="hidden"
      />

      {/* ═════════════════════════════════════════════════════════════════════
          1. TOP STUDIO HEADER (DocumentStudioModal Style)
         ═════════════════════════════════════════════════════════════════════ */}
      <header className="h-13 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 flex items-center justify-between gap-3 select-none">
        {/* Left: Studio Identity + Editable Title + Templates Trigger */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <LayoutDashboard size={16} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={config.title}
                onChange={(e) =>
                  updateConfig((prev) => ({ ...prev, title: e.target.value }), false)
                }
                aria-label="Título da tela no UI Studio"
                className="max-w-[230px] sm:max-w-[300px] truncate rounded px-1 py-0.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="hidden xl:inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                {config.route}
              </span>
            </div>
          </div>

          {/* Templates / Presets Dropdown Button */}
          <button
            ref={presetsBtnRef}
            type="button"
            onClick={() => {
              const rect = presetsBtnRef.current?.getBoundingClientRect();
              if (rect) {
                setPresetsPos({ top: rect.bottom + 6, left: Math.max(12, rect.left) });
              }
              setPresetsOpen((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors duration-150 cursor-pointer shrink-0"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Center: Spring Animated Mode Switcher */}
        <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/90 p-1 gap-0.5 shrink-0">
          {(
            [
              { id: "canvas", label: "Canvas 2D", icon: MousePointer2 },
              { id: "preview", label: "Preview Interativo", icon: Play },
              { id: "code", label: "Código TSX", icon: Code2 },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMode(item.id);
                  setInlineEditId(null);
                }}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer",
                  active
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="ui-studio-mode-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-white dark:bg-zinc-900 shadow-xs"
                  />
                )}
                <Icon size={13} className={cn("relative z-10", active && "text-indigo-500")} />
                <span className="relative z-10 hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: AST JSON, Import/Export, Sidebars & Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Braces size={13} />}
            tooltip="Editar AST JSON do Layout 2D"
            onClick={() => setShowJsonModal(true)}
          >
            <span className="hidden lg:inline">AST JSON</span>
          </Button>

          <button
            type="button"
            title="Importar arquivo .json"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors duration-150"
          >
            <Upload size={14} />
          </button>

          <button
            type="button"
            title="Exportar arquivo .json"
            onClick={handleDownloadJson}
            className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors duration-150"
          >
            <FileJson size={14} />
          </button>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {mode === "canvas" && (
            <>
              <button
                type="button"
                title={showLeftCatalog ? "Ocultar Catálogo" : "Mostrar Catálogo"}
                onClick={() => setShowLeftCatalog((v) => !v)}
                className={cn(
                  "h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors duration-150",
                  showLeftCatalog
                    ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
              >
                <PanelLeft size={14} />
              </button>
              <button
                type="button"
                title={showRightInspector ? "Ocultar Inspetor" : "Mostrar Inspetor"}
                onClick={() => setShowRightInspector((v) => !v)}
                className={cn(
                  "h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors duration-150",
                  showRightInspector
                    ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
              >
                <PanelRight size={14} />
              </button>
            </>
          )}

          <button
            type="button"
            title={isFullscreen ? "Sair da Tela Cheia" : "Expandir Estúdio em Tela Cheia"}
            onClick={() => setIsFullscreen((v) => !v)}
            className={cn(
              "h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors duration-150",
              isFullscreen
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            )}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Presets Portal Menu */}
      {presetsOpen &&
        presetsPos &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[6400]"
              onClick={() => setPresetsOpen(false)}
            />
            <div
              style={{ top: presetsPos.top, left: presetsPos.left }}
              className="fixed z-[6500] w-96 max-w-[calc(100vw-24px)] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-2 space-y-1"
            >
              <div className="px-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Templates 2D — Lopes UI Studio
                </span>
                <Badge label={`${STUDIO_PRESETS.length} telas`} variant="primary" size="xs" />
              </div>
              {STUDIO_PRESETS.map((preset) => {
                const IconComp = resolveIcon(preset.iconName);
                const isCurrent = config.title === preset.config.title;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateConfig(() => deepClone(preset.config));
                      setSelectedIds([]);
                      setPresetsOpen(false);
                      toast.success(`Template "${preset.name}" carregado!`);
                    }}
                    className={cn(
                      "w-full text-left rounded-xl p-2.5 flex items-start gap-2.5 transition-colors duration-150 cursor-pointer",
                      isCurrent
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 ring-1 ring-indigo-300 dark:ring-indigo-800"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
                    )}
                  >
                    <span className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComp size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {preset.name}
                        </span>
                        <Badge label={preset.badge} variant="info" size="xs" />
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}

      {/* ═════════════════════════════════════════════════════════════════════
          2. SECONDARY CAD PRECISION TOOLBAR (Canvas 2D Mode)
         ═════════════════════════════════════════════════════════════════════ */}
      {mode === "canvas" && (
        <div className="h-10 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 px-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar select-none">
          {/* Left: History, Layers Panel, Tool Switcher & Quick Primitives */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={history.past.length === 0}
              onClick={handleUndo}
              title={`Desfazer (Ctrl+Z) · ${history.past.length} ações`}
              className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 disabled:opacity-35 cursor-pointer"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              disabled={history.future.length === 0}
              onClick={handleRedo}
              title={`Refazer (Ctrl+Y) · ${history.future.length} ações`}
              className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 disabled:opacity-35 cursor-pointer"
            >
              <Redo2 size={13} />
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

            {/* Tool Switcher: Select (V) vs Hand Pan (H) */}
            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
              <button
                type="button"
                title="Ferramenta Seleção e Laço (V)"
                onClick={() => setActiveTool("select")}
                className={cn(
                  "h-6 w-6 rounded flex items-center justify-center cursor-pointer",
                  !isPanMode
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                )}
              >
                <MousePointer2 size={12} />
              </button>
              <button
                type="button"
                title="Ferramenta Mão / Panorâmica (H ou Espaço)"
                onClick={() => setActiveTool("pan")}
                className={cn(
                  "h-6 w-6 rounded flex items-center justify-center cursor-pointer",
                  isPanMode
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                )}
              >
                <Hand size={12} />
              </button>
            </div>

            {/* Floating Layers Outline Toggle */}
            <button
              type="button"
              onClick={() => setShowFloatingLayers((v) => !v)}
              className={cn(
                "h-7 rounded-md border px-2 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors duration-150",
                showFloatingLayers
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400",
              )}
            >
              <Layers size={12} />
              <span>Camadas</span>
              <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 text-[10px] font-mono">
                {config.elements.length}
              </span>
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden xl:block" />

            {/* Quick-Add Primitives Strip */}
            <div className="hidden xl:flex items-center gap-1">
              {QUICK_PRIMITIVES.map((qp) => {
                const QIcon = resolveIcon(qp.icon);
                return (
                  <button
                    key={qp.type}
                    type="button"
                    title={`Inserir ${CATALOG_BY_TYPE[qp.type].label}`}
                    onClick={() => handleAddComponentAt(qp.type)}
                    className="h-7 rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors duration-150"
                  >
                    <QIcon size={11} />
                    <span>{qp.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center/Right: Contextual Selection Bar + Grid/Wireframe/Zoom */}
          <div className="flex items-center gap-1.5 shrink-0">
            <AnimatePresence initial={false}>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1 rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/80 dark:bg-sky-950/40 px-2 py-0.5"
                >
                  <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 pr-1">
                    {selectedIds.length} sel.
                  </span>
                  <button
                    type="button"
                    title="Alinhar à Esquerda"
                    onClick={() => handleAlign("left")}
                    className="h-6 w-6 rounded hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300 cursor-pointer"
                  >
                    <AlignStartVertical size={12} />
                  </button>
                  <button
                    type="button"
                    title="Centralizar Horizontalmente"
                    onClick={() => handleAlign("center")}
                    className="h-6 w-6 rounded hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300 cursor-pointer"
                  >
                    <AlignCenterVertical size={12} />
                  </button>
                  <button
                    type="button"
                    title="Alinhar à Direita"
                    onClick={() => handleAlign("right")}
                    className="h-6 w-6 rounded hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300 cursor-pointer"
                  >
                    <AlignEndVertical size={12} />
                  </button>
                  {selectedIds.length >= 3 && (
                    <button
                      type="button"
                      title="Distribuir Espaçamento Horizontal"
                      onClick={() => handleDistribute("H")}
                      className="h-6 w-6 rounded hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300 cursor-pointer"
                    >
                      <AlignHorizontalDistributeCenter size={12} />
                    </button>
                  )}
                  {selectedIds.length >= 2 && (
                    <button
                      type="button"
                      title="Agrupar (Ctrl+G)"
                      onClick={handleGroup}
                      className="h-6 w-6 rounded hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300 cursor-pointer"
                    >
                      <Group size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Duplicar (Ctrl+D)"
                    onClick={handleDuplicateSelected}
                    className="h-6 w-6 rounded hover:bg-sky-100 dark:hover:bg-sky-900/60 flex items-center justify-center text-sky-700 dark:text-sky-300 cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    title="Remover (Delete)"
                    onClick={handleDeleteSelected}
                    className="h-6 w-6 rounded hover:bg-rose-100 dark:hover:bg-rose-950 flex items-center justify-center text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wireframe Outlines Toggle */}
            <button
              type="button"
              title="Modo Raio-X / Wireframe & IDs RBAC"
              onClick={() => setShowWireframe((v) => !v)}
              className={cn(
                "h-7 rounded-md border px-2 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors duration-150",
                showWireframe
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300",
              )}
            >
              <Crosshair size={12} />
              <span className="hidden sm:inline">Raio-X</span>
            </button>

            {/* 12-Col Layout Grid Toggle */}
            <button
              type="button"
              title="Sobrepor Grade de 12 Colunas Responsiva"
              onClick={() =>
                updateConfig(
                  (prev) => ({
                    ...prev,
                    layoutGrid: { ...prev.layoutGrid, enabled: !prev.layoutGrid.enabled },
                  }),
                  false,
                )
              }
              className={cn(
                "h-7 rounded-md border px-2 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors duration-150",
                config.layoutGrid.enabled
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300",
              )}
            >
              <Columns3 size={12} />
              <span className="hidden sm:inline">12 Col</span>
            </button>

            {/* Snap Grid Cycle Button */}
            <button
              type="button"
              title="Alternar Passo da Grade Magnética (Snap)"
              onClick={() => {
                const cycle = [1, 4, 8, 16, 24];
                const next = cycle[(cycle.indexOf(config.snapGrid) + 1) % cycle.length] || 8;
                updateConfig((prev) => ({ ...prev, snapGrid: next }), false);
              }}
              className="h-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1 cursor-pointer hover:border-indigo-400"
            >
              <Grid3X3 size={12} className="text-indigo-500" />
              <span>{config.snapGrid}px</span>
            </button>

            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <button
                type="button"
                title="Reduzir Zoom (Ctrl -)"
                onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
                className="h-7 w-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <Minus size={12} />
              </button>
              <button
                type="button"
                title="Clique para ajustar à janela (Ctrl+0) · Duplo-clique para 100%"
                onClick={fitZoomToViewport}
                onDoubleClick={() => setZoom(1)}
                className="h-7 px-1.5 text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                title="Ampliar Zoom (Ctrl +)"
                onClick={() => setZoom((z) => Math.min(5, Number((z + 0.1).toFixed(2))))}
                className="h-7 w-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Shortcuts Reference Trigger */}
            <button
              type="button"
              title="Atalhos de Teclado (? ou F1)"
              onClick={() => setShowShortcutsModal(true)}
              className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-indigo-600 cursor-pointer"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          3. MAIN WORKSPACE AREA (CANVAS 2D | PREVIEW INTERATIVO | CÓDIGO TSX)
         ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* ─── MODE A: CANVAS 2D STUDIO ───────────────────────────────────── */}
        {mode === "canvas" && (
          <>
            {showLeftCatalog && (
              <UICatalogSidebar
                onAddComponent={(type) => handleAddComponentAt(type)}
                onAddCompositeBlock={handleAddCompositeBlock}
                onClose={() => setShowLeftCatalog(false)}
              />
            )}

            {/* Center 2D Viewport + Pixel Rulers */}
            <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
              {showFloatingLayers && (
                <UILayersPanel
                  elements={config.elements}
                  selectedIds={selectedIds}
                  onSelect={(id, additive) => {
                    const expanded = expandGroups(config.elements, [id]);
                    if (additive) {
                      setSelectedIds((prev) =>
                        prev.includes(id)
                          ? prev.filter((x) => !expanded.includes(x))
                          : Array.from(new Set([...prev, ...expanded])),
                      );
                    } else {
                      setSelectedIds(expanded);
                    }
                  }}
                  onToggleHidden={(id) =>
                    updateConfig((prev) => ({
                      ...prev,
                      elements: prev.elements.map((e) =>
                        e.id === id ? { ...e, hidden: !e.hidden } : e,
                      ),
                    }))
                  }
                  onToggleLocked={(id) =>
                    updateConfig((prev) => ({
                      ...prev,
                      elements: prev.elements.map((e) =>
                        e.id === id ? { ...e, locked: !e.locked } : e,
                      ),
                    }))
                  }
                  onRename={(id, nextName) =>
                    updateConfig((prev) => ({
                      ...prev,
                      elements: prev.elements.map((e) =>
                        e.id === id ? { ...e, name: nextName } : e,
                      ),
                    }))
                  }
                  onDelete={(id) => {
                    updateConfig((prev) => ({
                      ...prev,
                      elements: prev.elements.filter((e) => e.id !== id),
                    }));
                    setSelectedIds((prev) => prev.filter((x) => x !== id));
                  }}
                  onReorder={(fromIdx, toIdx) =>
                    updateConfig((prev) => ({
                      ...prev,
                      elements: reorderLayer(prev.elements, fromIdx, toIdx),
                    }))
                  }
                  onClose={() => setShowFloatingLayers(false)}
                />
              )}

              {/* Scrollable CAD Surface with Sticky X & Y Pixel Rulers */}
              <div
                ref={viewportRef}
                onMouseDown={(e) => {
                  if (e.button === 1 || (e.button === 0 && isPanMode)) {
                    e.preventDefault();
                    sessionRef.current = {
                      kind: "pan",
                      startClientX: e.clientX,
                      startClientY: e.clientY,
                      startCanvasX: 0,
                      startCanvasY: 0,
                      initialElements: config.elements,
                      scrollStartLeft: viewportRef.current?.scrollLeft || 0,
                      scrollStartTop: viewportRef.current?.scrollTop || 0,
                      hasMoved: false,
                    };
                    return;
                  }
                  if (e.target === e.currentTarget) {
                    setSelectedIds([]);
                    setInlineEditId(null);
                  }
                }}
                onMouseLeave={() => setMousePos(null)}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(161,161,170,0.35) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
                className={cn(
                  "flex-1 min-h-0 overflow-auto relative",
                  isPanMode ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                )}
              >
                {/* Sticky Top Row: Corner 'px' Box + Horizontal X Ruler */}
                <div className="sticky top-0 z-30 flex h-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800 select-none">
                  <div
                    style={{ width: RULER_SIZE, height: RULER_SIZE }}
                    className="sticky left-0 z-40 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-mono text-[9px] font-bold text-zinc-500"
                  >
                    px
                  </div>
                  <div
                    title="Arraste da régua superior para criar uma linha-guia horizontal ciano"
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      e.stopPropagation();
                      const pt = clientToCanvas(e.clientX, e.clientY);
                      const newIdx = config.guides.y.length;
                      setConfig((prev) => ({
                        ...prev,
                        guides: { ...prev.guides, y: [...prev.guides.y, Math.max(0, pt.y)] },
                      }));
                      sessionRef.current = {
                        kind: "guide",
                        guideAxis: "y",
                        guideIndex: newIdx,
                        startClientX: e.clientX,
                        startClientY: e.clientY,
                        startCanvasX: pt.x,
                        startCanvasY: pt.y,
                        initialElements: config.elements,
                        hasMoved: true,
                      };
                    }}
                    style={{ width: (config.width + CANVAS_PAD * 2) * zoom }}
                    className="relative h-full shrink-0 overflow-hidden cursor-row-resize"
                  >
                    {/* Selection Projection Band on X Ruler */}
                    {selectionBounds && (
                      <div
                        style={{
                          left: (CANVAS_PAD + selectionBounds.minX) * zoom,
                          width: Math.max(2, selectionBounds.width * zoom),
                        }}
                        className="absolute inset-y-0 bg-sky-500/20 border-x border-sky-500 pointer-events-none"
                      />
                    )}
                    {/* Tick Marks */}
                    {xRulerTicks.map((t) => {
                      const leftPx = (CANVAS_PAD + t.pos) * zoom;
                      return (
                        <div
                          key={t.pos}
                          style={{ left: leftPx }}
                          className="absolute bottom-0 pointer-events-none"
                        >
                          <div
                            className={cn(
                              "w-px bg-zinc-300 dark:bg-zinc-700",
                              t.major ? "h-3.5 bg-zinc-400 dark:bg-zinc-500" : t.medium ? "h-2" : "h-1",
                            )}
                          />
                          {t.major && zoom >= 0.45 && (
                            <span className="absolute -top-2.5 left-1 font-mono text-[9px] text-zinc-400">
                              {t.pos}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {/* Live Cursor Hairline on X Ruler */}
                    {mousePos && (
                      <div
                        style={{ left: (CANVAS_PAD + mousePos.x) * zoom }}
                        className="absolute inset-y-0 w-px bg-rose-500 pointer-events-none"
                      />
                    )}
                  </div>
                </div>

                {/* Body Row: Sticky Left Vertical Y Ruler + Scaled Artboard */}
                <div className="flex min-w-fit">
                  {/* Sticky Vertical Y Ruler */}
                  <div
                    title="Arraste da régua lateral para criar uma linha-guia vertical ciano"
                    onMouseDown={(e) => {
                      if (e.button !== 0) return;
                      e.stopPropagation();
                      const pt = clientToCanvas(e.clientX, e.clientY);
                      const newIdx = config.guides.x.length;
                      setConfig((prev) => ({
                        ...prev,
                        guides: { ...prev.guides, x: [...prev.guides.x, Math.max(0, pt.x)] },
                      }));
                      sessionRef.current = {
                        kind: "guide",
                        guideAxis: "x",
                        guideIndex: newIdx,
                        startClientX: e.clientX,
                        startClientY: e.clientY,
                        startCanvasX: pt.x,
                        startCanvasY: pt.y,
                        initialElements: config.elements,
                        hasMoved: true,
                      };
                    }}
                    style={{
                      width: RULER_SIZE,
                      height: (effectiveHeight + CANVAS_PAD * 2) * zoom,
                    }}
                    className="sticky left-0 z-20 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs overflow-hidden select-none cursor-col-resize"
                  >
                    {/* Selection Projection Band on Y Ruler */}
                    {selectionBounds && (
                      <div
                        style={{
                          top: (CANVAS_PAD + selectionBounds.minY) * zoom,
                          height: Math.max(2, selectionBounds.height * zoom),
                        }}
                        className="absolute inset-x-0 bg-sky-500/20 border-y border-sky-500 pointer-events-none"
                      />
                    )}
                    {yRulerTicks.map((t) => {
                      const topPx = (CANVAS_PAD + t.pos) * zoom;
                      return (
                        <div
                          key={t.pos}
                          style={{ top: topPx }}
                          className="absolute right-0 pointer-events-none"
                        >
                          <div
                            className={cn(
                              "h-px bg-zinc-300 dark:bg-zinc-700",
                              t.major ? "w-3.5 bg-zinc-400 dark:bg-zinc-500" : t.medium ? "w-2" : "w-1",
                            )}
                          />
                          {t.major && zoom >= 0.45 && (
                            <span className="absolute right-1.5 -top-3 font-mono text-[8px] text-zinc-400">
                              {t.pos}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {/* Live Cursor Hairline on Y Ruler */}
                    {mousePos && (
                      <div
                        style={{ top: (CANVAS_PAD + mousePos.y) * zoom }}
                        className="absolute inset-x-0 h-px bg-rose-500 pointer-events-none"
                      />
                    )}
                  </div>

                  {/* Scroll-Safe Zoom Sizing Envelope */}
                  <div
                    style={{
                      width: (config.width + CANVAS_PAD * 2) * zoom,
                      height: (effectiveHeight + CANVAS_PAD * 2) * zoom,
                    }}
                    className="relative shrink-0"
                  >
                    <div
                      style={{
                        padding: CANVAS_PAD,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                        width: config.width + CANVAS_PAD * 2,
                        height: effectiveHeight + CANVAS_PAD * 2,
                      }}
                    >
                      {/* Optional Simulated ERP App Shell Frame */}
                      {config.showShellChrome && (
                        <div
                          style={{ width: config.width }}
                          className="mb-1 rounded-t-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-900 text-zinc-200 px-4 py-2 flex items-center justify-between text-xs pointer-events-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="ml-2 font-semibold text-white">
                              Lopes UI — Workspace Corporativo
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-zinc-400">{config.route}</span>
                        </div>
                      )}

                      {/* ═══ THE 2D ARTBOARD SURFACE ═══ */}
                      <div
                        ref={artboardRef}
                        onMouseMove={(e) => {
                          setMousePos(clientToCanvas(e.clientX, e.clientY));
                        }}
                        onMouseDown={(e) => {
                          if (isPanMode || e.button !== 0) return;
                          if (e.target === e.currentTarget) {
                            const pt = clientToCanvas(e.clientX, e.clientY);
                            if (!e.shiftKey) setSelectedIds([]);
                            setInlineEditId(null);
                            setContextMenu(null);
                            sessionRef.current = {
                              kind: "marquee",
                              startClientX: e.clientX,
                              startClientY: e.clientY,
                              startCanvasX: pt.x,
                              startCanvasY: pt.y,
                              initialElements: deepClone(config.elements),
                              hasMoved: false,
                            };
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const pt = clientToCanvas(e.clientX, e.clientY);
                          setContextMenu({
                            clientX: e.clientX,
                            clientY: e.clientY,
                            canvasX: pt.x,
                            canvasY: pt.y,
                            targetId: null,
                          });
                        }}
                        onDragOver={(e) => {
                          if (e.dataTransfer.types.includes(DND_COMPONENT_MIME)) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                            const pt = clientToCanvas(e.clientX, e.clientY);
                            setMousePos(pt);
                            setDropPreview({
                              x: snapScalar(Math.max(0, pt.x - 100)),
                              y: snapScalar(Math.max(0, pt.y - 24)),
                              width: 240,
                              height: 68,
                              label: `Soltar em (${snapScalar(Math.max(0, pt.x - 100))}, ${snapScalar(Math.max(0, pt.y - 24))})`,
                            });
                          }
                        }}
                        onDragLeave={() => setDropPreview(null)}
                        onDrop={(e) => {
                          const rawType = e.dataTransfer.getData(DND_COMPONENT_MIME) as UIComponentType;
                          setDropPreview(null);
                          if (!rawType || !(rawType in CATALOG_BY_TYPE)) return;
                          e.preventDefault();
                          const pt = clientToCanvas(e.clientX, e.clientY);
                          const entry = CATALOG_BY_TYPE[rawType];
                          handleAddComponentAt(
                            rawType,
                            Math.max(0, pt.x - Math.min(120, Math.round(entry.defaultWidth / 3))),
                            Math.max(0, pt.y - 24),
                          );
                        }}
                        style={{
                          width: config.width,
                          height: effectiveHeight,
                        }}
                        className={cn(
                          "relative rounded-xl shadow-xl ring-1 ring-zinc-300/90 dark:ring-zinc-800 transition-shadow",
                          artboardBgCls,
                        )}
                      >
                        {/* Artboard Dimension Label Above Top-Left */}
                        <div className="absolute -top-6 left-0 flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pointer-events-none select-none">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {config.title}
                          </span>
                          <span>·</span>
                          <span>
                            {config.width} × {effectiveHeight} px
                          </span>
                        </div>

                        {/* 12-Column Responsive Layout Grid Overlay */}
                        {config.layoutGrid.enabled && (
                          <div
                            style={{
                              left: config.marginLeft,
                              right: config.marginRight,
                              top: 0,
                              bottom: 0,
                              gap: config.layoutGrid.gutter,
                              gridTemplateColumns: `repeat(${config.layoutGrid.columns}, minmax(0, 1fr))`,
                            }}
                            className="absolute grid pointer-events-none z-[1]"
                          >
                            {Array.from({ length: config.layoutGrid.columns }).map((_, colIdx) => (
                              <div
                                key={colIdx}
                                className="h-full bg-rose-500/[0.05] dark:bg-rose-400/[0.06] border-x border-rose-400/20"
                              />
                            ))}
                          </div>
                        )}

                        {/* Dashed Usable Margin Guides */}
                        {config.showMargins &&
                          (config.marginLeft > 0 ||
                            config.marginRight > 0 ||
                            config.marginTop > 0 ||
                            config.marginBottom > 0) && (
                            <div
                              style={{
                                left: config.marginLeft,
                                top: config.marginTop,
                                right: config.marginRight,
                                bottom: config.marginBottom,
                              }}
                              className="absolute border border-dashed border-sky-400/50 dark:border-sky-500/35 pointer-events-none z-[2]"
                            />
                          )}

                        {/* Fold Indicator when elements expand past initial artboard height */}
                        {effectiveHeight > config.height && (
                          <div
                            style={{ top: config.height }}
                            className="absolute inset-x-0 border-t border-dashed border-amber-400/80 pointer-events-none z-[3]"
                          >
                            <span className="absolute right-2 -top-4 rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 font-mono text-[9px] text-amber-700 dark:text-amber-300">
                              Dobra inicial ({config.height}px)
                            </span>
                          </div>
                        )}

                        {/* Empty Artboard Onboarding Prompt */}
                        {config.elements.filter((e) => !e.hidden).length === 0 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 text-center">
                            <div className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 px-8 py-10 max-w-md space-y-2">
                              <Sparkles size={24} className="mx-auto text-indigo-500" />
                              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                Prancheta 2D Pronta ({config.width}×{config.height}px)
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Arraste componentes da biblioteca à esquerda para qualquer coordenada{" "}
                                <code className="font-mono">(X, Y)</code>, insira Seções Compostas ou clique com o botão direito na prancheta.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ═══ RENDER ALL VISIBLE 2D ELEMENTS ═══ */}
                        {config.elements.map((el, zIdx) => {
                          if (el.hidden) return null;
                          const isSelected = selectedIds.includes(el.id);
                          const isSingleSelected = isSelected && selectedIds.length === 1;
                          const isHovered = hoveredId === el.id && !isSelected;

                          return (
                            <div
                              key={el.id}
                              style={{
                                left: el.x,
                                top: el.y,
                                width: el.width,
                                height: el.height,
                                zIndex: 10 + zIdx,
                              }}
                              onMouseEnter={() => setHoveredId(el.id)}
                              onMouseLeave={() =>
                                setHoveredId((prev) => (prev === el.id ? null : prev))
                              }
                              onMouseDown={(e) => {
                                if (isPanMode || e.button !== 0) return;

                                // Locked background container passthrough -> allows marquee selection inside locked frames!
                                if (el.locked && el.type === "container_panel" && !e.shiftKey) {
                                  e.stopPropagation();
                                  const pt = clientToCanvas(e.clientX, e.clientY);
                                  setSelectedIds([]);
                                  sessionRef.current = {
                                    kind: "marquee",
                                    startClientX: e.clientX,
                                    startClientY: e.clientY,
                                    startCanvasX: pt.x,
                                    startCanvasY: pt.y,
                                    initialElements: deepClone(config.elements),
                                    hasMoved: false,
                                  };
                                  return;
                                }

                                e.stopPropagation();
                                setContextMenu(null);
                                if (inlineEditId && inlineEditId !== el.id) {
                                  setInlineEditId(null);
                                }

                                const groupExpanded = expandGroups(config.elements, [el.id]);
                                let nextSelection: string[];

                                if (e.shiftKey) {
                                  nextSelection = isSelected
                                    ? selectedIds.filter((id) => !groupExpanded.includes(id))
                                    : Array.from(new Set([...selectedIds, ...groupExpanded]));
                                  setSelectedIds(nextSelection);
                                  return;
                                }

                                nextSelection = isSelected ? selectedIds : groupExpanded;
                                setSelectedIds(nextSelection);

                                if (el.locked) return;

                                const bounds = getSelectionBounds(config.elements, nextSelection);
                                const pt = clientToCanvas(e.clientX, e.clientY);
                                sessionRef.current = {
                                  kind: "move",
                                  startClientX: e.clientX,
                                  startClientY: e.clientY,
                                  startCanvasX: pt.x,
                                  startCanvasY: pt.y,
                                  targetIds: nextSelection,
                                  initialElements: deepClone(config.elements),
                                  initialBounds: bounds || {
                                    minX: el.x,
                                    minY: el.y,
                                    width: el.width,
                                    height: el.height,
                                  },
                                  hasMoved: false,
                                };
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (el.locked) return;
                                if (getEditablePrimaryPropKey(el.type)) {
                                  setInlineEditId(el.id);
                                }
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const expanded = expandGroups(config.elements, [el.id]);
                                if (!selectedIds.includes(el.id)) {
                                  setSelectedIds(expanded);
                                }
                                const pt = clientToCanvas(e.clientX, e.clientY);
                                setContextMenu({
                                  clientX: e.clientX,
                                  clientY: e.clientY,
                                  canvasX: pt.x,
                                  canvasY: pt.y,
                                  targetId: el.id,
                                });
                              }}
                              className={cn(
                                "absolute group/el",
                                !isPanMode && (el.locked ? "cursor-default" : "cursor-move"),
                                isSelected &&
                                  (el.locked
                                    ? "ring-2 ring-amber-500"
                                    : "ring-2 ring-indigo-500"),
                                isHovered && "ring-1 ring-indigo-400/80",
                                showWireframe &&
                                  !isSelected &&
                                  "outline-1 outline-dashed outline-indigo-400/60",
                              )}
                            >
                              {/* Render Actual Lopes UI Component */}
                              <ElementRenderer
                                element={el}
                                interactive={false}
                                isInlineEditing={inlineEditId === el.id}
                                onCommitInlineText={(nextVal) => {
                                  const key = getEditablePrimaryPropKey(el.type);
                                  if (key) {
                                    updateConfig((prev) => ({
                                      ...prev,
                                      elements: prev.elements.map((item) =>
                                        item.id === el.id
                                          ? { ...item, props: { ...item.props, [key]: nextVal } }
                                          : item,
                                      ),
                                    }));
                                  }
                                  setInlineEditId(null);
                                }}
                                onCancelInlineEdit={() => setInlineEditId(null)}
                              />

                              {/* X-Ray Wireframe RBAC Tag */}
                              {showWireframe && (
                                <div className="absolute left-1 top-1 z-30 rounded bg-indigo-950/85 px-1.5 py-0.5 font-mono text-[9px] text-indigo-200 pointer-events-none">
                                  {el.componentId || el.type}
                                </div>
                              )}

                              {/* Single Selection Floating Coordinate Pill & 8-Way Resize Handles */}
                              {isSingleSelected && (
                                <>
                                  <div
                                    className={cn(
                                      "absolute -top-6 left-0 z-40 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm whitespace-nowrap pointer-events-none flex items-center gap-1.5",
                                      el.locked ? "bg-amber-600" : "bg-indigo-600",
                                    )}
                                  >
                                    {el.locked && <Lock size={9} />}
                                    <span>{el.name}</span>
                                    <span className="opacity-80">
                                      · {el.x},{el.y} · {el.width}×{el.height}
                                    </span>
                                  </div>

                                  {!el.locked &&
                                    RESIZE_HANDLES.map((h) => (
                                      <div
                                        key={h.dir}
                                        style={{ cursor: h.cursor }}
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          const pt = clientToCanvas(e.clientX, e.clientY);
                                          sessionRef.current = {
                                            kind: "resize",
                                            resizeDir: h.dir,
                                            startClientX: e.clientX,
                                            startClientY: e.clientY,
                                            startCanvasX: pt.x,
                                            startCanvasY: pt.y,
                                            targetIds: [el.id],
                                            initialElements: deepClone(config.elements),
                                            hasMoved: false,
                                          };
                                        }}
                                        className={cn(
                                          "absolute z-50 h-3 w-3 rounded-xs border-2 border-indigo-600 bg-white shadow-xs hover:scale-125 transition-transform",
                                          h.posCls,
                                        )}
                                      />
                                    ))}
                                </>
                              )}
                            </div>
                          );
                        })}

                        {/* ═══ MULTI-SELECTION GROUP BOUNDING BOX + 4-CORNER PROPORTIONAL RESIZE + FLOATING BAR ═══ */}
                        {selectedIds.length >= 2 && selectionBounds && (
                          <div
                            style={{
                              left: selectionBounds.minX,
                              top: selectionBounds.minY,
                              width: selectionBounds.width,
                              height: selectionBounds.height,
                            }}
                            className="absolute z-[950] border-2 border-dashed border-sky-500 bg-sky-500/[0.03] pointer-events-none"
                          >
                            {/* Floating Dark Quick-Action Toolbar Above Group */}
                            <div
                              onMouseDown={(e) => e.stopPropagation()}
                              className="pointer-events-auto absolute -top-10 left-0 flex items-center gap-1 rounded-xl bg-zinc-900 text-white px-2.5 py-1 shadow-xl border border-zinc-700 whitespace-nowrap"
                            >
                              <span className="text-[10px] font-mono font-bold text-sky-400 pr-1">
                                {selectedIds.length} itens · {selectionBounds.width}×{selectionBounds.height}
                              </span>
                              <button
                                type="button"
                                title="Alinhar Topo"
                                onClick={() => handleAlign("top")}
                                className="h-6 w-6 rounded hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                              >
                                <AlignStartHorizontal size={12} />
                              </button>
                              <button
                                type="button"
                                title="Centralizar Vertical"
                                onClick={() => handleAlign("middle")}
                                className="h-6 w-6 rounded hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                              >
                                <AlignCenterHorizontal size={12} />
                              </button>
                              <button
                                type="button"
                                title="Alinhar Base"
                                onClick={() => handleAlign("bottom")}
                                className="h-6 w-6 rounded hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                              >
                                <AlignEndHorizontal size={12} />
                              </button>
                              <button
                                type="button"
                                title="Auto-Organizar em Linha (Gap 16px)"
                                onClick={() => handleAutoArrange("row", 16, false)}
                                className="h-6 px-1.5 rounded hover:bg-zinc-800 text-[10px] font-semibold text-indigo-300 cursor-pointer"
                              >
                                Auto-Linha
                              </button>
                              <div className="h-3.5 w-px bg-zinc-700 mx-0.5" />
                              <button
                                type="button"
                                title="Agrupar (Ctrl+G)"
                                onClick={handleGroup}
                                className="h-6 w-6 rounded hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                              >
                                <Group size={12} />
                              </button>
                              <button
                                type="button"
                                title="Desagrupar (Ctrl+Shift+G)"
                                onClick={handleUngroup}
                                className="h-6 w-6 rounded hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                              >
                                <Ungroup size={12} />
                              </button>
                              <button
                                type="button"
                                title="Duplicar Lote"
                                onClick={handleDuplicateSelected}
                                className="h-6 w-6 rounded hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                type="button"
                                title="Excluir Lote"
                                onClick={handleDeleteSelected}
                                className="h-6 w-6 rounded hover:bg-rose-900/70 text-rose-400 flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* 4-Corner Proportional Group Resize Handles */}
                            {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                              const posCls =
                                corner === "nw"
                                  ? "-left-1.5 -top-1.5 cursor-nwse-resize"
                                  : corner === "ne"
                                    ? "-right-1.5 -top-1.5 cursor-nesw-resize"
                                    : corner === "sw"
                                      ? "-left-1.5 -bottom-1.5 cursor-nesw-resize"
                                      : "-right-1.5 -bottom-1.5 cursor-nwse-resize";
                              return (
                                <div
                                  key={corner}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const pt = clientToCanvas(e.clientX, e.clientY);
                                    sessionRef.current = {
                                      kind: "group_resize",
                                      resizeDir: corner,
                                      startClientX: e.clientX,
                                      startClientY: e.clientY,
                                      startCanvasX: pt.x,
                                      startCanvasY: pt.y,
                                      targetIds: selectedIds,
                                      initialElements: deepClone(config.elements),
                                      initialBounds: {
                                        minX: selectionBounds.minX,
                                        minY: selectionBounds.minY,
                                        width: selectionBounds.width,
                                        height: selectionBounds.height,
                                      },
                                      hasMoved: false,
                                    };
                                  }}
                                  className={cn(
                                    "pointer-events-auto absolute h-3.5 w-3.5 rounded-full border-2 border-sky-600 bg-white shadow-sm",
                                    posCls,
                                  )}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Fixed Draggable Cyan Ruler Guides */}
                        {config.guides.x.map((gx, idx) => (
                          <div
                            key={`guide_x_${idx}`}
                            style={{ left: gx }}
                            title={`Guia X = ${gx}px (arraste para mover · duplo-clique para remover)`}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const pt = clientToCanvas(e.clientX, e.clientY);
                              sessionRef.current = {
                                kind: "guide",
                                guideAxis: "x",
                                guideIndex: idx,
                                startClientX: e.clientX,
                                startClientY: e.clientY,
                                startCanvasX: pt.x,
                                startCanvasY: pt.y,
                                initialElements: config.elements,
                                hasMoved: false,
                              };
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              updateConfig((prev) => ({
                                ...prev,
                                guides: {
                                  ...prev.guides,
                                  x: prev.guides.x.filter((_, i) => i !== idx),
                                },
                              }));
                            }}
                            className="absolute inset-y-0 z-[960] w-px bg-cyan-500 cursor-col-resize before:absolute before:-inset-x-1.5 before:inset-y-0"
                          >
                            <span className="absolute top-1 left-1 rounded bg-cyan-600 px-1 font-mono text-[9px] text-white pointer-events-none">
                              X:{gx}
                            </span>
                          </div>
                        ))}
                        {config.guides.y.map((gy, idx) => (
                          <div
                            key={`guide_y_${idx}`}
                            style={{ top: gy }}
                            title={`Guia Y = ${gy}px (arraste para mover · duplo-clique para remover)`}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const pt = clientToCanvas(e.clientX, e.clientY);
                              sessionRef.current = {
                                kind: "guide",
                                guideAxis: "y",
                                guideIndex: idx,
                                startClientX: e.clientX,
                                startClientY: e.clientY,
                                startCanvasX: pt.x,
                                startCanvasY: pt.y,
                                initialElements: config.elements,
                                hasMoved: false,
                              };
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              updateConfig((prev) => ({
                                ...prev,
                                guides: {
                                  ...prev.guides,
                                  y: prev.guides.y.filter((_, i) => i !== idx),
                                },
                              }));
                            }}
                            className="absolute inset-x-0 z-[960] h-px bg-cyan-500 cursor-row-resize before:absolute before:-inset-y-1.5 before:inset-x-0"
                          >
                            <span className="absolute left-1 -top-4 rounded bg-cyan-600 px-1 font-mono text-[9px] text-white pointer-events-none">
                              Y:{gy}
                            </span>
                          </div>
                        ))}

                        {/* Dynamic Smart Rose Magnetic Snap Guides */}
                        {snapGuides.x.map((sx, i) => (
                          <div
                            key={`snap_x_${i}`}
                            style={{ left: sx }}
                            className="absolute inset-y-0 z-[970] border-l border-dashed border-rose-500 pointer-events-none"
                          />
                        ))}
                        {snapGuides.y.map((sy, i) => (
                          <div
                            key={`snap_y_${i}`}
                            style={{ top: sy }}
                            className="absolute inset-x-0 z-[970] border-t border-dashed border-rose-500 pointer-events-none"
                          />
                        ))}

                        {/* Catalog Drag-and-Drop Ghost Coordinate Preview */}
                        {dropPreview && (
                          <div
                            style={{
                              left: dropPreview.x,
                              top: dropPreview.y,
                              width: dropPreview.width,
                              height: dropPreview.height,
                            }}
                            className="absolute z-[980] rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-500/10 flex items-center justify-center font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300 pointer-events-none"
                          >
                            {dropPreview.label}
                          </div>
                        )}

                        {/* Marquee / Lasso Box */}
                        {marqueeRect && (
                          <div
                            style={{
                              left: marqueeRect.x,
                              top: marqueeRect.y,
                              width: marqueeRect.width,
                              height: marqueeRect.height,
                            }}
                            className="absolute z-[990] border border-indigo-500 bg-indigo-500/15 pointer-events-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Precision Status Bar */}
              <footer className="h-7 shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 select-none">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    {isPanMode ? <Hand size={11} /> : <MousePointer2 size={11} />}
                    <span>{isPanMode ? "Panorâmica" : "Seleção 2D"}</span>
                  </span>
                  <span className="font-mono">
                    X: <strong>{mousePos?.x ?? "—"}</strong> · Y:{" "}
                    <strong>{mousePos?.y ?? "—"}</strong> px
                  </span>
                  <span className="hidden md:inline font-mono">
                    Prancheta: {config.width}×{effectiveHeight}px
                  </span>
                  {selectionBounds && (
                    <span className="hidden lg:inline font-mono text-indigo-600 dark:text-indigo-400">
                      Seleção: {selectionBounds.width}×{selectionBounds.height}px
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-medium">
                    ● Salvo automaticamente
                  </span>
                  <span className="font-mono">Snap {config.snapGrid}px</span>
                  <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </footer>
            </div>

            {showRightInspector && (
              <UIBuilderInspector
                config={config}
                selectedIds={selectedIds}
                onUpdateConfig={updateConfig}
                onSelectIds={setSelectedIds}
                onAlign={handleAlign}
                onDistribute={handleDistribute}
                onMatchSize={handleMatchSize}
                onAutoArrange={handleAutoArrange}
                onGroup={handleGroup}
                onUngroup={handleUngroup}
                onDuplicateSelected={handleDuplicateSelected}
                onDeleteSelected={handleDeleteSelected}
                onMoveLayer={handleMoveLayer}
                onClearCanvas={() => setShowClearConfirm(true)}
                onClose={() => setShowRightInspector(false)}
              />
            )}
          </>
        )}

        {/* ─── MODE B: INTERACTIVE LIVE PREVIEW (DocumentCanvasPreview Style) ─── */}
        {mode === "preview" && (
          <div className="flex-1 min-h-0 flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
            {/* Preview Sub-Toolbar */}
            <div className="h-10 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 flex items-center justify-between gap-2 select-none">
              <div className="flex items-center gap-2 text-xs">
                <StatusBadge
                  label="Preview Interativo Ao Vivo"
                  tone="success"
                  size="xs"
                  dot
                  pulse
                />
                <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">
                  Todos os campos, abas, filtros, tabelas ordenáveis, modais e drawers respondem em tempo real.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
                  className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <ZoomOut size={13} />
                </button>
                {ZOOM_STEPS.filter((s) => s >= 0.5 && s <= 1.5).map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setZoom(step)}
                    className={cn(
                      "hidden md:inline-flex h-7 items-center rounded-md px-2 font-mono text-[11px] cursor-pointer",
                      Math.abs(zoom - step) < 0.03
                        ? "bg-indigo-600 text-white font-bold"
                        : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    )}
                  >
                    {Math.round(step * 100)}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                  className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <ZoomIn size={13} />
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RotateCcw size={12} />}
                  onClick={() => setZoom(1)}
                >
                  100%
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-6 flex justify-center">
              <div
                style={{
                  width: config.width * zoom,
                  height: effectiveHeight * zoom,
                }}
                className="relative shrink-0"
              >
                <div
                  style={{
                    width: config.width,
                    height: effectiveHeight,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                  className={cn(
                    "relative rounded-2xl shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden",
                    artboardBgCls,
                  )}
                >
                  {config.elements.map((el, zIdx) => {
                    if (el.hidden) return null;
                    return (
                      <div
                        key={el.id}
                        style={{
                          left: el.x,
                          top: el.y,
                          width: el.width,
                          height: el.height,
                          zIndex: 10 + zIdx,
                        }}
                        className="absolute"
                      >
                        <ElementRenderer element={el} interactive />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODE C: PRODUCTION TSX CODE GENERATOR ──────────────────────── */}
        {mode === "code" && (
          <div className="flex-1 min-h-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 p-4 gap-3 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                  Estratégia de Layout TSX:
                </span>
                <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCodeExportMode("responsive")}
                    className={cn(
                      "rounded-md px-3 py-1 transition-colors duration-150 cursor-pointer",
                      codeExportMode === "responsive"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                    )}
                  >
                    Auto-Grid 12 Colunas Responsivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeExportMode("canvas2d")}
                    className={cn(
                      "rounded-md px-3 py-1 transition-colors duration-150 cursor-pointer",
                      codeExportMode === "canvas2d"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                    )}
                  >
                    Canvas 2D Pixel-Perfect (X, Y)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Copy size={13} />}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTsx);
                    toast.success("Código TSX copiado para a área de transferência!");
                  }}
                >
                  Copiar TSX
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Download size={13} />}
                  onClick={handleDownloadTsx}
                >
                  Baixar {config.exportName || "Page"}.tsx
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <CodeEditor
                value={generatedTsx}
                readOnly
                language="typescript"
                allowLanguageChange={false}
                title={`app${config.route}/page.tsx — ${config.elements.filter((e) => !e.hidden).length} componentes Lopes UI`}
                filename={`${config.exportName || "LopesScreenPage"}.tsx`}
                height="100%"
                showToolbar
                showStatusBar
                showLineNumbers
                showCopy
                showSearch
              />
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          4. RIGHT-CLICK CONTEXT MENU PORTAL (Element & Empty Artboard)
         ═════════════════════════════════════════════════════════════════════ */}
      {contextMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              left: Math.min(contextMenu.clientX, window.innerWidth - 248),
              top: Math.min(contextMenu.clientY, window.innerHeight - 340),
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed z-[6600] w-60 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-1.5 text-xs select-none"
          >
            {contextMenu.targetId ? (
              <>
                {(() => {
                  const targetEl = config.elements.find((e) => e.id === contextMenu.targetId);
                  if (!targetEl) return null;
                  const canEditInline = Boolean(getEditablePrimaryPropKey(targetEl.type));
                  return (
                    <>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        {targetEl.name}
                      </div>
                      {canEditInline && !targetEl.locked && (
                        <button
                          type="button"
                          onClick={() => {
                            setInlineEditId(targetEl.id);
                            setContextMenu(null);
                          }}
                          className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Edit3 size={13} className="text-indigo-500" />
                            Editar Texto Inline
                          </span>
                          <span className="text-[10px] text-zinc-400">2×Clique</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleDuplicateSelected();
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Copy size={13} />
                          Duplicar
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">Ctrl+D</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const set = new Set(selectedIds);
                          setClipboard(deepClone(config.elements.filter((el) => set.has(el.id))));
                          handleDeleteSelected();
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Scissors size={13} />
                          Recortar
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">Ctrl+X</span>
                      </button>

                      {selectedIds.length >= 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            handleGroup();
                            setContextMenu(null);
                          }}
                          className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Group size={13} />
                            Agrupar Seleção
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">Ctrl+G</span>
                        </button>
                      )}
                      {targetEl.groupId && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUngroup();
                            setContextMenu(null);
                          }}
                          className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Ungroup size={13} />
                            Desagrupar
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">Ctrl+⇧+G</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                      <button
                        type="button"
                        onClick={() => {
                          handleMoveLayer("UP", true);
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <span>Trazer para a Frente</span>
                        <span className="font-mono text-[10px] text-zinc-400">Ctrl+Alt+]</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleMoveLayer("DOWN", true);
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <span>Enviar para Trás</span>
                        <span className="font-mono text-[10px] text-zinc-400">Ctrl+Alt+[</span>
                      </button>

                      <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                      <button
                        type="button"
                        onClick={() => {
                          updateConfig((prev) => ({
                            ...prev,
                            elements: prev.elements.map((el) =>
                              el.id === targetEl.id ? { ...el, locked: !el.locked } : el,
                            ),
                          }));
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {targetEl.locked ? <Unlock size={13} /> : <Lock size={13} />}
                        <span>{targetEl.locked ? "Desbloquear Camada" : "Bloquear Camada"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig((prev) => ({
                            ...prev,
                            elements: prev.elements.map((el) =>
                              el.id === targetEl.id ? { ...el, hidden: true } : el,
                            ),
                          }));
                          setSelectedIds((prev) => prev.filter((id) => id !== targetEl.id));
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <EyeOff size={13} />
                        <span>Ocultar Camada</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteSelected();
                          setContextMenu(null);
                        }}
                        className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 size={13} />
                          Excluir
                        </span>
                        <span className="font-mono text-[10px]">Del</span>
                      </button>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  Prancheta ({contextMenu.canvasX}, {contextMenu.canvasY} px)
                </div>
                {clipboard.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      handlePasteAt(contextMenu.canvasX, contextMenu.canvasY);
                      setContextMenu(null);
                    }}
                    className="w-full rounded-lg px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Check size={13} />
                      Colar Aqui ({clipboard.length})
                    </span>
                    <span className="font-mono text-[10px]">Ctrl+V</span>
                  </button>
                )}

                <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Inserir nesta coordenada
                </div>
                {QUICK_PRIMITIVES.slice(0, 6).map((qp) => {
                  const QIcon = resolveIcon(qp.icon);
                  return (
                    <button
                      key={qp.type}
                      type="button"
                      onClick={() => {
                        handleAddComponentAt(qp.type, contextMenu.canvasX, contextMenu.canvasY);
                        setContextMenu(null);
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <QIcon size={13} className="text-indigo-500" />
                      <span>{CATALOG_BY_TYPE[qp.type].label}</span>
                    </button>
                  );
                })}

                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                <button
                  type="button"
                  onClick={() => {
                    updateConfig((prev) => ({
                      ...prev,
                      guides: {
                        ...prev.guides,
                        x: [...prev.guides.x, Math.max(0, contextMenu.canvasX)],
                      },
                    }));
                    setContextMenu(null);
                  }}
                  className="w-full rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <span>+ Guia Vertical X = {contextMenu.canvasX}px</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateConfig((prev) => ({
                      ...prev,
                      guides: {
                        ...prev.guides,
                        y: [...prev.guides.y, Math.max(0, contextMenu.canvasY)],
                      },
                    }));
                    setContextMenu(null);
                  }}
                  className="w-full rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <span>+ Guia Horizontal Y = {contextMenu.canvasY}px</span>
                </button>
              </>
            )}
          </div>,
          document.body,
        )}

      {/* ═════════════════════════════════════════════════════════════════════
          5. MODALS: AST JSON EDITOR, SHORTCUTS & CLEAR CONFIRMATION
         ═════════════════════════════════════════════════════════════════════ */}
      <UIJsonEditorModal
        open={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        config={config}
        onApply={(nextCfg) => {
          updateConfig(() => nextCfg);
          setSelectedIds([]);
        }}
      />

      <UIShortcutsModal
        open={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        variant="danger"
        title="Limpar todos os elementos da prancheta?"
        description="Esta ação removerá os elementos atuais do Canvas 2D (você ainda poderá desfazer com Ctrl+Z)."
        confirmLabel="Sim, limpar prancheta"
        cancelLabel="Cancelar"
        onConfirm={() => {
          updateConfig((prev) => ({ ...prev, elements: [] }));
          setSelectedIds([]);
          setShowClearConfirm(false);
          toast.info("Prancheta limpa (Ctrl+Z para desfazer).");
        }}
      />
    </div>
  );
}

/**
 * Hydration-safe wrapper using useSyncExternalStore so client localStorage state
 * initializes cleanly without SSR mismatches or synchronous setState-in-effect.
 */
export default function UIBuilderStudio() {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  if (!isClient) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-zinc-100 dark:bg-zinc-950 animate-pulse">
        <div className="h-13 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" />
        <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80" />
        <div className="flex-1 flex">
          <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:block" />
          <div className="flex-1 p-8">
            <div className="h-full w-full rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden lg:block" />
        </div>
      </div>
    );
  }

  return <UIBuilderStudioCore />;
}
