import type { UICanvasConfig, UICanvasElement } from "./types";

let runtimeCounter = 1000;

export function newElementId(prefix = "el"): string {
  runtimeCounter += 1;
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 6)
    : `${Date.now().toString(36).slice(-4)}${runtimeCounter.toString(36)}`;
  return `${prefix}_${rand}`;
}

export function newGroupId(): string {
  return newElementId("grp");
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Expands selection IDs so any element belonging to a group includes all siblings of that group.
 */
export function expandGroups(elements: UICanvasElement[], ids: string[]): string[] {
  const idSet = new Set(ids);
  const groupIds = new Set<string>();
  for (const el of elements) {
    if (idSet.has(el.id) && el.groupId) {
      groupIds.add(el.groupId);
    }
  }
  if (groupIds.size === 0) return ids;
  const expanded = new Set(ids);
  for (const el of elements) {
    if (el.groupId && groupIds.has(el.groupId) && !el.hidden) {
      expanded.add(el.id);
    }
  }
  return Array.from(expanded);
}

export interface SelectionBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export function getSelectionBounds(
  elements: UICanvasElement[],
  selectedIds: string[],
): SelectionBounds | null {
  if (selectedIds.length === 0) return null;
  const idSet = new Set(selectedIds);
  const selected = elements.filter((el) => idSet.has(el.id) && !el.hidden);
  if (selected.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of selected) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: Math.round(minX + width / 2),
    centerY: Math.round(minY + height / 2),
  };
}

/**
 * Clones elements preserving internal group relationships under fresh groupIds.
 */
export function cloneElements(
  items: UICanvasElement[],
  offsetX = 16,
  offsetY = 16,
): UICanvasElement[] {
  const groupMap = new Map<string, string>();
  return items.map((el) => {
    let nextGroupId: string | undefined;
    if (el.groupId) {
      if (!groupMap.has(el.groupId)) {
        groupMap.set(el.groupId, newGroupId());
      }
      nextGroupId = groupMap.get(el.groupId);
    }
    const clonedProps = deepClone(el.props);
    const clonedStyle = el.style ? deepClone(el.style) : undefined;
    return {
      ...el,
      id: newElementId("ui"),
      name: el.name.endsWith(" (Cópia)") ? el.name : `${el.name} (Cópia)`,
      x: Math.max(0, Math.round(el.x + offsetX)),
      y: Math.max(0, Math.round(el.y + offsetY)),
      locked: false,
      groupId: nextGroupId,
      props: clonedProps,
      style: clonedStyle,
    };
  });
}

export type AlignMode = "left" | "center" | "right" | "top" | "middle" | "bottom";

export function alignElements(
  elements: UICanvasElement[],
  selectedIds: string[],
  mode: AlignMode,
  artboardUsable?: { left: number; top: number; right: number; bottom: number },
  forceArtboard = false,
): UICanvasElement[] {
  const idSet = new Set(selectedIds);
  const targets = elements.filter((el) => idSet.has(el.id) && !el.locked && !el.hidden);
  if (targets.length === 0) return elements;

  const useArtboard = (targets.length === 1 || forceArtboard) && Boolean(artboardUsable);
  const minX = useArtboard && artboardUsable
    ? artboardUsable.left
    : Math.min(...targets.map((e) => e.x));
  const maxX = useArtboard && artboardUsable
    ? artboardUsable.right
    : Math.max(...targets.map((e) => e.x + e.width));
  const minY = useArtboard && artboardUsable
    ? artboardUsable.top
    : Math.min(...targets.map((e) => e.y));
  const maxY = useArtboard && artboardUsable
    ? artboardUsable.bottom
    : Math.max(...targets.map((e) => e.y + e.height));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return elements.map((el) => {
    if (!idSet.has(el.id) || el.locked || el.hidden) return el;
    switch (mode) {
      case "left":
        return { ...el, x: Math.round(minX) };
      case "center":
        return { ...el, x: Math.round(centerX - el.width / 2) };
      case "right":
        return { ...el, x: Math.round(maxX - el.width) };
      case "top":
        return { ...el, y: Math.round(minY) };
      case "middle":
        return { ...el, y: Math.round(centerY - el.height / 2) };
      case "bottom":
        return { ...el, y: Math.round(maxY - el.height) };
      default:
        return el;
    }
  });
}

