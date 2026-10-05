import React, { useState } from 'react';
import type { Contract, Task, AcaoFinanceira } from '../../../types';
import { useStore } from '../../../data/store';
import { 
  X, FileText, Paperclip, Edit2, Plus, Calendar, DollarSign, 
  CheckSquare, Shield, ExternalLink
} from 'lucide-react';
import { ContractFormDrawer } from './ContractFormDrawer';

interface ContractDetailDrawerProps {
  contract: Contract;
  onClose: () => void;
}

export const ContractDetailDrawer: React.FC<ContractDetailDrawerProps> = ({ contract, onClose }) => {
  const { 
    clients, services, tasks, transactions, invoices, companies,
    partnerRepayments, accountsPayables, financialActions, documents, historyEvents,
    contracts, partners, addTask, addFinancialAction, updateTaskStatus
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'financeiro' | 'parcerias' | 'operacao' | 'docs'>('geral');
  const [isEditing, setIsEditing] = useState(false);

  // Inline forms toggles
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingAction, setIsAddingAction] = useState(false);

  // New task inline state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // New action inline state
  const [newActionType, setNewActionType] = useState<AcaoFinanceira['tipo']>('enviar_lembrete');
  const [newActionDate, setNewActionDate] = useState('');
  const [newActionResp, setNewActionResp] = useState('');
  const [newActionChannel, setNewActionChannel] = useState<'sistema' | 'manual' | 'WhatsApp' | 'e-mail'>('WhatsApp');

  // Pull freshest contract data from store to update dynamically after editing
  const currentContract = contracts.find(c => c.id === contract.id) || contract;

  // Find relations
  const client = clients.find(c => c.id === currentContract.clientId);
  const service = services.find(s => s.id === currentContract.serviceId);
  const company = companies.find(comp => comp.id === currentContract.companyId);

  // Filter items
  const contractTasks = tasks.filter(t => t.contractId === currentContract.id || (t.clientId === currentContract.clientId && t.title.includes(currentContract.title || '')));
  const contractReceivables = transactions.filter(t => t.clientId === currentContract.clientId && t.type === 'income');
  const contractInvoices = invoices.filter(i => i.clientId === currentContract.clientId);
  const contractRepayments = partnerRepayments.filter(r => r.contratoId === currentContract.id);
  const contractPayables = accountsPayables.filter(p => p.contratoId === currentContract.id);
  const contractDocuments = documents.filter(d => d.contractId === currentContract.id);
  const contractActions = financialActions.filter(a => a.contratoId === currentContract.id);
  const contractHistory = historyEvents.filter(h => h.clientId === currentContract.clientId);

  // Linked partner from master registry
  const linkedPartnerId = currentContract.partnerRepaymentRule?.partnerId;
  const linkedPartner = linkedPartnerId ? partners.find(p => p.id === linkedPartnerId) : null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };


  // KPIs Calculations
  const totalContractVal = currentContract.monthlyValue;
  const openReceivablesVal = contractReceivables.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const overdueReceivablesVal = contractReceivables.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);
  const pendingInvoicesCount = contractInvoices.filter(i => i.status === 'draft').length;
  const openTasksCount = contractTasks.filter(t => t.status !== 'done').length;
  const totalRepaymentsVal = contractRepayments.reduce((sum, r) => sum + r.valor, 0);

  // Next Vencimento
  const pendingDates = contractReceivables
    .filter(r => r.status !== 'paid')
    .map(r => new Date(r.dueDate).getTime())
    .sort((a, b) => a - b);
  const nextDueDate = pendingDates.length > 0 ? new Date(pendingDates[0]).toLocaleDateString('pt-BR') : 'Sem pendências';

  // Next Scheduled Action
  const actionDates = contractActions
    .filter(a => a.status === 'agendada')
    .map(a => new Date(a.dataAgendada).getTime())
    .sort((a, b) => a - b);
  const nextActionDate = actionDates.length > 0 ? new Date(actionDates[0]).toLocaleDateString('pt-BR') : 'Nenhuma';

  // Handlers
  const handleViewClient360 = () => {
    window.dispatchEvent(
      new CustomEvent('navigate-to-tab', { 
        detail: { tab: 'clients', clientId: currentContract.clientId } 
      })
    );
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDueDate) return;

    addTask({
      title: newTaskTitle,
      description: `Demanda manual vinculada ao contrato ${currentContract.title}`,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      status: 'todo',
      assignee: newTaskAssignee || currentContract.responsible || 'Sem atribuição',
      clientId: currentContract.clientId,
      contractId: currentContract.id
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskAssignee('');
    setIsAddingTask(false);
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionDate || !newActionResp) return;

    addFinancialAction({
      tipo: newActionType,
      dataAgendada: newActionDate,
      responsavel: newActionResp,
      status: 'agendada',
      clienteId: currentContract.clientId,
      contratoId: currentContract.id,
      canal: newActionChannel,
      observacoes: 'Ação agendada manualmente na gaveta de contratos'
    });

    setNewActionDate('');
    setNewActionResp('');
    setIsAddingAction(false);
  };

  const handleToggleTaskStatus = (t: Task) => {
    const nextStatus = t.status === 'done' ? 'todo' : 'done';
    updateTaskStatus(t.id, nextStatus);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content drawer-large" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="drawer-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
            <div className="drawer-header-left" style={{ gap: '0.85rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.2 }}>{currentContract.title || 'Contrato Operacional'}</h3>
                <p className="text-sm text-secondary" style={{ margin: '0.2rem 0 0' }}>
                  {client?.name || 'Cliente'}{company ? ` • ${company.tradeName}` : ''}
                </p>
              </div>
            </div>
            <button className="btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
          {/* Badges row */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span className={`badge ${currentContract.status === 'active' ? 'badge-success' : currentContract.status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>
              {currentContract.status === 'active' ? '• Ativo' : currentContract.status === 'suspended' ? '⏸ Suspenso' : currentContract.status === 'expired' ? '■ Expirado' : 'Rascunho'}
            </span>
            <span className="badge badge-purple">{currentContract.billingType || 'Mensal'}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>#{currentContract.id.toUpperCase()}</span>
            {currentContract.partnerRepaymentRule?.hasPartner && (
              <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                🤝 Tem Parceiro
              </span>
            )}
          </div>
        </div>

        {/* BUTTON ACTION BAR */}
        <div className="action-buttons-bar">
          <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
            <Edit2 size={13} /> Editar Contrato
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsAddingTask(true)}>
            <Plus size={13} /> Nova Tarefa
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsAddingAction(true)}>
            <Calendar size={13} /> Agendar Ação
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleViewClient360}>
            <ExternalLink size={13} /> Ver Cliente 360º
          </button>
        </div>

        {/* SUMMARY KPI CARDS */}
        <div className="detail-kpis-grid">
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Valor do Contrato</span>
            <span className="kpi-val text-accent">{formatCurrency(totalContractVal)}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Aberto (Receber)</span>
            <span className="kpi-val text-info">{formatCurrency(openReceivablesVal)}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Vencido (Receber)</span>
            <span className="kpi-val text-danger">{formatCurrency(overdueReceivablesVal)}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Notas Pendentes</span>
            <span className="kpi-val text-warning">{pendingInvoicesCount}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Tarefas Abertas</span>
            <span className="kpi-val text-info">{openTasksCount}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Repasses Previstos</span>
            <span className="kpi-val text-purple">{formatCurrency(totalRepaymentsVal)}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Próximo Vencimento</span>
            <span className="kpi-val text-primary" style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>{nextDueDate}</span>
          </div>
          <div className="detail-kpi-card glass-card">
            <span className="kpi-title">Próxima Ação</span>
            <span className="kpi-val text-success" style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>{nextActionDate}</span>
          </div>
        </div>

        {/* SUB TAB NAVIGATION */}
        <div className="drawer-tabs">
          <button className={`drawer-tab-link ${activeSubTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveSubTab('geral')}>
            <FileText size={14} /> Contrato & Escopo
          </button>
          <button className={`drawer-tab-link ${activeSubTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveSubTab('financeiro')}>
            <DollarSign size={14} /> Financeiro & Notas
          </button>
          <button className={`drawer-tab-link ${activeSubTab === 'parcerias' ? 'active' : ''}`} onClick={() => setActiveSubTab('parcerias')}>
            <Shield size={14} /> Parceiros & Repasses
          </button>
          <button className={`drawer-tab-link ${activeSubTab === 'operacao' ? 'active' : ''}`} onClick={() => setActiveSubTab('operacao')}>
            <CheckSquare size={14} /> Demandas & Agenda
          </button>
          <button className={`drawer-tab-link ${activeSubTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveSubTab('docs')}>
            <Paperclip size={14} /> Docs & Histórico
          </button>
        </div>

        {/* INLINE FORMS PANEL OVERLAYS */}
        {isAddingTask && (
          <div className="inline-panel-overlay glass-card animate-fade">
            <div className="panel-header">
              <h5>Adicionar Demanda ao Contrato</h5>
              <button className="btn-icon btn-sm" onClick={() => setIsAddingTask(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="panel-body">
              <div className="form-group">
                <label>Título da Tarefa *</label>
                <input type="text" className="form-control" placeholder="Ex: Solicitar balanço de abertura" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Vencimento *</label>
                  <input type="date" className="form-control" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Prioridade</label>
                  <select className="form-select" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Responsável</label>
                <input type="text" className="form-control" placeholder="Ex: Thiago Fiscal" value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingTask(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-sm"><Plus size={12} /> Adicionar</button>
              </div>
            </form>
          </div>
        )}

        {isAddingAction && (
          <div className="inline-panel-overlay glass-card animate-fade">
            <div className="panel-header">
              <h5>Agendar Ação Financeira</h5>
              <button className="btn-icon btn-sm" onClick={() => setIsAddingAction(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreateAction} className="panel-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Ação *</label>
                  <select className="form-select" value={newActionType} onChange={e => setNewActionType(e.target.value as any)}>
                    <option value="enviar_cobranca">Enviar Cobrança</option>
                    <option value="emitir_nota">Emitir Nota da Franco</option>
                    <option value="enviar_nota">Enviar Nota ao Cliente</option>
                    <option value="confirmar_recebimento">Confirmar Recebimento</option>
                    <option value="liberar_comissao">Liberar Comissão</option>
                    <option value="pagar_repasse">Pagar Repasse</option>
                    <option value="follow_up">Cobrança Preventiva</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data Programada *</label>
                  <input type="date" className="form-control" value={newActionDate} onChange={e => setNewActionDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Responsável *</label>
                  <input type="text" className="form-control" placeholder="Ex: Larissa Financeiro" value={newActionResp} onChange={e => setNewActionResp(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Canal</label>
                  <select 
                    className="form-select" 
                    value={newActionChannel} 
                    onChange={e => setNewActionChannel(e.target.value as any)}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="e-mail">E-mail</option>
                    <option value="sistema">Sistema / Interno</option>
                    <option value="manual">Manual / Telefone</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingAction(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-sm"><Calendar size={12} /> Agendar</button>
              </div>
            </form>
          </div>
        )}

        {/* BODY TAB PANES */}
        <div className="drawer-body">
          
          {/* TAB 1: CONTRATO & ESCOPO */}
          {activeSubTab === 'geral' && (
            <div className="tab-pane-content animate-fade">
              
              {/* SECTION: ESCOPO */}
              <div className="content-section">
                <h4 className="section-title-drawer">1. Escopo & SLA Combinado</h4>
                <div className="scope-grid mt-1">
                  <div className="scope-field">
                    <strong>Descrição do Escopo:</strong>
                    <p>{currentContract.scopeDescription || 'Nenhum escopo detalhado cadastrado.'}</p>
                  </div>
                  <div className="scope-field">
                    <strong>Entregáveis Contratados:</strong>
                    <p>{currentContract.deliverables || 'Não informado.'}</p>
                  </div>
                  <div className="scope-field">
                    <strong>Limites / Fora de Escopo:</strong>
                    <p>{currentContract.exclusions || 'Não informado.'}</p>
                  </div>
                  <div className="scope-field">
                    <strong>Acordo de SLA:</strong>
                    <p>{currentContract.sla || 'Padrão corporativo (48h).'}</p>
                  </div>
                </div>
              </div>

              {/* SECTION: SERVIÇO PRINCIPAL */}
              <div className="content-section mt-2">
                <h4 className="section-title-drawer">2. Serviço Contratado (Fórmula Comercial)</h4>
                <div className="form-row mt-1 text-sm">
                  <div><strong>Serviço Associado:</strong> {service?.name || 'Serviço Personalizado'}</div>
                  <div><strong>Categoria:</strong> {service?.category.toUpperCase() || 'CORE'}</div>
                  <div><strong>Gera Nota da Franco:</strong> {currentContract.generatesInvoice ? 'Sim' : 'Não'}</div>
                  <div><strong>Módulos Relacionados:</strong> {service?.category === 'contabilidade' ? 'Contábil, Fiscal' : 'Automações, Projetos'}</div>
                </div>
              </div>

              {/* SECTION: PRECIFICAÇÃO */}
              <div className="content-section mt-2">
                <h4 className="section-title-drawer">3. Precificação & Recorrência</h4>
                <div className="form-row mt-1 text-sm">
                  <div><strong>Valor Periódico:</strong> {formatCurrency(totalContractVal)}</div>
                  <div><strong>Tipo de Cobrança:</strong> {currentContract.billingType || 'Mensal'}</div>
                  <div><strong>Recorrência:</strong> {currentContract.recurrence || 'Mensal'}</div>
                  <div><strong>Dia de Vencimento:</strong> Todo dia {currentContract.dueDay || 10}</div>
                  <div><strong>Forma de Pagamento:</strong> {currentContract.paymentMethod || 'Boleto'}</div>
                  <div><strong>Condição:</strong> {currentContract.paymentTerms || 'D+0'}</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FINANCEIRO & NOTAS */}
          {activeSubTab === 'financeiro' && (
            <div className="tab-pane-content animate-fade">
              
              {/* SECTION: COBRANÇAS / CONTAS A RECEBER */}
              <div className="content-section">
                <h4 className="section-title-drawer">4. Cobranças / Contas a Receber Vinculadas</h4>
                <div className="glass-card mt-1 table-container">
                  {contractReceivables.length === 0 ? (
                    <p className="text-muted text-sm italic" style={{ padding: '1rem', margin: 0 }}>Nenhuma cobrança registrada.</p>
                  ) : (
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractReceivables.map(r => (
                          <tr key={r.id}>
                            <td>{r.description}</td>
                            <td>{r.dueDate}</td>
                            <td className="font-semibold">{formatCurrency(r.amount)}</td>
                            <td>
                              <span className={`badge ${r.status === 'paid' ? 'badge-success' : r.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                                {r.status === 'paid' ? 'Pago' : r.status === 'overdue' ? 'Vencido' : 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* SECTION: NOTAS DA FRANCO */}
              <div className="content-section mt-2">
                <h4 className="section-title-drawer">5. Notas da Franco (NFS-e Emitidas / Planejadas)</h4>
                <div className="glass-card mt-1 table-container">
                  {contractInvoices.length === 0 ? (
                    <p className="text-muted text-sm italic" style={{ padding: '1rem', margin: 0 }}>Nenhuma Nota da Franco registrada.</p>
                  ) : (
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>NFS-e</th>
                          <th>Emissão</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractInvoices.map(inv => (
                          <tr key={inv.id}>
                            <td className="font-semibold">NFS-e #{inv.number}</td>
                            <td>{inv.issueDate}</td>
                            <td className="font-semibold">{formatCurrency(inv.amount)}</td>
                            <td>
                              <span className={`badge ${inv.status === 'issued' ? 'badge-success' : 'badge-warning'}`}>
                                {inv.status === 'issued' ? 'Emitida' : 'Provisória'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* SECTION: CONTAS A PAGAR DERIVADAS */}
              <div className="content-section mt-2">
                <h4 className="section-title-drawer">7. Contas a Pagar Derivadas (Prestadores / Custos)</h4>
                <div className="glass-card mt-1 table-container">
                  {contractPayables.length === 0 ? (
                    <p className="text-muted text-sm italic" style={{ padding: '1rem', margin: 0 }}>Nenhuma conta a pagar vinculada a este contrato.</p>
                  ) : (
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Favorecido</th>
                          <th>Descrição</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractPayables.map(cp => (
                          <tr key={cp.id}>
                            <td>{cp.favorecido}</td>
                            <td>{cp.descricao}</td>
                            <td>{cp.vencimento}</td>
                            <td className="text-danger font-semibold">{formatCurrency(cp.valor)}</td>
                            <td>
                              <span className={`badge ${cp.status === 'pago' ? 'badge-success' : 'badge-warning'}`}>
                                {cp.status === 'pago' ? 'Pago' : 'Aberto'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PARCEIROS & REPASSES */}
          {activeSubTab === 'parcerias' && (
            <div className="tab-pane-content animate-fade">
              
              {/* Linked Partner Master Card */}
              {linkedPartner && (
                <div className="content-section">
                  <h4 className="section-title-drawer">Parceiro Cadastrado (Cadastro Mestre)</h4>
                  <div className="glass-card mt-1" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{linkedPartner.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {linkedPartner.partnerType === 'parceiro_comercial' ? 'Parceiro Comercial' : linkedPartner.partnerType === 'parceiro_entrega' ? 'Parceiro de Entrega' : linkedPartner.partnerType === 'prestador' ? 'Prestador' : linkedPartner.partnerType === 'indicador' ? 'Indicador' : linkedPartner.partnerType}
                          {linkedPartner.document && ` • ${linkedPartner.document}`}
                        </div>
                      </div>
                      <span className={`badge ${linkedPartner.status === 'ativo' ? 'badge-success' : 'badge-warning'}`}>{linkedPartner.status.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                      {linkedPartner.email && <div><span className="text-muted">E-mail:</span> {linkedPartner.email}</div>}
                      {linkedPartner.phone && <div><span className="text-muted">Telefone:</span> {linkedPartner.phone}</div>}
                      {linkedPartner.pixKey && <div><span className="text-muted">PIX:</span> {linkedPartner.pixKey}</div>}
                      {linkedPartner.paymentMethod && <div><span className="text-muted">Pagamento:</span> {linkedPartner.paymentMethod}</div>}
                      {linkedPartner.defaultRepaymentRule && <div><span className="text-muted">Regra padrão:</span> {linkedPartner.defaultRepaymentRule === 'percentual' ? `${linkedPartner.defaultPercentage}%` : `R$ ${linkedPartner.defaultFixedAmount}`}</div>}
                      {linkedPartner.defaultReleaseCondition && <div><span className="text-muted">Condição:</span> {linkedPartner.defaultReleaseCondition}</div>}
                    </div>
                    {currentContract.partnerRepaymentRule?.customized && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        ⚠️ Regra personalizada para este contrato (difere do padrão do parceiro)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: PARCEIROS & REPASSES */}
              <div className="content-section" style={{ marginTop: linkedPartner ? '1.5rem' : 0 }}>
                <h4 className="section-title-drawer">Repasses Comerciais Vinculados</h4>
                {contractRepayments.length === 0 ? (
                  <div className="glass-card mt-1" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <p className="text-muted text-sm italic margin-0">Este contrato não possui nenhuma regra de comissão ou repasse configurado.</p>
                  </div>
                ) : (
                  <div className="glass-card mt-1 table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Parceiro</th>
                          <th>Tipo</th>
                          <th>Regra</th>
                          <th>Condição</th>
                          <th>Valor Previsto</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractRepayments.map(rep => (
                          <tr key={rep.id}>
                            <td className="font-semibold">{rep.parceiro}</td>
                            <td>{rep.tipo.toUpperCase()}</td>
                            <td>{rep.regra === 'percentual' ? `${rep.percentual}%` : 'Fixo'}</td>
                            <td>{rep.condicao.toUpperCase()}</td>
                            <td className="font-semibold text-accent">{formatCurrency(rep.valor)}</td>
                            <td>
                              <span className={`badge ${rep.status === 'pago' ? 'badge-success' : rep.status === 'liberado' ? 'badge-info' : 'badge-warning'}`}>
                                {rep.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: DEMANDAS & AGENDA */}
          {activeSubTab === 'operacao' && (
            <div className="tab-pane-content animate-fade">
              
              {/* SECTION: TAREFAS */}
              <div className="content-section">
                <h4 className="section-title-drawer">8. Demandas & Tarefas Associadas ao Contrato</h4>
                <div className="glass-card mt-1 table-container">
                  {contractTasks.length === 0 ? (
                    <p className="text-muted text-sm italic" style={{ padding: '1rem', margin: 0 }}>Nenhuma tarefa operacional pendente.</p>
                  ) : (
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Tarefa</th>
                          <th>Status</th>
                          <th>Prioridade</th>
                          <th>Responsável</th>
                          <th>Prazo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractTasks.map(t => (
                          <tr key={t.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={t.status === 'done'} onChange={() => handleToggleTaskStatus(t)} />
                                <span style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${t.status === 'done' ? 'badge-success' : 'badge-warning'}`}>
                                {t.status === 'done' ? 'Concluída' : 'Pendente'}
                              </span>
                            </td>
                            <td>{t.priority.toUpperCase()}</td>
                            <td>{t.assignee}</td>
                            <td>{t.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* SECTION: AGENDA FINANCEIRA */}
              <div className="content-section mt-2">
                <h4 className="section-title-drawer">10. Agenda Financeira (Ações Programadas)</h4>
                <div className="glass-card mt-1 table-container">
                  {contractActions.length === 0 ? (
                    <p className="text-muted text-sm italic" style={{ padding: '1rem', margin: 0 }}>Nenhuma ação de cobrança ou faturamento programada.</p>
                  ) : (
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Ação</th>
                          <th>Data Programada</th>
                          <th>Canal</th>
                          <th>Responsável</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractActions.map(act => (
                          <tr key={act.id}>
                            <td className="font-semibold">{act.tipo.replace('_', ' ').toUpperCase()}</td>
                            <td>{act.dataAgendada}</td>
                            <td>{act.canal}</td>
                            <td>{act.responsavel}</td>
                            <td>
                              <span className={`badge ${act.status === 'concluida' ? 'badge-success' : 'badge-warning'}`}>
                                {act.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: DOCS & HISTÓRICO */}
          {activeSubTab === 'docs' && (
            <div className="tab-pane-content animate-fade">
              
              {/* SECTION: DOCUMENTOS */}
              <div className="content-section">
                <h4 className="section-title-drawer">9. Documentos Esperados & Armazenados</h4>
                <div className="glass-card mt-1" style={{ padding: '1rem' }}>
                  {contractDocuments.length === 0 ? (
                    <p className="text-muted text-sm italic margin-0">Nenhum documento arquivado ou exigido no escopo.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {contractDocuments.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Paperclip size={14} className="text-accent" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="text-sm font-semibold">{doc.name}</span>
                              <span className="text-xs text-muted">Tipo: {doc.type} | Upload em: {doc.uploadDate}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted">{doc.fileSize}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: HISTÓRICO */}
              <div className="content-section mt-2">
                <h4 className="section-title-drawer">11. Histórico Operacional do Contrato</h4>
                <div className="glass-card mt-1" style={{ padding: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {contractHistory.length === 0 ? (
                    <p className="text-muted text-sm italic margin-0">Nenhum evento registrado.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {contractHistory.map(evt => (
                        <div key={evt.id} style={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                            <span>{evt.date}</span>
                            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{evt.type.toUpperCase()}</span>
                          </div>
                          <strong className="text-primary">{evt.title}</strong>
                          {evt.description && <p className="text-muted text-xs margin-0 mt-05">{evt.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar Painel
          </button>
        </div>

        {/* RENDER EDITING DRAWER OVERLAY */}
        {isEditing && (
          <ContractFormDrawer 
            contract={currentContract} 
            onClose={() => setIsEditing(false)} 
          />
        )}


      </div>
    </div>
  );
};
