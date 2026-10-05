import React, { useState } from 'react';
import { useStore } from '../../data/store';
import type { Client, RelationshipType } from '../../types';
import { Plus, X } from 'lucide-react';
import { ClientDetail } from './ClientDetail';

export const Clients: React.FC = () => {
  const { clients, addClient } = useStore();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  React.useEffect(() => {
    const handleSelectClient = (e: Event) => {
      const customEvent = e as CustomEvent;
      const client = clients.find(c => c.id === customEvent.detail.clientId);
      if (client) {
        setSelectedClient(client);
      }
    };
    window.addEventListener('select-client', handleSelectClient);
    return () => window.removeEventListener('select-client', handleSelectClient);
  }, [clients]);

  React.useEffect(() => {
    const handleSelectClient = (e: Event) => {
      const customEvent = e as CustomEvent;
      const client = clients.find(c => c.id === customEvent.detail.clientId);
      if (client) {
        setSelectedClient(client);
      }
    };
    window.addEventListener('select-client', handleSelectClient);
    return () => window.removeEventListener('select-client', handleSelectClient);
  }, [clients]);

  // New Client Form State
  const [cName, setCName] = useState('');
  const [cCorp, setCCorp] = useState('');
  const [cCnpj, setCCnpj] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cRelationshipType, setCRelationshipType] = useState<RelationshipType>('consultoria');
  const [cSegmento, setCSegmento] = useState('');
  const [cOrigem, setCOrigem] = useState('');
  const [cTags, setCTags] = useState('');

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cCnpj) return;

    addClient({
      name: cName,
      corporateName: cCorp || cName,
      cnpj: cCnpj,
      status: 'active',
      email: cEmail,
      phone: cPhone,
      relationshipType: cRelationshipType,
      segmento: cSegmento || undefined,
      origem: cOrigem || undefined,
      tags: cTags ? cTags.split(',').map(t => t.trim()) : []
    });

    // Reset Form
    setCName('');
    setCCorp('');
    setCCnpj('');
    setCEmail('');
    setCPhone('');
    setCRelationshipType('consultoria');
    setCSegmento('');
    setCOrigem('');
    setCTags('');
    setIsAddClientOpen(false);
  };

  const relationLabels: Record<string, string> = {
    automacao: 'Automação',
    consultoria: 'Consultoria',
    sistema: 'Sistemas',
    saas: 'SaaS / Prod. Digital',
    suporte: 'Suporte',
    contabil: 'Contabilidade',
    fiscal: 'Fiscal',
    folha: 'Folha & DP',
    parceiro: 'Parceiro',
    indicador: 'Indicador',
    prestador: 'Prestador'
  };

  if (selectedClient) {
    return (
      <ClientDetail 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)} 
      />
    );
  }

  return (
    <div className="clients-container">
      <div className="clients-actions">
        <button className="btn btn-primary" onClick={() => setIsAddClientOpen(true)}>
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      <div className="glass-card mt-2">
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Nome do Cliente</th>
                <th>Relacionamento</th>
                <th>CNPJ Base</th>
                <th>Segmento</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="client-table-info">
                      <span className="client-table-name">{client.name}</span>
                      <span className="client-table-corp">{client.corporateName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      ['contabil', 'fiscal', 'folha'].includes(client.relationshipType) ? 'badge-success' : 'badge-info'
                    }`}>
                      {relationLabels[client.relationshipType] || client.relationshipType}
                    </span>
                  </td>
                  <td>{client.cnpj}</td>
                  <td>{client.segmento || 'Não informado'}</td>
                  <td>
                    <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedClient(client)}>
                      Ver 360º
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cadastrar Novo Cliente</h3>
              <button className="btn-icon" onClick={() => setIsAddClientOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddClientSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome Fantasia *</label>
                  <input type="text" className="form-control" value={cName} onChange={e => setCName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Razão Social</label>
                  <input type="text" className="form-control" value={cCorp} onChange={e => setCCorp(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>CNPJ *</label>
                  <input type="text" className="form-control" placeholder="00.000.000/0000-00" value={cCnpj} onChange={e => setCCnpj(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail Contato</label>
                    <input type="email" className="form-control" value={cEmail} onChange={e => setCEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Telefone Contato</label>
                    <input type="text" className="form-control" value={cPhone} onChange={e => setCPhone(e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Relacionamento</label>
                    <select 
                      className="form-select" 
                      value={cRelationshipType} 
                      onChange={e => setCRelationshipType(e.target.value as any)}
                    >
                      <option value="consultoria">Consultoria</option>
                      <option value="automacao">Automação</option>
                      <option value="sistema">Sistemas</option>
                      <option value="saas">SaaS / Prod. Digital</option>
                      <option value="suporte">Suporte</option>
                      <option value="contabil">Contabilidade</option>
                      <option value="fiscal">Fiscal</option>
                      <option value="folha">Folha & DP</option>
                      <option value="parceiro">Parceiro</option>
                      <option value="indicador">Indicador</option>
                      <option value="prestador">Prestador</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Segmento de Atuação</label>
                    <input type="text" className="form-control" placeholder="Ex: Tecnologia, Saúde" value={cSegmento} onChange={e => setCSegmento(e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Origem do Cliente</label>
                    <input type="text" className="form-control" placeholder="Ex: Indicação, Google Ads" value={cOrigem} onChange={e => setCOrigem(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Tags (separadas por vírgula)</label>
                    <input type="text" className="form-control" placeholder="Ex: VIP, Recorrente" value={cTags} onChange={e => setCTags(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddClientOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .clients-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .clients-actions {
          display: flex;
          justify-content: flex-end;
        }

        .client-table-info {
          display: flex;
          flex-direction: column;
        }

        .client-table-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .client-table-corp {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
