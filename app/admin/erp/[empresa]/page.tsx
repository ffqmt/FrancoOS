import { notFound } from "next/navigation";
import { brl, dataBR } from "@/lib/formato";
import {
  ORIGEM,
  PERFIL,
  REGIME,
  SITUACAO_APURACAO,
  SITUACAO_LANC,
  TIPO_CONTA,
  cnpj,
  competencia,
  erpDb,
  nomeEmpresa,
} from "@/lib/erp";
import { SELECT_NOTA, TabelaNotas, type NotaImportada } from "../TabelaNotas";

export const dynamic = "force-dynamic";

const ABAS = [
  { id: "resumo", nome: "Resumo" },
  { id: "contas", nome: "Plano de contas" },
  { id: "lancamentos", nome: "Lançamentos" },
  { id: "notas", nome: "Notas importadas" },
  { id: "apuracoes", nome: "Apurações" },
] as const;

type Conta = {
  id: string;
  code: string;
  name: string;
  account_type: string;
  level: number | null;
  is_synthetic: boolean;
  accepts_entries: boolean;
  is_active: boolean;
};

type Linha = { debit_credit: "DEBIT" | "CREDIT"; amount: number; memo: string | null; account: { code: string; name: string } | null };

type Lanc = {
  id: string;
  number: number | null;
  entry_date: string;
  competence: string | null;
  description: string | null;
  document: string | null;
  origin: string;
  status: string;
  lines: Linha[];
};

type Apuracao = {
  id: string;
  tax_type: string;
  competence: string | null;
  base_amount: number | null;
  amount_due: number | null;
  payable_amount: number | null;
  due_date: string | null;
  status: string;
};

export default async function EmpresaErp({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ aba?: string; q?: string }>;
}) {
  const { empresa: id } = await params;
  const { aba = "resumo", q = "" } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await erpDb();

  const { data: e } = await db.from("companies").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();

  const [nContas, nLancs, nNotas, nApur] = await Promise.all([
    db.from("chart_accounts").select("id", { count: "exact", head: true }).eq("company_id", id).is("deleted_at", null),
    db.from("journal_entries").select("id", { count: "exact", head: true }).eq("company_id", id),
    db.from("fiscal_xml_imports").select("id", { count: "exact", head: true }).eq("company_id", id),
    db.from("tax_assessments").select("id", { count: "exact", head: true }).eq("company_id", id),
  ]);
  const contagem: Record<string, number | null> = {
    contas: nContas.count,
    lancamentos: nLancs.count,
    notas: nNotas.count,
    apuracoes: nApur.count,
  };

  return (
    <>
      <p style={{ margin: "0 0 4px" }}>
        <a href="/admin/erp">← Empresas</a>
      </p>
      <h1 style={{ marginBottom: 4 }}>{nomeEmpresa(e)}</h1>
      <p style={{ color: "var(--cinza)", marginTop: 0 }}>
        {cnpj(e.cnpj)} · {REGIME[e.tax_regime] ?? e.tax_regime ?? "regime não informado"}
        {e.city ? ` · ${e.city}/${e.state ?? ""}` : ""}
      </p>

      <nav className="filtros">
        {ABAS.map((a) => (
          <a
            key={a.id}
            href={`/admin/erp/${id}?aba=${a.id}`}
            style={aba === a.id ? { borderColor: "var(--destaque)", color: "var(--texto)" } : undefined}
          >
            {a.nome}
            {contagem[a.id] != null ? ` (${contagem[a.id]})` : ""}
          </a>
        ))}
      </nav>

      {aba === "resumo" && <Resumo empresa={e} contagem={contagem} db={db} id={id} />}
      {aba === "contas" && <PlanoContas db={db} id={id} q={q} />}
      {aba === "lancamentos" && <Lancamentos db={db} id={id} />}
      {aba === "notas" && <NotasEmpresa db={db} id={id} />}
      {aba === "apuracoes" && <Apuracoes db={db} id={id} />}
    </>
  );
}

type Db = Awaited<ReturnType<typeof erpDb>>;

