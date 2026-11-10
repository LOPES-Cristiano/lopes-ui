"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Compass, Locate, Minus, Plus, RotateCcw } from "lucide-react";
import type * as maplibreglType from "maplibre-gl";
import { cn } from "../utils/cn";
import { useAccessControl } from "./useAccessControl";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MapTheme = "voyager" | "positron" | "dark";

export const MAP_STYLES: Record<MapTheme, string> = {
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

export type MapFlyToOptions = {
  center: [number, number];
  zoom?: number;
  duration?: number;
  pitch?: number;
  bearing?: number;
};

export type MapBounds = [[number, number], [number, number]];

export type MapProps = {
  /** Initial / active center as [longitude, latitude] */
  center?: [number, number];
  /** Initial / active zoom level */
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  bearing?: number;
  /** Basemap theme (Carto vector/raster GL styles, zero API key required) */
  theme?: MapTheme;
  /** Custom MapLibre style URL override */
  styleUrl?: string;
  /** Custom MapLibre web worker URL override (defaults to /maplibre-gl-worker.mjs) */
  workerUrl?: string;
  /** Optional bounding box [[west, south], [east, north]] to fit when no flyTo target is active */
  bounds?: MapBounds | null;
  /** Padding in px around `bounds` when fitting */
  boundsPadding?: number;
  /** Declarative camera flyTo target (e.g. selected store coordinates) */
  flyToOptions?: MapFlyToOptions | null;
  /** Disable animations when user prefers reduced motion */
  reducedMotion?: boolean;
  /** Rendered when WebGL is unsupported or unavailable */
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  ariaLabel?: string;
  className?: string;
  children?: React.ReactNode;
  componentId?: string;
  hideIfDenied?: boolean;
};

export type MapMarkerProps = {
  longitude: number;
  latitude: number;
  anchor?: "bottom" | "center" | "top" | "left" | "right";
  offset?: [number, number];
  zIndex?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export type MapControlsProps = {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showReset?: boolean;
  onReset?: () => void;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  resetLabel?: string;
  locateLabel?: string;
  compassLabel?: string;
  className?: string;
};

// ── WebGL detection ───────────────────────────────────────────────────────────

export function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

type MapLibreNS = typeof maplibreglType;
type MapLibreInstance = maplibreglType.Map;

type MapContextValue = {
  map: MapLibreInstance | null;
  maplibregl: MapLibreNS | null;
  isLoaded: boolean;
  resetView: () => void;
};

const MapContext = createContext<MapContextValue>({
  map: null,
  maplibregl: null,
  isLoaded: false,
  resetView: () => {},
});

export function useMap() {
  return useContext(MapContext);
}

// ── Map (Root Component) ──────────────────────────────────────────────────────

export function Map({
  center = [-62.5, -6.5],
  zoom = 4.8,
  minZoom = 3,
  maxZoom = 18,
  pitch = 0,
  bearing = 0,
  theme = "voyager",
  styleUrl,
  workerUrl = "/maplibre-gl-worker.mjs",
  bounds = null,
  boundsPadding = 48,
  flyToOptions = null,
  reducedMotion = false,
  fallback = null,
  onLoad,
  onError,
  ariaLabel = "Mapa interativo",
  className,
  children,
  componentId,
  hideIfDenied = true,
}: MapProps) {
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreInstance | null>(null);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
  }, [onLoad, onError]);

  const [ctxState, setCtxState] = useState<{
    map: MapLibreInstance | null;
    maplibregl: MapLibreNS | null;
    isLoaded: boolean;
  }>({
    map: null,
    maplibregl: null,
    isLoaded: false,
  });

  const [failed, setFailed] = useState(false);

  const resolvedStyle = styleUrl ?? MAP_STYLES[theme] ?? MAP_STYLES.voyager;

  // Primitive keys to avoid re-running camera transitions on parent re-renders
  const flyLng = flyToOptions?.center?.[0] ?? null;
  const flyLat = flyToOptions?.center?.[1] ?? null;
  const flyZoom = flyToOptions?.zoom ?? null;
  const flyDuration = flyToOptions?.duration;
  const flyPitch = flyToOptions?.pitch;
  const flyBearing = flyToOptions?.bearing;

  const boundsWest = bounds?.[0]?.[0] ?? null;
  const boundsSouth = bounds?.[0]?.[1] ?? null;
  const boundsEast = bounds?.[1]?.[0] ?? null;
  const boundsNorth = bounds?.[1]?.[1] ?? null;

  const centerLng = center[0];
  const centerLat = center[1];

  const initialPropsRef = useRef({
    centerLng,
    centerLat,
    zoom,
    minZoom,
    maxZoom,
    pitch,
    bearing,
    resolvedStyle,
    workerUrl,
    flyLng,
    flyLat,
    flyZoom,
    boundsWest,
    boundsSouth,
    boundsEast,
    boundsNorth,
    boundsPadding,
  });

  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const dur = reducedMotion ? 0 : 750;
    if (
      boundsWest !== null &&
      boundsSouth !== null &&
      boundsEast !== null &&
      boundsNorth !== null
    ) {
      try {
        map.fitBounds(
          [
            [boundsWest, boundsSouth],
            [boundsEast, boundsNorth],
          ],
          { padding: boundsPadding, maxZoom: 12.5, duration: dur, essential: true }
        );
      } catch {
        // ignore fitBounds on zero-sized container
      }
    } else {
      map.flyTo({
        center: [centerLng, centerLat],
        zoom,
        pitch,
        bearing,
        duration: dur,
        essential: true,
      });
    }
  }, [
    boundsWest,
    boundsSouth,
    boundsEast,
    boundsNorth,
    boundsPadding,
    centerLng,
    centerLat,
    zoom,
    pitch,
    bearing,
    reducedMotion,
  ]);

  // Initialize MapLibre instance on client
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!isWebGLSupported()) {
      queueMicrotask(() => {
        setFailed(true);
        onErrorRef.current?.();
      });
      return;
    }

    let cancelled = false;
    let instance: MapLibreInstance | null = null;
    let ro: ResizeObserver | null = null;

    import("maplibre-gl")
      .then((mod) => {
        if (cancelled || !containerRef.current) return;
        const maplibregl = ((mod as { default?: MapLibreNS }).default ?? mod) as MapLibreNS;
        const init = initialPropsRef.current;

        if (
          init.workerUrl &&
          typeof maplibregl.setWorkerUrl === "function" &&
          !maplibregl.getWorkerUrl?.()
        ) {
          maplibregl.setWorkerUrl(init.workerUrl);
        }

        const hasFly = init.flyLng !== null && init.flyLat !== null;
        const hasBounds =
          !hasFly &&
          init.boundsWest !== null &&
          init.boundsSouth !== null &&
          init.boundsEast !== null &&
          init.boundsNorth !== null;

        try {
          instance = new maplibregl.Map({
            container: containerRef.current,
            style: init.resolvedStyle,
            center: hasFly
              ? [init.flyLng as number, init.flyLat as number]
              : [init.centerLng, init.centerLat],
            zoom: hasFly ? (init.flyZoom ?? 13.5) : init.zoom,
            bounds: hasBounds
              ? [
                  [init.boundsWest as number, init.boundsSouth as number],
                  [init.boundsEast as number, init.boundsNorth as number],
                ]
              : undefined,
            fitBoundsOptions: hasBounds
              ? { padding: init.boundsPadding, maxZoom: 12.5 }
              : undefined,
            minZoom: init.minZoom,
            maxZoom: init.maxZoom,
            pitch: init.pitch,
            bearing: init.bearing,
            attributionControl: false,
          });
        } catch {
          if (!cancelled) {
            setFailed(true);
            onErrorRef.current?.();
          }
          return;
        }

        mapRef.current = instance;
        setCtxState({ map: instance, maplibregl, isLoaded: false });

        instance.on("load", () => {
          if (cancelled || !instance) return;
          setCtxState({ map: instance, maplibregl, isLoaded: true });
          onLoadRef.current?.();
        });

        instance.on("error", (ev: { error?: { message?: string } }) => {
          const msg = String(ev?.error?.message ?? "");
          if (/webgl|context/i.test(msg) && !cancelled) {
            setFailed(true);
            onErrorRef.current?.();
          }
        });

        if (typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(() => {
            try {
              instance?.resize();
            } catch {
              // ignore
            }
          });
          ro.observe(containerRef.current);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          onErrorRef.current?.();
        }
      });

    return () => {
      cancelled = true;
      ro?.disconnect();
      if (instance) {
        try {
          instance.remove();
        } catch {
          // ignore cleanup errors
        }
      }
      mapRef.current = null;
    };
  }, []);

  // Sync style changes after mount
  const prevStyleRef = useRef(resolvedStyle);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || prevStyleRef.current === resolvedStyle) return;
    prevStyleRef.current = resolvedStyle;
    try {
      map.setStyle(resolvedStyle);
    } catch {
      // ignore
    }
  }, [resolvedStyle]);

  // Declarative camera updates (flyToOptions > bounds > center/zoom)
  const didMountCameraRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!didMountCameraRef.current) {
      didMountCameraRef.current = true;
    }

    const dur = reducedMotion ? 0 : (flyDuration ?? 850);

    if (flyLng !== null && flyLat !== null) {
      try {
        map.flyTo({
          center: [flyLng, flyLat],
          zoom: flyZoom ?? 13.5,
          pitch: flyPitch ?? pitch,
          bearing: flyBearing ?? bearing,
          duration: dur,
          essential: true,
        });
      } catch {
        // ignore
      }
      return;
    }

    if (
      boundsWest !== null &&
      boundsSouth !== null &&
      boundsEast !== null &&
      boundsNorth !== null
    ) {
      try {
        map.fitBounds(
          [
            [boundsWest, boundsSouth],
            [boundsEast, boundsNorth],
          ],
          { padding: boundsPadding, maxZoom: 12.5, duration: dur, essential: true }
        );
      } catch {
        // ignore
      }
      return;
    }

    try {
      map.flyTo({
        center: [centerLng, centerLat],
        zoom,
        pitch,
        bearing,
        duration: dur,
        essential: true,
      });
    } catch {
      // ignore
    }
  }, [
    ctxState.map,
    flyLng,
    flyLat,
    flyZoom,
    flyDuration,
    flyPitch,
    flyBearing,
    boundsWest,
    boundsSouth,
    boundsEast,
    boundsNorth,
    boundsPadding,
    centerLng,
    centerLat,
    zoom,
    pitch,
    bearing,
    reducedMotion,
  ]);

  const contextValue = useMemo<MapContextValue>(
    () => ({
      map: ctxState.map,
      maplibregl: ctxState.maplibregl,
      isLoaded: ctxState.isLoaded,
      resetView,
    }),
    [ctxState.map, ctxState.maplibregl, ctxState.isLoaded, resetView]
  );

  if (!hasPermission && hideIfDenied) return null;

  if (failed && fallback) {
    return <>{fallback}</>;
  }

  return (
    <MapContext.Provider value={contextValue}>
      <div
        data-component-id={componentId}
        className={cn("relative isolate h-full w-full overflow-hidden", className)}
      >
        <div
          ref={containerRef}
          role="region"
          aria-label={ariaLabel}
          className="h-full w-full"
        />
        {children}
      </div>
    </MapContext.Provider>
  );
}

