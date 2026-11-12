// Ficha da Nívia: personalidade, regras, respostas automáticas, lembretes e memória por cliente.
// O WhatsApp do PC lê estas tabelas (os_nivia, os_wa_respostas, os_wa_lembretes, os_nivia_memoria).
import React, { useCallback, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Sparkles, Bell, MessageSquare, Brain, Plus, Save, Trash2, Pause, Play } from 'lucide-react';
import { useStore } from '../../data/store';

type Ficha = { personalidade: string; regras: string };
type Resposta = { id: number; gatilho: 'comprovante' | 'documento' | 'pausa'; texto: string; ativo: boolean; intervalo_horas: number };
type Lembrete = {
  id: number;
  nome: string;
  jid: string;
  destino_nome: string | null;
  texto: string;
  dias: number[];
  hora: string;
  fuso: string;
  domingo_para_segunda: boolean;
  inicio: string | null;
  ativo: boolean;
  ultimo_envio: string | null;
};
type Fato = { id: number; cliente_id: string | null; cliente_nome: string | null; fato: string; origem: string; data: string };
type ChatOpcao = { jid: string; nome: string | null };

let cliente: ReturnType<typeof createBrowserClient> | null = null;
const supa = () =>
  (cliente ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

const GATILHOS: Record<Resposta['gatilho'], string> = {
  comprovante: 'Quando um cliente manda comprovante de pagamento',
  documento: 'Quando um cliente manda documento ou foto (sem pergunta junto)',
  pausa: 'Primeira mensagem de cliente durante a pausa (sábado 11h a segunda 6h)',
};

const FUSOS: Record<string, string> = { 'America/Cuiaba': 'Cuiabá', 'America/Sao_Paulo': 'Brasília' };

const novoLembrete = (): Omit<Lembrete, 'id' | 'ultimo_envio'> => ({
  nome: '',
  jid: '',
  destino_nome: null,
  texto: '',
  dias: [],
  hora: '09:00',
  fuso: 'America/Cuiaba',
  domingo_para_segunda: false,
  inicio: null,
  ativo: true,
});

export const Nivia: React.FC = () => {
  const { clients } = useStore();
  const [ficha, setFicha] = useState<Ficha>({ personalidade: '', regras: '' });
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [fatos, setFatos] = useState<Fato[]>([]);
  const [chats, setChats] = useState<ChatOpcao[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [editando, setEditando] = useState<(Omit<Lembrete, 'id' | 'ultimo_envio'> & { id?: number }) | null>(null);
  const [diasTexto, setDiasTexto] = useState('');
  const [novoFato, setNovoFato] = useState({ cliente_id: '', fato: '' });
  const [filtroCliente, setFiltroCliente] = useState('');

  const carregar = useCallback(async () => {
    const [f, r, l, m, c] = await Promise.all([
      supa().from('os_nivia').select('personalidade, regras').maybeSingle(),
      supa().from('os_wa_respostas').select('id, gatilho, texto, ativo, intervalo_horas').order('id'),
      supa().from('os_wa_lembretes').select('*').order('nome'),
      supa().from('os_nivia_memoria').select('id, cliente_id, cliente_nome, fato, origem, data').order('data', { ascending: false }).limit(300),
      supa().from('os_wa_chats').select('jid, nome').eq('liberado', true).order('nome'),
    ]);
    if (f.data) setFicha(f.data as Ficha);
    setRespostas((r.data ?? []) as Resposta[]);
    setLembretes((l.data ?? []) as Lembrete[]);
    setFatos((m.data ?? []) as Fato[]);
    setChats((c.data ?? []) as ChatOpcao[]);
    const erro = f.error || r.error || l.error || m.error || c.error;
    if (erro) setAviso(`Não consegui ler tudo: ${erro.message}`);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mostrar = (t: string) => {
    setAviso(t);
    setTimeout(() => setAviso(null), 3000);
  };

  async function salvarFicha() {
    const { error } = await supa()
      .from('os_nivia')
      .upsert({ ...ficha, atualizado_em: new Date().toISOString() }, { onConflict: 'user_id' });
    mostrar(error ? `Erro: ${error.message}` : 'Ficha salva.');
  }

  async function salvarResposta(r: Resposta) {
    const { error } = await supa()
      .from('os_wa_respostas')
      .update({ texto: r.texto, ativo: r.ativo, intervalo_horas: r.intervalo_horas, atualizado_em: new Date().toISOString() })
      .eq('id', r.id);
    mostrar(error ? `Erro: ${error.message}` : 'Resposta salva.');
    carregar();
  }

  function abrirLembrete(l?: Lembrete) {
    const base = l ? { ...l } : { ...novoLembrete() };
    setEditando(base);
    setDiasTexto(base.dias.join(', '));
  }

  async function salvarLembrete() {
    if (!editando) return;
    const dias = diasTexto
      .split(/[^0-9]+/)
      .map(Number)
      .filter((d) => d >= 1 && d <= 31);
    if (!editando.nome.trim() || !editando.jid || !editando.texto.trim() || dias.length === 0) {
      mostrar('Preencha nome, destino, texto e pelo menos um dia.');
      return;
    }
    const destino = chats.find((c) => c.jid === editando.jid);
    const dados = {
      nome: editando.nome.trim(),
      jid: editando.jid,
      destino_nome: destino?.nome ?? editando.destino_nome,
      texto: editando.texto,
      dias,
      hora: editando.hora,
      fuso: editando.fuso,
      domingo_para_segunda: editando.domingo_para_segunda,
      inicio: editando.inicio || null,
      ativo: editando.ativo,
      atualizado_em: new Date().toISOString(),
    };
    const { error } = editando.id
      ? await supa().from('os_wa_lembretes').update(dados).eq('id', editando.id)
      : await supa().from('os_wa_lembretes').insert(dados);
    if (error) {
      mostrar(`Erro: ${error.message}`);
      return;
    }
    setEditando(null);
    mostrar('Lembrete salvo.');
    carregar();
  }

  async function alternarLembrete(l: Lembrete) {
    await supa().from('os_wa_lembretes').update({ ativo: !l.ativo, atualizado_em: new Date().toISOString() }).eq('id', l.id);
    carregar();
  }

  async function apagarLembrete(l: Lembrete) {
    if (!window.confirm(`Apagar o lembrete "${l.nome}"?`)) return;
    await supa().from('os_wa_lembretes').delete().eq('id', l.id);
    carregar();
  }

  async function adicionarFato() {
    if (!novoFato.fato.trim()) return;
    const c = clients.find((x) => x.id === novoFato.cliente_id);
    const { error } = await supa().from('os_nivia_memoria').insert({
      cliente_id: c?.id ?? null,
      cliente_nome: c?.name ?? null,
      fato: novoFato.fato.trim(),
      origem: 'nota',
    });
    if (error) {
      mostrar(`Erro: ${error.message}`);
      return;
    }
    setNovoFato({ cliente_id: novoFato.cliente_id, fato: '' });
    carregar();
  }

  async function apagarFato(f: Fato) {
    await supa().from('os_nivia_memoria').delete().eq('id', f.id);
    carregar();
  }

  const fatosVisiveis = fatos.filter((f) => !filtroCliente || f.cliente_id === filtroCliente);

  return (
    <div className="nv">
      <div>
        <h2 className="nv-titulo">
          <Sparkles size={20} /> Nívia, sua assistente
        </h2>
        <p className="nv-sub">
          Tudo o que a Nívia sabe e faz fica aqui. Para alimentar: ajuste a personalidade e as regras, anote fatos dos
          clientes na memória e os combinados das reuniões entram sozinhos.
        </p>
      </div>
      {aviso && <div className="nv-aviso">{aviso}</div>}

      <section className="glass-card nv-bloco">
        <h3 className="nv-secao"><Sparkles size={16} /> Personalidade e regras</h3>
        <label className="nv-rotulo">Como ela fala</label>
        <textarea className="form-control" rows={8} value={ficha.personalidade} onChange={(e) => setFicha({ ...ficha, personalidade: e.target.value })} />
        <label className="nv-rotulo">O que ela nunca faz sozinha</label>
        <textarea className="form-control" rows={8} value={ficha.regras} onChange={(e) => setFicha({ ...ficha, regras: e.target.value })} />
        <div><button className="btn btn-primary btn-sm" onClick={salvarFicha}><Save size={14} /> Salvar ficha</button></div>
      </section>

      <section className="glass-card nv-bloco">
        <h3 className="nv-secao"><MessageSquare size={16} /> Respostas automáticas</h3>
        <p className="nv-sub">Só para contatos liberados como cliente, em conversa individual. Grupos e contatos pessoais não recebem.</p>
        {respostas.map((r) => (
          <div key={r.id} className="nv-item">
            <div className="nv-item-topo">
              <strong>{GATILHOS[r.gatilho]}</strong>
              <label className="nv-check">
                <input type="checkbox" checked={r.ativo} onChange={(e) => setRespostas(respostas.map((x) => (x.id === r.id ? { ...x, ativo: e.target.checked } : x)))} />
                ligada
              </label>
            </div>
            <textarea className="form-control" rows={2} value={r.texto} onChange={(e) => setRespostas(respostas.map((x) => (x.id === r.id ? { ...x, texto: e.target.value } : x)))} />
            <div className="nv-linha">
              <span className="nv-sub">No máximo uma vez a cada</span>
              <input className="form-control nv-num" type="number" min={1} value={r.intervalo_horas} onChange={(e) => setRespostas(respostas.map((x) => (x.id === r.id ? { ...x, intervalo_horas: Number(e.target.value) || 1 } : x)))} />
              <span className="nv-sub">horas por conversa</span>
              <button className="btn btn-secondary btn-sm" onClick={() => salvarResposta(respostas.find((x) => x.id === r.id)!)}><Save size={14} /> Salvar</button>
            </div>
          </div>
        ))}
      </section>

      <section className="glass-card nv-bloco">
        <div className="nv-item-topo">
          <h3 className="nv-secao"><Bell size={16} /> Lembretes programados</h3>
          <button className="btn btn-primary btn-sm" onClick={() => abrirLembrete()}><Plus size={14} /> Novo lembrete</button>
        </div>
        <p className="nv-sub">No texto, use {'{DD}'}, {'{MM}'} e {'{AAAA}'} para o dia, mês e ano do envio.</p>
        {lembretes.length === 0 && <p className="nv-sub">Nenhum lembrete cadastrado ainda.</p>}
        {lembretes.map((l) => (
          <div key={l.id} className={`nv-item ${l.ativo ? '' : 'nv-pausado'}`}>
            <div className="nv-item-topo">
              <strong>{l.nome}</strong>
              <span className="nv-acoes">
                <button className="btn btn-ghost btn-sm" onClick={() => alternarLembrete(l)} title={l.ativo ? 'Pausar' : 'Retomar'}>
                  {l.ativo ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => abrirLembrete(l)}>Editar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => apagarLembrete(l)} title="Apagar"><Trash2 size={14} /></button>
              </span>
            </div>
            <span className="nv-sub">
              Para {l.destino_nome || l.jid.split('@')[0]} · dia{l.dias.length > 1 ? 's' : ''} {l.dias.join(', ')} às {l.hora} ({FUSOS[l.fuso] ?? l.fuso})
              {l.domingo_para_segunda ? ' · domingo vai na segunda' : ''}
              {l.ultimo_envio ? ` · último envio ${l.ultimo_envio.split('-').reverse().join('/')}` : ''}
              {l.ativo ? '' : ' · pausado'}
            </span>
            <span className="nv-texto">{l.texto}</span>
          </div>
        ))}
      </section>

      <section className="glass-card nv-bloco">
        <h3 className="nv-secao"><Brain size={16} /> Memória dos clientes</h3>
        <p className="nv-sub">Combinados, preferências e observações. Os combinados das reuniões do Meet entram aqui sozinhos.</p>
        <div className="nv-linha">
          <select className="form-control" value={novoFato.cliente_id} onChange={(e) => setNovoFato({ ...novoFato, cliente_id: e.target.value })}>
            <option value="">Geral (sem cliente)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input className="form-control nv-grow" placeholder="Ex.: a Yeimi prefere receber tudo até as 10h" value={novoFato.fato} onChange={(e) => setNovoFato({ ...novoFato, fato: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && adicionarFato()} />
          <button className="btn btn-primary btn-sm" onClick={adicionarFato}><Plus size={14} /> Anotar</button>
        </div>
        <div className="nv-linha">
          <span className="nv-sub">Mostrar:</span>
          <select className="form-control" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {fatosVisiveis.length === 0 && <p className="nv-sub">Nada anotado ainda.</p>}
        {fatosVisiveis.map((f) => (
          <div key={f.id} className="nv-fato">
            <span>
              <small className="nv-sub">{f.data.split('-').reverse().join('/')} · {f.cliente_nome || 'Geral'} · {f.origem === 'reuniao' ? 'reunião' : f.origem}</small>
              <br />
              {f.fato}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => apagarFato(f)} title="Apagar"><Trash2 size={14} /></button>
          </div>
        ))}
      </section>

      {editando && (
        <div className="nv-fundo" onClick={() => setEditando(null)}>
          <div className="glass-card nv-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="nv-secao">{editando.id ? 'Editar lembrete' : 'Novo lembrete'}</h3>
            <label className="nv-rotulo">Nome</label>
            <input className="form-control" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} placeholder="Honorários Sela" />
            <label className="nv-rotulo">Para quem</label>
            <select className="form-control" value={editando.jid} onChange={(e) => setEditando({ ...editando, jid: e.target.value })}>
              <option value="">Escolha um contato ou grupo liberado</option>
              {chats.map((c) => (
                <option key={c.jid} value={c.jid}>{c.nome || c.jid.split('@')[0]}</option>
              ))}
            </select>
            <label className="nv-rotulo">Texto</label>
            <textarea className="form-control" rows={6} value={editando.texto} onChange={(e) => setEditando({ ...editando, texto: e.target.value })} />
            <div className="nv-linha">
              <span className="nv-rotulo">Dias do mês</span>
              <input className="form-control nv-grow" value={diasTexto} onChange={(e) => setDiasTexto(e.target.value)} placeholder="10, 20, 30" />
              <span className="nv-rotulo">Hora</span>
              <input className="form-control nv-num" type="time" value={editando.hora} onChange={(e) => setEditando({ ...editando, hora: e.target.value })} />
              <select className="form-control" value={editando.fuso} onChange={(e) => setEditando({ ...editando, fuso: e.target.value })}>
                <option value="America/Cuiaba">Cuiabá</option>
                <option value="America/Sao_Paulo">Brasília</option>
              </select>
            </div>
            <div className="nv-linha">
              <label className="nv-check">
                <input type="checkbox" checked={editando.domingo_para_segunda} onChange={(e) => setEditando({ ...editando, domingo_para_segunda: e.target.checked })} />
                Se cair no domingo, enviar na segunda
              </label>
              <span className="nv-rotulo">Começa em</span>
              <input className="form-control" type="date" value={editando.inicio ?? ''} onChange={(e) => setEditando({ ...editando, inicio: e.target.value || null })} />
            </div>
            <p className="nv-sub">Mês sem o dia escolhido (ex.: 30 em fevereiro) envia no último dia do mês.</p>
            <div className="nv-acoes">
              <button className="btn btn-primary btn-sm" onClick={salvarLembrete}><Save size={14} /> Salvar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nv { display: flex; flex-direction: column; gap: 1.25rem; max-width: 900px; }
        .nv-titulo { display: flex; align-items: center; gap: .5rem; font-size: 1.35rem; font-weight: 700; }
        .nv-sub { color: var(--text-secondary); font-size: .85rem; }
        .nv-aviso { padding: .6rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--accent-primary); font-size: .875rem; }
        .nv-bloco { display: flex; flex-direction: column; gap: .75rem; padding: 1.25rem; }
        .nv-secao { display: flex; align-items: center; gap: .4rem; font-size: 1rem; font-weight: 600; }
        .nv-rotulo { font-size: .8rem; font-weight: 600; color: var(--text-secondary); }
        .nv-item { display: flex; flex-direction: column; gap: .4rem; padding: .75rem; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); }
        .nv-pausado { opacity: .55; }
        .nv-item-topo { display: flex; justify-content: space-between; align-items: center; gap: .5rem; flex-wrap: wrap; }
        .nv-texto { white-space: pre-wrap; font-size: .85rem; color: var(--text-primary); }
        .nv-linha { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
        .nv-num { width: 90px; }
        .nv-grow { flex: 1; min-width: 180px; }
        .nv-check { display: flex; align-items: center; gap: .35rem; font-size: .85rem; }
        .nv-acoes { display: flex; gap: .35rem; }
        .nv-fato { display: flex; justify-content: space-between; gap: .5rem; padding: .5rem 0; border-bottom: 1px solid var(--glass-border); font-size: .875rem; }
        .nv-fundo { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
        .nv-modal { width: min(640px, 100%); max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: .6rem; padding: 1.25rem; }
      `}</style>
    </div>
  );
};
