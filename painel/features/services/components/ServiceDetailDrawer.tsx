import React from 'react';
import type { Service } from '../../../types';
import { useStore } from '../../../data/store';
import { X, Layers, DollarSign, Cpu, User } from 'lucide-react';

interface ServiceDetailDrawerProps {
  service: Service;
  onClose: () => void;
}

export const ServiceDetailDrawer: React.FC<ServiceDetailDrawerProps> = ({ service, onClose }) => {
  const { contracts, clients } = useStore();

  // Find contracts that use this service
  const serviceContracts = contracts.filter(c => c.serviceId === service.id);
  // Find unique clients that hired this service
  const clientIds = Array.from(new Set(serviceContracts.map(c => c.clientId)));
  const hiringClients = clients.filter(c => clientIds.includes(c.id));

  // Mock cost and margin calculations
  const costPercentage = service.category === 'automacao' ? 35 : service.category === 'consultoria' ? 40 : 20;
  const estimatedCost = service.price * (costPercentage / 100);
  const estimatedMargin = service.price - estimatedCost;
  const marginPercentage = 100 - costPercentage;

  // Determine related module applicability
  const getRelatedModule = (cat: string) => {
    switch (cat) {
      case 'automacao': return 'Automações / RPAs';
      case 'consultoria': return 'Consultoria & Projetos';
      case 'produto_digital': return 'Produtos Digitais / SaaS';
      case 'integracao': return 'Integrações (APIs)';
      case 'contabilidade':
      case 'fiscal':
      case 'folha':
      case 'patrimonio':
        return 'Escritório Contábil';
      default:
        return 'Core Geral';
    }
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

  return (
    <div className="modal-overlay">
      <div className="modal-content drawer-mode" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu className="text-primary" size={20} />
            <div>
              <h3 style={{ margin: 0 }}>Núcleo do Serviço</h3>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Configuração Técnica e Comercial</span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="service-details-card" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              {service.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success">{getCategoryLabel(service.category)}</span>
              <span className="badge badge-info">{service.billingCycle === 'unico' ? 'Cobrança Única' : `Mensalidade ${service.billingCycle}`}</span>
              <span className="badge badge-purple">Módulo: {getRelatedModule(service.category)}</span>
            </div>
            <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {service.description || 'Nenhuma descrição detalhada informada.'}
            </p>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1rem' }}>
              <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Valor de Referência</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-success)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Padrão da tabela comercial</span>
            </div>

            <div className="glass-card" style={{ padding: '1rem' }}>
              <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Rentabilidade Estimada</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {marginPercentage}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Margem operacional bruta</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <DollarSign size={16} className="text-primary" /> Engenharia Financeira & Custos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span className="text-muted">Custo Estimado de Entrega (R$):</span>
                <span className="fw-600" style={{ color: 'var(--text-danger)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedCost)} ({costPercentage}%)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span className="text-muted">Margem Estimada (R$):</span>
                <span className="fw-600" style={{ color: 'var(--text-success)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedMargin)} ({marginPercentage}%)
                </span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span className="text-muted">Gera Nota da Franco:</span>
                <span className="badge badge-success">Sim (NFS-e de Serviços)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span className="text-muted">Permite Comissão / Indicações:</span>
                <span className="badge badge-success">Sim (Até 15%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span className="text-muted">Gera Tarefas Padrão de Setup:</span>
                <span className="badge badge-info">Sim (Gatilho automático)</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.2rem' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Layers size={16} className="text-primary" /> Contratações Ativas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {hiringClients.length === 0 ? (
                <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic' }}>
                  Nenhum cliente ativo contratou este serviço até o momento.
                </p>
              ) : (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem 0' }}>Cliente</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Vigentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hiringClients.map(cl => {
                        const ctCount = serviceContracts.filter(c => c.clientId === cl.id).length;
                        return (
                          <tr key={cl.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <User size={12} className="text-muted" />
                                {cl.name}
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--text-primary)' }}>
                              {ctCount} {ctCount === 1 ? 'Contrato' : 'Contratos'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
