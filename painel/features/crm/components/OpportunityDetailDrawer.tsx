import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { Opportunity } from '../../../types';
import { X, CheckCircle2, Bot, Plus } from 'lucide-react';
import { SalesActivityFormDrawer } from './SalesActivityFormDrawer';
import { SalesProposalFormDrawer } from './SalesProposalFormDrawer';

interface OpportunityDetailDrawerProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export const OpportunityDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({ opportunity, onClose }) => {
  const { 
    leads, clients, pipelineStages, salesActivities, salesProposals, salesObjections, salesPlaybooks,
    updateOpportunityStatus, promoteLeadToClient, addContract,
    updateSalesActivityStatus, addSalesObjection, updateSalesObjectionStatus, updateSalesProposalStatus, updateOpportunity
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'diagnosis' | 'activities' | 'proposals' | 'objections' | 'onboarding'>('overview');

  // Sub-drawer toggles
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);

  // New objection state
  const [newObjType, setNewObjType] = useState<'Preço' | 'Prazo' | 'Já tem fornecedor' | 'Sem orçamento' | 'Não é prioridade' | 'Precisa falar com sócio' | 'Não entendeu valor' | 'Quer pensar' | 'Timing ruim' | 'Falta confiança' | 'Escopo não ficou claro' | 'Outro'>('Preço');
  const [newObjDesc, setNewObjDesc] = useState('');
  const [isAddingObjection, setIsAddingObjection] = useState(false);

  // Diagnosis inputs
  const [businessContext, setBusinessContext] = useState(opportunity.businessContext || '');
  const [painPoints, setPainPoints] = useState(opportunity.painPoints || '');
  const [budget, setBudget] = useState(opportunity.budget || '');
  const [decisionMaker, setDecisionMaker] = useState(opportunity.decisionMaker || '');

  // Onboarding variables
  const [onboardingChecked, setOnboardingChecked] = useState<Record<string, boolean>>({
    'doc': false,
    'setup': false,
    'kickoff': false
  });

  const lead = leads.find(l => l.id === opportunity.leadId);
  const client = clients.find(c => c.id === opportunity.clientId);
  const stage = pipelineStages.find(s => s.id === opportunity.stageId);

  const relatedActivities = salesActivities.filter(a => a.opportunityId === opportunity.id);
  const relatedProposals = salesProposals.filter(p => p.opportunityId === opportunity.id);
  const relatedObjections = salesObjections.filter(o => o.opportunityId === opportunity.id);

