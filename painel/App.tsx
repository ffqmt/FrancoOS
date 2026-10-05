import React, { useState, useEffect } from 'react';
import './index.css';
import './complemento.css';
import { StoreProvider } from './data/store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './features/dashboard/Dashboard';
import { CRM } from './features/crm/CRM';
import { Services } from './features/services/Services';
import { Clients } from './features/clients/Clients';
import { Contracts } from './features/contracts/Contracts';
import { Tasks } from './features/tasks/Tasks';
import { Finance } from './features/finance/Finance';
import { PartnersRepayments } from './features/partners/PartnersRepayments';
import { Settings } from './features/settings/Settings';
import { AccountingOffice } from './features/specialized/AccountingOffice';
import { Lock, Laptop, Cpu, Target, Network, Bot } from 'lucide-react';

interface PlaceholderProps {
  tab: string;
}

const SpecializedPlaceholder: React.FC<PlaceholderProps> = ({ tab }) => {
  const getInfo = () => {
    switch (tab) {
      case 'saas_office':
        return {
          title: 'Workspace de Produtos Digitais & SaaS',
          desc: 'Gestão de licenças de software, faturamento recorrente automatizado (Stripe/Asaas) e relatórios de uso dos clientes.',
          details: ['Monitoramento de Chaves de API', 'Métricas SaaS (MRR, Churn, LTV)', 'Painel de Suporte Técnico'],
          icon: Laptop,
          color: 'blue'
        };
      case 'automations_office':
        return {
          title: 'Workspace de Automações & RPA',
          desc: 'Central de controle dos robôs de extração e rotinas automatizadas contratadas pelos clientes.',
          details: ['Status de execução de robôs', 'Logs de leitura de notas fiscais', 'Fila de processamento de arquivos'],
          icon: Cpu,
          color: 'green'
        };
      case 'consulting_office':
        return {
          title: 'Workspace de Consultoria & Projetos',
          desc: 'Planejamento ágil de projetos corporativos com acompanhamento de horas (Time Tracking) e entregas.',
          details: ['Cronograma de Fases / Gráfico de Gantt', 'Apontamento de horas executadas', 'Gestão de margem financeira do escopo'],
          icon: Target,
          color: 'orange'
        };
      case 'integrations_office':
        return {
          title: 'Workspace de Integrações Externas',
          desc: 'Gerenciador de conexões com ERPs externos, APIs bancárias, WhatsApp Business e armazenamento em nuvem.',
          details: ['Webhook triggers log', 'Status de conexão com Google Drive / OneDrive', 'Configuração de chaves de acesso'],
          icon: Network,
          color: 'purple'
        };
      case 'ia_office':
        return {
          title: 'Workspace de IA & Agentes Autônomos',
          desc: 'Configuração e monitoramento de agentes de inteligência artificial aplicados aos processos internos.',
          details: ['Agente Auditor de Notas Fiscais', 'Chatbot de atendimento integrado', 'Prompt management & Fine-tuning metrics'],
          icon: Bot,
          color: 'info'
        };
      default:
        return {
          title: 'Workspace Especializado',
          desc: 'Área reservada para serviços especializados da Franco Tecnologia.',
          details: ['Recurso planejado para Fase 2'],
          icon: Lock,
          color: 'purple'
        };
    }
  };

  const info = getInfo();
  const IconComponent = info.icon;

  return (
    <div className="placeholder-wrapper glass-card">
      <div className="placeholder-header">
        <div className={`placeholder-icon-box ${info.color}`}>
          <IconComponent size={32} />
        </div>
        <h3 className="placeholder-title">{info.title}</h3>
      </div>
      <p className="placeholder-desc">{info.desc}</p>
      
      <div className="placeholder-details-section">
        <h5>Módulos Planejados:</h5>
        <ul>
          {info.details.map((det, idx) => (
            <li key={idx}>{det}</li>
          ))}
        </ul>
      </div>

      <div className="placeholder-lock-block mt-2">
        <Lock size={16} />
        <span>Workspace reservado para a Fase 2 do Franco OS. O Core Operacional permanece neutro nesta fase.</span>
      </div>

      <style>{`
        .placeholder-wrapper {
          max-width: 700px;
          margin: 4rem auto 0 auto;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .placeholder-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .placeholder-icon-box {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-icon-box.blue { background: rgba(14, 165, 233, 0.12); color: var(--info); }
        .placeholder-icon-box.green { background: rgba(34, 197, 94, 0.12); color: var(--success); }
        .placeholder-icon-box.orange { background: rgba(249, 115, 22, 0.12); color: var(--warning); }
        .placeholder-icon-box.purple { background: rgba(99, 102, 241, 0.12); color: var(--accent-primary); }
        .placeholder-icon-box.info { background: rgba(6, 182, 212, 0.12); color: var(--info); }

        .placeholder-title {
          font-size: 1.35rem;
          font-weight: 700;
        }

        .placeholder-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.75rem;
          max-width: 550px;
        }

        .placeholder-details-section {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          width: 100%;
          text-align: left;
        }

        .placeholder-details-section h5 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .placeholder-details-section ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .placeholder-details-section li::before {
          content: '✔ ';
          color: var(--success);
          font-weight: bold;
        }

        .placeholder-lock-block {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.1);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--glass-border);
        }
      `}</style>
    </div>
  );
};

function InnerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveTab(customEvent.detail.tab);
      if (customEvent.detail.clientId) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('select-client', { detail: { clientId: customEvent.detail.clientId } }));
        }, 100);
      }
    };
    window.addEventListener('navigate-to-tab', handleNavigate);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'crm':
        return <CRM />;
      case 'services':
        return <Services />;
      case 'clients':
        return <Clients />;
      case 'contracts':
        return <Contracts />;
      case 'tasks':
        return <Tasks />;
      case 'finance':
        return <Finance />;
      case 'partners_repayments':
        return <PartnersRepayments />;
      case 'settings':
        return <Settings />;
      case 'accounting_office':
        return <AccountingOffice />;
      case 'saas_office':
      case 'automations_office':
      case 'consulting_office':
      case 'integrations_office':
      case 'ia_office':
        return <SpecializedPlaceholder tab={activeTab} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="workspace-layout">
        <Header activeTab={activeTab} />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <InnerApp />
    </StoreProvider>
  );
}

export default App;

