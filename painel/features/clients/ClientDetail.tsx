import React, { useState } from 'react';
import { useStore } from '../../data/store';
import type { Client, Contract } from '../../types';
import { ContractDetailDrawer } from '../contracts/components/ContractDetailDrawer';
import { ContractFormDrawer } from '../contracts/components/ContractFormDrawer';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Building2, 
  User, 
  FileText, 
  CheckSquare, 
  DollarSign, 
  FileSpreadsheet, 
  Clock, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  ShieldCheck,
  Mail,
  Phone,
  Paperclip,
  Tag,
  Download,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Laptop,
  Target,
  Network,
  Bot
} from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack }) => {
  const { 
    companies, contacts, contracts, tasks, transactions, invoices, services, documents, historyEvents, partnerRepayments, financialActions,
    addCompany, addContact, addDocument, addHistoryEvent, updateTaskStatus
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('summary');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Modal Open States
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  // New Company Form State
  const [compCorpName, setCompCorpName] = useState('');
  const [compTradeName, setCompTradeName] = useState('');
  const [compCnpj, setCompCnpj] = useState('');
  const [compMunicipio, setCompMunicipio] = useState('');
  const [compUf, setCompUf] = useState('');
  const [compObservacoes, setCompObservacoes] = useState('');

  // New Contact Form State
  const [conName, setConName] = useState('');
  const [conRole, setConRole] = useState('');
  const [conEmail, setConEmail] = useState('');
  const [conPhone, setConPhone] = useState('');
  const [conPrimary, setConPrimary] = useState(false);

  // New Document Form State
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'Contrato' | 'Proposta' | 'CNPJ/Contrato Social' | 'Certidão' | 'Outros'>('Outros');
  const [docContractId, setDocContractId] = useState('');
  const [docCompetencia, setDocCompetencia] = useState('');
  const [docTags, setDocTags] = useState('');

  // 1. Data Filtering
  const clientCompanies = companies.filter(c => c.clientId === client.id);
  const clientContacts = contacts.filter(c => c.clientId === client.id);
  const clientContracts = contracts.filter(c => c.clientId === client.id);
  const clientTasks = tasks.filter(t => t.clientId === client.id);
  const clientTransactions = transactions.filter(t => t.clientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id);
  const clientDocuments = documents.filter(d => d.clientId === client.id);
  const clientHistory = historyEvents.filter(h => h.clientId === client.id);

  // 2. Statistics Calculations
  const activeContractsCount = clientContracts.filter(c => c.status === 'active').length;
  const mrr = clientContracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyValue, 0);

  const pendingTasks = clientTasks.filter(t => t.status !== 'done');
  const pendingTasksCount = pendingTasks.length;

  const currentDate = new Date();
  const overdueTasksCount = pendingTasks.filter(t => new Date(t.dueDate) < currentDate).length;

  const openFinance = clientTransactions.filter(t => t.type === 'income' && t.status === 'pending');
  const openFinanceSum = openFinance.reduce((sum, t) => sum + t.amount, 0);

  const overdueFinance = clientTransactions.filter(t => t.type === 'income' && t.status === 'overdue');
  const overdueFinanceSum = overdueFinance.reduce((sum, t) => sum + t.amount, 0);

  const invoicesCount = clientInvoices.length;
  const documentsCount = clientDocuments.length;

  // 3. Label Translations
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

  // 4. Form Submit Handlers
  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compCorpName || !compCnpj) return;

    addCompany({
      clientId: client.id,
      corporateName: compCorpName,
      tradeName: compTradeName || compCorpName,
      cnpj: compCnpj,
      municipio: compMunicipio || undefined,
      uf: compUf || undefined,
      status: 'active',
      observacoes: compObservacoes || undefined
    });

    addHistoryEvent({
      clientId: client.id,
      title: 'Nova Empresa/Filial Vinculada',
      description: `Vinculada filial ${compTradeName || compCorpName} - CNPJ: ${compCnpj}`,
      type: 'system'
    });

    // Reset Form
    setCompCorpName('');
    setCompTradeName('');
    setCompCnpj('');
    setCompMunicipio('');
    setCompUf('');
    setCompObservacoes('');
    setIsAddCompanyOpen(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conName) return;

    addContact({
      clientId: client.id,
      name: conName,
      role: conRole,
      email: conEmail,
      phone: conPhone,
      isPrimary: conPrimary
    });

    addHistoryEvent({
      clientId: client.id,
      title: 'Pessoa de Contato Adicionada',
      description: `Adicionado contato ${conName} (${conRole})`,
      type: 'system'
    });

    // Reset Form
    setConName('');
    setConRole('');
    setConEmail('');
    setConPhone('');
    setConPrimary(false);
    setIsAddContactOpen(false);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    addDocument({
      clientId: client.id,
      name: docName,
      type: docType,
      contractId: docContractId || undefined,
      competencia: docCompetencia || undefined,
      tags: docTags ? docTags.split(',').map(t => t.trim()) : [],
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '512 KB' // Mock size
    });

    addHistoryEvent({
      clientId: client.id,
      title: 'Documento Indexado',
      description: `Documento "${docName}" associado ao cliente.`,
      type: 'system'
    });

    // Reset Form
    setDocName('');
    setDocType('Outros');
    setDocContractId('');
    setDocCompetencia('');
    setDocTags('');
    setIsAddDocOpen(false);
  };

  const handleTaskStatusToggle = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    updateTaskStatus(taskId, nextStatus);

    addHistoryEvent({
      clientId: client.id,
      title: 'Status de Tarefa Atualizado',
      description: `Tarefa marcada como ${nextStatus === 'done' ? 'Concluída' : 'Pendente'}.`,
      type: 'task_completed'
    });
  };

  // 5. Module Applicability Rules
  const contractServiceCategories = clientContracts.map(c => {
    const svc = services.find(s => s.id === c.serviceId);
    return svc ? svc.category : '';
  });

  const checkModuleApplicability = (moduleType: string) => {
    switch (moduleType) {
      case 'accounting':
        return contractServiceCategories.some(cat => 
          ['contabilidade', 'fiscal', 'folha', 'patrimonio'].includes(cat)
        );
      case 'saas':
        return contractServiceCategories.includes('produto_digital');
      case 'automations':
        return contractServiceCategories.includes('automacao');
      case 'consulting':
        return contractServiceCategories.some(cat => ['consultoria', 'projeto'].includes(cat));
      case 'integrations':
        return contractServiceCategories.includes('integracao');
      case 'ia':
        return clientContracts.some(c => {
          const svc = services.find(s => s.id === c.serviceId);
          return svc && svc.name.toLowerCase().includes('ia');
        });
      default:
        return false;
    }
  };

  // Menu Tabs definition
  const tabItems = [
    { id: 'summary', label: 'Resumo', icon: Clock },
    { id: 'companies', label: 'Empresas/CNPJs', icon: Building2, count: clientCompanies.length },
    { id: 'contacts', label: 'Contatos', icon: User, count: clientContacts.length },
    { id: 'contracts', label: 'Contratos', icon: FileText, count: clientContracts.length },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, count: pendingTasksCount, badge: overdueTasksCount > 0 ? 'alert' : undefined },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, badge: overdueFinanceSum > 0 ? 'danger' : undefined },
    { id: 'invoices', label: 'Notas da Franco', icon: FileSpreadsheet, count: invoicesCount },
    { id: 'documents', label: 'Documentos', icon: Paperclip, count: documentsCount },
    { id: 'modules', label: 'Módulos', icon: Layers },
    { id: 'history', label: 'Histórico', icon: Clock }
  ];

  return (
    <div className="client-360-container">
      {/* Top Breadcrumb Header */}
      <header className="detail-header glass-card">
        <div className="header-left">
          <button className="btn btn-secondary btn-back" onClick={onBack}>
            <ArrowLeft size={16} /> Voltar para Clientes
          </button>
          
          <div className="client-title-block mt-1">
            <div className="client-avatar">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="client-title-row">
                <h2>{client.name}</h2>
                <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
                <span className="badge badge-info">
                  {relationLabels[client.relationshipType] || client.relationshipType}
                </span>
              </div>
              <p className="client-subline">
                <strong>Razão Social:</strong> {client.corporateName} | <strong>CNPJ:</strong> {client.cnpj}
              </p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="meta-tags-block">
            {client.segmento && <span className="meta-badge"><Tag size={12} /> {client.segmento}</span>}
            {client.origem && <span className="meta-badge"><HelpCircle size={12} /> {client.origem}</span>}
            {client.tags?.map((tag, idx) => (
              <span key={idx} className="meta-badge tag-highlight">#{tag}</span>
            ))}
          </div>

          <div className="header-quick-actions mt-1">
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAddContactOpen(true)}>
              <Plus size={14} /> Contato
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAddCompanyOpen(true)}>
              <Plus size={14} /> CNPJ
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddDocOpen(true)}>
              <Plus size={14} /> Novo Doc
            </button>
          </div>
        </div>
      </header>

      {/* Summary KPI Cards Grid */}
      <section className="grid-cols-4 mt-1">
        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Recorrência Mensal (MRR)</span>
            <div className="kpi-icon-wrapper purple">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
          </div>
          <div className="kpi-subtext">
            {activeContractsCount} {activeContractsCount === 1 ? 'Contrato ativo' : 'Contratos ativos'}
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Tarefas Pendentes</span>
            <div className="kpi-icon-wrapper orange">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="kpi-value">{pendingTasksCount}</div>
          <div className="kpi-subtext text-danger">
            {overdueTasksCount > 0 ? `${overdueTasksCount} tarefas em atraso` : 'Nenhuma tarefa atrasada'}
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Financeiro Pendente</span>
            <div className="kpi-icon-wrapper blue">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(openFinanceSum + overdueFinanceSum)}
          </div>
          <div className="kpi-subtext text-warning">
            Atrasado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overdueFinanceSum)}
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Notas & Documentos</span>
            <div className="kpi-icon-wrapper green">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div className="kpi-value">{invoicesCount + documentsCount}</div>
          <div className="kpi-subtext">
            {invoicesCount} Notas Emitidas | {documentsCount} Docs
          </div>
        </div>
      </section>

      {/* Main Tab Controller */}
      <section className="client-tabs-wrapper mt-2">
        <div className="tabs-nav glass-card">
          {tabItems.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-link ${isActive ? 'active' : ''}`}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && <span className="tab-pill">{tab.count}</span>}
                {tab.badge === 'alert' && <span className="tab-dot alert"></span>}
                {tab.badge === 'danger' && <span className="tab-dot danger"></span>}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="tab-viewport glass-card mt-1">
          
          {/* TAB 1: RESUMO (SUMMARY) */}
          {activeTab === 'summary' && (
            <div className="tab-pane">
              <div className="grid-cols-2">
                <div>
                  <h4 className="pane-section-title">Parceria & Relacionamento</h4>
                  <div className="summary-relation-box mt-1">
                    <p>
                      <strong>Tipo de Relacionamento:</strong> {relationLabels[client.relationshipType] || client.relationshipType}
                    </p>
                    <p className="mt-05 text-secondary">
                      Cliente integrado à carteira de atendimento da Franco Tecnologia. Os módulos aplicados são definidos com base nos escopos de serviços contratados e vigentes.
                    </p>
                    {overdueFinanceSum > 0 && (
                      <div className="summary-alert-banner danger mt-1">
                        <AlertTriangle size={18} />
                        <div>
                          <h6>Pendências Financeiras</h6>
                          <p>Identificamos cobrança(s) vencida(s) para este cliente no valor total de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overdueFinanceSum)}.</p>
                        </div>
                      </div>
                    )}
                    {overdueTasksCount > 0 && (
                      <div className="summary-alert-banner warning mt-1">
                        <AlertCircle size={18} />
                        <div>
                          <h6>Demandas Atrasadas</h6>
                          <p>Existem {overdueTasksCount} tarefas vinculadas com prazos de entrega expirados.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="pane-section-title mt-2">Contratos Ativos</h4>
                  <div className="summary-contracts-list mt-1">
                    {clientContracts.length === 0 ? (
                      <p className="text-muted">Nenhum contrato ativo cadastrado.</p>
                    ) : (
                      clientContracts.map(c => {
                        const svc = services.find(s => s.id === c.serviceId);
                        return (
                          <div key={c.id} className="summary-contract-item">
                            <div>
                              <h6>{svc?.name || 'Serviço Personalizado'}</h6>
                              <span className="text-muted text-xs">Vigência desde {c.startDate}</span>
                            </div>
                            <span className="contract-value-tag">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.monthlyValue)}/mês
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="pane-section-title">Próximas Demandas & Prazos</h4>
                  <div className="summary-tasks-list mt-1">
                    {pendingTasks.length === 0 ? (
                      <p className="text-muted">Nenhuma tarefa pendente aberta.</p>
                    ) : (
                      pendingTasks.slice(0, 4).map(t => (
                        <div key={t.id} className={`summary-task-item ${t.priority}`}>
                          <div className="task-check-block">
                            <button 
                              className="task-checkbox-btn" 
                              onClick={() => handleTaskStatusToggle(t.id, t.status)}
                            >
                              {t.status === 'done' ? <CheckCircle size={16} /> : <HelpCircle size={16} />}
                            </button>
                            <div>
                              <h6 className="task-title-line">{t.title}</h6>
                              <p className="text-xs text-muted">Vencimento: {t.dueDate} | Resp: {t.assignee}</p>
                            </div>
                          </div>
                          <span className={`priority-badge ${t.priority}`}>{t.priority}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <h4 className="pane-section-title mt-2">Atividades Recentes</h4>
                  <div className="summary-history-timeline mt-1">
                    {clientHistory.length === 0 ? (
                      <p className="text-muted">Nenhum evento registrado no histórico.</p>
                    ) : (
                      clientHistory.slice(0, 3).map(h => (
                        <div key={h.id} className="timeline-item-compact">
                          <span className="timeline-dot-compact"></span>
                          <div className="timeline-content-compact">
                            <span className="timeline-date-compact">{h.date}</span>
                            <h6 className="timeline-title-compact">{h.title}</h6>
                            <p className="timeline-desc-compact">{h.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMPRESAS / CNPJS */}
          {activeTab === 'companies' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Empresas & Filiais Vinculadas</h4>
                  <p className="text-secondary text-sm">Empresas e CNPJs associados a esta conta de cliente.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddCompanyOpen(true)}>
                  <Plus size={16} /> Vincular CNPJ
                </button>
              </div>

              {clientCompanies.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <Building2 size={40} className="text-muted" />
                  <h5>Nenhuma empresa vinculada</h5>
                  <p>Adicione um CNPJ ou filial para organizar os faturamentos e demandas.</p>
                </div>
              ) : (
                <div className="company-cards-grid mt-2">
                  {clientCompanies.map(comp => (
                    <div key={comp.id} className="company-card-detail">
                      <div className="company-card-top">
                        <h5>{comp.tradeName}</h5>
                        <span className={`badge ${comp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {comp.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="company-card-body">
                        <p><strong>Razão Social:</strong> {comp.corporateName}</p>
                        <p><strong>CNPJ:</strong> {comp.cnpj}</p>
                        {comp.municipio && <p><strong>Cidade:</strong> {comp.municipio} - {comp.uf || 'SP'}</p>}
                        {comp.observacoes && <p className="company-card-obs"><strong>Obs:</strong> {comp.observacoes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTATOS */}
          {activeTab === 'contacts' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Pessoas de Contato</h4>
                  <p className="text-secondary text-sm">Contatos operacionais e responsáveis para comunicação rápida.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddContactOpen(true)}>
                  <Plus size={16} /> Adicionar Contato
                </button>
              </div>

              {clientContacts.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <User size={40} className="text-muted" />
                  <h5>Nenhum contato cadastrado</h5>
                  <p>Cadastre contatos para correspondência operacional, comercial ou de suporte.</p>
                </div>
              ) : (
                <div className="contacts-table-grid mt-2">
                  {clientContacts.map(con => (
                    <div key={con.id} className="contact-detail-row">
                      <div className="contact-row-left">
                        <div className="contact-icon-avatar">
                          <User size={18} />
                        </div>
                        <div>
                          <h6>
                            {con.name}
                            {con.isPrimary && (
                              <span className="badge badge-success text-xxs ml-05">Principal</span>
                            )}
                          </h6>
                          <span className="text-xs text-muted">{con.role}</span>
                        </div>
                      </div>
                      <div className="contact-row-middle">
                        <span className="contact-info-span"><Mail size={12} /> {con.email || 'Não informado'}</span>
                        <span className="contact-info-span"><Phone size={12} /> {con.phone || 'Não informado'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTRATOS */}
          {activeTab === 'contracts' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Contratos & Escopos Contratados</h4>
                  <p className="text-secondary text-sm">Relação de acordos vigentes, valores acordados e recorrência.</p>
                </div>
              </div>

              {clientContracts.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <FileText size={40} className="text-muted" />
                  <h5>Nenhum contrato ativo</h5>
                  <p>Para adicionar contratos, utilize o gerenciador geral de Contratos do Franco OS.</p>
                </div>
              ) : (
                <div className="contracts-full-list mt-2">
                  {clientContracts.map(c => {
                    const svc = services.find(s => s.id === c.serviceId);
                    
                    // Relation Indicators Calculations
                    const hasRepayments = partnerRepayments.some(r => r.contratoId === c.id);
                    const openReceivables = transactions.some(t => t.clientId === c.clientId && t.type === 'income' && t.status !== 'paid');
                    const hasOverdueReceivables = transactions.some(t => t.clientId === c.clientId && t.type === 'income' && t.status === 'overdue');
                    const pendingInvoice = invoices.some(i => i.clientId === c.clientId && i.status === 'draft');
                    const openTasks = tasks.some(t => t.clientId === c.clientId && t.status !== 'done');
                    const hasOverdueTasks = tasks.some(t => t.clientId === c.clientId && t.status !== 'done' && new Date(t.dueDate) < new Date());
                    const scheduledActions = financialActions.some(a => a.contratoId === c.id && a.status === 'agendada');

                    // Next billing details
                    const clientPendingTxs = transactions.filter(t => t.clientId === c.clientId && t.type === 'income' && t.status === 'pending');
                    const nextPendingTx = clientPendingTxs.sort((x, y) => new Date(x.dueDate).getTime() - new Date(y.dueDate).getTime())[0];
                    const proximaCobranca = nextPendingTx 
                      ? `${nextPendingTx.dueDate} (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nextPendingTx.amount)})` 
                      : 'Nenhuma prevista';

                    return (
                      <div 
                        key={c.id} 
                        className="contract-full-item glass-card" 
                        onClick={() => setSelectedContract(c)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="contract-item-header">
                          <div className="contract-header-left">
                            <FileText size={20} className="text-accent" />
                            <div>
                              <h5>{c.title || svc?.name || 'Serviço Personalizado'}</h5>
                              <span className="text-xs text-muted">Categoria: {svc?.category.toUpperCase() || 'GERAL'}</span>
                            </div>
                          </div>
                          <div className="contract-header-right">
                            <span className="contract-item-price">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.monthlyValue)}/{svc?.billingCycle || 'mensal'}
                            </span>
                            <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'suspended' ? 'badge-warning' : 'badge-danger'}`}>
                              {c.status === 'active' ? 'Ativo' : c.status === 'suspended' ? 'Suspenso' : c.status}
                            </span>
                          </div>
                        </div>
                        <div className="contract-item-body mt-1">
                          <p><strong>Descrição do Escopo:</strong> {c.scopeDescription || svc?.description}</p>
                          <div className="form-row mt-1 text-sm text-secondary">
                            <div><strong>Vigência Inicial:</strong> {c.startDate}</div>
                            {c.endDate && <div><strong>Término/Renovação:</strong> {c.endDate}</div>}
                            <div><strong>Responsável:</strong> {c.responsible || 'Sem atribuição'}</div>
                            <div><strong>Próxima Cobrança:</strong> {proximaCobranca}</div>
                          </div>

                          {/* Relation Badges Indicators */}
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.6rem' }}>
                            {hasRepayments && <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Repasse Vinculado</span>}
                            {hasOverdueReceivables ? (
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Cobrança Vencida</span>
                            ) : openReceivables ? (
                              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Cobrança em Aberto</span>
                            ) : null}
                            {pendingInvoice && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Nota da Franco Pendente</span>}
                            {hasOverdueTasks ? (
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Demandas Atrasadas</span>
                            ) : openTasks ? (
                              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Tarefas Ativas</span>
                            ) : null}
                            {scheduledActions && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Ação Agendada</span>}
                          </div>

                          {/* Action Buttons inside Card */}
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm" 
                              onClick={(e) => { e.stopPropagation(); setEditingContract(c); }}
                            >
                              Editar Contrato
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-ghost btn-sm" 
                              onClick={(e) => { e.stopPropagation(); setSelectedContract(c); }}
                            >
                              Ver Operação
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DEMANDAS / TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Demandas & Tarefas Operacionais</h4>
                  <p className="text-secondary text-sm">Rotinas e tarefas associadas aos escopos de serviços contratados.</p>
                </div>
              </div>

              {clientTasks.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <CheckSquare size={40} className="text-muted" />
                  <h5>Nenhuma tarefa registrada</h5>
                  <p>Não encontramos tarefas cadastradas para este cliente.</p>
                </div>
              ) : (
                <div className="tasks-detailed-list mt-2">
                  <div className="table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Tarefa</th>
                          <th>Status</th>
                          <th>Prioridade</th>
                          <th>Vencimento</th>
                          <th>Responsável</th>
                          <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientTasks.map(t => {
                          const isOverdue = t.status !== 'done' && new Date(t.dueDate) < currentDate;
                          return (
                            <tr key={t.id} className={isOverdue ? 'row-overdue' : ''}>
                              <td>
                                <div className="task-table-info">
                                  <span className="task-table-title">{t.title}</span>
                                  <span className="task-table-desc">{t.description}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  t.status === 'done' ? 'badge-success' : 
                                  t.status === 'doing' ? 'badge-info' : 'badge-warning'
                                }`}>
                                  {t.status === 'done' ? 'Concluído' : 
                                   t.status === 'doing' ? 'Executando' : 'A Fazer'}
                                </span>
                              </td>
                              <td>
                                <span className={`priority-badge-table ${t.priority}`}>
                                  {t.priority}
                                </span>
                              </td>
                              <td>
                                <span className={isOverdue ? 'text-danger font-semibold' : ''}>
                                  {t.dueDate} {isOverdue && ' (Atrasada!)'}
                                </span>
                              </td>
                              <td>{t.assignee}</td>
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  className="btn btn-secondary btn-xs"
                                  onClick={() => handleTaskStatusToggle(t.id, t.status)}
                                >
                                  {t.status === 'done' ? 'Reabrir' : 'Concluir'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FINANCEIRO */}
          {activeTab === 'finance' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Financeiro & Faturamento</h4>
                  <p className="text-secondary text-sm">Gestão de cobranças, histórico financeiro e estimativas do cliente.</p>
                </div>
              </div>

              {/* Internal Mini Finance KPI Cards */}
              <div className="grid-cols-4 mt-2">
                <div className="sub-kpi-card glass-card">
                  <span className="sub-kpi-title">Previsto (MRR)</span>
                  <span className="sub-kpi-value">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
                  </span>
                </div>
                <div className="sub-kpi-card glass-card">
                  <span className="sub-kpi-title">Em Aberto</span>
                  <span className="sub-kpi-value text-info">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(openFinanceSum)}
                  </span>
                </div>
                <div className="sub-kpi-card glass-card">
                  <span className="sub-kpi-title">Vencido</span>
                  <span className="sub-kpi-value text-danger">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overdueFinanceSum)}
                  </span>
                </div>
                <div className="sub-kpi-card glass-card">
                  <span className="sub-kpi-title">Recebido (Pago)</span>
                  <span className="sub-kpi-value text-success">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      clientTransactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
              </div>

              {clientTransactions.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <DollarSign size={40} className="text-muted" />
                  <h5>Nenhuma cobrança registrada</h5>
                  <p>Sem faturamentos ou movimentações financeiras vinculadas.</p>
                </div>
              ) : (
                <div className="finance-transactions-list mt-2">
                  <div className="table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Categoria</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                          <th>Status</th>
                          <th>Pagamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientTransactions.map(t => (
                          <tr key={t.id}>
                            <td>{t.description}</td>
                            <td>
                              <span className="category-tag-finance">{t.category}</span>
                            </td>
                            <td>{t.dueDate}</td>
                            <td className="font-semibold">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                            </td>
                            <td>
                              <span className={`badge ${
                                t.status === 'paid' ? 'badge-success' : 
                                t.status === 'overdue' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {t.status === 'paid' ? 'Pago' : 
                                 t.status === 'overdue' ? 'Vencido' : 'Pendente'}
                              </span>
                            </td>
                            <td>{t.paymentDate || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NOTAS DA FRANCO */}
          {activeTab === 'invoices' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Notas da Franco</h4>
                  <p className="text-secondary text-sm">Histórico de notas fiscais emitidas ou previstas pela Franco Tecnologia para este cliente.</p>
                </div>
              </div>

              {clientInvoices.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <FileSpreadsheet size={40} className="text-muted" />
                  <h5>Nenhuma nota da Franco encontrada</h5>
                  <p>Nenhuma nota fiscal emitida sob o CNPJ deste cliente para a Franco.</p>
                </div>
              ) : (
                <div className="invoices-list-table mt-2">
                  <div className="table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Nº da Nota</th>
                          <th>Data de Emissão</th>
                          <th>Valor Emitido</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Arquivos / Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientInvoices.map(inv => (
                          <tr key={inv.id}>
                            <td className="font-semibold">NFS-e #{inv.number}</td>
                            <td>{inv.issueDate}</td>
                            <td>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount)}
                            </td>
                            <td>
                              <span className={`badge ${
                                inv.status === 'issued' ? 'badge-success' : 
                                inv.status === 'draft' ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {inv.status === 'issued' ? 'Emitida' : 
                                 inv.status === 'draft' ? 'Rascunho' : 'Cancelada'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="btn-group-right">
                                <button className="btn btn-secondary btn-xs inline-flex" title="Simular Download PDF">
                                  <Download size={12} /> PDF
                                </button>
                                <button className="btn btn-secondary btn-xs inline-flex ml-05" title="Simular Download XML">
                                  <Download size={12} /> XML
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: DOCUMENTOS */}
          {activeTab === 'documents' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Central de Documentos</h4>
                  <p className="text-secondary text-sm">Contratos, procurações, cadastros e termos arquivados.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddDocOpen(true)}>
                  <Plus size={16} /> Indexar Documento
                </button>
              </div>

              {clientDocuments.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <Paperclip size={40} className="text-muted" />
                  <h5>Nenhum documento arquivado</h5>
                  <p>Faça upload de contratos sociais, termos de adesão e procurações do cliente.</p>
                </div>
              ) : (
                <div className="documents-detail-list mt-2">
                  <div className="table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Nome do Arquivo</th>
                          <th>Tipo</th>
                          <th>Competência</th>
                          <th>Data Upload</th>
                          <th>Tamanho</th>
                          <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientDocuments.map(doc => (
                          <tr key={doc.id}>
                            <td>
                              <div className="doc-table-info">
                                <span className="doc-table-name"><Paperclip size={14} className="text-accent" /> {doc.name}</span>
                                <div className="doc-tags-row mt-05">
                                  {doc.tags?.map((t, i) => (
                                    <span key={i} className="doc-mini-tag">{t}</span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-info">{doc.type}</span>
                            </td>
                            <td>{doc.competencia || 'Geral'}</td>
                            <td>{doc.uploadDate}</td>
                            <td>{doc.fileSize || 'N/A'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-secondary btn-xs" title="Baixar Documento">
                                <Download size={14} /> Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: MÓDULOS APLICÁVEIS */}
          {activeTab === 'modules' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Módulos Aplicáveis (Ecossistema Franco OS)</h4>
                  <p className="text-secondary text-sm">Diretrizes de conformidade e utilitários especializados aplicados a este cliente.</p>
                </div>
              </div>

              <div className="modules-applicability-grid mt-2">
                
                {/* Module 1: Escritório Contábil */}
                <div className={`module-app-card glass-card ${checkModuleApplicability('accounting') ? 'active' : ''}`}>
                  <div className="module-app-header">
                    <div className="module-app-icon-wrapper purple">
                      <Building2 size={22} />
                    </div>
                    <h5>Escritório Contábil</h5>
                  </div>
                  <p className="module-app-desc mt-05">
                    Central de rotinas contábeis, apurações fiscais, folha de pagamento de funcionários, eSocial e vencimentos de tributos federais e municipais.
                  </p>
                  <div className="module-app-footer mt-1">
                    {checkModuleApplicability('accounting') ? (
                      <span className="app-status-badge active">✔ Aplicável (Contrato Contábil Ativo)</span>
                    ) : (
                      <span className="app-status-badge inactive">Indisponível (Sem escopo contábil)</span>
                    )}
                  </div>
                </div>

                {/* Module 2: Produtos Digitais / SaaS */}
                <div className={`module-app-card glass-card ${checkModuleApplicability('saas') ? 'active' : ''}`}>
                  <div className="module-app-header">
                    <div className="module-app-icon-wrapper blue">
                      <Laptop size={22} />
                    </div>
                    <h5>Produtos Digitais & SaaS</h5>
                  </div>
                  <p className="module-app-desc mt-05">
                    Workspace para gerenciamento de assinaturas recorrentes, tokens de licenças SaaS e faturamentos agregados do ecossistema digital.
                  </p>
                  <div className="module-app-footer mt-1">
                    {checkModuleApplicability('saas') ? (
                      <span className="app-status-badge active">✔ Aplicável (Contrato SaaS Ativo)</span>
                    ) : (
                      <span className="app-status-badge inactive">Indisponível (Sem escopo de software)</span>
                    )}
                  </div>
                </div>

                {/* Module 3: Automações */}
                <div className={`module-app-card glass-card ${checkModuleApplicability('automations') ? 'active' : ''}`}>
                  <div className="module-app-header">
                    <div className="module-app-icon-wrapper green">
                      <Cpu size={22} />
                    </div>
                    <h5>Automações & RPA</h5>
                  </div>
                  <p className="module-app-desc mt-05">
                    Painel de monitoramento de robôs e automações contratadas para leitura de arquivos, download de notas ou rotinas robóticas personalizadas.
                  </p>
                  <div className="module-app-footer mt-1">
                    {checkModuleApplicability('automations') ? (
                      <span className="app-status-badge active">✔ Aplicável (Serviço de RPA Ativo)</span>
                    ) : (
                      <span className="app-status-badge inactive">Indisponível (Sem escopo de Automação)</span>
                    )}
                  </div>
                </div>

                {/* Module 4: Consultoria / Projetos */}
                <div className={`module-app-card glass-card ${checkModuleApplicability('consulting') ? 'active' : ''}`}>
                  <div className="module-app-header">
                    <div className="module-app-icon-wrapper orange">
                      <Target size={22} />
                    </div>
                    <h5>Consultoria / Projetos</h5>
                  </div>
                  <p className="module-app-desc mt-05">
                    Gerenciamento ágil de marcos (milestones), cronogramas, time tracking e alocação de squads consultivos focados nos processos do cliente.
                  </p>
                  <div className="module-app-footer mt-1">
                    {checkModuleApplicability('consulting') ? (
                      <span className="app-status-badge active">✔ Aplicável (Consultoria Ativa)</span>
                    ) : (
                      <span className="app-status-badge inactive">Indisponível (Sem escopo de consultoria)</span>
                    )}
                  </div>
                </div>

                {/* Module 5: Integrações */}
                <div className={`module-app-card glass-card ${checkModuleApplicability('integrations') ? 'active' : ''}`}>
                  <div className="module-app-header">
                    <div className="module-app-icon-wrapper red">
                      <Network size={22} />
                    </div>
                    <h5>Integrações Externas</h5>
                  </div>
                  <p className="module-app-desc mt-05">
                    Mapeador de fluxos de conexões webhook e API com ferramentas externas contratadas (WhatsApp, Stripe, Google Cloud).
                  </p>
                  <div className="module-app-footer mt-1">
                    {checkModuleApplicability('integrations') ? (
                      <span className="app-status-badge active">✔ Aplicável (Conexão Ativa)</span>
                    ) : (
                      <span className="app-status-badge inactive">Indisponível (Sem escopo de Integração)</span>
                    )}
                  </div>
                </div>

                {/* Module 6: IA & Agentes */}
                <div className={`module-app-card glass-card ${checkModuleApplicability('ia') ? 'active' : ''}`}>
                  <div className="module-app-header">
                    <div className="module-app-icon-wrapper info">
                      <Bot size={22} />
                    </div>
                    <h5>IA & Agentes Autônomos</h5>
                  </div>
                  <p className="module-app-desc mt-05">
                    Central de controle e configuração de robôs inteligentes (LLM prompt-engineered agents) atuando em triagens e suporte.
                  </p>
                  <div className="module-app-footer mt-1">
                    {checkModuleApplicability('ia') ? (
                      <span className="app-status-badge active">✔ Aplicável (Agente de IA Ativo)</span>
                    ) : (
                      <span className="app-status-badge inactive">Indisponível (Sem IA Aplicada)</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: HISTÓRICO (TIMELINE) */}
          {activeTab === 'history' && (
            <div className="tab-pane">
              <div className="tab-pane-header">
                <div>
                  <h4>Histórico & Linha do Tempo</h4>
                  <p className="text-secondary text-sm">Cronologia detalhada de eventos comerciais e operacionais deste cliente.</p>
                </div>
              </div>

              {clientHistory.length === 0 ? (
                <div className="empty-state-block mt-2">
                  <Clock size={40} className="text-muted" />
                  <h5>Nenhum evento registrado</h5>
                  <p>Sem eventos cadastrados na timeline operacional deste cliente.</p>
                </div>
              ) : (
                <div className="timeline-full-flow mt-2">
                  {clientHistory.map(evt => (
                    <div key={evt.id} className="timeline-flow-item">
                      <div className="timeline-flow-left">
                        <span className="timeline-flow-date">{evt.date}</span>
                      </div>
                      <div className="timeline-flow-middle">
                        <div className="timeline-flow-line"></div>
                        <div className={`timeline-flow-bullet ${evt.type}`}></div>
                      </div>
                      <div className="timeline-flow-right glass-card">
                        <h6 className="timeline-flow-title">{evt.title}</h6>
                        <p className="timeline-flow-desc text-secondary text-sm mt-05">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* MODALS */}

      {/* Add Company Modal */}
      {isAddCompanyOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adicionar CNPJ / Filial</h3>
              <button className="btn-icon" onClick={() => setIsAddCompanyOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCompany}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Razão Social *</label>
                  <input type="text" className="form-control" value={compCorpName} onChange={e => setCompCorpName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Nome Fantasia *</label>
                  <input type="text" className="form-control" value={compTradeName} onChange={e => setCompTradeName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>CNPJ *</label>
                  <input type="text" className="form-control" placeholder="00.000.000/0000-00" value={compCnpj} onChange={e => setCompCnpj(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Município</label>
                    <input type="text" className="form-control" placeholder="Ex: São Paulo" value={compMunicipio} onChange={e => setCompMunicipio(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>UF</label>
                    <input type="text" className="form-control" placeholder="Ex: SP" maxLength={2} value={compUf} onChange={e => setCompUf(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Observações / Finalidade</label>
                  <input type="text" className="form-control" placeholder="Ex: Galpão logístico" value={compObservacoes} onChange={e => setCompObservacoes(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddCompanyOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Empresa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adicionar Pessoa de Contato</h3>
              <button className="btn-icon" onClick={() => setIsAddContactOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input type="text" className="form-control" value={conName} onChange={e => setConName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Cargo / Função</label>
                  <input type="text" className="form-control" placeholder="Ex: Gerente Geral" value={conRole} onChange={e => setConRole(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input type="email" className="form-control" value={conEmail} onChange={e => setConEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Telefone / WhatsApp</label>
                    <input type="text" className="form-control" value={conPhone} onChange={e => setConPhone(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="isPrimaryContactCheckbox" 
                    checked={conPrimary} 
                    onChange={e => setConPrimary(e.target.checked)} 
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="isPrimaryContactCheckbox" style={{ margin: 0, cursor: 'pointer' }}>Definir como contato principal</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddContactOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Contato</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isAddDocOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Indexar Documento</h3>
              <button className="btn-icon" onClick={() => setIsAddDocOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDocument}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Documento / Arquivo *</label>
                  <input type="text" className="form-control" placeholder="Ex: Contrato de Prestacao.pdf" value={docName} onChange={e => setDocName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Tipo de Documento</label>
                  <select className="form-select" value={docType} onChange={e => setDocType(e.target.value as any)}>
                    <option value="Contrato">Contrato</option>
                    <option value="Proposta">Proposta</option>
                    <option value="CNPJ/Contrato Social">CNPJ / Contrato Social</option>
                    <option value="Certidão">Certidão</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contrato Vinculado (Opcional)</label>
                    <select className="form-select" value={docContractId} onChange={e => setDocContractId(e.target.value)}>
                      <option value="">Sem vínculo</option>
                      {clientContracts.map(c => {
                        const svc = services.find(s => s.id === c.serviceId);
                        return <option key={c.id} value={c.id}>{svc?.name || c.id}</option>;
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Competência (Opcional)</label>
                    <input type="text" className="form-control" placeholder="Ex: 06/2026" value={docCompetencia} onChange={e => setDocCompetencia(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tags (separadas por vírgula)</label>
                  <input type="text" className="form-control" placeholder="Ex: Assinado, Urgente" value={docTags} onChange={e => setDocTags(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddDocOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Indexar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedContract && (
        <ContractDetailDrawer 
          contract={selectedContract} 
          onClose={() => setSelectedContract(null)} 
        />
      )}

      {editingContract && (
        <ContractFormDrawer 
          contract={editingContract} 
          onClose={() => setEditingContract(null)} 
        />
      )}

      {/* Styled block specific to Client 360 */}
      <style>{`
        .client-360-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          padding: 1.75rem;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .btn-back {
          align-self: flex-start;
          font-size: 0.8125rem;
          padding: 0.5rem 1rem;
        }

        .client-title-block {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .client-avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          background: rgba(60, 200, 245, 0.12);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(60, 200, 245, 0.25);
          box-shadow: 0 0 15px rgba(60, 200, 245, 0.1);
        }

        .client-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .client-title-row h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .client-subline {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .meta-tags-block {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-sm);
        }

        .meta-badge.tag-highlight {
          border-color: rgba(60, 200, 245, 0.2);
          color: var(--accent-primary);
          background: rgba(60, 200, 245, 0.05);
        }

        .header-quick-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8125rem;
        }

        .btn-xs {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
        }

        .ml-05 {
          margin-left: 0.5rem;
        }
        
        .mt-05 {
          margin-top: 0.5rem;
        }

        .kpi-card {
          min-height: 120px;
        }

        /* Tabs Navigation */
        .tabs-nav {
          display: flex;
          padding: 0.5rem;
          gap: 0.25rem;
          overflow-x: auto;
          flex-wrap: nowrap;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .tabs-nav::-webkit-scrollbar {
          display: none;
        }

        .tab-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all var(--transition-fast);
          position: relative;
          flex-shrink: 0;
        }

        .tab-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .tab-link.active {
          color: var(--text-primary);
          background: rgba(60, 200, 245, 0.1);
          border: 1px solid rgba(60, 200, 245, 0.2);
        }

        .tab-pill {
          font-size: 0.6875rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }

        .tab-link.active .tab-pill {
          background: var(--accent-primary);
          border-color: transparent;
          color: #ffffff;
        }

        .tab-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          position: absolute;
          top: 6px;
          right: 6px;
        }

        .tab-dot.alert { background-color: var(--warning); }
        .tab-dot.danger { background-color: var(--danger); }

        /* Viewport Tab Panel */
        .tab-viewport {
          padding: 2rem;
          min-height: 400px;
        }

        .pane-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          border-left: 3px solid var(--accent-primary);
          padding-left: 0.75rem;
          margin-bottom: 1.25rem;
        }

        /* Summary Tab Utilities */
        .summary-relation-box {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
        }

        .summary-alert-banner {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
        }

        .summary-alert-banner.danger {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.25);
          color: var(--text-primary);
        }
        
        .summary-alert-banner.danger svg {
          color: var(--danger);
          flex-shrink: 0;
        }

        .summary-alert-banner.warning {
          background: rgba(249, 115, 22, 0.08);
          border-color: rgba(249, 115, 22, 0.25);
          color: var(--text-primary);
        }

        .summary-alert-banner.warning svg {
          color: var(--warning);
          flex-shrink: 0;
        }

        .summary-alert-banner h6 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.125rem 0;
        }

        .summary-alert-banner p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .summary-contracts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-contract-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
        }

        .summary-contract-item h6 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }

        .contract-value-tag {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .summary-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          position: relative;
        }

        .summary-task-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.5rem;
          bottom: 0.5rem;
          width: 3px;
          border-radius: var(--radius-full);
          background-color: var(--text-muted);
        }

        .summary-task-item.urgent::before { background-color: var(--danger); }
        .summary-task-item.high::before { background-color: var(--warning); }
        .summary-task-item.medium::before { background-color: var(--info); }
        .summary-task-item.low::before { background-color: var(--success); }

        .task-check-block {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .task-checkbox-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color var(--transition-fast);
        }

        .task-checkbox-btn:hover {
          color: var(--accent-primary);
        }

        .task-title-line {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .priority-badge {
          font-size: 0.6875rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
        }

        .priority-badge.urgent { color: var(--danger); background: var(--danger-glow); }
        .priority-badge.high { color: var(--warning); background: var(--warning-glow); }
        .priority-badge.medium { color: var(--info); background: var(--info-glow); }
        .priority-badge.low { color: var(--success); background: var(--success-glow); }

        .summary-history-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-left: 0.5rem;
          margin-top: 1rem;
        }

        .timeline-item-compact {
          display: flex;
          gap: 0.75rem;
          position: relative;
        }

        .timeline-dot-compact {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          margin-top: 0.35rem;
          flex-shrink: 0;
          z-index: 2;
        }

        .timeline-item-compact::after {
          content: '';
          position: absolute;
          left: 3px;
          top: 0.8rem;
          bottom: -1rem;
          width: 2px;
          background: var(--glass-border);
          z-index: 1;
        }

        .timeline-item-compact:last-child::after {
          display: none;
        }

        .timeline-content-compact {
          display: flex;
          flex-direction: column;
        }

        .timeline-date-compact {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        .timeline-title-compact {
          font-size: 0.8125rem;
          font-weight: 600;
          margin: 0.125rem 0 0 0;
        }

        .timeline-desc-compact {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.125rem;
          line-height: 1.3;
        }

        /* Submodule/Tab Pane Header */
        .tab-pane-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .tab-pane-header h4 {
          font-size: 1.2rem;
          font-weight: 700;
        }

        /* Company grids */
        .company-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .company-card-detail {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color var(--transition-fast);
        }

        .company-card-detail:hover {
          border-color: var(--accent-primary);
        }

        .company-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .company-card-top h5 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .company-card-body p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .company-card-obs {
          margin-top: 0.5rem;
          font-style: italic;
          color: var(--text-muted);
        }

        .empty-state-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--glass-border);
          border-radius: var(--radius-lg);
          gap: 0.75rem;
        }

        .empty-state-block h5 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .empty-state-block p {
          font-size: 0.8125rem;
          color: var(--text-muted);
          max-width: 320px;
        }

        /* Contacts Grid */
        .contacts-table-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .contact-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          gap: 2rem;
        }

        .contact-row-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .contact-icon-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .contact-row-left h6 {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .contact-row-middle {
          display: flex;
          gap: 1.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .contact-info-span {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        /* Contracts Full List */
        .contracts-full-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contract-full-item {
          padding: 1.5rem;
          background: var(--bg-tertiary);
        }

        .contract-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1rem;
        }

        .contract-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .contract-header-left h5 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .contract-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .contract-item-price {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .contract-item-body {
          font-size: 0.875rem;
        }

        /* Task Details Utilities */
        .priority-badge-table {
          font-size: 0.6875rem;
          text-transform: uppercase;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
        }

        .priority-badge-table.urgent { color: var(--danger); background: var(--danger-glow); }
        .priority-badge-table.high { color: var(--warning); background: var(--warning-glow); }
        .priority-badge-table.medium { color: var(--info); background: var(--info-glow); }
        .priority-badge-table.low { color: var(--success); background: var(--success-glow); }

        .row-overdue {
          background: rgba(239, 68, 68, 0.03);
          border-left: 2px solid var(--danger);
        }

        .task-table-info {
          display: flex;
          flex-direction: column;
        }

        .task-table-title {
          font-weight: 600;
          color: var(--text-primary);
        }

        .task-table-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.125rem;
        }

        /* Finance / Sub-kpi cards */
        .sub-kpi-card {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .sub-kpi-title {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sub-kpi-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .category-tag-finance {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        /* Documents Tab */
        .doc-table-info {
          display: flex;
          flex-direction: column;
        }

        .doc-table-name {
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .doc-tags-row {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .doc-mini-tag {
          font-size: 0.625rem;
          background: rgba(60, 200, 245, 0.05);
          border: 1px solid rgba(60, 200, 245, 0.15);
          color: var(--accent-primary);
          padding: 0.05rem 0.25rem;
          border-radius: var(--radius-sm);
        }

        /* Modules Applicability cards */
        .modules-applicability-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .module-app-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          opacity: 0.65;
        }

        .module-app-card.active {
          opacity: 1;
          border-color: rgba(60, 200, 245, 0.3);
          box-shadow: 0 4px 20px rgba(60, 200, 245, 0.08);
        }

        .module-app-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .module-app-header h5 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .module-app-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-app-icon-wrapper.purple { background: rgba(60, 200, 245, 0.12); color: var(--accent-primary); }
        .module-app-icon-wrapper.blue { background: rgba(14, 165, 233, 0.12); color: var(--info); }
        .module-app-icon-wrapper.green { background: rgba(34, 197, 94, 0.12); color: var(--success); }
        .module-app-icon-wrapper.orange { background: rgba(249, 115, 22, 0.12); color: var(--warning); }
        .module-app-icon-wrapper.red { background: rgba(239, 68, 68, 0.12); color: var(--danger); }
        .module-app-icon-wrapper.info { background: rgba(6, 182, 212, 0.12); color: var(--info); }

        .module-app-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
          flex: 1;
        }

        .module-app-footer {
          border-top: 1px solid var(--glass-border);
          padding-top: 0.75rem;
        }

        .app-status-badge {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .app-status-badge.active {
          color: var(--success);
        }

        .app-status-badge.inactive {
          color: var(--text-muted);
        }

        /* Timeline Event Styles */
        .timeline-full-flow {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 2rem;
        }

        .timeline-flow-item {
          display: grid;
          grid-template-columns: 120px 40px 1fr;
          align-items: flex-start;
          position: relative;
        }

        .timeline-flow-left {
          padding-top: 1rem;
          text-align: right;
        }

        .timeline-flow-date {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .timeline-flow-middle {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          position: relative;
        }

        .timeline-flow-line {
          width: 2px;
          background: var(--glass-border);
          position: absolute;
          top: 0;
          bottom: 0;
          z-index: 1;
        }

        .timeline-flow-item:first-child .timeline-flow-line {
          top: 1.25rem;
        }
        
        .timeline-flow-item:last-child .timeline-flow-line {
          bottom: 100%;
          height: 1.25rem;
        }

        .timeline-flow-bullet {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
          background: var(--text-muted);
          border: 2px solid var(--bg-primary);
          z-index: 2;
          margin-top: 1.25rem;
        }

        .timeline-flow-bullet.client_created { background-color: var(--info); }
        .timeline-flow-bullet.opportunity { background-color: var(--warning); }
        .timeline-flow-bullet.contract_started { background-color: var(--accent-primary); }
        .timeline-flow-bullet.billing { background-color: var(--info); }
        .timeline-flow-bullet.task_completed { background-color: var(--success); }
        .timeline-flow-bullet.invoice_issued { background-color: var(--success); }
        .timeline-flow-bullet.system { background-color: var(--text-secondary); }

        .timeline-flow-right {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .timeline-flow-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
        }

        .text-xxs {
          font-size: 0.625rem;
        }
        .ml-05 {
          margin-left: 0.5rem;
        }
        .font-semibold {
          font-weight: 600;
        }
        
        /* Table Button Group Utilities */
        .btn-group-right {
          display: inline-flex;
          gap: 0.25rem;
        }

        .btn-xs.inline-flex {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
      `}</style>
    </div>
  );
};
