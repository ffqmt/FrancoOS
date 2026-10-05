import React, { useState } from 'react';
import { useStore } from '../../data/store';
import { Plus, X, Tag } from 'lucide-react';
import type { Service, ServiceCategory } from '../../types';
import { ServiceDetailDrawer } from './components/ServiceDetailDrawer';

export const Services: React.FC = () => {
  const { services, addService } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('contabilidade');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual' | 'unico'>('mensal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    addService({
      name,
      category,
      description,
      price: Number(price),
      billingCycle
    });

    setName('');
    setCategory('contabilidade');
    setDescription('');
    setPrice(0);
    setBillingCycle('mensal');
    setIsOpen(false);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'automacao': return 'Automação';
      case 'consultoria': return 'Consultoria';
      case 'produto_digital': return 'Produto Digital';
      case 'suporte': return 'Suporte';
      case 'contabilidade': return 'Contabilidade';
      case 'fiscal': return 'Fiscal';
      case 'folha': return 'Folha & DP';
      case 'patrimonio': return 'Patrimônio';
      case 'integracao': return 'Integração';
      case 'projeto': return 'Projeto';
      default: return cat;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'contabilidade': return 'badge-success';
      case 'fiscal': return 'badge-info';
      case 'folha': return 'badge-warning';
      case 'patrimonio': return 'badge-purple';
      case 'automacao': return 'badge-success';
      case 'consultoria': return 'badge-danger';
      case 'produto_digital': return 'badge-info';
      case 'suporte': return 'badge-warning';
      case 'integracao': return 'badge-purple';
      case 'projeto': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="services-container">
      <div className="services-actions">
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      <div className="grid-cols-4 mt-2">
        {services.map(service => (
          <div 
            key={service.id} 
            className="glass-card service-card" 
            onClick={() => setSelectedService(service)} 
            style={{ cursor: 'pointer' }}
          >
            <div className="service-card-header">
              <span className={`badge ${getCategoryBadge(service.category)}`}>
                {getCategoryLabel(service.category)}
              </span>
              <span className="billing-cycle-tag">{service.billingCycle}</span>
            </div>

            <h4 className="service-card-title">{service.name}</h4>
            <p className="service-card-desc">{service.description}</p>

            <div className="service-card-price-section">
              <div className="price-tag-wrapper">
                <Tag size={14} className="price-icon" />
                <span className="price-label">Valor de Referência:</span>
              </div>
              <span className="price-amount">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Service */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adicionar Serviço ao Catálogo</h3>
              <button className="btn-icon" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Serviço *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria</label>
                    <select 
                      className="form-select" 
                      value={category} 
                      onChange={e => setCategory(e.target.value as any)}
                    >
                      <option value="automacao">Automação</option>
                      <option value="consultoria">Consultoria</option>
                      <option value="produto_digital">Produto Digital</option>
                      <option value="suporte">Suporte</option>
                      <option value="contabilidade">Contabilidade</option>
                      <option value="fiscal">Fiscal</option>
                      <option value="folha">Folha & DP</option>
                      <option value="patrimonio">Patrimônio</option>
                      <option value="integracao">Integração</option>
                      <option value="projeto">Projeto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Faturamento / Ciclo</label>
                    <select 
                      className="form-select" 
                      value={billingCycle} 
                      onChange={e => setBillingCycle(e.target.value as any)}
                    >
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                      <option value="unico">Único</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Valor de Referência (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    value={price} 
                    onChange={e => setPrice(Number(e.target.value))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Descrição do Serviço</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Detalhes sobre o escopo e entregáveis..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .services-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .services-actions {
          display: flex;
          justify-content: flex-end;
        }

        .service-card {
          display: flex;
          flex-direction: column;
          min-height: 250px;
        }

        .service-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.875rem;
        }

        .billing-cycle-tag {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .service-card-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .service-card-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          flex: 1;
          line-height: 1.4;
        }

        .service-card-price-section {
          border-top: 1px solid var(--glass-border);
          padding-top: 0.875rem;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .price-tag-wrapper {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-muted);
        }

        .price-label {
          font-size: 0.75rem;
        }

        .price-amount {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--accent-primary);
        }
      `}</style>
      {selectedService && (
        <ServiceDetailDrawer 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};
