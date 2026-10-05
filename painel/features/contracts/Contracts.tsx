import React, { useState } from 'react';
import { useStore } from '../../data/store';
import { Plus, FileText, Check, Pause } from 'lucide-react';
import type { Contract } from '../../types';
import { ContractDetailDrawer } from './components/ContractDetailDrawer';
import { ContractFormDrawer } from './components/ContractFormDrawer';

export const Contracts: React.FC = () => {
  const { clients, services, contracts, updateContractStatus } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Contratos &amp; Escopos</h2>
          <p className="page-subtitle">Contratos operacionais ativos da Franco Tecnologia</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> Novo Contrato
          </button>
        </div>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Código / Ref</th>
                <th>Cliente</th>
                <th>Serviço Contratado</th>
                <th>Data de Início</th>
                <th>Valor Mensal</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => {
                const client = clients.find(c => c.id === contract.clientId);
                const service = services.find(s => s.id === contract.serviceId);
                return (
                  <tr
                    key={contract.id}
                    className="clickable"
                    onClick={() => setSelectedContract(contract)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} className="text-accent" />
                        <span className="text-mono font-semibold text-secondary">{contract.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="font-semibold">{client ? client.name : 'Cliente Desconhecido'}</td>
                    <td className="text-secondary">{service ? service.name : 'Serviço Personalizado'}</td>
                    <td className="text-secondary">{contract.startDate}</td>
                    <td>
                      <span className="font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.monthlyValue)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${contract.status === 'active' ? 'badge-success' : contract.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>
                        {contract.status === 'active' ? 'Ativo' : contract.status === 'suspended' ? 'Suspenso' : contract.status}
                      </span>
                    </td>
                    <td className="td-actions">
                      {contract.status === 'active' ? (
                        <button
                          className="btn btn-secondary btn-sm btn-icon-text"
                          onClick={(e) => { e.stopPropagation(); updateContractStatus(contract.id, 'suspended'); }}
                          title="Suspender Contrato"
                        >
                          <Pause size={13} /> Suspender
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm btn-icon-text"
                          onClick={(e) => { e.stopPropagation(); updateContractStatus(contract.id, 'active'); }}
                          title="Reativar Contrato"
                        >
                          <Check size={13} /> Ativar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ContractFormDrawer
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {selectedContract && (
        <ContractDetailDrawer
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
};