  const playbooks = salesPlaybooks.filter(pb => pb.active);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSaveDiagnosis = () => {
    const updated = {
      ...opportunity,
      businessContext,
      painPoints,
      budget,
      decisionMaker,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    updateOpportunity(updated);
    alert('Diagnóstico comercial salvo com sucesso!');
  };

  const handleAddObjectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjDesc) return;
    addSalesObjection({
      opportunityId: opportunity.id,
      type: newObjType,
      description: newObjDesc,
      status: 'open'
    });
    setNewObjDesc('');
    setIsAddingObjection(false);
  };

  const handleConvertClientAndContract = () => {
    if (!lead) return;

    // Convert lead to client first
    promoteLeadToClient(lead.id, {
      corporateName: lead.companyName,
      cnpj: '00.000.000/0000-00' // dummy CNPJ if not present
    });

    // Create a contract for this won opportunity
    if (opportunity.mainServiceId) {
      addContract({
        clientId: 'c_' + Date.now(), // Linked to converted client
        serviceId: opportunity.mainServiceId,
        startDate: new Date().toISOString().split('T')[0],
        monthlyValue: opportunity.value,
        status: 'draft',
        title: `Contrato CRM - ${lead.companyName}`
      });
    }
    updateOpportunityStatus(opportunity.id, 'won');
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel drawer-panel-lg" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <Bot size={20} />
            </div>
            <div>
              <h3>{opportunity.title}</h3>
              <p>
                Fit com Franco: {opportunity.probability}% de probabilidade · Etapa: {stage?.name || 'Não definida'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Action bar */}
        <div className="drawer-action-bar">
          <button 
            className={`btn btn-secondary btn-sm ${opportunity.status === 'won' ? 'btn-success' : ''}`}
            onClick={() => updateOpportunityStatus(opportunity.id, 'won')}
          >
            ✓ Ganho
          </button>
          <button 
            className={`btn btn-secondary btn-sm ${opportunity.status === 'lost' ? 'btn-danger' : ''}`}
            onClick={() => updateOpportunityStatus(opportunity.id, 'lost')}
          >
            ✗ Perdido
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsActivityOpen(true)}>
            + Agendar Ação
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsProposalOpen(true)}>
            + Criar Proposta
          </button>
        </div>

        {/* Tabs */}
        <div className="drawer-tabs">
          <button className={`drawer-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Visão Geral &amp; Dores
          </button>
          <button className={`drawer-tab ${activeTab === 'diagnosis' ? 'active' : ''}`} onClick={() => setActiveTab('diagnosis')}>
            Diagnóstico B2B
          </button>
          <button className={`drawer-tab ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
            Atividades ({relatedActivities.length})
          </button>
          <button className={`drawer-tab ${activeTab === 'proposals' ? 'active' : ''}`} onClick={() => setActiveTab('proposals')}>
            Propostas ({relatedProposals.length})
          </button>
          <button className={`drawer-tab ${activeTab === 'objections' ? 'active' : ''}`} onClick={() => setActiveTab('objections')}>
            Objeções ({relatedObjections.length})
          </button>
          {opportunity.status === 'won' && (
            <button className={`drawer-tab ${activeTab === 'onboarding' ? 'active' : ''}`} onClick={() => setActiveTab('onboarding')}>
              Onboarding &amp; Contrato
            </button>
          )}
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="animate-fade">
              <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card compact no-hover">
                  <span className="kv-label">Valor Mensal (MRR)</span>
                  <span className="font-bold text-lg text-primary">{formatBRL(opportunity.value)}</span>
                </div>
                <div className="glass-card compact no-hover">
                  <span className="kv-label">Fechamento Esperado</span>
                  <span className="font-bold text-lg text-secondary">{opportunity.expectedCloseDate || 'Não informada'}</span>
                </div>
              </div>

              <div className="section-card" style={{ padding: '1.25rem' }}>
                <h4 className="section-title" style={{ border: 'none' }}>Ficha da Oportunidade</h4>
                <div className="kv-grid-2">
                  <div className="kv-item">
                    <span className="kv-label">Origem comercial</span>
                    <span className="kv-value">{opportunity.source || 'Indireta'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Responsável</span>
                    <span className="kv-value">{opportunity.owner || 'Bruno Dev'}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Urgência</span>
                    <span className="kv-value uppercase font-semibold text-warning">{opportunity.urgency}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Fit / Score</span>
                    <span className="kv-value text-accent">{opportunity.probability}% de probabilidade</span>
                  </div>
                </div>
              </div>

              {lead && (
                <div className="section-card mt-1" style={{ padding: '1.25rem' }}>
                  <h4 className="section-title" style={{ border: 'none' }}>Contato Relacionado (Lead)</h4>
                  <div className="kv-grid-2">
                    <div className="kv-item">
                      <span className="kv-label">Responsável</span>
                      <span className="kv-value">{lead.name}</span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Empresa</span>
                      <span className="kv-value">{lead.companyName}</span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">E-mail</span>
                      <span className="kv-value">{lead.email || 'Não informado'}</span>
                    </div>
                    <div className="kv-item">
                      <span className="kv-label">Telefone</span>
                      <span className="kv-value">{lead.phone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions / Playbook tips */}
              <div className="glass-card mt-1" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.03)', border: '1px dashed rgba(99, 102, 241, 0.2)' }}>
                <h5 className="font-semibold text-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                  <Bot size={14} /> Recomendação do Agente Comercial
                </h5>
                <p className="text-secondary" style={{ fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                  {opportunity.urgency === 'high' || opportunity.urgency === 'critical'
                    ? 'Esta oportunidade está com prioridade alta. Recomendamos abordar o tomador de decisão Roberto com o Playbook de Follow-up de Proposta.'
                    : 'Esta oportunidade está em ritmo normal. Mantenha os contatos regulares agendando follow-ups semanais.'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Diagnosis */}
          {activeTab === 'diagnosis' && (
            <div className="animate-fade">
              <p className="text-muted text-xs" style={{ marginBottom: '1rem' }}>
                Preencha o diagnóstico técnico para calibrar a margem comercial e recomendar pacotes.
              </p>

              <div className="form-group">
                <label>Contexto de Negócio &amp; Estrutura do Lead</label>
                <textarea 
                  className="form-control" 
                  value={businessContext} 
                  onChange={e => setBusinessContext(e.target.value)} 
                  rows={2} 
                  placeholder="Ex: Empresa possui faturamento de R$ 50k, 5 funcionários..."
                />
              </div>

              <div className="form-group">
                <label>Desafios &amp; Gargalos Identificados (Dores)</label>
                <textarea 
                  className="form-control" 
                  value={painPoints} 
                  onChange={e => setPainPoints(e.target.value)} 
                  rows={2} 
                  placeholder="Ex: Contabilidade atual demora para responder, guias com erro..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Decisor de Compra</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={decisionMaker} 
                    onChange={e => setDecisionMaker(e.target.value)} 
                    placeholder="Quem assina o contrato?" 
                  />
                </div>
                <div className="form-group">
                  <label>Budget / Verba do cliente</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value)} 
                    placeholder="Disponibilidade financeira" 
                  />
                </div>
              </div>

              {/* Playbook questions help */}
              {playbooks.map(pb => (
                <div key={pb.id} className="section-card mt-1" style={{ padding: '1rem' }}>
                  <span className="badge badge-purple text-xs">{pb.name}</span>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="font-semibold text-secondary" style={{ fontSize: '0.78rem' }}>Perguntas sugeridas para fazer na reunião:</span>
                    <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {pb.suggestedQuestions.map((q, idx) => <li key={idx}>{q}</li>)}
                    </ul>
                  </div>
                </div>
              ))}

              <button className="btn btn-primary mt-1" onClick={handleSaveDiagnosis}>
                Salvar Diagnóstico
              </button>
            </div>
          )}

          {/* Tab 3: Activities */}
          {activeTab === 'activities' && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="font-semibold text-primary" style={{ fontSize: '0.85rem' }}>Histórico de Ações</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsActivityOpen(true)}>
                  <Plus size={12} /> Nova Ação
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {relatedActivities.map(act => (
                  <div 
                    key={act.id} 
                    className="glass-card no-hover" 
                    style={{ 
                      padding: '0.75rem', 
                      borderLeft: `3px solid ${act.status === 'completed' ? 'var(--success)' : act.status === 'overdue' ? 'var(--danger)' : 'var(--warning)'}` 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-semibold text-primary" style={{ fontSize: '0.8125rem' }}>{act.title}</span>
                      <span className="text-muted text-xs">{act.dueDate}</span>
                    </div>
                    {act.description && <p className="text-secondary text-xs" style={{ margin: '0.2rem 0 0' }}>{act.description}</p>}
                    
                    {act.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-success btn-xs" onClick={() => updateSalesActivityStatus(act.id, 'completed', 'Contato realizado com sucesso.')}>
                          Concluir
                        </button>
                        <button className="btn btn-secondary btn-xs" onClick={() => updateSalesActivityStatus(act.id, 'canceled')}>
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {relatedActivities.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-state-title">Nenhuma atividade registrada</span>
                    <span className="empty-state-text">Agende uma ligação ou e-mail para acompanhar esta oportunidade.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Proposals */}
          {activeTab === 'proposals' && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="font-semibold text-primary" style={{ fontSize: '0.85rem' }}>Propostas Comerciais</span>
                <button className="btn className=btn btn-secondary btn-sm" onClick={() => setIsProposalOpen(true)}>
                  <Plus size={12} /> Elaborar Proposta
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {relatedProposals.map(prop => (
                  <div key={prop.id} className="glass-card no-hover" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h5 className="font-semibold text-primary" style={{ margin: 0, fontSize: '0.875rem' }}>{prop.title}</h5>
                        <span className="text-muted text-xs">Válida até: {prop.validUntil || 'Não informada'}</span>
                      </div>
                      <span className={`badge ${prop.status === 'accepted' ? 'badge-success' : prop.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {prop.status === 'sent_placeholder' ? 'Enviada' : prop.status === 'accepted' ? 'Aceita' : 'Rascunho'}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      {prop.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.2rem 0' }}>
                          <span className="text-secondary">{it.description}</span>
                          <span className="font-semibold text-primary">{formatBRL(it.total)}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span className="font-semibold text-secondary">Total Proposto:</span>
                        <span className="font-bold text-accent">{formatBRL(prop.total)}</span>
                      </div>
                    </div>

                    {prop.status === 'sent_placeholder' && (
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-success btn-sm" onClick={() => updateSalesProposalStatus(prop.id, 'accepted')}>
                          Aceitar Proposta
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateSalesProposalStatus(prop.id, 'rejected')}>
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {relatedProposals.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-state-title">Nenhuma proposta elaborada</span>
                    <span className="empty-state-text">Prepare as opções comerciais do catálogo para enviar ao lead.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Objections */}
          {activeTab === 'objections' && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="font-semibold text-primary" style={{ fontSize: '0.85rem' }}>Gestão de Objeções</span>
                {!isAddingObjection && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsAddingObjection(true)}>
                    + Registrar Objeção
                  </button>
                )}
              </div>

              {isAddingObjection && (
                <form onSubmit={handleAddObjectionSubmit} className="glass-card mt-1" style={{ padding: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>Tipo de Objeção</label>
                    <select className="form-select" value={newObjType} onChange={e => setNewObjType(e.target.value as any)}>
                      <option value="Preço">Preço alto</option>
                      <option value="Prazo">Prazo longo</option>
                      <option value="Já tem fornecedor">Já tem fornecedor</option>
                      <option value="Sem orçamento">Sem verba/budget</option>
                      <option value="Não é prioridade">Não é prioridade</option>
                      <option value="Precisa falar com sócio">Precisa falar com sócio</option>
                      <option value="Outro">Outro motivo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>O que o cliente alegou?</label>
                    <textarea 
                      className="form-control" 
                      value={newObjDesc} 
                      onChange={e => setNewObjDesc(e.target.value)} 
                      rows={2} 
                      placeholder="Ex: Achou o setup inicial muito caro..." 
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingObjection(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary btn-sm">Gravar</button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {relatedObjections.map(obj => (
                  <div key={obj.id} className="glass-card no-hover" style={{ padding: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge badge-neutral text-xs">{obj.type}</span>
                      <span className={`badge ${obj.status === 'handled' ? 'badge-success' : 'badge-warning'}`}>
                        {obj.status === 'handled' ? 'Contornada' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-secondary text-xs" style={{ margin: '0.4rem 0 0.5rem' }}>{obj.description}</p>
                    
                    {obj.status === 'open' && (
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-success btn-xs" 
                          onClick={() => updateSalesObjectionStatus(obj.id, 'handled', 'Apresentado desconto de 10% no setup.')}
                        >
                          Marcar como Contornada
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {relatedObjections.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-state-title">Nenhuma objeção levantada</span>
                    <span className="empty-state-text">O processo comercial está correndo sem impedimentos reportados.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Onboarding */}
          {activeTab === 'onboarding' && opportunity.status === 'won' && (
            <div className="animate-fade">
              <div className="glass-card no-hover" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '1.25rem' }}>
                <span className="font-semibold text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Fechamento com Sucesso!
                </span>
                <p className="text-secondary" style={{ fontSize: '0.78rem', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                  Esta oportunidade está marcada como Ganha. Podemos iniciar o fluxo de onboarding técnico.
                </p>
              </div>

              <div className="section-card" style={{ padding: '1.25rem' }}>
                <h4 className="section-title" style={{ border: 'none' }}>Checklist de Passagem para Onboarding</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={onboardingChecked.doc} 
                      onChange={e => setOnboardingChecked({ ...onboardingChecked, doc: e.target.checked })} 
                    />
                    Documentação social e procurações coletadas
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={onboardingChecked.setup} 
                      onChange={e => setOnboardingChecked({ ...onboardingChecked, setup: e.target.checked })} 
                    />
                    Parceiros de indicação/repasse validados no financeiro
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={onboardingChecked.kickoff} 
                      onChange={e => setOnboardingChecked({ ...onboardingChecked, kickoff: e.target.checked })} 
                    />
                    Reunião de Kick-off de implantação agendada
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleConvertClientAndContract}
                  disabled={client !== undefined}
                >
                  {client ? 'Já Convertido em Cliente' : 'Efetuar Onboarding Automático'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fechar Detalhes</button>
        </div>
      </div>

      {/* Sales Activity Form Drawer */}
      {isActivityOpen && (
        <SalesActivityFormDrawer 
          opportunityId={opportunity.id} 
          leadId={opportunity.leadId}
          onClose={() => setIsActivityOpen(false)} 
        />
      )}

      {/* Sales Proposal Form Drawer */}
      {isProposalOpen && (
        <SalesProposalFormDrawer 
          opportunityId={opportunity.id} 
          leadId={opportunity.leadId}
          onClose={() => setIsProposalOpen(false)} 
        />
      )}
    </div>
  );
};
