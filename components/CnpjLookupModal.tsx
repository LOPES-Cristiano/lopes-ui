'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import TextField from './form/TextField';
import AutocompleteField, { type AutocompleteOption } from './form/AutocompleteField';
import {
  cleanDocument,
  formatCep,
  formatCnpjAlpha,
  isValidCnpj,
} from '../utils/document';

export interface CnpjLookupResult {
  cnpj: string;
  legalName: string;
  tradeName?: string;
  stateRegistration?: string;
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  cityId?: string | number | null;
  state?: string;
}

export interface CepLookupResult {
  postalCode?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  cityId?: string | number | null;
  state?: string;
}

export interface CnpjLookupFormData {
  cnpj: string;
  legalName: string;
  tradeName: string;
  stateRegistration: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  cityId: string | number | null;
  state: string;
}

export interface CnpjLookupCityOption {
  id: string | number;
  name: string;
  state?: string;
}

export interface CnpjLookupModalProps {
  open: boolean;
  onClose: () => void;
  /** Async function that queries a CNPJ (numeric or 2026 alphanumeric) and returns company data */
  onLookupCnpj: (cleanCnpj: string) => Promise<CnpjLookupResult>;
  /** Optional async CEP lookup triggered when CEP has 8 digits */
  onLookupCep?: (cleanCep: string) => Promise<CepLookupResult | null>;
  /** Callback invoked when the user confirms the reviewed company form */
  onConfirm: (data: CnpjLookupFormData) => void | Promise<void>;
  /** Optional list of cities to resolve `cityId` via autocomplete */
  cityOptions?: CnpjLookupCityOption[];
  /** Validate check digits before calling `onLookupCnpj` (defaults to `true`) */
  validateCheckDigits?: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  componentId?: string;
}

const createEmptyForm = (): CnpjLookupFormData => ({
  cnpj: '',
  legalName: '',
  tradeName: '',
  stateRegistration: '',
  postalCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  cityId: null,
  state: '',
});

