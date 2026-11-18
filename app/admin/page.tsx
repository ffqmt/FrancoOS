import { brl, hoje } from "@/lib/formato";
import { redirect } from "next/navigation";
import { emailPermitido, supabaseServer, supabaseServico } from "@/lib/supabase";
import { sair } from "./login/actions";

export const metadata = { title: "FrancoOS", robots: { index: false } };
export const dynamic = "force-dynamic";

// Porta de entrada: depois do login, a pessoa escolhe para qual sistema vai.
// O ERP contábil é o app próprio (repositório erpcontabil), com o mesmo login do Supabase.
const ERP_URL = "/erp";
const externos = [
  { nome: "ContAi", texto: "Painel dos escritórios contábeis", link: "https://contai.app.br" },
  { nome: "AUTAX", texto: "Automação fiscal e reforma tributária", link: "https://autax.app.br" },
  { nome: "Medcheck", texto: "Acesso ao Medcheck", link: "https://medcheck.francotech.com.br" },
];

export default async function Inicio() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailPermitido(user.email)) redirect("/admin/login");
  const db = supabaseServico();
  const ref = hoje();

  const [empresas, lancamentos, xmlRevisar, abertos] = await Promise.all([
    db.from("companies").select("id", { count: "exact", head: true }).is("deleted_at", null),
    db.from("journal_entries").select("id", { count: "exact", head: true }),
    db.from("fiscal_xml_imports").select("id", { count: "exact", head: true }).eq("import_status", "PENDING_REVIEW"),
    db.from("os_lancamentos").select("tipo, valor, vencimento").is("pago_em", null),
  ]);

  const emAberto = abertos.data ?? [];
  const aReceber = emAberto.filter((l) => l.tipo === "receber").reduce((s, l) => s + Number(l.valor), 0);
  const atrasadas = emAberto.filter((l) => l.tipo === "pagar" && l.vencimento < ref).length;

  return (
    <main className="inicio container">
      <header className="inicio-topo">
        <strong className="marca">
          <img src="/marca/simbolo-franco.png" alt="" width={32} height={32} /> FrancoOS
        </strong>
        <form action={sair}>
          <button className="botao secundario">Sair</button>
        </form>
      </header>

      <h1>Para onde vamos hoje?</h1>

      <div className="portas">
        <a className="porta" href="/admin/painel">
          <span className="rotulo">Franco Tecnologia</span>
          <strong>Painel FrancoTech</strong>
          <p>CRM, clientes, contratos, financeiro, parceiros e atendimento pelo WhatsApp.</p>
          <div className="porta-numeros">
            <span>
              A receber em aberto <b>{brl(aReceber)}</b>
            </span>
            <span>
              Contas atrasadas <b className={atrasadas ? "vermelho" : ""}>{atrasadas}</b>
            </span>
          </div>
        </a>

        <a className="porta" href={ERP_URL}>
          <span className="rotulo">Escritório contábil</span>
          <strong>ERP contábil</strong>
          <p>Contabilidade, fiscal e SPED, bancos, folha, patrimônio, obrigações e automações. Mesmo login do FrancoOS.</p>
          <div className="porta-numeros">
            <span>
              Empresas <b>{empresas.count ?? 0}</b>
            </span>
            <span>
              Lançamentos <b>{lancamentos.count ?? 0}</b>
            </span>
            <span>
              Notas a revisar <b className={xmlRevisar.count ? "amarelo" : ""}>{xmlRevisar.count ?? 0}</b>
            </span>
          </div>
        </a>
      </div>

      <h2 className="inicio-sub">Atalhos</h2>
      <div className="acessos">
        <a className="acesso" href="/admin/contas">
          <strong>Contas com lembrete</strong>
          <span>A pagar, a receber e credores</span>
        </a>
        {externos.map((f) => (
          <a className="acesso" key={f.nome} href={f.link} target="_blank" rel="noopener noreferrer">
            <strong>{f.nome}</strong>
            <span>{f.texto}</span>
            <span className="acesso-seta" aria-hidden>
              ↗
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
