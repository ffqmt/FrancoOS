"use server";

import { revalidatePath } from "next/cache";
import { hoje } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase";

function texto(dados: FormData, campo: string) {
  const v = String(dados.get(campo) ?? "").trim();
  return v || null;
}

export async function criarLancamento(dados: FormData) {
  const tipo = dados.get("tipo") === "receber" ? "receber" : "pagar";
  const valor = Number(String(dados.get("valor") ?? "0").replace(/\./g, "").replace(",", "."));
  const vencimento = String(dados.get("vencimento") ?? "");
  const repetir = Math.min(Math.max(Number(dados.get("repetir") ?? 1) || 1, 1), 36);
  const descricao = texto(dados, "descricao");
  if (!descricao || !vencimento || !Number.isFinite(valor)) return;

  // Parcelas ou recorrência mensal: cria um lançamento por mês.
  const linhas = Array.from({ length: repetir }, (_, i) => {
    const d = new Date(`${vencimento}T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + i);
    return {
      tipo,
      descricao: repetir > 1 ? `${descricao} (${i + 1}/${repetir})` : descricao,
      contraparte: texto(dados, "contraparte"),
      categoria: texto(dados, "categoria"),
      observacao: texto(dados, "observacao"),
      valor,
      vencimento: d.toISOString().slice(0, 10),
    };
  });

  const supabase = await supabaseServer();
  await supabase.from("lancamentos").insert(linhas);
  revalidatePath("/admin", "layout");
}

export async function marcarPago(dados: FormData) {
  const supabase = await supabaseServer();
  const pago = dados.get("pago") === "1";
  await supabase
    .from("lancamentos")
    .update({ pago_em: pago ? hoje() : null })
    .eq("id", String(dados.get("id")));
  revalidatePath("/admin", "layout");
}

export async function apagarLancamento(dados: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("lancamentos").delete().eq("id", String(dados.get("id")));
  revalidatePath("/admin", "layout");
}
