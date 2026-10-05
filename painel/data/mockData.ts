import type { Lead, Client, Company, Contact, Service, Contract, Task, Transaction, Invoice, PartnerRepayment, AccountsPayable, AcaoFinanceira, ClientDocument, ClientHistoryEvent, Partner, FinancialAccount, FinancialEvent, FinancialAutomationRule, ManualFinancialEntry, PipelineStage, Opportunity, SalesActivity, SalesProposal, SalesCommunicationTemplate, ProspectingList, SalesAutomationRule, SalesSettings, SalesPlaybook, SalesObjection, SalesOutboundMessageLog } from '../types';

export const mockServices: Service[] = [
  {
    id: 's1',
    name: 'Assessoria Contábil Completa',
    category: 'contabilidade',
    description: 'Escrituração contábil e acompanhamento gerencial periódico para empresas de médio porte.',
    price: 1200,
    billingCycle: 'mensal'
  },
  {
    id: 's2',
    name: 'BPO Financeiro Estruturado',
    category: 'consultoria',
    description: 'Gestão de contas a pagar/receber, conciliação diária e relatórios de fluxo de caixa.',
    price: 1800,
    billingCycle: 'mensal'
  },
  {
    id: 's3',
    name: 'Revisão e Planejamento Fiscal',
    category: 'fiscal',
    description: 'Estudo de regimes tributários para otimização legal da carga de impostos.',
    price: 3500,
    billingCycle: 'unico'
  },
  {
    id: 's4',
    name: 'Automação de Processos Contábeis (IA)',
    category: 'automacao',
    description: 'Implementação de robôs (RPAs) e agentes para leitura de notas fiscais e relatórios.',
    price: 4500,
    billingCycle: 'unico'
  },
  {
    id: 's5',
    name: 'Gestão de Folha e DP',
    category: 'folha',
    description: 'Admissão, demissão, processamento mensal de folha e envio do eSocial.',
    price: 600,
    billingCycle: 'mensal'
  },
  {
    id: 's_autax',
    name: 'AUTAX',
    category: 'produto_digital',
    description: 'Software da Franco Tecnologia para automatizar rotinas fiscais e contábeis (autax.app.br). Preço por plano.',
    price: 0,
    billingCycle: 'mensal'
  },
  {
    id: 's_contai',
    name: 'Contai',
    category: 'produto_digital',
    description: 'Software da Franco Tecnologia para escritórios contábeis (contai.app.br). Preço por plano.',
    price: 0,
    billingCycle: 'mensal'
  },
  {
    id: 's_consultoria',
    name: 'Consultoria em Tecnologia para Contabilidade',
    category: 'consultoria',
    description: 'Diagnóstico, implantação de sistemas e processos digitais para escritórios e empresas.',
    price: 0,
    billingCycle: 'unico'
  },
  {
    id: 's_automacao',
    name: 'Automações sob Medida',
    category: 'automacao',
    description: 'Robôs e integrações para eliminar trabalho manual (planilhas, portais, notas, WhatsApp).',
    price: 0,
    billingCycle: 'unico'
  }
];


export const mockLeads: Lead[] = [
  {
    id: 'l1',
    name: 'Roberto Silva',
    companyName: 'Silva Logística Ltda',
    email: 'roberto@silvalog.com.br',
    phone: '(11) 98765-4321',
    status: 'contacted',
    temperature: 'hot',
    score: 85,
    notes: 'Interessado em migrar de contabilidade antiga e implementar BPO Financeiro.',
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15'
  },
  {
    id: 'l2',
    name: 'Amanda Costa',
    companyName: 'TechVibe SaaS',
    email: 'amanda@techvibe.co',
    phone: '(21) 99888-7766',
    status: 'contacted',
    temperature: 'warm',
    score: 72,
    notes: 'Proposta enviada para Assessoria Contábil Completa e Automação de Processos.',
    createdAt: '2026-06-20',
    updatedAt: '2026-06-20'
  },
  {
    id: 'l3',
    name: 'Carlos Oliveira',
    companyName: 'Oliveira Advocacia',
    email: 'carlos@oliveira.adv.br',
    phone: '(31) 97111-2233',
    status: 'new',
    temperature: 'cold',
    score: 45,
    notes: 'Entrou via formulário de contato pedindo orçamento de folha de pagamento.',
    createdAt: '2026-07-02',
    updatedAt: '2026-07-02'
  },
  {
    id: 'l4',
    name: 'Juliana Pires',
    companyName: 'Pires Holding S/A',
    email: 'juliana@piresholding.com.br',
    phone: '(11) 98123-4567',
    status: 'converted',
    temperature: 'hot',
    score: 95,
    clientId: 'c1',
    notes: 'Lead convertido. Agora é cliente oficial.',
    createdAt: '2026-05-10',
    updatedAt: '2026-05-10'
  }
];

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Pires Holding S/A',
    corporateName: 'Pires Administradora de Bens Ltda',
    cnpj: '12.345.678/0001-99',
    status: 'active',
    email: 'contato@piresholding.com.br',
    phone: '(11) 3344-5566',
    createdAt: '2026-05-18',
    relationshipType: 'contabil',
    segmento: 'Holding / Agro',
    origem: 'Indicação',
    tags: ['VIP', 'Multiemprezas']
  },
  {
    id: 'c2',
    name: 'Stellar Tech Soluções',
    corporateName: 'Stellar Tech Importações e Exportações S.A.',
    cnpj: '98.765.432/0001-10',
    status: 'active',
    email: 'financeiro@stellartech.com',
    phone: '(11) 4004-9988',
    createdAt: '2026-04-01',
    relationshipType: 'automacao',
    segmento: 'Tecnologia / SaaS',
    origem: 'Outbound',
    tags: ['Parceiro Comercial', 'IA']
  },
  {
    id: 'c3',
    name: 'Clínica Sorriso Feliz',
    corporateName: 'Sorriso Feliz Odontologia EIRELI',
    cnpj: '45.678.901/0001-22',
    status: 'active',
    email: 'dra.patricia@sorrisofeliz.com.br',
    phone: '(19) 99112-2334',
    createdAt: '2026-02-15',
    relationshipType: 'folha',
    segmento: 'Saúde / Odonto',
    origem: 'Google Ads',
    tags: ['Folha Completa']
  }
];

