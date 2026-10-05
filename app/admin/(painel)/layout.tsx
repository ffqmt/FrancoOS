import { redirect } from "next/navigation";
import { emailPermitido, supabaseServer } from "@/lib/supabase";
import { sair } from "../login/actions";

export const metadata = { title: "FrancoOS", robots: { index: false } };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailPermitido(user.email)) redirect("/admin/login");

  return (
    <div className="admin">
      <aside className="lateral">
        <strong style={{ fontFamily: "var(--titulo)", padding: "0 10px 12px" }}>FrancoOS</strong>
        <a href="/admin">Resumo</a>
        <a href="/admin/lancamentos?tipo=pagar">A pagar</a>
        <a href="/admin/lancamentos?tipo=receber">A receber</a>
        <a href="/admin/contatos">Parceiros e credores</a>
        <span className="em-breve">Contratos (em breve)</span>
        <span className="em-breve">Tarefas (em breve)</span>
        <form action={sair} style={{ marginTop: "auto" }}>
          <button className="botao secundario" style={{ width: "100%" }}>
            Sair
          </button>
        </form>
      </aside>
      <main className="conteudo">{children}</main>
    </div>
  );
}
