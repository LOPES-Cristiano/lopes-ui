'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';
import { cn } from '@/utils/cn';
import { useAccessControl } from '../useAccessControl';

// Deep equality check with support for Date, Array, primitives and nested objects
function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!isDeepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isDeepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
      return false;
    }
  }
  return true;
}

// Helper to get nested path (e.g. "endereco.logradouro" or "telefones.0.numero")
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  if (!path.includes('.')) {
    return (obj as Record<string, unknown>)[path];
  }
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Helper to set nested path (e.g. "endereco.logradouro" or "telefones.0.numero")
function setNestedValue<T extends Record<string, unknown>>(obj: Partial<T>, path: string, value: unknown): Partial<T> {
  const keys = path.split('.');
  if (keys.length === 1) {
    return { ...obj, [path]: value };
  }
  const result = { ...obj } as Record<string, unknown>;
  let current: Record<string, unknown> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof current[k] !== 'object' || current[k] === null) {
      current[k] = isNaN(Number(keys[i + 1])) ? {} : [];
    } else {
      current[k] = Array.isArray(current[k]) ? [...(current[k] as unknown[])] : { ...(current[k] as Record<string, unknown>) };
    }
    current = current[k] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result as Partial<T>;
}

export interface FormContextValue<T extends Record<string, unknown> = Record<string, unknown>> {
  values: Partial<T>;
  errors: Partial<Record<keyof T | string, string>>;
  touched: Partial<Record<keyof T | string, boolean>>;
  isSubmitting: boolean;
  isDirty: boolean;
  componentIdPrefix?: string;
  setValue: <K extends keyof T>(field: K | string, value: unknown) => void;
  setValues: (values: Partial<T> | ((prev: Partial<T>) => Partial<T>)) => void;
  setTouched: <K extends keyof T>(field: K | string, isTouched?: boolean) => void;
  setError: <K extends keyof T>(field: K | string, message?: string) => void;
  setServerErrors: (errors: Partial<Record<keyof T | string, string>>) => void;
  clearErrors: () => void;
  validateField: <K extends keyof T>(field: K | string) => boolean;
  reset: (newValues?: Partial<T>) => void;
}

const FormContext = createContext<FormContextValue<Record<string, unknown>> | null>(null);

export function useFormContext<T extends Record<string, unknown> = Record<string, unknown>>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a ZodForm');
  }
  return context as unknown as FormContextValue<T>;
}

export interface ZodFormFieldRenderProps<V = unknown> {
  name: string;
  value: V;
  error?: string;
  touched?: boolean;
  componentId?: string;
  disabled?: boolean;
  onChange: (valueOrEvent: unknown) => void;
  onBlur: () => void;
}

export interface ZodFormFieldProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Field path in the Zod schema (supports dot notation, e.g. "endereco.cidade") */
  name: keyof T | string;
  /** Validate automatically on blur (default: true) */
  validateOnBlur?: boolean;
  /** Optional explicit componentId (otherwise derived from ZodForm's componentIdPrefix + name) */
  componentId?: string;
  /** If true, hides the field when access is denied instead of disabling it */
  hideIfDenied?: boolean;
  /** Either a render function or a single form field ReactElement to auto-bind */
  children:
    | ((field: ZodFormFieldRenderProps) => React.ReactNode)
    | React.ReactElement<Record<string, unknown>>;
}