export const mockCompanies: Company[] = [
  {
    id: 'comp1',
    clientId: 'c1',
    corporateName: 'Pires Administradora de Bens Ltda',
    tradeName: 'Pires Holding',
    cnpj: '12.345.678/0001-99',
    municipio: 'São Paulo',
    uf: 'SP',
    status: 'active',
    observacoes: 'Escritório Administrativo / Sede'
  },
  {
    id: 'comp2',
    clientId: 'c1',
    corporateName: 'Pires Agropecuária S/A',
    tradeName: 'Pires Agro',
    cnpj: '12.345.678/0002-77',
    municipio: 'Ribeirão Preto',
    uf: 'SP',
    status: 'active',
    observacoes: 'Operação de campo / Fazenda'
  },
  {
    id: 'comp3',
    clientId: 'c2',
    corporateName: 'Stellar Tech Importações e Exportações S.A.',
    tradeName: 'Stellar Tech',
    cnpj: '98.765.432/0001-10',
    municipio: 'Campinas',
    uf: 'SP',
    status: 'active',
    observacoes: 'Matriz operacional'
  },
  {
    id: 'comp4',
    clientId: 'c3',
    corporateName: 'Sorriso Feliz Odontologia EIRELI',
    tradeName: 'Clínica Sorriso Feliz',
    cnpj: '45.678.901/0001-22',
    municipio: 'Piracicaba',
    uf: 'SP',
    status: 'active',
    observacoes: 'Sede Clínica'
  }
];

export const mockContacts: Contact[] = [
  {
    id: 'con1',
    clientId: 'c1',
    name: 'Juliana Pires',
    role: 'Diretora Executiva',
    email: 'juliana@piresholding.com.br',
    phone: '(11) 98123-4567',
    isPrimary: true
  },
  {
    id: 'con2',
    clientId: 'c1',
    name: 'Marcos Souza',
    role: 'Gerente Financeiro',
    email: 'marcos@piresholding.com.br',
    phone: '(11) 97766-5544',
    isPrimary: false
  },
  {
    id: 'con3',
    clientId: 'c2',
    name: 'Felipe Dias',
    role: 'CEO',
    email: 'felipe@stellartech.com',
    phone: '(11) 99999-8888',
    isPrimary: true
  },
  {
    id: 'con4',
    clientId: 'c3',
    name: 'Dra. Patrícia Melo',
    role: 'Sócia Fundadora',
    email: 'patricia.melo@sorrisofeliz.com.br',
    phone: '(19) 99112-2334',
    isPrimary: true
  }
];

