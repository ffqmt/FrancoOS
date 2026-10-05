import { brl, PAPEIS, type Contato } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase";
import { arquivarContato, criarContato } from "./actions";

export default async function Contatos({ searchParams }: { searchParams: Promise<{ papel?: string }> }) {
  const { papel } = await searchParams;
  const supabase = await supabaseServer();

  let consulta = supabase.from("os_contatos").select("*").eq("ativo", true);
  if (papel) consulta = consulta.eq("papel", papel);
  const { data } = await consulta.order("nome");
  const contatos = (data ?? []) as Contato[];

  // Quanto está em aberto com cada contato.
  const { data: abertos } = await supabase
    .from("os_lancamentos")
    .select("contato_id, tipo, valor")
    .is("pago_em", null)
    .not("contato_id", "is", null);
  const saldo = new Map<string, { pagar: number; receber: number }>();
  for (const l of abertos ?? []) {
    const s = saldo.get(l.contato_id) ?? { pagar: 0, receber: 0 };
    s[l.tipo as "pagar" | "receber"] += Number(l.valor);
    saldo.set(l.contato_id, s);
  }

  return (
    <>
      <h1>Parceiros e credores</h1>

      <form action={criarContato} className="formulario">
        <label>
          Nome
          <input name="nome" required />
        </label>
        <label>
          Papel
          <select name="papel" defaultValue={papel ?? "credor"}>
            {PAPEIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Telefone / WhatsApp
          <input name="telefone" />
        </label>
        <label>
          E-mail
          <input name="email" type="email" />
        </label>
        <label>
          De onde veio
          <input name="origem" placeholder="Indicação, Instagram..." />
        </label>
        <label>
          Chave Pix
          <input name="pix" />
        </label>
        <label>
          Comissão padrão (%)
          <input name="comissao_percentual" inputMode="decimal" placeholder="Parceiros" />
        </label>
        <button className="botao">Adicionar</button>
      </form>

      <div className="filtros">
        <a href="/admin/contatos" className={!papel ? "ativo" : ""}>
          Todos
        </a>
        {PAPEIS.map((p) => (
          <a key={p} href={`/admin/contatos?papel=${p}`} className={papel === p ? "ativo" : ""}>
            {p}
          </a>
        ))}
      </div>

      {contatos.length === 0 ? (
        <p style={{ color: "var(--cinza)" }}>Nenhum contato ainda.</p>
      ) : (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papel</th>
                <th>Contato</th>
                <th>Origem</th>
                <th>Devo</th>
                <th>A receber</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contatos.map((c) => {
                const s = saldo.get(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      {c.nome}
                      {c.pix && <div style={{ color: "var(--cinza)", fontSize: ".8rem" }}>Pix: {c.pix}</div>}
                    </td>
                    <td>
                      {c.papel}
                      {c.comissao_percentual ? ` · ${c.comissao_percentual}%` : ""}
                    </td>
                    <td>{c.telefone ?? c.email ?? "-"}</td>
                    <td>{c.origem ?? "-"}</td>
                    <td className={s?.pagar ? "vermelho" : ""}>{s?.pagar ? brl(s.pagar) : "-"}</td>
                    <td className={s?.receber ? "verde" : ""}>{s?.receber ? brl(s.receber) : "-"}</td>
                    <td>
                      <form action={arquivarContato} className="acoes">
                        <input type="hidden" name="id" value={c.id} />
                        <button title="Arquivar">Arquivar</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
