import { SITUACAO_XML, erpDb, nomeEmpresa } from "@/lib/erp";
import { SELECT_NOTA, TabelaNotas, type NotaImportada } from "../TabelaNotas";

export const dynamic = "force-dynamic";

export default async function Notas({ searchParams }: { searchParams: Promise<{ situacao?: string }> }) {
  const { situacao = "" } = await searchParams;
  const db = await erpDb();

  let consulta = db.from("fiscal_xml_imports").select(SELECT_NOTA).order("created_at", { ascending: false }).limit(500);
  if (situacao) consulta = consulta.eq("import_status", situacao);

  const [{ data: notas, error }, { data: empresas }, { data: todas }] = await Promise.all([
    consulta,
    db.from("companies").select("id, legal_name, trade_name"),
    db.from("fiscal_xml_imports").select("import_status"),
  ]);
  if (error) return <p className="vermelho">Não consegui ler as notas: {error.message}</p>;

  const nomes = new Map((empresas ?? []).map((e) => [e.id as string, nomeEmpresa(e)]));
  const porSituacao = new Map<string, number>();
  for (const n of todas ?? []) porSituacao.set(n.import_status, (porSituacao.get(n.import_status) ?? 0) + 1);

  return (
    <>
      <h1>Notas importadas</h1>
      <div className="filtros">
        <a href="/admin/erp/notas" style={!situacao ? { borderColor: "var(--destaque)", color: "var(--texto)" } : undefined}>
          Todas ({todas?.length ?? 0})
        </a>
        {[...porSituacao].map(([s, n]) => (
          <a
            key={s}
            href={`/admin/erp/notas?situacao=${s}`}
            style={situacao === s ? { borderColor: "var(--destaque)", color: "var(--texto)" } : undefined}
          >
            {SITUACAO_XML[s]?.texto ?? s} ({n})
          </a>
        ))}
      </div>
      <TabelaNotas notas={(notas ?? []) as NotaImportada[]} empresas={nomes} />
    </>
  );
}
