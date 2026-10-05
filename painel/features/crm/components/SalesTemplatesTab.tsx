import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { SalesCommunicationTemplate, SalesTemplateType } from '../../../types';
import { Search, Plus, Edit2 } from 'lucide-react';
import { SalesCommunicationTemplateFormDrawer } from './SalesCommunicationTemplateFormDrawer';

export const SalesTemplatesTab: React.FC = () => {
  const { salesCommunicationTemplates, toggleSalesCommunicationTemplateStatus } = useStore();

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SalesCommunicationTemplate | null>(null);

  const getTemplateTypeLabel = (type: SalesTemplateType) => {
    switch (type) {
      case 'first_contact': return 'Primeiro Contato';
      case 'follow_up': return 'Acompanhamento';
      case 'post_meeting': return 'Pós-reunião';
      case 'proposal_send': return 'Envio de Proposta';
      case 'reactivation': return 'Reativação';
      case 'objection_price': return 'Objeção de Preço';
      case 'objection_timing': return 'Objeção de Timing';
      case 'referral_request': return 'Pedido de Indicação';
      case 'upsell': return 'Upsell';
      case 'cross_sell': return 'Cross-sell';
      default: return type;
    }
  };

  const filteredTemplates = salesCommunicationTemplates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2rem' }}
              placeholder="Buscar roteiros..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Novo Roteiro
        </button>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Nome do Roteiro</th>
                <th>Tipo / Objetivo</th>
                <th>Canal</th>
                <th>Variáveis Identificadas</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map(template => (
                <tr key={template.id}>
                  <td>
                    <div>
                      <div className="font-semibold text-primary">{template.name}</div>
                      <div className="text-muted text-xs" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {template.body}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral text-xs">
                      {getTemplateTypeLabel(template.type)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info text-xs uppercase">
                      {template.channel}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                      {template.variables && template.variables.map(v => (
                        <span key={v} className="text-mono text-xs" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.1rem 0.3rem', borderRadius: 'var(--radius-sm)' }}>
                          {v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${template.active ? 'badge-success' : 'badge-neutral'}`}>
                      {template.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button 
                      className="btn btn-ghost btn-sm btn-icon-text"
                      onClick={() => setEditingTemplate(template)}
                      title="Editar"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleSalesCommunicationTemplateStatus(template.id)}
                      style={{ marginLeft: '0.25rem' }}
                    >
                      {template.active ? 'Inativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <span className="empty-state-title">Nenhum roteiro comercial</span>
                      <span className="empty-state-text">Crie um roteiro ou limpe a busca.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isAddOpen || editingTemplate) && (
        <SalesCommunicationTemplateFormDrawer 
          template={editingTemplate} 
          onClose={() => {
            setIsAddOpen(false);
            setEditingTemplate(null);
          }} 
        />
      )}
    </div>
  );
};
