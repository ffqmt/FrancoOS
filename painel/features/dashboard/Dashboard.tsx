import React, { useState } from 'react';
import { useStore } from '../../data/store';
import { 
  TrendingUp, 
  CheckSquare, 
  DollarSign, 
  Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { clients, contracts, tasks, transactions, accountsPayables, services, opportunities, salesProposals } = useStore();
  const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Mês de referência dos números financeiros: o atual ou o seguinte.
  const [mesRef, setMesRef] = useState<'atual' | 'proximo'>('atual');
  const hoje = new Date().toISOString().split('T')[0];
  const mesAtual = hoje.slice(0, 7);
  const mesSeguinte = (() => { const d = new Date(mesAtual + '-01T12:00:00'); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 7); })();
  const mes = mesRef === 'atual' ? mesAtual : mesSeguinte;
  const nomeMes = (m: string) => new Date(m + '-01T12:00:00').toLocaleDateString('pt-BR', { month: 'long' });

  const pagoParcial = (baixas?: { valor: number }[]) => (baixas ?? []).reduce((s, b) => s + b.valor, 0);
  const receitasMes = transactions.filter(t => t.type === 'income' && t.dueDate.slice(0, 7) === mes);
  const recPrevisto = receitasMes.reduce((s, t) => s + t.amount, 0);
  const recRecebido = receitasMes.reduce((s, t) => s + (t.status === 'paid' ? t.amount : pagoParcial(t.baixas)), 0);
  // Vencidos de meses anteriores que ainda não entraram.
  const recAtrasado = transactions
    .filter(t => t.type === 'income' && t.status !== 'paid' && t.dueDate.slice(0, 7) < mesAtual)
    .reduce((s, t) => s + t.amount - pagoParcial(t.baixas), 0);

  const contasMes = accountsPayables.filter(p => p.status !== 'cancelado' && p.vencimento.slice(0, 7) === mes);
  const pagPrevisto = contasMes.reduce((s, p) => s + p.valor, 0);
  const pagPago = contasMes.reduce((s, p) => s + (p.status === 'pago' ? p.valor : pagoParcial(p.baixas)), 0);
  const pagAtrasado = accountsPayables
    .filter(p => p.status !== 'pago' && p.status !== 'cancelado' && p.vencimento.slice(0, 7) < mesAtual)
    .reduce((s, p) => s + p.valor - pagoParcial(p.baixas), 0);

  const movimentosMes = [
    ...receitasMes.map(t => ({ id: t.id, desc: t.description, data: t.dueDate, valor: t.amount, entrada: true, quitado: t.status === 'paid' })),
    ...contasMes.map(p => ({ id: p.id, desc: `${p.favorecido}: ${p.descricao}`, data: p.vencimento, valor: p.valor, entrada: false, quitado: p.status === 'pago' })),
  ].sort((a, b) => a.data.localeCompare(b.data));

  // 1. Calculations
  const activeContracts = contracts.filter(c => c.status === 'active');
  const mrr = activeContracts.reduce((sum, c) => sum + c.monthlyValue, 0);

  // CRM 2.0 integration
  const openOpportunities = (opportunities || []).filter(o => o.status === 'open');
  const pendingProposalsValue = openOpportunities.reduce((sum, o) => sum + o.value, 0) || 
    (salesProposals || []).filter(p => p.status === 'sent_placeholder' || p.status === 'prepared' || p.status === 'draft').reduce((sum, p) => sum + p.total, 0);


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


  // Category distribution
  const revenueByCategory = activeContracts.reduce((acc: Record<string, number>, contract) => {
    const service = services.find(s => s.id === contract.serviceId);
    const bruto = service ? service.category : 'Outros';
    const categoryName = bruto === 'contabilidade' || bruto === 'fiscal' ? 'contabil' : bruto;
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
      <div className="fin-filtros-chips" style={{ marginBottom: '0.75rem' }}>
        <button type="button" className={`fin-chip ${mesRef === 'atual' ? 'active' : ''}`} onClick={() => setMesRef('atual')}>Este mês ({nomeMes(mesAtual)})</button>
        <button type="button" className={`fin-chip ${mesRef === 'proximo' ? 'active' : ''}`} onClick={() => setMesRef('proximo')}>Próximo mês ({nomeMes(mesSeguinte)})</button>
      </div>
      {/* 4 Cards Grid */}
      <div className="grid-cols-4">
        <div className="glass-card accented">
          <div className="kpi-header">
            <span className="kpi-title">A receber em {nomeMes(mes)}</span>
            <div className="kpi-icon-wrapper green">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">{brl(recPrevisto - recRecebido)}</div>
          <div className="kpi-subtext" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span>Recebido: {brl(recRecebido)} de {brl(recPrevisto)}</span>
            {recAtrasado > 0 && <span className="text-danger fw-600">Atrasado de meses anteriores: {brl(recAtrasado)}</span>}
            <span className="text-muted">Recorrente dos contratos: {brl(mrr)}/mês</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span className="kpi-title">A pagar em {nomeMes(mes)}</span>
            <div className="kpi-icon-wrapper orange">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{brl(pagPrevisto - pagPago)}</div>
          <div className="kpi-subtext" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span>Pago: {brl(pagPago)} de {brl(pagPrevisto)}</span>
            {pagAtrasado > 0 && <span className="text-danger fw-600">Atrasado de meses anteriores: {brl(pagAtrasado)}</span>}
            <span className="text-muted">Saldo previsto do mês: {brl(recPrevisto - pagPrevisto)}</span>
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
          <h3 className="card-title">Entradas e saídas de {nomeMes(mes)}</h3>
          {movimentosMes.length === 0 ? (
            <div className="empty-state text-center p-2 text-muted">Nada lançado para este mês.</div>
          ) : (
            <div className="transactions-list" style={{ maxHeight: '22rem', overflowY: 'auto' }}>
              {movimentosMes.map(m => {
                const atrasado = !m.quitado && m.data < hoje;
                return (
                  <div key={m.id} className="transaction-item flex justify-between items-center py-2 border-b border-glass">
                    <div>
                      <span className="font-semibold block">{m.desc}</span>
                      <span className="text-xs text-muted">Vencimento: {m.data.split('-').reverse().join('/')}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${m.entrada ? 'text-success' : 'text-danger'}`}>
                        {m.entrada ? '+ ' : '- '}{brl(m.valor)}
                      </span>
                      <span className={`badge badge-sm block mt-1 ${m.quitado ? 'badge-success' : atrasado ? 'badge-danger' : 'badge-warning'}`}>
                        {m.quitado ? (m.entrada ? 'Recebido' : 'Pago') : atrasado ? 'Atrasado' : 'Em aberto'}
                      </span>
                    </div>
                  </div>
                );
              })}
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
