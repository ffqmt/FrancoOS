import { Resend } from "resend";
import { brl, dataBR, hoje, situacao, somarDias, type Lancamento } from "@/lib/formato";
import { supabaseServico } from "@/lib/supabase";

// Roda todo dia (vercel.json) e manda um e-mail com o que vence nos próximos dias e o que atrasou.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  const ref = hoje();
  const dias = Number(process.env.LEMBRETE_DIAS_ANTES ?? 3);
  const { data, error } = await supabaseServico()
    .from("lancamentos")
    .select("*")
    .is("pago_em", null)
    .lte("vencimento", somarDias(ref, dias))
    .order("vencimento");
  if (error) return Response.json({ erro: error.message }, { status: 500 });

  const itens = (data ?? []) as Lancamento[];
  if (itens.length === 0) return Response.json({ enviados: 0 });

  const linhas = itens
    .map(
      (l) =>
        `<tr><td>${dataBR(l.vencimento)}</td><td>${l.tipo === "pagar" ? "Pagar" : "Receber"}</td>` +
        `<td>${escapar(l.descricao)}${l.contraparte ? ` · ${escapar(l.contraparte)}` : ""}</td>` +
        `<td>${brl(l.valor)}</td><td>${situacao(l, ref)}</td></tr>`,
    )
    .join("");
  const atrasados = itens.filter((l) => l.vencimento < ref).length;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: erroEnvio } = await resend.emails.send({
    from: process.env.LEMBRETE_REMETENTE!,
    to: process.env.LEMBRETE_DESTINO!.split(",").map((e) => e.trim()),
    subject: `FrancoOS: ${itens.length} conta(s) vencendo${atrasados ? `, ${atrasados} atrasada(s)` : ""}`,
    html:
      `<p>Contas em aberto até ${dataBR(somarDias(ref, dias))}:</p>` +
      `<table cellpadding="6" border="1" style="border-collapse:collapse">` +
      `<tr><th>Vencimento</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Situação</th></tr>${linhas}</table>` +
      `<p><a href="https://admin.francotech.com.br">Abrir o painel</a></p>`,
  });
  if (erroEnvio) return Response.json({ erro: erroEnvio.message }, { status: 500 });

  return Response.json({ enviados: itens.length });
}

function escapar(t: string) {
  return t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
