'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smile,
  Heart,
  Search,
  Clock,
  Sparkles,
  Flame,
  ThumbsUp,
  X,
  Coffee,
  Plane,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

export interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
  autoFocus?: boolean;
  componentId?: string;
  storageKey?: string;
}

type EmojiItem = {
  char: string;
  name: string;
  keywords: string[];
};

type EmojiCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  emojis: EmojiItem[];
};

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏', '🚀', '🙏'];

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    label: 'Rostos & Emoções',
    icon: Smile,
    emojis: [
      { char: '😀', name: 'sorriso', keywords: ['feliz', 'alegre', 'smile', 'rosto'] },
      { char: '😃', name: 'sorriso aberto', keywords: ['feliz', 'alegre', 'riso'] },
      { char: '😄', name: 'sorriso com olhos sorridentes', keywords: ['muito feliz', 'gargalhada'] },
      { char: '😁', name: 'sorriso radiante', keywords: ['dentes', 'contente'] },
      { char: '😆', name: 'sorriso com olhos fechados', keywords: ['riso', 'engracado'] },
      { char: '😅', name: 'suor frio sorrindo', keywords: ['alivio', 'nervoso', 'ufa'] },
      { char: '😂', name: 'chorando de rir', keywords: ['risada', 'engracado', 'lol', 'morrendo de rir'] },
      { char: '🤣', name: 'rolando de rir', keywords: ['gargalhada', 'hilario'] },
      { char: '😊', name: 'rosto corado', keywords: ['timido', 'fofo', 'grato'] },
      { char: '😇', name: 'anjo', keywords: ['inocente', 'santo', 'aureola'] },
      { char: '🙂', name: 'sorriso leve', keywords: ['ok', 'concordo', 'simpatico'] },
      { char: '😉', name: 'piscadinha', keywords: ['piscar', 'cumplice', 'segredo'] },
      { char: '😌', name: 'aliviado', keywords: ['calmo', 'paz', 'zen'] },
      { char: '😍', name: 'olhos de coracao', keywords: ['amor', 'apaixonado', 'amei'] },
      { char: '🥰', name: 'rosto com coracoes', keywords: ['amado', 'carinho', 'afeto'] },
      { char: '😘', name: 'beijo com coracao', keywords: ['beijo', 'amor', 'carinho'] },
      { char: '😗', name: 'beijo', keywords: ['biquinho', 'beijinho'] },
      { char: '😋', name: 'delicia', keywords: ['gostoso', 'lingua', 'comida'] },
      { char: '😛', name: 'lingua de fora', keywords: ['brincadeira', 'zueira'] },
      { char: '😜', name: 'piscando com lingua', keywords: ['louco', 'zoeira'] },
      { char: '🤪', name: 'rosto doido', keywords: ['maluco', 'pirado'] },
      { char: '🤨', name: 'sobrancelha levantada', keywords: ['desconfiado', 'duvida', 'hum'] },
      { char: '🧐', name: 'monoculo', keywords: ['analisando', 'investigando', 'observando'] },
      { char: '🤓', name: 'nerd', keywords: ['estudioso', 'oculos', 'geek'] },
      { char: '😎', name: 'oculos escuros', keywords: ['estilo', 'cool', 'patrao', 'show'] },
      { char: '🤩', name: 'olhos de estrelas', keywords: ['impressionado', 'famoso', 'uau'] },
      { char: '🥳', name: 'festa', keywords: ['comemoracao', 'aniversario', 'parabens', 'chapeu'] },
      { char: '😏', name: 'sorriso ironico', keywords: ['ironia', 'safado', 'hum'] },
      { char: '😒', name: 'descontente', keywords: ['chateado', 'reclamando'] },
      { char: '😞', name: 'desapontado', keywords: ['triste', 'decepcionado'] },
      { char: '😔', name: 'pensativo', keywords: ['tristeza', 'reflexivo'] },
      { char: '😟', name: 'preocupado', keywords: ['ansioso', 'medo'] },
      { char: '😕', name: 'confuso', keywords: ['duvida', 'perdido'] },
      { char: '🙁', name: 'rosto triste', keywords: ['chateado', 'bad'] },
      { char: '☹️', name: 'muito triste', keywords: ['depressivo', 'tristao'] },
      { char: '😣', name: 'perseverando', keywords: ['dificil', 'esforco'] },
      { char: '😖', name: 'frustrado', keywords: ['raiva', 'dor'] },
      { char: '😫', name: 'cansado', keywords: ['exausto', 'sono'] },
      { char: '😩', name: 'esgotado', keywords: ['gemendo', 'chega'] },
      { char: '🥺', name: 'olhos pidões', keywords: ['por favor', 'implorando', 'fofinho'] },
      { char: '😢', name: 'chorando', keywords: ['lagrima', 'tristeza', 'choro'] },
      { char: '😭', name: 'berrando de choro', keywords: ['chorao', 'desespero', 'dor'] },
      { char: '😤', name: 'triunfante com vapor', keywords: ['orgulho', 'respirando fundo'] },
      { char: '😠', name: 'irritado', keywords: ['bravo', 'nervoso'] },
      { char: '😡', name: 'furioso', keywords: ['raiva', 'vermelho', 'odio'] },
      { char: '🤬', name: 'xingando', keywords: ['palavrao', 'censura', 'bravo'] },
      { char: '🤯', name: 'cabeca explodindo', keywords: ['chocado', 'mente explodiu', 'inacreditavel'] },
      { char: '😳', name: 'envergonhado', keywords: ['corado', 'vergonha', 'choque'] },
      { char: '🥵', name: 'calor', keywords: ['quente', 'suando', 'abafado'] },
      { char: '🥶', name: 'frio', keywords: ['gelado', 'congelando'] },
      { char: '😱', name: 'gritando de medo', keywords: ['panico', 'susto', 'terror'] },
      { char: '😨', name: 'apavorado', keywords: ['medo', 'susto'] },
      { char: '😰', name: 'ansioso com suor', keywords: ['aperto', 'pressao'] },
      { char: '😥', name: 'alivio triste', keywords: ['quase', 'ufa'] },
      { char: '😓', name: 'suor frio', keywords: ['desconfortavel', 'trabalhoso'] },
      { char: '🤗', name: 'abraco', keywords: ['abracar', 'carinho', 'acolhimento'] },
      { char: '🤔', name: 'pensando', keywords: ['pensar', 'duvida', 'ideia', 'hum'] },
      { char: '🤭', name: 'mao na boca', keywords: ['ops', 'risinho', 'falei demais'] },
      { char: '🤫', name: 'silencio', keywords: ['calado', 'shh', 'segredo'] },
      { char: '🤥', name: 'pinocquio', keywords: ['mentira', 'nariz grande'] },
      { char: '😶', name: 'sem boca', keywords: ['mudo', 'sem palavras'] },
      { char: '😐', name: 'neutro', keywords: ['serio', 'sem expressao'] },
      { char: '😑', name: 'inexpressivo', keywords: ['tanto faz', 'sem paciencia'] },
      { char: '😬', name: 'careta', keywords: ['constrangido', 'climinha'] },
      { char: '🙄', name: 'revirando olhos', keywords: ['preguica', 'saco', 'tedio'] },
      { char: '😯', name: 'surpreso', keywords: ['oh', 'uau'] },
      { char: '😦', name: 'boca aberta', keywords: ['chocado', 'espantado'] },
      { char: '😮', name: 'rosto aberto', keywords: ['uau', 'impressionado'] },
      { char: '😲', name: 'atoniado', keywords: ['perplexo', 'surpresa'] },
      { char: '🥱', name: 'bocejando', keywords: ['sono', 'tedio'] },
      { char: '😴', name: 'dormindo', keywords: ['sono', 'zzz', 'soninho'] },
      { char: '🤤', name: 'babando', keywords: ['delicia', 'vontade', 'sono'] },
      { char: '😪', name: 'sonolento', keywords: ['cansado', 'gota'] },
      { char: '😵', name: 'tonto', keywords: ['desmaiado', 'tontura'] },
      { char: '🤐', name: 'boca fechada ziper', keywords: ['bico calado', 'segredo'] },
      { char: '🥴', name: 'embriagado', keywords: ['tonto', 'estranho'] },
      { char: '🤢', name: 'enjoado', keywords: ['nojo', 'verde'] },
      { char: '🤮', name: 'vomitando', keywords: ['nojento', 'passando mal'] },
      { char: '🤧', name: 'espirrando', keywords: ['gripe', 'doente', 'lenco'] },
      { char: '😷', name: 'mascara medica', keywords: ['saude', 'hospital', 'virus'] },
      { char: '🤒', name: 'termometro', keywords: ['febre', 'doente'] },
      { char: '🤕', name: 'curativo', keywords: ['machucado', 'dor de cabeca'] },
    ],
  },
  {
    id: 'people',
    label: 'Pessoas & Gestos',
    icon: ThumbsUp,
    emojis: [
      { char: '👍', name: 'joinha', keywords: ['ok', 'positivo', 'concordo', 'curtir', 'beleza', 'certo', 'aprovado'] },
      { char: '👎', name: 'descurtir', keywords: ['nao', 'negativo', 'reprovado', 'ruim'] },
      { char: '👏', name: 'palmas', keywords: ['parabens', 'aplauso', 'bravos', 'conquista'] },
      { char: '🙌', name: 'maos para cima', keywords: ['vitoria', 'comemorar', 'gloria', 'amem'] },
      { char: '👐', name: 'maos abertas', keywords: ['aberto', 'acolher'] },
      { char: '🤲', name: 'palmas juntas', keywords: ['oracao', 'oferta', 'rezar'] },
      { char: '🤝', name: 'aperto de maos', keywords: ['acordo', 'negocio', 'combinado', 'parceria', 'fechado'] },
      { char: '🙏', name: 'maos juntas', keywords: ['por favor', 'agradecido', 'obrigado', 'gratidao', 'amem', 'rezar'] },
      { char: '✍️', name: 'escrevendo', keywords: ['caneta', 'anotando', 'nota'] },
      { char: '💅', name: 'unha', keywords: ['arrasei', 'debochando', 'esmaltes'] },
      { char: '🤳', name: 'selfie', keywords: ['foto', 'camera', 'celular'] },
      { char: '💪', name: 'biceps', keywords: ['forca', 'forte', 'foco', 'treino', 'determinado'] },
      { char: '🦾', name: 'braco mecanico', keywords: ['robo', 'tecnologia'] },
      { char: '🦿', name: 'perna mecanica', keywords: ['protese'] },
      { char: '🦵', name: 'perna', keywords: ['chute', 'andar'] },
      { char: '🦶', name: 'pe', keywords: ['passo', 'pe'] },
      { char: '👂', name: 'orelha', keywords: ['ouvir', 'escutar'] },
      { char: '👃', name: 'nariz', keywords: ['cheiro', 'faro'] },
      { char: '🧠', name: 'cerebro', keywords: ['inteligencia', 'mente', 'ideia', 'pensar'] },
      { char: '🫀', name: 'coracao orgao', keywords: ['anatomia', 'cardio'] },
      { char: '🫁', name: 'pulmoes', keywords: ['respirar', 'ar'] },
      { char: '🦷', name: 'dente', keywords: ['dentista', 'odonto'] },
      { char: '🦴', name: 'osso', keywords: ['esqueleto', 'cachorro'] },
      { char: '👀', name: 'olhos', keywords: ['olhando', 'atencao', 'de olho', 'observando', 'veja'] },
      { char: '👁️', name: 'olho', keywords: ['visao', 'olhar'] },
      { char: '👅', name: 'lingua', keywords: ['gosto', 'paladar'] },
      { char: '👄', name: 'boca', keywords: ['labios', 'fala'] },
      { char: '👋', name: 'tchau', keywords: ['ola', 'oi', 'adeus', 'aceno'] },
      { char: '🤚', name: 'mao levantada', keywords: ['pare', 'alto'] },
      { char: '🖐️', name: 'mao aberta', keywords: ['cinco', 'pare'] },
      { char: '✋', name: 'palma da mao', keywords: ['pare', 'chega'] },
      { char: '🖖', name: 'saudacao vulcana', keywords: ['spock', 'vida longa'] },
      { char: '👌', name: 'ok', keywords: ['perfeito', 'otimo', 'tudo certo'] },
      { char: '🤌', name: 'gesto italiano', keywords: ['que e isso', 'o que voce quer'] },
      { char: '🤏', name: 'pouquinho', keywords: ['quase nada', 'pouco'] },
      { char: '✌️', name: 'paz e amor', keywords: ['dois', 'vitoria'] },
      { char: '🤞', name: 'dedos cruzados', keywords: ['sorte', 'torcida', 'esperanca'] },
      { char: '🤟', name: 'te amo', keywords: ['rock', 'linguagem de sinais'] },
      { char: '🤘', name: 'rock', keywords: ['metal', 'chifre'] },
      { char: '🤙', name: 'hang loose', keywords: ['tranquilo', 'liga noiz', 'shaka'] },
      { char: '👈', name: 'apontando esquerda', keywords: ['esquerda', 'lado'] },
      { char: '👉', name: 'apontando direita', keywords: ['direita', 'olha ali'] },
      { char: '👆', name: 'apontando cima', keywords: ['cima', 'acima'] },
      { char: '🖕', name: 'dedo do meio', keywords: ['raiva'] },
      { char: '👇', name: 'apontando baixo', keywords: ['abaixo', 'aqui embaixo'] },
      { char: '☝️', name: 'um dedo cima', keywords: ['atencao', 'primeiro'] },
    ],
  },
  {
    id: 'work_objects',
    label: 'Trabalho & Negócios',
    icon: Briefcase,
    emojis: [
      { char: '💼', name: 'maleta', keywords: ['trabalho', 'empresa', 'escritorio', 'negocio'] },
      { char: '📊', name: 'grafico de barras', keywords: ['dados', 'metricas', 'relatorio', 'bi', 'analytics'] },
      { char: '📈', name: 'grafico subindo', keywords: ['crescimento', 'lucro', 'vendas', 'sucesso'] },
      { char: '📉', name: 'grafico descendo', keywords: ['queda', 'prejuizo'] },
      { char: '📋', name: 'prancheta', keywords: ['tarefa', 'checklist', 'demanda', 'processo'] },
      { char: '📁', name: 'pasta', keywords: ['documento', 'arquivos'] },
      { char: '📂', name: 'pasta aberta', keywords: ['organizar', 'pastas'] },
      { char: '📄', name: 'pagina', keywords: ['texto', 'papel', 'relatorio'] },
      { char: '📑', name: 'marcadores', keywords: ['abas', 'documentos'] },
      { char: '📅', name: 'calendario', keywords: ['agenda', 'data', 'reuniao', 'prazo'] },
      { char: '📆', name: 'calendario de folha', keywords: ['dia', 'mes'] },
      { char: '⏰', name: 'despertador', keywords: ['horario', 'tempo', 'urgente', 'hora'] },
      { char: '⏱️', name: 'cronometro', keywords: ['timer', 'timetracking', 'tempo'] },
      { char: '💻', name: 'notebook', keywords: ['computador', 'laptop', 'sistema', 'ti'] },
      { char: '🖥️', name: 'computador', keywords: ['desktop', 'tela', 'monitor'] },
      { char: '📱', name: 'celular', keywords: ['smartphone', 'telefone', 'whatsapp', 'mobile'] },
      { char: '📞', name: 'telefone', keywords: ['ligacao', 'chamada', 'suporte'] },
      { char: '📠', name: 'fax', keywords: ['aparelho'] },
      { char: '📧', name: 'email', keywords: ['correio', 'mensagem', 'enviar'] },
      { char: '📦', name: 'pacote', keywords: ['estoque', 'entrega', 'caixa', 'produto', 'logistica'] },
      { char: '🏷️', name: 'etiqueta', keywords: ['preco', 'tag', 'codigo'] },
      { char: '💰', name: 'saco de dinheiro', keywords: ['dinheiro', 'financeiro', 'pagamento', 'caixa', 'capital'] },
      { char: '💵', name: 'nota de dinheiro', keywords: ['dolar', 'reais', 'pagar'] },
      { char: '💳', name: 'cartao de credito', keywords: ['pagamento', 'debito', 'compra'] },
      { char: '🧾', name: 'recibo', keywords: ['nota fiscal', 'comprovante', 'nfe'] },
      { char: '🔒', name: 'cadeado trancado', keywords: ['seguranca', 'protegido', 'senha'] },
      { char: '🔓', name: 'cadeado aberto', keywords: ['liberado', 'desbloqueado'] },
      { char: '🔑', name: 'chave', keywords: ['acesso', 'permissao', 'login'] },
      { char: '🛒', name: 'carrinho de compras', keywords: ['compras', 'venda', 'varejo'] },
      { char: '🏪', name: 'loja', keywords: ['filial', 'moveis', 'eletro', 'matriz', 'estabelecimento'] },
      { char: '🏢', name: 'predio comercial', keywords: ['matriz', 'sede', 'escritorio'] },
    ],
  },
  {
    id: 'symbols',
    label: 'Símbolos & Destaques',
    icon: Heart,
    emojis: [
      { char: '❤️', name: 'coracao vermelho', keywords: ['amor', 'love', 'coração', 'curtir'] },
      { char: '💙', name: 'coracao azul', keywords: ['azul', 'confianca'] },
      { char: '💚', name: 'coracao verde', keywords: ['esperanca', 'verde', 'certo'] },
      { char: '💛', name: 'coracao amarelo', keywords: ['alegria', 'amarelo'] },
      { char: '🧡', name: 'coracao laranja', keywords: ['energia', 'laranja'] },
      { char: '💜', name: 'coracao roxo', keywords: ['roxo', 'nobreza'] },
      { char: '🖤', name: 'coracao preto', keywords: ['preto', 'luto'] },
      { char: '🤍', name: 'coracao branco', keywords: ['paz', 'branco'] },
      { char: '🤎', name: 'coracao marrom', keywords: ['marrom'] },
      { char: '💔', name: 'coracao partido', keywords: ['tristeza', 'quebrado'] },
      { char: '💖', name: 'coracao brilhante', keywords: ['brilho', 'especial'] },
      { char: '✨', name: 'brilhos', keywords: ['novo', 'magica', 'destaque', 'top', 'perfeito'] },
      { char: '🔥', name: 'fogo', keywords: ['quente', 'bombando', 'urgente', 'top', 'hype', 'foco'] },
      { char: '⚡', name: 'raio', keywords: ['rapido', 'eletrico', 'energia', 'agil'] },
      { char: '🎉', name: 'festa cone', keywords: ['parabens', 'comemorar', 'meta batida', 'aniversario', 'sucesso'] },
      { char: '🎊', name: 'confetes', keywords: ['festa', 'comemoracao'] },
      { char: '🚀', name: 'foguete', keywords: ['lancamento', 'decolou', 'rapido', 'crescimento', 'meta'] },
      { char: '⭐', name: 'estrela', keywords: ['favorito', 'destaque', 'nota'] },
      { char: '🌟', name: 'estrela brilhante', keywords: ['brilho', 'qualidade'] },
      { char: '🎯', name: 'alvo', keywords: ['objetivo', 'meta', 'foco', 'acertou'] },
      { char: '🏆', name: 'trofeu', keywords: ['campeao', 'vencedor', 'primeiro lugar', 'premio'] },
      { char: '🥇', name: 'medalha de ouro', keywords: ['primeiro', 'campeao'] },
      { char: '🥈', name: 'medalha de prata', keywords: ['segundo'] },
      { char: '🥉', name: 'medalha de bronze', keywords: ['terceiro'] },
      { char: '💡', name: 'lampada', keywords: ['ideia', 'dica', 'insight', 'solucao'] },
      { char: '📌', name: 'alfinete', keywords: ['fixar', 'importante', 'destacar', 'lembrete'] },
      { char: '📍', name: 'marcador de mapa', keywords: ['local', 'endereco', 'filial', 'aqui'] },
      { char: '✅', name: 'check verde', keywords: ['concluido', 'feito', 'aprovado', 'certo', 'ok'] },
      { char: '❌', name: 'x vermelho', keywords: ['cancelado', 'erro', 'errado', 'reprovado'] },
      { char: '⚠️', name: 'alerta', keywords: ['atencao', 'cuidado', 'aviso'] },
      { char: '🚨', name: 'sirene', keywords: ['urgente', 'emergencia', 'critico'] },
      { char: 'ℹ️', name: 'informacao', keywords: ['info', 'detalhe', 'aviso'] },
      { char: '🔔', name: 'sino', keywords: ['notificacao', 'alerta'] },
      { char: '🔕', name: 'sino mudo', keywords: ['silencioso', 'sem notificacao'] },
      { char: '💯', name: '100 pontos', keywords: ['perfeito', 'cem por cento', 'nota 10'] },
    ],
  },
  {
    id: 'food',
    label: 'Alimentos & Bebidas',
    icon: Coffee,
    emojis: [
      { char: '☕', name: 'cafe', keywords: ['cafezinho', 'pausa', 'manha', 'reuniao'] },
      { char: '🍵', name: 'cha', keywords: ['bebida quente'] },
      { char: '🥤', name: 'copo com canudo', keywords: ['refrigerante', 'suco'] },
      { char: '🧃', name: 'suco de caixinha', keywords: ['suco', 'lanche'] },
      { char: '💧', name: 'gota de agua', keywords: ['hidratar', 'agua'] },
      { char: '🍕', name: 'pizza', keywords: ['comida', 'lanche', 'sextou'] },
      { char: '🍔', name: 'hamburguer', keywords: ['fast food', 'lanche'] },
      { char: '🍟', name: 'batata frita', keywords: ['lanche'] },
      { char: '🥪', name: 'sanduiche', keywords: ['misto', 'pao'] },
      { char: '🥖', name: 'baguete', keywords: ['pao', 'lanche'] },
      { char: '🥐', name: 'croissant', keywords: ['cafe da manha', 'lanche'] },
      { char: '🥩', name: 'carne', keywords: ['churrasco', 'carne'] },
      { char: '🍗', name: 'frango', keywords: ['frango', 'coxa'] },
      { char: '🧀', name: 'queijo', keywords: ['frios', 'laticinios'] },
      { char: '🍎', name: 'maca', keywords: ['fruta', 'saudavel'] },
      { char: '🍌', name: 'banana', keywords: ['fruta', 'saudavel'] },
      { char: '🍇', name: 'uva', keywords: ['fruta', 'uva'] },
      { char: '🥑', name: 'abacate', keywords: ['fruta', 'abacate'] },
      { char: '🥦', name: 'brocolis', keywords: ['vegetal', 'saudavel'] },
      { char: '🍷', name: 'taca de vinho', keywords: ['adega', 'vinho', 'comemorar'] },
      { char: '🍻', name: 'brinde de cerveja', keywords: ['cerveja', 'sextou', 'comemoracao', 'happy hour'] },
      { char: '🎂', name: 'bolo de aniversario', keywords: ['festa', 'parabens', 'aniversario'] },
      { char: '🍫', name: 'chocolate', keywords: ['doce', 'sobremesa'] },
    ],
  },
  {
    id: 'travel',
    label: 'Lugares & Viagem',
    icon: Plane,
    emojis: [
      { char: '✈️', name: 'aviao', keywords: ['viagem', 'voo'] },
      { char: '🚗', name: 'carro', keywords: ['veiculo', 'automovel', 'transito'] },
      { char: '🚚', name: 'caminhao', keywords: ['transporte', 'entrega', 'logistica', 'carga'] },
      { char: '🛵', name: 'moto delivery', keywords: ['motoboy', 'entrega rapida'] },
      { char: '🚲', name: 'bicicleta', keywords: ['bike', 'pedalar'] },
      { char: '⛽', name: 'posto de gasolina', keywords: ['combustivel', 'abastecer'] },
      { char: '🏠', name: 'casa', keywords: ['home office', 'lar', 'residencia'] },
      { char: '🏖️', name: 'praia', keywords: ['ferias', 'sol', 'mar'] },
      { char: '🌍', name: 'globo', keywords: ['mundo', 'terra', 'global'] },
      { char: '☀️', name: 'sol', keywords: ['dia', 'claro', 'bom dia'] },
      { char: '🌧️', name: 'chuva', keywords: ['tempo', 'chuvoso'] },
      { char: '⛈️', name: 'tempestade', keywords: ['chuva forte', 'trovao'] },
    ],
  },
];

