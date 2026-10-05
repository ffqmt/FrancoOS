/* ============================================================
   CRM & PIPELINE 2.0
   ============================================================ */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
export type LeadTemperature = 'cold' | 'warm' | 'hot';

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  document?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  city?: string;
  state?: string;
  segment?: string;
  companySize?: string;
  monthlyRevenueRange?: string;
  employeesRange?: string;
  source?: string;
  campaign?: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  score: number;
  owner?: string;
  notes: string;
  tags?: string[];
  prospectingListId?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStageType = 'open' | 'won' | 'lost';

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  active: boolean;
  wipLimit?: number;
  stageType: PipelineStageType;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityUrgency = 'low' | 'medium' | 'high' | 'critical';
export type OpportunityStatus = 'open' | 'won' | 'lost' | 'paused';

export interface Opportunity {
  id: string;
  leadId?: string;
  clientId?: string;
  title: string;
  stageId: string;
  position: number;
  value: number;
  probability: number;
  expectedCloseDate?: string;
  source?: string;
  serviceIds?: string[];
  mainServiceId?: string;

  // Diagnóstico comercial embutido (versão simplificada de SalesDiagnosis)
  painPoints?: string;
  decisionMaker?: string;
  budget?: string;
  urgency?: OpportunityUrgency;
  businessContext?: string;
  recommendedServiceIds?: string[];
  authority?: string;
  need?: string;

  status: OpportunityStatus;
  lostReason?: string;
  lostNotes?: string;
  nextActionDate?: string;
  owner?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastInteractionAt?: string;
}

export type SalesActivityType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'diagnosis' | 'follow_up' | 'proposal' | 'negotiation' | 'internal_task';
export type SalesActivityStatus = 'pending' | 'completed' | 'canceled' | 'overdue';

export interface SalesActivity {
  id: string;
  type: SalesActivityType;
  title: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: SalesActivityStatus;
  leadId?: string;
  opportunityId?: string;
  clientId?: string;
  owner?: string;
  outcome?: string;
  nextStep?: string;
  createdAt: string;
  updatedAt: string;
}

export type SalesProposalStatus = 'draft' | 'prepared' | 'sent_placeholder' | 'accepted' | 'rejected' | 'expired';

export interface SalesProposalItem {
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesProposal {
  id: string;
  opportunityId: string;
  leadId?: string;
  clientId?: string;
  title: string;
  status: SalesProposalStatus;
  validUntil?: string;
  items: SalesProposalItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentTerms?: string;
  scopeSummary?: string;
  assumptions?: string;
  nextSteps?: string;
  createdAt: string;
  updatedAt: string;
}

export type SalesTemplateType = 'first_contact' | 'follow_up' | 'post_meeting' | 'proposal_send' | 'reactivation' | 'objection_price' | 'objection_timing' | 'referral_request' | 'upsell' | 'cross_sell';
export type SalesTemplateChannel = 'email' | 'whatsapp' | 'internal' | 'manual';

export interface SalesCommunicationTemplate {
  id: string;
  name: string;
  type: SalesTemplateType;
  channel: SalesTemplateChannel;
  subject?: string;
  body: string;
  active: boolean;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProspectingChannel = 'linkedin' | 'google_maps' | 'instagram' | 'referral' | 'event' | 'manual' | 'other';
export type ProspectingStatus = 'draft' | 'researching' | 'ready' | 'contacting' | 'paused' | 'completed';

export interface ProspectingList {
  id: string;
  name: string;
  targetSegment?: string;
  targetLocation?: string;
  companySize?: string;
  keywords?: string;
  channel: ProspectingChannel;
  serviceFocus?: string;
  desiredLeadCount?: number;
  status: ProspectingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SalesAutomationTriggerType =
  | 'lead_created'
  | 'no_contact_after_hours'
  | 'opportunity_stage_changed'
  | 'proposal_prepared'
  | 'proposal_sent_placeholder'
  | 'no_follow_up_after_days'
  | 'diagnosis_completed'
  | 'opportunity_won'
  | 'opportunity_lost';

export type SalesAutomationChannel = 'internal' | 'email_future' | 'whatsapp_future' | 'task';
export type SalesAutomationActionType = 'create_activity' | 'suggest_message' | 'remind_owner' | 'suggest_service' | 'prepare_contract';

export interface SalesAutomationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: SalesAutomationTriggerType;
  offsetValue?: number;
  channel: SalesAutomationChannel;
  actionType: SalesAutomationActionType;
  templateId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalesSettings {
  idealSegments: string[];
  excludedSegments: string[];
  minimumTicket: number;
  preferredServices: string[];
  targetLocations: string[];
  qualificationQuestions: string[];
  lostReasons: string[];
  defaultOwner: string;
  slaFirstContactHours: number;
  followUpCadenceDays: number;
  staleOpportunityDays: number;
  updatedAt: string;
}

export type RelationshipType = 
  | 'automacao' 
  | 'consultoria' 
  | 'sistema' 
  | 'saas' 
  | 'suporte' 
  | 'contabil' 
  | 'fiscal' 
  | 'folha' 
  | 'parceiro' 
  | 'indicador' 
  | 'prestador';

export interface Client {
  id: string;
  name: string;
  corporateName: string;
  cnpj: string;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
  createdAt: string;
  relationshipType: RelationshipType;
  segmento?: string;
  origem?: string;
  tags?: string[];
}

export interface Company {
  id: string;
  clientId: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  municipio?: string;
  uf?: string;
  status: 'active' | 'inactive';
  observacoes?: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export type BillingCycle = 'mensal' | 'anual' | 'unico';

export type ServiceCategory = 
  | 'automacao' 
  | 'consultoria' 
  | 'produto_digital' 
  | 'suporte' 
  | 'contabilidade' 
  | 'fiscal' 
  | 'folha' 
  | 'patrimonio' 
  | 'integracao' 
  | 'projeto';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  billingCycle: BillingCycle;
}

export type ContractStatus = 'active' | 'suspended' | 'expired' | 'draft';

export interface Contract {
  id: string;
  clientId: string;
  serviceId: string;
  startDate: string;
  endDate?: string;
  monthlyValue: number;
  status: ContractStatus;

