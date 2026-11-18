import { redirect } from "next/navigation";
import { emailPermitido, supabaseServer, supabaseServico } from "@/lib/supabase";

// O ERP contábil usa as tabelas em inglês do mesmo banco (companies, chart_accounts, journal_entries...).
// A leitura passa pelo servidor com a chave de serviço, depois de conferir que quem pediu está na lista ADMIN_EMAILS.
export async function erpDb() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailPermitido(user.email)) redirect("/admin/login");
  return supabaseServico();
}

export type Empresa = {
  id: string;
  legal_name: string;
  trade_name: string | null;
  cnpj: string | null;
  tax_regime: string | null;
  company_profile: string | null;
  city: string | null;
  state: string | null;
  active: boolean;
  main_cnae: string | null;
  responsible_name: string | null;
};

export const REGIME: Record<string, string> = {
  SIMPLES_NACIONAL: "Simples Nacional",
  LUCRO_PRESUMIDO: "Lucro Presumido",
  LUCRO_REAL: "Lucro Real",
  MEI: "MEI",
  IMUNE_ISENTA: "Imune/isenta",
};

export const PERFIL: Record<string, string> = {
  TRANSPORTATION: "Transporte",
  TRADE: "Comércio",
  SERVICES: "Serviços",
  INDUSTRY: "Indústria",
};

export const TIPO_CONTA: Record<string, string> = {
  ASSET: "Ativo",
  LIABILITY: "Passivo",
  EQUITY: "Patrimônio líquido",
  REVENUE: "Receita",
  REVENUE_DEDUCTION: "Dedução da receita",
  COST: "Custo",
  EXPENSE: "Despesa",
};

export const ORIGEM: Record<string, string> = {
  MANUAL: "Manual",
  PAYROLL_SUMMARY: "Folha",
  BANK_STATEMENT: "Extrato",
  RESULT_CLOSING: "Encerramento",
  REVERSAL: "Estorno",
  FISCAL_DOCUMENT: "Nota fiscal",
  TAX_ASSESSMENT: "Apuração",
};

export const SITUACAO_LANC: Record<string, { texto: string; cor: string }> = {
  DRAFT: { texto: "Rascunho", cor: "amarelo" },
  POSTED: { texto: "Lançado", cor: "verde" },
  REVERSED: { texto: "Estornado", cor: "vermelho" },
};

export const SITUACAO_XML: Record<string, { texto: string; cor: string }> = {
  PENDING_REVIEW: { texto: "A revisar", cor: "amarelo" },
  IMPORTED: { texto: "Importada", cor: "verde" },
  CONFIRMED: { texto: "Confirmada", cor: "verde" },
  DUPLICATE: { texto: "Duplicada", cor: "" },
  ERROR: { texto: "Com erro", cor: "vermelho" },
  REJECTED: { texto: "Recusada", cor: "vermelho" },
};

export const SITUACAO_APURACAO: Record<string, { texto: string; cor: string }> = {
  DRAFT: { texto: "Rascunho", cor: "amarelo" },
  CALCULATED: { texto: "Calculada", cor: "" },
  CLOSED: { texto: "Fechada", cor: "verde" },
};

export function nomeEmpresa(e: Pick<Empresa, "trade_name" | "legal_name">) {
  return e.trade_name?.trim() || e.legal_name;
}

export function cnpj(v: string | null | undefined) {
  const d = (v ?? "").replace(/\D/g, "");
  if (d.length !== 14) return v ?? "";
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function competencia(v: string | null | undefined) {
  if (!v) return "";
  const [a, m] = v.split("-");
  return `${m}/${a}`;
}
