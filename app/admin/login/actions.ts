"use server";

import { redirect } from "next/navigation";
import { emailPermitido, supabaseServer } from "@/lib/supabase";

export async function entrar(_estado: string | null, dados: FormData) {
  const email = String(dados.get("email") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");
  if (!emailPermitido(email)) return "Este e-mail não tem acesso ao painel.";

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return "E-mail ou senha incorretos.";
  redirect("/admin");
}

export async function sair() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
