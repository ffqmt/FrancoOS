"use server";

import { revalidatePath } from "next/cache";
import { hoje } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase";

function texto(dados: FormData, campo: string) {
  const v = String(dados.get(campo) ?? "").trim();
  return v || null;
}

function numero(dados: FormData, campo: string) {
  const v = String(dados.get(campo) ?? "").trim();
  if (!v) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function somarMeses(data: string, meses: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d.toISOString().slice(0, 10);
}

export async function criarLancamento(dados: FormData) {
  const tipo = dados.get("tipo") === "receber" ? "receber" : "pagar";
  const valor = numero(dados, "valor");
  const vencimento = String(dados.get("vencimento") ?? "");
  const repetir = Math.min(Math.max(Number(dados.get("repetir") ?? 1) || 1, 1), 36);
  const descricao = texto(dados, "descricao");
  if (!descricao || !vencimento || valor === null) return;

  const contatoId = texto(dados, "contato_id");
  const parceiroId = tipo === "receber" ? texto(dados, "parceiro_id") : null;
  const percentual = numero(dados, "repasse_percentual");

  // Parcelas ou recorrência mensal: cria um lançamento por mês.
  const linhas = Array.from({ length: repetir }, (_, i) => ({
    tipo,
    descricao: repetir > 1 ? `${descricao} (${i + 1}/${repetir})` : descricao,
    contato_id: contatoId,
    categoria: texto(dados, "categoria"),
    observacao: texto(dados, "observacao"),
    valor,
    vencimento: somarMeses(vencimento, i),
  }));

  const supabase = await supabaseServer();
  const { data: criados } = await supabase.from("os_lancamentos").insert(linhas).select("id, descricao, valor, vencimento");

  // Repasse ao parceiro: uma conta a pagar por recebimento, liberada quando o cliente pagar.
  if (parceiroId && percentual && criados?.length) {
    await supabase.from("os_lancamentos").insert(
      criados.map((r) => ({
        tipo: "pagar",
        descricao: `Repasse ${percentual}%: ${r.descricao}`,
        contato_id: parceiroId,
        categoria: "repasse",
        valor: Math.round(Number(r.valor) * percentual) / 100,
        vencimento: r.vencimento,
        origem_id: r.id,
      })),
    );
  }

  revalidatePath("/admin", "layout");
}

export async function marcarPago(dados: FormData) {
  const supabase = await supabaseServer();
  const pago = dados.get("pago") === "1";
  await supabase
    .from("os_lancamentos")
    .update({ pago_em: pago ? hoje() : null })
    .eq("id", String(dados.get("id")));
  revalidatePath("/admin", "layout");
}

export async function apagarLancamento(dados: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("os_lancamentos").delete().eq("id", String(dados.get("id")));
  revalidatePath("/admin", "layout");
}
