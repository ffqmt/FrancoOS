-- Contas a pagar e a receber
create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('pagar', 'receber')),
  descricao text not null,
  contraparte text,
  categoria text,
  valor numeric(12, 2) not null check (valor >= 0),
  vencimento date not null,
  pago_em date,
  observacao text,
  created_at timestamptz not null default now()
);

create index if not exists lancamentos_vencimento_idx on public.lancamentos (vencimento) where pago_em is null;

alter table public.lancamentos enable row level security;

create policy "dono vê" on public.lancamentos for select using (auth.uid() = user_id);
create policy "dono cria" on public.lancamentos for insert with check (auth.uid() = user_id);
create policy "dono altera" on public.lancamentos for update using (auth.uid() = user_id);
create policy "dono apaga" on public.lancamentos for delete using (auth.uid() = user_id);
