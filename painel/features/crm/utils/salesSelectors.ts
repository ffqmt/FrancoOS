import type { Lead, Opportunity, SalesActivity, SalesProposal, Service, SalesSettings } from '../../../types';


export const calculateLeadScore = (lead: Lead, settings: SalesSettings, opportunities: Opportunity[]): number => {
  let score = 50; // base score

  // 1. Ideal Segment Fit
  if (lead.segment && settings.idealSegments.some(s => s.toLowerCase() === lead.segment?.toLowerCase())) {
    score += 15;
  }
  // Excluded Segment
  if (lead.segment && settings.excludedSegments.some(s => s.toLowerCase() === lead.segment?.toLowerCase())) {
    score -= 30;
  }

  // 2. Lead Source
  if (lead.source?.toLowerCase().includes('indica') || lead.source?.toLowerCase().includes('parceir')) {
    score += 15;
  }

  // 3. Opportunity characteristics linked to lead
  const opp = opportunities.find(o => o.leadId === lead.id);
  if (opp) {
    score += 10;
    if (opp.budget) {
      // Check if ticket is above minimum
      const budgetNum = parseFloat(opp.budget.replace(/[^0-9]/g, ''));
      if (!isNaN(budgetNum) && budgetNum >= settings.minimumTicket) {
        score += 10;
      }
    }
    if (opp.urgency === 'high' || opp.urgency === 'critical') {
      score += 10;
    }
    if (opp.decisionMaker) {
      score += 5;
    }
  }

  // Bound between 0 and 100
  return Math.min(100, Math.max(0, score));
};

export const getLeadTemperature = (score: number): 'cold' | 'warm' | 'hot' => {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
};

export const getPipelineSummary = (opportunities: Opportunity[], stages: any[]) => {
  const openOpps = opportunities.filter(o => o.status === 'open');
  const totalValue = openOpps.reduce((sum, o) => sum + o.value, 0);
  const weightedValue = openOpps.reduce((sum, o) => {
    const stage = stages.find(s => s.id === o.stageId);
    const prob = stage ? stage.probability : 50;
    return sum + o.value * (prob / 100);
  }, 0);

  const wonOpps = opportunities.filter(o => o.status === 'won');
  const wonValue = wonOpps.reduce((sum, o) => sum + o.value, 0);

  return {
    totalValue,
    weightedValue,
    count: openOpps.length,
    wonCount: wonOpps.length,
    wonValue
  };
};

export const getOverdueActivities = (activities: SalesActivity[], today: string): SalesActivity[] => {
  return activities.filter(a => a.status === 'pending' && a.dueDate < today);
};

export const getActivitiesDueToday = (activities: SalesActivity[], today: string): SalesActivity[] => {
  return activities.filter(a => a.status === 'pending' && a.dueDate === today);
};

export const getOpportunitiesWithoutNextAction = (opportunities: Opportunity[], activities: SalesActivity[]): Opportunity[] => {
  return opportunities.filter(o => {
    if (o.status !== 'open') return false;
    const hasPendingActivity = activities.some(a => a.opportunityId === o.id && a.status === 'pending');
    return !hasPendingActivity;
  });
};

export const getStaleOpportunities = (opportunities: Opportunity[], staleDays: number): Opportunity[] => {
  const now = new Date();
  return opportunities.filter(o => {
    if (o.status !== 'open') return false;
    const updatedDate = new Date(o.updatedAt);
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > staleDays;
  });
};

export const getHotLeadsWithoutOpportunity = (leads: Lead[], opportunities: Opportunity[]): Lead[] => {
  return leads.filter(l => {
    if (l.status === 'converted' || l.status === 'lost' || l.status === 'unqualified') return false;
    if (l.temperature !== 'hot') return false;
    const hasOpp = opportunities.some(o => o.leadId === l.id);
    return !hasOpp;
  });
};

