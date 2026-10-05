import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { SalesProposal, SalesProposalStatus } from '../../../types';
import { Search, Check, X, Eye } from 'lucide-react';

export const SalesProposalsTab: React.FC = () => {
  const { salesProposals, updateSalesProposalStatus, leads, opportunities } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<SalesProposal | null>(null);

  const getStatusLabel = (status: SalesProposalStatus) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'prepared': return 'Preparada';
      case 'sent_placeholder': return 'Enviada';
      case 'accepted': return 'Aceita';
      case 'rejected': return 'Rejeitada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: SalesProposalStatus) => {
    switch (status) {
      case 'draft': return 'badge-neutral';
      case 'prepared': return 'badge-info';
      case 'sent_placeholder': return 'badge-warning';
      case 'accepted': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'expired': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredProposals = salesProposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2rem' }}
                placeholder="Buscar propostas..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Status: Todos</option>
              <option value="draft">Rascunho</option>
              <option value="prepared">Preparada</option>
              <option value="sent_placeholder">Enviada</option>
              <option value="accepted">Aceita</option>
              <option value="rejected">Rejeitada</option>
              <option value="expired">Expirada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Proposta Comercial</th>
                <th>Oportunidade / Lead</th>
                <th>Subtotal</th>
                <th>Desconto</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map(prop => {
                const opp = opportunities.find(o => o.id === prop.opportunityId);
                const lead = leads.find(l => l.id === prop.leadId);
                const relatedName = opp ? opp.title : (lead ? lead.companyName : '-');

                return (
                  <tr key={prop.id}>
                    <td>
                      <div>
                        <div className="font-semibold text-primary">{prop.title}</div>
                        <div className="text-muted text-xs">Válida até: {prop.validUntil || 'Sem data'}</div>
                      </div>
                    </td>
                    <td className="text-secondary text-sm">
                      {relatedName}
                    </td>
                    <td className="text-secondary text-sm">
                      {formatBRL(prop.subtotal)}
                    </td>
                    <td className="text-danger text-sm">
                      -{formatBRL(prop.discount)}
                    </td>
                    <td className="text-accent font-bold text-sm">
                      {formatBRL(prop.total)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(prop.status)}`}>
                        {getStatusLabel(prop.status)}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button 
                        className="btn btn-ghost btn-sm btn-icon-text"
                        onClick={() => setSelectedProposal(prop)}
                        title="Visualizar Detalhes"
                      >
                        <Eye size={12} /> Ver
                      </button>

                      {prop.status === 'draft' && (
                        <button 
                          className="btn btn-secondary btn-sm btn-icon-text"
                          onClick={() => updateSalesProposalStatus(prop.id, 'sent_placeholder')}
                          style={{ marginLeft: '0.25rem' }}
                        >
                          Enviar
                        </button>
                      )}

                      {prop.status === 'sent_placeholder' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm btn-icon-text"
                            onClick={() => updateSalesProposalStatus(prop.id, 'accepted')}
                            style={{ marginLeft: '0.25rem' }}
                          >
                            <Check size={12} /> Aceitar
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm btn-icon-text"
                            onClick={() => updateSalesProposalStatus(prop.id, 'rejected')}
                            style={{ marginLeft: '0.25rem' }}
                          >
                            <X size={12} /> Rejeitar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <span className="empty-state-title">Nenhuma proposta elaborada</span>
                      <span className="empty-state-text">Abra um card no Pipeline para preparar uma proposta.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Viewer Modal */}
      {selectedProposal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{selectedProposal.title}</h3>
              <button className="btn-icon" onClick={() => setSelectedProposal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="section-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <span className="kv-label">Itens Propostos</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {selectedProposal.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span className="text-secondary">{item.description}</span>
                      <span className="font-semibold text-primary">{formatBRL(item.total)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span className="font-semibold text-secondary">Total:</span>
                    <span className="font-bold text-accent">{formatBRL(selectedProposal.total)}</span>
                  </div>
                </div>
              </div>

              {selectedProposal.paymentTerms && (
                <div className="form-group">
                  <label>Condições de Pagamento</label>
                  <p className="text-secondary text-sm" style={{ margin: 0 }}>{selectedProposal.paymentTerms}</p>
                </div>
              )}

              {selectedProposal.scopeSummary && (
                <div className="form-group">
                  <label>Escopo da Franco</label>
                  <p className="text-secondary text-sm" style={{ margin: 0 }}>{selectedProposal.scopeSummary}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedProposal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