export function CnpjLookupModal({
  open,
  onClose,
  onLookupCnpj,
  onLookupCep,
  onConfirm,
  cityOptions,
  validateCheckDigits = true,
  title = 'Cadastro Rápido por CNPJ',
  subtitle = 'Consulta dados cadastrais (compatível com CNPJ numérico e alfanumérico 2026)',
  confirmLabel = 'Confirmar e Selecionar',
  componentId,
}: CnpjLookupModalProps) {
  const [cnpjInput, setCnpjInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CnpjLookupFormData>(createEmptyForm);

  const cleanInput = cleanDocument(cnpjInput);
  const cnpjComplete = cleanInput.length === 14;

  const handleClose = () => {
    setCnpjInput('');
    setLookupLoading(false);
    setLookupError(null);
    setFormError(null);
    setHasData(false);
    setForm(createEmptyForm());
    onClose();
  };

  const resolveCityMatch = (cityName?: string, uf?: string): CnpjLookupCityOption | null => {
    if (!cityOptions || !cityName) return null;
    const normalizedCity = cityName.trim().toLowerCase();
    const normalizedUf = uf?.trim().toUpperCase();
    return (
      cityOptions.find(
        (c) =>
          c.name.trim().toLowerCase() === normalizedCity &&
          (!normalizedUf || !c.state || c.state.toUpperCase() === normalizedUf),
      ) ?? null
    );
  };

  const handleLookup = async () => {
    if (cleanInput.length !== 14) {
      setLookupError('Informe um CNPJ completo com 14 posições.');
      return;
    }
    if (validateCheckDigits && !isValidCnpj(cleanInput)) {
      setLookupError('Os dígitos verificadores do CNPJ informado são inválidos.');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setFormError(null);
    setHasData(false);

    try {
      const result = await onLookupCnpj(cleanInput);
      let resolvedCity = result.city ?? '';
      let resolvedUf = result.state ?? '';
      let resolvedCityId = result.cityId ?? null;
      let resolvedStreet = result.street ?? '';
      let resolvedNeighborhood = result.neighborhood ?? '';

      const cityMatch = resolveCityMatch(resolvedCity, resolvedUf);
      if (resolvedCityId == null && cityMatch) {
        resolvedCityId = cityMatch.id;
      }

      const rawCep = (result.postalCode ?? '').replace(/\D/g, '');
      if (rawCep.length === 8 && onLookupCep && resolvedCityId == null) {
        try {
          const cepData = await onLookupCep(rawCep);
          if (cepData) {
            resolvedCity = cepData.city || resolvedCity;
            resolvedUf = cepData.state || resolvedUf;
            resolvedStreet = resolvedStreet || cepData.street || '';
            resolvedNeighborhood = resolvedNeighborhood || cepData.neighborhood || '';
            if (cepData.cityId != null) {
              resolvedCityId = cepData.cityId;
            } else {
              const cepMatch = resolveCityMatch(resolvedCity, resolvedUf);
              if (cepMatch) resolvedCityId = cepMatch.id;
            }
          }
        } catch {
          // Non-blocking fallback
        }
      }

      setForm({
        cnpj: formatCnpjAlpha(result.cnpj || cleanInput),
        legalName: result.legalName ?? '',
        tradeName: result.tradeName ?? '',
        stateRegistration: result.stateRegistration ?? '',
        postalCode: result.postalCode ? formatCep(result.postalCode) : '',
        street: resolvedStreet,
        number: result.number ?? '',
        complement: result.complement ?? '',
        neighborhood: resolvedNeighborhood,
        city: resolvedCity,
        cityId: resolvedCityId,
        state: resolvedUf,
      });
      setHasData(true);
    } catch (err) {
      setLookupError(
        err instanceof Error && err.message
          ? err.message
          : 'Não foi possível consultar os dados deste CNPJ.',
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.legalName.trim()) {
      setFormError('A Razão Social é obrigatória.');
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      await onConfirm({
        ...form,
        cnpj: cleanDocument(form.cnpj),
        legalName: form.legalName.trim(),
        tradeName: form.tradeName.trim(),
        stateRegistration: form.stateRegistration.trim(),
        postalCode: form.postalCode.replace(/\D/g, ''),
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
      });
      handleClose();
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : 'Erro ao confirmar os dados da empresa.',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateField =
    <K extends keyof CnpjLookupFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (formError) setFormError(null);
    };

  const filteredCityAutocomplete: AutocompleteOption[] = (cityOptions ?? [])
    .filter(
      (c) =>
        !form.state ||
        !c.state ||
        c.state.toUpperCase() === form.state.toUpperCase(),
    )
    .map((c) => ({
      value: String(c.id),
      label: c.name,
      description: c.state ? `UF: ${c.state.toUpperCase()}` : undefined,
    }));

  return (
    <Modal open={open} onClose={handleClose} maxWidth={660}>
      <div data-component-id={componentId || undefined}>
        {/* Header */}
        <div className="relative overflow-hidden -mx-6 -mt-5 px-6 pt-6 pb-5 mb-5 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Building2 size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Sparkles size={12} className="text-primary shrink-0" />
                <span className="truncate">{subtitle}</span>
              </p>
            </div>
          </div>
        </div>

        {/* CNPJ Search Row */}
        <div className="space-y-3 mb-5">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <TextField
                label="CNPJ da Empresa"
                mask="cnpj-alpha"
                placeholder="00.000.000/0000-00"
                value={cnpjInput}
                onChange={(e) => {
                  setCnpjInput(formatCnpjAlpha(e.target.value));
                  setLookupError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && cnpjComplete) {
                    e.preventDefault();
                    void handleLookup();
                  }
                }}
                rightIcon={
                  cnpjComplete && !lookupLoading ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : undefined
                }
                inputClassName="font-mono tracking-wide tabular-nums"
              />
            </div>

            <Button
              componentId={componentId ? `${componentId}.lookup` : undefined}
              onClick={() => void handleLookup()}
              disabled={lookupLoading || !cnpjComplete}
              variant="secondary"
              className="shrink-0"
              leftIcon={
                lookupLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Search size={15} />
                )
              }
            >
              {lookupLoading ? 'Consultando...' : 'Consultar'}
            </Button>
          </div>

          {lookupError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{lookupError}</span>
            </div>
          )}

          {hasData && !lookupLoading && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Dados localizados — revise as informações antes de confirmar.</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        {hasData && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center">
                  <Building2 size={12} className="text-muted-foreground" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Dados Cadastrais
                </span>
              </div>

              <div className="space-y-3">
                <TextField
                  label="Razão Social"
                  required
                  value={form.legalName}
                  onChange={updateField('legalName')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    label="Nome Fantasia"
                    value={form.tradeName}
                    onChange={updateField('tradeName')}
                  />
                  <TextField
                    label="Inscrição Estadual"
                    value={form.stateRegistration}
                    onChange={updateField('stateRegistration')}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    CNPJ
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-semibold text-foreground tabular-nums">
                    {form.cnpj}
                  </span>
                  <CheckCircle2 size={14} className="text-emerald-500 ml-auto shrink-0" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center">
                  <MapPin size={12} className="text-muted-foreground" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Endereço
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
                  <TextField
                    label="CEP"
                    mask="cep"
                    value={form.postalCode}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, postalCode: formatCep(e.target.value) }))
                    }
                    placeholder="00000-000"
                  />
                  <TextField
                    label="Logradouro"
                    value={form.street}
                    onChange={updateField('street')}
                    placeholder="Avenida, Rua..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <TextField
                    label="Número"
                    value={form.number}
                    onChange={updateField('number')}
                  />
                  <TextField
                    label="Complemento"
                    value={form.complement}
                    onChange={updateField('complement')}
                    placeholder="Sala, Galpão..."
                  />
                  <TextField
                    label="Bairro"
                    value={form.neighborhood}
                    onChange={updateField('neighborhood')}
                  />
                </div>

                <div className="grid grid-cols-[1fr_84px] gap-3">
                  {cityOptions && cityOptions.length > 0 ? (
                    <AutocompleteField
                      label="Município"
                      options={filteredCityAutocomplete}
                      value={form.city}
                      onChange={(val) => {
                        if (!val) {
                          setForm((prev) => ({ ...prev, cityId: null, city: '' }));
                        } else {
                          setForm((prev) => ({ ...prev, city: val }));
                        }
                      }}
                      onSelect={(opt) => {
                        const match = cityOptions.find((c) => String(c.id) === opt.value);
                        setForm((prev) => ({
                          ...prev,
                          cityId: match?.id ?? null,
                          city: opt.label,
                          state: match?.state?.toUpperCase() ?? prev.state,
                        }));
                      }}
                      placeholder="Buscar município..."
                      emptyMessage="Nenhum município encontrado"
                    />
                  ) : (
                    <TextField
                      label="Município"
                      value={form.city}
                      onChange={updateField('city')}
                    />
                  )}
                  <TextField
                    label="UF"
                    maxLength={2}
                    value={form.state}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))
                    }
                    placeholder="RO"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive"
              >
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="h-px bg-border" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4">
          <Button
            componentId={componentId ? `${componentId}.cancel` : undefined}
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>

          {hasData ? (
            <Button
              componentId={componentId ? `${componentId}.confirm` : undefined}
              onClick={() => void handleSave()}
              disabled={saving}
              loading={saving}
              leftIcon={<ArrowRight size={15} />}
            >
              {confirmLabel}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Consulte um CNPJ para continuar
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CnpjLookupModal;
