import React, { useState, useEffect } from 'react';
import { useStore } from '../../../data/store';
import type { Lead, LeadStatus, LeadTemperature } from '../../../types';
import { X, User } from 'lucide-react';

interface LeadFormDrawerProps {
  lead?: Lead | null;
  onClose: () => void;
}

export const LeadFormDrawer: React.FC<LeadFormDrawerProps> = ({ lead, onClose }) => {
  const { addLead, updateLead } = useStore();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [segment, setSegment] = useState('');
  const [source, setSource] = useState('');
  const [companySize, setCompanySize] = useState('Pequena');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [temperature, setTemperature] = useState<LeadTemperature>('warm');
  const [score, setScore] = useState(50);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (lead) {
      setName(lead.name || '');
      setCompanyName(lead.companyName || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setWhatsapp(lead.whatsapp || '');
      setSegment(lead.segment || '');
      setSource(lead.source || '');
      setCompanySize(lead.companySize || 'Pequena');
      setStatus(lead.status || 'new');
      setTemperature(lead.temperature || 'warm');
      setScore(lead.score ?? 50);
      setNotes(lead.notes || '');
      setTagsInput(lead.tags ? lead.tags.join(', ') : '');
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      name,
      companyName,
      email,
      phone,
      whatsapp,
      segment,
      source,
      companySize,
      status,
      temperature,
      score,
      notes,
      tags,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (lead) {
      updateLead({
        ...lead,
        ...payload,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    } else {
      addLead({
        ...payload,
        notes: notes || 'Lead cadastrado.'
      });
    }
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <User size={20} />
            </div>
            <div>
              <h3>{lead ? 'Editar Lead' : 'Adicionar Novo Lead'}</h3>
              <p>{lead ? lead.companyName : 'Qualificação comercial Franco OS'}</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="drawer-body">
            <div className="form-row">
              <div className="form-group">
                <label>Nome do Contato *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ex: Roberto Silva" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Empresa *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)} 
                  placeholder="Ex: Silva Logística Ltda" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>E-mail comercial</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Ex: roberto@silvalog.com.br" 
                />
              </div>
              <div className="form-group">
                <label>Telefone fixo/celular</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Ex: (11) 98765-4321" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp corporativo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={whatsapp} 
                  onChange={e => setWhatsapp(e.target.value)} 
                  placeholder="Ex: (11) 98765-4321" 
                />
              </div>
              <div className="form-group">
                <label>Segmento de atuação</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={segment} 
                  onChange={e => setSegment(e.target.value)} 
                  placeholder="Ex: Logística, Tecnologia, Saúde" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Origem do Lead</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={source} 
                  onChange={e => setSource(e.target.value)} 
                  placeholder="Ex: Indicação, Google, LinkedIn" 
                />
              </div>
              <div className="form-group">
                <label>Porte da Empresa</label>
                <select 
                  className="form-select" 
                  value={companySize} 
                  onChange={e => setCompanySize(e.target.value)}
                >
                  <option value="Micro">Microempresa (ME)</option>
                  <option value="Pequena">Pequeno Porte (EPP)</option>
                  <option value="Média">Médio Porte</option>
                  <option value="Grande">Grande Porte</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Temperatura</label>
                <select 
                  className="form-select" 
                  value={temperature} 
                  onChange={e => setTemperature(e.target.value as LeadTemperature)}
                >
                  <option value="cold">Frio (Pouco Fit / Lento)</option>
                  <option value="warm">Morno (Avaliando)</option>
                  <option value="hot">Quente (Alta intenção / Fit)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status Operacional</label>
                <select 
                  className="form-select" 
                  value={status} 
                  onChange={e => setStatus(e.target.value as LeadStatus)}
                >
                  <option value="new">Novo Lead</option>
                  <option value="contacted">Abordado / Em Contato</option>
                  <option value="qualified">Qualificado</option>
                  <option value="unqualified">Sem Fit / Desqualificado</option>
                  <option value="converted">Convertido em Cliente</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Score do Lead (0-100)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={score} 
                  onChange={e => setScore(Number(e.target.value) || 0)} 
                  min={0}
                  max={100}
                />
              </div>
              <div className="form-group">
                <label>Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={tagsInput} 
                  onChange={e => setTagsInput(e.target.value)} 
                  placeholder="Ex: Importante, BPO, Urgente" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observações / Contexto Comercial</label>
              <textarea 
                className="form-control" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3} 
                placeholder="Detalhes adicionais coletados no primeiro contato..." 
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
};