export const mockPartners: Partner[] = [
  {
    id: 'pt_fernanda',
    name: 'Fernanda Lima (Fernanda Parceira)',
    partnerType: 'parceiro_comercial',
    personType: 'PJ',
    document: '12.345.678/0001-90',
    status: 'ativo',
    origin: 'Indicação Direta',
    contactName: 'Fernanda Lima',
    email: 'fernanda@parceiras.com.br',
    phone: '(11) 98888-7777',
    website: 'www.fernandaparcerias.com.br',
    paymentBeneficiary: 'Fernanda Lima Parcerias LTDA',
    paymentMethod: 'Pix',
    pixKey: '12.345.678/0001-90',
    bankName: 'Banco Itaú',
    bankAgency: '0001',
    bankAccount: '12345-6',
    bankAccountType: 'corrente',
    beneficiaryDocument: '12.345.678/0001-90',
    defaultRepaymentType: 'comissao',
    defaultRepaymentRule: 'percentual',
    defaultPercentage: 15,
    defaultReleaseCondition: 'recebimento',
    defaultPaymentTerm: '10_dias',
    internalOwner: 'Thiago Fiscal',
    tags: ['VIP', 'Comercial'],
    riskLevel: 'baixo',
    notes: 'Parceira de longa data com foco em holdings.',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10'
  },
  {
    id: 'pt_pedro',
    name: 'Pedro Santos (Pedro Integrador)',
    partnerType: 'prestador',
    personType: 'PF',
    document: '123.456.789-00',
    status: 'ativo',
    origin: 'LinkedIn',
    contactName: 'Pedro Santos',
    email: 'pedro.dev@integradores.com',
    phone: '(21) 97777-6666',
    paymentBeneficiary: 'Pedro Santos',
    paymentMethod: 'Pix',
    pixKey: 'pedro.dev@integradores.com',
    bankName: 'Banco Nubank',
    bankAgency: '0001',
    bankAccount: '987654-3',
    bankAccountType: 'corrente',
    beneficiaryDocument: '123.456.789-00',
    defaultRepaymentType: 'repasse',
    defaultRepaymentRule: 'fixo',
    defaultFixedAmount: 300,
    defaultReleaseCondition: 'recebimento',
    defaultPaymentTerm: '5_dias',
    internalOwner: 'Bruno Dev',
    tags: ['Dev', 'Integrações'],
    riskLevel: 'baixo',
    notes: 'Consultor externo de automação e APIs.',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15'
  },
  {
    id: 'pt_carlos',
    name: 'Carlos Mendes (Carlos Indicador)',
    partnerType: 'indicador',
    personType: 'PF',
    document: '987.654.321-11',
    status: 'ativo',
    origin: 'Network do CEO',
    contactName: 'Carlos Mendes',
    email: 'carlos@indicadoresmendes.com.br',
    phone: '(31) 96666-5555',
    paymentBeneficiary: 'Carlos Mendes',
    paymentMethod: 'Pix',
    pixKey: '31966665555',
    bankName: 'Banco Bradesco',
    bankAgency: '1234',
    bankAccount: '112233-4',
    bankAccountType: 'corrente',
    beneficiaryDocument: '987.654.321-11',
    defaultRepaymentType: 'indicacao',
    defaultRepaymentRule: 'percentual',
    defaultPercentage: 10,
    defaultReleaseCondition: 'recebimento',
    defaultPaymentTerm: 'proximo_ciclo',
    internalOwner: 'Thiago Fiscal',
    tags: ['Indicador', 'Networking'],
    riskLevel: 'baixo',
    notes: 'Indicador estratégico na área médica.',
    createdAt: '2026-02-20',
    updatedAt: '2026-02-20'
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'cont1',
    clientId: 'c1',
    serviceId: 's1',
    startDate: '2026-05-18',
    monthlyValue: 1500,
    status: 'active',
    title: 'Assessoria Contábil Mensal Pires',
    responsible: 'Thiago Fiscal',
    billingType: 'mensal',
    recurrence: 'mensal',
    dueDay: 10,
    paymentMethod: 'Boleto Bancário',
    generatesInvoice: true,
    invoiceTiming: 'antes_pagamento',
    scopeDescription: 'Assessoria contábil societária consolidada para holding e coligadas.',
    deliverables: 'Balanço trimestral, conciliações, envio de obrigações',
    exclusions: 'Auditoria externa, perícia judicial',
    sla: '48 horas úteis',
    partnerId: 'pt_fernanda',
    partnerRuleOverride: false,
    repaymentType: 'comissao',
    repaymentRule: 'percentual',
    repaymentPercentage: 15,
    repaymentReleaseCondition: 'recebimento',
    repaymentPaymentTerm: '10_dias',
    repaymentNotes: 'Parceria Pires Holding',
    partnerRepaymentRule: {
      hasPartner: true,
      parceiro: 'Fernanda Parceira',
      tipo: 'comissao',
      regra: 'percentual',
      percentual: 15,
      condicaoLiberacao: 'mensal',
      observacoes: 'Parceria Pires Holding'
    }
  },
  {
    id: 'cont2',
    clientId: 'c2',
    serviceId: 's1',
    startDate: '2026-04-01',
    monthlyValue: 2000,
    status: 'active',
    title: 'BPO Contábil Integrado Stellar',
    responsible: 'Rodolfo DP',
    billingType: 'mensal',
    recurrence: 'mensal',
    dueDay: 10,
    paymentMethod: 'Pix Faturamento',
    generatesInvoice: true,
    invoiceTiming: 'competencia',
    scopeDescription: 'Serviços de BPO fiscal e contabilidade integrados via API.',
    deliverables: 'Fechamento fiscal completo, folha de pagamento, balancetes',
    exclusions: 'Recursos humanos estratégico',
    sla: '24 horas úteis',
    partnerRepaymentRule: {
      hasPartner: false
    }
  },
  {
    id: 'cont3',
    clientId: 'c2',
    serviceId: 's2',
    startDate: '2026-04-15',
    monthlyValue: 1800,
    status: 'active',
    title: 'Automação de Conciliação B2B',
    responsible: 'Bruno Dev',
    billingType: 'projeto',
    recurrence: 'unica',
    dueDay: 15,
    paymentMethod: 'Transferência Bancária',
    generatesInvoice: true,
    invoiceTiming: 'apos_pagamento',
    scopeDescription: 'Construção de robô para leitura e importação automática de extratos Stellar.',
    deliverables: 'Script RPA implantado, manuais, 30 dias de garantia',
    exclusions: 'Licenças de servidores cloud',
    sla: '72 horas úteis',
    partnerId: 'pt_pedro',
    partnerRuleOverride: false,
    repaymentType: 'repasse',
    repaymentRule: 'fixo',
    repaymentFixedAmount: 300,
    repaymentReleaseCondition: 'recebimento',
    repaymentPaymentTerm: '5_dias',
    repaymentNotes: 'Integração de APIs Stellar Tech',
    partnerRepaymentRule: {
      hasPartner: true,
      parceiro: 'Pedro Integrador',
      tipo: 'repasse',
      regra: 'fixo',
      valorFixo: 300,
      condicaoLiberacao: 'recebimento',
      observacoes: 'Integração de APIs Stellar Tech'
    }
  },
  {
    id: 'cont4',
    clientId: 'c3',
    serviceId: 's1',
    startDate: '2026-02-15',
    monthlyValue: 1000,
    status: 'active',
    title: 'Contabilidade & DP Sorriso Feliz',
    responsible: 'Thiago Fiscal',
    billingType: 'mensal',
    recurrence: 'mensal',
    dueDay: 5,
    paymentMethod: 'Boleto Bancário',
    generatesInvoice: true,
    invoiceTiming: 'antes_pagamento',
    scopeDescription: 'Assessoria contábil completa para clínica odontológica Sorriso Feliz.',
    deliverables: 'Folha de pagamento dentistas, cálculo tributário, guias de DAS',
    exclusions: 'Assessoria jurídica tributária contenciosa',
    sla: '48 horas úteis',
    partnerId: 'pt_carlos',
    partnerRuleOverride: false,
    repaymentType: 'indicacao',
    repaymentRule: 'percentual',
    repaymentPercentage: 10,
    repaymentReleaseCondition: 'recebimento',
    repaymentPaymentTerm: 'proximo_ciclo',
    repaymentNotes: 'Indicação da Clínica Sorriso Feliz',
    partnerRepaymentRule: {
      hasPartner: true,
      parceiro: 'Carlos Indicador',
      tipo: 'indicacao',
      regra: 'percentual',
      percentual: 10,
      condicaoLiberacao: 'recebimento',
      observacoes: 'Indicação da Clínica Sorriso Feliz'
    }
  },
  {
    id: 'cont5',
    clientId: 'c3',
    serviceId: 's5',
    startDate: '2026-02-15',
    monthlyValue: 500,
    status: 'active',
    title: 'Consultoria Financeira Sorriso Feliz',
    responsible: 'Larissa Financeiro',
    billingType: 'etapa',
    recurrence: 'trimestral',
    dueDay: 20,
    paymentMethod: 'Pix',
    generatesInvoice: true,
    invoiceTiming: 'manual',
    scopeDescription: 'Revisão periódica de fluxo de caixa e orçamento da clínica.',
    deliverables: 'Painel de bordo orçamentário, relatórios de desvios trimestrais',
    exclusions: 'Lançamentos financeiros de contas a pagar/receber',
    sla: '48 horas úteis',
    partnerRepaymentRule: {
      hasPartner: false
    }
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Apuração do Simples Nacional - Sorriso Feliz',
    description: 'Calcular o DAS e emitir a guia mensal referente ao faturamento de Junho.',
    dueDate: '2026-07-20',
    priority: 'high',
    status: 'todo',
    assignee: 'Thiago Fiscal',
    clientId: 'c3',
    contractId: 'cont4',
    createdAt: '2026-07-01'
  },
  {
    id: 't2',
    title: 'Conciliação Bancária Semanal - Stellar Tech',
    description: 'Conciliar extrato do banco Itaú com o BPO Financeiro referente à semana anterior.',
    dueDate: '2026-07-10',
    priority: 'medium',
    status: 'doing',
    assignee: 'Larissa Financeiro',
    clientId: 'c2',
    contractId: 'cont3',
    createdAt: '2026-07-05'
  },
  {
    id: 't3',
    title: 'Declaração DEFIS complementar - Pires Holding',
    description: 'Verificar divergência na declaração anual de 2025.',
    dueDate: '2026-07-15',
    priority: 'high',
    status: 'review',
    assignee: 'Fernanda Contábil',
    clientId: 'c1',
    contractId: 'cont1',
    createdAt: '2026-06-28'
  },
  {
    id: 't4',
    title: 'Processamento de Folha de Pgto - Sorriso Feliz',
    description: 'Fechar folha dos 5 dentistas associados e gerar contracheques.',
    dueDate: '2026-07-05',
    priority: 'urgent',
    status: 'done',
    assignee: 'Rodolfo DP',
    clientId: 'c3',
    contractId: 'cont5',
    createdAt: '2026-06-25'
  },
  {
    id: 't5',
    title: 'Revisão Cadastral da Stellar Tech',
    description: 'Atualizar CNAE secundário na junta comercial.',
    dueDate: '2026-07-25',
    priority: 'low',
    status: 'todo',
    assignee: 'Thiago Fiscal',
    clientId: 'c2',
    createdAt: '2026-07-07'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tr1',
    type: 'income',
    category: 'mensalidade',
    description: 'Assessoria Contábil - Stellar Tech (Ref Junho)',
    amount: 2000,
    dueDate: '2026-07-10',
    status: 'pending',
    clientId: 'c2'
  },
  {
    id: 'tr2',
    type: 'income',
    category: 'mensalidade',
    description: 'BPO Financeiro - Stellar Tech (Ref Junho)',
    amount: 1800,
    dueDate: '2026-07-10',
    status: 'pending',
    clientId: 'c2'
  },
  {
    id: 'tr3',
    type: 'income',
    category: 'mensalidade',
    description: 'Assessoria Contábil - Pires Holding (Ref Junho)',
    amount: 1500,
    dueDate: '2026-07-15',
    status: 'pending',
    clientId: 'c1'
  },
  {
    id: 'tr4',
    type: 'income',
    category: 'mensalidade',
    description: 'Assessoria Contábil - Sorriso Feliz (Ref Junho)',
    amount: 1000,
    dueDate: '2026-07-05',
    paymentDate: '2026-07-04',
    status: 'paid',
    clientId: 'c3'
  },
  {
    id: 'tr5',
    type: 'income',
    category: 'mensalidade',
    description: 'Folha e DP - Sorriso Feliz (Ref Junho)',
    amount: 500,
    dueDate: '2026-07-05',
    paymentDate: '2026-07-04',
    status: 'paid',
    clientId: 'c3'
  },
  {
    id: 'tr6',
    type: 'expense',
    category: 'infra',
    description: 'Mensalidade Hospedagem AWS e Cloudflare',
    amount: 450,
    dueDate: '2026-07-15',
    status: 'pending'
  },
  {
    id: 'tr7',
    type: 'expense',
    category: 'comissao',
    description: 'Repasse Parceria Comercial - Canal de Vendas Sorriso Feliz',
    amount: 150,
    dueDate: '2026-07-20',
    status: 'pending',
    repasseId: 'rep1'
  },
  {
    id: 'tr8',
    type: 'expense',
    category: 'imposto',
    description: 'Simples Nacional Franco Tecnologia (Faturamento Junho)',
    amount: 820.50,
    dueDate: '2026-07-20',
    status: 'pending'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    number: '20260001',
    clientId: 'c3',
    amount: 1500,
    issueDate: '2026-07-04',
    status: 'issued'
  },
  {
    id: 'inv2',
    number: '20260002',
    clientId: 'c2',
    amount: 3800,
    issueDate: '2026-07-07',
    status: 'draft'
  }
];

