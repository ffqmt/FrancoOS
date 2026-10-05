import React from 'react';
import { useStore } from '../../../data/store';
import { getPipelineSummary, getOverdueActivities, getActivitiesDueToday, getOpportunitiesWithoutNextAction, getStaleOpportunities } from '../utils/salesSelectors';
import { Users, TrendingUp, DollarSign, Clock, AlertTriangle, ArrowUpRight, ChevronRight } from 'lucide-react';

interface CRMOverviewTabProps {
  setActiveTab: (tab: string) => void;
}

export const CRMOverviewTab: React.FC<CRMOverviewTabProps> = ({ setActiveTab }) => {
  const { leads, opportunities, salesActivities, pipelineStages, salesSettings } = useStore();
  const today = new Date().toISOString().split('T')[0];

  const summary = getPipelineSummary(opportunities, pipelineStages);
  const overdueAct = getOverdueActivities(salesActivities, today);
  const todayAct = getActivitiesDueToday(salesActivities, today);
  const noActionOpp = getOpportunitiesWithoutNextAction(opportunities, salesActivities);
  const staleOpp = getStaleOpportunities(opportunities, salesSettings.staleOpportunityDays);
  const newLeads = leads.filter(l => l.status === 'new');
  const hotLeads = leads.filter(l => l.temperature === 'hot' && l.status !== 'converted');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="animate-fade">
      {/* KPI Cards */}
      <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-card-title">Pipeline Total</span>
            <div className="kpi-icon-wrapper blue">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-card-value">{formatBRL(summary.totalValue)}</div>
          <div className="kpi-card-sub">{summary.count} oportunidades ativas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-card-title">Valor Ponderado</span>
            <div className="kpi-icon-wrapper purple">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-card-value text-accent">{formatBRL(summary.weightedValue)}</div>
          <div className="kpi-card-sub">Ajustado por probabilidade</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-card-title">Taxa de Conversão</span>
            <div className="kpi-icon-wrapper green">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-card-value text-success">
            {leads.length > 0 
              ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) 
              : 0}%
          </div>
          <div className="kpi-card-sub">{leads.filter(l => l.status === 'converted').length} de {leads.length} leads fechados</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-card-title">Alertas do Agente</span>
            <div className="kpi-icon-wrapper orange">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-card-value text-warning">
            {overdueAct.length + noActionOpp.length + newLeads.length}
          </div>
          <div className="kpi-card-sub">Ações críticas pendentes</div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
        {/* Risk / Agent Insights */}
        <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
          <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', margin: '0 0 1rem' }}>
            <span>Radar Comercial</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('agent')}>Ver Agente</button>
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {newLeads.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                <Users size={16} className="text-accent" style={{ marginTop: '0.1rem' }} />
                <div>
                  <span className="font-semibold text-primary" style={{ fontSize: '0.85rem' }}>{newLeads.length} leads novos sem contato</span>
                  <p className="text-muted" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem' }}>Aborde-os em menos de 24h para manter o engajamento.</p>
                </div>
              </div>
            )}

            {noActionOpp.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <AlertTriangle size={16} className="text-danger" style={{ marginTop: '0.1rem' }} />
                <div>
                  <span className="font-semibold text-danger" style={{ fontSize: '0.85rem' }}>{noActionOpp.length} oportunidades sem próxima ação</span>
                  <p className="text-muted" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem' }}>Risco de esfriar. Agende follow-ups ou telefonemas.</p>
                </div>
              </div>
            )}

            {staleOpp.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <Clock size={16} className="text-warning" style={{ marginTop: '0.1rem' }} />
                <div>
                  <span className="font-semibold text-warning" style={{ fontSize: '0.85rem' }}>{staleOpp.length} oportunidades paradas</span>
                  <p className="text-muted" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem' }}>Sem movimentação na etapa há mais de {salesSettings.staleOpportunityDays} dias.</p>
                </div>
              </div>
            )}

            {hotLeads.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <ArrowUpRight size={16} className="text-success" style={{ marginTop: '0.1rem' }} />
                <div>
                  <span className="font-semibold text-success" style={{ fontSize: '0.85rem' }}>{hotLeads.length} leads quentes prontos para venda</span>
                  <p className="text-muted" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem' }}>Avaliação alta pelo score comercial da Franco.</p>
                </div>
              </div>
            )}

            {newLeads.length === 0 && noActionOpp.length === 0 && staleOpp.length === 0 && hotLeads.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-title">Excelente trabalho!</span>
                <span className="empty-state-text">Nenhum alerta crítico ativo no radar hoje.</span>
              </div>
            )}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
          <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', margin: '0 0 1rem' }}>
            <span>Ações de Hoje e Atrasos</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('activities')}>Ver Atividades</button>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {overdueAct.slice(0, 3).map(act => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span className="badge badge-danger text-xs uppercase font-bold mr-05">ATRASADO</span>
                  <span className="font-semibold text-primary" style={{ fontSize: '0.8125rem' }}>{act.title}</span>
                  <p className="text-muted" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem' }}>Venceu em: {act.dueDate} · Resp: {act.owner}</p>
                </div>
                <ChevronRight size={14} className="text-muted" />
              </div>
            ))}

            {todayAct.slice(0, 3).map(act => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(245, 158, 11, 0.02)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span className="badge badge-warning text-xs uppercase font-bold mr-05">HOJE</span>
                  <span className="font-semibold text-primary" style={{ fontSize: '0.8125rem' }}>{act.title}</span>
                  <p className="text-muted" style={{ margin: '0.1rem 0 0', fontSize: '0.75rem' }}>Resp: {act.owner}</p>
                </div>
                <ChevronRight size={14} className="text-muted" />
              </div>
            ))}

            {overdueAct.length === 0 && todayAct.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-title">Sem compromissos marcados</span>
                <span className="empty-state-text">Nenhuma ligação ou reunião agendada para hoje.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
