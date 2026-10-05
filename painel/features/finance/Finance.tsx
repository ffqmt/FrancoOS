import React, { useState } from 'react';
import { useStore } from '../../data/store';
import type { AccountsPayable, AcaoFinanceira } from '../../types';
import { 
  Plus, X, ArrowUpRight, ArrowDownRight, FileText, Check, 
  Clock, Mail, MessageSquare 
} from 'lucide-react';

export const Finance: React.FC = () => {
  const { 
    transactions, invoices, accountsPayables, financialActions, clients, contracts,
    addTransaction, updateTransactionStatus, addInvoice,
    addAccountsPayable, updateAccountsPayableStatus,
    addFinancialAction, updateFinancialActionStatus
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'receivables' | 'payables' | 'invoices' | 'schedule'>('receivables');
  
  // Modals
  const [isAddReceivableOpen, setIsAddReceivableOpen] = useState(false);
  const [isAddPayableOpen, setIsAddPayableOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);

  // Form State Receivable (Transaction Income)
  const [recDesc, setRecDesc] = useState('');
  const [recAmount, setRecAmount] = useState(0);
  const [recDueDate, setRecDueDate] = useState('');
  const [recClientId, setRecClientId] = useState('');
  const [recCategory, setRecCategory] = useState<'mensalidade' | 'avulso' | 'outros'>('mensalidade');

  // Form State Payable (AccountsPayable)
  const [payFavorecido, setPayFavorecido] = useState('');
  const [payType, setPayType] = useState<AccountsPayable['tipo']>('fornecedor');
  const [payDesc, setPayDesc] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payDueDate, setPayDueDate] = useState('');
  const [payClientId, setPayClientId] = useState('');
  const [payContractId, setPayContractId] = useState('');
  const [payCategory, setPayCategory] = useState('infra');
  const [payNotes, setPayNotes] = useState('');

  // Form State Invoice
  const [invNumber, setInvNumber] = useState('');
  const [invClientId, setInvClientId] = useState('');
  const [invAmount, setInvAmount] = useState(0);
  const invDate = new Date().toISOString().split('T')[0];

  // Form State Action
  const [actType, setActType] = useState<AcaoFinanceira['tipo']>('enviar_lembrete');
  const [actDate, setActDate] = useState('');
  const [actResp, setActResp] = useState('');
  const [actClientId, setActClientId] = useState('');
  const [actContractId, setActContractId] = useState('');
  const [actCanal, setActCanal] = useState<AcaoFinanceira['canal']>('manual');
  const [actNotes, setActNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // --- Calculations ---

  // Receivables
  const totalReceber = transactions
    .filter(t => t.type === 'income' && t.status !== 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRecebidoMes = transactions
    .filter(t => t.type === 'income' && t.status === 'paid') // For MVP simplified, we sum paid income
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVencidoReceber = transactions
    .filter(t => t.type === 'income' && t.status !== 'paid' && t.dueDate < today)
    .reduce((sum, t) => sum + t.amount, 0);

  // Payables
  const totalPagar = accountsPayables
    .filter(p => p.status !== 'pago' && p.status !== 'cancelado')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPagoMes = accountsPayables
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalVencidoPagar = accountsPayables
    .filter(p => p.status !== 'pago' && p.status !== 'cancelado' && p.vencimento < today)
    .reduce((sum, p) => sum + p.valor, 0);

  // Invoices & Actions
  const notasPendentes = invoices.filter(i => i.status === 'draft' || i.status === 'cancelled').length; // draft/cancelled/prevista count
  const acoesAgendadasAtrasadas = financialActions.filter(a => a.status === 'agendada' || a.status === 'atrasada' || a.status === 'pendente').length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // --- Form Handlers ---

  const handleAddReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recDesc || !recAmount || !recDueDate) return;

    addTransaction({
      type: 'income',
      category: recCategory,
      description: recDesc,
      amount: Number(recAmount),
      dueDate: recDueDate,
      status: 'pending',
      clientId: recClientId || undefined
    });

    // Reset
    setRecDesc('');
    setRecAmount(0);
    setRecDueDate('');
    setRecClientId('');
    setIsAddReceivableOpen(false);
  };

  const handleAddPayable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFavorecido || !payAmount || !payDueDate) return;

    addAccountsPayable({
      favorecido: payFavorecido,
      tipo: payType,
      descricao: payDesc || `Pagamento para ${payFavorecido}`,
      valor: Number(payAmount),
      vencimento: payDueDate,
      status: 'aberto',
      categoria: payCategory,
      clienteId: payClientId || undefined,
      contratoId: payContractId || undefined,
      observacoes: payNotes || undefined
    });

    setPayFavorecido('');
    setPayDesc('');
    setPayAmount(0);
    setPayDueDate('');
    setPayClientId('');
    setPayContractId('');
    setPayNotes('');
    setIsAddPayableOpen(false);
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invNumber || !invClientId || !invAmount) return;

    addInvoice({
      number: invNumber,
      clientId: invClientId,
      amount: Number(invAmount),
      issueDate: invDate,
      status: 'issued' // Default to emitted for compatibility
    });

    // Auto-create income transaction
    const client = clients.find(c => c.id === invClientId);
    addTransaction({
      type: 'income',
      category: 'avulso',
      description: `NFS-e Faturada nº ${invNumber} - ${client?.name || 'Cliente'}`,
      amount: Number(invAmount),
      dueDate: invDate,
      status: 'paid',
      clientId: invClientId
    });

    setInvNumber('');
    setInvClientId('');
    setInvAmount(0);
    setIsAddInvoiceOpen(false);
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actDate || !actResp) return;

    addFinancialAction({
      tipo: actType,
      dataAgendada: actDate,
      responsavel: actResp,
      status: 'agendada',
      canal: actCanal,
      clienteId: actClientId || undefined,
      contratoId: actContractId || undefined,
      observacoes: actNotes || undefined
    });

    setActDate('');
    setActResp('');
    setActClientId('');
    setActContractId('');
    setActNotes('');
    setIsAddActionOpen(false);
  };

  const handleActionComplete = (id: string) => {
    updateFinancialActionStatus(id, 'concluida');
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'enviar_lembrete': return 'Enviar Lembrete';
      case 'enviar_cobranca': return 'Enviar Cobrança';
      case 'emitir_nota': return 'Emitir Nota';
      case 'enviar_nota': return 'Enviar Nota';
      case 'confirmar_recebimento': return 'Confirmar Recebimento';
      case 'liberar_comissao': return 'Liberar Comissão';
      case 'pagar_repasse': return 'Pagar Repasse';
      case 'enviar_comprovante': return 'Enviar Comprovante';
      case 'follow_up': return 'Follow-Up Financeiro';
      case 'cobrar_inadimplente': return 'Cobrar Inadimplente';
      default: return type;
    }
  };

  return (
    <div className="finance-container">
      {/* Cards de Métricas */}
      <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Receitas */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
          <div className="kpi-header">
            <span className="kpi-title">Total a Receber</span>
            <div className="kpi-icon-wrapper green">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="kpi-value income-text">{formatCurrency(totalReceber)}</div>
          <div className="kpi-subtext" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span>Recebido no mês: {formatCurrency(totalRecebidoMes)}</span>
            <span className="text-danger fw-600">Vencido: {formatCurrency(totalVencidoReceber)}</span>
          </div>
        </div>

        {/* Despesas / Pagar */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
          <div className="kpi-header">
            <span className="kpi-title">Total a Pagar</span>
            <div className="kpi-icon-wrapper red-icon">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="kpi-value expense-text">{formatCurrency(totalPagar)}</div>
          <div className="kpi-subtext" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span>Pago no mês: {formatCurrency(totalPagoMes)}</span>
            <span className="text-danger fw-600">Vencido a Pagar: {formatCurrency(totalVencidoPagar)}</span>
          </div>
        </div>

        {/* Notas */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
          <div className="kpi-header">
            <span className="kpi-title">Notas da Franco</span>
            <div className="kpi-icon-wrapper purple">
              <FileText size={20} />
            </div>
          </div>
          <div className="kpi-value text-primary">
            {invoices.length} NFS-e
          </div>
          <div className="kpi-subtext">
            <span className="text-warning fw-600">{notasPendentes} Notas pendentes de emissão</span>
          </div>
        </div>

        {/* Agenda */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
          <div className="kpi-header">
            <span className="kpi-title">Agenda Financeira</span>
            <div className="kpi-icon-wrapper orange">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value warning-text">
            {acoesAgendadasAtrasadas} Ações
          </div>
          <div className="kpi-subtext">
            <span>Ações de cobrança e notas pendentes</span>
          </div>
        </div>

      </div>

      {/* Navegação de Sub-Abas */}
      <div className="finance-tabs-nav">
        <button 
          className={`tab-btn ${activeSubTab === 'receivables' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('receivables')}
        >
          Contas a Receber
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'payables' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('payables')}
        >
          Contas a Pagar
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('invoices')}
        >
          Notas da Franco
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('schedule')}
        >
          Agenda Financeira
        </button>
      </div>

      {/* Painéis */}
      <div className="glass-card mt-1">
        
        {/* ABA 1: CONTAS A RECEBER */}
        {activeSubTab === 'receivables' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h4>Lançamentos e Receitas de Clientes</h4>
              <button className="btn btn-primary" onClick={() => setIsAddReceivableOpen(true)}>
                <Plus size={14} /> Registrar Lançamento
              </button>
            </div>
            
            <div className="table-container mt-1">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Descrição / Contrato</th>
                    <th>Forma Pgto</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.type === 'income')
                    .map(tr => {
                      const client = clients.find(c => c.id === tr.clientId);
                      const hasOverdue = tr.status !== 'paid' && tr.dueDate < today;
                      return (
                        <tr key={tr.id} className={hasOverdue ? 'row-overdue' : ''}>
                          <td className="fw-600">{client ? client.name : 'Venda Geral'}</td>
                          <td>
                            <div>
                              <span>{tr.description}</span>
                              <span className="client-sublabel" style={{ display: 'block', fontSize: '0.7rem' }}>
                                Categoria: {tr.category.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td>Pix / Boleto</td>
                          <td>{tr.dueDate}</td>
                          <td>
                            <span className="income-text fw-600">
                              + {formatCurrency(tr.amount)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              tr.status === 'paid' ? 'badge-success' : hasOverdue ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {tr.status === 'paid' ? 'Recebido' : hasOverdue ? 'Vencida' : 'Aberta'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {tr.status !== 'paid' ? (
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button 
                                  className="btn btn-secondary btn-icon-text"
                                  onClick={() => updateTransactionStatus(tr.id, 'paid')}
                                  title="Liquidar Recebimento"
                                >
                                  <Check size={12} /> Receber
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                                  Agendar Cobrança
                                </button>
                              </div>
                            ) : (
                              <button className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                                Ver Nota
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: CONTAS A PAGAR */}
        {activeSubTab === 'payables' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h4>Obrigações e Contas a Pagar</h4>
              <button className="btn btn-primary" onClick={() => setIsAddPayableOpen(true)}>
                <Plus size={14} /> Nova Conta a Pagar
              </button>
            </div>

            <div className="table-container mt-1">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Favorecido / Tipo</th>
                    <th>Descrição</th>
                    <th>Origem / Vínculo</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsPayables.map(ap => {
                    const client = ap.clienteId ? clients.find(c => c.id === ap.clienteId) : null;
                    const hasOverdue = ap.status !== 'pago' && ap.status !== 'cancelado' && ap.vencimento < today;
                    return (
                      <tr key={ap.id} className={hasOverdue ? 'row-overdue' : ''}>
                        <td>
                          <div className="client-table-info">
                            <span className="client-table-name">{ap.favorecido}</span>
                            <span className="badge badge-purple" style={{ alignSelf: 'flex-start', fontSize: '0.65rem', marginTop: '0.2rem' }}>
                              {ap.tipo.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td>{ap.descricao}</td>
                        <td>
                          {ap.repasseId ? (
                            <span className="badge badge-info">Repasse Vínculo ({ap.repasseId})</span>
                          ) : client ? (
                            <span style={{ fontSize: '0.75rem' }}>Cliente: {client.name}</span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Geral Franco</span>
                          )}
                        </td>
                        <td>{ap.vencimento}</td>
                        <td>
                          <span className="expense-text fw-600">
                            - {formatCurrency(ap.valor)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            ap.status === 'pago' ? 'badge-success' : hasOverdue ? 'badge-danger' : ap.status === 'previsto' ? 'badge-purple' : 'badge-warning'
                          }`}>
                            {ap.status === 'pago' ? 'Pago' : hasOverdue ? 'Vencido' : ap.status === 'previsto' ? 'Previsto' : 'Aberto'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {ap.status !== 'pago' && ap.status !== 'cancelado' && (
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-secondary btn-icon-text"
                                onClick={() => updateAccountsPayableStatus(ap.id, 'pago')}
                              >
                                <Check size={12} /> Liquidar Pago
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: NOTAS DA FRANCO */}
        {activeSubTab === 'invoices' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h4>Notas Emitidas pela Franco Tecnologia</h4>
              <button className="btn btn-primary" onClick={() => setIsAddInvoiceOpen(true)}>
                <Plus size={14} /> Emitir Nota da Franco
              </button>
            </div>

            <div className="table-container mt-1">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Competência / Emissão</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const client = clients.find(c => c.id === inv.clientId);
                    return (
                      <tr key={inv.id}>
                        <td>
                          <div className="contract-code-item">
                            <FileText size={14} className="contract-icon-ref" />
                            <span className="contract-ref">{inv.number}</span>
                          </div>
                        </td>
                        <td className="fw-600">{client ? client.name : 'Desconhecido'}</td>
                        <td>
                          <div>
                            <span>Emissão: {inv.issueDate}</span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Competência: Julho/2026
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="fw-600">{formatCurrency(inv.amount)}</span>
                        </td>
                        <td>
                          <span className={`badge ${inv.status === 'issued' ? 'badge-success' : 'badge-warning'}`}>
                            {inv.status === 'issued' ? 'Emitida' : 'Cancelada'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>Visualizar PDF</button>
                            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>Enviar E-mail</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: AGENDA FINANCEIRA */}
        {activeSubTab === 'schedule' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h4>Agenda Financeira e Ações Programadas</h4>
              <button className="btn btn-primary" onClick={() => setIsAddActionOpen(true)}>
                <Plus size={14} /> Agendar Nova Ação
              </button>
            </div>

            <div className="table-container mt-1">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Canal</th>
                    <th>Data Agendada</th>
                    <th>Cliente Relacionado</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {financialActions.map(action => {
                    const client = action.clienteId ? clients.find(c => c.id === action.clienteId) : null;
                    const hasOverdue = action.status !== 'concluida' && action.status !== 'cancelada' && action.dataAgendada < today;
                    return (
                      <tr key={action.id} className={hasOverdue ? 'row-overdue' : ''}>
                        <td>
                          <div className="client-table-info">
                            <span className="client-table-name" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              {action.tipo === 'enviar_cobranca' ? <Mail size={12} className="text-primary" /> : <MessageSquare size={12} className="text-primary" />}
                              {getActionLabel(action.tipo)}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{action.observacoes || 'Sem detalhes'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-label">{action.canal.toUpperCase()}</span>
                        </td>
                        <td>{action.dataAgendada}</td>
                        <td className="fw-600">{client ? client.name : 'Geral'}</td>
                        <td>{action.responsavel}</td>
                        <td>
                          <span className={`badge ${
                            action.status === 'concluida' ? 'badge-success' : hasOverdue ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {action.status === 'concluida' ? 'Concluída' : hasOverdue ? 'Atrasada' : 'Agendada'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {action.status !== 'concluida' && action.status !== 'cancelada' && (
                            <button 
                              className="btn btn-secondary btn-icon-text"
                              onClick={() => handleActionComplete(action.id)}
                            >
                              <Check size={12} /> Concluir Ação
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD RECEIVABLE */}
      {isAddReceivableOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Registrar Lançamento a Receber</h3>
              <button className="btn-icon" onClick={() => setIsAddReceivableOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddReceivable}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Descrição do Faturamento *</label>
                  <input type="text" className="form-control" value={recDesc} onChange={e => setRecDesc(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Valor (R$) *</label>
                    <input type="number" className="form-control" value={recAmount || ''} onChange={e => setRecAmount(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Vencimento *</label>
                    <input type="date" className="form-control" value={recDueDate} onChange={e => setRecDueDate(e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente Vinculado</label>
                    <select className="form-select" value={recClientId} onChange={e => setRecClientId(e.target.value)}>
                      <option value="">Nenhum (Lançamento Avulso)</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoria</label>
                    <select className="form-select" value={recCategory} onChange={e => setRecCategory(e.target.value as any)}>
                      <option value="mensalidade">Mensalidade Recorrente</option>
                      <option value="avulso">Avulso / Setup</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddReceivableOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYABLE */}
      {isAddPayableOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cadastrar Conta a Pagar</h3>
              <button className="btn-icon" onClick={() => setIsAddPayableOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddPayable}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Favorecido (Fornecedor/Parceiro) *</label>
                  <input type="text" className="form-control" placeholder="Ex: Hostgator, Carlos Indicador" value={payFavorecido} onChange={e => setPayFavorecido(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Descrição da Obrigação *</label>
                  <input type="text" className="form-control" placeholder="Ex: Servidor AWS, Comissão indicação" value={payDesc} onChange={e => setPayDesc(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Valor (R$) *</label>
                    <input type="number" className="form-control" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Vencimento *</label>
                    <input type="date" className="form-control" value={payDueDate} onChange={e => setPayDueDate(e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Despesa</label>
                    <select className="form-select" value={payType} onChange={e => setPayType(e.target.value as any)}>
                      <option value="fornecedor">Fornecedor Geral</option>
                      <option value="ferramenta">Ferramenta / Licença / SaaS</option>
                      <option value="prestador">Prestador Terceirizado</option>
                      <option value="comissao">Comissão Comercial</option>
                      <option value="repasse">Repasse Operacional</option>
                      <option value="imposto">Imposto / Taxa</option>
                      <option value="despesa">Outras Despesas</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoria Custo</label>
                    <input type="text" className="form-control" placeholder="Ex: infra, comissão" value={payCategory} onChange={e => setPayCategory(e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente Vinculado (Opcional)</label>
                    <select className="form-select" value={payClientId} onChange={e => setPayClientId(e.target.value)}>
                      <option value="">Nenhum</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contrato Vinculado (Opcional)</label>
                    <select className="form-select" value={payContractId} onChange={e => setPayContractId(e.target.value)}>
                      <option value="">Nenhum</option>
                      {contracts.map(c => {
                        const cl = clients.find(cl => cl.id === c.clientId);
                        return <option key={c.id} value={c.id}>{cl?.name || 'Cliente'} - {c.id.substring(0, 6)}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Observações</label>
                  <textarea className="form-control" value={payNotes} onChange={e => setPayNotes(e.target.value)} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddPayableOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EMIT INVOICE */}
      {isAddInvoiceOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Emitir Nota da Franco (NFS-e)</h3>
              <button className="btn-icon" onClick={() => setIsAddInvoiceOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Número do Documento NFS-e *</label>
                  <input type="text" className="form-control" placeholder="Ex: 20260005" value={invNumber} onChange={e => setInvNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Cliente Vinculado *</label>
                  <select className="form-select" value={invClientId} onChange={e => setInvClientId(e.target.value)} required>
                    <option value="">Selecione o Cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Valor (R$) *</label>
                    <input type="number" className="form-control" value={invAmount || ''} onChange={e => setInvAmount(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Competência / Mês de Referência</label>
                    <input type="text" className="form-control" placeholder="Ex: Julho/2026" defaultValue="Julho/2026" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddInvoiceOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Emitir NFS-e</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD FINANCIAL ACTION (AGENDA) */}
      {isAddActionOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Agendar Nova Ação Financeira</h3>
              <button className="btn-icon" onClick={() => setIsAddActionOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAction}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Ação *</label>
                    <select className="form-select" value={actType} onChange={e => setActType(e.target.value as any)}>
                      <option value="enviar_lembrete">Enviar Lembrete Vencimento</option>
                      <option value="enviar_cobranca">Enviar Fatura / Cobrança</option>
                      <option value="emitir_nota">Emitir Nota da Franco</option>
                      <option value="enviar_nota">Enviar Nota ao Cliente</option>
                      <option value="confirmar_recebimento">Confirmar Recebimento</option>
                      <option value="liberar_comissao">Liberar Comissão Parceiro</option>
                      <option value="pagar_repasse">Pagar Repasse Operacional</option>
                      <option value="enviar_comprovante">Enviar Comprovante de Repasse</option>
                      <option value="follow_up">Fazer Follow-up Financeiro</option>
                      <option value="cobrar_inadimplente">Cobrar Inadimplente</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Canal Comunicação</label>
                    <select className="form-select" value={actCanal} onChange={e => setActCanal(e.target.value as any)}>
                      <option value="manual">Manual / Telefone</option>
                      <option value="WhatsApp">WhatsApp Business</option>
                      <option value="e-mail">E-mail</option>
                      <option value="sistema">Notificação Interna (Sistema)</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Data Programada *</label>
                    <input type="date" className="form-control" value={actDate} onChange={e => setActDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Responsável *</label>
                    <input type="text" className="form-control" placeholder="Ex: Larissa Financeiro" value={actResp} onChange={e => setActResp(e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente Relacionado (Opcional)</label>
                    <select className="form-select" value={actClientId} onChange={e => setActClientId(e.target.value)}>
                      <option value="">Nenhum</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contrato Relacionado (Opcional)</label>
                    <select className="form-select" value={actContractId} onChange={e => setActContractId(e.target.value)}>
                      <option value="">Nenhum</option>
                      {contracts.map(c => {
                        const cl = clients.find(cl => cl.id === c.clientId);
                        return <option key={c.id} value={c.id}>{cl?.name || 'Cliente'} - {c.id.substring(0, 6)}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Instruções / Notas</label>
                  <textarea className="form-control" value={actNotes} onChange={e => setActNotes(e.target.value)} rows={2} placeholder="Ex: Enviar link Pix e PDF do contrato..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddActionOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Agendar Ação</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
