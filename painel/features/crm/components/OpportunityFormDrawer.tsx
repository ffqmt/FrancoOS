import React, { useState, useEffect } from 'react';
import { useStore } from '../../../data/store';
import type { Lead, Opportunity, OpportunityUrgency, OpportunityStatus } from '../../../types';
import { X, Play } from 'lucide-react';

interface OpportunityFormDrawerProps {
  opportunity?: Opportunity | null;
  lead?: Lead | null;
  clientId?: string;
  onClose: () => void;
}

export const OpportunityFormDrawer: React.FC<OpportunityFormDrawerProps> = ({ opportunity, lead, clientId, onClose }) => {
  const { addOpportunity, updateOpportunity, services, pipelineStages, clients, leads } = useStore();

  const [title, setTitle] = useState('');
  const [stageId, setStageId] = useState('');
  const [value, setValue] = useState(0);
  const [probability, setProbability] = useState(50);
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [source, setSource] = useState('');
  const [mainServiceId, setMainServiceId] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [decisionMaker, setDecisionMaker] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState<OpportunityUrgency>('medium');
  const [status, setStatus] = useState<OpportunityStatus>('open');
  const [lostReason, setLostReason] = useState('');
  const [lostNotes, setLostNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [owner, setOwner] = useState('Bruno Dev');

  // Preselected references
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    // Default stage is first active stage
    const defaultStage = pipelineStages.find(s => s.active)?.id || '';
    setStageId(defaultStage);

    if (lead) {
      setSelectedLeadId(lead.id);
      setTitle(`Assessoria Franco - ${lead.companyName}`);
      setSource(lead.source || '');
    }
    if (clientId) {
      setSelectedClientId(clientId);
      const cl = clients.find(c => c.id === clientId);
      if (cl) setTitle(`Projeto Franco - ${cl.name}`);
    }

    if (opportunity) {
      setTitle(opportunity.title);
      setStageId(opportunity.stageId);
      setValue(opportunity.value);
      setProbability(opportunity.probability);
      setExpectedCloseDate(opportunity.expectedCloseDate || '');
      setSource(opportunity.source || '');
      setMainServiceId(opportunity.mainServiceId || '');
      setPainPoints(opportunity.painPoints || '');
      setDecisionMaker(opportunity.decisionMaker || '');
      setBudget(opportunity.budget || '');
      setUrgency(opportunity.urgency || 'medium');
      setStatus(opportunity.status);
      setLostReason(opportunity.lostReason || '');
      setLostNotes(opportunity.lostNotes || '');
      setNextActionDate(opportunity.nextActionDate || '');
      setOwner(opportunity.owner || 'Bruno Dev');
      setSelectedLeadId(opportunity.leadId || '');
      setSelectedClientId(opportunity.clientId || '');
    }
  }, [opportunity, lead, clientId, pipelineStages, clients]);

  // Adjust probability based on selected stage
  useEffect(() => {
    if (stageId) {
      const stageObj = pipelineStages.find(s => s.id === stageId);
      if (stageObj) {
        setProbability(stageObj.probability);
      }
    }
  }, [stageId, pipelineStages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !stageId) return;

    const payload = {
      title,
      stageId,
      position: opportunity?.position ?? 0,
      value: Number(value) || 0,
      probability: Number(probability) || 50,
      expectedCloseDate: expectedCloseDate || undefined,
      source: source || undefined,
      mainServiceId: mainServiceId || undefined,
      serviceIds: mainServiceId ? [mainServiceId] : [],
      painPoints: painPoints || undefined,
      decisionMaker: decisionMaker || undefined,
      budget: budget || undefined,
      urgency,
      status,
      lostReason: status === 'lost' ? lostReason : undefined,
      lostNotes: status === 'lost' ? lostNotes : undefined,
      nextActionDate: nextActionDate || undefined,
      owner,
      leadId: selectedLeadId || undefined,
      clientId: selectedClientId || undefined
    };

    if (opportunity) {
      updateOpportunity({
        ...opportunity,
        ...payload,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    } else {
      addOpportunity(payload);
    }
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <Play size={20} />
            </div>
            <div>
              <h3>{opportunity ? 'Editar Oportunidade' : 'Nova Oportunidade de Venda'}</h3>
              <p>Adicionar ao pipeline comercial da Franco</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="drawer-body">
            <div className="form-group">
              <label>Título da Oportunidade *</label>
              <input 
                type="text" 
                className="form-control" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: BPO + Contabilidade - TechVibe"
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vincular a Lead (Opcional)</label>
                <select className="form-select" value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)}>
                  <option value="">Nenhum lead</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.companyName} ({l.name})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Vincular a Cliente (Opcional)</label>
                <select className="form-select" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                  <option value="">Nenhum cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Etapa do Pipeline *</label>
                <select className="form-select" value={stageId} onChange={e => setStageId(e.target.value)} required>
                  {pipelineStages.filter(s => s.active).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Valor Mensal (MRR) Estimado *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={value} 
                  onChange={e => setValue(Number(e.target.value) || 0)} 
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Urgência comercial</label>
                <select className="form-select" value={urgency} onChange={e => setUrgency(e.target.value as OpportunityUrgency)}>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica / Imediato</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fechamento Esperado</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={expectedCloseDate} 
                  onChange={e => setExpectedCloseDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Serviço Principal do Catálogo</label>
                <select className="form-select" value={mainServiceId} onChange={e => setMainServiceId(e.target.value)}>
                  <option value="">Nenhum</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.price}/mês)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Origem da Oportunidade</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={source} 
                  onChange={e => setSource(e.target.value)} 
                  placeholder="Ex: Google, LinkedIn, Indicação" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Orçamento Disponível</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={budget} 
                  onChange={e => setBudget(e.target.value)} 
                  placeholder="Ex: R$ 3.000 a 4.000/mês" 
                />
              </div>

              <div className="form-group">
                <label>Decisor Identificado</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={decisionMaker} 
                  onChange={e => setDecisionMaker(e.target.value)} 
                  placeholder="Ex: Roberto Silva (Diretor)" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Responsável Comercial</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={owner} 
                  onChange={e => setOwner(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Data para Próxima Ação</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={nextActionDate} 
                  onChange={e => setNextActionDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dores e Desafios (Pain Points)</label>
              <textarea 
                className="form-control" 
                value={painPoints} 
                onChange={e => setPainPoints(e.target.value)} 
                rows={2}
                placeholder="Ex: Reclamações de atrasos na entrega da guia tributária..." 
              />
            </div>

            <div className="form-group">
              <label>Status Comercial</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value as OpportunityStatus)}>
                <option value="open">Aberta (Em Negociação)</option>
                <option value="won">Ganha (Fechado Ganho)</option>
                <option value="lost">Perdida</option>
                <option value="paused">Pausada</option>
              </select>
            </div>

            {status === 'lost' && (
              <div className="form-group animate-fade">
                <label>Motivo da Perda</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={lostReason} 
                  onChange={e => setLostReason(e.target.value)} 
                  placeholder="Ex: Preço, Sem contato, Concorrente..."
                  required
                />
                <label style={{ marginTop: '0.5rem' }}>Detalhamento da perda</label>
                <textarea 
                  className="form-control" 
                  value={lostNotes} 
                  onChange={e => setLostNotes(e.target.value)} 
                  rows={2} 
                />
              </div>
            )}
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar Oportunidade</button>
          </div>
        </form>
      </div>
    </div>
  );
};
