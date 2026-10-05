import { TabelaLancamentos } from "@/components/TabelaLancamentos";
import { hoje, SELECT_LANCAMENTO, type Contato, type Lancamento } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase";
import { criarLancamento } from "./actions";

type Filtro = "abertas" | "atrasadas" | "pagas" | "todas";

export default async function Lancamentos({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; filtro?: string }>;
}) {
  const params = await searchParams;
  const tipo = params.tipo === "receber" ? "receber" : "pagar";
  const filtro = (["abertas", "atrasadas", "pagas", "todas"].includes(params.filtro ?? "")
    ? params.filtro
    : "abertas") as Filtro;

  const supabase = await supabaseServer();
  const { data: contatosData } = await supabase.from("os_contatos").select("*").eq("ativo", true).order("nome");
  const contatos = (contatosData ?? []) as Contato[];
  const parceiros = contatos.filter((c) => c.papel === "parceiro" || c.papel === "indicador");

  let consulta = supabase.from("os_lancamentos").select(SELECT_LANCAMENTO).eq("tipo", tipo);
  if (filtro === "abertas") consulta = consulta.is("pago_em", null);
  if (filtro === "atrasadas") consulta = consulta.is("pago_em", null).lt("vencimento", hoje());
  if (filtro === "pagas") consulta = consulta.not("pago_em", "is", null);
  const { data } = await consulta.order("vencimento", { ascending: filtro !== "pagas" }).limit(500);

  const titulo = tipo === "pagar" ? "Contas a pagar" : "Contas a receber";
  const rotuloPago = tipo === "pagar" ? "Pagas" : "Recebidas";

  return (
    <>
      <h1>{titulo}</h1>

      <form action={criarLancamento} className="formulario">
        <input type="hidden" name="tipo" value={tipo} />
        <label>
          Descrição
          <input name="descricao" required placeholder={tipo === "pagar" ? "Aluguel, fornecedor..." : "Mensalidade cliente..."} />
        </label>
        <label>
          {tipo === "pagar" ? "Credor" : "Cliente"}
          <select name="contato_id" defaultValue="">
            <option value="">-</option>
            {contatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.papel})
              </option>
            ))}
          </select>
        </label>
        <label>
          Valor (R$)
          <input name="valor" required inputMode="decimal" placeholder="0,00" />
        </label>
        <label>
          Vencimento
          <input name="vencimento" type="date" required defaultValue={hoje()} />
        </label>
        <label>
          Categoria
          <input name="categoria" placeholder="Opcional" />
        </label>
        <label>
          Repetir por (meses)
          <input name="repetir" type="number" min={1} max={36} defaultValue={1} />
        </label>
        {tipo === "receber" && parceiros.length > 0 && (
          <>
            <label>
              Repasse para parceiro
              <select name="parceiro_id" defaultValue="">
                <option value="">Sem repasse</option>
                {parceiros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                    {c.comissao_percentual ? ` (${c.comissao_percentual}%)` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              % do repasse
              <input name="repasse_percentual" inputMode="decimal" placeholder="10" />
            </label>
          </>
        )}
        <button className="botao">Adicionar</button>
      </form>

      <div className="filtros">
        {(
          [
            ["abertas", "Em aberto"],
            ["atrasadas", "Atrasadas"],
            ["pagas", rotuloPago],
            ["todas", "Todas"],
          ] as const
        ).map(([valor, nome]) => (
          <a key={valor} href={`/admin/lancamentos?tipo=${tipo}&filtro=${valor}`} className={filtro === valor ? "ativo" : ""}>
            {nome}
          </a>
        ))}
      </div>

      <TabelaLancamentos itens={(data ?? []) as Lancamento[]} />
    </>
  );
}