async function Resumo({
  empresa: e,
  contagem,
  db,
  id,
}: {
  empresa: Record<string, string | null>;
  contagem: Record<string, number | null>;
  db: Db;
  id: string;
}) {
  const { data: estab } = await db
    .from("establishments")
    .select("id, name, trade_name, cnpj, city, state, type, active")
    .eq("company_id", id)
    .is("deleted_at", null);

  const dados: [string, string | null | undefined][] = [
    ["Razão social", e.legal_name],
    ["Nome fantasia", e.trade_name],
    ["CNPJ", cnpj(e.cnpj)],
    ["Regime", REGIME[e.tax_regime ?? ""] ?? e.tax_regime],
    ["Atividade", PERFIL[e.company_profile ?? ""] ?? e.company_profile],
    ["CNAE principal", e.main_cnae],
    ["Inscrição estadual", e.state_registration],
    ["Inscrição municipal", e.municipal_registration],
    ["Abertura", e.incorporation_date ? dataBR(e.incorporation_date) : null],
    ["Responsável", [e.responsible_name, e.responsible_role].filter(Boolean).join(" · ")],
  ];

  return (
    <>
      <div className="numeros">
        <div className="numero">
          <span>Contas no plano</span>
          <strong>{contagem.contas ?? 0}</strong>
        </div>
        <div className="numero">
          <span>Lançamentos</span>
          <strong>{contagem.lancamentos ?? 0}</strong>
        </div>
        <div className="numero">
          <span>Notas importadas</span>
          <strong>{contagem.notas ?? 0}</strong>
        </div>
        <div className="numero">
          <span>Apurações</span>
          <strong>{contagem.apuracoes ?? 0}</strong>
        </div>
      </div>

      <div className="cartao" style={{ marginBottom: 24 }}>
        <dl className="ficha">
          {dados.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt>{rotulo}</dt>
              <dd>{valor || "-"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <h2 style={{ fontSize: "1.1rem" }}>Estabelecimentos</h2>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Tipo</th>
              <th>Cidade</th>
            </tr>
          </thead>
          <tbody>
            {(estab ?? []).map((s) => (
              <tr key={s.id}>
                <td>{s.trade_name || s.name || "-"}</td>
                <td>{cnpj(s.cnpj)}</td>
                <td>{s.type === "HEADQUARTERS" ? "Matriz" : s.type === "BRANCH" ? "Filial" : s.type}</td>
                <td>{[s.city, s.state].filter(Boolean).join("/") || "-"}</td>
              </tr>
            ))}
            {!estab?.length && (
              <tr>
                <td colSpan={4} style={{ color: "var(--cinza)" }}>
                  Nenhum estabelecimento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function PlanoContas({ db, id, q }: { db: Db; id: string; q: string }) {
  const { data, error } = await db
    .from("chart_accounts")
    .select("id, code, name, account_type, level, is_synthetic, accepts_entries, is_active")
    .eq("company_id", id)
    .is("deleted_at", null)
    .order("code")
    .limit(2000);
  if (error) return <p className="vermelho">Não consegui ler o plano de contas: {error.message}</p>;

  const busca = q.trim().toLowerCase();
  const contas = ((data ?? []) as Conta[]).filter((c) => !busca || `${c.code} ${c.name}`.toLowerCase().includes(busca));

  return (
    <>
      <form className="filtros" style={{ alignItems: "center" }}>
        <input type="hidden" name="aba" value="contas" />
        <input name="q" defaultValue={q} placeholder="Buscar conta por código ou nome" style={{ minWidth: 280 }} />
        <button className="botao secundario">Buscar</button>
      </form>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Conta</th>
              <th>Tipo</th>
              <th>Recebe lançamento</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((c) => (
              <tr key={c.id} style={{ opacity: c.is_active ? 1 : 0.5 }}>
                <td style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{c.code}</td>
                <td style={{ paddingLeft: 8 + Math.max(0, (c.level ?? 1) - 1) * 16, fontWeight: c.is_synthetic ? 600 : 400 }}>
                  {c.name}
                </td>
                <td>{TIPO_CONTA[c.account_type] ?? c.account_type}</td>
                <td>{c.accepts_entries ? "Sim" : "Não"}</td>
              </tr>
            ))}
            {!contas.length && (
              <tr>
                <td colSpan={4} style={{ color: "var(--cinza)" }}>
                  Nenhuma conta {busca ? "encontrada" : "no plano desta empresa"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function Lancamentos({ db, id }: { db: Db; id: string }) {
  const { data, error } = await db
    .from("journal_entries")
    .select(
      "id, number, entry_date, competence, description, document, origin, status, lines:journal_entry_lines(debit_credit, amount, memo, account:chart_accounts(code, name))",
    )
    .eq("company_id", id)
    .order("entry_date", { ascending: false })
    .order("number", { ascending: false })
    .limit(300);
  if (error) return <p className="vermelho">Não consegui ler os lançamentos: {error.message}</p>;
  const lancs = (data ?? []) as unknown as Lanc[];

  if (!lancs.length) return <p style={{ color: "var(--cinza)" }}>Nenhum lançamento nesta empresa.</p>;

  return (
    <div className="lancamentos-erp">
      {lancs.map((l) => {
        const s = SITUACAO_LANC[l.status] ?? { texto: l.status, cor: "" };
        const total = l.lines.filter((x) => x.debit_credit === "DEBIT").reduce((t, x) => t + Number(x.amount), 0);
        return (
          <details key={l.id} className="cartao lanc">
            <summary>
              <span className="lanc-num">#{l.number ?? "-"}</span>
              <span style={{ whiteSpace: "nowrap" }}>{dataBR(l.entry_date)}</span>
              <span className="lanc-desc">
                {l.description || "(sem histórico)"}
                {l.document && <small> · doc. {l.document}</small>}
              </span>
              <span style={{ color: "var(--cinza)", fontSize: ".85rem" }}>{ORIGEM[l.origin] ?? l.origin}</span>
              <strong style={{ whiteSpace: "nowrap" }}>{brl(total)}</strong>
              <span className={`selo ${s.cor}`}>{s.texto}</span>
            </summary>
            <table style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Conta</th>
                  <th style={{ textAlign: "right" }}>Débito</th>
                  <th style={{ textAlign: "right" }}>Crédito</th>
                  <th>Complemento</th>
                </tr>
              </thead>
              <tbody>
                {l.lines.map((x, i) => (
                  <tr key={i}>
                    <td>{x.account ? `${x.account.code} · ${x.account.name}` : "-"}</td>
                    <td style={{ textAlign: "right" }}>{x.debit_credit === "DEBIT" ? brl(x.amount) : ""}</td>
                    <td style={{ textAlign: "right" }}>{x.debit_credit === "CREDIT" ? brl(x.amount) : ""}</td>
                    <td style={{ color: "var(--cinza)" }}>{x.memo ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {l.competence && (
              <p style={{ color: "var(--cinza)", fontSize: ".85rem", margin: "8px 0 0" }}>Competência {competencia(l.competence)}</p>
            )}
          </details>
        );
      })}
    </div>
  );
}

async function NotasEmpresa({ db, id }: { db: Db; id: string }) {
  const { data, error } = await db
    .from("fiscal_xml_imports")
    .select(SELECT_NOTA)
    .eq("company_id", id)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return <p className="vermelho">Não consegui ler as notas: {error.message}</p>;
  return <TabelaNotas notas={(data ?? []) as NotaImportada[]} />;
}

async function Apuracoes({ db, id }: { db: Db; id: string }) {
  const { data, error } = await db
    .from("tax_assessments")
    .select("id, tax_type, competence, base_amount, amount_due, payable_amount, due_date, status")
    .eq("company_id", id)
    .order("competence", { ascending: false });
  if (error) return <p className="vermelho">Não consegui ler as apurações: {error.message}</p>;
  const lista = (data ?? []) as Apuracao[];

  return (
    <div className="tabela">
      <table>
        <thead>
          <tr>
            <th>Tributo</th>
            <th>Competência</th>
            <th style={{ textAlign: "right" }}>Base</th>
            <th style={{ textAlign: "right" }}>Devido</th>
            <th style={{ textAlign: "right" }}>A pagar</th>
            <th>Vencimento</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((a) => {
            const s = SITUACAO_APURACAO[a.status] ?? { texto: a.status, cor: "" };
            return (
              <tr key={a.id}>
                <td>{a.tax_type}</td>
                <td>{competencia(a.competence)}</td>
                <td style={{ textAlign: "right" }}>{a.base_amount != null ? brl(a.base_amount) : "-"}</td>
                <td style={{ textAlign: "right" }}>{a.amount_due != null ? brl(a.amount_due) : "-"}</td>
                <td style={{ textAlign: "right" }}>{a.payable_amount != null ? brl(a.payable_amount) : "-"}</td>
                <td>{a.due_date ? dataBR(a.due_date) : "-"}</td>
                <td>
                  <span className={`selo ${s.cor}`}>{s.texto}</span>
                </td>
              </tr>
            );
          })}
          {!lista.length && (
            <tr>
              <td colSpan={7} style={{ color: "var(--cinza)" }}>
                Nenhuma apuração nesta empresa.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