  // New configuration properties for Contract 2.0
  title?: string;
  companyId?: string;
  responsible?: string;
  scopeDescription?: string;
  deliverables?: string;
  exclusions?: string;
  sla?: string;
  billingType?: 'avulso' | 'mensal' | 'anual' | 'projeto' | 'hora' | 'pacote_horas' | 'etapa';
  recurrence?: 'unica' | 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'sob_demanda';
  dueDay?: number;
  paymentMethod?: string;
  paymentTerms?: string;
  generatesInvoice?: boolean;
  invoiceTiming?: 'antes_pagamento' | 'apos_pagamento' | 'competencia' | 'manual';
  invoiceDescription?: string;
  partnerRepaymentRule?: {
    hasPartner: boolean;
    partnerId?: string;
    parceiro?: string;
    tipo?: 'indicacao' | 'comissao' | 'parceiro' | 'prestador' | 'repasse';
    regra?: 'percentual' | 'fixo' | 'recorrente' | 'primeira_venda' | 'por_etapa' | 'manual';
    percentual?: number;
    valorFixo?: number;
    condicaoLiberacao?: 'assinatura' | 'recebimento' | 'mensal' | 'entrega' | 'manual';
    observacoes?: string;
    customized?: boolean;
  };
  plannedTasks?: string[];
  expectedDocuments?: string[];
  scheduledFinancialActions?: string[];

  // Partner Relation properties for Contract 2.0 UX
  partnerId?: string;
  partnerRuleOverride?: boolean;
  repaymentType?: 'indicacao' | 'comissao' | 'parceiro' | 'prestador' | 'repasse';
  repaymentRule?: 'percentual' | 'fixo' | 'recorrente' | 'primeira_venda' | 'por_etapa' | 'manual';
  repaymentPercentage?: number;
  repaymentFixedAmount?: number;
  repaymentBase?: 'mensalidade' | 'setup' | 'total' | 'parcela' | 'manual';
  repaymentReleaseCondition?: 'assinatura' | 'recebimento' | 'mensal' | 'entrega' | 'manual';
  repaymentPaymentTerm?: 'imediato' | '5_dias' | '10_dias' | 'proximo_ciclo' | 'manual';
  repaymentNotes?: string;