export function distributeElements(
  elements: UICanvasElement[],
  selectedIds: string[],
  axis: "H" | "V",
): UICanvasElement[] {
  const idSet = new Set(selectedIds);
  const targets = elements.filter((el) => idSet.has(el.id) && !el.locked && !el.hidden);
  if (targets.length < 3) return elements;

  if (axis === "H") {
    const sorted = [...targets].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const maxRight = Math.max(...sorted.map((s) => s.x + s.width));
    const totalWidths = sorted.reduce((acc, s) => acc + s.width, 0);
    const gap = (maxRight - minX - totalWidths) / (sorted.length - 1);
    const nextX = new Map<string, number>();
    let cursor = minX;
    for (const item of sorted) {
      nextX.set(item.id, Math.round(cursor));
      cursor += item.width + gap;
    }
    return elements.map((el) => (nextX.has(el.id) ? { ...el, x: nextX.get(el.id)! } : el));
  }

  const sorted = [...targets].sort((a, b) => a.y - b.y);
  const minY = sorted[0].y;
  const maxBottom = Math.max(...sorted.map((s) => s.y + s.height));
  const totalHeights = sorted.reduce((acc, s) => acc + s.height, 0);
  const gap = (maxBottom - minY - totalHeights) / (sorted.length - 1);
  const nextY = new Map<string, number>();
  let cursor = minY;
  for (const item of sorted) {
    nextY.set(item.id, Math.round(cursor));
    cursor += item.height + gap;
  }
  return elements.map((el) => (nextY.has(el.id) ? { ...el, y: nextY.get(el.id)! } : el));
}

export function matchElementSize(
  elements: UICanvasElement[],
  selectedIds: string[],
  dim: "W" | "H" | "BOTH",
): UICanvasElement[] {
  if (selectedIds.length < 2) return elements;
  const ref = elements.find((el) => el.id === selectedIds[0]);
  if (!ref) return elements;
  const idSet = new Set(selectedIds);
  return elements.map((el) => {
    if (!idSet.has(el.id) || el.id === ref.id || el.locked) return el;
    return {
      ...el,
      width: dim === "W" || dim === "BOTH" ? ref.width : el.width,
      height: dim === "H" || dim === "BOTH" ? ref.height : el.height,
    };
  });
}

/**
 * Arranges selected elements into a clean horizontal row or vertical stack with uniform gap.
 */
export function autoArrangeElements(
  elements: UICanvasElement[],
  selectedIds: string[],
  direction: "row" | "column",
  gap = 16,
  options?: { equalizeSize?: boolean; rowWidth?: number; startX?: number; startY?: number },
): UICanvasElement[] {
  const idSet = new Set(selectedIds);
  const targets = elements.filter((el) => idSet.has(el.id) && !el.locked && !el.hidden);
  if (targets.length < 2) return elements;

  if (direction === "row") {
    const sorted = [...targets].sort((a, b) => a.x - b.x || a.y - b.y);
    const originX = options?.startX ?? Math.min(...sorted.map((e) => e.x));
    const originY = options?.startY ?? Math.min(...sorted.map((e) => e.y));
    const uniformWidth =
      options?.equalizeSize && options?.rowWidth
        ? Math.max(80, Math.floor((options.rowWidth - gap * (sorted.length - 1)) / sorted.length))
        : undefined;
    const uniformHeight = options?.equalizeSize ? sorted[0].height : undefined;

    let cursorX = originX;
    const updates = new Map<string, Partial<UICanvasElement>>();
    for (const item of sorted) {
      const w = uniformWidth ?? item.width;
      const h = uniformHeight ?? item.height;
      updates.set(item.id, { x: Math.round(cursorX), y: Math.round(originY), width: w, height: h });
      cursorX += w + gap;
    }
    return elements.map((el) => (updates.has(el.id) ? { ...el, ...updates.get(el.id)! } : el));
  }

  const sorted = [...targets].sort((a, b) => a.y - b.y || a.x - b.x);
  const originX = options?.startX ?? Math.min(...sorted.map((e) => e.x));
  const originY = options?.startY ?? Math.min(...sorted.map((e) => e.y));
  const uniformWidth = options?.equalizeSize
    ? options?.rowWidth ?? Math.max(...sorted.map((e) => e.width))
    : undefined;

  let cursorY = originY;
  const updates = new Map<string, Partial<UICanvasElement>>();
  for (const item of sorted) {
    const w = uniformWidth ?? item.width;
    updates.set(item.id, { x: Math.round(originX), y: Math.round(cursorY), width: w });
    cursorY += item.height + gap;
  }
  return elements.map((el) => (updates.has(el.id) ? { ...el, ...updates.get(el.id)! } : el));
}

