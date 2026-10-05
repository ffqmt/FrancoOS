import React, { useState, useEffect } from 'react';
import { useStore } from '../../../data/store';
import type { SalesCommunicationTemplate, SalesTemplateType, SalesTemplateChannel } from '../../../types';
import { X, FileText } from 'lucide-react';

interface SalesCommunicationTemplateFormDrawerProps {
  template?: SalesCommunicationTemplate | null;
  onClose: () => void;
}

export const SalesCommunicationTemplateFormDrawer: React.FC<SalesCommunicationTemplateFormDrawerProps> = ({ template, onClose }) => {
  const { addSalesCommunicationTemplate, updateSalesCommunicationTemplate } = useStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<SalesTemplateType>('first_contact');
  const [channel, setChannel] = useState<SalesTemplateChannel>('whatsapp');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setChannel(template.channel);
      setSubject(template.subject || '');
      setBody(template.body);
      setActive(template.active);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !body) return;

    // Detect variables in body/subject
    const detectedVars: string[] = [];
    const varRegex = /{{(.*?)}}/g;
    let match;
    while ((match = varRegex.exec(body + (subject || ''))) !== null) {
      if (!detectedVars.includes(match[1])) {
        detectedVars.push(match[1]);
      }
    }

    const payload = {
      name,
      type,
      channel,
      subject: channel === 'email' ? subject : undefined,
      body,
      active,
      variables: detectedVars
    };

    if (template) {
      updateSalesCommunicationTemplate({
        ...template,
        ...payload,
        updatedAt: new Date().toISOString().split('T')[0]
      });
    } else {
      addSalesCommunicationTemplate(payload);
    }
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <FileText size={20} />
            </div>
            <div>
              <h3>{template ? 'Editar Template' : 'Criar Roteiro Comercial'}</h3>
              <p>Gerenciador de abordagens Franco OS</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="drawer-body">
            <div className="form-group">
              <label>Nome do Roteiro *</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex: Abordagem fria - LinkedIn" 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Objetivo / Tipo</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value as SalesTemplateType)}>
                  <option value="first_contact">Primeiro Contato</option>
                  <option value="follow_up">Acompanhamento (Follow-up)</option>
                  <option value="post_meeting">Pós Reunião / Alinhamento</option>
                  <option value="proposal_send">Envio de Proposta</option>
                  <option value="reactivation">Reativação de Lead Parado</option>
                  <option value="objection_price">Contorno de Objeção: Preço</option>
                  <option value="objection_timing">Contorno de Objeção: Timing</option>
                  <option value="referral_request">Solicitação de Indicação</option>
                  <option value="upsell">Upsell para Cliente</option>
                  <option value="cross_sell">Cross-sell</option>
                </select>
              </div>

              <div className="form-group">
                <label>Canal Principal</label>
                <select className="form-select" value={channel} onChange={e => setChannel(e.target.value as SalesTemplateChannel)}>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="email">E-mail Corporativo</option>
                  <option value="internal">Alerta do Sistema</option>
                  <option value="manual">Manual / Telefone</option>
                </select>
              </div>
            </div>

            {channel === 'email' && (
              <div className="form-group animate-fade">
                <label>Assunto do E-mail *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  placeholder="Ex: Proposta de contabilidade - Franco Tecnologia"
                  required 
                />
              </div>
            )}

            <div className="form-group">
              <label>Corpo da Mensagem / Roteiro *</label>
              <textarea 
                className="form-control" 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                rows={6} 
                placeholder="Insira variáveis como {{leadName}}, {{companyName}}, {{sellerName}}..." 
                required 
              />
              <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Variáveis válidas: <code>{"{{leadName}}"}</code>, <code>{"{{companyName}}"}</code>, <code>{"{{sellerName}}"}</code>, <code>{"{{proposalValue}}"}</code>, <code>{"{{meetingDate}}"}</code>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={active} 
                  onChange={e => setActive(e.target.checked)} 
                />
                Template ativo no Agente Comercial
              </label>
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Gravar Roteiro</button>
          </div>
        </form>
      </div>
    </div>
  );
};