const LOCAL_STORAGE_RECENT_KEY = 'lopes_ui_recent_emojis_v1';

export default function EmojiPicker({
  onSelectEmoji,
  onClose,
  className = '',
  autoFocus = true,
  componentId,
  storageKey = LOCAL_STORAGE_RECENT_KEY,
}: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Carrega recentes do storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentEmojis(parsed.slice(0, 16));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  useEffect(() => {
    if (autoFocus) {
      searchInputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSelect = (emojiChar: string) => {
    // Salva nos recentes
    try {
      const updated = [emojiChar, ...recentEmojis.filter((e) => e !== emojiChar)].slice(0, 20);
      setRecentEmojis(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    onSelectEmoji(emojiChar);
  };

  // Filtro de busca
  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.toLowerCase().trim();
    const results: EmojiItem[] = [];
    const seen = new Set<string>();

    for (const cat of EMOJI_CATEGORIES) {
      for (const emoji of cat.emojis) {
        if (seen.has(emoji.char)) continue;
        const matchesName = emoji.name.toLowerCase().includes(term);
        const matchesKeyword = emoji.keywords.some((k) => k.toLowerCase().includes(term));
        if (matchesName || matchesKeyword) {
          seen.add(emoji.char);
          results.push(emoji);
        }
      }
    }
    return results;
  }, [search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={`w-80 sm:w-96 rounded-2xl border border-slate-200/90 dark:border-zinc-700/90 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl text-slate-900 dark:text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col z-50 select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
      >
      {/* Header com busca e fechar */}
      <div className="p-3 border-b border-slate-200/70 dark:border-zinc-800 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
        <div className="relative flex-1 flex items-center">
          <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            data-component-id={componentId ? `${componentId}.search` : undefined}
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar emoji..."
            className="w-full h-8 pl-8 pr-7 text-xs rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
          {search && (
            <button
              data-component-id={componentId ? `${componentId}.search-clear` : undefined}
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {onClose && (
          <button
            data-component-id={componentId ? `${componentId}.close` : undefined}
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Fechar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Reações rápidas no topo */}
      <div className="px-3 py-2 border-b border-slate-200/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-500" /> Top
        </span>
        <div className="flex items-center gap-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              data-component-id={componentId ? `${componentId}.quick-reaction` : undefined}
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              className="h-7 w-7 rounded-lg flex items-center justify-center font-emoji text-base hover:bg-slate-100 dark:hover:bg-zinc-800 hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Navegação por categorias (se não estiver buscando) */}
      {!search && (
        <div className="px-2 pt-2 flex items-center justify-between gap-1 border-b border-slate-200/40 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {recentEmojis.length > 0 && (
            <button
              data-component-id={componentId ? `${componentId}.cat-recent` : undefined}
              type="button"
              onClick={() => setActiveCategory('recent')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
                activeCategory === 'recent'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
              title="Recentes"
            >
              <Clock size={15} />
            </button>
          )}
          {EMOJI_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                data-component-id={componentId ? `${componentId}.cat-${category.id}` : undefined}
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
                title={category.label}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Emojis */}
      <div
        ref={scrollContainerRef}
        className="p-3 max-h-64 overflow-y-auto overscroll-contain space-y-3"
      >
        {search ? (
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
              <span>Resultados para &quot;{search}&quot;</span>
              <span>{filteredEmojis?.length ?? 0} encontrados</span>
            </div>
            {filteredEmojis && filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-8 sm:grid-cols-8 gap-1">
                {filteredEmojis.map((item) => (
                  <button
                    data-component-id={componentId ? `${componentId}.emoji-search-item` : undefined}
                    key={`${item.char}-${item.name}`}
                    type="button"
                    onClick={() => handleSelect(item.char)}
                    className="h-9 w-9 rounded-xl flex items-center justify-center font-emoji text-2xl hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer"
                    title={item.name}
                  >
                    {item.char}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum emoji correspondente encontrado.
              </div>
            )}
          </div>
        ) : (
          <div>
            {activeCategory === 'recent' && recentEmojis.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock size={12} /> Usados Recentemente
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-8 gap-1">
                  {recentEmojis.map((char) => (
                    <button
                      data-component-id={componentId ? `${componentId}.emoji-recent-item` : undefined}
                      key={char}
                      type="button"
                      onClick={() => handleSelect(char)}
                      className="h-9 w-9 rounded-xl flex items-center justify-center font-emoji text-2xl hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {EMOJI_CATEGORIES.filter(
              (cat) => activeCategory === 'all' || cat.id === activeCategory
            ).map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <cat.icon size={12} /> {cat.label}
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-8 gap-1">
                  {cat.emojis.map((item) => (
                    <button
                      data-component-id={componentId ? `${componentId}.emoji-item` : undefined}
                      key={`${item.char}-${item.name}`}
                      type="button"
                      onClick={() => handleSelect(item.char)}
                      className="h-9 w-9 rounded-xl flex items-center justify-center font-emoji text-2xl hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer"
                      title={item.name}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer com dica da fonte Google */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-200/50 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="font-emoji text-xs">✨</span> Google Noto Color Emoji
        </span>
        <span className="opacity-70">Clique para inserir</span>
      </div>
    </motion.div>
  );
}
