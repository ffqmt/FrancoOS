import React, { useState } from 'react';
import { X, User, CreditCard, FileText, Clock } from 'lucide-react';
import type { Partner, Contract } from '../../../types';
import { useStore } from '../../../data/store';
import { ContractDetailDrawer } from '../../contracts/components/ContractDetailDrawer';

interface PartnerDetailDrawerProps {
  partner: Partner;
  onClose: () => void;
}

type TabType = 'resumo' | 'contratos' | 'repasses' | 'financeiro';

export const PartnerDetailDrawer: React.FC<PartnerDetailDrawerProps> = ({ partner, onClose }) => {
  const { contracts, partnerRepayments, accountsPayables, clients } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Relations
  const partnerContracts = contracts.filter(c => c.partnerId === partner.id);
  const partnerCommissions = partnerRepayments.filter(r => r.partnerId === partner.id || r.parceiro === partner.name);
  const linkedRepasseIds = partnerCommissions.map(r => r.id);
  const partnerPayables = accountsPayables.filter(p => p.repasseId && linkedRepasseIds.includes(p.repasseId));

  // Partner KPIs
  const totalPrevisto = partnerCommissions
    .filter(r => r.status === 'previsto' || r.status === 'aguardando_recebimento')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalLiberado = partnerCommissions
    .filter(r => r.status === 'liberado')
    .reduce((sum, r) => sum + r.valor, 0);

  const totalPago = partnerCommissions
    .filter(r => r.status === 'pago')
    .reduce((sum, r) => sum + r.valor, 0);

  const getStatusBadge = (status: Partner['status']) => {
    switch (status) {
      case 'ativo': return 'badge-success';
      case 'suspenso': return 'badge-warning';
      case 'inativo': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getPartnerTypeLabel = (type: Partner['partnerType']) => {
    switch (type) {
      case 'parceiro_comercial': return 'Parceiro Comercial';
      case 'indicador': return 'Indicador';
      case 'parceiro_entrega': return 'Parceiro de BPO/Entrega';
      case 'prestador': return 'Prestador de Serviço';
      case 'consultor': return 'Consultor Independente';
      case 'afiliado': return 'Afiliado';
      case 'fornecedor': return 'Fornecedor';
      default: return 'Outro';
    }
  };

  const getRepaymentRuleLabel = (rule: any) => {
    switch (rule) {
      case 'percentual': return 'Percentual';
      case 'fixo': return 'Valor Fixo';
      case 'recorrente': return 'Recorrente';
      case 'primeira_venda': return 'Primeira Mensalidade';
      case 'por_etapa': return 'Por Etapa';
      default: return 'Manual';
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content drawer-large" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="kpi-icon-wrapper purple" style={{ width: '40px', height: '40px' }}>
              <User size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{partner.name}</h3>
              <span className="text-xs text-muted" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span>Tipo: {getPartnerTypeLabel(partner.partnerType)}</span>
                <span>•</span>
                <span className={`badge ${getStatusBadge(partner.status)}`}>{partner.status.toUpperCase()}</span>
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* KPIs bar */}
        <div className="grid-cols-3 mt-2" style={{ padding: '0 1.5rem', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
            <span className="text-xs text-muted">Previsto a Repassar</span>
            <div className="kpi-value text-sm mt-0.2" style={{ fontSize: '1.25rem' }}>{formatCurrency(totalPrevisto)}</div>
          </div>
          <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
            <span className="text-xs text-muted">Liberado (Em Aberto)</span>
            <div className="kpi-value text-sm mt-0.2 income-text" style={{ fontSize: '1.25rem' }}>{formatCurrency(totalLiberado)}</div>
          </div>
          <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
            <span className="text-xs text-muted">Total Pago</span>
            <div className="kpi-value text-sm mt-0.2 text-primary" style={{ fontSize: '1.25rem' }}>{formatCurrency(totalPago)}</div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="drawer-tabs">
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'resumo' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumo')}
          >
            <User size={14} /> Ficha Cadastral
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'contratos' ? 'active' : ''}`}
            onClick={() => setActiveTab('contratos')}
          >
            <FileText size={14} /> Contratos Vinculados ({partnerContracts.length})
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'repasses' ? 'active' : ''}`}
            onClick={() => setActiveTab('repasses')}
          >
            <Clock size={14} /> Histórico de Repasses ({partnerCommissions.length})
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'financeiro' ? 'active' : ''}`}
            onClick={() => setActiveTab('financeiro')}
          >
            <CreditCard size={14} /> Dados de Pagamento
          </button>
        </div>

        <div className="drawer-body" style={{ overflowY: 'auto', flex: 1, paddingBottom: '2rem' }}>
          {activeTab === 'resumo' && (
            <div className="tab-pane">
              <div className="info-card">
                <h4>Informações Gerais</h4>
                <div className="kv-grid">
                  <div className="kv-item">
                    <span className="kv-label">Razão Social / Nome</span>
                    <span className="kv-value">{partner.name}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Tipo Pessoa</span>
                    <span className="kv-value">{partner.personType}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">{partner.personType === 'PJ' ? 'CNPJ' : 'CPF'}</span>
                    <span className="kv-value">{partner.document || 'Não informado'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Origem</span>
                    <span className="kv-value">{partner.origin || 'Não informado'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Contato</span>
                    <span className="kv-value">{partner.contactName || 'Não informado'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">E-mail</span>
                    <span className="kv-value">{partner.email}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Telefone / WhatsApp</span>
                    <span className="kv-value">{partner.phone}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Website</span>
                    <span className="kv-value">{partner.website || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              <div className="info-card mt-2">
                <h4>Regras Gerais de Repasse (Padrão)</h4>
                <div className="kv-grid">
                  <div className="kv-item">
                    <span className="kv-label">Tipo de Repasse</span>
                    <span className="kv-value" style={{ textTransform: 'capitalize' }}>{partner.defaultRepaymentType || 'comissao'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Fórmula Aplicada</span>
                    <span className="kv-value">{getRepaymentRuleLabel(partner.defaultRepaymentRule)}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Valor / Percentual Padrão</span>
                    <span className="kv-value">
                      {partner.defaultRepaymentRule === 'percentual' 
                        ? `${partner.defaultPercentage}%` 
                        : formatCurrency(partner.defaultFixedAmount || 0)}
                    </span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Liberação</span>
                    <span className="kv-value" style={{ textTransform: 'capitalize' }}>{partner.defaultReleaseCondition || 'No recebimento'}</span>
                  </div>
                </div>
              </div>

              <div className="info-card mt-2">
                <h4>Anotações Gerais</h4>
                <p className="text-sm text-secondary" style={{ whiteSpace: 'pre-line' }}>{partner.notes || 'Sem observações cadastradas.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'contratos' && (
            <div className="tab-pane">
              {partnerContracts.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <FileText size={40} className="text-muted" />
                  <h5>Nenhum contrato ativo vinculado</h5>
                  <p>Esse parceiro não está vinculado como comissão ou repasse em contratos vigentes.</p>
                </div>
              ) : (
                <div className="table-container mt-2">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Título do Contrato</th>
                        <th>Cliente</th>
                        <th>Valor Mensal</th>
                        <th>Comissão Pactuada</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerContracts.map(c => {
                        const cl = clients.find(client => client.id === c.clientId);
                        const isOverride = c.partnerRuleOverride;
                        return (
                          <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedContract(c)}>
                            <td><strong>{c.title || 'Contrato Sem Nome'}</strong></td>
                            <td>{cl?.name || 'Cliente'}</td>
                            <td>{formatCurrency(c.monthlyValue)}</td>
                            <td>
                              {isOverride ? (
                                <span className="text-accent text-xs">Personalizada: {c.repaymentRule === 'percentual' ? `${c.repaymentPercentage}%` : formatCurrency(c.repaymentFixedAmount || 0)}</span>
                              ) : (
                                <span className="text-muted text-xs">Padrão ({partner.defaultRepaymentRule === 'percentual' ? `${partner.defaultPercentage}%` : formatCurrency(partner.defaultFixedAmount || 0)})</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                {c.status === 'active' ? 'Ativo' : c.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'repasses' && (
            <div className="tab-pane">
              {partnerCommissions.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <Clock size={40} className="text-muted" />
                  <h5>Histórico de repasses vazio</h5>
                  <p>Nenhuma comissão ou repasse previsto ou pago para este parceiro.</p>
                </div>
              ) : (
                <div className="table-container mt-2">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Cód / Referência</th>
                        <th>Vencimento Previsto</th>
                        <th>Valor</th>
                        <th>Regra</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerCommissions.map(r => (
                        <tr key={r.id}>
                          <td><span className="text-muted font-mono">{r.id.substring(0, 8).toUpperCase()}</span></td>
                          <td>{r.dataPrevista}</td>
                          <td><strong>{formatCurrency(r.valor)}</strong></td>
                          <td>{r.regra === 'percentual' ? `${r.percentual}%` : 'Fixo'}</td>
                          <td>
                            <span className={`badge ${
                              r.status === 'pago' ? 'badge-success' : 
                              r.status === 'liberado' ? 'badge-info' : 
                              r.status === 'aguardando_recebimento' ? 'badge-warning' : 'badge-purple'
                            }`}>
                              {r.status === 'pago' ? 'Pago' : 
                               r.status === 'liberado' ? 'Liberado' : 
                               r.status === 'aguardando_recebimento' ? 'Aguardando Cliente' : 'Previsto'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="tab-pane">
              <div className="info-card">
                <h4>Instruções e Preferência de Pagamento</h4>
                <div className="kv-grid">
                  <div className="kv-item">
                    <span className="kv-label">Favorecido Oficial</span>
                    <span className="kv-value">{partner.paymentBeneficiary || partner.name}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">CPF/CNPJ do Favorecido</span>
                    <span className="kv-value">{partner.beneficiaryDocument || partner.document || 'Não informado'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Método Preferido</span>
                    <span className="kv-value" style={{ textTransform: 'capitalize' }}>{partner.paymentMethod}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Chave Pix</span>
                    <span className="kv-value">{partner.pixKey || 'Não informada'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Banco</span>
                    <span className="kv-value">{partner.bankName || 'Não informado'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Agência</span>
                    <span className="kv-value">{partner.bankAgency || 'Não informada'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Conta</span>
                    <span className="kv-value">{partner.bankAccount || 'Não informada'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Tipo de Conta</span>
                    <span className="kv-value" style={{ textTransform: 'capitalize' }}>{partner.bankAccountType || 'Corrente'}</span>
                  </div>
                </div>
                <div className="mt-2 pt-1" style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <label className="text-xs text-muted" style={{ fontWeight: 600 }}>Observações Financeiras Específicas</label>
                  <p className="text-sm mt-0.2 text-secondary">{partner.notes || 'Nenhuma instrução adicional vinculada.'}</p>
                </div>
              </div>

              {/* Linked Accounts Payables list */}
              <div className="info-card mt-2">
                <h4>Contas a Pagar Vinculadas (Geradas de Repasses Liberados)</h4>
                {partnerPayables.length === 0 ? (
                  <p className="text-sm text-muted mt-1">Nenhum lançamento no Contas a Pagar vinculado a este parceiro.</p>
                ) : (
                  <div className="table-container mt-1">
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
                        {partnerPayables.map(p => (
                          <tr key={p.id}>
                            <td>{p.descricao}</td>
                            <td>{p.vencimento}</td>
                            <td><strong>{formatCurrency(p.valor)}</strong></td>
                            <td>
                              <span className={`badge ${p.status === 'pago' ? 'badge-success' : p.status === 'vencido' ? 'badge-danger' : 'badge-warning'}`}>
                                {p.status === 'pago' ? 'Pago' : p.status === 'vencido' ? 'Vencido' : 'Em Aberto'}
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
        </div>

        <div className="drawer-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Fechar Ficha</button>
        </div>
      </div>

      {selectedContract && (
        <ContractDetailDrawer 
          contract={selectedContract} 
          onClose={() => setSelectedContract(null)} 
        />
      )}
    </div>
  );
};
