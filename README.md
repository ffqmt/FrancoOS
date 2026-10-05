# FrancoOS

Site da FrancoTech e painel de gestão da operação, num único projeto Next.js.

- `francotech.com.br`: site institucional (`app/page.tsx`).
- `admin.francotech.com.br`: painel com login (`app/admin`). O `proxy.ts` manda esse subdomínio para `/admin`.

## Painel completo (`/admin`)

As telas do protótipo antigo (pasta `painel/`), agora salvando no Supabase na tabela `os_registros`
(`supabase/migrations/0003_registros_painel.sql`), uma linha por item (cliente, lead, contrato...) e por usuário, o que permite consultar e incluir itens direto no banco:

- Dashboard executivo; CRM com leads, funil kanban, atividades, propostas, listas de prospecção, roteiros e agente comercial.
- Catálogo de serviços; clientes e CNPJs com ficha completa (origem, contatos, documentos, histórico).
- Contratos e escopos; demandas e tarefas em quadro.
- Financeiro e notas, contas financeiras e regras de automação; parceiros e repasses.
- Escritório contábil e espaços reservados para produtos digitais, automações, consultoria, integrações e IA.

Cadastros começam vazios. Etapas do funil, catálogo de serviços, modelos de mensagem e regras vêm preenchidos com o padrão do protótipo.

## Contas com lembrete (`/admin/contas`)


- Login com e-mail e senha (Supabase), liberado só para os e-mails em `ADMIN_EMAILS`.
- Parceiros e credores: cadastro com papel, origem, Pix e comissão padrão, mostrando quanto está em aberto com cada um.
- Repasse a parceiro: ao lançar um recebimento, gera a conta a pagar do repasse, que só vence de fato quando o cliente paga.
- Contas a pagar e a receber: cadastro, parcelas/recorrência mensal, marcar como pago/recebido, filtros.
- Resumo do mês: a pagar, a receber, saldo previsto, atrasados e próximos 7 dias.
- Lembrete diário por e-mail (8h de Brasília) com o que vence nos próximos dias e o que atrasou.

## Como colocar no ar

1. **Supabase**: crie um projeto, o banco é o mesmo projeto do ERP contábil, para ter um login só. As tabelas do FrancoOS usam o prefixo `os_` e já foram criadas (`supabase/migrations/`). Se ainda não tiver usuário, crie em Authentication > Users.
2. **Resend**: crie a conta, verifique o domínio `francotech.com.br` (ele mostra os registros DNS para colocar no Cloudflare) e gere a API key.
3. **Vercel**: importe este repositório, preencha as variáveis do `.env.example` e faça o deploy. O cron do `vercel.json` é ligado sozinho.
4. **Domínios**: na Vercel, adicione `francotech.com.br` e `admin.francotech.com.br` ao projeto. No Cloudflare, crie os registros que a Vercel indicar (com a nuvem cinza, "DNS only").

## Rodar localmente

```bash
cp .env.example .env.local   # e preencha
npm install
npm run dev
```

O painel fica em http://localhost:3000/admin.

## Próximas fases

2. Contratos e tarefas ligados a cliente e projeto.
3. Google Agenda e Tarefas, e o agente Claude como coordenador.
4. Cobrança (Pix/boleto), régua de lembretes e NFS-e.
5. Blog e conteúdo das redes.
