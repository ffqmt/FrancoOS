-- Nívia, etapa 2: lembretes, respostas automáticas e a ficha da assistente (personalidade + memória).
-- Aplicado pelo MCP do Supabase em 2026-11-12.

-- Lembretes recorrentes que o WhatsApp do PC envia (antes ficavam em lembretes-recorrentes.json).
create table if not exists public.os_wa_lembretes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  jid text not null,                      -- destino (contato ou grupo)
  destino_nome text,
  texto text not null,                    -- aceita {MM}, {AAAA} e {DD}
  dias int[] not null,                    -- dias do mês
  hora text not null default '09:00',     -- HH:MM no fuso abaixo
  fuso text not null default 'America/Cuiaba',
  domingo_para_segunda boolean not null default false,
  inicio date,
  ativo boolean not null default true,
  ultimo_envio date,
  chave_local text,                       -- id do lembrete no arquivo antigo, para não duplicar
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Respostas automáticas simples (nível 1), sem IA.
create table if not exists public.os_wa_respostas (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  gatilho text not null check (gatilho in ('comprovante','documento','pausa')),
  texto text not null,
  ativo boolean not null default true,
  intervalo_horas int not null default 6,  -- no máximo uma resposta desse tipo por conversa nesse intervalo
  atualizado_em timestamptz not null default now(),
  unique (user_id, gatilho)
);

-- Ficha da Nívia: personalidade e regras gerais.
create table if not exists public.os_nivia (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  personalidade text not null default '',
  regras text not null default '',
  atualizado_em timestamptz not null default now()
);

-- Memória: fatos sobre cada cliente (combinados de reunião, preferências, observações).
create table if not exists public.os_nivia_memoria (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cliente_id text,                        -- id em os_registros (fos_clients)
  cliente_nome text,
  fato text not null,
  origem text not null default 'nota' check (origem in ('nota','reuniao','conversa')),
  data date not null default current_date,
  criado_em timestamptz not null default now()
);
create index if not exists os_nivia_memoria_cliente on public.os_nivia_memoria (user_id, cliente_id, data desc);

alter table public.os_wa_lembretes enable row level security;
alter table public.os_wa_respostas enable row level security;
alter table public.os_nivia enable row level security;
alter table public.os_nivia_memoria enable row level security;
create policy "os_wa_lembretes do proprio usuario" on public.os_wa_lembretes
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "os_wa_respostas do proprio usuario" on public.os_wa_respostas
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "os_nivia do proprio usuario" on public.os_nivia
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "os_nivia_memoria do proprio usuario" on public.os_nivia_memoria
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
