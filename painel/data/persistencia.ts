// Guarda o painel no Supabase, um registro por item na tabela os_registros.
// Cada item (cliente, lead, contrato...) é uma linha: dá para consultar e incluir itens
// direto no banco, e o painel só regrava o que mudou, sem apagar o que entrou por fora.
import { createBrowserClient } from '@supabase/ssr';

type Situacao = 'salvo' | 'salvando' | 'erro';
type Linha = { colecao: string; id: string; dados: unknown };

// Coleções que guardam um objeto só (e não uma lista).
const OBJETOS = new Set(['fos_sales_settings']);
// Linha que marca que a coleção já foi usada, para não voltar ao padrão quando esvaziar.
const MARCA = '__colecao';

let cliente: ReturnType<typeof createBrowserClient> | null = null;
const supa = () =>
  (cliente ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

// O que o banco tem hoje, por coleção: id -> JSON, para saber o que mudou.
const gravado = new Map<string, Map<string, string>>();
const pendentes = new Map<string, unknown>();
let timer: ReturnType<typeof setTimeout> | null = null;
let enviando = false;
let situacao: Situacao = 'salvo';
const ouvintes = new Set<(s: Situacao) => void>();

function mudar(s: Situacao) {
  situacao = s;
  ouvintes.forEach((f) => f(s));
}

export function acompanharSituacao(f: (s: Situacao) => void) {
  ouvintes.add(f);
  f(situacao);
  return () => {
    ouvintes.delete(f);
  };
}

export const temPendencias = () => pendentes.size > 0 || enviando;

export async function carregarEstado(): Promise<Record<string, unknown>> {
  const linhas: Linha[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supa()
      .from('os_registros')
      .select('colecao, id, dados')
      .order('criado_em', { ascending: false })
      .order('id')
      .range(de, de + 999);
    if (error) throw error;
    linhas.push(...((data ?? []) as Linha[]));
    if (!data || data.length < 1000) break;
  }

  gravado.clear();
  const estado: Record<string, unknown> = {};
  for (const l of linhas) {
    if (!gravado.has(l.colecao)) gravado.set(l.colecao, new Map());
    gravado.get(l.colecao)!.set(l.id, JSON.stringify(l.dados));
    if (l.id === MARCA) {
      if (!(l.colecao in estado)) estado[l.colecao] = OBJETOS.has(l.colecao) ? undefined : [];
      continue;
    }
    if (OBJETOS.has(l.colecao)) estado[l.colecao] = l.dados;
    else ((estado[l.colecao] ??= []) as unknown[]).push(l.dados);
  }
  for (const k of Object.keys(estado)) if (estado[k] === undefined) delete estado[k];
  return estado;
}

function paraLinhas(chave: string, dados: unknown): Map<string, string> {
  const m = new Map<string, string>([[MARCA, '{}']]);
  if (OBJETOS.has(chave)) m.set('_', JSON.stringify(dados));
  else (dados as { id: string }[]).forEach((item, i) => m.set(String(item?.id ?? `item_${i}`), JSON.stringify(item)));
  return m;
}

async function enviar() {
  timer = null;
  if (!pendentes.size || enviando) return;
  enviando = true;
  const lote = [...pendentes];
  pendentes.clear();

  const gravar: { colecao: string; id: string; dados: unknown; atualizado_em: string }[] = [];
  const apagar: { colecao: string; ids: string[] }[] = [];
  const agora = new Date().toISOString();
  for (const [chave, dados] of lote) {
    const novo = paraLinhas(chave, dados);
    const antigo = gravado.get(chave) ?? new Map();
    for (const [id, json] of novo) if (antigo.get(id) !== json) gravar.push({ colecao: chave, id, dados: JSON.parse(json), atualizado_em: agora });
    const sumiram = [...antigo.keys()].filter((id) => !novo.has(id));
    if (sumiram.length) apagar.push({ colecao: chave, ids: sumiram });
  }

  try {
    for (let i = 0; i < gravar.length; i += 500) {
      const { error } = await supa().from('os_registros').upsert(gravar.slice(i, i + 500), { onConflict: 'user_id,colecao,id' });
      if (error) throw error;
    }
    for (const a of apagar) {
      const { error } = await supa().from('os_registros').delete().eq('colecao', a.colecao).in('id', a.ids);
      if (error) throw error;
    }
    for (const [chave, dados] of lote) gravado.set(chave, paraLinhas(chave, dados));
    enviando = false;
    if (pendentes.size) enviar();
    else mudar('salvo');
  } catch (e) {
    console.error('Falha ao salvar no Supabase', e);
    lote.forEach(([chave, dados]) => !pendentes.has(chave) && pendentes.set(chave, dados));
    enviando = false;
    mudar('erro');
    timer = setTimeout(enviar, 5000);
  }
}

export function salvarColecao(chave: string, dados: unknown) {
  pendentes.set(chave, dados);
  mudar('salvando');
  if (timer) clearTimeout(timer);
  timer = setTimeout(enviar, 400);
}

export async function limparEstado() {
  pendentes.clear();
  const { error } = await supa().from('os_registros').delete().neq('colecao', '');
  if (error) throw error;
  gravado.clear();
}
