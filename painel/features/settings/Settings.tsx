import React from 'react';
import { useStore } from '../../data/store';
import { SalesSettingsTab } from '../crm/components/SalesSettingsTab';
import { RefreshCw, Shield, HardDrive, Info } from 'lucide-react';

export const Settings: React.FC = () => {
  const { resetStore } = useStore();

  const handleReset = async () => {
    if (window.confirm('Atenção: isso apaga de vez todos os cadastros, contatos, tarefas e lançamentos do painel. Continuar?')) {
      await resetStore();
    }
  };

  return (
    <div className="settings-container">
      <div className="grid-cols-2">
        {/* Administration Box */}
        <div className="glass-card">
          <h3 className="card-title">Banco de dados</h3>
          <p className="settings-desc">
            Tudo o que você cadastra aqui fica salvo no Supabase, no mesmo projeto do ERP contábil, e aparece em qualquer
            computador em que você entrar com o seu login.
          </p>

          <div className="settings-action-block mt-2">
            <button className="btn btn-danger" onClick={handleReset}>
              <RefreshCw size={16} /> Apagar todos os dados
            </button>
            <span className="settings-action-tip block mt-1 text-xs text-muted">Volta o painel ao estado inicial, sem cadastros.</span>
          </div>
        </div>

        {/* System Metadata Box */}
        <div className="glass-card">
          <h3 className="card-title">Sobre o Franco OS</h3>
          <div className="settings-info-list flex flex-col gap-2">
            <div className="settings-info-item flex items-center gap-2">
              <Info size={16} className="info-icon text-accent" />
              <div>
                <strong>Versão do Sistema:</strong> <span>2.0</span>
              </div>
            </div>
            <div className="settings-info-item flex items-center gap-2">
              <Shield size={16} className="info-icon text-success" />
              <div>
                <strong>Arquitetura:</strong> <span>Next.js + React 19 + Supabase</span>
              </div>
            </div>
            <div className="settings-info-item flex items-center gap-2">
              <HardDrive size={16} className="info-icon text-info" />
              <div>
                <strong>Persistência:</strong> <span>Supabase (tabela os_registros)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="card-title">Comercial (CRM): perfil de cliente ideal, etapas do funil e regras</h3>
        <SalesSettingsTab />
      </div>
    </div>
  );
};
