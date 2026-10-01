import { TabelaLancamentos } from "@/components/TabelaLancamentos";
import { brl, hoje, somarDias, type Lancamento } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase";

export default async function Resumo() {
  const supabase = await supabaseServer();
  const ref = hoje();
  const fimMes = somarDias(`${ref.slice(0, 8)}01`, 40).slice(0, 8) + "01";

  const { data } = await supabase
    .from("lancamentos")
    .select("*")
    .is("pago_em", null)
    .lt("vencimento", fimMes)
    .order("vencimento");
  const abertos = (data ?? []) as Lancamento[];

  const soma = (lista: Lancamento[]) => lista.reduce((t, l) => t + Number(l.valor), 0);
  const pagar = abertos.filter((l) => l.tipo === "pagar");
  const receber = abertos.filter((l) => l.tipo === "receber");
  const atrasados = abertos.filter((l) => l.vencimento < ref);
  const proximos = abertos.filter((l) => l.vencimento >= ref && l.vencimento <= somarDias(ref, 7));

  return (
    <>
      <h1>Resumo</h1>
      <p style={{ color: "var(--cinza)", marginTop: 0 }}>Em aberto até o fim do mês, incluindo atrasados.</p>
      <div className="numeros">
        <div className="numero">
          <span>A pagar</span>
          <strong className="vermelho">{brl(soma(pagar))}</strong>
        </div>
        <div className="numero">
          <span>A receber</span>
          <strong className="verde">{brl(soma(receber))}</strong>
        </div>
        <div className="numero">
          <span>Saldo previsto</span>
          <strong>{brl(soma(receber) - soma(pagar))}</strong>
        </div>
        <div className="numero">
          <span>Atrasados</span>
          <strong className={atrasados.length ? "vermelho" : ""}>{atrasados.length}</strong>
        </div>
      </div>

      <h2>Atrasados</h2>
      <TabelaLancamentos itens={atrasados} mostrarTipo />

      <h2 style={{ marginTop: 32 }}>Próximos 7 dias</h2>
      <TabelaLancamentos itens={proximos} mostrarTipo />
    </>
  );
}
