import { dataBR, hoje, somarDias } from "@/lib/formato";
import { gerarMensalidades } from "@/lib/mensalidades";
import { supabaseServico } from "@/lib/supabase";

// Roda todo dia (vercel.json): manda pelo WhatsApp do AUTAX o lembrete de vencimento
// (3 dias antes e no dia) e a cobrança de atraso (3 e 7 dias depois) das contas a receber
// do painel. Antes cria as mensalidades do mês pelos contratos (sempre, mesmo em simulação).
// Só envia de verdade com COBRANCA_WHATSAPP_ATIVA=1; sem isso devolve a lista
// do que mandaria. ?simular=1 força a simulação mesmo ligado.

type Baixa = { valor: number };
type Aviso = { chave: string; enviadoEm: string; telefone: string; modelo: string };
type Transacao = {
  id: string;
  type: string;
  status: string;
  amount: number;
  dueDate: string;
  description: string;
  clientId?: string;
  baixas?: Baixa[];
  avisos?: Aviso[];
};
type Contato = { id: string; name: string; phone?: string; role?: string; clientId?: string; isPrimary?: boolean };
type Linha<T> = { colecao: string; id: string; dados: T; user_id: string };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function etapa(diasParaVencer: number) {
  if (diasParaVencer === 3 || diasParaVencer === 0) return "lembrete_vencimento_cliente_contabil";
  if (diasParaVencer === -3 || diasParaVencer === -7) return "cobranca_atraso_cliente_contabil";
  return null;
}

function telefoneWhatsApp(phone?: string) {
  const d = (phone ?? "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  return null;
}

// Quem recebe: só contatos com "recebe os avisos" no cargo e telefone; cliente sem isso não recebe nada.
function destinatarios(contatos: Contato[], clientId: string) {
  return contatos.filter((c) => c.clientId === clientId && telefoneWhatsApp(c.phone) && /avisos/i.test(c.role ?? ""));
}

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  const simular = process.env.COBRANCA_WHATSAPP_ATIVA !== "1" || new URL(request.url).searchParams.get("simular") === "1";
  // Chave Pix (CNPJ) informada pela Fernanda em 05/10/2026; a variável sobrescreve se mudar.
  const pix = process.env.COBRANCA_PIX_CHAVE || "57360731000165";
  const autaxUrl = process.env.AUTAX_URL ?? "";
  const autaxChave = process.env.AUTAX_FRANCOOS_API_KEY ?? "";
  if (!simular && (!pix || !autaxUrl || !autaxChave)) {
    return Response.json({ erro: "Faltam COBRANCA_PIX_CHAVE, AUTAX_URL ou AUTAX_FRANCOOS_API_KEY." }, { status: 500 });
  }

  const db = supabaseServico();
  const ref = hoje();
  // Primeiro cria as mensalidades do mês pelos contratos, para os avisos de hoje já enxergarem.
  const mensalidades = await gerarMensalidades(db, ref);

  const { data, error } = await db
    .from("os_registros")
    .select("colecao, id, dados, user_id")
    .in("colecao", ["fos_transactions", "fos_contacts", "fos_clients"])
    .neq("id", "__colecao");
  if (error) return Response.json({ erro: error.message }, { status: 500 });

  const linhas = (data ?? []) as Linha<Record<string, unknown>>[];
  const contatos = linhas.filter((l) => l.colecao === "fos_contacts").map((l) => l.dados as unknown as Contato);
  const nomeCliente = new Map(
    linhas.filter((l) => l.colecao === "fos_clients").map((l) => [l.id, String((l.dados as { name?: string }).name ?? "")]),
  );

  const resultado: { cliente: string; contato: string; modelo: string; valor: string; vencimento: string; status: string }[] = [];

  for (const linha of linhas.filter((l) => l.colecao === "fos_transactions")) {
    const t = linha.dados as unknown as Transacao;
    if (t.type !== "income" || t.status === "paid" || !t.clientId || !t.dueDate) continue;

    const restante = t.amount - (t.baixas ?? []).reduce((s, b) => s + b.valor, 0);
    if (restante <= 0.005) continue;

    const dias = Math.round((Date.parse(`${t.dueDate}T12:00:00Z`) - Date.parse(`${ref}T12:00:00Z`)) / 86_400_000);
    const modelo = etapa(dias);
    if (!modelo) continue;

    const chave = `${modelo}:${t.dueDate}:${dias}`;
    const avisos = [...(t.avisos ?? [])];
    const [ano, mes] = t.dueDate.split("-").map(Number);
    const competencia = `${MESES[mes - 1]}/${ano}`;
    const valor = restante.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let enviouAlgum = false;
    for (const c of destinatarios(contatos, t.clientId)) {
      const telefone = telefoneWhatsApp(c.phone)!;
      if (avisos.some((a) => a.chave === chave && a.telefone === telefone)) continue;

      const base = { cliente: nomeCliente.get(t.clientId) ?? t.clientId, contato: c.name, modelo, valor, vencimento: dataBR(t.dueDate) };
      if (simular) {
        resultado.push({ ...base, status: "simulado" });
        continue;
      }

      const primeiroNome = c.name.split(" ")[0];
      const res = await fetch(`${autaxUrl.replace(/\/$/, "")}/api/francoos/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${autaxChave}` },
        body: JSON.stringify({ telefone, modelo, parametros: [primeiroNome, competencia, valor, dataBR(t.dueDate), pix] }),
        signal: AbortSignal.timeout(15_000),
      }).catch((e: Error) => ({ ok: false, json: async () => ({ error: e.message }) }) as unknown as Response);
      const corpo = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.ok) {
        avisos.push({ chave, enviadoEm: new Date().toISOString(), telefone, modelo });
        enviouAlgum = true;
        resultado.push({ ...base, status: "enviado" });
        await registrarHistorico(db, linha.user_id, t.clientId, modelo, c.name, valor, t.dueDate);
      } else {
        resultado.push({ ...base, status: `erro: ${corpo.error ?? res.status}` });
      }
    }

    if (enviouAlgum) {
      await db
        .from("os_registros")
        .update({ dados: { ...t, avisos }, atualizado_em: new Date().toISOString() })
        .eq("user_id", linha.user_id)
        .eq("colecao", "fos_transactions")
        .eq("id", linha.id);
    }
  }

  return Response.json({ simulado: simular, referencia: ref, mensalidadesCriadas: mensalidades.criadas, ate: somarDias(ref, 3), avisos: resultado });
}

async function registrarHistorico(
  db: ReturnType<typeof supabaseServico>,
  userId: string,
  clientId: string,
  modelo: string,
  contato: string,
  valor: string,
  vencimento: string,
) {
  const id = `he_aviso_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const titulo = modelo === "lembrete_vencimento_cliente_contabil" ? "Lembrete de vencimento enviado" : "Cobrança de atraso enviada";
  await db.from("os_registros").upsert(
    [
      { user_id: userId, colecao: "fos_history_events", id: "__colecao", dados: {} },
      {
        user_id: userId,
        colecao: "fos_history_events",
        id,
        dados: {
          id,
          clientId,
          title: titulo,
          description: `WhatsApp para ${contato}: R$ ${valor}, vencimento ${dataBR(vencimento)}.`,
          date: new Date().toISOString(),
          type: "billing",
        },
      },
    ],
    { onConflict: "user_id,colecao,id", ignoreDuplicates: false },
  );
}
