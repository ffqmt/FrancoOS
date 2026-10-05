import React, { useState } from 'react';
import { useStore } from '../../data/store';
import type { PartnerRepayment, Partner } from '../../types';
import { Award, DollarSign, Calendar, X, AlertCircle, Check, Plus, Search, User, Eye, Edit2, FileText, ArrowRight } from 'lucide-react';
import { PartnerFormDrawer } from './components/PartnerFormDrawer';
import { PartnerDetailDrawer } from './components/PartnerDetailDrawer';

type SubTabType = 'parceiros' | 'repayments' | 'payables' | 'combinados';

export const PartnersRepayments: React.FC = () => {
  const { 
    partnerRepayments, clients, partners, accountsPayables, contracts,
    updatePartnerRepaymentStatus 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('parceiros');

  // Drawers State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<Partner | null>(null);
  const [selectedPartnerForDetail, setSelectedPartnerForDetail] = useState<Partner | null>(null);

  // General States
  const [selectedRepayment, setSelectedRepayment] = useState<PartnerRepayment | null>(null);
  const [filterPartner, setFilterPartner] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchPartnerQuery, setSearchPartnerQuery] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Repayments KPIs
  const totalPrevisto = partnerRepayments
    .filter(r => r.status === 'previsto' || r.status === 'aguardando_recebimento')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalLiberado = partnerRepayments
    .filter(r => r.status === 'liberado')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalPago = partnerRepayments
    .filter(r => r.status === 'pago')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalPendente = partnerRepayments
    .filter(r => r.status !== 'pago' && r.status !== 'cancelado')
    .reduce((sum, r) => sum + r.valor, 0);

  const awaitingReceivalCount = partnerRepayments
    .filter(r => r.status === 'aguardando_recebimento').length;

  // Filtered lists
  const filteredRepayments = partnerRepayments.filter(r => {
    const matchesPartner = r.parceiro.toLowerCase().includes(filterPartner.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    return matchesPartner && matchesStatus;
  });

  const filteredPartners = partners.filter(p => {
    return p.name.toLowerCase().includes(searchPartnerQuery.toLowerCase()) || 
           p.email.toLowerCase().includes(searchPartnerQuery.toLowerCase()) ||
           (p.contactName && p.contactName.toLowerCase().includes(searchPartnerQuery.toLowerCase()));
  });

  // Filter accounts payables related to partner repayments or with repasseId
  const partnerPayables = accountsPayables.filter(ap => {
    return ap.repasseId !== undefined || ap.tipo === 'repasse' || ap.tipo === 'comissao';
  });

  const getStatusBadge = (status: PartnerRepayment['status']) => {
    switch (status) {
      case 'pago': return 'badge-success';
      case 'liberado': return 'badge-info';
      case 'aguardando_recebimento': return 'badge-warning';
      case 'previsto': return 'badge-purple';
      case 'cancelado': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'liberado': return 'Liberado (Conta a Pagar)';
      case 'aguardando_recebimento': return 'Aguardando Receber';
      case 'previsto': return 'Previsto';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'indicacao': return 'Indicação';
      case 'comissao': return 'Comissão';
      case 'parceiro': return 'Parceiro';
      case 'prestador': return 'Prestador';
      case 'repasse': return 'Repasse';
      default: return type;
    }
  };

  const getPartnerTypeLabel = (type: Partner['partnerType']) => {
    switch (type) {
      case 'parceiro_comercial': return 'Parceiro Comercial';
      case 'indicador': return 'Indicador';
      case 'parceiro_entrega': return 'BPO/Entrega';
      case 'prestador': return 'Prestador';
      case 'consultor': return 'Consultor';
      case 'afiliado': return 'Afiliado';
      case 'fornecedor': return 'Fornecedor';
      default: return 'Outro';
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'venda': return 'Na Venda';
      case 'recebimento': return 'No Recebimento';
      case 'mensal': return 'Mensal';
      case 'manual': return 'Manual';
      default: return cond;
    }
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updatePartnerRepaymentStatus(id, newStatus);
    if (selectedRepayment && selectedRepayment.id === id) {
      setSelectedRepayment({
        ...selectedRepayment,
        status: newStatus
      });
    }
  };

  const getPartnerTotals = (pt: Partner) => {
    const ptComms = partnerRepayments.filter(r => r.partnerId === pt.id || r.parceiro === pt.name);
    const previsto = ptComms
      .filter(r => r.status === 'previsto' || r.status === 'aguardando_recebimento')
      .reduce((sum, r) => sum + r.valor, 0);
    const pago = ptComms
      .filter(r => r.status === 'pago')
      .reduce((sum, r) => sum + r.valor, 0);
    const totalContratos = contracts.filter(c => c.partnerId === pt.id).length;
    return { previsto, pago, totalContratos };
  };

  const handleEditPartner = (p: Partner) => {
    setSelectedPartnerForEdit(p);
    setIsFormOpen(true);
  };

  const handleCreatePartner = () => {
    setSelectedPartnerForEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="partners-repayments-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* KPI Cards */}
      <div className="grid-cols-4">
        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Previsto a Repassar</span>
            <div className="kpi-icon-wrapper purple">
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value text-primary">{formatCurrency(totalPrevisto)}</div>
          <div className="kpi-subtext">Aguardando recebimento/mensalidades</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Liberado (Contas a Pagar)</span>
            <div className="kpi-icon-wrapper green">
              <Check size={20} />
            </div>
          </div>
          <div className="kpi-value income-text">{formatCurrency(totalLiberado)}</div>
          <div className="kpi-subtext">Integrado no contas a pagar aberto</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Pago aos Parceiros</span>
            <div className="kpi-icon-wrapper purple">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value text-primary">{formatCurrency(totalPago)}</div>
          <div className="kpi-subtext">Total liquidado com sucesso</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Aguardando Cliente</span>
            <div className="kpi-icon-wrapper orange">
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value warning-text">{awaitingReceivalCount} comissões</div>
          <div className="kpi-subtext">Total pendente: {formatCurrency(totalPendente)}</div>
        </div>
      </div>

      {/* Main Tab Menu */}
      <div className="drawer-tabs" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.2rem', marginBottom: '0.5rem' }}>
        <button 
          className={`drawer-tab ${activeSubTab === 'parceiros' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('parceiros')}
        >
          <User size={15} /> Cadastro de Parceiros ({partners.length})
        </button>
        <button 
          className={`drawer-tab ${activeSubTab === 'repayments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('repayments')}
        >
          <Award size={15} /> Repasses & Comissões ({partnerRepayments.length})
        </button>
        <button 
          className={`drawer-tab ${activeSubTab === 'payables' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('payables')}
        >
          <DollarSign size={15} /> Contas a Pagar Vinculadas ({partnerPayables.length})
        </button>
        <button 
          className={`drawer-tab ${activeSubTab === 'combinados' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('combinados')}
        >
          <FileText size={15} /> Regras & Combinados Mestre
        </button>
      </div>

      {/* TAB 1: PARCEIROS */}
      {activeSubTab === 'parceiros' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Parceiros Estratégicos & Prestadores Mestre</h3>
              <p className="text-xs text-muted mt-0.2">Cadastro central de pessoas físicas e jurídicas para comissões e repasses.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Filtrar parceiro..." 
                  value={searchPartnerQuery}
                  onChange={e => setSearchPartnerQuery(e.target.value)}
                  style={{ width: '220px', paddingLeft: '28px' }}
                />
              </div>
              <button className="btn btn-primary" onClick={handleCreatePartner}>
                <Plus size={16} /> Novo Parceiro
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nome do Parceiro</th>
                  <th>Tipo</th>
                  <th>Contato / Canal</th>
                  <th>Regra Geral</th>
                  <th>Contratos</th>
                  <th>Previsto</th>
                  <th>Total Pago</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      Nenhum parceiro encontrado com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map(p => {
                    const { previsto, pago, totalContratos } = getPartnerTotals(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="fw-600">{p.name}</span>
                            <span className="text-xs text-muted">{p.document || 'Sem doc.'} • {p.personType}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-label">{getPartnerTypeLabel(p.partnerType)}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                            <span>{p.email}</span>
                            <span className="text-secondary">{p.phone}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-xs">
                            {p.defaultRepaymentRule === 'percentual' 
                              ? `${p.defaultPercentage}% (Faturamento)` 
                              : p.defaultRepaymentRule === 'fixo' 
                                ? `${formatCurrency(p.defaultFixedAmount || 0)} (Fixo)` 
                                : 'Manual/Combinado'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info">{totalContratos} contrato(s)</span>
                        </td>
                        <td>
                          <span className="fw-600 text-primary">{formatCurrency(previsto)}</span>
                        </td>
                        <td>
                          <span className="fw-600 text-success">{formatCurrency(pago)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-icon" 
                              onClick={() => handleEditPartner(p)}
                              title="Editar cadastro"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-ghost btn-sm" 
                              onClick={() => setSelectedPartnerForDetail(p)}
                            >
                              <Eye size={13} /> Ficha
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REPASSES & COMISSÕES */}
      {activeSubTab === 'repayments' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Comissões e Repasses Operacionais</h3>
              <p className="text-xs text-muted mt-0.2">Lista de lançamentos de repasses individuais gerados a partir de contratos ou sob demanda.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar por parceiro..." 
                value={filterPartner}
                onChange={e => setFilterPartner(e.target.value)}
                style={{ width: '200px' }}
              />
              <select 
                className="form-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="all">Todos os Status</option>
                <option value="previsto">Previsto</option>
                <option value="aguardando_recebimento">Aguardando Recebimento</option>
                <option value="liberado">Liberado</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Parceiro / Favorecido</th>
                  <th>Tipo</th>
                  <th>Cliente Vinculado</th>
                  <th>Condição</th>
                  <th>Regra</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      Nenhum repasse comercial ou técnico encontrado com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredRepayments.map(rep => {
                    const client = clients.find(c => c.id === rep.clienteId);
                    return (
                      <tr key={rep.id}>
                        <td className="fw-600">{rep.parceiro}</td>
                        <td>
                          <span className="category-label">{getTypeLabel(rep.tipo)}</span>
                        </td>
                        <td>{client ? client.name : 'Desconhecido'}</td>
                        <td>{getConditionLabel(rep.condicao)}</td>
                        <td>
                          {rep.regra === 'percentual' ? `${rep.percentual}% de fatura` : 'Valor Fixo'}
                        </td>
                        <td>
                          <span className="fw-600 text-primary">{formatCurrency(rep.valor)}</span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(rep.status)}`}>
                            {getStatusLabel(rep.status)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRepayment(rep)}>
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTAS A PAGAR VINCULADAS */}
      {activeSubTab === 'payables' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Contas a Pagar Vinculadas a Repasses</h3>
            <p className="text-xs text-muted mt-0.2">Visualização unificada de todas as obrigações financeiras geradas automaticamente a partir da liberação de comissões.</p>
          </div>

          <div className="table-container mt-2">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Descrição da Obrigação</th>
                  <th>Favorecido</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Categoria</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {partnerPayables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                      Nenhuma conta a pagar vinculada a parceiros no momento.
                    </td>
                  </tr>
                ) : (
                  partnerPayables.map(payable => (
                    <tr key={payable.id}>
                      <td className="fw-600">{payable.descricao}</td>
                      <td>{payable.favorecido}</td>
                      <td>{payable.vencimento}</td>
                      <td>
                        <span className="fw-600 warning-text">{formatCurrency(payable.valor)}</span>
                      </td>
                      <td>
                        <span className="category-label">{payable.categoria.toUpperCase()}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          payable.status === 'pago' ? 'badge-success' : 
                          payable.status === 'vencido' ? 'badge-danger' : 
                          payable.status === 'cancelado' ? 'badge-secondary' : 'badge-warning'
                        }`}>
                          {payable.status === 'pago' ? 'Pago' : payable.status === 'vencido' ? 'Vencido' : payable.status === 'cancelado' ? 'Cancelado' : 'Aberto'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HISTÓRICO / COMBINADOS */}
      {activeSubTab === 'combinados' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Políticas de Acordos e Combinados Mestre</h3>
            <p className="text-xs text-muted mt-0.2">Resumo dos acordos e notas fiscais/financeiras pré-estabelecidas com parceiros operacionais.</p>
          </div>

          <div className="grid-cols-2 mt-2" style={{ gap: '1.25rem' }}>
            {partners.map(p => (
              <div key={p.id} className="info-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }} className="text-accent">{p.name}</h5>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{getPartnerTypeLabel(p.partnerType)}</span>
                  </div>
                  <div className="kv-grid" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                    <div className="kv-item">
                      <span className="kv-label">Regra Geral</span>
                      <span className="kv-value">
                        {p.defaultRepaymentRule === 'percentual' 
                          ? `${p.defaultPercentage}% sobre mensalidade` 
                          : p.defaultRepaymentRule === 'fixo' 
                            ? `${formatCurrency(p.defaultFixedAmount || 0)} Fixo` 
                            : 'Manual / Projeto'}
                      </span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Liberação</span>
                      <span className="kv-value" style={{ textTransform: 'capitalize' }}>{p.defaultReleaseCondition || 'No recebimento'}</span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Prazo Financeiro</span>
                      <span className="kv-value">
                        {p.defaultPaymentTerm === '10_dias' ? 'D+10 da liberação' : 
                         p.defaultPaymentTerm === '5_dias' ? 'D+5 da liberação' : 
                         p.defaultPaymentTerm === 'imediato' ? 'Imediato' : 'Próximo Ciclo'}
                      </span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Método preferencial</span>
                      <span className="kv-value">{p.paymentMethod} {p.pixKey && `(Pix: ${p.pixKey.substring(0,18)}...)`}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Acordo e Combinado</span>
                    <p className="text-sm text-secondary" style={{ fontStyle: 'italic', margin: 0 }}>
                      "{p.notes || 'Nenhum combinado específico cadastrado.'}"
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedPartnerForDetail(p)}>
                    Ver Detalhes do Parceiro <ArrowRight size={12} style={{ marginLeft: '0.25rem' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Repasse Modal */}
      {selectedRepayment && (
        <div className="modal-overlay">
          <div className="modal-content drawer-mode" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award className="text-primary" size={20} />
                <div>
                  <h3 style={{ margin: 0 }}>Detalhe do Repasse / Comissão</h3>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Ref: {selectedRepayment.id.toUpperCase()}</span>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedRepayment(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div className="grid-cols-2" style={{ gap: '1rem' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Parceiro Favorecido</span>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedRepayment.parceiro}</strong>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Status Atual</span>
                    <span className={`badge ${getStatusBadge(selectedRepayment.status)}`} style={{ marginTop: '0.2rem', display: 'inline-block' }}>
                      {getStatusLabel(selectedRepayment.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Tipo de Parceria:</span>
                  <span className="fw-600">{getTypeLabel(selectedRepayment.tipo)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Regra de Cálculo:</span>
                  <span className="fw-600">
                    {selectedRepayment.regra === 'percentual' ? `${selectedRepayment.percentual}% do contrato` : 'Valor Fixo'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Condição de Liberação:</span>
                  <span className="fw-600">{getConditionLabel(selectedRepayment.condicao)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Valor do Repasse:</span>
                  <strong className="text-primary">{formatCurrency(selectedRepayment.valor)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Data Prevista:</span>
                  <span className="fw-600">{selectedRepayment.dataPrevista}</span>
                </div>
                {selectedRepayment.dataPagamento && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span className="text-muted">Data de Pagamento:</span>
                    <span className="fw-600 text-success">{selectedRepayment.dataPagamento}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Cliente Relacionado:</span>
                  <span className="fw-600">
                    {clients.find(c => c.id === selectedRepayment.clienteId)?.name || 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span className="text-muted">Contrato Vinculado:</span>
                  <span className="fw-600 font-mono text-xs">{selectedRepayment.contratoId}</span>
                </div>
              </div>

              {selectedRepayment.observacoes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Observações</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {selectedRepayment.observacoes}
                  </p>
                </div>
              )}

              {/* Accounts Payable Integration Warning Box */}
              <div style={{ background: 'rgba(255, 235, 59, 0.03)', border: '1px solid rgba(255, 235, 59, 0.2)', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <AlertCircle size={16} className="text-warning" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    <strong className="text-warning" style={{ display: 'block', marginBottom: '0.25rem' }}>Integração Contas a Pagar:</strong>
                    {selectedRepayment.status === 'previsto' || selectedRepayment.status === 'aguardando_recebimento' ? (
                      <span>Este repasse está programado. A liberação gerará uma obrigação no <strong>Contas a Pagar</strong>.</span>
                    ) : selectedRepayment.status === 'liberado' ? (
                      <span>
                        <strong>Status: Liberado</strong>. Esta comissão foi integrada ao Contas a Pagar! Favorecido: {selectedRepayment.parceiro} (Status da obrigação: em aberto).
                      </span>
                    ) : selectedRepayment.status === 'pago' ? (
                      <span className="text-success">
                        <strong>Status: Pago</strong>. A obrigação financeira associada a este repasse já foi liquidada e paga.
                      </span>
                    ) : (
                      <span>Este repasse foi cancelado e nenhuma obrigação financeira está ativa.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update Trigger Form for Testing Integration */}
              <div className="form-group" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <label>Ações do Repasse (Transição de Status)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedRepayment.status === 'aguardando_recebimento' && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleStatusChange(selectedRepayment.id, 'liberado')}
                      style={{ flex: 1 }}
                    >
                      Liberar (Gerar Conta a Pagar)
                    </button>
                  )}
                  {selectedRepayment.status === 'liberado' && (
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleStatusChange(selectedRepayment.id, 'pago')}
                      style={{ flex: 1 }}
                    >
                      Pagar (Liquidar Obrigação)
                    </button>
                  )}
                  {['previsto', 'aguardando_recebimento', 'liberado'].includes(selectedRepayment.status) && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleStatusChange(selectedRepayment.id, 'cancelado')}
                      style={{ flex: 1 }}
                    >
                      Cancelar Repasse
                    </button>
                  )}
                  {selectedRepayment.status === 'previsto' && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleStatusChange(selectedRepayment.id, 'aguardando_recebimento')}
                      style={{ flex: 1 }}
                    >
                      Aguardar Recebimento
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRepayment(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Drawers */}
      {isFormOpen && (
        <PartnerFormDrawer 
          partner={selectedPartnerForEdit} 
          onClose={() => { setIsFormOpen(false); setSelectedPartnerForEdit(null); }} 
        />
      )}

      {selectedPartnerForDetail && (
        <PartnerDetailDrawer 
          partner={selectedPartnerForDetail} 
          onClose={() => setSelectedPartnerForDetail(null)} 
        />
      )}

    </div>
  );
};
