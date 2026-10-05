"use client";

import { useActionState } from "react";
import { entrar } from "./actions";

export default function Login() {
  const [erro, acao, enviando] = useActionState(entrar, null);
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
        <button className="botao" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
