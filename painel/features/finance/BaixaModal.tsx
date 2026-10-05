import React, { useState } from 'react';
import { X, Undo2, Check } from 'lucide-react';
import { useStore } from '../../data/store';
import type { Baixa } from '../../types';

type Props = {
  tipo: 'receber' | 'pagar';
  id: string;
  onClose: () => void;
};

const moeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const dataBR = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '');

// Baixa total ou parcial, com data, conta, forma e nota; mostra o histórico e permite desfazer.
export const BaixaModal: React.FC<Props> = ({ tipo, id, onClose }) => {
  const {
    transactions, accountsPayables, financialAccounts, invoices, clients,
    registrarBaixa, desfazerBaixa, addInvoice, atualizarTransacao,
  } = useStore();

  const tr = tipo === 'receber' ? transactions.find(t => t.id === id) : undefined;
  const ap = tipo === 'pagar' ? accountsPayables.find(p => p.id === id) : undefined;
  const item = tr ?? ap;

  const total = tr ? tr.amount : ap ? ap.valor : 0;
  const baixas: Baixa[] = (tr?.baixas ?? ap?.baixas ?? []);
  const pago = baixas.reduce((s, b) => s + b.valor, 0);
  const quitadoSemHistorico = baixas.length === 0 && (tr?.status === 'paid' || ap?.status === 'pago');
  const restante = Math.max(0, Math.round((total - pago) * 100) / 100);

  const hoje = new Date().toISOString().split('T')[0];
  const [modo, setModo] = useState<'total' | 'parcial'>('total');
  const [valor, setValor] = useState<number>(restante);
  const [data, setData] = useState(hoje);
  const [contaId, setContaId] = useState(financialAccounts.find(a => a.status === 'ativa')?.id ?? '');
  const [forma, setForma] = useState('Pix');
  const [observacao, setObservacao] = useState('');

  // Nota fiscal (só a receber)
  const notasDoCliente = invoices.filter(i => tr && i.clientId === tr.clientId && i.status !== 'cancelled');
  const [notaQuando, setNotaQuando] = useState<'antes' | 'depois' | 'sem_nota'>(tr?.notaQuando ?? 'depois');
  const [notaId, setNotaId] = useState(tr?.invoiceId ?? '');
  const [novaNotaNumero, setNovaNotaNumero] = useState('');
  const [novaNotaLink, setNovaNotaLink] = useState('');

  if (!item) return null;

  const nome = tr ? (clients.find(c => c.id === tr.clientId)?.name ?? 'Venda geral') : ap!.favorecido;
  const descricao = tr ? tr.description : ap!.descricao;
  const valorBaixa = modo === 'total' ? restante : Number(valor);
  const podeBaixar = !quitadoSemHistorico && restante > 0 && valorBaixa > 0 && valorBaixa <= restante + 0.005 && !!data;

  const vincularNota = (): string | undefined => {
    if (!tr || notaQuando === 'sem_nota') return undefined;
    if (notaId) return notaId;
    if (novaNotaNumero || novaNotaLink) {
      const nova = addInvoice({
        number: novaNotaNumero || 'sem número',
        clientId: tr.clientId ?? '',
        amount: tr.amount,
        issueDate: hoje,
        status: 'issued',
        link: novaNotaLink || undefined,
        transactionId: tr.id,
      });
      return nova.id;
    }
    return undefined;
  };

  const confirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeBaixar) return;
    const nId = vincularNota();
    registrarBaixa(tipo, id, {
      data,
      valor: Math.round(valorBaixa * 100) / 100,
      contaId: contaId || undefined,
      forma: forma || undefined,
      notaId: nId,
      observacao: observacao || undefined,
    }, tr ? { notaQuando } : undefined);
    onClose();
  };

  const salvarSoNota = () => {
    if (!tr) return;
    const nId = vincularNota();
    atualizarTransacao(tr.id, { notaQuando, invoiceId: nId ?? tr.invoiceId });
    onClose();
  };

  const notaVinculada = invoices.find(i => i.id === (tr?.invoiceId ?? ''));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{tipo === 'receber' ? 'Recebimento' : 'Pagamento'}: {nome}</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={confirmar}>
          <div className="modal-body">
            <p className="text-muted" style={{ marginTop: 0 }}>{descricao}</p>
            <div className="form-row">
              <div className="form-group"><label>Valor da conta</label><strong>{moeda(total)}</strong></div>
              <div className="form-group"><label>{tipo === 'receber' ? 'Já recebido' : 'Já pago'}</label><strong>{moeda(quitadoSemHistorico ? total : pago)}</strong></div>
              <div className="form-group"><label>Falta</label><strong>{moeda(quitadoSemHistorico ? 0 : restante)}</strong></div>
            </div>

            {(baixas.length > 0 || quitadoSemHistorico) && (
              <div className="form-group">
                <label>Histórico</label>
                <table className="premium-table">
                  <tbody>
                    {baixas.map(b => (
                      <tr key={b.id}>
                        <td>{dataBR(b.data)}</td>
                        <td className="fw-600">{moeda(b.valor)}</td>
                        <td style={{ fontSize: '0.75rem' }}>
                          {[financialAccounts.find(a => a.id === b.contaId)?.name, b.forma, b.observacao].filter(Boolean).join(' · ')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="btn btn-secondary btn-icon-text" onClick={() => desfazerBaixa(tipo, id, b.id)} title="Desfazer esta baixa">
                            <Undo2 size={12} /> Desfazer
                          </button>
                        </td>
                      </tr>
                    ))}
                    {quitadoSemHistorico && (
                      <tr>
                        <td colSpan={3}>Marcado como {tipo === 'receber' ? 'recebido' : 'pago'}{(tr?.paymentDate || ap?.dataPagamento) ? ` em ${dataBR(tr?.paymentDate || ap?.dataPagamento)}` : ''}, sem detalhes.</td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="btn btn-secondary btn-icon-text" onClick={() => desfazerBaixa(tipo, id)}>
                            <Undo2 size={12} /> Desfazer
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!quitadoSemHistorico && restante > 0 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Baixa</label>
                    <select className="form-select" value={modo} onChange={e => { const m = e.target.value as 'total' | 'parcial'; setModo(m); if (m === 'total') setValor(restante); }}>
                      <option value="total">Total ({moeda(restante)})</option>
                      <option value="parcial">Parcial</option>
                    </select>
                  </div>
                  {modo === 'parcial' && (
                    <div className="form-group">
                      <label>Valor {tipo === 'receber' ? 'recebido' : 'pago'} (R$)</label>
                      <input type="number" step="0.01" min="0.01" max={restante} className="form-control" value={valor || ''} onChange={e => setValor(Number(e.target.value))} required />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Dia</label>
                    <input type="date" className="form-control" value={data} onChange={e => setData(e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Conta</label>
                    <select className="form-select" value={contaId} onChange={e => setContaId(e.target.value)}>
                      <option value="">Não informar</option>
                      {financialAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Forma</label>
                    <select className="form-select" value={forma} onChange={e => setForma(e.target.value)}>
                      {['Pix', 'Boleto', 'Transferência', 'Dinheiro', 'Cartão', 'Compensação'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Observação</label>
                  <input type="text" className="form-control" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex: comprovante no WhatsApp" />
                </div>
              </>
            )}

            {tr && (
              <div className="form-group" style={{ borderTop: '1px solid var(--border-color, #1c2740)', paddingTop: '0.75rem' }}>
                <label>Nota fiscal</label>
                {notaVinculada ? (
                  <p style={{ margin: '0 0 0.5rem' }}>
                    Vinculada: nº {notaVinculada.number}
                    {notaVinculada.link && <> · <a href={notaVinculada.link} target="_blank" rel="noopener noreferrer">abrir</a></>}
                  </p>
                ) : null}
                <div className="form-row">
                  <div className="form-group">
                    <select className="form-select" value={notaQuando} onChange={e => setNotaQuando(e.target.value as typeof notaQuando)}>
                      <option value="antes">Emitir antes de receber</option>
                      <option value="depois">Emitir depois de receber</option>
                      <option value="sem_nota">Sem nota</option>
                    </select>
                  </div>
                  {notaQuando !== 'sem_nota' && notasDoCliente.length > 0 && (
                    <div className="form-group">
                      <select className="form-select" value={notaId} onChange={e => setNotaId(e.target.value)}>
                        <option value="">Vincular nota já emitida…</option>
                        {notasDoCliente.map(n => <option key={n.id} value={n.id}>nº {n.number} · {moeda(n.amount)} · {dataBR(n.issueDate)}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {notaQuando !== 'sem_nota' && !notaId && (
                  <div className="form-row">
                    <div className="form-group">
                      <input type="text" className="form-control" placeholder="Nº da nota emitida" value={novaNotaNumero} onChange={e => setNovaNotaNumero(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <input type="url" className="form-control" placeholder="Link da nota (PDF ou portal)" value={novaNotaLink} onChange={e => setNovaNotaLink(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Fechar</button>
            {tr && <button type="button" className="btn btn-secondary" onClick={salvarSoNota}>Salvar só a nota</button>}
            {!quitadoSemHistorico && restante > 0 && (
              <button type="submit" className="btn btn-primary btn-icon-text" disabled={!podeBaixar}>
                <Check size={14} /> Confirmar {modo === 'parcial' ? 'baixa parcial' : 'baixa'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
