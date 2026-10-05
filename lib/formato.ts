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
};

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
  if (l.vencimento < ref) return "atrasada";
  if (l.vencimento === ref) return "vence hoje";
  return "em aberto";
}
