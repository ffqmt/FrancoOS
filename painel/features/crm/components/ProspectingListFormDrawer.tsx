import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { ProspectingChannel, ProspectingStatus } from '../../../types';
import { X, Search } from 'lucide-react';

interface ProspectingListFormDrawerProps {
  onClose: () => void;
}

export const ProspectingListFormDrawer: React.FC<ProspectingListFormDrawerProps> = ({ onClose }) => {
  const { addProspectingList } = useStore();

  const [name, setName] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const companySize = 'Pequena';
  const [keywords, setKeywords] = useState('');
  const [channel, setChannel] = useState<ProspectingChannel>('linkedin');
  const [serviceFocus, setServiceFocus] = useState('');
  const [desiredLeadCount, setDesiredLeadCount] = useState(10);
  const [status, setStatus] = useState<ProspectingStatus>('draft');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addProspectingList({
      name,
      targetSegment,
      targetLocation,
      companySize,
      keywords,
      channel,
      serviceFocus,
      desiredLeadCount,
      status,
      notes
    });

    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <Search size={20} />
            </div>
            <div>
              <h3>Nova Lista de Prospecção</h3>
              <p>Mapear leads e empresas frias localmente</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="drawer-body">
            <div className="form-group">
              <label>Nome da Lista *</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex: Clínicas odontológicas - SP Centro" 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Segmento Alvo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={targetSegment} 
                  onChange={e => setTargetSegment(e.target.value)} 
                  placeholder="Ex: Saúde, Varejo, SaaS" 
                />
              </div>
              <div className="form-group">
                <label>Localização Alvo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={targetLocation} 
                  onChange={e => setTargetLocation(e.target.value)} 
                  placeholder="Ex: São Paulo - SP" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Canal Principal</label>
                <select className="form-select" value={channel} onChange={e => setChannel(e.target.value as ProspectingChannel)}>
                  <option value="linkedin">LinkedIn Outbound</option>
                  <option value="google_maps">Google Maps / Busca Fria</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="referral">Indicação direta</option>
                  <option value="event">Eventos / Feiras</option>
                  <option value="manual">Manual / Outros</option>
                </select>
              </div>
              <div className="form-group">
                <label>Foco de Serviço</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={serviceFocus} 
                  onChange={e => setServiceFocus(e.target.value)} 
                  placeholder="Ex: BPO Financeiro" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantidade Estimada</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={desiredLeadCount} 
                  onChange={e => setDesiredLeadCount(Number(e.target.value) || 0)} 
                />
              </div>
              <div className="form-group">
                <label>Status Inicial</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value as ProspectingStatus)}>
                  <option value="draft">Rascunho</option>
                  <option value="researching">Em Pesquisa (Mapeamento)</option>
                  <option value="ready">Pronta para abordar</option>
                  <option value="contacting">Em Abordagem</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Palavras-chave de busca</label>
              <input 
                type="text" 
                className="form-control" 
                value={keywords} 
                onChange={e => setKeywords(e.target.value)} 
                placeholder="Ex: dentista, implante, consultório" 
              />
            </div>

            <div className="form-group">
              <label>Notas de Planejamento</label>
              <textarea 
                className="form-control" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3} 
                placeholder="Definir critério de fit para adicionar à lista..." 
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar Lista</button>
          </div>
        </form>
      </div>
    </div>
  );
};
