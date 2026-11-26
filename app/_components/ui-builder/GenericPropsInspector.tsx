"use client";

import React from "react";
import NumberField from "@/components/form/NumberField";
import SelectField from "@/components/form/SelectField";
import Switch from "@/components/form/Switch";
import TextareaField from "@/components/form/TextareaField";
import TextField from "@/components/form/TextField";
import { ICON_SELECT_OPTIONS } from "./catalog-and-defaults";
import type { UIInspectorFieldDef } from "./types";

function asStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return fallback;
}

function asNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function humanizePropKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export interface GenericPropsInspectorProps {
  props: Record<string, unknown>;
  fields?: UIInspectorFieldDef[];
  onChangeProp: (key: string, value: unknown) => void;
}

/**
 * Schema-driven Inspector for extended Lopes UI components.
 * Renders declared `inspectorFields` first, and gracefully infers controls
 * for any simple primitive props when no explicit schema is provided.
 */
export default function GenericPropsInspector({
  props,
  fields,
  onChangeProp,
}: GenericPropsInspectorProps) {
  const effectiveFields: UIInspectorFieldDef[] = React.useMemo(() => {
    if (fields && fields.length > 0) return fields;
    const inferred: UIInspectorFieldDef[] = [];
    for (const [key, val] of Object.entries(props)) {
      if (typeof val === "boolean") {
        inferred.push({ key, label: humanizePropKey(key), kind: "boolean" });
      } else if (typeof val === "number") {
        inferred.push({ key, label: humanizePropKey(key), kind: "number" });
      } else if (typeof val === "string") {
        if (key === "iconName") {
          inferred.push({ key, label: "Ícone", kind: "icon" });
        } else if (val.length > 64 || val.includes("\n")) {
          inferred.push({ key, label: humanizePropKey(key), kind: "textarea", rows: 3 });
        } else {
          inferred.push({ key, label: humanizePropKey(key), kind: "text" });
        }
      }
    }
    return inferred;
  }, [fields, props]);

  if (effectiveFields.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        Propriedades do Componente
      </span>

      {effectiveFields.map((field) => {
        const val = props[field.key];

        if (field.kind === "boolean") {
          return (
            <Switch
              key={field.key}
              size="sm"
              label={field.label}
              description={field.description}
              checked={asBool(val, false)}
              onChange={(checked) => onChangeProp(field.key, checked)}
            />
          );
        }

        if (field.kind === "number") {
          return (
            <NumberField
              key={field.key}
              size="sm"
              label={field.label}
              min={field.min}
              max={field.max}
              step={field.step}
              suffix={field.suffix}
              value={asNum(val, 0)}
              onValueChange={(v) => onChangeProp(field.key, v ?? 0)}
            />
          );
        }

        if (field.kind === "select") {
          return (
            <SelectField
              key={field.key}
              size="sm"
              label={field.label}
              value={asStr(val)}
              options={field.options ?? []}
              onChange={(v) => onChangeProp(field.key, v)}
            />
          );
        }

        if (field.kind === "icon") {
          return (
            <SelectField
              key={field.key}
              size="sm"
              label={field.label}
              searchable
              value={asStr(val)}
              options={[{ value: "", label: "Sem ícone" }, ...ICON_SELECT_OPTIONS]}
              onChange={(v) => onChangeProp(field.key, v)}
            />
          );
        }

        if (field.kind === "textarea") {
          return (
            <TextareaField
              key={field.key}
              size="sm"
              label={field.label}
              placeholder={field.placeholder}
              rows={field.rows ?? 3}
              value={asStr(val)}
              onChange={(e) => onChangeProp(field.key, e.target.value)}
            />
          );
        }

        return (
          <TextField
            key={field.key}
            size="sm"
            label={field.label}
            placeholder={field.placeholder}
            value={asStr(val)}
            onChange={(e) => onChangeProp(field.key, e.target.value)}
          />
        );
      })}
    </div>
  );
}