export function moveLayer(
  elements: UICanvasElement[],
  selectedIds: string[],
  dir: "UP" | "DOWN",
  extreme = false,
): UICanvasElement[] {
  if (selectedIds.length === 0) return elements;
  const idSet = new Set(selectedIds);
  const arr = [...elements];

  if (extreme) {
    const selected = arr.filter((el) => idSet.has(el.id));
    const others = arr.filter((el) => !idSet.has(el.id));
    return dir === "UP" ? [...others, ...selected] : [...selected, ...others];
  }

  if (dir === "UP") {
    for (let i = arr.length - 2; i >= 0; i--) {
      if (idSet.has(arr[i].id) && !idSet.has(arr[i + 1].id)) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
  } else {
    for (let i = 1; i < arr.length; i++) {
      if (idSet.has(arr[i].id) && !idSet.has(arr[i - 1].id)) {
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
      }
    }
  }
  return arr;
}

export function reorderLayer(
  elements: UICanvasElement[],
  fromIndex: number,
  toIndex: number,
): UICanvasElement[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= elements.length ||
    toIndex >= elements.length
  ) {
    return elements;
  }
  const arr = [...elements];
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  return arr;
}

export function groupElements(
  elements: UICanvasElement[],
  selectedIds: string[],
): { elements: UICanvasElement[]; groupId: string | null } {
  if (selectedIds.length < 2) return { elements, groupId: null };
  const gid = newGroupId();
  const idSet = new Set(selectedIds);
  return {
    groupId: gid,
    elements: elements.map((el) => (idSet.has(el.id) ? { ...el, groupId: gid } : el)),
  };
}

export function ungroupElements(
  elements: UICanvasElement[],
  selectedIds: string[],
): UICanvasElement[] {
  const idSet = new Set(selectedIds);
  const groupIds = new Set<string>();
  for (const el of elements) {
    if (idSet.has(el.id) && el.groupId) groupIds.add(el.groupId);
  }
  return elements.map((el) =>
    idSet.has(el.id) || (el.groupId && groupIds.has(el.groupId))
      ? { ...el, groupId: undefined }
      : el,
  );
}

/**
 * Safely normalizes an external JSON AST payload into a valid UICanvasConfig.
 */
