// Guarda o estado do painel no Supabase (tabela os_estado, um documento por coleção).
// Substitui o localStorage do protótipo antigo: cada usuário só enxerga o próprio estado (RLS).
import { createBrowserClient } from '@supabase/ssr';

type Situacao = 'salvo' | 'salvando' | 'erro';

let cliente: ReturnType<typeof createBrowserClient> | null = null;
const supa = () =>
  (cliente ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

const pendentes = new Map<string, unknown>();
let timer: ReturnType<typeof setTimeout> | null = null;
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

export const temPendencias = () => pendentes.size > 0 || situacao === 'salvando';

export async function carregarEstado(): Promise<Record<string, unknown>> {
  const { data, error } = await supa().from('os_estado').select('chave, dados');
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r: { chave: string; dados: unknown }) => [r.chave, r.dados]));
}

async function enviar() {
  timer = null;
  if (!pendentes.size) return;
  const linhas = [...pendentes].map(([chave, dados]) => ({ chave, dados, updated_at: new Date().toISOString() }));
  pendentes.clear();
  const { error } = await supa().from('os_estado').upsert(linhas, { onConflict: 'user_id,chave' });
  if (error) {
    console.error('Falha ao salvar no Supabase', error);
    // Devolve para a fila sem sobrescrever algo mais novo.
    linhas.forEach((l) => !pendentes.has(l.chave) && pendentes.set(l.chave, l.dados));
    mudar('erro');
    timer = setTimeout(enviar, 5000);
    return;
  }
  if (pendentes.size) enviar();
  else mudar('salvo');
}

export function salvarColecao(chave: string, dados: unknown) {
  pendentes.set(chave, dados);
  mudar('salvando');
  if (timer) clearTimeout(timer);
  timer = setTimeout(enviar, 400);
}

export async function limparEstado() {
  pendentes.clear();
  const { error } = await supa().from('os_estado').delete().neq('chave', '');
  if (error) throw error;
}
