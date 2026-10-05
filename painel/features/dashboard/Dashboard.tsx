import React from 'react';
import { useStore } from '../../data/store';
import { 
  TrendingUp, 
  Users, 
  CheckSquare, 
  DollarSign, 
  ArrowUpRight,
  Clock,
  Briefcase
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { leads, clients, contracts, tasks, transactions, services, opportunities, salesProposals } = useStore();

  // 1. Calculations
  const activeContracts = contracts.filter(c => c.status === 'active');
  const mrr = activeContracts.reduce((sum, c) => sum + c.monthlyValue, 0);

  // CRM 2.0 integration
  const openOpportunities = (opportunities || []).filter(o => o.status === 'open');
  const pendingProposalsValue = openOpportunities.reduce((sum, o) => sum + o.value, 0) || 
    (salesProposals || []).filter(p => p.status === 'sent_placeholder' || p.status === 'prepared' || p.status === 'draft').reduce((sum, p) => sum + p.total, 0);

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'qualified' || (l as any).status === 'client').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const pendingTasksCount = pendingTasks.length;

  const accountingClients = clients.filter(c => ['contabil', 'fiscal', 'folha'].includes(c.relationshipType)).length;
  const accountingTasks = pendingTasks.filter(t => 
    /fiscal|imposto|das|simples|tributo|tributário|folha|dp|pagamento|esocial|dentista|contracheque|admissão|contábil|defis|balanço|balancete|dre|escrituração/i.test(t.title + t.description)
  ).length;

  // Recent high priority tasks
  const criticalTasks = pendingTasks
    .filter(t => t.priority === 'urgent' || t.priority === 'high')
    .slice(0, 4);

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  // Category distribution
  const revenueByCategory = activeContracts.reduce((acc: Record<string, number>, contract) => {
    const service = services.find(s => s.id === contract.serviceId);
    const categoryName = service ? service.category : 'Outros';
    acc[categoryName] = (acc[categoryName] || 0) + contract.monthlyValue;
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    contabil: 'Contábil & Fiscal',
    folha: 'Folha & DP',
    legalizacao: 'Legalização',
    consultoria: 'Consultoria',
    produto_digital: 'Produtos Digitais/IA',
    automacao: 'Automação BPO',
    suporte: 'Suporte & TI',
    patrimonio: 'Patrimônio',
    integracao: 'Integrações',
    projeto: 'Projetos Especiais'
  };

  return (
    <div className="dashboard-wrapper">
      {/* 4 Cards Grid */}
      <div className="grid-cols-4">
        <div className="glass-card accented">
          <div className="kpi-header">
            <span className="kpi-title">Receita Mensal Recorrente (MRR)</span>
            <div className="kpi-icon-wrapper purple">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
          </div>
          <div className="kpi-subtext text-success">
            <ArrowUpRight size={14} /> +12% em relação ao mês anterior
          </div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Pipeline Comercial em Aberto</span>
            <div className="kpi-icon-wrapper blue">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingProposalsValue)}
          </div>
          <div className="kpi-subtext">
            Reflete oportunidades e propostas abertas
          </div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Taxa de Conversão Comercial</span>
            <div className="kpi-icon-wrapper green">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{conversionRate}%</div>
          <div className="kpi-subtext text-success">
            Meta anual estabelecida de 30%
          </div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Demandas / Tarefas Pendentes</span>
            <div className="kpi-icon-wrapper orange">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="kpi-value">{pendingTasksCount}</div>
          <div className="kpi-subtext text-warning">
            {pendingTasks.filter(t => t.priority === 'urgent').length} urgentes ativas
          </div>
        </div>
      </div>

      {/* Middle Section: Chart-like and Breakdown */}
      <div className="grid-cols-2 mt-2">
        {/* Revenue Category Breakdown */}
        <div className="glass-card">
          <h3 className="card-title">Faturamento Recorrente por Categoria</h3>
          <div className="breakdown-list">
            {Object.keys(categoryLabels).map(catKey => {
              const val = revenueByCategory[catKey] || 0;
              const pct = mrr > 0 ? Math.round((val / mrr) * 100) : 0;
              if (val === 0 && !['contabil', 'consultoria', 'produto_digital'].includes(catKey)) return null;
              return (
                <div key={catKey} className="breakdown-item">
                  <div className="breakdown-info">
                    <span className="breakdown-name">{categoryLabels[catKey] || catKey}</span>
                    <span className="breakdown-value">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${Math.min(pct, 100)}%`,
                        background: catKey === 'contabil' ? 'var(--accent-primary)' : 
                                   catKey === 'consultoria' ? 'var(--info)' : 
                                   catKey === 'produto_digital' ? 'var(--success)' : 'var(--warning)'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Tasks List */}
        <div className="glass-card">
          <h3 className="card-title">Demandas Prioritárias do Dia</h3>
          {criticalTasks.length === 0 ? (
            <div className="empty-state text-center p-2 text-muted">Nenhuma demanda crítica pendente no momento.</div>
          ) : (
            <div className="tasks-compact-list">
              {criticalTasks.map(t => {
                const client = clients.find(c => c.id === t.clientId);
                return (
                  <div key={t.id} className="task-compact-item">
                    <div className="task-compact-header">
                      <span className="task-title font-semibold">{t.title}</span>
                      <span className={`badge badge-sm ${t.priority === 'urgent' ? 'badge-danger' : 'badge-warning'}`}>
                        {t.priority === 'urgent' ? 'Urgente' : 'Alta'}
                      </span>
                    </div>
                    <div className="task-compact-meta text-xs text-muted flex gap-2 mt-1">
                      <span>Prazo: {t.dueDate}</span>
                      {client && <span>• Cliente: {client.name}</span>}
                      {t.assignee && <span>• Resp: {t.assignee}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Financial Activity & Specialized Office Notice */}
      <div className="grid-cols-2 mt-2">
        <div className="glass-card">
          <h3 className="card-title">Movimentações Financeiras Recentes</h3>
          {recentTransactions.length === 0 ? (
            <div className="empty-state text-center p-2 text-muted">Nenhuma transação financeira registrada.</div>
          ) : (
            <div className="transactions-list">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="transaction-item flex justify-between items-center py-2 border-b border-glass">
                  <div>
                    <span className="font-semibold block">{tx.description}</span>
                    <span className="text-xs text-muted">Vencimento: {tx.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+ ' : '- '}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                    </span>
                    <span className={`badge badge-sm block mt-1 ${tx.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {tx.status === 'paid' ? 'Liquidado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card">
          <h3 className="card-title">Resumo do Escritório Contábil</h3>
          <p className="text-sm text-muted mb-2">
            Módulo especializado integrado ao Core da Franco Tecnologia.
          </p>
          <div className="flex justify-between items-center py-2 border-b border-glass">
            <span>Clientes sob Gestão Contábil / Fiscal:</span>
            <span className="font-bold text-accent">{accountingClients}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-glass">
            <span>Rotinas Fiscais & Folha Pendentes:</span>
            <span className="font-bold text-warning">{accountingTasks}</span>
          </div>
          <div className="mt-2 text-xs text-muted">
            Para acessar a visão especializada e relatórios avançados de contabilidade, abra a aba <strong>Escritório Contábil</strong> no menu lateral.
          </div>
        </div>
      </div>
    </div>
  );
};
