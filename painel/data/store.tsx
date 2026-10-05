import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lead, Client, Company, Contact, Service, Contract, Task, Transaction, Invoice, PartnerRepayment, AccountsPayable, AcaoFinanceira, LeadStatus, TaskStatus, TransactionStatus, ClientDocument, ClientHistoryEvent, Partner, FinancialAccount, FinancialEvent, FinancialEventStatus, FinancialAutomationRule, ManualFinancialEntry, ManualFinancialEntryStatus, PipelineStage, Opportunity, SalesActivity, SalesProposal, SalesCommunicationTemplate, ProspectingList, SalesAutomationRule, SalesSettings, SalesPlaybook, SalesObjection, SalesOutboundMessageLog } from '../types';
import { mockServices, mockFinancialAccounts, mockFinancialAutomationRules, mockPipelineStages, mockSalesCommunicationTemplates, mockSalesAutomationRules, mockSalesSettings, mockSalesPlaybooks, mockSalesObjections } from './mockData';
import { carregarEstado, limparEstado, salvarColecao, temPendencias } from './persistencia';

interface StoreContextType {
  leads: Lead[];
  clients: Client[];
  companies: Company[];
  contacts: Contact[];
  services: Service[];
  contracts: Contract[];
  tasks: Task[];
  transactions: Transaction[];
  invoices: Invoice[];
  partnerRepayments: PartnerRepayment[];
  accountsPayables: AccountsPayable[];
  financialActions: AcaoFinanceira[];
  documents: ClientDocument[];
  historyEvents: ClientHistoryEvent[];
  partners: Partner[];
  financialAccounts: FinancialAccount[];
  financialEvents: FinancialEvent[];
  financialAutomationRules: FinancialAutomationRule[];
  manualFinancialEntries: ManualFinancialEntry[];

  // Lead Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLeadStatus: (id: string, status: LeadStatus, notes?: string) => void;
  promoteLeadToClient: (leadId: string, companyDetails: { corporateName: string; cnpj: string }) => void;
  
  // Client & Company & Contact Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  addCompany: (company: Omit<Company, 'id'>) => Company;
  updateCompany: (company: Company) => void;
  addContact: (contact: Omit<Contact, 'id'>) => Contact;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;

  // Service Catalog Actions
  addService: (service: Omit<Service, 'id'>) => Service;

  // Contract Actions
  addContract: (contract: Omit<Contract, 'id'>) => Contract;
  updateContractStatus: (id: string, status: Contract['status']) => void;
  updateContract: (contract: Contract) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (task: Task) => void;

  // Finance Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  updateTransactionStatus: (id: string, status: TransactionStatus, paymentDate?: string, financialAccountId?: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  // Partner & Repayment Actions
  addPartnerRepayment: (repayment: Omit<PartnerRepayment, 'id'>) => PartnerRepayment;
  updatePartnerRepaymentStatus: (id: string, status: PartnerRepayment['status'], paymentDate?: string) => void;

  // Accounts Payable Actions
  addAccountsPayable: (ap: Omit<AccountsPayable, 'id'>) => AccountsPayable;
  updateAccountsPayableStatus: (id: string, status: AccountsPayable['status'], paymentDate?: string, financialAccountId?: string) => void;

  // Financial Actions / Agenda (legacy — still used by ContractDetailDrawer)
  addFinancialAction: (action: Omit<AcaoFinanceira, 'id'>) => AcaoFinanceira;
  updateFinancialActionStatus: (id: string, status: AcaoFinanceira['status']) => void;

  // Financial Accounts (Bancos, Contas & Caixas)
  addFinancialAccount: (account: Omit<FinancialAccount, 'id' | 'createdAt' | 'updatedAt'>) => FinancialAccount;
  updateFinancialAccount: (account: FinancialAccount) => void;
  toggleFinancialAccountStatus: (id: string) => void;

  // Financial Events (Agenda Financeira 2.0)
  addFinancialEvent: (event: Omit<FinancialEvent, 'id' | 'createdAt' | 'updatedAt'>) => FinancialEvent;
  updateFinancialEvent: (event: FinancialEvent) => void;
  updateFinancialEventStatus: (id: string, status: FinancialEventStatus) => void;

