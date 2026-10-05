import React, { useEffect, useState } from 'react';
import { Sun, Moon, Bell, Search, Cloud, CloudOff, Loader } from 'lucide-react';
import { useStore } from '../../data/store';
import { acompanharSituacao } from '../../data/persistencia';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { tasks } = useStore();
  const [situacao, setSituacao] = useState<'salvo' | 'salvando' | 'erro'>('salvo');
  useEffect(() => acompanharSituacao(setSituacao), []);

  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;

  useEffect(() => {
    const savedTheme = localStorage.getItem('fos_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('fos_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Visão Geral / Dashboard Executivo';
      case 'crm': return 'Comercial / CRM & Pipeline';
      case 'services': return 'Comercial / Catálogo de Serviços';
      case 'clients': return 'Operacional / Clientes & CNPJs';
      case 'contracts': return 'Operacional / Contratos & Escopos';
      case 'tasks': return 'Operacional / Demandas & Tarefas';
      case 'finance': return 'Financeiro / Fluxo & Notas';
      case 'partners_repayments': return 'Financeiro / Parceiros & Repasses';
      case 'settings': return 'Sistema / Configurações';
      case 'accounting_office': return 'Módulos Especializados / Escritório Contábil';
      default: return 'Franco OS / Hub Operacional';
    }
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('pt-BR', options);
  };



  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb-path">{getBreadcrumb()}</div>
        <div className="current-date-label">{getFormattedDate()}</div>
      </div>
      
      <div className="topbar-right">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar clientes, contratos, tarefas..." 
            className="search-input"
          />
        </div>

        <button className="icon-btn" onClick={toggleTheme} title="Alternar Tema Claro/Escuro">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="icon-btn notification-btn" title="Tarefas Pendentes">
          <Bell size={18} />
          {activeTasksCount > 0 && <span className="notification-badge">{activeTasksCount}</span>}
        </button>

        <span
          className="icon-btn text-muted"
          title={situacao === 'erro' ? 'Não consegui salvar, tentando de novo' : situacao === 'salvando' ? 'Salvando…' : 'Tudo salvo'}
          style={situacao === 'erro' ? { color: 'var(--danger)' } : undefined}
        >
          {situacao === 'erro' ? <CloudOff size={16} /> : situacao === 'salvando' ? <Loader size={16} /> : <Cloud size={16} />}
        </span>

        <div className="user-profile-badge">
          <div className="user-avatar">FT</div>
          <div className="user-meta">
            <span className="user-name">Franco Tecnologia</span>
            <span className="user-role">Administrador</span>
          </div>
        </div>
      </div>
    </header>
  );
};