export function normalizeCanvasConfig(
  raw: unknown,
  fallback: UICanvasConfig,
): UICanvasConfig {
  if (!raw || typeof raw !== "object") return deepClone(fallback);
  const obj = raw as Record<string, unknown>;
  const rawElements = Array.isArray(obj.elements) ? obj.elements : fallback.elements;

  const elements: UICanvasElement[] = rawElements
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item, idx) => ({
      id: typeof item.id === "string" && item.id.trim() ? item.id : `ui_imp_${idx + 1}`,
      type: (typeof item.type === "string" ? item.type : "card") as UICanvasElement["type"],
      name: typeof item.name === "string" && item.name.trim() ? item.name : `Elemento ${idx + 1}`,
      componentId: typeof item.componentId === "string" ? item.componentId : undefined,
      x: typeof item.x === "number" && Number.isFinite(item.x) ? Math.round(item.x) : 24,
      y: typeof item.y === "number" && Number.isFinite(item.y) ? Math.round(item.y) : 24 + idx * 40,
      width: typeof item.width === "number" && item.width >= 24 ? Math.round(item.width) : 320,
      height: typeof item.height === "number" && item.height >= 16 ? Math.round(item.height) : 120,
      locked: Boolean(item.locked),
      hidden: Boolean(item.hidden),
      groupId: typeof item.groupId === "string" ? item.groupId : undefined,
      props:
        item.props && typeof item.props === "object" && !Array.isArray(item.props)
          ? (item.props as Record<string, unknown>)
          : {},
      style:
        item.style && typeof item.style === "object" && !Array.isArray(item.style)
          ? (item.style as UICanvasElement["style"])
          : undefined,
    }));

  const rawGrid =
    obj.layoutGrid && typeof obj.layoutGrid === "object"
      ? (obj.layoutGrid as Record<string, unknown>)
      : {};
  const rawGuides =
    obj.guides && typeof obj.guides === "object"
      ? (obj.guides as Record<string, unknown>)
      : {};

  return {
    version: "2.0",
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title : fallback.title,
    route: typeof obj.route === "string" && obj.route.trim() ? obj.route : fallback.route,
    exportName:
      typeof obj.exportName === "string" && obj.exportName.trim()
        ? obj.exportName
        : fallback.exportName,
    componentIdPrefix:
      typeof obj.componentIdPrefix === "string"
        ? obj.componentIdPrefix
        : fallback.componentIdPrefix,
    preset: (typeof obj.preset === "string" ? obj.preset : fallback.preset) as UICanvasConfig["preset"],
    width:
      typeof obj.width === "number" && obj.width >= 320 && obj.width <= 3840
        ? Math.round(obj.width)
        : fallback.width,
    height:
      typeof obj.height === "number" && obj.height >= 240 && obj.height <= 6000
        ? Math.round(obj.height)
        : fallback.height,
    marginTop: typeof obj.marginTop === "number" ? Math.max(0, Math.round(obj.marginTop)) : fallback.marginTop,
    marginBottom: typeof obj.marginBottom === "number" ? Math.max(0, Math.round(obj.marginBottom)) : fallback.marginBottom,
    marginLeft: typeof obj.marginLeft === "number" ? Math.max(0, Math.round(obj.marginLeft)) : fallback.marginLeft,
    marginRight: typeof obj.marginRight === "number" ? Math.max(0, Math.round(obj.marginRight)) : fallback.marginRight,
    showMargins: typeof obj.showMargins === "boolean" ? obj.showMargins : fallback.showMargins,
    snapGrid: typeof obj.snapGrid === "number" && obj.snapGrid >= 1 ? Math.round(obj.snapGrid) : fallback.snapGrid,
    layoutGrid: {
      enabled: typeof rawGrid.enabled === "boolean" ? rawGrid.enabled : fallback.layoutGrid.enabled,
      columns: typeof rawGrid.columns === "number" && rawGrid.columns >= 1 ? Math.min(24, Math.round(rawGrid.columns)) : 12,
      gutter: typeof rawGrid.gutter === "number" && rawGrid.gutter >= 0 ? Math.min(64, Math.round(rawGrid.gutter)) : 16,
    },
    guides: {
      x: Array.isArray(rawGuides.x)
        ? rawGuides.x.filter((n): n is number => typeof n === "number" && Number.isFinite(n))
        : [],
      y: Array.isArray(rawGuides.y)
        ? rawGuides.y.filter((n): n is number => typeof n === "number" && Number.isFinite(n))
        : [],
    },
    background:
      obj.background === "slate" ||
      obj.background === "white" ||
      obj.background === "zinc" ||
      obj.background === "transparent"
        ? obj.background
        : fallback.background,
    showShellChrome:
      typeof obj.showShellChrome === "boolean" ? obj.showShellChrome : fallback.showShellChrome,
    elements,
  };
}
