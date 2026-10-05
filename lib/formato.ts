export type Lancamento = {
  id: string;
  tipo: "pagar" | "receber";
  descricao: string;
  contraparte: string | null;
  categoria: string | null;
  valor: number;
  vencimento: string;
  pago_em: string | null;
  observacao: string | null;
  contato_id: string | null;
  origem_id: string | null;
  contato?: { nome: string } | null;
  origem?: { pago_em: string | null; descricao: string } | null;
};

export type Contato = {
  id: string;
  nome: string;
  papel: string;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  pix: string | null;
  comissao_percentual: number | null;
  observacao: string | null;
  ativo: boolean;
};

export const PAPEIS = ["credor", "parceiro", "indicador", "cliente", "fornecedor", "prestador", "outro"] as const;

// Lançamento com o nome do contato e, no caso de repasse, o recebimento que o origina.
export const SELECT_LANCAMENTO =
  "*, contato:os_contatos(nome), origem:os_lancamentos!os_lancamentos_origem_id_fkey(pago_em, descricao)";

export const nomeContraparte = (l: Lancamento) => l.contato?.nome ?? l.contraparte ?? "-";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (v: number) => moeda.format(Number(v));

// Data de hoje no fuso de Brasília, no formato AAAA-MM-DD.
export function hoje() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function dataBR(data: string) {
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

export function situacao(l: Lancamento, ref = hoje()) {
  if (l.pago_em) return l.tipo === "pagar" ? "paga" : "recebida";
  if (l.origem && !l.origem.pago_em) return "aguardando recebimento";
  if (l.vencimento < ref) return "atrasada";
  if (l.vencimento === ref) return "vence hoje";
  return "em aberto";
}