export const MapView = Map;

// ── MapMarker ─────────────────────────────────────────────────────────────────

export function MapMarker({
  longitude,
  latitude,
  anchor = "bottom",
  offset,
  zIndex,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  children,
}: MapMarkerProps) {
  const { map, maplibregl } = useMap();
  const markerRef = useRef<maplibreglType.Marker | null>(null);

  const [markerEl] = useState<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.createElement("div");
  });

  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave });
  useEffect(() => {
    callbacksRef.current = { onClick, onMouseEnter, onMouseLeave };
  }, [onClick, onMouseEnter, onMouseLeave]);

  const offsetX = offset?.[0] ?? 0;
  const offsetY = offset?.[1] ?? 0;

  useEffect(() => {
    if (!map || !maplibregl || !markerEl) return;

    const marker = new maplibregl.Marker({
      element: markerEl,
      anchor,
      offset: offsetX || offsetY ? [offsetX, offsetY] : undefined,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      try {
        marker.remove();
      } catch {
        // ignore
      }
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, maplibregl, markerEl, anchor, offsetX, offsetY]);

  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  useEffect(() => {
    if (!markerEl) return;
    markerEl.style.zIndex = zIndex !== undefined ? String(zIndex) : "";
    if (className) {
      markerEl.className = cn("maplibregl-marker", className);
    }
  }, [markerEl, zIndex, className]);

  useEffect(() => {
    if (!markerEl) return;
    const handleClick = () => callbacksRef.current.onClick?.();
    const handleEnter = () => callbacksRef.current.onMouseEnter?.();
    const handleLeave = () => callbacksRef.current.onMouseLeave?.();

    markerEl.addEventListener("click", handleClick);
    markerEl.addEventListener("mouseenter", handleEnter);
    markerEl.addEventListener("mouseleave", handleLeave);

    return () => {
      markerEl.removeEventListener("click", handleClick);
      markerEl.removeEventListener("mouseenter", handleEnter);
      markerEl.removeEventListener("mouseleave", handleLeave);
    };
  }, [markerEl]);

  if (!markerEl || !map) return null;

  return createPortal(children, markerEl);
}

// ── MapControls ───────────────────────────────────────────────────────────────

const POSITION_CLASSES: Record<NonNullable<MapControlsProps["position"]>, string> = {
  "bottom-right": "bottom-3 right-3 sm:bottom-4 sm:right-4",
  "bottom-left": "bottom-3 left-3 sm:bottom-4 sm:left-4",
  "top-right": "top-3 right-3 sm:top-4 sm:right-4",
  "top-left": "top-3 left-3 sm:top-4 sm:left-4",
};

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showReset = false,
  onReset,
  onLocate,
  zoomInLabel = "Aumentar zoom",
  zoomOutLabel = "Diminuir zoom",
  resetLabel = "Voltar à visão geral do mapa",
  locateLabel = "Minha localização",
  compassLabel = "Orientar ao norte",
  className,
}: MapControlsProps) {
  const { map, resetView } = useMap();

  const handleZoomIn = () => {
    map?.zoomIn({ duration: 250 });
  };

  const handleZoomOut = () => {
    map?.zoomOut({ duration: 250 });
  };

  const handleCompass = () => {
    map?.resetNorthPitch({ duration: 300 });
  };

  const handleLocate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        map?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 13,
          duration: 850,
          essential: true,
        });
        onLocate?.(coords);
      },
      () => {
        // ignore permission denied
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 }
    );
  };

  const handleReset = () => {
    resetView();
    onReset?.();
  };

  return (
    <div
      className={cn(
        "absolute z-20 flex flex-col overflow-hidden rounded-xl border border-primary/12 bg-white shadow-md",
        POSITION_CLASSES[position],
        className
      )}
    >
      {showZoom && (
        <>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label={zoomInLabel}
            className="p-2 text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label={zoomOutLabel}
            className="border-t border-slate-200 p-2 text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Minus className="h-4 w-4" />
          </button>
        </>
      )}

      {showCompass && (
        <button
          type="button"
          onClick={handleCompass}
          aria-label={compassLabel}
          className="border-t border-slate-200 p-2 text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
        >
          <Compass className="h-4 w-4" />
        </button>
      )}

      {showLocate && (
        <button
          type="button"
          onClick={handleLocate}
          aria-label={locateLabel}
          className="border-t border-slate-200 p-2 text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
        >
          <Locate className="h-4 w-4" />
        </button>
      )}

      {showReset && (
        <button
          type="button"
          onClick={handleReset}
          aria-label={resetLabel}
          title="Visão geral"
          className="border-t border-slate-200 p-2 text-primary transition-colors hover:bg-primary-soft"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Map;
