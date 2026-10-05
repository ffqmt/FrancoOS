import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { ProspectingList, ProspectingStatus } from '../../../types';
import { Search, Plus, MapPin, ChevronRight } from 'lucide-react';
import { ProspectingListFormDrawer } from './ProspectingListFormDrawer';

export const ProspectingTab: React.FC = () => {
  const { prospectingLists, leads } = useStore();
  
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ProspectingList | null>(null);

  const getStatusLabel = (status: ProspectingStatus) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'researching': return 'Pesquisando';
      case 'ready': return 'Pronta';
      case 'contacting': return 'Abordando';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: ProspectingStatus) => {
    switch (status) {
      case 'draft': return 'badge-neutral';
      case 'researching': return 'badge-info';
      case 'ready': return 'badge-success';
      case 'contacting': return 'badge-warning';
      case 'completed': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const filteredLists = prospectingLists.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Buscar listas..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Nova Lista
        </button>
      </div>

      <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
        {/* Lists Panel */}
        <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
          <h4 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Listas de Mapeamento</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredLists.map(list => {
              const listLeadsCount = leads.filter(ld => ld.prospectingListId === list.id).length;
              return (
                <div 
                  key={list.id} 
                  className={`clickable`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem', 
                    background: selectedList?.id === list.id ? 'rgba(60, 200, 245, 0.05)' : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedList?.id === list.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)' 
                  }}
                  onClick={() => setSelectedList(list)}
                >
                  <div>
                    <span className="font-semibold text-primary" style={{ fontSize: '0.85rem' }}>{list.name}</span>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Segmento: {list.targetSegment || '-'} · Mapeados: {listLeadsCount} / {list.desiredLeadCount || 10}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${getStatusBadgeClass(list.status)}`}>
                      {getStatusLabel(list.status)}
                    </span>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
              );
            })}

            {filteredLists.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-title">Nenhuma lista criada</span>
                <span className="empty-state-text">Inicie um mapeamento para qualificar leads frios.</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Briefing Panel */}
        <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
          {selectedList ? (
            <div className="animate-fade">
              <h4 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', margin: '0 0 1rem' }}>
                <span>Briefing da Lista</span>
                <span className="badge badge-purple text-xs uppercase">{selectedList.channel}</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <span className="kv-label">Localização Foco</span>
                  <p className="text-secondary text-sm font-semibold" style={{ margin: '0.1rem 0 0' }}>
                    <MapPin size={12} className="inline mr-05 text-muted" />
                    {selectedList.targetLocation || 'Qualquer região'}
                  </p>
                </div>

                <div>
                  <span className="kv-label">Serviço Recomendado para Oferecer</span>
                  <p className="text-secondary text-sm font-semibold" style={{ margin: '0.1rem 0 0' }}>
                    {selectedList.serviceFocus || 'Diagnóstico de automação comercial'}
                  </p>
                </div>

                <div>
                  <span className="kv-label">Palavras-chave de Filtro</span>
                  <p className="text-secondary text-mono text-xs" style={{ margin: '0.1rem 0 0', background: 'var(--bg-tertiary)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    {selectedList.keywords || 'Nenhuma palavra-chave configurada'}
                  </p>
                </div>

                {selectedList.notes && (
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderLeft: '3px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="kv-label">Instruções Operacionais:</span>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {selectedList.notes}
                    </p>
                  </div>
                )}

                {/* Briefing Box */}
                <div style={{ background: 'rgba(60, 200, 245, 0.03)', border: '1px dashed rgba(60, 200, 245, 0.2)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <h5 className="font-semibold text-accent" style={{ fontSize: '0.8125rem', margin: '0 0 0.4rem' }}>Briefing de abordagem gerado pelo Agente</h5>
                  <p className="text-secondary" style={{ fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                    Oferecer {selectedList.serviceFocus || 'Contabilidade e BPO'}. Foco em mostrar como a Franco remove a burocracia do segmento de {selectedList.targetSegment || 'serviços'}. Canal recomendado: {selectedList.channel.toUpperCase()}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
              <span className="empty-state-title">Selecione uma lista</span>
              <span className="empty-state-text">Clique em uma das listas ao lado para ver o briefing e plano de abordagem.</span>
            </div>
          )}
        </div>
      </div>

      {isAddOpen && (
        <ProspectingListFormDrawer 
          onClose={() => setIsAddOpen(false)} 
        />
      )}
    </div>
  );
};
