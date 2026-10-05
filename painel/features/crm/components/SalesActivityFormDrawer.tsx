import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { SalesActivityType } from '../../../types';
import { X, Calendar } from 'lucide-react';

interface SalesActivityFormDrawerProps {
  opportunityId?: string;
  leadId?: string;
  onClose: () => void;
}

export const SalesActivityFormDrawer: React.FC<SalesActivityFormDrawerProps> = ({ opportunityId, leadId, onClose }) => {
  const { addSalesActivity } = useStore();

  const [type, setType] = useState<SalesActivityType>('call');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [owner, setOwner] = useState('Bruno Dev');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    addSalesActivity({
      type,
      title,
      description,
      dueDate,
      status: 'pending',
      opportunityId,
      leadId,
      owner
    });

    onClose();
  };

  return (
    <div className="drawer-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="drawer-panel" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <Calendar size={20} />
            </div>
            <div>
              <h3>Agendar Ação de Follow-up</h3>
              <p>Agenda comercial da Franco Tecnologia</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="drawer-body">
            <div className="form-group">
              <label>Tipo de Ação</label>
              <select className="form-select" value={type} onChange={e => setType(e.target.value as SalesActivityType)}>
                <option value="call">Telefonema</option>
                <option value="whatsapp">Mensagem WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="meeting">Reunião / Chamada</option>
                <option value="diagnosis">Apresentação Diagnóstico</option>
                <option value="follow_up">Follow-up Geral</option>
                <option value="proposal">Apresentação Proposta</option>
                <option value="negotiation">Reunião Negociação</option>
                <option value="internal_task">Atividade Interna</option>
              </select>
            </div>

            <div className="form-group">
              <label>Título da Ação *</label>
              <input 
                type="text" 
                className="form-control" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Ligar para alinhar preço" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Data de Vencimento *</label>
              <input 
                type="date" 
                className="form-control" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Responsável</label>
              <input 
                type="text" 
                className="form-control" 
                value={owner} 
                onChange={e => setOwner(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Instruções / Notas</label>
              <textarea 
                className="form-control" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3} 
                placeholder="Ex: Entrar em contato via WhatsApp oferecendo 5% de desconto no setup..." 
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Agendar Ação</button>
          </div>
        </form>
      </div>
    </div>
  );
};