export const mockPartnerRepayments: PartnerRepayment[] = [
  {
    id: 'rep1',
    partnerId: 'pt_carlos',
    parceiro: 'Carlos Indicador',
    tipo: 'indicacao',
    clienteId: 'c3',
    contratoId: 'cont4',
    cobrancaId: 'tr4',
    regra: 'percentual',
    percentual: 10,
    valor: 150,
    condicao: 'recebimento',
    status: 'liberado',
    dataPrevista: '2026-07-04',
    observacoes: 'Indicação da Clínica Sorriso Feliz'
  },
  {
    id: 'rep2',
    partnerId: 'pt_pedro',
    parceiro: 'Pedro Integrador',
    tipo: 'repasse',
    clienteId: 'c2',
    contratoId: 'cont3',
    cobrancaId: 'tr2',
    regra: 'fixo',
    valor: 300,
    condicao: 'recebimento',
    status: 'aguardando_recebimento',
    dataPrevista: '2026-07-10',
    observacoes: 'Integração de APIs Stellar Tech'
  },
  {
    id: 'rep3',
    partnerId: 'pt_fernanda',
    parceiro: 'Fernanda Parceira',
    tipo: 'comissao',
    clienteId: 'c1',
    contratoId: 'cont1',
    regra: 'percentual',
    percentual: 15,
    valor: 225,
    condicao: 'mensal',
    status: 'previsto',
    dataPrevista: '2026-07-15',
    observacoes: 'Parceria Pires Holding'
  }
];

