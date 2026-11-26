import type { UICanvasElement } from "./types";

export interface ExtendedGenContext {
  lopesImports: Set<string>;
  subpathImports: Map<string, Set<string>>;
  lucideImports: Set<string>;
  stateVars: { varName: string; setterName: string; comment: string }[];
  overlayModalsJsx: string[];
}

function addSubpath(ctx: ExtendedGenContext, pkg: string, sym: string) {
  let set = ctx.subpathImports.get(pkg);
  if (!set) {
    set = new Set<string>();
    ctx.subpathImports.set(pkg, set);
  }
  set.add(sym);
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

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

/**
 * Generates idiomatic TSX JSX + import declarations for all 112 extended Lopes UI components.
 */
export function renderExtendedElementJsx(
  el: UICanvasElement,
  ctx: ExtendedGenContext,
): string | null {
  const p = el.props;
  const cid = el.componentId ? ` componentId=${q(el.componentId)}` : "";

  switch (el.type) {
    // ── Estrutura & Superfícies / Exibição ──────────────────────────────────
    case "stack":
      ctx.lopesImports.add("Stack");
      return `<Stack direction=${q(p.direction, "bottom")} maxVisible={${asNum(p.maxVisible, 3)}} fanOnHover={${asBool(p.fanOnHover, true)}} cycleOnClick={${asBool(p.cycleOnClick, true)}}>\n  <div className="rounded-xl border p-4 bg-white">Sofá Retrátil Bari 2,90m</div>\n  <div className="rounded-xl border p-4 bg-white">Geladeira Frost Free 474L</div>\n</Stack>`;

    case "aspect_ratio":
      ctx.lopesImports.add("AspectRatio");
      return `<AspectRatio ratio={${asNum(p.ratio, 16 / 9)}}>\n  <div className="h-full w-full rounded-xl bg-indigo-50 flex items-center justify-center p-4">${esc(asStr(p.caption, "Ambiente BigLar"))}</div>\n</AspectRatio>`;

    case "bento_grid":
      ctx.lopesImports.add("BentoGrid");
      ctx.lopesImports.add("BentoCard");
      return `<BentoGrid${cid} columns={${Math.min(4, Math.max(2, asNum(p.columns, 3)))}}>\n  <BentoCard title="Estofados & Salas" description="Entrega própria RO & AM" colSpan={2} featured />\n  <BentoCard title="Colchões & Box" description="Molas ensacadas e espuma D33" />\n</BentoGrid>`;

    case "masonry":
      ctx.lopesImports.add("Masonry");
      return `<Masonry${cid} columns={${asNum(p.columns, 3)}} gap={${asNum(p.gap, 12)}}>\n  <div className="rounded-xl border p-4">Sala Retrátil Bari</div>\n  <div className="rounded-xl border p-4">Cozinha Planejada 7P</div>\n  <div className="rounded-xl border p-4">Dormitório Casal 6P</div>\n</Masonry>`;

    case "detail_layout":
      ctx.lopesImports.add("DetailHeader");
      ctx.lopesImports.add("DetailPanel");
      ctx.lopesImports.add("DetailGrid");
      ctx.lopesImports.add("InfoField");
      return [
        `<div className="space-y-4">`,
        `  <DetailHeader titleLabel=${q(p.subtitle, "Detalhe")} titleValue=${q(p.title, "Detalhe do Pedido")} />`,
        `  <DetailPanel title=${q(p.panelTitle, "Resumo")}>`,
        `    <DetailGrid columns={2}>`,
        `      <InfoField label="Filial" value="Porto Velho — Centro (RO)" />`,
        `      <InfoField label="Total" value="R$ 4.890,00" highlight />`,
        `    </DetailGrid>`,
        `  </DetailPanel>`,
        `</div>`,
      ].join("\n");

    case "mockup": {
      const kind = asStr(p.kind, "browser");
      if (kind === "window") {
        ctx.lopesImports.add("WindowMockup");
        return `<WindowMockup title=${q(p.title)}>\n  <div className="p-4">${esc(asStr(p.body))}</div>\n</WindowMockup>`;
      }
      if (kind === "phone") {
        ctx.lopesImports.add("PhoneMockup");
        return `<PhoneMockup>\n  <div className="p-4">${esc(asStr(p.body))}</div>\n</PhoneMockup>`;
      }
      if (kind === "code") {
        ctx.lopesImports.add("CodeMockup");
        return `<CodeMockup>\n  <pre data-prefix="$"><code>npm run sync:cds -- --region=RO,AM</code></pre>\n</CodeMockup>`;
      }
      ctx.lopesImports.add("BrowserMockup");
      return `<BrowserMockup url=${q(p.url, "https://erp.biglar.com.br")}>\n  <div className="p-4">${esc(asStr(p.body))}</div>\n</BrowserMockup>`;
    }

    case "watermark":
      ctx.lopesImports.add("Watermark");
      return `<Watermark content=${q(p.content, "BIGLAR INTERNO")} rotate={${asNum(p.rotate, -22)}} opacity={${asNum(p.opacity, 0.14)}}>\n  <div className="p-4">${esc(asStr(p.bodyTitle, "Documento Protegido"))}</div>\n</Watermark>`;

    case "mask":
      ctx.lopesImports.add("Mask");
      return `<Mask shape=${q(p.shape, "squircle")} className="h-40 w-40 bg-indigo-600 text-white flex items-center justify-center">${esc(asStr(p.label, "BigLar"))}</Mask>`;

    case "carousel":
      ctx.lopesImports.add("Carousel");
      return `<Carousel${cid} arrows={${asBool(p.arrows, true)}} dots={${asBool(p.dots, true)}} loop={${asBool(p.loop, true)}} slidesPerView={${asNum(p.slidesPerView, 1)}}>\n  <div className="p-6 rounded-xl border">Festival de Estofados — RO &amp; AM</div>\n  <div className="p-6 rounded-xl border">Semana da Linha Branca Inverter</div>\n</Carousel>`;

    case "hover_gallery":
      ctx.lopesImports.add("HoverGallery");
      return `<HoverGallery${cid} showIndicators={${asBool(p.showIndicators, true)}} resetOnLeave={${asBool(p.resetOnLeave, true)}} images={["/produto-1.jpg", "/produto-2.jpg"]} />`;

    case "diff":
      ctx.lopesImports.add("Diff");
      return `<Diff${cid} before="/antes.jpg" after="/depois.jpg" beforeLabel=${q(p.beforeLabel, "Antes")} afterLabel=${q(p.afterLabel, "Depois")} defaultPosition={${asNum(p.defaultPosition, 50)}} orientation=${q(p.orientation, "horizontal")} />`;

    case "spoiler":
      ctx.lopesImports.add("Spoiler");
      return `<Spoiler${cid} maxHeight={${asNum(p.maxHeight, 68)}} showLabel=${q(p.showLabel, "Ver mais")} hideLabel=${q(p.hideLabel, "Recolher")}>\n  <p>${esc(asStr(p.content))}</p>\n</Spoiler>`;

    case "highlight_text":
      ctx.lopesImports.add("HighlightText");
      return `<HighlightText${cid} text=${q(p.text)} highlight={${JSON.stringify(asStr(p.highlight).split(",").map((s) => s.trim()).filter(Boolean))}} tone=${q(p.tone, "amber")} ignoreAccents={${asBool(p.ignoreAccents, true)}} />`;

    case "item":
      ctx.lopesImports.add("Item");
      ctx.lopesImports.add("ItemContent");
      ctx.lopesImports.add("ItemTitle");
      ctx.lopesImports.add("ItemDescription");
      return `<Item variant=${q(p.variant, "outline")} size=${q(p.size, "md")}>\n  <ItemContent>\n    <ItemTitle>${esc(asStr(p.title, "Item"))}</ItemTitle>\n    <ItemDescription>${esc(asStr(p.description))}</ItemDescription>\n  </ItemContent>\n</Item>`;

    case "indicator":
      ctx.lopesImports.add("Indicator");
      return `<Indicator badge=${q(p.badge, "3")} position=${q(p.position, "top-end")} tone=${q(p.tone, "primary")} ping={${asBool(p.ping, true)}}>\n  <div className="rounded-xl border px-4 py-2">${esc(asStr(p.label, "Entregas Hoje"))}</div>\n</Indicator>`;

    case "hover_card":
      ctx.lopesImports.add("HoverCard");
      return `<HoverCard side=${q(p.side, "bottom")} trigger={<span>${esc(asStr(p.triggerLabel, "@filial"))}</span>} content={<div><strong>${esc(asStr(p.title))}</strong><p>${esc(asStr(p.description))}</p></div>} />`;

    case "action_grid_card":
      ctx.lopesImports.add("ActionGridCard");
      ctx.lucideImports.add("ShoppingBag");
      return `<ActionGridCard${cid} title=${q(p.title, "Ações Rápidas")} subtitle=${q(p.subtitle)} columns={${asNum(p.columns, 3)}} items={[{ id: "a1", label: "Novo Pedido", icon: ShoppingBag }]} />`;

    case "countdown":
      ctx.lopesImports.add("Countdown");
      return `<Countdown hours={${asNum(p.hours, 4)}} minutes={${asNum(p.minutes, 32)}} seconds={${asNum(p.seconds, 18)}} variant=${q(p.variant, "boxed")} size=${q(p.size, "md")} paused={${asBool(p.paused, false)}} />`;

    case "emoji_picker":
      ctx.lopesImports.add("EmojiPicker");
      return `<EmojiPicker${cid} onSelectEmoji={(emoji) => console.log(emoji)} />`;

    case "image_lightbox": {
      ctx.lopesImports.add("ImageLightbox");
      ctx.lopesImports.add("Button");
      const idx = ctx.stateVars.length + 1;
      const v = `lightboxOpen${idx}`;
      const s = `setLightboxOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<ImageLightbox open={${v}} onClose={() => ${s}(false)} src="/produto.jpg" title=${q(p.title)} caption=${q(p.caption)} />`,
      );
      return `<Button variant="outline" onClick={() => ${s}(true)}>${esc(asStr(p.title, "Ampliar Imagem"))}</Button>`;
    }

    case "split_counter_badge":
      ctx.lopesImports.add("SplitCounterBadge");
      return `<SplitCounterBadge${cid} approvedCount={${asNum(p.approvedCount, 42)}} blockedCount={${asNum(p.blockedCount, 7)}} rejectedCount={${asNum(p.rejectedCount, 2)}} size=${q(p.size, "md")} />`;

    case "agenda":
      ctx.lopesImports.add("Agenda");
      return `<Agenda${cid} size=${q(p.size, "sm")} showTime={${asBool(p.showTime, true)}} showLocation={${asBool(p.showLocation, true)}} events={[{ id: "1", title: "Montagem Cozinha Modulada", date: new Date(), time: "09:00", location: "Porto Velho (RO)" }]} />`;

    case "map":
      ctx.lopesImports.add("Map");
      ctx.lopesImports.add("MapMarker");
      return `<Map${cid} center={[${asNum(p.longitude, -63.9039)}, ${asNum(p.latitude, -8.7619)}]} zoom={${asNum(p.zoom, 11)}} theme=${q(p.theme, "liberty")} className="h-80 w-full rounded-xl">\n  <MapMarker longitude={${asNum(p.longitude, -63.9039)}} latitude={${asNum(p.latitude, -8.7619)}}>\n    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">${esc(asStr(p.markerLabel, "BigLar RO"))}</span>\n  </MapMarker>\n</Map>`;

    case "cookie_banner":
      ctx.lopesImports.add("CookieBanner");
      return `<CookieBanner title=${q(p.title)} description=${q(p.description)} allowCustomize={${asBool(p.allowCustomize, true)}} />`;

    case "theme_toggle":
      ctx.lopesImports.add("ThemeToggle");
      return `<ThemeToggle${cid} size={${asNum(p.size, 18)}} />`;

    // ── Navegação ───────────────────────────────────────────────────────────
    case "header":
      ctx.lopesImports.add("Header");
      return `<Header${cid} brand={<span className="font-bold">${esc(asStr(p.brandName, "BigLar Móveis & Eletro"))}</span>} nav={[{ label: "Dashboard", href: "/" }, { label: "Pedidos RO/AM", href: "/pedidos" }]} />`;

    case "sidebar":
      ctx.lopesImports.add("Sidebar");
      ctx.lucideImports.add("LayoutDashboard");
      ctx.lucideImports.add("ShoppingBag");
      return `<Sidebar groups={[{ label: ${q(p.brandTitle, "Comercial RO & AM")}, items: [{ label: "Dashboard", icon: LayoutDashboard, active: true }, { label: "Pedidos", icon: ShoppingBag }] }]} user={{ name: ${q(p.userName, "Camila Souza")}, role: ${q(p.userRole, "Porto Velho (RO)")} }} />`;

    case "footer":
      ctx.lopesImports.add("Footer");
      return `<Footer brand=${q(p.brand)} tagline=${q(p.tagline)} copyright=${q(p.copyright)} variant=${q(p.variant, "bordered")} />`;

    case "pagination":
      ctx.lopesImports.add("Pagination");
      return `<Pagination page={${asNum(p.page, 1)}} totalItems={${asNum(p.totalItems, 148)}} pageSize={${asNum(p.pageSize, 10)}} showSummary={${asBool(p.showSummary, true)}} onPageChange={() => {}} />`;

    case "app_launcher":
      ctx.lopesImports.add("AppLauncher");
      ctx.lucideImports.add("ShoppingBag");
      ctx.lucideImports.add("Boxes");
      return `<AppLauncher${cid} title=${q(p.title, "Módulos BigLar")} searchable={${asBool(p.searchable, true)}} columns={${asNum(p.columns, 3)}} apps={[{ id: "vendas", label: "Vendas", icon: ShoppingBag }, { id: "estoque", label: "Estoque CDs", icon: Boxes }]} />`;

    case "command_menu":
      ctx.lopesImports.add("CommandMenu");
      return `<CommandMenu${cid} triggerLabel=${q(p.triggerLabel)} placeholder=${q(p.placeholder)} items={[{ id: "1", label: "Novo Pedido RO/AM", group: "Vendas", onSelect: () => {} }]} />`;

    case "quick_actions":
      ctx.lopesImports.add("QuickActions");
      ctx.lucideImports.add("Plus");
      return `<QuickActions${cid} actions={[{ id: "new", label: "Novo Pedido", icon: <Plus size={16} />, onClick: () => {} }]} />`;

    case "shortcut_hint":
      ctx.lopesImports.add("ShortcutHint");
      return `<ShortcutHint keys={${JSON.stringify(asStr(p.keysText, "Ctrl,K").split(",").map((k) => k.trim()).filter(Boolean))}} separator={${asBool(p.separator, true)}} />`;

    case "split_pane":
      ctx.lopesImports.add("SplitPane");
      return `<SplitPane direction=${q(p.direction, "horizontal")} defaultSplit={${asNum(p.defaultSplit, 45)}} first={<div className="p-4">${esc(asStr(p.firstTitle, "Painel 1"))}</div>} second={<div className="p-4">${esc(asStr(p.secondTitle, "Painel 2"))}</div>} />`;

    case "dock":
      ctx.lopesImports.add("Dock");
      ctx.lucideImports.add("Home");
      ctx.lucideImports.add("ShoppingBag");
      return `<Dock${cid} position="inline" showLabels={${asBool(p.showLabels, true)}} magnify={${asBool(p.magnify, true)}} items={[{ id: "home", label: "Início", icon: Home }, { id: "vendas", label: "Vendas", icon: ShoppingBag }]} />`;

    case "collapsible":
      ctx.lopesImports.add("Collapsible");
      ctx.lopesImports.add("CollapsibleTrigger");
      ctx.lopesImports.add("CollapsibleContent");
      return `<Collapsible defaultOpen={${asBool(p.defaultOpen, true)}}>\n  <CollapsibleTrigger>${esc(asStr(p.triggerLabel))}</CollapsibleTrigger>\n  <CollapsibleContent>${esc(asStr(p.content))}</CollapsibleContent>\n</Collapsible>`;

    case "scroll_area":
      ctx.lopesImports.add("ScrollArea");
      return `<ScrollArea maxHeight={${asNum(p.maxHeight, 150)}} showScrollShadows={${asBool(p.showScrollShadows, true)}}>\n  <div className="space-y-2 p-2">Lista de filiais RO &amp; AM</div>\n</ScrollArea>`;

    case "kbd":
      ctx.lopesImports.add("Kbd");
      return `<Kbd size=${q(p.size, "md")}>${esc(asStr(p.label, "F2"))}</Kbd>`;

    case "table_of_contents":
      ctx.lopesImports.add("TableOfContents");
      return `<TableOfContents${cid} title=${q(p.title)} variant=${q(p.variant, "rail")} activeId=${q(p.activeId)} items={${JSON.stringify(Array.isArray(p.items) ? p.items : [])}} />`;

    case "context_menu":
      ctx.lopesImports.add("ContextMenu");
      return `<ContextMenu${cid} items={[{ label: "Ver Detalhes", onClick: () => {} }]}>\n  <div className="rounded-xl border p-4">${esc(asStr(p.label))}</div>\n</ContextMenu>`;

    // ── KPIs & Dados ────────────────────────────────────────────────────────
    case "touch_chart_card":
      ctx.lopesImports.add("TouchChartCard");
      return `<TouchChartCard title=${q(p.title)} subtitle=${q(p.subtitle)} series={[{ key: "ro", label: "Rondônia (69)", color: "#4f46e5" }]}>\n  <div className="p-4">Conteúdo do gráfico</div>\n</TouchChartCard>`;

    case "expandable_data_card":
      ctx.lopesImports.add("ExpandableDataCard");
      return `<ExpandableDataCard${cid} code=${q(p.code)} title=${q(p.title)} subtitle=${q(p.subtitle)} primaryValue=${q(p.primaryValue)} progress={${asNum(p.progress, 92)}} progressLabel=${q(p.progressLabel)} />`;

    case "kpi_carousel":
      ctx.lopesImports.add("KpiCarousel");
      return `<KpiCarousel${cid} desktopColumns={${asNum(p.desktopColumns, 4)}} showDots={${asBool(p.showDots, true)}} items={[{ id: "k1", title: "Faturamento RO", value: "R$ 842K" }, { id: "k2", title: "Faturamento AM", value: "R$ 918K" }]} />`;

    case "data_table":
      ctx.lopesImports.add("DataTable");
      return `<DataTable title=${q(p.title)} description=${q(p.description)} globalSearch={${asBool(p.globalSearch, true)}} pagination={${asBool(p.pagination, true)}} showSummary={${asBool(p.showSummary, true)}} columns={[{ key: "sku", label: "SKU" }, { key: "produto", label: "Produto" }]} rows={[{ id: "1", sku: "EST-290", produto: "Sofá Retrátil Bari 2,90m" }]} rowKey={(r) => r.id} />`;

    case "spreadsheet":
      addSubpath(ctx, "lopes-ui/spreadsheet", "Spreadsheet");
      return `<Spreadsheet title=${q(p.title)} description=${q(p.description)} showFooter={${asBool(p.showFooter, true)}} showRowNumbers={${asBool(p.showRowNumbers, true)}} columns={[{ key: "sku", header: "SKU" }, { key: "produto", header: "Produto", editable: true }]} rows={[{ id: "1", sku: "EST-290", produto: "Sofá Retrátil Bari 2,90m" }]} rowKey={(r) => r.id} />`;

    case "inbox_list":
      ctx.lopesImports.add("InboxList");
      return `<InboxList${cid} items={[{ id: "1", from: "CD Porto Velho (RO)", subject: "Romaneio liberado", preview: "12 pedidos expedidos", date: new Date(), unread: true }]} />`;

    case "json_viewer":
      ctx.lopesImports.add("JsonViewer");
      return `<JsonViewer${cid} title=${q(p.title)} rootName=${q(p.rootName, "pedido")} defaultExpandDepth={${asNum(p.defaultExpandDepth, 2)}} searchable={${asBool(p.searchable, true)}} data={{ numero: "PED-9041", praca: "Porto Velho - RO" }} />`;

    // ── Ações & Feedback ────────────────────────────────────────────────────
    case "button_group":
      ctx.lopesImports.add("ButtonGroup");
      ctx.lopesImports.add("Button");
      return `<ButtonGroup orientation=${q(p.orientation, "horizontal")} attached={${asBool(p.attached, true)}}>\n  <Button size="sm" variant="primary">Hoje</Button>\n  <Button size="sm" variant="outline">Semana</Button>\n  <Button size="sm" variant="outline">Mês</Button>\n</ButtonGroup>`;

    case "toggle_group":
      ctx.lopesImports.add("ToggleGroup");
      return `<ToggleGroup${cid} type=${q(p.type, "single")} variant=${q(p.variant, "outline")} options={[{ value: "grid", label: "Grade" }, { value: "list", label: "Lista" }]} />`;

    case "speed_dial":
      ctx.lopesImports.add("SpeedDial");
      ctx.lucideImports.add("ShoppingBag");
      return `<SpeedDial position="inline" direction=${q(p.direction, "right")} variant=${q(p.variant, "primary")} actions={[{ id: "new", label: "Novo Pedido", icon: ShoppingBag, onClick: () => {} }]} />`;

    case "float_button":
      ctx.lopesImports.add("FloatButton");
      ctx.lucideImports.add("Plus");
      return `<FloatButton floating={false} icon={Plus} tooltip=${q(p.tooltip)} type=${q(p.type, "primary")} shape=${q(p.shape, "circle")} />`;

    case "sortable_list":
      ctx.lopesImports.add("SortableList");
      return `<SortableList${cid} items={[{ id: "1", title: "Entrega Porto Velho (RO)" }]} onChange={() => {}} keyExtractor={(i) => i.id} renderItem={(i) => <span>{i.title}</span>} showIndex={${asBool(p.showIndex, true)}} />`;

    case "pull_to_refresh":
      ctx.lopesImports.add("PullToRefresh");
      return `<PullToRefresh onRefresh={async () => {}} />`;

    case "swap":
      ctx.lopesImports.add("Swap");
      return `<Swap${cid} defaultActive={${asBool(p.defaultActive, true)}} effect=${q(p.effect, "rotate")} onElement={<span>${esc(asStr(p.onLabel, "Ativo"))}</span>} offElement={<span>${esc(asStr(p.offLabel, "Inativo"))}</span>} />`;

    case "state":
      ctx.lopesImports.add("State");
      return `<State kind=${q(p.kind, "empty")} title=${q(p.title)} description=${q(p.description)} size="sm" />`;

    case "toast":
      ctx.lopesImports.add("ToastPreview");
      return `<ToastPreview type=${q(p.type, "success")} message=${q(p.message)} description=${q(p.description)} closeButton={${asBool(p.closeButton, true)}} />`;

    case "loading":
      ctx.lopesImports.add("Loading");
      return `<Loading variant=${q(p.variant, "spinner")} size=${q(p.size, "md")} label=${q(p.label)} />`;

    case "form_modal": {
      ctx.lopesImports.add("FormModal");
      ctx.lopesImports.add("Button");
      const idx = ctx.stateVars.length + 1;
      const v = `formModalOpen${idx}`;
      const s = `setFormModalOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<FormModal open={${v}} onClose={() => ${s}(false)} title=${q(p.title)} subtitle=${q(p.subtitle)} code=${q(p.code)} onSave={() => ${s}(false)}>\n  <p>Campos do cadastro...</p>\n</FormModal>`,
      );
      return `<Button${cid} variant="primary" onClick={() => ${s}(true)}>${esc(asStr(p.triggerLabel, "Abrir FormModal"))}</Button>`;
    }

    case "confirm": {
      ctx.lopesImports.add("Confirm");
      ctx.lopesImports.add("Button");
      if (asStr(p.mode) === "popover") {
        return `<Confirm mode="popover" tone=${q(p.tone, "danger")} title=${q(p.title)} description=${q(p.description)} onConfirm={() => {}}>\n  <Button variant="destructive">${esc(asStr(p.triggerLabel, "Confirmar"))}</Button>\n</Confirm>`;
      }
      const idx = ctx.stateVars.length + 1;
      const v = `confirmModalOpen${idx}`;
      const s = `setConfirmModalOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<Confirm open={${v}} tone=${q(p.tone, "danger")} title=${q(p.title)} description=${q(p.description)} onConfirm={() => ${s}(false)} onCancel={() => ${s}(false)} />`,
      );
      return `<Button variant="destructive" onClick={() => ${s}(true)}>${esc(asStr(p.triggerLabel, "Confirmar"))}</Button>`;
    }

    case "unsaved_changes_dialog": {
      ctx.lopesImports.add("UnsavedChangesDialog");
      ctx.lopesImports.add("Button");
      const idx = ctx.stateVars.length + 1;
      const v = `unsavedOpen${idx}`;
      const s = `setUnsavedOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<UnsavedChangesDialog open={${v}} title=${q(p.title)} description=${q(p.description)} onContinue={() => ${s}(false)} onDiscard={() => ${s}(false)} onSave={() => ${s}(false)} />`,
      );
      return `<Button variant="warning-outline" onClick={() => ${s}(true)}>${esc(asStr(p.triggerLabel, "Alterações Não Salvas"))}</Button>`;
    }

    // ── Formulários & Inputs ────────────────────────────────────────────────
    case "form":
      ctx.lopesImports.add("Form");
      ctx.lopesImports.add("FormSection");
      ctx.lopesImports.add("FormRow");
      ctx.lopesImports.add("TextField");
      ctx.lopesImports.add("Button");
      return `<Form onSubmit={(e) => e.preventDefault()}>\n  <FormSection title=${q(p.sectionTitle)} description=${q(p.sectionDescription)}>\n    <FormRow columns={2}>\n      <TextField label="Nome Completo" />\n      <TextField label="Telefone (RO/AM)" />\n    </FormRow>\n    <Button type="submit" variant="primary">${esc(asStr(p.submitLabel, "Salvar"))}</Button>\n  </FormSection>\n</Form>`;

    case "zod_form":
      ctx.lopesImports.add("ZodForm");
      ctx.lopesImports.add("Button");
      addSubpath(ctx, "zod", "z");
      return `<ZodForm schema={z.object({ cliente: z.string().min(3) })} defaultValues={{ cliente: "" }} onSubmit={() => {}}>\n  <Button type="submit" variant="primary">${esc(asStr(p.submitLabel, "Enviar"))}</Button>\n</ZodForm>`;

    case "field_wrapper":
      ctx.lopesImports.add("FieldWrapper");
      return `<FieldWrapper label=${q(p.label)} helpText=${q(p.helpText)} required={${asBool(p.required, true)}}>\n  <input className="w-full rounded-lg border px-3 py-1.5 text-sm" placeholder=${q(p.placeholder)} />\n</FieldWrapper>`;

    case "native_select":
      ctx.lopesImports.add("NativeSelect");
      return `<NativeSelect${cid} defaultValue=${q(p.defaultValue, "ro-pvh")}>\n  <option value="ro-pvh">Porto Velho — Centro (RO)</option>\n  <option value="am-mao">Manaus — Cidade Nova (AM)</option>\n</NativeSelect>`;

    case "multi_select_field":
      ctx.lopesImports.add("MultiSelectField");
      return `<MultiSelectField${cid} label=${q(p.label)} placeholder=${q(p.placeholder)} searchable={${asBool(p.searchable, true)}} options={[{ value: "moveis", label: "Móveis & Estofados" }, { value: "eletro", label: "Eletro & Linha Branca" }]} />`;

    case "autocomplete_field":
      ctx.lopesImports.add("AutocompleteField");
      return `<AutocompleteField${cid} label=${q(p.label)} placeholder=${q(p.placeholder)} creatable={${asBool(p.creatable, true)}} options={["Sofá Retrátil Bari 2,90m", "Geladeira Frost Free 474L"]} />`;

    case "checkbox_group":
      ctx.lopesImports.add("CheckboxGroup");
      return `<CheckboxGroup${cid} label=${q(p.label)} variant=${q(p.variant, "card")} columns={${asNum(p.columns, 2)}} options={[{ value: "montagem", label: "Montagem Especializada" }, { value: "garantia", label: "Garantia Estendida" }]} />`;

    case "radio_group_field":
      ctx.lopesImports.add("RadioGroupField");
      return `<RadioGroupField${cid} label=${q(p.label)} variant=${q(p.variant, "cards")} columns={${asNum(p.columns, 2)}} options={[{ value: "propria", label: "Entrega Própria RO/AM" }, { value: "retira", label: "Retirar na Filial" }]} />`;

    case "date_field":
      ctx.lopesImports.add("DateField");
      return `<DateField${cid} label=${q(p.label)} mode=${q(p.mode, "date")} defaultValue=${q(p.defaultValue)} />`;

    case "date_range_picker_field":
      ctx.lopesImports.add("DateRangePickerField");
      return `<DateRangePickerField${cid} label=${q(p.label)} placeholder=${q(p.placeholder)} clearable={${asBool(p.clearable, true)}} showDefaultPresets={${asBool(p.showDefaultPresets, true)}} />`;

    case "time_field":
      ctx.lopesImports.add("TimeField");
      return `<TimeField${cid} label=${q(p.label)} defaultValue=${q(p.defaultValue, "17:30")} />`;

    case "time_picker_field":
      ctx.lopesImports.add("TimePickerField");
      return `<TimePickerField${cid} label=${q(p.label)} defaultValue=${q(p.defaultValue, "09:00")} stepMinutes={${asNum(p.stepMinutes, 30)}} />`;

    case "month_picker_field":
      ctx.lopesImports.add("MonthPickerField");
      return `<MonthPickerField${cid} label=${q(p.label)} defaultValue=${q(p.defaultValue, "2026-11")} />`;

    case "input_group":
      ctx.lopesImports.add("InputGroup");
      ctx.lopesImports.add("InputGroupAddon");
      ctx.lopesImports.add("InputGroupInput");
      ctx.lopesImports.add("InputGroupButton");
      return `<InputGroup${cid} label=${q(p.label)}>\n  <InputGroupAddon align="inline-start">${esc(asStr(p.prefix, "PED-"))}</InputGroupAddon>\n  <InputGroupInput placeholder=${q(p.placeholder)} />\n  <InputGroupAddon align="inline-end"><InputGroupButton>${esc(asStr(p.buttonLabel, "Consultar"))}</InputGroupButton></InputGroupAddon>\n</InputGroup>`;

    case "filter_chips":
      ctx.lopesImports.add("FilterChips");
      return `<FilterChips${cid} label=${q(p.label)} size=${q(p.size, "sm")} defaultValue=${q(p.defaultValue, "estofados")} options={[{ value: "estofados", label: "Estofados" }, { value: "colchoes", label: "Colchões" }, { value: "eletro", label: "Eletrodomésticos" }]} />`;

    case "tag_input_field":
      ctx.lopesImports.add("TagInputField");
      return `<TagInputField${cid} label=${q(p.label)} placeholder=${q(p.placeholder)} defaultValue={${JSON.stringify(Array.isArray(p.defaultValue) ? p.defaultValue : [])}} />`;

    case "mentions_field":
      ctx.lopesImports.add("MentionsField");
      return `<MentionsField${cid} label=${q(p.label)} placeholder=${q(p.placeholder)} defaultValue=${q(p.defaultValue)} rows={${asNum(p.rows, 2)}} options={[{ value: "equipe_ro", label: "Equipe Montagem RO" }]} />`;

    case "color_picker_field":
      ctx.lopesImports.add("ColorPickerField");
      return `<ColorPickerField${cid} label=${q(p.label)} defaultValue=${q(p.defaultValue, "#4f46e5")} showCopy={${asBool(p.showCopy, true)}} />`;

    case "file_field":
      ctx.lopesImports.add("FileField");
      return `<FileField${cid} label=${q(p.label)} buttonLabel=${q(p.buttonLabel)} variant=${q(p.variant, "compact")} accept=${q(p.accept)} />`;

    case "rich_text_editor":
      addSubpath(ctx, "lopes-ui/rich-text", "RichTextEditor");
      return `<RichTextEditor placeholder=${q(p.placeholder)} defaultValue=${q(p.defaultValue)} showCount={${asBool(p.showCount, true)}} />`;

    case "rich_text_field":
      addSubpath(ctx, "lopes-ui/rich-text", "RichTextField");
      return `<RichTextField label=${q(p.label)} helpText=${q(p.helpText)} required={${asBool(p.required, true)}} defaultValue=${q(p.defaultValue)} />`;

    case "rich_text_viewer":
      ctx.lopesImports.add("RichTextViewer");
      return `<RichTextViewer${cid} html=${q(p.html)} />`;

    case "login_form":
      ctx.lopesImports.add("LoginForm");
      return `<LoginForm title=${q(p.title)} subtitle=${q(p.subtitle)} submitLabel=${q(p.submitLabel)} showRemember={${asBool(p.showRemember, true)}} onSubmit={async () => {}} />`;

    case "otp_input":
      ctx.lopesImports.add("OTPInput");
      return `<OTPInput${cid} length={${asNum(p.length, 6)}} groupSize={${asNum(p.groupSize, 3)}} mask={${asBool(p.mask, false)}} />`;

    case "password_strength":
      ctx.lopesImports.add("PasswordStrength");
      return `<PasswordStrength${cid} password=${q(p.password)} showHint={${asBool(p.showHint, true)}} />`;

    case "inline_edit":
      ctx.lopesImports.add("InlineEdit");
      return `<InlineEdit defaultValue=${q(p.defaultValue)} showActions={${asBool(p.showActions, true)}} onSave={() => {}} />`;

    // ── Comunicação ─────────────────────────────────────────────────────────
    case "chat_window":
      ctx.lopesImports.add("ChatWindow");
      return `<ChatWindow${cid} title=${q(p.title)} defaultOpen={${asBool(p.defaultOpen, true)}} conversations={[{ id: "pvh", name: "Loja Porto Velho (69)", online: true, messages: [] }]} />`;

    case "chat_message":
      ctx.lopesImports.add("ChatMessage");
      return `<ChatMessage senderName=${q(p.senderName)} content=${q(p.content)} timestamp=${q(p.timestamp)} mine={${asBool(p.mine, false)}} status=${q(p.status, "read")} />`;

    case "chat_composer":
      ctx.lopesImports.add("ChatComposer");
      return `<ChatComposer placeholder=${q(p.placeholder)} variant=${q(p.variant, "toolbar")} onSend={() => {}} />`;

    case "chat_conversation_item":
      ctx.lopesImports.add("ChatConversationItem");
      return `<ChatConversationItem${cid} name=${q(p.name)} lastMessage=${q(p.lastMessage)} timestamp=${q(p.timestamp)} unread={${asNum(p.unread, 0)}} online={${asBool(p.online, true)}} active={${asBool(p.active, true)}} />`;

    case "email_composer":
      addSubpath(ctx, "lopes-ui/rich-text", "EmailComposer");
      return `<EmailComposer mode=${q(p.mode, "inline")} title=${q(p.title)} defaultSubject=${q(p.defaultSubject)} onSend={() => {}} />`;

    case "notification_bell":
      ctx.lopesImports.add("NotificationBell");
      return `<NotificationBell${cid} notifications={[]} />`;

    // ── Corporativo & RBAC ──────────────────────────────────────────────────
    case "scope_selector":
      ctx.lopesImports.add("ScopeSelector");
      return `<ScopeSelector${cid} value="ro-pvh" onChange={() => {}} allowGlobal={${asBool(p.allowGlobal, true)}} globalLabel=${q(p.globalLabel)} sectionLabel=${q(p.sectionLabel)} options={[{ id: "ro-pvh", label: "Porto Velho (RO)" }, { id: "am-mao", label: "Manaus (AM)" }]} />`;

    case "tenant_switcher_modal": {
      ctx.lopesImports.add("TenantSwitcherModal");
      ctx.lopesImports.add("TenantSwitcherTrigger");
      const idx = ctx.stateVars.length + 1;
      const v = `tenantOpen${idx}`;
      const s = `setTenantOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<TenantSwitcherModal open={${v}} onClose={() => ${s}(false)} title=${q(p.title)} tenants={[{ id: "ro-pvh", name: "BigLar Porto Velho (RO)" }]} onSelect={() => ${s}(false)} />`,
      );
      return `<TenantSwitcherTrigger${cid} currentTenant={{ id: "ro-pvh", name: "BigLar Porto Velho (RO)" }} onClick={() => ${s}(true)} />`;
    }

    case "cnpj_lookup_modal": {
      ctx.lopesImports.add("CnpjLookupModal");
      ctx.lopesImports.add("Button");
      const idx = ctx.stateVars.length + 1;
      const v = `cnpjOpen${idx}`;
      const s = `setCnpjOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<CnpjLookupModal open={${v}} onClose={() => ${s}(false)} title=${q(p.title)} onLookupCnpj={async (cnpj) => ({ cnpj, legalName: "BigLar Móveis e Eletrodomésticos Ltda." })} onConfirm={() => ${s}(false)} />`,
      );
      return `<Button${cid} variant="outline" onClick={() => ${s}(true)}>${esc(asStr(p.triggerLabel, "Consultar CNPJ"))}</Button>`;
    }

    case "smart_object":
      ctx.lopesImports.add("SmartObject");
      return `<SmartObject${cid} kind=${q(p.kind, "VENDA")} ref_id=${q(p.ref_id, "PED-9041")} title=${q(p.title)} status=${q(p.status, "analyzing")} mode=${q(p.mode, "card")} />`;

    case "active_timer_widget":
      ctx.lopesImports.add("ActiveTimerWidget");
      return `<ActiveTimerWidget${cid} inline code=${q(p.code)} title=${q(p.title)} subtitle=${q(p.subtitle)} running={${asBool(p.running, true)}} elapsedSeconds={${asNum(p.elapsedSeconds, 1845)}} />`;

    case "access_guard":
      ctx.lopesImports.add("AccessGuard");
      return `<AccessGuard task=${q(p.task)}>\n  <div>${esc(asStr(p.resourceName))}</div>\n</AccessGuard>`;

    case "can":
      ctx.lopesImports.add("Can");
      return `<Can task=${q(p.task)}>\n  <div>${esc(asStr(p.label))}</div>\n</Can>`;

    case "error_boundary":
      ctx.lopesImports.add("ErrorBoundary");
      return `<ErrorBoundary title=${q(p.title)} description=${q(p.description)} retryLabel=${q(p.retryLabel)}>\n  <div>Conteúdo protegido</div>\n</ErrorBoundary>`;

    case "camera_capture_modal": {
      ctx.lopesImports.add("CameraCaptureModal");
      ctx.lopesImports.add("Button");
      const idx = ctx.stateVars.length + 1;
      const v = `cameraOpen${idx}`;
      const s = `setCameraOpen${idx}`;
      ctx.stateVars.push({ varName: v, setterName: s, comment: el.name });
      ctx.overlayModalsJsx.push(
        `<CameraCaptureModal open={${v}} onClose={() => ${s}(false)} title=${q(p.title)} description=${q(p.description)} onCapture={() => ${s}(false)} />`,
      );
      return `<Button${cid} variant="outline" onClick={() => ${s}(true)}>${esc(asStr(p.triggerLabel, "Capturar Foto"))}</Button>`;
    }

    // ── Animação & Código ───────────────────────────────────────────────────
    case "code_block":
      addSubpath(ctx, "lopes-ui/code-block", "CodeBlock");
      return `<CodeBlock${cid} filename=${q(p.filename)} language=${q(p.language, "tsx")} lineNumbers={${asBool(p.lineNumbers, true)}} code={${q(p.code)}} />`;

    case "snippet":
      ctx.lopesImports.add("Snippet");
      return `<Snippet${cid} code=${q(p.code)} symbol=${q(p.symbol, "$")} variant=${q(p.variant, "dark")} size=${q(p.size, "md")} />`;

    case "tour":
      ctx.lopesImports.add("Tour");
      return `<Tour${cid} finishLabel=${q(p.finishLabel, "Concluir")} steps={[{ title: "Catálogo RO & AM", description: "Consulte estoque em tempo real." }]} />`;

    case "text_rotate":
      ctx.lopesImports.add("TextRotate");
      return `<TextRotate inline duration={${asNum(p.duration, 2400)}} items={${JSON.stringify(asStr(p.words, "sua Sala,seu Quarto,seu Lar").split(",").map((w) => w.trim()).filter(Boolean))}} />`;

    case "marquee":
      ctx.lopesImports.add("Marquee");
      return `<Marquee${cid} duration={${asNum(p.duration, 24)}} pauseOnHover={${asBool(p.pauseOnHover, true)}} reverse={${asBool(p.reverse, false)}}>\n  <span>Sofás Retráteis</span>\n  <span>Colchões Molas Ensacadas</span>\n  <span>Linha Branca Inverter</span>\n</Marquee>`;

    case "animated_number":
      ctx.lopesImports.add("AnimatedNumber");
      return `<AnimatedNumber value={${asNum(p.value, 289450.8)}} format=${q(p.format, "currency")} />`;

    case "leaderboard_podium":
      ctx.lopesImports.add("LeaderboardPodium");
      return `<LeaderboardPodium${cid} variant=${q(p.variant, "pedestal")} title=${q(p.title)} subtitle=${q(p.subtitle)} items={[{ id: 1, rank: 1, name: "Camila Souza", subtitle: "Porto Velho (RO)", value: 6420.5 }]} />`;

    case "motion_collapse":
      ctx.lopesImports.add("MotionCollapse");
      return `<MotionCollapse open={${asBool(p.defaultOpen, true)}}>\n  <p>${esc(asStr(p.content))}</p>\n</MotionCollapse>`;

    case "stagger_list":
      ctx.lopesImports.add("StaggerList");
      ctx.lopesImports.add("StaggerItem");
      return `<StaggerList${cid} staggerDelay={${asNum(p.staggerDelay, 0.05)}} offsetY={${asNum(p.offsetY, 10)}}>\n  <StaggerItem>Sofá Retrátil Imperial</StaggerItem>\n  <StaggerItem>Geladeira Frost Free 450L</StaggerItem>\n</StaggerList>`;

    case "isometric_showcase":
      addSubpath(ctx, "lopes-ui/isometric", "IsometricShowcase");
      return `<IsometricShowcase scene={scene} steps={steps} autoPlay={${asBool(p.autoPlay, false)}} showBench={${asBool(p.showBench, true)}} tilt={${asBool(p.tilt, true)}} />`;

    case "isometric_bench":
      addSubpath(ctx, "lopes-ui/isometric", "IsometricBench");
      return `<IsometricBench scene={scene} step={${asNum(p.step, 0)}} label=${q(p.label)} showBench={${asBool(p.showBench, true)}} tilt={${asBool(p.tilt, true)}} />`;

    default:
      return null;
  }
}
