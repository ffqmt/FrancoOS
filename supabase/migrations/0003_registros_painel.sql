-- Um registro por item (cliente, lead, contrato, tarefa...) em vez de um bloco por coleção.
-- Assim dá para consultar e incluir itens direto no banco sem sobrescrever o que o painel salvou.
create table if not exists public.os_registros (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  colecao text not null,
  id text not null,
  dados jsonb not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  primary key (user_id, colecao, id)
);

create index if not exists os_registros_colecao on public.os_registros (user_id, colecao, criado_em desc);

alter table public.os_registros enable row level security;

create policy "os_registros do proprio usuario" on public.os_registros
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- A tabela os_estado (0002) ficou sem uso e pode ser apagada.