export const mockAccountsPayable: AccountsPayable[] = [
  {
    id: 'ap1',
    favorecido: 'Carlos Indicador',
    tipo: 'comissao',
    descricao: 'Comissão s/ recebimento Sorriso Feliz',
    clienteId: 'c3',
    contratoId: 'cont4',
    repasseId: 'rep1',
    valor: 150.00,
    vencimento: '2026-07-20',
    status: 'aberto',
    categoria: 'comissao',
    observacoes: 'Aprovado para pagamento no lote mensal'
  },
  {
    id: 'ap2',
    favorecido: 'HostGator Brasil',
    tipo: 'ferramenta',
    descricao: 'Hospedagem Servidores Cloud Franco OS',
    valor: 89.90,
    vencimento: '2026-07-15',
    status: 'previsto',
    categoria: 'infra',
    observacoes: 'Renovação automática'
  },
  {
    id: 'ap3',
    favorecido: 'Google Workspace APIs',
    tipo: 'ferramenta',
    descricao: 'Contas de E-mail Corporativo e Drive',
    valor: 120.00,
    vencimento: '2026-07-05',
    dataPagamento: '2026-07-05',
    status: 'pago',
    categoria: 'infra',
    observacoes: 'Pago em cartão de crédito corporativo'
  },
  {
    id: 'ap4',
    favorecido: 'Alex Prestador Contábil',
    tipo: 'prestador',
    descricao: 'Serviço de fechamento fiscal terceirizado',
    valor: 1200.00,
    vencimento: '2026-07-10',
    status: 'aberto',
    categoria: 'prestador',
    observacoes: 'Ref. competência Junho/2026'
  }
];

