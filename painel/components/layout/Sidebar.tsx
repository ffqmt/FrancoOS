import React from 'react';
import { sair } from '../../../app/admin/login/actions';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Shield,
  Zap,
  Building2,
  Laptop,
  Cpu,
  Target,
  Network,
  Bot,
  Award,
  Bell,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuGroups = [
    {
      title: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Comercial',
      items: [
        { id: 'crm', label: 'CRM & Pipeline', icon: TrendingUp },
        { id: 'services', label: 'Catálogo de Serviços', icon: Briefcase }
      ]
    },
    {
      title: 'Operacional',
      items: [
        { id: 'clients', label: 'Clientes & CNPJs', icon: Users },
        { id: 'contracts', label: 'Contratos & Escopos', icon: FileText },
        { id: 'tasks', label: 'Demandas & Tarefas', icon: CheckSquare }
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { id: 'finance', label: 'Financeiro & Notas', icon: DollarSign },
        { id: 'partners_repayments', label: 'Parceiros & Repasses', icon: Award }
      ]
    },
    {
      title: 'Módulos Especializados',
      items: [
        { id: 'accounting_office', label: 'Escritório Contábil', icon: Building2 },
        { id: 'saas_office', label: 'Produtos Digitais', icon: Laptop },
        { id: 'automations_office', label: 'Automações', icon: Cpu },
        { id: 'consulting_office', label: 'Consultoria / Projetos', icon: Target },
        { id: 'integrations_office', label: 'Integrações', icon: Network },
        { id: 'ia_office', label: 'IA & Agentes', icon: Bot }
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'settings', label: 'Configurações', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Zap size={20} className="brand-logo-icon" />
        </div>
        <div className="brand-info">
          <span className="brand-name">FRANCO OS</span>
          <span className="brand-tagline">Hub Operacional</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="nav-group">
            <span className="nav-group-title">{group.title}</span>
            <ul className="nav-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id} className="nav-item">
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} />
                      <span className="nav-label">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="nav-group">
          <span className="nav-group-title">Contas com lembrete</span>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/admin/contas" className="nav-link">
                <Bell size={18} />
                <span className="nav-label">A pagar, a receber e credores</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <Shield size={18} />
          </div>
          <div className="user-details">
            <span className="user-name">Franco Tecnologia</span>
            <span className="user-role">Administrador</span>
          </div>
          <form action={sair} style={{ marginLeft: 'auto' }}>
            <button className="nav-link" title="Sair" style={{ padding: '0.4rem', width: 'auto' }}>
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .brand-logo {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .brand-logo-icon {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .brand-name {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-group-title {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 700;
          padding-left: 0.75rem;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.625rem 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          text-align: left;
          transition: all var(--transition-fast);
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          padding-left: 1rem;
        }

        .nav-link.active {
          color: var(--text-primary);
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.625rem;
          bottom: 0.625rem;
          width: 3px;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
        }

        .sidebar-footer {
          padding: 1.25rem;
          border-top: 1px solid var(--glass-border);
          background: rgba(0, 0, 0, 0.1);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
        }
      `}</style>
    </aside>
  );
};

