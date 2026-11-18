"use client";

import dynamic from "next/dynamic";

// O painel completo (CRM, clientes, contratos, tarefas, financeiro, parceiros) roda só no navegador.
const App = dynamic(() => import("@/painel/App"), {
  ssr: false,
  loading: () => <div className="carga-painel">Carregando o FrancoOS…</div>,
});

export default function Sistema() {
  return <App />;
}
