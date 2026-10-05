import React, { useState, useEffect } from 'react';
import { useStore } from '../../../data/store';
import { getSuggestedAgentActions, renderSalesTemplate, getRecommendedServicesForLead } from '../utils/salesSelectors';
import { Bot, MessageSquare, Copy, Check, Info } from 'lucide-react';
import { SalesActivityFormDrawer } from './SalesActivityFormDrawer';

export const SalesAgentTab: React.FC = () => {
  const { 
    leads, opportunities, salesActivities, salesProposals, salesSettings, salesCommunicationTemplates, services, addSalesOutboundMessageLog
  } = useStore();

  const today = new Date().toISOString().split('T')[0];
  const suggestions = getSuggestedAgentActions(leads, opportunities, salesActivities, salesProposals, salesSettings, today);

  // Approach Generator States
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [channelOverride, setChannelOverride] = useState<'whatsapp' | 'email'>('whatsapp');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [copied, setCopied] = useState(false);

  // Selected lead for activity quick-create
  const [quickActivityLead, setQuickActivityLead] = useState<{ leadId?: string; oppId?: string } | null>(null);

  // Update generated text when selections change
  useEffect(() => {
    if (!selectedLeadId || !selectedTemplateId) {
      setGeneratedText('');
      setGeneratedSubject('');
      return;
    }

    const lead = leads.find(l => l.id === selectedLeadId);
    const template = salesCommunicationTemplates.find(t => t.id === selectedTemplateId);
    const service = services.find(s => s.id === selectedServiceId);

    if (lead && template) {
      const vars = {
        leadName: lead.name,
        companyName: lead.companyName,
        serviceName: service ? service.name : 'Assessoria Integrada',
        sellerName: 'Bruno Dev',
        proposalValue: service ? `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}/mês` : 'R$ 1.500,00/mês',
        painPoint: lead.notes || 'agilizar conciliação fiscal e contabilidade integrada',
        meetingDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString('pt-BR') // +2 days
      };

      setGeneratedText(renderSalesTemplate(template.body, vars));
      if (template.subject) {
        setGeneratedSubject(renderSalesTemplate(template.subject, vars));
      } else {
        setGeneratedSubject('');
      }
      setChannelOverride(template.channel === 'email' ? 'email' : 'whatsapp');
    }
  }, [selectedLeadId, selectedTemplateId, selectedServiceId, leads, salesCommunicationTemplates, services]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Save message log local simulation
    const lead = leads.find(l => l.id === selectedLeadId);
    addSalesOutboundMessageLog({
      channel: channelOverride,
      status: 'copied',
      recipientName: lead ? lead.name : 'Lead Franco',
      recipientContact: lead ? (channelOverride === 'whatsapp' ? lead.phone : lead.email || '') : '',
      body: generatedText,
      subject: generatedSubject || undefined,
      leadId: selectedLeadId || undefined
    });
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="animate-fade">
      <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
        
        {/* Suggested Actions List */}
        <div className="glass-card no-hover" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', margin: 0 }}>
            <Bot size={16} className="text-accent" /> Radar Comercial &amp; Próximas Ações
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '55vh' }}>
            {suggestions.map(sug => (
              <div 
                key={sug.id} 
                className="glass-card no-hover" 
                style={{ 
                  padding: '0.875rem', 
                  borderLeft: `3px solid ${sug.priority === 'critical' ? 'var(--danger)' : sug.priority === 'high' ? 'var(--warning)' : 'var(--info)'}` 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-semibold text-primary" style={{ fontSize: '0.8125rem' }}>{sug.entityName}</span>
                  <span className={`badge ${getPriorityBadgeClass(sug.priority)} text-xs`}>{sug.priority}</span>
                </div>
                <p className="text-secondary text-xs" style={{ margin: '0.25rem 0 0.5rem' }}>{sug.reason}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Sugerido: {sug.actionSuggested}</span>
                  <button 
                    className="btn btn-secondary btn-sm btn-icon-text"
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => {
                      if (sug.entityType === 'lead') {
                        setSelectedLeadId(sug.entityId);
                        const rdServices = getRecommendedServicesForLead(sug.metadata.lead, services);
                        if (rdServices.length > 0) setSelectedServiceId(rdServices[0].id);
                        // Pick first template matching first_contact
                        const firstContactTmp = salesCommunicationTemplates.find(t => t.type === 'first_contact');
                        if (firstContactTmp) setSelectedTemplateId(firstContactTmp.id);
                      } else {
                        setQuickActivityLead({
                          leadId: sug.metadata?.lead?.id || sug.metadata?.opportunity?.leadId,
                          oppId: sug.entityType === 'opportunity' ? sug.entityId : undefined
                        });
                      }
                    }}
                  >
                    {sug.entityType === 'lead' ? 'Ver Abordagem' : 'Lançar Ação'}
                  </button>
                </div>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-title">Funil Comercial Saudável</span>
                <span className="empty-state-text">O Agente não identificou gargalos operacionais ou contatos atrasados hoje.</span>
              </div>
            )}
          </div>
        </div>

        {/* Approach Generator */}
        <div className="glass-card no-hover" style={{ padding: '1.25rem' }}>
          <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', margin: '0 0 1rem' }}>
            <MessageSquare size={16} className="text-accent" /> Gerador de Abordagem &amp; Roteiros
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="form-group">
              <label>Selecionar Lead para Abordar</label>
              <select className="form-select" value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)}>
                <option value="">Selecione um lead...</option>
                {leads.filter(l => l.status !== 'converted').map(l => (
                  <option key={l.id} value={l.id}>{l.companyName} ({l.name})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Template Comercial</label>
                <select className="form-select" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
                  <option value="">Selecione um template...</option>
                  {salesCommunicationTemplates.filter(t => t.active).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.channel.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Serviço Foco</label>
                <select className="form-select" value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated output */}
            {generatedText && (
              <div className="animate-fade" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                  <span className="badge badge-purple text-xs uppercase">{channelOverride}</span>
                  <button className="btn btn-secondary btn-sm btn-icon-text" onClick={handleCopy}>
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    {copied ? 'Copiado!' : 'Copiar Roteiro'}
                  </button>
                </div>

                {generatedSubject && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                    <strong className="text-secondary">Assunto:</strong> <span className="text-primary">{generatedSubject}</span>
                  </div>
                )}

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto' }}>
                  {generatedText}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', padding: '0.625rem 0.75rem', background: 'rgba(60, 200, 245,0.02)', border: '1px dashed rgba(60, 200, 245,0.2)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
              <Info size={14} className="text-accent" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <span className="text-muted" style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
                <strong>Modo preparação:</strong> nenhuma mensagem ou e-mail real será enviado de forma externa.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Activity Creator Drawer */}
      {quickActivityLead && (
        <SalesActivityFormDrawer 
          leadId={quickActivityLead.leadId}
          opportunityId={quickActivityLead.oppId}
          onClose={() => setQuickActivityLead(null)}
        />
      )}
    </div>
  );
};
