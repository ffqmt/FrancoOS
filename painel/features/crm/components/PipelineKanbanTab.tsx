import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { Opportunity } from '../../../types';
import { Plus, ArrowRight, ArrowLeft, User, Check, X } from 'lucide-react';
import { OpportunityDetailDrawer } from './OpportunityDetailDrawer';
import { OpportunityFormDrawer } from './OpportunityFormDrawer';

export const PipelineKanbanTab: React.FC = () => {
  const { opportunities, pipelineStages, updateOpportunityStage, updateOpportunityStatus } = useStore();

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);

  const activeStages = [...pipelineStages]
    .filter(s => s.active)
    .sort((a, b) => a.order - b.order);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedOppId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedOppId;
    if (id) {
      updateOpportunityStage(id, stageId);
    }
    setDraggedOppId(null);
  };

  // Fallback movers
  const moveOppStage = (opp: Opportunity, direction: 'forward' | 'backward') => {
    const currentIndex = activeStages.findIndex(s => s.id === opp.stageId);
    if (direction === 'forward' && currentIndex < activeStages.length - 1) {
      updateOpportunityStage(opp.id, activeStages[currentIndex + 1].id);
    } else if (direction === 'backward' && currentIndex > 0) {
      updateOpportunityStage(opp.id, activeStages[currentIndex - 1].id);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Funil de Vendas</h3>
          <p className="text-muted text-xs">Arraste os cards para mover etapas ou clique para ver detalhes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} /> Nova Oportunidade
        </button>
      </div>

      <div className="kanban-board-wrapper" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '65vh' }}>
        {activeStages.map(stage => {
          const stageOpps = opportunities.filter(o => o.stageId === stage.id && o.status === 'open');
          const columnTotal = stageOpps.reduce((sum, o) => sum + o.value, 0);

          return (
            <div 
              key={stage.id} 
              className="kanban-column"
              style={{
                flex: '0 0 280px',
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '75vh',
                overflow: 'hidden'
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Header */}
              <div 
                className="kanban-column-header" 
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--border-color)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.25rem',
                  borderTop: `3px solid ${stage.color || 'var(--accent-primary)'}` 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-semibold text-primary" style={{ fontSize: '0.85rem' }}>{stage.name}</span>
                  <span className="badge badge-neutral text-xs" style={{ minWidth: '20px', textAlign: 'center' }}>{stageOpps.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span className="text-muted">Valor:</span>
                  <span className="font-bold text-secondary">{formatBRL(columnTotal)}</span>
                </div>
              </div>

              {/* Cards List */}
              <div 
                className="kanban-cards-list" 
                style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '0.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem' 
                }}
              >
                {stageOpps.map(opp => (
                  <div
                    key={opp.id}
                    className={`kanban-card glass-card clickable ${draggedOppId === opp.id ? 'dragging' : ''}`}
                    style={{ 
                      padding: '0.875rem', 
                      cursor: 'grab', 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.5rem',
                      opacity: draggedOppId === opp.id ? 0.4 : 1
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp.id)}
                    onClick={() => setSelectedOpp(opp)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-neutral text-xs" style={{ fontSize: '0.65rem' }}>
                        {opp.source || 'Lead'}
                      </span>
                      {opp.urgency === 'critical' && (
                        <span className="badge badge-danger text-xs uppercase" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Crítico</span>
                      )}
                    </div>

                    <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {opp.title}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span className="text-accent font-bold" style={{ fontSize: '0.9rem' }}>
                        {formatBRL(opp.value)}
                      </span>
                      <span className="text-muted text-xs font-semibold">
                        {opp.probability}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={10} /> {opp.owner}
                      </span>
                      {opp.nextActionDate && (
                        <span className="text-warning font-semibold">Ação: {opp.nextActionDate}</span>
                      )}
                    </div>

                    {/* Stage Fallback Mover buttons */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '0.25rem', 
                        marginTop: '0.25rem', 
                        justifyContent: 'flex-end',
                        borderTop: '1px solid rgba(255,255,255,0.03)',
                        paddingTop: '0.25rem'
                      }}
                      onClick={e => e.stopPropagation()} // Prevent opening details drawer
                    >
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: '0.15rem 0.3rem' }} 
                        onClick={() => moveOppStage(opp, 'backward')}
                        title="Mover para esquerda"
                      >
                        <ArrowLeft size={10} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: '0.15rem 0.3rem' }} 
                        onClick={() => moveOppStage(opp, 'forward')}
                        title="Mover para direita"
                      >
                        <ArrowRight size={10} />
                      </button>
                      <button 
                        className="btn btn-success btn-sm" 
                        style={{ padding: '0.15rem 0.3rem', color: '#fff' }} 
                        onClick={() => updateOpportunityStatus(opp.id, 'won')}
                        title="Marcar Ganho"
                      >
                        <Check size={10} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.15rem 0.3rem' }} 
                        onClick={() => updateOpportunityStatus(opp.id, 'lost')}
                        title="Marcar Perdido"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ))}

                {stageOpps.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Etapa vazia</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Opportunity Detail Drawer */}
      {selectedOpp && (
        <OpportunityDetailDrawer 
          opportunity={selectedOpp} 
          onClose={() => setSelectedOpp(null)} 
        />
      )}

      {/* Opportunity Creation Drawer */}
      {isCreateOpen && (
        <OpportunityFormDrawer 
          onClose={() => setIsCreateOpen(false)} 
        />
      )}
    </div>
  );
};
