import React, { useState } from 'react';
import { useStore } from '../../../data/store';
import type { SalesProposalItem } from '../../../types';
import { X, FileText, Plus, Trash2 } from 'lucide-react';

interface SalesProposalFormDrawerProps {
  opportunityId: string;
  leadId?: string;
  onClose: () => void;
}

export const SalesProposalFormDrawer: React.FC<SalesProposalFormDrawerProps> = ({ opportunityId, leadId, onClose }) => {
  const { services, addSalesProposal } = useStore();

  const [title, setTitle] = useState('Proposta Comercial - Franco Tecnologia');
  const [validUntil, setValidUntil] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [proposalItems, setProposalItems] = useState<SalesProposalItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('Boleto bancário à vista ou parcelado.');
  const [scopeSummary, setScopeSummary] = useState('');
  const assumptions = 'Acesso a sistemas de nota fiscal e certificado digital.';
  const nextSteps = 'Assinatura de contrato após aceite da proposta.';

  const handleAddItem = () => {
    if (!selectedServiceId) return;
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    // Check if item is already added
    if (proposalItems.some(i => i.serviceId === service.id)) return;

    const newItem: SalesProposalItem = {
      serviceId: service.id,
      description: service.name,
      quantity: 1,
      unitPrice: service.price,
      total: service.price
    };

    setProposalItems([...proposalItems, newItem]);
    setSelectedServiceId('');
  };

  const handleRemoveItem = (index: number) => {
    setProposalItems(proposalItems.filter((_, idx) => idx !== index));
  };

  const subtotal = proposalItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposalItems.length === 0) {
      alert('Selecione pelo menos um serviço para a proposta.');
      return;
    }

    addSalesProposal({
      opportunityId,
      leadId,
      title,
      status: 'draft',
      validUntil: validUntil || undefined,
      items: proposalItems,
      subtotal,
      discount,
      total: grandTotal,
      paymentTerms,
      scopeSummary,
      assumptions,
      nextSteps
    });

    onClose();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="drawer-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="drawer-panel" style={{ width: '550px' }} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-header-icon">
              <FileText size={20} />
            </div>
            <div>
              <h3>Elaborar Proposta Comercial</h3>
              <p>Precificação e configuração comercial Franco OS</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="drawer-body">
            <div className="form-group">
              <label>Título da Proposta *</label>
              <input 
                type="text" 
                className="form-control" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data de Validade</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={validUntil} 
                  onChange={e => setValidUntil(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Desconto (R$)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={discount} 
                  onChange={e => setDiscount(Number(e.target.value) || 0)} 
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            {/* Select and Add Services */}
            <div className="section-card mt-1" style={{ padding: '1rem' }}>
              <span className="font-semibold text-secondary" style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>Serviços do Catálogo</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-select" 
                  value={selectedServiceId} 
                  onChange={e => setSelectedServiceId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({formatBRL(s.price)})</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary btn-icon-text" onClick={handleAddItem}>
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              {/* Items List */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {proposalItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <span className="font-semibold text-primary" style={{ fontSize: '0.78rem' }}>{item.description}</span>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qtd: {item.quantity} · Preço: {formatBRL(item.unitPrice)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-bold text-accent" style={{ fontSize: '0.85rem' }}>{formatBRL(item.total)}</span>
                      <button type="button" className="btn-icon" onClick={() => handleRemoveItem(idx)}>
                        <Trash2 size={12} className="text-danger" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations preview */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.2rem 0' }}>
                <span className="text-secondary">Subtotal:</span>
                <span className="font-semibold text-primary">{formatBRL(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.2rem 0' }}>
                <span className="text-secondary">Desconto:</span>
                <span className="font-semibold text-danger">-{formatBRL(discount)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span className="font-bold text-secondary">Total:</span>
                <span className="font-bold text-accent">{formatBRL(grandTotal)}</span>
              </div>
            </div>

            <div className="form-group mt-1">
              <label>Condições de Pagamento</label>
              <input 
                type="text" 
                className="form-control" 
                value={paymentTerms} 
                onChange={e => setPaymentTerms(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Resumo do Escopo Técnico</label>
              <textarea 
                className="form-control" 
                value={scopeSummary} 
                onChange={e => setScopeSummary(e.target.value)} 
                rows={2} 
                placeholder="Ex: Conciliação diária de até 2 contas bancárias e envio de relatórios de fluxo de caixa..." 
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Gravar Rascunho</button>
          </div>
        </form>
      </div>
    </div>
  );
};
