// Atendimento pelo WhatsApp (assistente Nívia), etapa 1: nada passa.
// Lê as conversas que o serviço WhatsApp do PC grava (os_wa_chats / os_wa_mensagens)
// e mostra quem está esperando resposta. Responder daqui põe a mensagem na fila de saída
// (os_wa_saida), que o PC envia pelo número da Fernanda.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { MessageCircle, Clock, UserPlus, CheckCircle, Send, X, RefreshCw } from 'lucide-react';

type Chat = {
  jid: string;
  nome: string | null;
  tipo: 'novo' | 'cliente' | 'lead' | 'pessoal' | 'grupo' | 'ignorado';
  liberado: boolean;
  ultima_entrada: string | null;
  ultima_saida: string | null;
  aguardando_desde: string | null;
  alertas: number;
};

type Mensagem = {
  id: number;
  wa_id: string;
  de_mim: boolean;
  autor_nome: string | null;
  tipo: string;
  texto: string | null;
  midia_nome: string | null;
  enviado_em: string;
};

type Saida = { id: number; jid: string; texto: string; status: string; criado_em: string; erro: string | null };

let cliente: ReturnType<typeof createBrowserClient> | null = null;
const supa = () =>
  (cliente ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

const TIPOS: Record<Chat['tipo'], string> = {
  novo: 'Novo',
  cliente: 'Cliente',
  lead: 'Lead',
  pessoal: 'Pessoal',
  grupo: 'Grupo',
  ignorado: 'Ignorado',
};

// Pausa da assistente: de sábado 11h até segunda 6h (horário de Brasília).
function emPausa(d: Date) {
  const local = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const dia = local.getDay();
  const h = local.getHours() + local.getMinutes() / 60;
  return (dia === 6 && h >= 11) || dia === 0 || (dia === 1 && h < 6);
}

function esperaTexto(desde: string) {
  const min = Math.max(0, Math.round((Date.now() - new Date(desde).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} h ${min % 60} min`;
  return `${Math.floor(h / 24)} dias`;
}

function hora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function nomeDe(c: Chat) {
  return c.nome || c.jid.split('@')[0];
}

export const Atendimento: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<Chat | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [fila, setFila] = useState<Saida[]>([]);
  const [resposta, setResposta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [, setTique] = useState(0);

  const carregar = useCallback(async () => {
    const { data, error } = await supa()
      .from('os_wa_chats')
      .select('jid, nome, tipo, liberado, ultima_entrada, ultima_saida, aguardando_desde, alertas')
      .neq('tipo', 'ignorado')
      .order('atualizado_em', { ascending: false })
      .limit(300);
    if (error) {
      setErro(error.message);
      return;
    }
    setErro(null);
    setChats((data ?? []) as Chat[]);
  }, []);

  const carregarConversa = useCallback(async (c: Chat) => {
    const [m, s] = await Promise.all([
      supa()
        .from('os_wa_mensagens')
        .select('id, wa_id, de_mim, autor_nome, tipo, texto, midia_nome, enviado_em')
        .eq('jid', c.jid)
        .order('enviado_em', { ascending: false })
        .limit(40),
      supa()
        .from('os_wa_saida')
        .select('id, jid, texto, status, criado_em, erro')
        .eq('jid', c.jid)
        .in('status', ['pendente', 'enviando', 'erro'])
        .order('criado_em', { ascending: true }),
    ]);
    setMensagens(((m.data ?? []) as Mensagem[]).reverse());
    setFila((s.data ?? []) as Saida[]);
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(() => {
      carregar();
      setTique((x) => x + 1);
    }, 30000);
    return () => clearInterval(t);
  }, [carregar]);

  useEffect(() => {
    if (!aberto) return;
    carregarConversa(aberto);
    const t = setInterval(() => carregarConversa(aberto), 15000);
    return () => clearInterval(t);
  }, [aberto, carregarConversa]);

  const esperando = useMemo(
    () =>
      chats
        .filter((c) => c.liberado && c.aguardando_desde)
        .sort((a, b) => new Date(a.aguardando_desde!).getTime() - new Date(b.aguardando_desde!).getTime()),
    [chats],
  );
  const novos = useMemo(() => chats.filter((c) => !c.liberado && c.tipo === 'novo'), [chats]);
  const recentes = useMemo(() => chats.filter((c) => c.liberado && !c.aguardando_desde).slice(0, 30), [chats]);

  async function atualizarChat(c: Chat, campos: Partial<Chat> & { resolvido_em?: string }) {
    const { error } = await supa()
      .from('os_wa_chats')
      .update({ ...campos, atualizado_em: new Date().toISOString() })
      .eq('jid', c.jid);
    if (error) setErro(error.message);
    await carregar();
  }

  async function liberar(c: Chat, tipo: Chat['tipo']) {
    await atualizarChat(c, { tipo, liberado: tipo !== 'ignorado' });
  }

  async function resolver(c: Chat) {
    await atualizarChat(c, { aguardando_desde: null, alertas: 0, resolvido_em: new Date().toISOString() });
    if (aberto?.jid === c.jid) setAberto(null);
  }

  async function enviar() {
    if (!aberto || !resposta.trim()) return;
    setEnviando(true);
    const { error } = await supa().from('os_wa_saida').insert({ jid: aberto.jid, texto: resposta.trim(), origem: 'painel' });
    setEnviando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setResposta('');
    carregarConversa(aberto);
  }

  async function cancelar(s: Saida) {
    await supa().from('os_wa_saida').update({ status: 'cancelado' }).eq('id', s.id).eq('status', 'pendente');
    if (aberto) carregarConversa(aberto);
  }

  const pausa = emPausa(new Date());

  const cartao = (c: Chat, destaque: boolean) => (
    <button key={c.jid} className={`atd-cartao ${destaque ? 'atd-urgente' : ''}`} onClick={() => setAberto(c)}>
      <div className="atd-cartao-topo">
        <strong>{nomeDe(c)}</strong>
        <span className="badge badge-neutral">{TIPOS[c.tipo]}</span>
      </div>
      {c.aguardando_desde ? (
        <span className={`atd-espera ${destaque ? 'atd-espera-alta' : ''}`}>
          <Clock size={14} /> esperando há {esperaTexto(c.aguardando_desde)}
        </span>
      ) : (
        <span className="atd-espera">última conversa {c.ultima_entrada ? hora(c.ultima_entrada) : '—'}</span>
      )}
    </button>
  );

  return (
    <div className="atd">
      <div className="atd-topo">
        <div>
          <h2 className="atd-titulo">
            <MessageCircle size={20} /> Atendimento
          </h2>
          <p className="atd-sub">
            Conversas do seu WhatsApp com quem está liberado. A Nívia avisa no seu WhatsApp quando alguém espera 2 h.
            {pausa && ' Agora é pausa (sábado 11h a segunda 6h): as mensagens ficam gravadas e os alertas voltam na segunda.'}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={carregar}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {erro && <div className="atd-erro">Não consegui ler o atendimento: {erro}</div>}

      <section>
        <h3 className="atd-secao">Esperando você ({esperando.length})</h3>
        {esperando.length === 0 ? (
          <p className="atd-vazio">Ninguém esperando resposta.</p>
        ) : (
          <div className="atd-grade">
            {esperando.map((c) => cartao(c, Date.now() - new Date(c.aguardando_desde!).getTime() > 2 * 3600000))}
          </div>
        )}
      </section>

      {novos.length > 0 && (
        <section>
          <h3 className="atd-secao">
            <UserPlus size={16} /> Contatos novos ({novos.length})
          </h3>
          <p className="atd-vazio">
            Escreveram para você e ainda não estão liberados. O texto só é gravado depois que você libera.
          </p>
          <div className="atd-lista">
            {novos.map((c) => (
              <div key={c.jid} className="atd-novo">
                <span>
                  <strong>{nomeDe(c)}</strong> <small>{c.jid.split('@')[0]}</small>
                </span>
                <span className="atd-acoes">
                  <button className="btn btn-sm btn-secondary" onClick={() => liberar(c, 'cliente')}>Cliente</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => liberar(c, 'lead')}>Lead</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => liberar(c, 'pessoal')}>Pessoal</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => liberar(c, 'ignorado')}>Ignorar</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="atd-secao">Respondidas</h3>
        {recentes.length === 0 ? (
          <p className="atd-vazio">Nada por aqui ainda.</p>
        ) : (
          <div className="atd-grade">{recentes.map((c) => cartao(c, false))}</div>
        )}
      </section>

      {aberto && (
        <div className="atd-painel-fundo" onClick={() => setAberto(null)}>
          <div className="atd-painel glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="atd-painel-topo">
              <div>
                <strong>{nomeDe(aberto)}</strong>
                <span className="badge badge-neutral" style={{ marginLeft: 8 }}>{TIPOS[aberto.tipo]}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setAberto(null)} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div className="atd-conversa">
              {mensagens.length === 0 && <p className="atd-vazio">Nenhuma mensagem gravada ainda.</p>}
              {mensagens.map((m) => (
                <div key={m.id} className={`atd-msg ${m.de_mim ? 'atd-msg-minha' : ''}`}>
                  {!m.de_mim && m.autor_nome && aberto.tipo === 'grupo' && <small className="atd-autor">{m.autor_nome}</small>}
                  <span>{m.texto || (m.midia_nome ? `[${m.tipo}] ${m.midia_nome}` : `[${m.tipo}]`)}</span>
                  <small className="atd-hora">{hora(m.enviado_em)}</small>
                </div>
              ))}
              {fila.map((s) => (
                <div key={s.id} className="atd-msg atd-msg-minha atd-msg-fila">
                  <span>{s.texto}</span>
                  <small className="atd-hora">
                    {s.status === 'erro' ? `não saiu: ${s.erro ?? 'erro'}` : 'na fila, sai pelo seu PC'}
                    {s.status === 'pendente' && (
                      <button className="atd-cancelar" onClick={() => cancelar(s)}>cancelar</button>
                    )}
                  </small>
                </div>
              ))}
            </div>
            <div className="atd-responder">
              <textarea
                className="form-control"
                rows={3}
                placeholder="Escreva a resposta. Ela sai do seu número pelo WhatsApp do PC."
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
              />
              <div className="atd-acoes">
                <button className="btn btn-primary btn-sm" disabled={enviando || !resposta.trim()} onClick={enviar}>
                  <Send size={14} /> Enviar
                </button>
                {aberto.aguardando_desde && (
                  <button className="btn btn-secondary btn-sm" onClick={() => resolver(aberto)}>
                    <CheckCircle size={14} /> Resolver sem responder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .atd { display: flex; flex-direction: column; gap: 1.5rem; }
        .atd-topo { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .atd-titulo { display: flex; align-items: center; gap: .5rem; font-size: 1.35rem; font-weight: 700; }
        .atd-sub { color: var(--text-secondary); font-size: .875rem; margin-top: .25rem; max-width: 680px; }
        .atd-erro { padding: .75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--danger); color: var(--danger); font-size: .875rem; }
        .atd-secao { display: flex; align-items: center; gap: .4rem; font-size: 1rem; font-weight: 600; margin-bottom: .75rem; }
        .atd-vazio { color: var(--text-muted); font-size: .85rem; margin-bottom: .5rem; }
        .atd-grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: .75rem; }
        .atd-cartao { text-align: left; display: flex; flex-direction: column; gap: .4rem; padding: .9rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--bg-secondary, rgba(255,255,255,.02)); color: var(--text-primary); cursor: pointer; }
        .atd-cartao:hover { border-color: var(--accent-primary); }
        .atd-urgente { border-color: var(--danger); }
        .atd-cartao-topo { display: flex; justify-content: space-between; gap: .5rem; align-items: center; }
        .atd-espera { display: flex; align-items: center; gap: .3rem; font-size: .8rem; color: var(--text-secondary); }
        .atd-espera-alta { color: var(--danger); font-weight: 600; }
        .atd-lista { display: flex; flex-direction: column; gap: .5rem; }
        .atd-novo { display: flex; justify-content: space-between; align-items: center; gap: .75rem; flex-wrap: wrap; padding: .6rem .9rem; border: 1px solid var(--glass-border); border-radius: var(--radius-sm); }
        .atd-novo small { color: var(--text-muted); margin-left: .4rem; }
        .atd-acoes { display: flex; gap: .4rem; flex-wrap: wrap; }
        .atd-painel-fundo { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; justify-content: flex-end; z-index: 50; }
        .atd-painel { width: min(520px, 100%); height: 100%; display: flex; flex-direction: column; border-radius: 0; padding: 1rem; }
        .atd-painel-topo { display: flex; justify-content: space-between; align-items: center; padding-bottom: .75rem; border-bottom: 1px solid var(--glass-border); }
        .atd-conversa { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: .5rem; padding: .75rem 0; }
        .atd-msg { align-self: flex-start; max-width: 85%; display: flex; flex-direction: column; gap: .15rem; padding: .5rem .75rem; border-radius: 12px; background: rgba(255,255,255,.06); font-size: .875rem; white-space: pre-wrap; word-break: break-word; }
        .atd-msg-minha { align-self: flex-end; background: rgba(60,200,245,.15); }
        .atd-msg-fila { opacity: .7; border: 1px dashed var(--accent-primary); }
        .atd-autor { color: var(--accent-primary); font-weight: 600; }
        .atd-hora { color: var(--text-muted); font-size: .7rem; display: flex; gap: .5rem; }
        .atd-cancelar { background: none; border: none; color: var(--danger); cursor: pointer; font-size: .7rem; padding: 0; }
        .atd-responder { display: flex; flex-direction: column; gap: .5rem; border-top: 1px solid var(--glass-border); padding-top: .75rem; }
        @media (max-width: 640px) { .atd-topo { flex-direction: column; } .atd-painel { width: 100%; } }
      `}</style>
    </div>
  );
};