  // Financial Automation Rules
  addFinancialAutomationRule: (rule: Omit<FinancialAutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => FinancialAutomationRule;
  updateFinancialAutomationRule: (rule: FinancialAutomationRule) => void;
  toggleFinancialAutomationRuleStatus: (id: string) => void;

  // Manual Financial Entries (lançamentos manuais e transferências)
  addManualFinancialEntry: (entry: Omit<ManualFinancialEntry, 'id' | 'createdAt' | 'updatedAt'>) => ManualFinancialEntry;
  updateManualFinancialEntry: (entry: ManualFinancialEntry) => void;
  updateManualFinancialEntryStatus: (id: string, status: ManualFinancialEntryStatus) => void;

  // Document & History Actions
  addDocument: (doc: Omit<ClientDocument, 'id'>) => ClientDocument;
  addHistoryEvent: (evt: Omit<ClientHistoryEvent, 'id' | 'date'>) => ClientHistoryEvent;
  
  // Partner CRUD
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => Partner;
  updatePartner: (partner: Partner) => void;

  // CRM 2.0 Entities
  opportunities: Opportunity[];
  pipelineStages: PipelineStage[];
  salesActivities: SalesActivity[];
  salesProposals: SalesProposal[];
  salesCommunicationTemplates: SalesCommunicationTemplate[];
  prospectingLists: ProspectingList[];
  salesAutomationRules: SalesAutomationRule[];
  salesSettings: SalesSettings;
  salesPlaybooks: SalesPlaybook[];
  salesObjections: SalesObjection[];
  salesOutboundMessageLogs: SalesOutboundMessageLog[];

  // CRM 2.0 Actions
  updateLead: (lead: Lead) => void;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Opportunity;
  updateOpportunity: (opportunity: Opportunity) => void;
  updateOpportunityStage: (id: string, stageId: string) => void;
  updateOpportunityStatus: (id: string, status: Opportunity['status'], lostReason?: string, lostNotes?: string) => void;
  markOpportunityWon: (id: string) => void;
  markOpportunityLost: (id: string, reason: string, notes?: string) => void;
  addSalesActivity: (activity: Omit<SalesActivity, 'id' | 'createdAt' | 'updatedAt'>) => SalesActivity;
  updateSalesActivity: (activity: SalesActivity) => void;
  updateSalesActivityStatus: (id: string, status: SalesActivity['status'], outcome?: string) => void;
  addSalesProposal: (proposal: Omit<SalesProposal, 'id' | 'createdAt' | 'updatedAt'>) => SalesProposal;
  updateSalesProposal: (proposal: SalesProposal) => void;
  updateSalesProposalStatus: (id: string, status: SalesProposal['status']) => void;
  addPipelineStage: (stage: Omit<PipelineStage, 'id' | 'createdAt' | 'updatedAt'>) => PipelineStage;
  updatePipelineStage: (stage: PipelineStage) => void;
  togglePipelineStageStatus: (id: string) => void;
  addSalesCommunicationTemplate: (template: Omit<SalesCommunicationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => SalesCommunicationTemplate;
  updateSalesCommunicationTemplate: (template: SalesCommunicationTemplate) => void;
  toggleSalesCommunicationTemplateStatus: (id: string) => void;
  addProspectingList: (list: Omit<ProspectingList, 'id' | 'createdAt' | 'updatedAt'>) => ProspectingList;
  updateProspectingList: (list: ProspectingList) => void;
  updateProspectingListStatus: (id: string, status: ProspectingList['status']) => void;
  addSalesAutomationRule: (rule: Omit<SalesAutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => SalesAutomationRule;
  updateSalesAutomationRule: (rule: SalesAutomationRule) => void;
  toggleSalesAutomationRuleStatus: (id: string) => void;
  updateSalesSettings: (settings: SalesSettings) => void;
  addSalesPlaybook: (playbook: Omit<SalesPlaybook, 'id' | 'createdAt' | 'updatedAt'>) => SalesPlaybook;
  updateSalesPlaybook: (playbook: SalesPlaybook) => void;
  addSalesObjection: (objection: Omit<SalesObjection, 'id' | 'createdAt' | 'updatedAt'>) => SalesObjection;
  updateSalesObjectionStatus: (id: string, status: SalesObjection['status'], responseNotes?: string) => void;
  addSalesOutboundMessageLog: (log: Omit<SalesOutboundMessageLog, 'id' | 'createdAt'>) => SalesOutboundMessageLog;

  // Reset Storage
  resetStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [partnerRepayments, setPartnerRepayments] = useState<PartnerRepayment[]>([]);
  const [accountsPayables, setAccountsPayables] = useState<AccountsPayable[]>([]);
  const [financialActions, setFinancialActions] = useState<AcaoFinanceira[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [historyEvents, setHistoryEvents] = useState<ClientHistoryEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>([]);
  const [financialEvents, setFinancialEvents] = useState<FinancialEvent[]>([]);
  const [financialAutomationRules, setFinancialAutomationRules] = useState<FinancialAutomationRule[]>([]);
  const [manualFinancialEntries, setManualFinancialEntries] = useState<ManualFinancialEntry[]>([]);

  // CRM 2.0 States
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [salesActivities, setSalesActivities] = useState<SalesActivity[]>([]);
  const [salesProposals, setSalesProposals] = useState<SalesProposal[]>([]);
  const [salesCommunicationTemplates, setSalesCommunicationTemplates] = useState<SalesCommunicationTemplate[]>([]);
  const [prospectingLists, setProspectingLists] = useState<ProspectingList[]>([]);
  const [salesAutomationRules, setSalesAutomationRules] = useState<SalesAutomationRule[]>([]);
  const [salesSettings, setSalesSettings] = useState<SalesSettings>({
    idealSegments: [],
    excludedSegments: [],
    minimumTicket: 0,
    preferredServices: [],
    targetLocations: [],
    qualificationQuestions: [],
    lostReasons: [],
    defaultOwner: '',
    slaFirstContactHours: 24,
    followUpCadenceDays: 3,
    staleOpportunityDays: 7,
    updatedAt: ''
  });
  const [salesPlaybooks, setSalesPlaybooks] = useState<SalesPlaybook[]>([]);
  const [salesObjections, setSalesObjections] = useState<SalesObjection[]>([]);
  const [salesOutboundMessageLogs, setSalesOutboundMessageLogs] = useState<SalesOutboundMessageLog[]>([]);


  const [carregado, setCarregado] = useState(false);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  // Coleções e valor inicial quando ainda não há nada salvo. Cadastros e movimentos
  // começam vazios; configurações (etapas do funil, catálogo, modelos) vêm do modelo antigo.
  const colecoes = (): Record<string, [(v: any) => void, unknown]> => ({
    fos_leads: [setLeads, []],
    fos_clients: [setClients, []],
    fos_companies: [setCompanies, []],
    fos_contacts: [setContacts, []],
    fos_services: [setServices, mockServices],
    fos_contracts: [setContracts, []],
    fos_tasks: [setTasks, []],
    fos_transactions: [setTransactions, []],
    fos_invoices: [setInvoices, []],
    fos_commissions: [setPartnerRepayments, []],
    fos_payables: [setAccountsPayables, []],
    fos_actions: [setFinancialActions, []],
    fos_documents: [setDocuments, []],
    fos_history_events: [setHistoryEvents, []],
    fos_partners: [setPartners, []],
    fos_financial_accounts: [setFinancialAccounts, mockFinancialAccounts],
    fos_financial_events: [setFinancialEvents, []],
    fos_automation_rules: [setFinancialAutomationRules, mockFinancialAutomationRules],
    fos_manual_entries: [setManualFinancialEntries, []],
    fos_opportunities: [setOpportunities, []],
    fos_pipeline_stages: [setPipelineStages, mockPipelineStages],
    fos_sales_activities: [setSalesActivities, []],
    fos_sales_proposals: [setSalesProposals, []],
    fos_sales_templates: [setSalesCommunicationTemplates, mockSalesCommunicationTemplates],
    fos_prospecting_lists: [setProspectingLists, []],
    fos_sales_automation_rules: [setSalesAutomationRules, mockSalesAutomationRules],
    fos_sales_settings: [setSalesSettings, mockSalesSettings],
    fos_sales_playbooks: [setSalesPlaybooks, mockSalesPlaybooks],
    fos_sales_objections: [setSalesObjections, mockSalesObjections],
    fos_sales_message_logs: [setSalesOutboundMessageLogs, []],
  });

  // Carrega do Supabase e recarrega ao voltar para a aba, para trazer o que entrou por fora
  // (por exemplo, clientes e combinados cadastrados direto no banco pelo assistente).
  useEffect(() => {
    const aplicar = (salvo: Record<string, unknown>) => {
      for (const [chave, [definir, inicial]] of Object.entries(colecoes())) {
        definir(chave in salvo ? salvo[chave] : inicial);
      }
    };
    carregarEstado()
      .then((salvo) => {
        aplicar(salvo);
        setCarregado(true);
      })
      .catch((e) => setErroCarga(e?.message ?? String(e)));

    let ultimo = Date.now();
    const aoVoltar = () => {
      if (document.visibilityState !== 'visible' || temPendencias() || Date.now() - ultimo < 30000) return;
      ultimo = Date.now();
      carregarEstado().then((salvo) => !temPendencias() && aplicar(salvo)).catch(() => {});
    };
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('focus', aoVoltar);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      window.removeEventListener('focus', aoVoltar);
    };
  }, []);

  const save = (key: string, data: any) => {
    salvarColecao(key, data);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: 'l_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    save('fos_leads', updated);
    return newLead;
  };

  const updateLeadStatus = (id: string, status: LeadStatus, notes?: string) => {
    const updated = leads.map(l => l.id === id ? { ...l, status, notes: notes || l.notes } : l);
    setLeads(updated);
    save('fos_leads', updated);
  };


  const promoteLeadToClient = (leadId: string, companyDetails: { corporateName: string; cnpj: string }) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const newClientId = 'c_' + Date.now();
    const newClient: Client = {
      id: newClientId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      corporateName: companyDetails.corporateName,
      cnpj: companyDetails.cnpj,
      status: 'active',
      relationshipType: 'consultoria',
      createdAt: new Date().toISOString().split('T')[0],
      tags: ['Lead Promovido']
    };

    const newCompany: Company = {
      id: 'comp_' + Date.now(),
      clientId: newClientId,
      corporateName: companyDetails.corporateName,
      tradeName: lead.companyName,
      cnpj: companyDetails.cnpj,
      status: 'active'
    };

    const newContact: Contact = {
      id: 'cont_' + Date.now(),
      clientId: newClientId,
      name: lead.name,
      role: 'Principal',
      email: lead.email,
      phone: lead.phone,
      isPrimary: true
    };

    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: 'converted' as LeadStatus, clientId: newClient.id } : l);
    const updatedClients = [newClient, ...clients];
    const updatedCompanies = [newCompany, ...companies];
    const updatedContacts = [newContact, ...contacts];

    setLeads(updatedLeads);
    setClients(updatedClients);
    setCompanies(updatedCompanies);
    setContacts(updatedContacts);

    save('fos_leads', updatedLeads);
    save('fos_clients', updatedClients);
    save('fos_companies', updatedCompanies);
    save('fos_contacts', updatedContacts);
  };