export const mockFinancialActions: AcaoFinanceira[] = [
  {
    id: 'fa1',
    tipo: 'enviar_lembrete',
    dataAgendada: '2026-07-08',
    responsavel: 'Larissa Financeiro',
    status: 'agendada',
    clienteId: 'c2',
    contratoId: 'cont3',
    cobrancaId: 'tr2',
    canal: 'WhatsApp',
    observacoes: 'Lembrete de vencimento da mensalidade BPO Stellar Tech'
  },
  {
    id: 'fa2',
    tipo: 'emitir_nota',
    dataAgendada: '2026-07-04',
    responsavel: 'Thiago Fiscal',
    status: 'concluida',
    clienteId: 'c3',
    contratoId: 'cont4',
    notaId: 'inv1',
    canal: 'sistema',
    observacoes: 'NFS-e Sorriso Feliz emitida após conciliação de pagamento'
  },
  {
    id: 'fa3',
    tipo: 'enviar_cobranca',
    dataAgendada: '2026-07-10',
    responsavel: 'Larissa Financeiro',
    status: 'agendada',
    clienteId: 'c1',
    contratoId: 'cont1',
    cobrancaId: 'tr3',
    canal: 'e-mail',
    observacoes: 'Envio automático da cobrança com link de pagamento'
  },
  {
    id: 'fa4',
    tipo: 'cobrar_inadimplente',
    dataAgendada: '2026-07-06',
    responsavel: 'Larissa Financeiro',
    status: 'atrasada',
    clienteId: 'c3',
    canal: 'manual',
    observacoes: 'Cobrança manual via telefone por pendência de guia'
  }
];

export const mockDocuments: ClientDocument[] = [
  {
    id: 'doc1',
    clientId: 'c1',
    name: 'Contrato Social Consolidado - Pires Holding.pdf',
    type: 'CNPJ/Contrato Social',
    uploadDate: '2026-05-18',
    fileSize: '2.4 MB',
    tags: ['Societário', 'Constituição']
  },
  {
    id: 'doc2',
    clientId: 'c1',
    name: 'Contrato de Assessoria Contábil.pdf',
    type: 'Contrato',
    contractId: 'cont1',
    uploadDate: '2026-05-19',
    fileSize: '1.2 MB',
    tags: ['Jurídico', 'Assinado']
  },
  {
    id: 'doc3',
    clientId: 'c2',
    name: 'Proposta Automação de Processos Contábeis.pdf',
    type: 'Proposta',
    uploadDate: '2026-03-25',
    fileSize: '850 KB',
    tags: ['Comercial']
  },
  {
    id: 'doc4',
    clientId: 'c2',
    name: 'Contrato de Implementação e RPA.pdf',
    type: 'Contrato',
    contractId: 'cont3',
    uploadDate: '2026-04-01',
    fileSize: '1.5 MB',
    tags: ['Jurídico', 'Assinado']
  },
  {
    id: 'doc5',
    clientId: 'c3',
    name: 'Certificado Digital E-CNPJ A1.pfx',
    type: 'Certidão',
    uploadDate: '2026-02-15',
    fileSize: '12 KB',
    tags: ['Fiscal', 'Certificado']
  }
];

export const mockHistoryEvents: ClientHistoryEvent[] = [
  {
    id: 'he1',
    clientId: 'c1',
    title: 'Cliente Cadastrado no Sistema',
    description: 'Cadastro realizado manualmente pelo administrador.',
    date: '2026-05-18',
    type: 'client_created'
  },
  {
    id: 'he2',
    clientId: 'c1',
    title: 'Contrato Assinado e Iniciado',
    description: 'Contrato de Assessoria Contábil Completa ativado com valor de R$ 1.500,00/mês.',
    date: '2026-05-18',
    type: 'contract_started'
  },
  {
    id: 'he3',
    clientId: 'c2',
    title: 'Proposta Comercial Apresentada',
    description: 'Apresentação técnica da automação de processos via IA.',
    date: '2026-03-28',
    type: 'opportunity'
  },
  {
    id: 'he4',
    clientId: 'c2',
    title: 'Contratos Ativados',
    description: 'Início dos serviços de Automação e BPO Financeiro.',
    date: '2026-04-01',
    type: 'contract_started'
  },
  {
    id: 'he5',
    clientId: 'c3',
    title: 'Tarefa Concluída',
    description: 'Processamento de Folha de Pgto do cliente Sorriso Feliz marcado como concluído por Rodolfo DP.',
    date: '2026-07-05',
    type: 'task_completed'
  },
  {
    id: 'he6',
    clientId: 'c3',
    title: 'Nota Fiscal Emitida',
    description: 'NF-e nº 20260001 emitida pela Franco Tecnologia no valor de R$ 1.500,00.',
    date: '2026-07-04',
    type: 'invoice_issued'
  }
];