export function ZodFormField<T extends Record<string, unknown> = Record<string, unknown>>({
  name,
  validateOnBlur = true,
  componentId: explicitComponentId,
  hideIfDenied = false,
  children,
}: ZodFormFieldProps<T>) {
  const { values, errors, touched, componentIdPrefix, setValue, setTouched, validateField } = useFormContext<T>();
  const { canAccess } = useAccessControl();
  const fieldName = String(name);
  const rawValue = getNestedValue(values, fieldName);
  const error = errors[fieldName];
  const isTouched = Boolean(touched[fieldName]);

  const resolvedComponentId =
    explicitComponentId ?? (componentIdPrefix ? `${componentIdPrefix}.${fieldName}` : undefined);
  const hasPermission = !resolvedComponentId || canAccess(resolvedComponentId);

  const handleChange = useCallback(
    (valueOrEvent: unknown) => {
      if (!hasPermission) return;
      if (
        valueOrEvent &&
        typeof valueOrEvent === 'object' &&
        'target' in valueOrEvent &&
        valueOrEvent.target &&
        typeof valueOrEvent.target === 'object'
      ) {
        const target = valueOrEvent.target as HTMLInputElement;
        const nextVal = target.type === 'checkbox' ? target.checked : target.value;
        setValue(fieldName, nextVal);
        return;
      }
      setValue(fieldName, valueOrEvent);
    },
    [fieldName, hasPermission, setValue],
  );

  const handleBlur = useCallback(() => {
    setTouched(fieldName, true);
    if (validateOnBlur) {
      validateField(fieldName);
    }
  }, [fieldName, setTouched, validateField, validateOnBlur]);

  if (!hasPermission && hideIfDenied) return null;

  if (typeof children === 'function') {
    return (
      <>
        {children({
          name: fieldName,
          value: rawValue,
          error,
          touched: isTouched,
          componentId: resolvedComponentId,
          disabled: !hasPermission ? true : undefined,
          onChange: handleChange,
          onBlur: handleBlur,
        })}
      </>
    );
  }

  if (React.isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>;
    return React.cloneElement(children, {
      name: childProps.name ?? fieldName,
      componentId: childProps.componentId ?? resolvedComponentId,
      hideIfDenied: childProps.hideIfDenied ?? hideIfDenied,
      disabled: Boolean(childProps.disabled || !hasPermission),
      value: childProps.value !== undefined ? childProps.value : (rawValue ?? ''),
      error: childProps.error !== undefined ? childProps.error : error,
      onChange: (...args: unknown[]) => {
        handleChange(args[0]);
        if (typeof childProps.onChange === 'function') {
          (childProps.onChange as (...a: unknown[]) => void)(...args);
        }
      },
      onBlur: (...args: unknown[]) => {
        handleBlur();
        if (typeof childProps.onBlur === 'function') {
          (childProps.onBlur as (...a: unknown[]) => void)(...args);
        }
      },
    });
  }

  return <>{children}</>;
}

export interface ZodFormProps<T extends Record<string, unknown>> {
  schema: z.ZodType<T>;
  defaultValues?: Partial<T>;
  serverErrors?: Partial<Record<keyof T | string, string>>;
  resetKey?: string | number;
  onSubmit: (values: T) => void | Promise<void>;
  onSubmitError?: (error: unknown) => void;
  children: React.ReactNode | ((context: FormContextValue<T>) => React.ReactNode);
  className?: string;
  id?: string;
  /** Optional RBAC prefix automatically combined with each ZodFormField name (e.g. "erp.clientes.form" -> "erp.clientes.form.cpf") */
  componentIdPrefix?: string;
  /** Access-control identifier for the whole form */
  componentId?: string;
  /** If true, hides the entire form when access is denied */
  hideIfDenied?: boolean;
  focusFirstError?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ZodForm<T extends Record<string, unknown>>({
  schema,
  defaultValues = {},
  serverErrors,
  resetKey,
  onSubmit,
  onSubmitError,
  children,
  className,
  id,
  componentIdPrefix,
  componentId,
  hideIfDenied = false,
  focusFirstError = true,
  onDirtyChange,
}: ZodFormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);
  const { canAccess } = useAccessControl();
  const hasPermission = !componentId || canAccess(componentId);