  // CRM 2.0 Actions
  const updateLead = (lead: Lead) => {
    const updated = leads.map(l => l.id === lead.id ? { ...lead, updatedAt: new Date().toISOString().split('T')[0] } : l);
    setLeads(updated);
    save('fos_leads', updated);
  };

  const addOpportunity = (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: 'op_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newOpportunity, ...opportunities];
    setOpportunities(updated);
    save('fos_opportunities', updated);
    return newOpportunity;
  };

  const updateOpportunity = (opportunity: Opportunity) => {
    const updated = opportunities.map(o => o.id === opportunity.id ? { ...opportunity, updatedAt: new Date().toISOString().split('T')[0] } : o);
    setOpportunities(updated);
    save('fos_opportunities', updated);
  };

  const updateOpportunityStage = (id: string, stageId: string) => {
    const updated = opportunities.map(o => o.id === id ? { ...o, stageId, updatedAt: new Date().toISOString().split('T')[0] } : o);
    setOpportunities(updated);
    save('fos_opportunities', updated);
  };

  const updateOpportunityStatus = (id: string, status: Opportunity['status'], lostReason?: string, lostNotes?: string) => {
    const updated = opportunities.map(o => o.id === id ? { ...o, status, lostReason, lostNotes, updatedAt: new Date().toISOString().split('T')[0] } : o);
    setOpportunities(updated);
    save('fos_opportunities', updated);
  };