export const mockPipelineStages: PipelineStage[] = [
  { id: 'st_entrada', name: 'Entrada', order: 1, probability: 10, color: '#64748b', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_qualificacao', name: 'Qualificação', order: 2, probability: 20, color: '#3b82f6', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_reuniao', name: 'Reunião Agendada', order: 3, probability: 35, color: '#f59e0b', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_diagnostico', name: 'Diagnóstico Realizado', order: 4, probability: 50, color: '#8b5cf6', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_proposta', name: 'Proposta Enviada', order: 5, probability: 70, color: '#ec4899', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_negociacao', name: 'Negociação', order: 6, probability: 85, color: '#06b6d4', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_aguardando', name: 'Aguardando Contrato', order: 7, probability: 95, color: '#f43f5e', active: true, stageType: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_ganho', name: 'Fechado (Ganho)', order: 8, probability: 100, color: '#10b981', active: true, stageType: 'won', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'st_perdido', name: 'Perdido', order: 9, probability: 0, color: '#ef4444', active: true, stageType: 'lost', createdAt: '2026-01-01', updatedAt: '2026-01-01' }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'op1',
    leadId: 'l1',
    title: 'Migração de Contabilidade + BPO - Silva Logística',
    stageId: 'st_reuniao',
    position: 0,
    value: 3000,
    probability: 35,
    expectedCloseDate: '2026-08-15',
    source: 'Indicação',
    mainServiceId: 's2',
    serviceIds: ['s1', 's2'],
    painPoints: 'Processos lentos na contabilidade antiga, falta de controle de contas a pagar.',
    decisionMaker: 'Roberto Silva (Sócio)',
    budget: 'R$ 3.500/mês',
    urgency: 'high',
    status: 'open',
    nextActionDate: '2026-07-10',
    owner: 'Bruno Dev',
    tags: ['Importante', 'BPO'],
    createdAt: '2026-06-16',
    updatedAt: '2026-07-01'
  },
  {
    id: 'op2',
    leadId: 'l2',
    title: 'Assessoria + Robôs IA - TechVibe SaaS',
    stageId: 'st_proposta',
    position: 0,
    value: 5700,
    probability: 70,
    expectedCloseDate: '2026-07-28',
    source: 'LinkedIn',
    mainServiceId: 's4',
    serviceIds: ['s1', 's4'],
    painPoints: 'Falta de agilidade para conciliar notas fiscais no SaaS, alta carga fiscal.',
    decisionMaker: 'Amanda Costa (CEO)',
    budget: 'R$ 6.000/mês',
    urgency: 'medium',
    status: 'open',
    nextActionDate: '2026-07-09',
    owner: 'Thiago Fiscal',
    tags: ['Tecnologia', 'IA'],
    createdAt: '2026-06-21',
    updatedAt: '2026-07-05'
  }
];

export const mockSalesActivities: SalesActivity[] = [
  {
    id: 'sa1',
    type: 'meeting',
    title: 'Reunião de Diagnóstico Silva Logística',
    description: 'Apresentar modelo de BPO Financeiro integrado à contabilidade.',
    dueDate: '2026-07-05',
    completedAt: '2026-07-05',
    status: 'completed',
    opportunityId: 'op1',
    leadId: 'l1',
    owner: 'Bruno Dev',
    outcome: 'Excelente fit demonstrado. Cliente quer proposta detalhada.',
    nextStep: 'Montar proposta comercial personalizada.',
    createdAt: '2026-06-30',
    updatedAt: '2026-07-05'
  },
  {
    id: 'sa2',
    type: 'follow_up',
    title: 'Ligar para Amanda - TechVibe',
    description: 'Obter feedback sobre a proposta de automação com IA enviada semana passada.',
    dueDate: '2026-07-04',
    status: 'overdue',
    opportunityId: 'op2',
    leadId: 'l2',
    owner: 'Thiago Fiscal',
    createdAt: '2026-06-28',
    updatedAt: '2026-06-28'
  },
  {
    id: 'sa3',
    type: 'whatsapp',
    title: 'Enviar mensagem para Roberto - Silva Logística',
    description: 'Confirmar horário da chamada de apresentação da proposta.',
    dueDate: '2026-07-10',
    status: 'pending',
    opportunityId: 'op1',
    leadId: 'l1',
    owner: 'Bruno Dev',
    createdAt: '2026-07-06',
    updatedAt: '2026-07-06'
  }
];

export const mockSalesProposals: SalesProposal[] = [
  {
    id: 'pr1',
    opportunityId: 'op2',
    leadId: 'l2',
    title: 'Proposta Comercial - TechVibe SaaS',
    status: 'sent_placeholder',
    validUntil: '2026-07-20',
    items: [
      { serviceId: 's1', description: 'Assessoria Contábil Completa', quantity: 1, unitPrice: 1200, total: 1200 },
      { serviceId: 's4', description: 'Automação de Processos Contábeis (IA)', quantity: 1, unitPrice: 4500, total: 4500 }
    ],
    subtotal: 5700,
    discount: 0,
    total: 5700,
    paymentTerms: 'Boleto bancário, vencimento todo dia 10',
    scopeSummary: 'Integração de notas fiscais via API e contabilidade regular.',
    assumptions: 'Cliente deve fornecer acesso às APIs de faturamento.',
    nextSteps: 'Retorno sobre aprovação da proposta.',
    createdAt: '2026-06-22',
    updatedAt: '2026-06-22'
  }
];

export const mockSalesCommunicationTemplates: SalesCommunicationTemplate[] = [
  {
    id: 'tmp1',
    name: 'Primeiro Contato - Outbound',
    type: 'first_contact',
    channel: 'whatsapp',
    body: 'Olá {{leadName}}, tudo bem? Sou o {{sellerName}} da Franco Tecnologia. Vi que você gerencia a {{companyName}} e gostaria de saber se vocês enfrentam dificuldades para conciliar o financeiro e a contabilidade...',
    active: true,
    variables: ['leadName', 'sellerName', 'companyName'],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  },
  {
    id: 'tmp2',
    name: 'Follow-up de Proposta Enviada',
    type: 'follow_up',
    channel: 'email',
    subject: 'Acompanhamento da Proposta Comercial - Franco Tecnologia',
    body: 'Olá {{leadName}},\n\nGostaria de saber se você teve a oportunidade de avaliar a proposta comercial que enviamos para a {{companyName}} no valor de {{proposalValue}}.\n\nFicamos à disposição para agendar uma breve conversa para tirar dúvidas.\n\nAbraço,\n{{sellerName}}',
    active: true,
    variables: ['leadName', 'companyName', 'proposalValue', 'sellerName'],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  }
];

