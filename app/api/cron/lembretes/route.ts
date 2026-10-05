import { Resend } from "resend";
import { brl, dataBR, hoje, somarDias } from "@/lib/formato";
import { gerarMensalidades } from "@/lib/mensalidades";
import { supabaseServico } from "@/lib/supabase";

// Roda todo dia (vercel.json): cria as mensalidades do mês pelos contratos e manda um e-mail
// com o que vence nos próximos dias e o que atrasou, lendo os dados do painel (os_registros).

type Baixa = { valor: number };
type Item = { tipo: "Receber" | "Pagar"; vencimento: string; descricao: string; quem: string; valor: number };

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  const db = supabaseServico();
  const ref = hoje();
  const dias = Number(process.env.LEMBRETE_DIAS_ANTES ?? 3);
  const limite = somarDias(ref, dias);
  const { criadas } = await gerarMensalidades(db, ref);

  const { data, error } = await db
    .from("os_registros")
    .select("colecao, id, dados, user_id")
    .in("colecao", ["fos_transactions", "fos_payables", "fos_clients"])
    .neq("id", "__colecao");
  if (error) return Response.json({ erro: error.message }, { status: 500 });

  const linhas = (data ?? []) as { colecao: string; id: string; dados: Record<string, unknown>; user_id: string }[];
  const nomeCliente = new Map(linhas.filter((l) => l.colecao === "fos_clients").map((l) => [l.id, String(l.dados.name ?? "")]));
  const falta = (total: number, baixas?: Baixa[]) => total - (baixas ?? []).reduce((s, b) => s + b.valor, 0);

  const itens: Item[] = [];
  for (const l of linhas) {
    const d = l.dados as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (l.colecao === "fos_transactions" && d.type === "income" && d.status !== "paid" && d.dueDate && d.dueDate <= limite) {
      const valor = falta(Number(d.amount), d.baixas);
      if (valor > 0.005) itens.push({ tipo: "Receber", vencimento: d.dueDate, descricao: d.description, quem: nomeCliente.get(d.clientId) ?? "", valor });
    }
    if (l.colecao === "fos_payables" && d.status !== "pago" && d.status !== "cancelado" && d.vencimento && d.vencimento <= limite) {
      const valor = falta(Number(d.valor), d.baixas);
      if (valor > 0.005) itens.push({ tipo: "Pagar", vencimento: d.vencimento, descricao: d.descricao, quem: d.favorecido ?? "", valor });
    }
  }
  itens.sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  if (itens.length === 0) return Response.json({ enviados: 0, mensalidadesCriadas: criadas });

  const linhasHtml = itens
    .map(
      (i) =>
        `<tr><td>${dataBR(i.vencimento)}</td><td>${i.tipo}</td>` +
        `<td>${escapar(i.descricao)}${i.quem ? ` · ${escapar(i.quem)}` : ""}</td>` +
        `<td>${brl(i.valor)}</td><td>${i.vencimento < ref ? "Atrasada" : i.vencimento === ref ? "Vence hoje" : "A vencer"}</td></tr>`,
    )
    .join("");
  const atrasados = itens.filter((i) => i.vencimento < ref).length;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: erroEnvio } = await resend.emails.send({
    from: process.env.LEMBRETE_REMETENTE!,
    to: process.env.LEMBRETE_DESTINO!.split(",").map((e) => e.trim()),
    subject: `FrancoOS: ${itens.length} conta(s) vencendo${atrasados ? `, ${atrasados} atrasada(s)` : ""}`,
    html:
      (criadas ? `<p>${criadas} mensalidade(s) nova(s) criada(s) pelos contratos.</p>` : "") +
      `<p>Contas em aberto até ${dataBR(limite)}:</p>` +
      `<table cellpadding="6" border="1" style="border-collapse:collapse">` +
      `<tr><th>Vencimento</th><th>Tipo</th><th>Descrição</th><th>Falta</th><th>Situação</th></tr>${linhasHtml}</table>` +
      `<p><a href="https://admin.francotech.com.br">Abrir o painel</a></p>`,
  });
  if (erroEnvio) return Response.json({ erro: erroEnvio.message }, { status: 500 });

  return Response.json({ enviados: itens.length, mensalidadesCriadas: criadas });
}

function escapar(t: string) {
  return String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
