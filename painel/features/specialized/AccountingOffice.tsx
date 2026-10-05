import React, { useState } from 'react';
import { useStore } from '../../data/store';
import { 
  Building2, 
  Layers, 
  AlertCircle, 
  FileSpreadsheet, 
  Users2, 
  TrendingUp, 
  FileCheck,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AccountingOffice: React.FC = () => {
  const { clients, tasks } = useStore();
  const [selectedSubmodule, setSelectedSubmodule] = useState<string | null>(null);

  // 1. Calculations based on new client relationshipType
  const accountingClientsCount = clients.filter(c => 
    ['contabil', 'fiscal', 'folha'].includes(c.relationshipType)
  ).length;

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  
  const fiscalTasksCount = pendingTasks.filter(t => 
    /fiscal|imposto|das|simples|tributo|tributário/i.test(t.title + t.description)
  ).length;

  const payrollTasksCount = pendingTasks.filter(t => 
    /folha|dp|pagamento|esocial|dentista|contracheque|admissão/i.test(t.title + t.description)
  ).length;

  const accountingTasksCount = pendingTasks.filter(t => 
    /contábil|defis|balanço|balancete|dre|escrituração/i.test(t.title + t.description)
  ).length;

  const submodules = [
    {
      id: 'fiscal',
      title: 'Módulo Fiscal',
      desc: 'Apuração de tributos federais e municipais, emissão de guias DAS/DARF e declarações.',
      details: ['Geração automática de DAS', 'Integração EFD Reinf', 'Escrituração de Notas de Entrada/Saída'],
      icon: FileSpreadsheet,
      color: 'blue'
    },
    {
      id: 'payroll',
      title: 'Folha & DP',
      desc: 'Processamento de folha de pagamento, contracheques, férias, rescisões e eventos do eSocial.',
      details: ['Fechamento mensal de folha', 'Transmissão eSocial simplificada', 'Painel de afastamentos'],
      icon: Users2,
      color: 'green'
    },
    {
      id: 'accounting',
      title: 'Módulo Contábil',
      desc: 'Escrituração contábil clássica, conciliações, balancetes periódicos e emissão de DRE/Balanço.',
      details: ['Conciliação de contas patrimoniais', 'Geração de Balancetes em tempo real', 'Configuração de Plano de Contas'],
      icon: Layers,
      color: 'purple'
    },
    {
      id: 'assets',
      title: 'Controle Patrimonial',
      desc: 'Depreciação de ativos, amortizações e controle de bens imobilizados dos clientes.',
      details: ['Ficha de ativos imobilizados', 'Cálculo linear de depreciação', 'Relatório de baixas e reavaliações'],
      icon: TrendingUp,
      color: 'orange'
    },
    {
      id: 'obligations',
      title: 'Obrigações Acessórias',
      desc: 'Calendário de entrega de obrigações fiscais/trabalhistas mensais e anuais.',
      details: ['Agenda Tributária Federal/Estadual', 'Geração de SPED Fiscal / Contribuições', 'Entrega DEFIS Complementar'],
      icon: FileCheck,
      color: 'red'
    },
    {
      id: 'certificates',
      title: 'Certificados & Acessos',
      desc: 'Controle de validade de certificados digitais A1/A3 e procurações eletrônicas.',
      details: ['Alerta de vencimento de certificado A1', 'Armazenamento de senhas do e-CAC', 'Procurações RFB cadastradas'],
      icon: Lock,
      color: 'info'
    }
  ];

  return (
    <div className="accounting-office-container">
      {/* Concept warning banner */}
      <div className="concept-banner">
        <AlertCircle size={22} className="concept-banner-icon" />
        <div className="concept-banner-text">
          <h5>Separação de Contextos Operacionais</h5>
          <p>
            O módulo <strong>Escritório Contábil</strong> concentra dados fiscais, tributários, trabalhistas e contábeis apenas 
            dos clientes que contrataram esse tipo de serviço. O cadastro geral do Franco OS permanece neutro e operacional.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-cols-4 mt-1">
        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Clientes Contábeis</span>
            <div className="kpi-icon-wrapper purple">
              <Building2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{accountingClientsCount}</div>
          <div className="kpi-subtext">Clientes com assessoria ativa</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Competência Atual</span>
            <div className="kpi-icon-wrapper blue">
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value">06/2026</div>
          <div className="kpi-subtext">Período operacional ativo</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Pendências Ativas</span>
            <div className="kpi-icon-wrapper orange">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="kpi-value">{fiscalTasksCount + payrollTasksCount + accountingTasksCount}</div>
          <div className="kpi-subtext">
            Fiscais: {fiscalTasksCount} | DP: {payrollTasksCount} | Contábeis: {accountingTasksCount}
          </div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Obrigações Próximas</span>
            <div className="kpi-icon-wrapper green">
              <FileCheck size={20} />
            </div>
          </div>
          <div className="kpi-value">3</div>
          <div className="kpi-subtext">Vencimentos nesta semana</div>
        </div>
      </div>

      {/* Title */}
      <div className="section-divider mt-2">
        <h3 className="section-title">Submódulos Especializados (Placeholders de Conceito)</h3>
        <p className="section-subtitle">Estas áreas concentram as ferramentas que suportam a operação contábil e tributária final.</p>
      </div>

      {/* Submodule Placeholder Grid */}
      <div className="grid-cols-2 mt-1">
        {submodules.map(sub => {
          const SubIcon = sub.icon;
          return (
            <div 
              key={sub.id} 
              className="glass-card submodule-card"
              onClick={() => setSelectedSubmodule(sub.id)}
            >
              <div className="submodule-card-header">
                <div className={`submodule-icon-box ${sub.color}`}>
                  <SubIcon size={20} />
                </div>
                <h4 className="submodule-title">{sub.title}</h4>
              </div>
              <p className="submodule-desc">{sub.desc}</p>
              
              <ul className="submodule-features-preview">
                {sub.details.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>

              <div className="submodule-card-footer mt-1">
                <span className="phase-badge">Fase 2 - Em Breve</span>
                <span className="btn-link">Visualizar Escopo <ArrowRight size={14} /></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail submodule modal preview */}
      {selectedSubmodule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{submodules.find(s => s.id === selectedSubmodule)?.title}</h3>
              <button className="btn-icon" onClick={() => setSelectedSubmodule(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body text-center">
              <div className="modal-feature-icon-wrapper">
                <Lock size={40} className="color-purple" />
              </div>
              <h4 className="mt-1">Recurso Exclusivo da Fase 2</h4>
              <p className="submodule-modal-text mt-1">
                O {submodules.find(s => s.id === selectedSubmodule)?.title} é um submódulo especializado que pertence ao ecossistema do 
                <strong> Escritório Contábil</strong>. Na fase atual (MVP), priorizamos a neutralidade do Core do Franco OS. 
                Nas próximas etapas, este painel receberá integrações diretas com prefeituras, Receita Federal e eSocial.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedSubmodule(null)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .accounting-office-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .concept-banner {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 1.25rem;
          border-radius: var(--radius-lg);
          margin-bottom: 0.5rem;
        }

        .concept-banner-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .concept-banner-text h5 {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .concept-banner-text p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .kpi-icon-wrapper.red-icon {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger);
        }

        .section-divider {
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        /* Submodule cards grid */
        .submodule-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-height: 220px;
        }

        .submodule-card:hover {
          border-color: var(--accent-primary);
        }

        .submodule-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .submodule-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submodule-icon-box.blue { background: rgba(14, 165, 233, 0.15); color: var(--info); }
        .submodule-icon-box.green { background: rgba(34, 197, 94, 0.15); color: var(--success); }
        .submodule-icon-box.purple { background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); }
        .submodule-icon-box.orange { background: rgba(249, 115, 22, 0.15); color: var(--warning); }
        .submodule-icon-box.red { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
        .submodule-icon-box.info { background: rgba(6, 182, 212, 0.15); color: var(--info); }

        .submodule-title {
          font-size: 1rem;
          font-weight: 600;
        }

        .submodule-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 1rem;
        }

        .submodule-features-preview {
          list-style: none;
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-left: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .submodule-features-preview li::before {
          content: '• ';
          color: var(--accent-primary);
        }

        .submodule-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--glass-border);
          padding-top: 0.75rem;
        }

        .phase-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .btn-link {
          font-size: 0.8125rem;
          color: var(--accent-primary);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
        }

        /* Modal details */
        .text-center {
          text-align: center;
        }

        .modal-feature-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background: var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .color-purple {
          color: var(--accent-primary);
        }

        .submodule-modal-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

// We will also use X from lucide-react in modal
import { X } from 'lucide-react';

