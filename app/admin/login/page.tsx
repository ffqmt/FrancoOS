"use client";

import { useActionState, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase-navegador";
import { entrar } from "./actions";

export default function Login() {
  const [erro, acao, enviando] = useActionState(entrar, null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Manda um link para criar uma senha nova; o link volta para /admin/nova-senha.
  async function esqueci(form: HTMLFormElement) {
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) return setAviso("Digite o seu e-mail acima e clique de novo.");
    const { error } = await supabaseNavegador().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/nova-senha`,
    });
    setAviso(error ? `Não consegui enviar: ${error.message}` : "Enviei um link para o seu e-mail. Abra neste mesmo navegador.");
  }
  return (
    <main className="login">
      <form action={acao}>
        <img src="/marca/logo-franco.png" alt="Franco Tecnologia" className="login-logo" />
        <label>
          E-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Senha
          <input name="senha" type="password" required autoComplete="current-password" />
        </label>
        {erro && <p className="erro">{erro}</p>}
        {aviso && <p className="aviso">{aviso}</p>}
        <button className="botao" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
        <button type="button" className="link" onClick={(e) => esqueci(e.currentTarget.form!)}>
          Esqueci a senha / criar senha
        </button>
      </form>
    </main>
  );
}
