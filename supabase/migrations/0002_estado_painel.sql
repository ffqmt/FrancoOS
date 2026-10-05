-- Estado do painel completo (CRM, clientes, contratos, tarefas, financeiro, parceiros).
-- Um documento JSON por coleção e por usuário, no lugar do localStorage do protótipo.
create table if not exists public.os_estado (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  chave text not null,
  dados jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, chave)
);

alter table public.os_estado enable row level security;

create policy "os_estado do proprio usuario" on public.os_estado
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
