import { redirect } from "next/navigation";
import { emailPermitido, supabaseServer } from "@/lib/supabase";
import { sair } from "../login/actions";

export const metadata = { title: "ERP contábil · FrancoOS", robots: { index: false } };

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailPermitido(user.email)) redirect("/admin/login");

  return (
    <div className="admin">
      <aside className="lateral">
        <strong style={{ fontFamily: "var(--titulo)", padding: "0 10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/marca/simbolo-franco.png" alt="" width={28} height={28} /> ERP contábil
        </strong>
        <a href="/admin">← Início</a>
        <a href="/admin/erp">Empresas</a>
        <a href="/admin/erp/notas">Notas importadas</a>
        <a href="/admin/painel">Painel FrancoTech</a>
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