  // Financial Operacional 2.0 — default financial linkage
  defaultFinancialAccountId?: string;
  financialNotes?: string;
  defaultAutomationRuleId?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  clientId?: string;
  contractId?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'mensalidade' | 'avulso' | 'comissao' | 'repasse' | 'imposto' | 'infra' | 'outros';
export type TransactionStatus = 'pending' | 'paid' | 'overdue';

// Uma baixa = um pagamento/recebimento real (total ou parcial). Desfazer remove a baixa
// e o status volta a ser calculado pelo que sobrou.
export interface Baixa {
  id: string;
  data: string;
  valor: number;
  contaId?: string;
  forma?: string;
  notaId?: string;
  observacao?: string;
  registradaEm: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: TransactionStatus;
  clientId?: string;
  invoiceId?: string;
  repasseId?: string;
  financialAccountId?: string;
  baixas?: Baixa[];
  // 'antes' = emitir a nota antes de receber; 'depois' = emitir ao receber; 'sem_nota' = não emite.
  notaQuando?: 'antes' | 'depois' | 'sem_nota';
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  amount: number;
  issueDate: string;
  status: 'draft' | 'issued' | 'cancelled';
  link?: string;
  transactionId?: string;
}

export interface PartnerRepayment {
  id: string;
  partnerId?: string;
  parceiro: string;
  tipo: 'indicacao' | 'comissao' | 'parceiro' | 'prestador' | 'repasse';
  clienteId: string;
  contratoId: string;
  cobrancaId?: string;
  regra: 'percentual' | 'fixo';
  percentual?: number;
  valor: number;
  condicao: 'venda' | 'recebimento' | 'mensal' | 'manual';
  status: 'previsto' | 'aguardando_recebimento' | 'liberado' | 'pago' | 'cancelado';
  dataPrevista: string;
  dataPagamento?: string;
  observacoes?: string;
}

export interface Partner {
  id: string;
  name: string;
  partnerType: 'indicador' | 'parceiro_comercial' | 'parceiro_entrega' | 'prestador' | 'consultor' | 'afiliado' | 'fornecedor' | 'outro';
  personType: 'PF' | 'PJ';
  document: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  origin?: string;
  contactName?: string;
  email: string;
  phone: string;
  website?: string;
  paymentBeneficiary?: string;
  paymentMethod: 'Pix' | 'transferência' | 'boleto' | 'outro';
  pixKey?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankAccountType?: 'corrente' | 'poupanca';
  beneficiaryDocument?: string;
  defaultRepaymentType?: 'indicacao' | 'comissao' | 'parceiro' | 'prestador' | 'repasse';
  defaultRepaymentRule?: 'percentual' | 'fixo' | 'recorrente' | 'primeira_venda' | 'por_etapa' | 'manual';
  defaultPercentage?: number;
  defaultFixedAmount?: number;
  defaultReleaseCondition?: 'assinatura' | 'recebimento' | 'mensal' | 'entrega' | 'manual';
  defaultPaymentTerm?: 'imediato' | '5_dias' | '10_dias' | 'proximo_ciclo' | 'manual';
  internalOwner?: string;
  tags?: string[];
  riskLevel?: 'baixo' | 'medio' | 'alto';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsPayable {
  id: string;
  favorecido: string;
  tipo: 'comissao' | 'repasse' | 'prestador' | 'fornecedor' | 'ferramenta' | 'imposto' | 'despesa';
  descricao: string;
  clienteId?: string;
  contratoId?: string;
  repasseId?: string;
  valor: number;
  vencimento: string;
  dataPagamento?: string;
  status: 'previsto' | 'aberto' | 'vencido' | 'pago' | 'cancelado';
  categoria: string;
  observacoes?: string;
  financialAccountId?: string;
  baixas?: Baixa[];
}

export interface AcaoFinanceira {
  id: string;
  tipo: 'enviar_lembrete' | 'enviar_cobranca' | 'emitir_nota' | 'enviar_nota' | 'confirmar_recebimento' | 'liberar_comissao' | 'pagar_repasse' | 'enviar_comprovante' | 'follow_up' | 'cobrar_inadimplente';
  dataAgendada: string;
  responsavel: string;
  status: 'agendada' | 'pendente' | 'concluida' | 'cancelada' | 'atrasada';
  clienteId?: string;
  contratoId?: string;
  cobrancaId?: string;
  notaId?: string;
  repasseId?: string;
  canal: 'manual' | 'WhatsApp' | 'e-mail' | 'sistema';
  observacoes?: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: 'Contrato' | 'Proposta' | 'CNPJ/Contrato Social' | 'Certidão' | 'Outros';
  contractId?: string;
  taskId?: string;
  competencia?: string;
  tags?: string[];
  uploadDate: string;
  fileSize?: string;
}

export interface ClientHistoryEvent {
  id: string;
  clientId: string;
  title: string;
  description: string;
  date: string;
  type: 'client_created' | 'opportunity' | 'contract_started' | 'billing' | 'task_completed' | 'invoice_issued' | 'system';
}

/* ============================================================
   FINANCEIRO OPERACIONAL 2.0
   ============================================================ */

export type FinancialAccountType =
  | 'conta_corrente_pj'
  | 'poupanca'
  | 'conta_pagamento'
  | 'caixa_interno'
  | 'carteira_digital'
  | 'gateway_pagamento'
  | 'cartao_credito'
  | 'conta_recebiveis'
  | 'conta_terceiros'
  | 'outro';

export type FinancialAccountStatus = 'ativa' | 'inativa';

export interface FinancialAccount {
  id: string;
  name: string;
  type: FinancialAccountType;
  institution?: string;
  bankCode?: string;
  agency?: string;
  accountNumber?: string;
  accountDigit?: string;
  beneficiary: string;
  beneficiaryDocument?: string;
  pixKey?: string;
  initialBalance: number;
  initialBalanceDate: string;
  color: string;
  status: FinancialAccountStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FinancialEventType =
  | 'cobranca'
  | 'vencimento_receber'
  | 'vencimento_pagar'
  | 'emissao_nota'
  | 'envio_nota'
  | 'envio_boleto'
  | 'lembrete_cobranca'
  | 'lembrete_interno'
  | 'follow_up'
  | 'repasse_parceiro'
  | 'conferencia_pagamento'
  | 'outro';

export type FinancialEventStatus = 'pending' | 'done' | 'canceled' | 'overdue';
export type FinancialEventDirection = 'income' | 'expense' | 'internal';

export interface FinancialEvent {
  id: string;
  title: string;
  type: FinancialEventType;
  date: string;
  time?: string;
  status: FinancialEventStatus;
  direction: FinancialEventDirection;
  amount?: number;
  financialAccountId?: string;
  clientId?: string;
  contractId?: string;
  partnerId?: string;
  invoiceId?: string;
  receivableId?: string;
  payableId?: string;
  repaymentId?: string;
  automationRuleId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AutomationTriggerType =
  | 'dias_antes_vencimento'
  | 'no_vencimento'
  | 'dias_apos_vencimento'
  | 'ao_criar_recebivel'
  | 'ao_receber'
  | 'ao_pagar'
  | 'nota_pendente'
  | 'repasse_liberado'
  | 'contrato_ativo'
  | 'dia_fixo_mensal'
  | 'recorrencia_semanal';

export type AutomationChannel = 'email' | 'whatsapp' | 'interno' | 'manual' | 'nota_fiscal' | 'link_pagamento' | 'tarefa';

export type AutomationActionType =
  | 'lembrete_cobranca_email'
  | 'lembrete_cobranca_whatsapp'
  | 'mensagem_interna'
  | 'emitir_nota'
  | 'enviar_nota'
  | 'enviar_boleto'
  | 'lembrete_repasse'
  | 'confirmar_pagamento'
  | 'alertar_financeiro'
  | 'criar_tarefa'
  | 'outro';

export type AutomationTarget = 'client' | 'internal' | 'partner' | 'contract_owner' | 'custom';
export type AutomationAppliesTo = 'receivables' | 'payables' | 'invoices' | 'repayments' | 'contracts';

export interface FinancialAutomationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: AutomationTriggerType;
  offsetDays?: number;
  recurringDay?: number;
  channel: AutomationChannel;
  actionType: AutomationActionType;
  target: AutomationTarget;
  messageTemplate?: string;
  subjectTemplate?: string;
  active: boolean;
  appliesTo: AutomationAppliesTo[];
  createdAt: string;
  updatedAt: string;
}

/* ============================================================
   FINANCEIRO 2.1 — Lançamentos Manuais & Transferências
   ============================================================ */

export type ManualFinancialEntryType = 'income' | 'expense' | 'transfer' | 'adjustment';
export type ManualFinancialEntryStatus = 'pending' | 'completed' | 'canceled';

export interface ManualFinancialEntry {
  id: string;
  type: ManualFinancialEntryType;
  description: string;
  amount: number;
  date: string;
  status: ManualFinancialEntryStatus;
  financialAccountId: string;
  destinationFinancialAccountId?: string;
  categoryId?: string;
  costCenterId?: string;
  paymentMethod?: string;
  clientId?: string;
  partnerId?: string;
  contractId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================================
   CRM & PIPELINE 2.0 EXTRA TYPES
   ============================================================ */

export interface SalesPlaybook {
  id: string;
  name: string;
  type: 'first_contact' | 'follow_up' | 'post_meeting' | 'proposal_follow_up' | 'reactivation' | 'upsell' | 'cross_sell' | 'referral_request' | 'objection_handling';
  description: string;
  recommendedChannel: 'whatsapp' | 'email' | 'call' | 'meeting' | 'internal';
  templateId?: string;
  checklist: string[];
  suggestedQuestions: string[];
  suggestedNextStep: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalesObjection {
  id: string;
  opportunityId: string;
  type: 'Preço' | 'Prazo' | 'Já tem fornecedor' | 'Sem orçamento' | 'Não é prioridade' | 'Precisa falar com sócio' | 'Não entendeu valor' | 'Quer pensar' | 'Timing ruim' | 'Falta confiança' | 'Escopo não ficou claro' | 'Outro';
  description: string;
  status: 'open' | 'handled' | 'lost_due_to_objection';
  responseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOutboundMessageLog {
  id: string;
  channel: 'email' | 'whatsapp' | 'internal' | 'manual';
  status: 'draft' | 'simulated' | 'copied' | 'canceled';
  recipientName: string;
  recipientContact: string;
  subject?: string;
  body: string;
  templateId?: string;
  playbookId?: string;
  leadId?: string;
  opportunityId?: string;
  clientId?: string;
  createdAt: string;
  simulatedAt?: string;
}


