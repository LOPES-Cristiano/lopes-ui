/**
 * Seletores e utilitários compartilhados para coordenação de camadas de overlays
 * (Drawer, Modal, FormModal, ConfirmDialog, Popover, Select, DropdownMenu, Tooltip, Lightbox).
 */

export const FLOATING_OVERLAY_SELECTOR =
  '[data-floating-open="true"], [data-radix-popper-content-wrapper]';

export const HIGHER_MODAL_OVERLAY_SELECTOR =
  '[data-lopes-modal="true"], [role="alertdialog"], [role="dialog"][data-state="open"]:not([data-drawer-panel="true"]), [data-floating-open="true"], [data-radix-popper-content-wrapper]';

/**
 * Verifica se existe algum menu/picker/popover flutuante aberto no documento.
 */
export function hasOpenFloatingOverlay(): boolean {
  if (typeof document === 'undefined') return false;
  return document.querySelector(FLOATING_OVERLAY_SELECTOR) !== null;
}

/**
 * Verifica se há um modal, diálogo de confirmação ou popover aberto acima de um Drawer.
 */
export function hasOpenHigherModalOverlay(): boolean {
  if (typeof document === 'undefined') return false;
  return document.querySelector(HIGHER_MODAL_OVERLAY_SELECTOR) !== null;
}

/**
 * Verifica se o alvo de um evento DOM/Radix pertence a um overlay flutuante portado.
 */
export function isFloatingOverlayTarget(target: EventTarget | null | undefined): boolean {
  if (!target || typeof Element === 'undefined') return false;
  if (target instanceof Element) {
    return target.closest(FLOATING_OVERLAY_SELECTOR) !== null;
  }
  return false;
}
