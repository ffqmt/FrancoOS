import { brl, dataBR } from "@/lib/formato";
import { SITUACAO_XML, cnpj } from "@/lib/erp";

export type NotaImportada = {
  id: string;
  company_id: string;
  file_name: string | null;
  access_key: string | null;
  import_status: string;
  created_at: string;
  parsed_preview: {
    documentNumber?: string;
    series?: string;
    issueDate?: string;
    emitName?: string;
    emitCnpj?: string;
    destName?: string;
    destCnpj?: string;
    totalAmount?: number;
    naturezaOperacao?: string;
    items?: { cfop?: string }[];
  } | null;
};

export const SELECT_NOTA = "id, company_id, file_name, access_key, import_status, created_at, parsed_preview";

export function TabelaNotas({ notas, empresas }: { notas: NotaImportada[]; empresas?: Map<string, string> }) {
  return (
    <div className="tabela">
      <table>
        <thead>
          <tr>
            {empresas && <th>Empresa</th>}
            <th>Nota</th>
            <th>Emissão</th>
            <th>Emitente</th>
            <th>Destinatário</th>
            <th>CFOP</th>
            <th>Valor</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((n) => {
            const p = n.parsed_preview ?? {};
            const cfops = [...new Set((p.items ?? []).map((i) => i.cfop).filter(Boolean))].join(", ");
            const s = SITUACAO_XML[n.import_status] ?? { texto: n.import_status, cor: "" };
            return (
              <tr key={n.id}>
                {empresas && (
                  <td>
                    <a href={`/admin/erp/${n.company_id}?aba=notas`}>{empresas.get(n.company_id) ?? "-"}</a>
                  </td>
                )}
                <td title={n.access_key ?? n.file_name ?? ""}>
                  {p.documentNumber ? `${p.documentNumber}${p.series ? `/${p.series}` : ""}` : n.file_name ?? "-"}
                  {p.naturezaOperacao && <div style={{ color: "var(--cinza)", fontSize: ".8rem" }}>{p.naturezaOperacao}</div>}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{p.issueDate ? dataBR(p.issueDate.slice(0, 10)) : "-"}</td>
                <td>
                  {p.emitName ?? "-"}
                  {p.emitCnpj && <div style={{ color: "var(--cinza)", fontSize: ".8rem" }}>{cnpj(p.emitCnpj)}</div>}
                </td>
                <td>
                  {p.destName ?? "-"}
                  {p.destCnpj && <div style={{ color: "var(--cinza)", fontSize: ".8rem" }}>{cnpj(p.destCnpj)}</div>}
                </td>
                <td>{cfops || "-"}</td>
                <td style={{ whiteSpace: "nowrap" }}>{p.totalAmount != null ? brl(p.totalAmount) : "-"}</td>
                <td>
                  <span className={`selo ${s.cor}`}>{s.texto}</span>
                </td>
              </tr>
            );
          })}
          {!notas.length && (
            <tr>
              <td colSpan={empresas ? 8 : 7} style={{ color: "var(--cinza)" }}>
                Nenhuma nota importada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
