import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, CreditCard, Award } from 'lucide-react';
import type { Partner } from '../../../types';
import { useStore } from '../../../data/store';

interface PartnerFormDrawerProps {
  partner?: Partner | null;
  onClose: () => void;
}

type TabType = 'geral' | 'contato' | 'pagamento' | 'regra' | 'interno';

export const PartnerFormDrawer: React.FC<PartnerFormDrawerProps> = ({ partner, onClose }) => {
  const { addPartner, updatePartner } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('geral');

  // Geral State
  const [name, setName] = useState('');
  const [partnerType, setPartnerType] = useState<Partner['partnerType']>('parceiro_comercial');
  const [personType, setPersonType] = useState<Partner['personType']>('PJ');
  const [document, setDocument] = useState('');
  const [status, setStatus] = useState<Partner['status']>('ativo');
  const [origin, setOrigin] = useState('');
  const [notes, setNotes] = useState('');

  // Contato State
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Pagamento State
  const [paymentBeneficiary, setPaymentBeneficiary] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Partner['paymentMethod']>('Pix');
  const [pixKey, setPixKey] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountType, setBankAccountType] = useState<'corrente' | 'poupanca'>('corrente');
  const [beneficiaryDocument, setBeneficiaryDocument] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Regras State
  const [defaultRepaymentType, setDefaultRepaymentType] = useState<Partner['defaultRepaymentType']>('comissao');
  const [defaultRepaymentRule, setDefaultRepaymentRule] = useState<Partner['defaultRepaymentRule']>('percentual');
  const [defaultPercentage, setDefaultPercentage] = useState(0);
  const [defaultFixedAmount, setDefaultFixedAmount] = useState(0);
  const [defaultReleaseCondition, setDefaultReleaseCondition] = useState<Partner['defaultReleaseCondition']>('recebimento');
  const [defaultPaymentTerm, setDefaultPaymentTerm] = useState<Partner['defaultPaymentTerm']>('10_dias');
  const [combinedNotes, setCombinedNotes] = useState('');

  // Interno State
  const [internalOwner, setInternalOwner] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [riskLevel, setRiskLevel] = useState<Partner['riskLevel']>('medio');

  useEffect(() => {
    if (partner) {
      setName(partner.name || '');
      setPartnerType(partner.partnerType || 'parceiro_comercial');
      setPersonType(partner.personType || 'PJ');
      setDocument(partner.document || '');
      setStatus(partner.status || 'ativo');
      setOrigin(partner.origin || '');
      setNotes(partner.notes || '');

      setContactName(partner.contactName || '');
      setEmail(partner.email || '');
      setPhone(partner.phone || '');
      setWebsite(partner.website || '');

      setPaymentBeneficiary(partner.paymentBeneficiary || '');
      setPaymentMethod(partner.paymentMethod || 'Pix');
      setPixKey(partner.pixKey || '');
      setBankName(partner.bankName || '');
      setBankAgency(partner.bankAgency || '');
      setBankAccount(partner.bankAccount || '');
      setBankAccountType(partner.bankAccountType || 'corrente');
      setBeneficiaryDocument(partner.beneficiaryDocument || '');
      setPaymentNotes(partner.notes || ''); // fallback/mapping

      setDefaultRepaymentType(partner.defaultRepaymentType || 'comissao');
      setDefaultRepaymentRule(partner.defaultRepaymentRule || 'percentual');
      setDefaultPercentage(partner.defaultPercentage || 0);
      setDefaultFixedAmount(partner.defaultFixedAmount || 0);
      setDefaultReleaseCondition(partner.defaultReleaseCondition || 'recebimento');
      setDefaultPaymentTerm(partner.defaultPaymentTerm || '10_dias');
      setCombinedNotes(partner.notes || '');

      setInternalOwner(partner.internalOwner || '');
      setTagsInput(partner.tags ? partner.tags.join(', ') : '');
      setRiskLevel(partner.riskLevel || 'medio');
    }
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const partnerData = {
      name,
      partnerType,
      personType,
      document,
      status,
      origin,
      contactName,
      email,
      phone,
      website,
      paymentBeneficiary,
      paymentMethod,
      pixKey,
      bankName,
      bankAgency,
      bankAccount,
      bankAccountType,
      beneficiaryDocument,
      defaultRepaymentType,
      defaultRepaymentRule,
      defaultPercentage,
      defaultFixedAmount,
      defaultReleaseCondition,
      defaultPaymentTerm,
      internalOwner,
      tags,
      riskLevel,
      notes
    };

    if (partner) {
      updatePartner({
        ...partner,
        ...partnerData
      });
    } else {
      addPartner(partnerData);
    }
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content drawer-large" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{partner ? 'Editar Parceiro Mestre' : 'Cadastrar Novo Parceiro'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Headers with custom styles */}
        <div className="drawer-tabs">
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
          >
            <User size={14} /> Dados Gerais
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'contato' ? 'active' : ''}`}
            onClick={() => setActiveTab('contato')}
          >
            <Mail size={14} /> Contato
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'pagamento' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagamento')}
          >
            <CreditCard size={14} /> Pagamento
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'regra' ? 'active' : ''}`}
            onClick={() => setActiveTab('regra')}
          >
            <Award size={14} /> Regras de Repasse
          </button>
          <button 
            type="button" 
            className={`drawer-tab ${activeTab === 'interno' ? 'active' : ''}`}
            onClick={() => setActiveTab('interno')}
          >
            <Shield size={14} /> Controle Interno
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 130px)' }}>
          <div className="drawer-body" style={{ flex: 1, overflowY: 'auto' }}>
            
            {activeTab === 'geral' && (
              <div className="tab-pane">
                <div className="info-card">
                  <h4>Identificação Cadastral</h4>
                  <div className="form-group">
                    <label>Nome / Razão Social *</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Fernanda Lima LTDA" required />
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>Tipo de Parceiro</label>
                      <select className="form-select" value={partnerType} onChange={e => setPartnerType(e.target.value as any)}>
                        <option value="parceiro_comercial">Parceiro Comercial</option>
                        <option value="indicador">Indicador de Negócios</option>
                        <option value="parceiro_entrega">Parceiro de Entrega/BPO</option>
                        <option value="prestador">Prestador de Serviço</option>
                        <option value="consultor">Consultor Independente</option>
                        <option value="afiliado">Afiliado</option>
                        <option value="fornecedor">Fornecedor Estratégico</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tipo Pessoa</label>
                      <select className="form-select" value={personType} onChange={e => setPersonType(e.target.value as any)}>
                        <option value="PJ">Pessoa Jurídica (PJ)</option>
                        <option value="PF">Pessoa Física (PF)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>{personType === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                      <input type="text" className="form-control" value={document} onChange={e => setDocument(e.target.value)} placeholder={personType === 'PJ' ? 'Ex: 00.000.000/0001-00' : 'Ex: 000.000.000-00'} />
                    </div>
                    <div className="form-group">
                      <label>Status Cadastral</label>
                      <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)}>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="suspenso">Suspenso</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group mt-1">
                    <label>Origem / Como chegou</label>
                    <input type="text" className="form-control" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Ex: Evento de Networking, LinkedIn, Indicação Thiago" />
                  </div>
                  <div className="form-group mt-1">
                    <label>Observações Cadastrais Gerais</label>
                    <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações gerais e referências do parceiro..." rows={3}></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contato' && (
              <div className="tab-pane">
                <div className="info-card">
                  <h4>Canais de Contato & Responsável</h4>
                  <div className="form-group">
                    <label>Nome do Contato Principal</label>
                    <input type="text" className="form-control" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Ex: Fernanda Lima" />
                  </div>
                  <div className="form-group mt-1">
                    <label>E-mail Corporativo *</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: contato@fernandaponto.com" required />
                  </div>
                  <div className="form-group mt-1">
                    <label>Telefone / WhatsApp *</label>
                    <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex: (11) 99999-8888" required />
                  </div>
                  <div className="form-group mt-1">
                    <label>Website / LinkedIn (Opcional)</label>
                    <input type="text" className="form-control" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Ex: linkedin.com/in/fernanda" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pagamento' && (
              <div className="tab-pane">
                <div className="info-card">
                  <h4>Dados Bancários / Pix para Repasses</h4>
                  <div className="form-group">
                    <label>Favorecido do Pagamento (Nome/Razão Social)</label>
                    <input type="text" className="form-control" value={paymentBeneficiary} onChange={e => setPaymentBeneficiary(e.target.value)} placeholder="Favorecido para emissão/transferência" />
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>Método Preferido</label>
                      <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                        <option value="Pix">Chave Pix</option>
                        <option value="transferência">Transferência Bancária (TED/DOC)</option>
                        <option value="boleto">Boleto Bancário</option>
                        <option value="outro">Outro método</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Chave Pix</label>
                      <input type="text" className="form-control" value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="E-mail, CPF, celular ou aleatória" />
                    </div>
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>Nome do Banco</label>
                      <input type="text" className="form-control" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Ex: Itaú Unibanco" />
                    </div>
                    <div className="form-group">
                      <label>Agência</label>
                      <input type="text" className="form-control" value={bankAgency} onChange={e => setBankAgency(e.target.value)} placeholder="Ex: 0001" />
                    </div>
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>Conta Corrente / Poupança</label>
                      <input type="text" className="form-control" value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="Ex: 123456-7" />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Conta</label>
                      <select className="form-select" value={bankAccountType} onChange={e => setBankAccountType(e.target.value as any)}>
                        <option value="corrente">Conta Corrente</option>
                        <option value="poupanca">Conta Poupança</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>CPF/CNPJ do Favorecido</label>
                      <input type="text" className="form-control" value={beneficiaryDocument} onChange={e => setBeneficiaryDocument(e.target.value)} placeholder="Caso seja diferente do titular principal" />
                    </div>
                  </div>
                  <div className="form-group mt-1">
                    <label>Instruções / Notas de Pagamento</label>
                    <textarea className="form-textarea" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Ex: Só pagar após emissão de nota de débito..." rows={2}></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'regra' && (
              <div className="tab-pane">
                <div className="info-card">
                  <h4>Regra Geral de Comissão & Condições Comerciais</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de Repasse</label>
                      <select className="form-select" value={defaultRepaymentType} onChange={e => setDefaultRepaymentType(e.target.value as any)}>
                        <option value="comissao">Comissão Comercial</option>
                        <option value="indicacao">Comissão de Indicação (Mestre)</option>
                        <option value="repasse">Repasse Operacional/Parceiro</option>
                        <option value="prestador">Prestador de Serviço Terceirizado</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fórmula Comercial</label>
                      <select className="form-select" value={defaultRepaymentRule} onChange={e => setDefaultRepaymentRule(e.target.value as any)}>
                        <option value="percentual">Percentual (%) do Contrato</option>
                        <option value="fixo">Valor Fixo (R$) por Período</option>
                        <option value="recorrente">Recorrente Mensal</option>
                        <option value="primeira_venda">Primeira Mensalidade Completa</option>
                        <option value="por_etapa">Por Etapa/Entregável</option>
                        <option value="manual">Manual/Sob Demanda</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row mt-1">
                    {defaultRepaymentRule === 'percentual' ? (
                      <div className="form-group">
                        <label>Percentual Comissão (%)</label>
                        <input type="number" className="form-control" value={defaultPercentage} onChange={e => setDefaultPercentage(Number(e.target.value))} min={0} max={100} />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Valor Fixo de Repasse (R$)</label>
                        <input type="number" className="form-control" value={defaultFixedAmount} onChange={e => setDefaultFixedAmount(Number(e.target.value))} min={0} />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Condição de Liberação</label>
                      <select className="form-select" value={defaultReleaseCondition} onChange={e => setDefaultReleaseCondition(e.target.value as any)}>
                        <option value="recebimento">Liberar após recebimento do cliente (e em dia)</option>
                        <option value="assinatura">Na assinatura do Contrato pelo Cliente</option>
                        <option value="mensal">Mensal Recorrente Automático</option>
                        <option value="entrega">Na entrega/conclusão de etapa técnica</option>
                        <option value="manual">Liberação Manual Auditada</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group mt-1">
                    <label>Prazo de Pagamento (Prazo Financeiro)</label>
                    <select className="form-select" value={defaultPaymentTerm} onChange={e => setDefaultPaymentTerm(e.target.value as any)}>
                      <option value="10_dias">D+10 da liberação (Recomendado)</option>
                      <option value="5_dias">D+5 da liberação</option>
                      <option value="imediato">Pagamento imediato</option>
                      <option value="proximo_ciclo">Próximo ciclo financeiro (Dia 10 do mês subsequente)</option>
                      <option value="manual">Definido manualmente por transação</option>
                    </select>
                  </div>
                  <div className="form-group mt-1">
                    <label>Notas do Combinado / Histórico do Acordo</label>
                    <textarea className="form-textarea" value={combinedNotes} onChange={e => setCombinedNotes(e.target.value)} placeholder="Detalhes específicos do acordo comercial feito com este parceiro..." rows={3}></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interno' && (
              <div className="tab-pane">
                <div className="info-card">
                  <h4>Controle Operacional Interno</h4>
                  <div className="form-group">
                    <label>Responsável Interno da Franco Tecnologia</label>
                    <input type="text" className="form-control" value={internalOwner} onChange={e => setInternalOwner(e.target.value)} placeholder="Ex: Bruno Dev, Thiago Fiscal" />
                  </div>
                  <div className="form-row mt-1">
                    <div className="form-group">
                      <label>Nível de Risco / Confiabilidade</label>
                      <select className="form-select" value={riskLevel} onChange={e => setRiskLevel(e.target.value as any)}>
                        <option value="baixo">Baixo Risco (Muito Confiável / Processo Consolidado)</option>
                        <option value="medio">Médio Risco (Parceria Recente)</option>
                        <option value="alto">Alto Risco (Requer Auditoria Manual Rígida)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tags Operacionais (Separadas por vírgula)</label>
                      <input type="text" className="form-control" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Ex: VIP, Dev, Contábil, Indicador" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary btn-icon-text">
              <Save size={16} /> Salvar Parceiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
