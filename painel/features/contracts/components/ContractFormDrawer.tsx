import React, { useState, useEffect } from 'react';
import { useStore } from '../../../data/store';
import type { Contract } from '../../../types';
import { X, Save, FileText, Settings, Shield, Award, DollarSign, ListChecks, UserPlus, Info } from 'lucide-react';
import { PartnerFormDrawer } from '../../partners/components/PartnerFormDrawer';

interface ContractFormDrawerProps {
  contract?: Contract | null;
  onClose: () => void;
}

export const ContractFormDrawer: React.FC<ContractFormDrawerProps> = ({ contract, onClose }) => {
  const { 
    clients, services, companies, partnerRepayments, partners,
    addContract, updateContract, 
    addTask, addPartnerRepayment, addDocument, addFinancialAction 
  } = useStore();

  const isEdit = !!contract;

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState<'geral' | 'escopo' | 'cobranca' | 'nota' | 'parceiros' | 'onboarding'>('geral');

  // Form State
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<Contract['status']>('active');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // Scope State
  const [scopeDescription, setScopeDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [sla, setSla] = useState('');

  // Pricing State
  const [monthlyValue, setMonthlyValue] = useState(0);
  const [billingType, setBillingType] = useState<Contract['billingType']>('mensal');
  const [recurrence, setRecurrence] = useState<Contract['recurrence']>('mensal');
  const [dueDay, setDueDay] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('Boleto Bancário');
  const [paymentTerms, setPaymentTerms] = useState('D+0');

  // Invoice State
  const [generatesInvoice, setGeneratesInvoice] = useState(true);
  const [invoiceTiming, setInvoiceTiming] = useState<Contract['invoiceTiming']>('antes_pagamento');
  const [invoiceDescription, setInvoiceDescription] = useState('');

  // Partner State
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerId, setPartnerId] = useState('');  // master registry id
  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState<'indicacao' | 'comissao' | 'parceiro' | 'prestador' | 'repasse'>('comissao');
  const [partnerRule, setPartnerRule] = useState<'percentual' | 'fixo' | 'recorrente' | 'primeira_venda' | 'por_etapa' | 'manual'>('percentual');
  const [partnerPercent, setPartnerPercent] = useState(10);
  const [partnerFixed, setPartnerFixed] = useState(0);
  const [partnerReleaseCondition, setPartnerReleaseCondition] = useState<'assinatura' | 'recebimento' | 'mensal' | 'entrega' | 'manual'>('recebimento');
  const [partnerNotes, setPartnerNotes] = useState('');
  const [useDefaultRules, setUseDefaultRules] = useState(true); // use partner's registered default rules
  const [isCreatingPartner, setIsCreatingPartner] = useState(false); // inline create partner drawer

  // Auto Generation Checkboxes (only relevant/editable for new contracts)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'reuniao_inicial', 'solicitacao_docs', 'setup_inicial', 'config_tecnica'
  ]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    'proposta', 'contrato_assinado'
  ]);
  const [selectedActions, setSelectedActions] = useState<string[]>([
    'enviar_cobranca', 'emitir_nota'
  ]);

  // Load contract details if in Edit mode
  useEffect(() => {
    if (contract) {
      setTitle(contract.title || '');
      setClientId(contract.clientId || '');
      setCompanyId(contract.companyId || '');
      setServiceId(contract.serviceId || '');
      setResponsible(contract.responsible || '');
      setStatus(contract.status || 'active');
      setStartDate(contract.startDate || '');
      setEndDate(contract.endDate || '');

      setScopeDescription(contract.scopeDescription || '');
      setDeliverables(contract.deliverables || '');
      setExclusions(contract.exclusions || '');
      setSla(contract.sla || '');

      setMonthlyValue(contract.monthlyValue || 0);
      setBillingType(contract.billingType || 'mensal');
      setRecurrence(contract.recurrence || 'mensal');
      setDueDay(contract.dueDay || 10);
      setPaymentMethod(contract.paymentMethod || 'Boleto Bancário');
      setPaymentTerms(contract.paymentTerms || 'D+0');

      setGeneratesInvoice(contract.generatesInvoice ?? true);
      setInvoiceTiming(contract.invoiceTiming || 'antes_pagamento');
      setInvoiceDescription(contract.invoiceDescription || '');

      const rule = contract.partnerRepaymentRule;
      if (rule) {
        setHasPartner(rule.hasPartner);
        setPartnerId(rule.partnerId || '');
        setPartnerName(rule.parceiro || '');
        setPartnerType(rule.tipo || 'comissao');
        setPartnerRule(rule.regra || 'percentual');
        setPartnerPercent(rule.percentual || 10);
        setPartnerFixed(rule.valorFixo || 0);
        setPartnerReleaseCondition(rule.condicaoLiberacao || 'recebimento');
        setPartnerNotes(rule.observacoes || '');
        setUseDefaultRules(!rule.customized);
      }
    }
  }, [contract]);

  // Handle service change to pre-fill pricing & defaults
  const handleServiceChange = (sid: string) => {
    setServiceId(sid);
    const service = services.find(s => s.id === sid);
    if (service) {
      setMonthlyValue(service.price);
      setTitle(`${service.name} - ${clients.find(c => c.id === clientId)?.name || 'Contrato'}`);
      setScopeDescription(service.description);
    }
  };

  const handleTaskToggle = (task: string) => {
    setSelectedTasks(prev => 
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const handleDocToggle = (doc: string) => {
    setSelectedDocs(prev => 
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  const handleActionToggle = (act: string) => {
    setSelectedActions(prev => 
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !serviceId || !monthlyValue) {
      alert('Por favor, preencha Cliente, Serviço Principal e Valor Mensal.');
      return;
    }

    const resolvedTitle = title || `${services.find(s => s.id === serviceId)?.name || 'Contrato'} - ${clients.find(c => c.id === clientId)?.name || 'Cliente'}`;

    const contractData: Omit<Contract, 'id'> = {
      clientId,
      serviceId,
      startDate,
      endDate: endDate || undefined,
      monthlyValue: Number(monthlyValue),
      status,
      title: resolvedTitle,
      companyId: companyId || undefined,
      responsible: responsible || 'Franco Time',
      scopeDescription,
      deliverables,
      exclusions,
      sla,
      billingType,
      recurrence,
      dueDay: Number(dueDay),
      paymentMethod,
      paymentTerms,
      generatesInvoice,
      invoiceTiming: generatesInvoice ? invoiceTiming : undefined,
      invoiceDescription: generatesInvoice ? invoiceDescription : undefined,
      partnerRepaymentRule: {
        hasPartner,
        partnerId: hasPartner ? partnerId : undefined,
        parceiro: hasPartner ? partnerName : undefined,
        tipo: hasPartner ? partnerType : undefined,
        regra: hasPartner ? partnerRule : undefined,
        percentual: (hasPartner && partnerRule === 'percentual') ? Number(partnerPercent) : undefined,
        valorFixo: (hasPartner && partnerRule === 'fixo') ? Number(partnerFixed) : undefined,
        condicaoLiberacao: hasPartner ? partnerReleaseCondition : undefined,
        observacoes: partnerNotes || undefined,
        customized: hasPartner ? !useDefaultRules : undefined
      }
    };

    let contractId = '';

    if (isEdit && contract) {
      contractId = contract.id;
      updateContract({
        ...contractData,
        id: contract.id
      });
    } else {
      const newC = addContract(contractData);
      contractId = newC.id;

      // Onboarding tasks generation
      if (selectedTasks.includes('reuniao_inicial')) {
        addTask({
          title: `[Onboarding] Reunião de Kick-off`,
          description: `Alinhamento inicial do escopo do contrato ${resolvedTitle}`,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          status: 'todo',
          assignee: responsible || 'Thiago Fiscal',
          clientId,
          contractId
        });
      }
      if (selectedTasks.includes('solicitacao_docs')) {
        addTask({
          title: `[Onboarding] Coleta de Documentos`,
          description: `Solicitar documentos societários e senhas de acesso aos portais do cliente`,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'urgent',
          status: 'todo',
          assignee: responsible || 'Rodolfo DP',
          clientId,
          contractId
        });
      }
      if (selectedTasks.includes('setup_inicial')) {
        addTask({
          title: `[Onboarding] Setup no Franco OS`,
          description: `Configurar empresas vinculadas e cadastrar contatos operacionais.`,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium',
          status: 'todo',
          assignee: responsible || 'Franco Time',
          clientId,
          contractId
        });
      }
      if (selectedTasks.includes('config_tecnica')) {
        addTask({
          title: `[Onboarding] Integrações e Robôs`,
          description: `Configurar robôs de conciliação e fluxos de faturamento previstos no contrato.`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          status: 'todo',
          assignee: 'Bruno Dev',
          clientId,
          contractId
        });
      }
      if (selectedTasks.includes('revisao_mensal')) {
        addTask({
          title: `Revisão Mensal Contratual`,
          description: `Acompanhar entregas mensais do contrato e avaliar satisfação.`,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'low',
          status: 'todo',
          assignee: responsible || 'Franco Time',
          clientId,
          contractId
        });
      }

      // Expected Documents placeholders
      if (selectedDocs.includes('proposta')) {
        addDocument({
          clientId,
          name: `Proposta Comercial - ${resolvedTitle}.pdf`,
          type: 'Proposta',
          contractId,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: 'Pendente de upload'
        });
      }
      if (selectedDocs.includes('contrato_assinado')) {
        addDocument({
          clientId,
          name: `Contrato Social / Assinado - ${resolvedTitle}.pdf`,
          type: 'CNPJ/Contrato Social',
          contractId,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: 'Aguardando assinatura'
        });
      }

      // Financial Actions schedule
      if (selectedActions.includes('enviar_cobranca')) {
        addFinancialAction({
          tipo: 'enviar_cobranca',
          dataAgendada: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Larissa Financeiro',
          status: 'agendada',
          clienteId: clientId,
          contratoId: contractId,
          canal: 'WhatsApp',
          observacoes: 'Enviar primeira mensalidade/fatura'
        });
      }
      if (selectedActions.includes('emitir_nota')) {
        addFinancialAction({
          tipo: 'emitir_nota',
          dataAgendada: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Larissa Financeiro',
          status: 'agendada',
          clienteId: clientId,
          contratoId: contractId,
          canal: 'sistema',
          observacoes: 'Emitir NFS-e da Franco'
        });
      }
    }

    // Handle updates or creation of related Partner Repayment rule
    if (hasPartner && partnerName) {
      const existingRepayment = partnerRepayments.find(r => r.contratoId === contractId);
      const repaymentValue = partnerRule === 'percentual'
        ? (Number(monthlyValue) * Number(partnerPercent)) / 100
        : Number(partnerFixed);

      if (existingRepayment) {
        existingRepayment.parceiro = partnerName;
        existingRepayment.tipo = partnerType;
        existingRepayment.regra = partnerRule === 'percentual' ? 'percentual' : 'fixo';
        existingRepayment.percentual = partnerRule === 'percentual' ? Number(partnerPercent) : undefined;
        existingRepayment.valor = repaymentValue;
        existingRepayment.condicao = partnerReleaseCondition === 'assinatura' ? 'venda' : 
                                     partnerReleaseCondition === 'recebimento' ? 'recebimento' : 
                                     partnerReleaseCondition === 'mensal' ? 'mensal' : 'manual';
        existingRepayment.observacoes = partnerNotes;
      } else {
        addPartnerRepayment({
          parceiro: partnerName,
          tipo: partnerType,
          clienteId: clientId,
          contratoId: contractId,
          regra: partnerRule === 'percentual' ? 'percentual' : 'fixo',
          percentual: partnerRule === 'percentual' ? Number(partnerPercent) : undefined,
          valor: repaymentValue,
          condicao: partnerReleaseCondition === 'assinatura' ? 'venda' : 
                    partnerReleaseCondition === 'recebimento' ? 'recebimento' : 
                    partnerReleaseCondition === 'mensal' ? 'mensal' : 'manual',
          status: 'previsto',
          dataPrevista: startDate,
          observacoes: partnerNotes
        });
      }
    }

    onClose();
  };

  // Find linked companies for selected client
  const clientCompanies = companies.filter(c => c.clientId === clientId);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <FileText size={20} className="text-accent" />
            <div>
              <h3>{isEdit ? 'Editar Contrato Operacional' : 'Novo Contrato & Escopo'}</h3>
              <p className="text-sm text-secondary">
                {isEdit ? `ID: ${contract?.id}` : 'Configuração completa do escopo e faturamento'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Drawer Tab Navigation */}
        <div className="drawer-tabs">
          <button 
            type="button" 
            className={`drawer-tab-link ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
          >
            <Settings size={14} /> Geral
          </button>
          <button 
            type="button" 
            className={`drawer-tab-link ${activeTab === 'escopo' ? 'active' : ''}`}
            onClick={() => setActiveTab('escopo')}
          >
            <Award size={14} /> Escopo & SLA
          </button>
          <button 
            type="button" 
            className={`drawer-tab-link ${activeTab === 'cobranca' ? 'active' : ''}`}
            onClick={() => setActiveTab('cobranca')}
          >
            <DollarSign size={14} /> Faturamento
          </button>
          <button 
            type="button" 
            className={`drawer-tab-link ${activeTab === 'nota' ? 'active' : ''}`}
            onClick={() => setActiveTab('nota')}
          >
            <FileText size={14} /> Nota da Franco
          </button>
          <button 
            type="button" 
            className={`drawer-tab-link ${activeTab === 'parceiros' ? 'active' : ''}`}
            onClick={() => setActiveTab('parceiros')}
          >
            <Shield size={14} /> Parceiros & Repasses
          </button>
          {!isEdit && (
            <button 
              type="button" 
              className={`drawer-tab-link ${activeTab === 'onboarding' ? 'active' : ''}`}
              onClick={() => setActiveTab('onboarding')}
            >
              <ListChecks size={14} /> Automatizados
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="drawer-form-wrapper">
          <div className="drawer-body">
            
            {/* TAB: GERAL */}
            {activeTab === 'geral' && (
              <div className="tab-pane-content animate-fade">
                <div className="form-group">
                  <label>Título do Contrato *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Assessoria Fiscal e Contábil Estelar" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente Vinculado *</label>
                    <select 
                      className="form-select" 
                      value={clientId} 
                      onChange={e => setClientId(e.target.value)} 
                      required 
                      disabled={isEdit}
                    >
                      <option value="">Selecione o Cliente</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>CNPJ / Empresa Vinculada (Opcional)</label>
                    <select 
                      className="form-select" 
                      value={companyId} 
                      onChange={e => setCompanyId(e.target.value)}
                    >
                      <option value="">Selecione o CNPJ (se cadastrado)</option>
                      {clientCompanies.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.tradeName} ({comp.cnpj})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Serviço Principal *</label>
                    <select 
                      className="form-select" 
                      value={serviceId} 
                      onChange={e => handleServiceChange(e.target.value)} 
                      required
                    >
                      <option value="">Selecione o Serviço</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category.toUpperCase()})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Responsável Interno (Account/BPO)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: Thiago Fiscal, Larissa Financeiro" 
                      value={responsible} 
                      onChange={e => setResponsible(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Data de Início *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Término / Renovação</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status do Contrato *</label>
                    <select 
                      className="form-select" 
                      value={status} 
                      onChange={e => setStatus(e.target.value as Contract['status'])} 
                      required
                    >
                      <option value="active">Ativo (Vigente)</option>
                      <option value="draft">Rascunho / Negociação</option>
                      <option value="suspended">Suspenso / Pausado</option>
                      <option value="expired">Cancelado / Expirado</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ESCOPO & SLA */}
            {activeTab === 'escopo' && (
              <div className="tab-pane-content animate-fade">
                <div className="form-group">
                  <label>Descrição do Escopo Contratado</label>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    placeholder="Resumo do que está contratado..." 
                    value={scopeDescription} 
                    onChange={e => setScopeDescription(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Principais Entregáveis Combinados</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Folha de pagamento, Guia de ISS, Conciliação Diária" 
                    value={deliverables} 
                    onChange={e => setDeliverables(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Limites / O que NÃO está incluso</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Auditorias externas, Defesas de auto de infração complexos" 
                    value={exclusions} 
                    onChange={e => setExclusions(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>SLA Contratado (Acordo de Nível de Serviço)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: 24 horas úteis para chamados fiscais" 
                    value={sla} 
                    onChange={e => setSla(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {/* TAB: COBRANÇA */}
            {activeTab === 'cobranca' && (
              <div className="tab-pane-content animate-fade">
                <div className="form-row">
                  <div className="form-group">
                    <label>Valor Mensal / Principal (R$) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={monthlyValue || ''} 
                      onChange={e => setMonthlyValue(Number(e.target.value))} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Faturamento *</label>
                    <select 
                      className="form-select" 
                      value={billingType} 
                      onChange={e => setBillingType(e.target.value as Contract['billingType'])}
                    >
                      <option value="mensal">Mensalidade Recorrente</option>
                      <option value="avulso">Faturamento Avulso</option>
                      <option value="anual">Anuidade</option>
                      <option value="projeto">Por Projeto Fechado</option>
                      <option value="hora">Valor por Hora</option>
                      <option value="pacote_horas">Pacote Fechado de Horas</option>
                      <option value="etapa">Faturamento por Etapas</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Recorrência de Cobrança *</label>
                    <select 
                      className="form-select" 
                      value={recurrence} 
                      onChange={e => setRecurrence(e.target.value as Contract['recurrence'])}
                    >
                      <option value="mensal">Mensal</option>
                      <option value="unica">Única</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                      <option value="sob_demanda">Sob Demanda</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Dia de Vencimento Mensal *</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={31} 
                      className="form-control" 
                      value={dueDay} 
                      onChange={e => setDueDay(Number(e.target.value))} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Forma de Pagamento Preferida</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: Boleto Bancário, Pix, Cartão de Crédito" 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Condições de Pagamento</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: Vencimento todo dia 10, D+5 após emissão" 
                      value={paymentTerms} 
                      onChange={e => setPaymentTerms(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group mt-1">
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      defaultChecked={true} 
                    />
                    <span>Gerar Cobrança Recorrente automaticamente na Agenda</span>
                  </label>
                  <p className="text-xs text-muted mt-05">Gera automaticamente programações conceituais de faturamento todo mês baseando-se nas datas.</p>
                </div>
              </div>
            )}

            {/* TAB: NOTA DA FRANCO */}
            {activeTab === 'nota' && (
              <div className="tab-pane-content animate-fade">
                <div className="form-group">
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={generatesInvoice} 
                      onChange={e => setGeneratesInvoice(e.target.checked)} 
                    />
                    <span>Gera Notas da Franco (NFS-e de Serviços prestados)?</span>
                  </label>
                </div>

                {generatesInvoice && (
                  <div className="mt-1 animate-fade">
                    <div className="form-group">
                      <label>Momento de Emissão da Nota</label>
                      <select 
                        className="form-select" 
                        value={invoiceTiming} 
                        onChange={e => setInvoiceTiming(e.target.value as Contract['invoiceTiming'])}
                      >
                        <option value="antes_pagamento">Emitir NFS-e antes do Pagamento (Pré-faturamento)</option>
                        <option value="apos_pagamento">Emitir NFS-e após confirmação do Pagamento</option>
                        <option value="competencia">Emitir NFS-e no mês de competência do serviço</option>
                        <option value="manual">Controle de Emissão Manual</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Descrição padrão para emissão da nota</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        placeholder="Ex: Prestação de serviços de assessoria contábil mensal referente ao mês X..." 
                        value={invoiceDescription} 
                        onChange={e => setInvoiceDescription(e.target.value)} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PARCEIROS & REPASSES */}
            {activeTab === 'parceiros' && (
              <div className="tab-pane-content animate-fade">
                <div className="form-group">
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={hasPartner} 
                      onChange={e => {
                        setHasPartner(e.target.checked);
                        if (!e.target.checked) { setPartnerId(''); setPartnerName(''); }
                      }} 
                    />
                    <span>Possui parceiro/indicador com repasse financeiro vinculado?</span>
                  </label>
                </div>

                {hasPartner && (
                  <div className="mt-1 animate-fade">

                    {/* STEP 1: Select from master registry or type manually */}
                    <div className="partner-select-card glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          🏷️ Parceiro Vinculado
                        </h5>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setIsCreatingPartner(true)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <UserPlus size={12} /> Novo Parceiro
                        </button>
                      </div>

                      {partners.length > 0 ? (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Selecionar do Cadastro Mestre</label>
                          <select
                            className="form-select"
                            value={partnerId}
                            onChange={e => {
                              const pid = e.target.value;
                              setPartnerId(pid);
                              if (pid) {
                                const p = partners.find(x => x.id === pid);
                                if (p) {
                                  setPartnerName(p.name);
                                  setPartnerType(p.defaultRepaymentType || 'comissao');
                                  if (useDefaultRules && p.defaultRepaymentRule) {
                                    setPartnerRule(p.defaultRepaymentRule);
                                    setPartnerPercent(p.defaultPercentage || 10);
                                    setPartnerFixed(p.defaultFixedAmount || 0);
                                    setPartnerReleaseCondition(p.defaultReleaseCondition || 'recebimento');
                                    setPartnerNotes(p.notes || '');
                                  }
                                }
                              } else {
                                setPartnerName('');
                              }
                            }}
                          >
                            <option value="">-- Digitar nome manualmente --</option>
                            {partners.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {p.partnerType === 'indicador' ? 'Indicador' : p.partnerType === 'parceiro_entrega' ? 'Parceiro de Entrega' : p.partnerType === 'prestador' ? 'Prestador' : p.partnerType === 'parceiro_comercial' ? 'Parceiro Comercial' : 'Co-BPO'}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="text-sm text-muted" style={{ margin: 0 }}>
                          Nenhum parceiro cadastrado ainda.{' '}
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCreatingPartner(true)} style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}>
                            Cadastrar agora
                          </button>
                        </p>
                      )}

                      {/* Partner preview card when one is selected */}
                      {partnerId && (() => {
                        const p = partners.find(x => x.id === partnerId);
                        if (!p) return null;
                        return (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(139,92,246,0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(139,92,246,0.25)' }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                              <div><span style={{ color: 'var(--text-muted)' }}>Parceiro:</span> <strong>{p.name}</strong></div>
                              {p.email && <div><span style={{ color: 'var(--text-muted)' }}>E-mail:</span> {p.email}</div>}
                              {p.phone && <div><span style={{ color: 'var(--text-muted)' }}>Tel:</span> {p.phone}</div>}
                              {p.defaultRepaymentRule && <div><span style={{ color: 'var(--text-muted)' }}>Regra padrão:</span> {p.defaultRepaymentRule === 'percentual' ? `${p.defaultPercentage}%` : `R$ ${p.defaultFixedAmount}`}</div>}
                              {p.pixKey && <div><span style={{ color: 'var(--text-muted)' }}>PIX:</span> {p.pixKey}</div>}
                            </div>
                          </div>
                        );
                      })()}

                      {/* If no partner selected from registry, show manual name field */}
                      {!partnerId && (
                        <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                          <label>Nome do Parceiro (manual) *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ex: Fernanda Parceira, Consultor X"
                            value={partnerName}
                            onChange={e => setPartnerName(e.target.value)}
                            required={hasPartner && !partnerId}
                          />
                        </div>
                      )}
                    </div>

                    {/* STEP 2: Use default rules or customize */}
                    {partnerId && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--glass-border)' }}>
                          <input
                            type="checkbox"
                            checked={useDefaultRules}
                            onChange={e => {
                              setUseDefaultRules(e.target.checked);
                              if (e.target.checked) {
                                const p = partners.find(x => x.id === partnerId);
                                if (p && p.defaultRepaymentRule) {
                                  setPartnerRule(p.defaultRepaymentRule);
                                  setPartnerPercent(p.defaultPercentage || 10);
                                  setPartnerFixed(p.defaultFixedAmount || 0);
                                  setPartnerReleaseCondition(p.defaultReleaseCondition || 'recebimento');
                                  setPartnerNotes(p.notes || '');
                                }
                              }
                            }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Usar Regra Padrão do Parceiro</span>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                              Herda automaticamente a regra cadastrada no perfil do parceiro. Desmarque para personalizar.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* STEP 3: Rule details (shown always or only when custom) */}
                    {(!partnerId || !useDefaultRules) && (
                      <div className="animate-fade">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Tipo de Vínculo de Repasse</label>
                            <select 
                              className="form-select" 
                              value={partnerType} 
                              onChange={e => setPartnerType(e.target.value as any)}
                            >
                              <option value="indicacao">Indicação Simples</option>
                              <option value="comissao">Comissão Comercial</option>
                              <option value="repasse">Repasse de Faturamento</option>
                              <option value="parceiro">Parceiro de Entrega / Co-BPO</option>
                              <option value="prestador">Prestador Terceirizado</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Regra de Comissão</label>
                            <select 
                              className="form-select" 
                              value={partnerRule} 
                              onChange={e => setPartnerRule(e.target.value as any)}
                            >
                              <option value="percentual">Percentual sobre faturamento</option>
                              <option value="fixo">Valor Fixo mensal</option>
                              <option value="recorrente">Recorrente mensal permanente</option>
                              <option value="primeira_venda">Apenas sobre a primeira mensalidade</option>
                              <option value="por_etapa">Pago por entrega/etapa realizada</option>
                              <option value="manual">Lançamento de repasse manual</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          {partnerRule === 'percentual' ? (
                            <div className="form-group">
                              <label>Percentual (%) *</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                value={partnerPercent} 
                                onChange={e => setPartnerPercent(Number(e.target.value))} 
                                required={partnerRule === 'percentual'}
                              />
                            </div>
                          ) : (
                            <div className="form-group">
                              <label>Valor Fixo (R$) *</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                value={partnerFixed} 
                                onChange={e => setPartnerFixed(Number(e.target.value))} 
                                required={true}
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label>Condição de Liberação do Repasse</label>
                            <select 
                              className="form-select" 
                              value={partnerReleaseCondition} 
                              onChange={e => setPartnerReleaseCondition(e.target.value as any)}
                            >
                              <option value="recebimento">Liberar após recebimento do cliente (Recomendado)</option>
                              <option value="assinatura">Liberar imediatamente na assinatura</option>
                              <option value="mensal">Todo dia 10 fixo</option>
                              <option value="manual">Manual pelo Financeiro</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Observações do Combinado</label>
                          <textarea 
                            className="form-control" 
                            rows={2} 
                            placeholder="Ex: Comissão válida pelos primeiros 12 meses..." 
                            value={partnerNotes}
                            onChange={e => setPartnerNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Show summary when using default rules */}
                    {partnerId && useDefaultRules && (
                      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius)', padding: '0.75rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 700, color: 'var(--color-success)' }}>
                          <Info size={12} /> Regras Herdadas do Cadastro do Parceiro
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                          <span>Regra: <strong className="text-primary">{partnerRule === 'percentual' ? `${partnerPercent}%` : partnerRule === 'fixo' ? `R$ ${partnerFixed}` : partnerRule}</strong></span>
                          <span>Condição: <strong className="text-primary">{partnerReleaseCondition}</strong></span>
                          {partnerNotes && <span>Obs: <em>{partnerNotes}</em></span>}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Inline PartnerFormDrawer for creating a new partner */}
                {isCreatingPartner && (
                  <PartnerFormDrawer
                    onClose={() => setIsCreatingPartner(false)}
                  />
                )}
              </div>
            )}

            {/* TAB: AUTO GENERATED ONBOARDING AND SCHEDULING (NEW ONLY) */}
            {activeTab === 'onboarding' && !isEdit && (
              <div className="tab-pane-content animate-fade">
                <div className="form-group">
                  <label className="section-subtitle-drawer">1. Checklist de Tarefas Operacionais / Onboarding</label>
                  <p className="text-xs text-muted mb-1">Selecione quais tarefas serão adicionadas automaticamente ao criar este contrato:</p>
                  
                  <div className="checkbox-grid-drawer">
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedTasks.includes('reuniao_inicial')} onChange={() => handleTaskToggle('reuniao_inicial')} />
                      <div>
                        <strong>Reunião de Kick-off</strong>
                        <span>Reunião comercial/alinhamento básico.</span>
                      </div>
                    </label>
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedTasks.includes('solicitacao_docs')} onChange={() => handleTaskToggle('solicitacao_docs')} />
                      <div>
                        <strong>Solicitação de Documentos</strong>
                        <span>Coletar contabilidade anterior e senhas.</span>
                      </div>
                    </label>
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedTasks.includes('setup_inicial')} onChange={() => handleTaskToggle('setup_inicial')} />
                      <div>
                        <strong>Setup cadastral no Hub</strong>
                        <span>Registrar filiais e contatos operacionais.</span>
                      </div>
                    </label>
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedTasks.includes('config_tecnica')} onChange={() => handleTaskToggle('config_tecnica')} />
                      <div>
                        <strong>Setup técnico de Robôs</strong>
                        <span>Configurar integrações e robôs Stellar.</span>
                      </div>
                    </label>
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedTasks.includes('revisao_mensal')} onChange={() => handleTaskToggle('revisao_mensal')} />
                      <div>
                        <strong>Acompanhamento Periódico</strong>
                        <span>Configurar tarefa de revisão contábil mensal.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-group mt-2">
                  <label className="section-subtitle-drawer">2. Documentos Contratuais Esperados</label>
                  <div className="checkbox-grid-drawer">
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedDocs.includes('proposta')} onChange={() => handleDocToggle('proposta')} />
                      <div>
                        <strong>Proposta Comercial</strong>
                        <span>Criar guia para upload da proposta.</span>
                      </div>
                    </label>
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedDocs.includes('contrato_assinado')} onChange={() => handleDocToggle('contrato_assinado')} />
                      <div>
                        <strong>Contrato Social / Contrato Assinado</strong>
                        <span>Criar pendência de upload de contrato assinado.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-group mt-2">
                  <label className="section-subtitle-drawer">3. Agenda Financeira Prevista</label>
                  <div className="checkbox-grid-drawer">
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedActions.includes('enviar_cobranca')} onChange={() => handleActionToggle('enviar_cobranca')} />
                      <div>
                        <strong>Enviar Lembrete de Cobrança</strong>
                        <span>Follow-up preventivo de faturamento.</span>
                      </div>
                    </label>
                    <label className="checkbox-item-block">
                      <input type="checkbox" checked={selectedActions.includes('emitir_nota')} onChange={() => handleActionToggle('emitir_nota')} />
                      <div>
                        <strong>Emitir Nota da Franco</strong>
                        <span>Agendamento de emissão de NFS-e no fiscal.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Salvar Contrato
            </button>
          </div>
        </form>

        {/* Styling inside Drawer Component */}
      </div>
    </div>
  );
};
