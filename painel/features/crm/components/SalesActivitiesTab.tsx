import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { SalesActivity, SalesActivityType } from '../../../types';
import { Search, Plus, Check, X } from 'lucide-react';
import { SalesActivityFormDrawer } from './SalesActivityFormDrawer';

export const SalesActivitiesTab: React.FC = () => {
  const { salesActivities, updateSalesActivityStatus, leads, opportunities } = useStore();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const getStatusLabel = (act: SalesActivity) => {
    if (act.status === 'completed') return 'Concluída';
    if (act.status === 'canceled') return 'Cancelada';
    if (act.dueDate < today) return 'Atrasada';
    return 'Pendente';
  };

  const getStatusBadgeClass = (act: SalesActivity) => {
    if (act.status === 'completed') return 'badge-success';
    if (act.status === 'canceled') return 'badge-neutral';
    if (act.dueDate < today) return 'badge-danger';
    return 'badge-warning';
  };

  const getActivityTypeLabel = (type: SalesActivityType) => {
    switch (type) {
      case 'call': return 'Ligação';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'E-mail';
      case 'meeting': return 'Reunião';
      case 'diagnosis': return 'Diagnóstico';
      case 'follow_up': return 'Follow-up';
      case 'proposal': return 'Proposta';
      case 'negotiation': return 'Negociação';
      case 'internal_task': return 'Tarefa Interna';
      default: return type;
    }
  };

  const filteredActivities = salesActivities.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                          (a.description && a.description.toLowerCase().includes(search.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = a.status === 'pending' && a.dueDate >= today;
    } else if (statusFilter === 'overdue') {
      matchesStatus = a.status === 'pending' && a.dueDate < today;
    } else if (statusFilter !== 'all') {
      matchesStatus = a.status === statusFilter;
    }

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
                placeholder="Buscar atividades..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Status: Todos</option>
              <option value="pending">Pendente (No Prazo)</option>
              <option value="overdue">Atrasada</option>
              <option value="completed">Concluída</option>
              <option value="canceled">Cancelada</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Agendar Ação
        </button>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Tipo</th>
                <th>Oportunidade / Lead</th>
                <th>Responsável</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map(act => {
                const opp = opportunities.find(o => o.id === act.opportunityId);
                const lead = leads.find(l => l.id === act.leadId);
                const relatedName = opp ? opp.title : (lead ? `${lead.companyName} (${lead.name})` : '-');

                return (
                  <tr key={act.id}>
                    <td>
                      <div>
                        <div className="font-semibold text-primary">{act.title}</div>
                        {act.description && <div className="text-muted text-xs">{act.description}</div>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral text-xs">
                        {getActivityTypeLabel(act.type)}
                      </span>
                    </td>
                    <td className="text-secondary text-sm">
                      {relatedName}
                    </td>
                    <td className="text-secondary text-sm">
                      {act.owner || '-'}
                    </td>
                    <td className="text-secondary text-sm font-semibold">
                      {act.dueDate}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(act)}`}>
                        {getStatusLabel(act)}
                      </span>
                    </td>
                    <td className="td-actions">
                      {act.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm btn-icon-text"
                            onClick={() => updateSalesActivityStatus(act.id, 'completed', 'Concluído da listagem.')}
                            title="Concluir"
                          >
                            <Check size={12} /> Concluir
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm btn-icon-text"
                            onClick={() => updateSalesActivityStatus(act.id, 'canceled')}
                            title="Cancelar"
                            style={{ marginLeft: '0.25rem' }}
                          >
                            <X size={12} /> Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <span className="empty-state-title">Nenhuma atividade listada</span>
                      <span className="empty-state-text">Crie atividades ou revise os filtros de status.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <SalesActivityFormDrawer 
          onClose={() => setIsAddOpen(false)} 
        />
      )}
    </div>
  );
};
