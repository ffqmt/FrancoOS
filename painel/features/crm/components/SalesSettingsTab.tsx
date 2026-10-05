import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { SalesAutomationTriggerType, SalesAutomationChannel, SalesAutomationActionType } from '../../../types';
import { Save, Settings, Bot, Cpu } from 'lucide-react';

export const SalesSettingsTab: React.FC = () => {
  const { 
    salesSettings, updateSalesSettings, 
    pipelineStages, addPipelineStage, togglePipelineStageStatus,
    salesAutomationRules, addSalesAutomationRule, toggleSalesAutomationRuleStatus,
    salesCommunicationTemplates
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'stages' | 'automations'>('general');

  // General Settings Form state
  const [minimumTicket, setMinimumTicket] = useState(salesSettings.minimumTicket ?? 1000);
  const [idealSegments, setIdealSegments] = useState(salesSettings.idealSegments ? salesSettings.idealSegments.join(', ') : '');
  const [excludedSegments, setExcludedSegments] = useState(salesSettings.excludedSegments ? salesSettings.excludedSegments.join(', ') : '');
  const [targetLocations, setTargetLocations] = useState(salesSettings.targetLocations ? salesSettings.targetLocations.join(', ') : '');
  const [slaFirstContactHours, setSlaFirstContactHours] = useState(salesSettings.slaFirstContactHours ?? 24);
  const [staleOpportunityDays, setStaleOpportunityDays] = useState(salesSettings.staleOpportunityDays ?? 7);

  // New Pipeline Stage state
  const [stageName, setStageName] = useState('');
  const [stageProb, setStageProb] = useState(50);
  const [stageColor, setStageColor] = useState('#f5c04a');

  // New Automation Rule state
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState<SalesAutomationTriggerType>('lead_created');
  const [ruleChannel, setRuleChannel] = useState<SalesAutomationChannel>('internal');
  const [ruleAction, setRuleAction] = useState<SalesAutomationActionType>('create_activity');
  const [ruleTemplateId, setRuleTemplateId] = useState('');
  const [ruleOffset, setRuleOffset] = useState(24);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSalesSettings({
      ...salesSettings,
      minimumTicket,
      idealSegments: idealSegments.split(',').map(s => s.trim()).filter(Boolean),
      excludedSegments: excludedSegments.split(',').map(s => s.trim()).filter(Boolean),
      targetLocations: targetLocations.split(',').map(s => s.trim()).filter(Boolean),
      slaFirstContactHours,
      staleOpportunityDays,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    alert('Configurações gerais salvas com sucesso!');
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName) return;

    addPipelineStage({
      name: stageName,
      probability: stageProb,
      color: stageColor,
      order: pipelineStages.length + 1,
      active: true,
      stageType: 'open'
    });

    setStageName('');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    addSalesAutomationRule({
      name: ruleName,
      triggerType: ruleTrigger,
      channel: ruleChannel,
      actionType: ruleAction,
      templateId: ruleTemplateId || undefined,
      offsetValue: ruleOffset,
      active: true
    });

    setRuleName('');
  };

  return (
    <div className="animate-fade">
      {/* Sub Tabs */}
      <div className="page-tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`page-tab ${activeSubTab === 'general' ? 'active' : ''}`} onClick={() => setActiveSubTab('general')}>
          <Settings size={14} /> Critérios ICP &amp; Prazos
        </button>
        <button className={`page-tab ${activeSubTab === 'stages' ? 'active' : ''}`} onClick={() => setActiveSubTab('stages')}>
          <Cpu size={14} /> Etapas do Pipeline
        </button>
        <button className={`page-tab ${activeSubTab === 'automations' ? 'active' : ''}`} onClick={() => setActiveSubTab('automations')}>
          <Bot size={14} /> Automações Comerciais (Simulado)
        </button>
      </div>

      {/* SubTab 1: General */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="section-card" style={{ padding: '1.5rem' }}>
          <h4 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Critérios de Qualificação ICP (Perfil de Cliente Ideal)</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ticket Mensal Mínimo (R$)</label>
              <input 
                type="number" 
                className="form-control" 
                value={minimumTicket} 
                onChange={e => setMinimumTicket(Number(e.target.value) || 0)} 
              />
            </div>
            <div className="form-group">
              <label>Dias para Oportunidade ficar Estagnada</label>
              <input 
                type="number" 
                className="form-control" 
                value={staleOpportunityDays} 
                onChange={e => setStaleOpportunityDays(Number(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>SLA Primeiro Contato (Horas)</label>
              <input 
                type="number" 
                className="form-control" 
                value={slaFirstContactHours} 
                onChange={e => setSlaFirstContactHours(Number(e.target.value) || 0)} 
              />
            </div>
            <div className="form-group">
              <label>Regiões Geográficas Foco (separadas por vírgula)</label>
              <input 
                type="text" 
                className="form-control" 
                value={targetLocations} 
                onChange={e => setTargetLocations(e.target.value)} 
                placeholder="Ex: São Paulo - SP, Rio de Janeiro - RJ"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Segmentos Ideais / Prioritários (separados por vírgula)</label>
            <input 
              type="text" 
              className="form-control" 
              value={idealSegments} 
              onChange={e => setIdealSegments(e.target.value)} 
              placeholder="Ex: Saúde, Tecnologia, Logística"
            />
          </div>

          <div className="form-group">
            <label>Segmentos Excluídos / Sem Fit (separados por vírgula)</label>
            <input 
              type="text" 
              className="form-control" 
              value={excludedSegments} 
              onChange={e => setExcludedSegments(e.target.value)} 
              placeholder="Ex: Construção Civil Pesada, Varejo Físico"
            />
          </div>

          <button type="submit" className="btn btn-primary mt-1" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Save size={16} /> Salvar Critérios
          </button>
        </form>
      )}

      {/* SubTab 2: Stages */}
      {activeSubTab === 'stages' && (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          {/* List stages */}
          <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
            <h4 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Etapas Ativas</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pipelineStages.sort((a,b)=>a.order - b.order).map(st => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: st.color }}></div>
                    <span className="font-semibold text-primary" style={{ fontSize: '0.8125rem' }}>{st.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="text-secondary text-xs">{st.probability}%</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => togglePipelineStageStatus(st.id)}>
                      {st.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Stage Form */}
          <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
            <h4 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Adicionar Nova Etapa</h4>
            
            <form onSubmit={handleAddStage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Nome da Etapa *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={stageName} 
                  onChange={e => setStageName(e.target.value)} 
                  placeholder="Ex: Reunião de escopo"
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Probabilidade (%)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={stageProb} 
                    onChange={e => setStageProb(Number(e.target.value) || 0)} 
                    min={0}
                    max={100}
                  />
                </div>
                <div className="form-group">
                  <label>Cor de Destaque</label>
                  <input 
                    type="color" 
                    className="form-control" 
                    value={stageColor} 
                    onChange={e => setStageColor(e.target.value)} 
                    style={{ padding: '0.1rem', height: '36px' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-1">
                Cadastrar Etapa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SubTab 3: Automations */}
      {activeSubTab === 'automations' && (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          {/* List Automations */}
          <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
            <h4 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Regras de Automação Comercial</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {salesAutomationRules.map(rule => (
                <div key={rule.id} className="glass-card no-hover" style={{ padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-semibold text-primary" style={{ fontSize: '0.8125rem' }}>{rule.name}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleSalesAutomationRuleStatus(rule.id)}>
                      {rule.active ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>
                  {rule.description && <p className="text-secondary text-xs" style={{ margin: '0.2rem 0 0' }}>{rule.description}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Add Rule Form */}
          <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
            <h4 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Nova Regra Comercial (Simulação)</h4>
            
            <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Nome da Regra *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={ruleName} 
                  onChange={e => setRuleName(e.target.value)} 
                  placeholder="Ex: Alerta de Follow-up pós proposta"
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gatilho (Trigger)</label>
                  <select className="form-select" value={ruleTrigger} onChange={e => setRuleTrigger(e.target.value as any)}>
                    <option value="lead_created">Ao criar Lead</option>
                    <option value="no_contact_after_hours">Sem contato nas últimas X horas</option>
                    <option value="opportunity_stage_changed">Ao mover oportunidade de etapa</option>
                    <option value="diagnosis_completed">Diagnóstico preenchido</option>
                    <option value="opportunity_won">Oportunidade Ganha</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ação Executada</label>
                  <select className="form-select" value={ruleAction} onChange={e => setRuleAction(e.target.value as any)}>
                    <option value="create_activity">Criar Atividade de ligação</option>
                    <option value="suggest_message">Sugerir Mensagem pelo Agente</option>
                    <option value="remind_owner">Notificar vendedor</option>
                    <option value="prepare_contract">Preparar contrato automático</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Canal</label>
                  <select className="form-select" value={ruleChannel} onChange={e => setRuleChannel(e.target.value as any)}>
                    <option value="internal">Sistema (Interno)</option>
                    <option value="task">Criar Tarefa no board</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Offset de tempo (Horas/Dias)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={ruleOffset} 
                    onChange={e => setRuleOffset(Number(e.target.value) || 0)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Template Associado (Opcional)</label>
                <select className="form-select" value={ruleTemplateId} onChange={e => setRuleTemplateId(e.target.value)}>
                  <option value="">Nenhum</option>
                  {salesCommunicationTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Salvar Automação
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