export const getRecommendedServicesForLead = (lead: Lead, services: Service[]): Service[] => {
  const segment = lead.segment?.toLowerCase() || '';
  if (segment.includes('tech') || segment.includes('saas') || segment.includes('soft')) {
    return services.filter(s => ['automacao', 'integracao', 'produto_digital', 'contabilidade'].includes(s.category));
  }
  if (segment.includes('advoc') || segment.includes('consult') || segment.includes('medico') || segment.includes('saude')) {
    return services.filter(s => ['contabilidade', 'consultoria', 'folha'].includes(s.category));
  }
  return services.slice(0, 2);
};

export const renderSalesTemplate = (body: string, variables: Record<string, string>): string => {
  let rendered = body;
  Object.entries(variables).forEach(([key, val]) => {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), val || '');
  });
  return rendered;
};

export interface AgentAction {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  actionSuggested: string;
  entityType: 'lead' | 'opportunity' | 'activity' | 'proposal';
  entityId: string;
  entityName: string;
  metadata?: any;
}

export const getSuggestedAgentActions = (
  leads: Lead[],
  opportunities: Opportunity[],
  activities: SalesActivity[],
  _proposals: SalesProposal[],
  settings: SalesSettings,
  today: string
): AgentAction[] => {
  const actions: AgentAction[] = [];

  // 1. Overdue activities
  const overdue = getOverdueActivities(activities, today);
  overdue.forEach(a => {
    let oppName = 'Atividade Comercial';
    if (a.opportunityId) {
      const opp = opportunities.find(o => o.id === a.opportunityId);
      if (opp) oppName = opp.title;
    } else if (a.leadId) {
      const ld = leads.find(l => l.id === a.leadId);
      if (ld) oppName = ld.name;
    }

    actions.push({
      id: `act_overdue_${a.id}`,
      priority: 'high',
      reason: `Atividade "${a.title}" está atrasada desde ${a.dueDate}.`,
      actionSuggested: `Entrar em contato e reagendar ou concluir atividade.`,
      entityType: 'activity',
      entityId: a.id,
      entityName: oppName,
      metadata: { activity: a }
    });
  });

  // 2. Opportunities without next actions
  const noAction = getOpportunitiesWithoutNextAction(opportunities, activities);
  noAction.forEach(o => {
    actions.push({
      id: `opp_noaction_${o.id}`,
      priority: 'critical',
      reason: `Oportunidade "${o.title}" não possui nenhuma ação futura agendada.`,
      actionSuggested: `Agendar ligação ou mensagem de acompanhamento (follow-up).`,
      entityType: 'opportunity',
      entityId: o.id,
      entityName: o.title,
      metadata: { opportunity: o }
    });
  });

  // 3. Stale opportunities
  const stale = getStaleOpportunities(opportunities, settings.staleOpportunityDays);
  stale.forEach(o => {
    actions.push({
      id: `opp_stale_${o.id}`,
      priority: 'medium',
      reason: `Oportunidade parada na etapa há mais de ${settings.staleOpportunityDays} dias.`,
      actionSuggested: `Enviar mensagem de reativação ou propor novas condições.`,
      entityType: 'opportunity',
      entityId: o.id,
      entityName: o.title,
      metadata: { opportunity: o }
    });
  });

  // 4. Hot leads without opportunity
  const hotLeads = getHotLeadsWithoutOpportunity(leads, opportunities);
  hotLeads.forEach(l => {
    actions.push({
      id: `lead_hot_${l.id}`,
      priority: 'high',
      reason: `Lead quente "${l.name}" (${l.companyName}) não possui oportunidade criada.`,
      actionSuggested: `Criar Oportunidade e agendar reunião de Diagnóstico.`,
      entityType: 'lead',
      entityId: l.id,
      entityName: l.name,
      metadata: { lead: l }
    });
  });

  // 5. New leads without contact
  leads.filter(l => l.status === 'new').forEach(l => {
    actions.push({
      id: `lead_new_${l.id}`,
      priority: 'high',
      reason: `Lead novo recebido sem primeiro contato efetuado.`,
      actionSuggested: `Iniciar abordagem inicial utilizando playbook de Primeiro Contato.`,
      entityType: 'lead',
      entityId: l.id,
      entityName: l.name,
      metadata: { lead: l }
    });
  });

  // Sort by priority order: critical > high > medium > low
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  return actions.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
};