  const markOpportunityWon = (id: string) => {
    updateOpportunityStatus(id, 'won');
  };

  const markOpportunityLost = (id: string, reason: string, notes?: string) => {
    updateOpportunityStatus(id, 'lost', reason, notes);
  };

  const addSalesActivity = (activityData: Omit<SalesActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newActivity: SalesActivity = {
      ...activityData,
      id: 'sa_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newActivity, ...salesActivities];
    setSalesActivities(updated);
    save('fos_sales_activities', updated);
    return newActivity;
  };

  const updateSalesActivity = (activity: SalesActivity) => {
    const updated = salesActivities.map(a => a.id === activity.id ? { ...activity, updatedAt: new Date().toISOString().split('T')[0] } : a);
    setSalesActivities(updated);
    save('fos_sales_activities', updated);
  };

  const updateSalesActivityStatus = (id: string, status: SalesActivity['status'], outcome?: string) => {
    const now = new Date().toISOString().split('T')[0];
    const updated = salesActivities.map(a => a.id === id ? { ...a, status, outcome, completedAt: status === 'completed' ? now : a.completedAt, updatedAt: now } : a);
    setSalesActivities(updated);
    save('fos_sales_activities', updated);
  };

  const addSalesProposal = (proposalData: Omit<SalesProposal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newProposal: SalesProposal = {
      ...proposalData,
      id: 'pr_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newProposal, ...salesProposals];
    setSalesProposals(updated);
    save('fos_sales_proposals', updated);
    return newProposal;
  };

  const updateSalesProposal = (proposal: SalesProposal) => {
    const updated = salesProposals.map(p => p.id === proposal.id ? { ...proposal, updatedAt: new Date().toISOString().split('T')[0] } : p);
    setSalesProposals(updated);
    save('fos_sales_proposals', updated);
  };

  const updateSalesProposalStatus = (id: string, status: SalesProposal['status']) => {
    const updated = salesProposals.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p);
    setSalesProposals(updated);
    save('fos_sales_proposals', updated);
  };

  const addPipelineStage = (stageData: Omit<PipelineStage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newStage: PipelineStage = {
      ...stageData,
      id: 'st_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [...pipelineStages, newStage];
    setPipelineStages(updated);
    save('fos_pipeline_stages', updated);
    return newStage;
  };

  const updatePipelineStage = (stage: PipelineStage) => {
    const updated = pipelineStages.map(s => s.id === stage.id ? { ...stage, updatedAt: new Date().toISOString().split('T')[0] } : s);
    setPipelineStages(updated);
    save('fos_pipeline_stages', updated);
  };

  const togglePipelineStageStatus = (id: string) => {
    const updated = pipelineStages.map(s => s.id === id ? { ...s, active: !s.active, updatedAt: new Date().toISOString().split('T')[0] } : s);
    setPipelineStages(updated);
    save('fos_pipeline_stages', updated);
  };

  const addSalesCommunicationTemplate = (templateData: Omit<SalesCommunicationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newTemplate: SalesCommunicationTemplate = {
      ...templateData,
      id: 'tmp_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newTemplate, ...salesCommunicationTemplates];
    setSalesCommunicationTemplates(updated);
    save('fos_sales_templates', updated);
    return newTemplate;
  };

  const updateSalesCommunicationTemplate = (template: SalesCommunicationTemplate) => {
    const updated = salesCommunicationTemplates.map(t => t.id === template.id ? { ...template, updatedAt: new Date().toISOString().split('T')[0] } : t);
    setSalesCommunicationTemplates(updated);
    save('fos_sales_templates', updated);
  };

  const toggleSalesCommunicationTemplateStatus = (id: string) => {
    const updated = salesCommunicationTemplates.map(t => t.id === id ? { ...t, active: !t.active, updatedAt: new Date().toISOString().split('T')[0] } : t);
    setSalesCommunicationTemplates(updated);
    save('fos_sales_templates', updated);
  };

  const addProspectingList = (listData: Omit<ProspectingList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newList: ProspectingList = {
      ...listData,
      id: 'pl_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newList, ...prospectingLists];
    setProspectingLists(updated);
    save('fos_prospecting_lists', updated);
    return newList;
  };

  const updateProspectingList = (list: ProspectingList) => {
    const updated = prospectingLists.map(l => l.id === list.id ? { ...list, updatedAt: new Date().toISOString().split('T')[0] } : l);
    setProspectingLists(updated);
    save('fos_prospecting_lists', updated);
  };

  const updateProspectingListStatus = (id: string, status: ProspectingList['status']) => {
    const updated = prospectingLists.map(l => l.id === id ? { ...l, status, updatedAt: new Date().toISOString().split('T')[0] } : l);
    setProspectingLists(updated);
    save('fos_prospecting_lists', updated);
  };

  const addSalesAutomationRule = (ruleData: Omit<SalesAutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newRule: SalesAutomationRule = {
      ...ruleData,
      id: 'ar_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newRule, ...salesAutomationRules];
    setSalesAutomationRules(updated);
    save('fos_sales_automation_rules', updated);
    return newRule;
  };

  const updateSalesAutomationRule = (rule: SalesAutomationRule) => {
    const updated = salesAutomationRules.map(r => r.id === rule.id ? { ...rule, updatedAt: new Date().toISOString().split('T')[0] } : r);
    setSalesAutomationRules(updated);
    save('fos_sales_automation_rules', updated);
  };

  const toggleSalesAutomationRuleStatus = (id: string) => {
    const updated = salesAutomationRules.map(r => r.id === id ? { ...r, active: !r.active, updatedAt: new Date().toISOString().split('T')[0] } : r);
    setSalesAutomationRules(updated);
    save('fos_sales_automation_rules', updated);
  };

  const updateSalesSettings = (settings: SalesSettings) => {
    const updated = { ...settings, updatedAt: new Date().toISOString().split('T')[0] };
    setSalesSettings(updated);
    save('fos_sales_settings', updated);
  };

  const addSalesPlaybook = (playbookData: Omit<SalesPlaybook, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newPlaybook: SalesPlaybook = {
      ...playbookData,
      id: 'pb_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newPlaybook, ...salesPlaybooks];
    setSalesPlaybooks(updated);
    save('fos_sales_playbooks', updated);
    return newPlaybook;
  };

  const updateSalesPlaybook = (playbook: SalesPlaybook) => {
    const updated = salesPlaybooks.map(p => p.id === playbook.id ? { ...playbook, updatedAt: new Date().toISOString().split('T')[0] } : p);
    setSalesPlaybooks(updated);
    save('fos_sales_playbooks', updated);
  };

  const addSalesObjection = (objectionData: Omit<SalesObjection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newObjection: SalesObjection = {
      ...objectionData,
      id: 'ob_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newObjection, ...salesObjections];
    setSalesObjections(updated);
    save('fos_sales_objections', updated);
    return newObjection;
  };

  const updateSalesObjectionStatus = (id: string, status: SalesObjection['status'], responseNotes?: string) => {
    const updated = salesObjections.map(o => o.id === id ? { ...o, status, responseNotes, updatedAt: new Date().toISOString().split('T')[0] } : o);
    setSalesObjections(updated);
    save('fos_sales_objections', updated);
  };

  const addSalesOutboundMessageLog = (logData: Omit<SalesOutboundMessageLog, 'id' | 'createdAt'>) => {
    const newLog: SalesOutboundMessageLog = {
      ...logData,
      id: 'ml_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newLog, ...salesOutboundMessageLogs];
    setSalesOutboundMessageLogs(updated);
    save('fos_sales_message_logs', updated);
    return newLog;
  };

  const addPartner = (partnerData: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPartner: Partner = {
      ...partnerData,
      id: 'pt_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newPartner, ...partners];
    setPartners(updated);
    save('fos_partners', updated);
    return newPartner;
  };

  const updatePartner = (partner: Partner) => {
    const updated = partners.map(p => p.id === partner.id ? { ...partner, updatedAt: new Date().toISOString().split('T')[0] } : p);
    setPartners(updated);
    save('fos_partners', updated);
  };


  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: 'c_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    save('fos_clients', updated);
    return newClient;
  };

  const updateClient = (client: Client) => {
    const updated = clients.map(c => c.id === client.id ? client : c);
    setClients(updated);
    save('fos_clients', updated);
  };

  const addCompany = (companyData: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      ...companyData,
      id: 'comp_' + Date.now()
    };
    const updated = [newCompany, ...companies];
    setCompanies(updated);
    save('fos_companies', updated);
    return newCompany;
  };

  const updateCompany = (company: Company) => {
    const updated = companies.map(c => c.id === company.id ? company : c);
    setCompanies(updated);
    save('fos_companies', updated);
  };

  const addContact = (contactData: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contactData,
      id: 'cont_' + Date.now()
    };
    const updated = [newContact, ...contacts];
    setContacts(updated);
    save('fos_contacts', updated);
    return newContact;
  };

  const updateContact = (contact: Contact) => {
    const updated = contacts.map(c => c.id === contact.id ? contact : c);
    setContacts(updated);
    save('fos_contacts', updated);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    save('fos_contacts', updated);
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: 's_' + Date.now()
    };
    const updated = [newService, ...services];
    setServices(updated);
    save('fos_services', updated);
    return newService;
  };

  const addContract = (contractData: Omit<Contract, 'id'>) => {
    const newContract: Contract = {
      ...contractData,
      id: 'ct_' + Date.now()
    };
    const updated = [newContract, ...contracts];
    setContracts(updated);
    save('fos_contracts', updated);
    return newContract;
  };

  const updateContractStatus = (id: string, status: Contract['status']) => {
    const updated = contracts.map(c => c.id === id ? { ...c, status } : c);
    setContracts(updated);
    save('fos_contracts', updated);
  };

  const updateContract = (contract: Contract) => {
    const updated = contracts.map(c => c.id === contract.id ? contract : c);
    setContracts(updated);
    save('fos_contracts', updated);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    save('fos_tasks', updated);
    return newTask;
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    setTasks(updated);
    save('fos_tasks', updated);
  };

  const updateTask = (task: Task) => {
    const updated = tasks.map(t => t.id === task.id ? task : t);
    setTasks(updated);
    save('fos_tasks', updated);
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: 'tx_' + Date.now()
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    save('fos_transactions', updated);
    return newTransaction;
  };

  const updateTransactionStatus = (id: string, status: TransactionStatus, paymentDate?: string, financialAccountId?: string) => {
    const updated = transactions.map(t => t.id === id ? { ...t, status, paymentDate: paymentDate || t.paymentDate } : t);
    setTransactions(updated);
    save('fos_transactions', updated);
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: 'inv_' + Date.now()
    };
    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    save('fos_invoices', updated);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    setInvoices(updated);
    save('fos_invoices', updated);
  };

  const addPartnerRepayment = (repaymentData: Omit<PartnerRepayment, 'id'>) => {
    const newRepayment: PartnerRepayment = {
      ...repaymentData,
      id: 'pr_' + Date.now()
    };
    const updated = [newRepayment, ...partnerRepayments];
    setPartnerRepayments(updated);
    save('fos_commissions', updated);
    return newRepayment;
  };

  const updatePartnerRepaymentStatus = (id: string, status: PartnerRepayment['status'], paymentDate?: string) => {
    const updated = partnerRepayments.map(r => r.id === id ? { ...r, status, dataPagamento: paymentDate || r.dataPagamento } : r);
    setPartnerRepayments(updated);
    save('fos_commissions', updated);
  };

  const addAccountsPayable = (apData: Omit<AccountsPayable, 'id'>) => {
    const newAp: AccountsPayable = {
      ...apData,
      id: 'ap_' + Date.now()
    };
    const updated = [newAp, ...accountsPayables];
    setAccountsPayables(updated);
    save('fos_payables', updated);
    return newAp;
  };

  const updateAccountsPayableStatus = (id: string, status: AccountsPayable['status'], paymentDate?: string, financialAccountId?: string) => {
    const updated = accountsPayables.map(ap => ap.id === id ? { ...ap, status, dataPagamento: paymentDate || ap.dataPagamento } : ap);
    setAccountsPayables(updated);
    save('fos_payables', updated);
  };

  const addFinancialAction = (faData: Omit<AcaoFinanceira, 'id'>) => {
    const newFa: AcaoFinanceira = {
      ...faData,
      id: 'fa_' + Date.now()
    };
    const updated = [newFa, ...financialActions];
    setFinancialActions(updated);
    save('fos_actions', updated);
    return newFa;
  };

  const updateFinancialActionStatus = (id: string, status: AcaoFinanceira['status']) => {
    const updated = financialActions.map(fa => fa.id === id ? { ...fa, status } : fa);
    setFinancialActions(updated);
    save('fos_actions', updated);
  };

  const addFinancialAccount = (accountData: Omit<FinancialAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newAcc: FinancialAccount = {
      ...accountData,
      id: 'acc_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newAcc, ...financialAccounts];
    setFinancialAccounts(updated);
    save('fos_financial_accounts', updated);
    return newAcc;
  };

  const updateFinancialAccount = (account: FinancialAccount) => {
    const updated = financialAccounts.map(a => a.id === account.id ? { ...account, updatedAt: new Date().toISOString().split('T')[0] } : a);
    setFinancialAccounts(updated);
    save('fos_financial_accounts', updated);
  };

  const toggleFinancialAccountStatus = (id: string) => {
    const updated = financialAccounts.map(a => a.id === id ? { ...a, status: (a.status === 'ativa' ? 'inativa' : 'ativa') as any, updatedAt: new Date().toISOString().split('T')[0] } : a);
    setFinancialAccounts(updated);
    save('fos_financial_accounts', updated);
  };

  const addFinancialEvent = (eventData: Omit<FinancialEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newEvt: FinancialEvent = {
      ...eventData,
      id: 'fe_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newEvt, ...financialEvents];
    setFinancialEvents(updated);
    save('fos_financial_events', updated);
    return newEvt;
  };

  const updateFinancialEvent = (event: FinancialEvent) => {
    const updated = financialEvents.map(e => e.id === event.id ? { ...event, updatedAt: new Date().toISOString().split('T')[0] } : e);
    setFinancialEvents(updated);
    save('fos_financial_events', updated);
  };

  const updateFinancialEventStatus = (id: string, status: FinancialEventStatus) => {
    const updated = financialEvents.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString().split('T')[0] } : e);
    setFinancialEvents(updated);
    save('fos_financial_events', updated);
  };

  const addFinancialAutomationRule = (ruleData: Omit<FinancialAutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newRule: FinancialAutomationRule = {
      ...ruleData,
      id: 'far_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newRule, ...financialAutomationRules];
    setFinancialAutomationRules(updated);
    save('fos_automation_rules', updated);
    return newRule;
  };

  const updateFinancialAutomationRule = (rule: FinancialAutomationRule) => {
    const updated = financialAutomationRules.map(r => r.id === rule.id ? { ...rule, updatedAt: new Date().toISOString().split('T')[0] } : r);
    setFinancialAutomationRules(updated);
    save('fos_automation_rules', updated);
  };

  const toggleFinancialAutomationRuleStatus = (id: string) => {
    const updated = financialAutomationRules.map(r => r.id === id ? { ...r, active: !r.active, updatedAt: new Date().toISOString().split('T')[0] } : r);
    setFinancialAutomationRules(updated);
    save('fos_automation_rules', updated);
  };

  const addManualFinancialEntry = (entryData: Omit<ManualFinancialEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newEntry: ManualFinancialEntry = {
      ...entryData,
      id: 'me_' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [newEntry, ...manualFinancialEntries];
    setManualFinancialEntries(updated);
    save('fos_manual_entries', updated);
    return newEntry;
  };

  const updateManualFinancialEntry = (entry: ManualFinancialEntry) => {
    const updated = manualFinancialEntries.map(e => e.id === entry.id ? { ...entry, updatedAt: new Date().toISOString().split('T')[0] } : e);
    setManualFinancialEntries(updated);
    save('fos_manual_entries', updated);
  };

  const updateManualFinancialEntryStatus = (id: string, status: ManualFinancialEntryStatus) => {
    const updated = manualFinancialEntries.map(e => e.id === id ? { ...e, status, updatedAt: new Date().toISOString().split('T')[0] } : e);
    setManualFinancialEntries(updated);
    save('fos_manual_entries', updated);
  };

  const addDocument = (docData: Omit<ClientDocument, 'id'>) => {
    const newDoc: ClientDocument = {
      ...docData,
      id: 'doc_' + Date.now(),
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    save('fos_documents', updated);
    return newDoc;
  };

  const addHistoryEvent = (evtData: Omit<ClientHistoryEvent, 'id' | 'date'>) => {
    const newEvt: ClientHistoryEvent = {
      ...evtData,
      id: 'he_' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newEvt, ...historyEvents];
    setHistoryEvents(updated);
    save('fos_history_events', updated);
    return newEvt;
  };

  const resetStore = async () => {
    await limparEstado();
    for (const [definir, inicial] of Object.values(colecoes())) definir(inicial);
  };

  if (erroCarga) {
    return <div className="carga-painel">Não consegui carregar os dados do painel: {erroCarga}</div>;
  }
  if (!carregado) {
    return <div className="carga-painel">Carregando o FrancoOS…</div>;
  }

  return (
    <StoreContext.Provider value={{
      leads, clients, companies, contacts, services, contracts, tasks, transactions, invoices, partnerRepayments, accountsPayables, financialActions, documents, historyEvents, partners,
      financialAccounts, financialEvents, financialAutomationRules, manualFinancialEntries,
      opportunities, pipelineStages, salesActivities, salesProposals, salesCommunicationTemplates, prospectingLists, salesAutomationRules, salesSettings, salesPlaybooks, salesObjections, salesOutboundMessageLogs,
      addLead, updateLeadStatus, promoteLeadToClient,
      addClient, updateClient, addCompany, updateCompany, addContact, updateContact, deleteContact,
      addService,
      addContract, updateContractStatus, updateContract,
      addTask, updateTaskStatus, updateTask,
      addTransaction, updateTransactionStatus, addInvoice, updateInvoiceStatus,
      addPartnerRepayment, updatePartnerRepaymentStatus,
      addAccountsPayable, updateAccountsPayableStatus,
      addFinancialAction, updateFinancialActionStatus,
      addFinancialAccount, updateFinancialAccount, toggleFinancialAccountStatus,
      addFinancialEvent, updateFinancialEvent, updateFinancialEventStatus,
      addFinancialAutomationRule, updateFinancialAutomationRule, toggleFinancialAutomationRuleStatus,
      addManualFinancialEntry, updateManualFinancialEntry, updateManualFinancialEntryStatus,
      addDocument, addHistoryEvent,
      addPartner, updatePartner,
      updateLead, addOpportunity, updateOpportunity, updateOpportunityStage, updateOpportunityStatus, markOpportunityWon, markOpportunityLost,
      addSalesActivity, updateSalesActivity, updateSalesActivityStatus,
      addSalesProposal, updateSalesProposal, updateSalesProposalStatus,
      addPipelineStage, updatePipelineStage, togglePipelineStageStatus,
      addSalesCommunicationTemplate, updateSalesCommunicationTemplate, toggleSalesCommunicationTemplateStatus,
      addProspectingList, updateProspectingList, updateProspectingListStatus,
      addSalesAutomationRule, updateSalesAutomationRule, toggleSalesAutomationRuleStatus,
      updateSalesSettings, addSalesPlaybook, updateSalesPlaybook, addSalesObjection, updateSalesObjectionStatus, addSalesOutboundMessageLog,
      resetStore
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
