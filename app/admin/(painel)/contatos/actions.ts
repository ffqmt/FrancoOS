"use server";

import { revalidatePath } from "next/cache";
import { PAPEIS } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase";

function texto(dados: FormData, campo: string) {
  const v = String(dados.get(campo) ?? "").trim();
  return v || null;
}

export async function criarContato(dados: FormData) {
  const nome = texto(dados, "nome");
  if (!nome) return;
  const papel = PAPEIS.find((p) => p === dados.get("papel")) ?? "outro";
  const comissao = Number(String(dados.get("comissao_percentual") ?? "").replace(",", "."));

  const supabase = await supabaseServer();
  await supabase.from("os_contatos").insert({
    nome,
    papel,
    documento: texto(dados, "documento"),
    telefone: texto(dados, "telefone"),
    email: texto(dados, "email"),
    origem: texto(dados, "origem"),
    pix: texto(dados, "pix"),
    comissao_percentual: comissao > 0 ? comissao : null,
    observacao: texto(dados, "observacao"),
  });
  revalidatePath("/admin", "layout");
}

export async function arquivarContato(dados: FormData) {
  const supabase = await supabaseServer();
  await supabase.from("os_contatos").update({ ativo: false }).eq("id", String(dados.get("id")));
  revalidatePath("/admin", "layout");
}
