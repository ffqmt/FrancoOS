"use client";

import { useEffect, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase-navegador";

// Página aberta pelo link de "Esqueci a senha": troca o código do e-mail por uma sessão e grava a senha nova.
export default function NovaSenha() {
  const [pronto, setPronto] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const supabase = supabaseNavegador();
    const codigo = new URLSearchParams(window.location.search).get("code");
    const sessao = codigo ? supabase.auth.exchangeCodeForSession(codigo) : supabase.auth.getSession();
    sessao.then(({ data, error }) => {
      if (error || !data.session) setMensagem("O link expirou ou já foi usado. Volte ao login e peça outro.");
      else setPronto(true);
    });
  }, []);

  async function salvar(dados: FormData) {
    const senha = String(dados.get("senha") ?? "");
    if (senha.length < 8) return setMensagem("Use pelo menos 8 caracteres.");
    if (senha !== dados.get("confirmar")) return setMensagem("As duas senhas não são iguais.");
    setSalvando(true);
    const { error } = await supabaseNavegador().auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) return setMensagem(`Não consegui salvar: ${error.message}`);
    window.location.href = "/admin";
  }

  return (
    <main className="login">
      <form action={salvar}>
        <img src="/marca/logo-franco.png" alt="Franco Tecnologia" className="login-logo" />
        {pronto ? (
          <>
            <label>
              Nova senha
              <input name="senha" type="password" required autoComplete="new-password" />
            </label>
            <label>
              Repita a senha
              <input name="confirmar" type="password" required autoComplete="new-password" />
            </label>
            <button className="botao" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar e entrar"}
            </button>
          </>
        ) : (
          !mensagem && <p className="aviso">Conferindo o link…</p>
        )}
        {mensagem && <p className="erro">{mensagem}</p>}
        {!pronto && mensagem && <a href="/admin/login">Voltar ao login</a>}
      </form>
    </main>
  );
}