  const [initialValues, setInitialValues] = useState<Partial<T>>(defaultValues);
  const [values, setValuesState] = useState<Partial<T>>(defaultValues);
  // FORM-01: Initialize errors state with serverErrors if provided
  const [errors, setErrors] = useState<Partial<Record<keyof T | string, string>>>(serverErrors ?? {});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T | string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute isDirty cleanly
  const isDirty = React.useMemo(() => {
    return !isDeepEqual(initialValues, values);
  }, [initialValues, values]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // FORM-06: Optional resetKey rehydration
  const prevResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (resetKey !== undefined && resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      setInitialValues(defaultValues);
      setValuesState(defaultValues);
      setErrors(serverErrors ?? {});
      setTouchedState({});
    }
  }, [resetKey, defaultValues, serverErrors]);

  // FORM-02: Sync & clear server errors accurately
  const prevServerErrorsRef = useRef<Partial<Record<keyof T | string, string>> | undefined>(serverErrors);
  useEffect(() => {
    if (!isDeepEqual(prevServerErrorsRef.current, serverErrors)) {
      const oldKeys = Object.keys(prevServerErrorsRef.current ?? {});
      prevServerErrorsRef.current = serverErrors;
      setErrors((prev) => {
        const next = { ...prev };
        for (const k of oldKeys) {
          delete next[k];
        }
        if (serverErrors) {
          Object.assign(next, serverErrors);
        }
        return next;
      });
    }
  }, [serverErrors]);

  const setValue = useCallback((field: keyof T | string, val: unknown) => {
    const fieldStr = String(field);
    setValuesState((prev) => {
      if (fieldStr.includes('.')) {
        return setNestedValue(prev, fieldStr, val);
      }
      return { ...prev, [field as keyof T]: val as T[keyof T] };
    });
    setErrors((prev) => {
      if (!prev[fieldStr]) return prev;
      const next = { ...prev };
      delete next[fieldStr];
      return next;
    });
  }, []);

  const setValues = useCallback((newValues: Partial<T> | ((prev: Partial<T>) => Partial<T>)) => {
    setValuesState(newValues);
  }, []);

  const setTouched = useCallback((field: keyof T | string, isTouched = true) => {
    const fieldStr = String(field);
    setTouchedState((prev) => ({ ...prev, [fieldStr]: isTouched }));
  }, []);

  const setError = useCallback((field: keyof T | string, message?: string) => {
    const fieldStr = String(field);
    setErrors((prev) => {
      if (!message) {
        const next = { ...prev };
        delete next[fieldStr];
        return next;
      }
      return { ...prev, [fieldStr]: message };
    });
  }, []);

  const setServerErrors = useCallback((newServerErrors: Partial<Record<keyof T | string, string>>) => {
    setErrors((prev) => ({ ...prev, ...newServerErrors }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback((newValues?: Partial<T>) => {
    const next = newValues ?? initialValues;
    setInitialValues(next);
    setValuesState(next);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  const validateField = useCallback((field: keyof T | string): boolean => {
    const fieldStr = String(field);
    const zodObj = schema as unknown as { shape?: Record<string, z.ZodTypeAny> };
    if (zodObj.shape && zodObj.shape[fieldStr]) {
      const fieldVal = (values as Record<string, unknown>)[fieldStr];
      const fieldResult = zodObj.shape[fieldStr].safeParse(fieldVal);
      if (!fieldResult.success) {
        const msg = fieldResult.error.issues[0]?.message || 'Campo inválido';
        setError(field, msg);
        return false;
      }
      setError(field, undefined);
      return true;
    }

    const result = schema.safeParse(values);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === fieldStr || i.path[0] === fieldStr);
      if (issue) {
        setError(field, issue.message);
        return false;
      }
    }
    setError(field, undefined);
    return true;
  }, [schema, values, setError]);

  if (!hasPermission && hideIfDenied) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission) return;
    setIsSubmitting(true);

    const result = schema.safeParse(values);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      const allTouched: Record<string, boolean> = {};
      let firstErrorField: string | null = null;

      // FORM-04: Full path mapping for nested structures and arrays
      for (const issue of result.error.issues) {
        const fullPath = issue.path.join('.');
        if (!formattedErrors[fullPath]) {
          formattedErrors[fullPath] = issue.message;
          if (!firstErrorField) {
            firstErrorField = fullPath;
          }
        }
        allTouched[fullPath] = true;
      }

      setErrors(formattedErrors as Partial<Record<keyof T | string, string>>);
      setTouchedState((prev) => ({ ...prev, ...allTouched }));
      setIsSubmitting(false);

      if (focusFirstError && firstErrorField && formRef.current) {
        const primaryField = firstErrorField.split('.')[0];
        const fieldEl = formRef.current.querySelector<HTMLElement>(
          `[name="${firstErrorField}"], [id="${firstErrorField}"], [data-field="${firstErrorField}"], [name="${primaryField}"], [id="${primaryField}"]`
        );
        if (fieldEl) {
          fieldEl.focus?.();
          fieldEl.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      await onSubmit(result.data);
    } catch (err) {
      // FORM-03: Treat fieldErrors vs re-throw/pass general exceptions
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        setErrors((err as { fieldErrors: Partial<Record<keyof T | string, string>> }).fieldErrors);
      } else if (onSubmitError) {
        onSubmitError(err);
      } else {
        throw err;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: FormContextValue<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    componentIdPrefix: componentIdPrefix ?? componentId,
    setValue,
    setValues,
    setTouched,
    setError,
    setServerErrors,
    clearErrors,
    validateField,
    reset,
  };

  return (
    <FormContext.Provider value={contextValue as unknown as FormContextValue<Record<string, unknown>>}>
      <form
        ref={formRef}
        id={id}
        data-component-id={componentId}
        onSubmit={handleSubmit}
        className={cn('space-y-4', !hasPermission && 'opacity-60 pointer-events-none', className)}
        noValidate
      >
        {typeof children === 'function' ? children(contextValue) : children}
      </form>
    </FormContext.Provider>
  );
}

export default ZodForm;
