-- Atendimento pelo WhatsApp (assistente Nívia), etapa 1: nada passa.
-- O serviço WhatsApp do PC da Fernanda grava aqui as conversas dos contatos liberados
-- e lê a fila de saída. O painel mostra quem está esperando resposta.
-- Aplicado pelo MCP do Supabase em 2026-11-12 (gatilho criado por execute_sql, fora do histórico).

create table if not exists public.os_wa_chats (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jid text not null,                       -- id do WhatsApp (5566...@s.whatsapp.net ou ...@g.us)
  nome text,
  tipo text not null default 'novo' check (tipo in ('novo','cliente','lead','pessoal','grupo','ignorado')),
  cliente_id text,                         -- id do cliente em os_registros (fos_clients), quando houver
  liberado boolean not null default false, -- só chats liberados têm o texto gravado
  ultima_entrada timestamptz,
  ultima_saida timestamptz,
  aguardando_desde timestamptz,            -- primeira mensagem do contato ainda sem resposta
  alertas int not null default 0,          -- quantos alertas já foram para a Fernanda nesta espera
  resolvido_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  primary key (user_id, jid)
);

create table if not exists public.os_wa_mensagens (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jid text not null,
  wa_id text not null,
  de_mim boolean not null default false,
  autor_nome text,
  tipo text not null default 'texto',      -- texto, imagem, documento, audio, video, outro
  texto text,
  midia_nome text,
  enviado_em timestamptz not null,
  criado_em timestamptz not null default now(),
  unique (user_id, wa_id)
);
create index if not exists os_wa_mensagens_chat on public.os_wa_mensagens (user_id, jid, enviado_em desc);

create table if not exists public.os_wa_saida (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jid text not null,
  texto text not null,
  origem text not null default 'painel',   -- painel, lembrete, nivia
  status text not null default 'pendente' check (status in ('pendente','enviando','enviado','erro','cancelado')),
  erro text,
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);
create index if not exists os_wa_saida_pendente on public.os_wa_saida (status, criado_em);

alter table public.os_wa_chats enable row level security;
alter table public.os_wa_mensagens enable row level security;
alter table public.os_wa_saida enable row level security;

create policy "os_wa_chats do proprio usuario" on public.os_wa_chats
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "os_wa_mensagens do proprio usuario" on public.os_wa_mensagens
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "os_wa_saida do proprio usuario" on public.os_wa_saida
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Cada mensagem gravada atualiza a espera do chat.
create or replace function public.os_wa_atualizar_chat() returns trigger
language plpgsql security definer set search_path = public as $fn$
begin
  if new.de_mim then
    update os_wa_chats set ultima_saida = greatest(coalesce(ultima_saida, new.enviado_em), new.enviado_em),
      aguardando_desde = case when aguardando_desde is not null and aguardando_desde <= new.enviado_em then null else aguardando_desde end,
      alertas = case when aguardando_desde is not null and aguardando_desde <= new.enviado_em then 0 else alertas end,
      atualizado_em = now()
    where user_id = new.user_id and jid = new.jid;
  else
    update os_wa_chats set ultima_entrada = greatest(coalesce(ultima_entrada, new.enviado_em), new.enviado_em),
      aguardando_desde = case when aguardando_desde is null and (ultima_saida is null or ultima_saida < new.enviado_em) then new.enviado_em else aguardando_desde end,
      resolvido_em = null,
      atualizado_em = now()
    where user_id = new.user_id and jid = new.jid;
  end if;
  return new;
end $fn$;

create trigger os_wa_mensagens_atualiza_chat after insert on public.os_wa_mensagens
  for each row execute function public.os_wa_atualizar_chat();