export const mockProspectingLists: ProspectingList[] = [
  {
    id: 'pl1',
    name: 'Clinicas Médicas - SP Centro',
    targetSegment: 'Saúde',
    targetLocation: 'São Paulo - Centro',
    companySize: 'Micro/Pequena',
    keywords: 'Clínica, Consultório, Médico',
    channel: 'google_maps',
    serviceFocus: 'Contabilidade regular e BPO Financeiro',
    desiredLeadCount: 15,
    status: 'researching',
    notes: 'Lista focada em consultórios com até 3 sócios médicos.',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01'
  }
];

export const mockSalesAutomationRules: SalesAutomationRule[] = [
  {
    id: 'ar1',
    name: 'Alerta de Lead Novo Sem Contato',
    description: 'Alertar vendedor se um lead novo ficar mais de 24h sem atividades registradas.',
    triggerType: 'lead_created',
    offsetValue: 24,
    channel: 'internal',
    actionType: 'remind_owner',
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  },
  {
    id: 'ar2',
    name: 'Criar Tarefa pós Diagnóstico',
    description: 'Ao finalizar o Diagnóstico, sugerir a elaboração da Proposta Comercial.',
    triggerType: 'diagnosis_completed',
    channel: 'task',
    actionType: 'create_activity',
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  }
];

export const mockSalesSettings: SalesSettings = {
  idealSegments: ['Saúde', 'Tecnologia/SaaS', 'Advocacia', 'Logística'],
  excludedSegments: ['Construção Civil Pesada', 'Varejo Físico de Grande Porte'],
  minimumTicket: 1000,
  preferredServices: ['s1', 's2', 's4'],
  targetLocations: ['São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG'],
  qualificationQuestions: [
    'Qual o faturamento mensal aproximado?',
    'Quem toma a decisão sobre contratação de assessoria?',
    'Quais as maiores dores operacionais hoje?',
    'Possui controle integrado de contas a pagar/receber?'
  ],
  lostReasons: [
    'Preço muito alto',
    'Sem verba/budget',
    'Já tem fornecedor atendendo bem',
    'Sem tempo para implementar',
    'Não viu valor na solução',
    'Sócio não aprovou'
  ],
  defaultOwner: 'Bruno Dev',
  slaFirstContactHours: 24,
  followUpCadenceDays: 3,
  staleOpportunityDays: 7,
  updatedAt: '2026-07-01'
};

export const mockSalesPlaybooks: SalesPlaybook[] = [
  {
    id: 'pb1',
    name: 'Diagnóstico Comercial Inicial',
    type: 'first_contact',
    description: 'Guia passo a passo para qualificar o lead na reunião inicial.',
    recommendedChannel: 'meeting',
    checklist: [
      'Entender o contexto do negócio do cliente',
      'Identificar as dores principais de contabilidade/financeiro',
      'Validar o orçamento aproximado',
      'Explicar o escopo básico da Franco Tecnologia'
    ],
    suggestedQuestions: [
      'Como funciona o seu processo financeiro hoje?',
      'Você emite muitas notas fiscais no mês?',
      'Qual o seu maior gargalo operacional?'
    ],
    suggestedNextStep: 'Apresentação de proposta em até 3 dias úteis.',
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  }
];

export const mockSalesObjections: SalesObjection[] = [
  {
    id: 'ob1',
    opportunityId: 'op1',
    type: 'Preço',
    description: 'Cliente achou o valor do BPO de R$ 3.000 um pouco acima do esperado para o estágio atual.',
    status: 'open',
    createdAt: '2026-07-06',
    updatedAt: '2026-07-06'
  }
];

export const mockSalesOutboundMessageLogs: SalesOutboundMessageLog[] = [
  {
    id: 'ml1',
    channel: 'whatsapp',
    status: 'copied',
    recipientName: 'Roberto Silva',
    recipientContact: '(11) 98765-4321',
    body: 'Olá Roberto, tudo bem? Sou o Bruno Dev da Franco Tecnologia. Vi que você gerencia a Silva Logística Ltda...',
    createdAt: '2026-07-06',
    simulatedAt: '2026-07-06'
  }
];



export const mockFinancialAccounts: FinancialAccount[] = [
  {
    id: 'fa1',
    name: 'Conta Corrente Principal - Itaú',
    type: 'conta_corrente_pj',
    institution: 'Itaú Unibanco',
    bankCode: '341',
    agency: '1234',
    accountNumber: '56789',
    accountDigit: '0',
    beneficiary: 'Franco Tecnologia e Negocios Digitais Ltda',
    beneficiaryDocument: '45.123.456/0001-89',
    pixKey: '45.123.456/0001-89',
    initialBalance: 25400.00,
    initialBalanceDate: '2026-01-01',
    color: '#0284c7',
    status: 'ativa',
    createdAt: '2026-01-01',
    updatedAt: '2026-06-01'
  }
];

export const mockFinancialEvents: FinancialEvent[] = [];
export const mockFinancialAutomationRules: FinancialAutomationRule[] = [];
export const mockManualFinancialEntries: ManualFinancialEntry[] = [];
