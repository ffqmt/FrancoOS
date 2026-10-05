import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { Lead, LeadStatus, LeadTemperature } from '../../../types';
import { Plus, Search, Edit2, Play, UserCheck, Phone, Mail, X } from 'lucide-react';
import { LeadFormDrawer } from './LeadFormDrawer';
import { OpportunityFormDrawer } from './OpportunityFormDrawer';

export const LeadsTab: React.FC = () => {
  const { leads, promoteLeadToClient } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tempFilter, setTempFilter] = useState<string>('all');

  // Drawers / Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [oppLead, setOppLead] = useState<Lead | null>(null);

  // Conversion Modal state
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [corporateName, setCorporateName] = useState('');
  const [cnpj, setCnpj] = useState('');

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    promoteLeadToClient(convertingLead.id, {
      corporateName: corporateName || convertingLead.companyName,
      cnpj: cnpj
    });

    setConvertingLead(null);
    setCorporateName('');
    setCnpj('');
  };

  const getTempBadgeClass = (temp?: LeadTemperature) => {
    switch (temp) {
      case 'hot': return 'badge-danger';
      case 'warm': return 'badge-warning';
      case 'cold': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'Novo';
      case 'contacted': return 'Contato';
      case 'qualified': return 'Qualificado';
      case 'unqualified': return 'Sem Fit';
      case 'converted': return 'Cliente';
      case 'lost': return 'Perdido';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'badge-info';
      case 'contacted': return 'badge-warning';
      case 'qualified': return 'badge-purple';
      case 'unqualified': return 'badge-danger';
      case 'converted': return 'badge-success';
      case 'lost': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          (l.email && l.email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesTemp = tempFilter === 'all' || l.temperature === tempFilter;
    return matchesSearch && matchesStatus && matchesTemp;
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
                placeholder="Buscar leads..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Todos os Status</option>
              <option value="new">Novo</option>
              <option value="contacted">Em Contato</option>
              <option value="qualified">Qualificado</option>
              <option value="unqualified">Sem Fit</option>
              <option value="converted">Convertido</option>
              <option value="lost">Perdido</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <select className="form-select" value={tempFilter} onChange={e => setTempFilter(e.target.value)}>
              <option value="all">Todas as Temperaturas</option>
              <option value="cold">Frio</option>
              <option value="warm">Morno</option>
              <option value="hot">Quente</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Novo Lead
        </button>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Lead / Empresa</th>
                <th>Contato</th>
                <th>Segmento / Origem</th>
                <th>Score</th>
                <th>Temp</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div>
                      <div className="font-semibold text-primary">{lead.companyName}</div>
                      <div className="text-muted text-xs">{lead.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', fontSize: '0.78rem' }}>
                      {lead.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="text-secondary">
                          <Mail size={11} className="text-muted" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="text-secondary">
                          <Phone size={11} className="text-muted" /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="text-secondary text-sm">{lead.segment || 'Outros'}</div>
                      <div className="text-muted text-xs">{lead.source || 'Não informado'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-mono text-accent">{lead.score}%</span>
                  </td>
                  <td>
                    <span className={`badge ${getTempBadgeClass(lead.temperature)}`}>
                      {lead.temperature === 'hot' ? 'Quente' : lead.temperature === 'warm' ? 'Morno' : 'Frio'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button 
                      className="btn btn-ghost btn-sm btn-icon-text" 
                      onClick={() => setEditingLead(lead)}
                      title="Editar"
                    >
                      <Edit2 size={12} />
                    </button>
                    {lead.status !== 'converted' && lead.status !== 'lost' && (
                      <>
                        <button 
                          className="btn btn-secondary btn-sm btn-icon-text" 
                          onClick={() => setOppLead(lead)}
                          title="Criar Oportunidade"
                          style={{ marginLeft: '0.25rem' }}
                        >
                          <Play size={12} /> Opp
                        </button>
                        <button 
                          className="btn btn-success btn-sm btn-icon-text" 
                          onClick={() => setConvertingLead(lead)}
                          title="Converter em Cliente"
                          style={{ marginLeft: '0.25rem' }}
                        >
                          <UserCheck size={12} /> Cliente
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <span className="empty-state-title">Nenhum lead encontrado</span>
                      <span className="empty-state-text">Revise os filtros ou adicione um novo lead para iniciar.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Modal */}
      {convertingLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Converter Lead em Cliente</h3>
              <button className="btn-icon" onClick={() => setConvertingLead(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePromoteSubmit}>
              <div className="modal-body">
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Isso irá criar uma ficha de Cliente no Franco OS Core, uma Empresa vinculada e um Contato principal com base nos dados qualificados de <strong>{convertingLead.companyName}</strong>.
                </p>

                <div className="form-group">
                  <label>Razão Social Oficial *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={corporateName} 
                    onChange={e => setCorporateName(e.target.value)} 
                    placeholder="Razão Social para Faturamento" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>CNPJ da Empresa *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={cnpj} 
                    onChange={e => setCnpj(e.target.value)} 
                    placeholder="00.000.000/0000-00" 
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setConvertingLead(null)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Efetuar Conversão</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Form Drawer */}
      {(isAddOpen || editingLead) && (
        <LeadFormDrawer 
          lead={editingLead} 
          onClose={() => {
            setIsAddOpen(false);
            setEditingLead(null);
          }} 
        />
      )}

      {/* Opp Form Drawer */}
      {oppLead && (
        <OpportunityFormDrawer 
          lead={oppLead}
          onClose={() => setOppLead(null)}
        />
      )}
    </div>
  );
};
