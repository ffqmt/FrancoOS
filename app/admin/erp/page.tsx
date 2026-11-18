import { PERFIL, REGIME, cnpj, erpDb, nomeEmpresa, type Empresa } from "@/lib/erp";

export const dynamic = "force-dynamic";

function contar(lista: { company_id: string }[] | null) {
  const m = new Map<string, number>();
  for (const r of lista ?? []) m.set(r.company_id, (m.get(r.company_id) ?? 0) + 1);
  return m;
}

export default async function Empresas({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const db = await erpDb();

  const [{ data: empresas, error }, contas, lancs, notas] = await Promise.all([
    db
      .from("companies")
      .select("id, legal_name, trade_name, cnpj, tax_regime, company_profile, city, state, active, main_cnae, responsible_name")
      .is("deleted_at", null)
      .order("legal_name"),
    db.from("chart_accounts").select("company_id").is("deleted_at", null),
    db.from("journal_entries").select("company_id"),
    db.from("fiscal_xml_imports").select("company_id"),
  ]);

  if (error) return <p className="vermelho">Não consegui ler as empresas: {error.message}</p>;

  const nContas = contar(contas.data);
  const nLancs = contar(lancs.data);
  const nNotas = contar(notas.data);
  const busca = q.trim().toLowerCase();
  const lista = ((empresas ?? []) as Empresa[]).filter(
    (e) => !busca || `${e.legal_name} ${e.trade_name ?? ""} ${e.cnpj ?? ""}`.toLowerCase().includes(busca),
  );

  return (
    <>
      <h1>Empresas</h1>
      <div className="numeros">
        <div className="numero">
          <span>Empresas</span>
          <strong>{empresas?.length ?? 0}</strong>
        </div>
        <div className="numero">
          <span>Lançamentos</span>
          <strong>{lancs.data?.length ?? 0}</strong>
        </div>
        <div className="numero">
          <span>Notas importadas</span>
          <strong>{notas.data?.length ?? 0}</strong>
        </div>
      </div>

      <form className="filtros" style={{ alignItems: "center" }}>
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou CNPJ" style={{ minWidth: 280 }} />
        <button className="botao secundario">Buscar</button>
      </form>

      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>CNPJ</th>
              <th>Regime</th>
              <th>Atividade</th>
              <th>Cidade</th>
              <th>Contas</th>
              <th>Lançamentos</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={e.id}>
                <td>
                  <a href={`/admin/erp/${e.id}`}>{nomeEmpresa(e)}</a>
                  {e.trade_name && e.trade_name !== e.legal_name && (
                    <div style={{ color: "var(--cinza)", fontSize: ".8rem" }}>{e.legal_name}</div>
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{cnpj(e.cnpj)}</td>
                <td>{REGIME[e.tax_regime ?? ""] ?? e.tax_regime ?? "-"}</td>
                <td>{PERFIL[e.company_profile ?? ""] ?? e.company_profile ?? "-"}</td>
                <td>{[e.city, e.state].filter(Boolean).join("/") || "-"}</td>
                <td>{nContas.get(e.id) ?? 0}</td>
                <td>{nLancs.get(e.id) ?? 0}</td>
                <td>{nNotas.get(e.id) ?? 0}</td>
              </tr>
            ))}
            {!lista.length && (
              <tr>
                <td colSpan={8} style={{ color: "var(--cinza)" }}>
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
