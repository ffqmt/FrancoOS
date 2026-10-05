import React, { useState } from 'react';
import { CRMOverviewTab } from './components/CRMOverviewTab';
import { LeadsTab } from './components/LeadsTab';
import { PipelineKanbanTab } from './components/PipelineKanbanTab';
import { SalesActivitiesTab } from './components/SalesActivitiesTab';
import { SalesProposalsTab } from './components/SalesProposalsTab';
import { ProspectingTab } from './components/ProspectingTab';
import { SalesAgentTab } from './components/SalesAgentTab';
import { SalesTemplatesTab } from './components/SalesTemplatesTab';
import { SalesSettingsTab } from './components/SalesSettingsTab';
import { TrendingUp, Users, CheckSquare, DollarSign, Bot, Calendar, FileText, Settings, Search } from 'lucide-react';

export const CRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="page-container animate-fade">
      {/* Title */}
      <div className="page-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="page-title">CRM &amp; Funil Comercial</h2>
          <p className="page-subtitle">Núcleo de qualificação de leads e gestão comercial da Franco Tecnologia</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="page-tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`page-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={14} /> Visão Geral
        </button>
        <button 
          className={`page-tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <Users size={14} /> Leads / Fichas
        </button>
        <button 
          className={`page-tab ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <CheckSquare size={14} /> Pipeline Kanban
        </button>
        <button 
          className={`page-tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Calendar size={14} /> Atividades
        </button>
        <button 
          className={`page-tab ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          <DollarSign size={14} /> Propostas
        </button>
        <button 
          className={`page-tab ${activeTab === 'prospecting' ? 'active' : ''}`}
          onClick={() => setActiveTab('prospecting')}
        >
          <Search size={14} /> Listas de Prospecção
        </button>
        <button 
          className={`page-tab ${activeTab === 'agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('agent')}
        >
          <Bot size={14} style={{ color: 'var(--accent-primary)' }} /> Agente Comercial
        </button>
        <button 
          className={`page-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileText size={14} /> Roteiros / Templates
        </button>
        <button 
          className={`page-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={14} /> Configurações
        </button>
      </div>

      {/* Tab Contents */}
      <div className="tab-viewport">
        {activeTab === 'overview' && <CRMOverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'pipeline' && <PipelineKanbanTab />}
        {activeTab === 'activities' && <SalesActivitiesTab />}
        {activeTab === 'proposals' && <SalesProposalsTab />}
        {activeTab === 'prospecting' && <ProspectingTab />}
        {activeTab === 'agent' && <SalesAgentTab />}
        {activeTab === 'templates' && <SalesTemplatesTab />}
        {activeTab === 'settings' && <SalesSettingsTab />}
      </div>
    </div>
  );
};
export default CRM;
