import { brl, dataBR, situacao, type Lancamento } from "@/lib/formato";
import { apagarLancamento, marcarPago } from "@/app/admin/(painel)/lancamentos/actions";

const cor: Record<string, string> = {
  atrasada: "vermelho",
  "vence hoje": "amarelo",
  "em aberto": "",
  paga: "verde",
  recebida: "verde",
};

export function TabelaLancamentos({ itens, mostrarTipo = false }: { itens: Lancamento[]; mostrarTipo?: boolean }) {
  if (itens.length === 0) return <p style={{ color: "var(--cinza)" }}>Nada por aqui.</p>;
  return (
    <div className="tabela">
      <table>
        <thead>
          <tr>
            <th>Vencimento</th>
            {mostrarTipo && <th>Tipo</th>}
            <th>Descrição</th>
            <th>Com quem</th>
            <th>Valor</th>
            <th>Situação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {itens.map((l) => {
            const s = situacao(l);
            return (
              <tr key={l.id}>
                <td>{dataBR(l.vencimento)}</td>
                {mostrarTipo && <td>{l.tipo === "pagar" ? "A pagar" : "A receber"}</td>}
                <td>
                  {l.descricao}
                  {l.categoria && <div style={{ color: "var(--cinza)", fontSize: ".8rem" }}>{l.categoria}</div>}
                </td>
                <td>{l.contraparte ?? "-"}</td>
                <td className={l.tipo === "pagar" ? "vermelho" : "verde"}>{brl(l.valor)}</td>
                <td>
                  <span className={`selo ${cor[s]}`}>{s}</span>
                </td>
                <td>
                  <div className="acoes">
                    <form action={marcarPago}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="pago" value={l.pago_em ? "0" : "1"} />
                      <button>{l.pago_em ? "Reabrir" : l.tipo === "pagar" ? "Paguei" : "Recebi"}</button>
                    </form>
                    <form action={apagarLancamento}>
                      <input type="hidden" name="id" value={l.id} />
                      <button title="Apagar">✕</button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
