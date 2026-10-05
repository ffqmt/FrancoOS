import { somarDias } from "@/lib/formato";
import type { supabaseServico } from "@/lib/supabase";

// Cria no painel (os_registros/fos_transactions) a cobrança mensal de cada contrato ativo.
// A cobrança aparece 10 dias antes do vencimento, para dar tempo do lembrete de 3 dias antes.
// O id é fixo por contrato e mês (t_<contrato>_<ano>_<mês>), então rodar de novo não duplica
// e não mexe em cobrança já existente (inclusive as lançadas à mão com o mesmo id).

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const ANTECEDENCIA_DIAS = 10;

type Contrato = {
  id: string;
  clientId?: string;
  serviceId?: string;
  status?: string;
  recurrence?: string;
  monthlyValue?: number;
  dueDay?: number;
  startDate?: string;
  endDate?: string;
  invoiceTiming?: string;
};

function vencimento(ano: number, mes: number, dia: number) {
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return `${ano}-${String(mes).padStart(2, "0")}-${String(Math.min(dia, ultimo)).padStart(2, "0")}`;
}

export async function gerarMensalidades(db: ReturnType<typeof supabaseServico>, ref: string) {
  const { data, error } = await db
    .from("os_registros")
    .select("colecao, id, dados, user_id")
    .in("colecao", ["fos_contracts", "fos_clients"])
    .neq("id", "__colecao");
  if (error) throw new Error(error.message);

  const linhas = (data ?? []) as { colecao: string; id: string; dados: Record<string, unknown>; user_id: string }[];
  const nomeCliente = new Map(
    linhas.filter((l) => l.colecao === "fos_clients").map((l) => [`${l.user_id}:${l.id}`, String(l.dados.name ?? "")]),
  );

  const [anoRef, mesRef] = ref.split("-").map(Number);
  const novas: { user_id: string; colecao: string; id: string; dados: Record<string, unknown> }[] = [];

  for (const l of linhas.filter((x) => x.colecao === "fos_contracts")) {
    const k = l.dados as unknown as Contrato;
    if (k.status !== "active" || k.recurrence !== "mensal" || !k.monthlyValue || !k.dueDay || !k.clientId) continue;

    for (const deslocamento of [0, 1]) {
      const mes = ((mesRef - 1 + deslocamento) % 12) + 1;
      const ano = anoRef + (mesRef + deslocamento > 12 ? 1 : 0);
      const venc = vencimento(ano, mes, k.dueDay);
      if (ref < somarDias(venc, -ANTECEDENCIA_DIAS)) continue;
      if (k.startDate && k.startDate > venc) continue;
      if (k.endDate && k.endDate < venc) continue;

      const id = `t_${k.id.replace(/^k_/, "")}_${ano}_${String(mes).padStart(2, "0")}`;
      const tipo = k.serviceId === "s_consultoria" ? "Consultoria" : "Mensalidade";
      novas.push({
        user_id: l.user_id,
        colecao: "fos_transactions",
        id,
        dados: {
          id,
          type: "income",
          category: "mensalidade",
          description: `${tipo} ${MESES[mes - 1]}/${ano} ${nomeCliente.get(`${l.user_id}:${k.clientId}`) ?? ""}`.trim(),
          amount: k.monthlyValue,
          dueDate: venc,
          status: "pending",
          clientId: k.clientId,
          contractId: k.id,
          notaQuando: k.invoiceTiming === "antes_pagamento" ? "antes" : "depois",
        },
      });
    }
  }

  if (!novas.length) return { criadas: 0 };
  const marcadores = [...new Set(novas.map((n) => n.user_id))].map((user_id) => ({
    user_id,
    colecao: "fos_transactions",
    id: "__colecao",
    dados: {},
  }));
  const { data: inseridas, error: erro } = await db
    .from("os_registros")
    .upsert([...marcadores, ...novas], { onConflict: "user_id,colecao,id", ignoreDuplicates: true })
    .select("id");
  if (erro) throw new Error(erro.message);
  return { criadas: (inseridas ?? []).filter((r) => r.id !== "__colecao").length };
}
