-- FrancoOS mora no mesmo projeto do ERP contábil (login único).
-- Todas as tabelas usam o prefixo os_ para não se misturar com as do ERP.

-- Pessoas e empresas com quem a FrancoTech se relaciona: clientes, parceiros, credores.
create table if not exists public.os_contatos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  papel text not null default 'credor'
    check (papel in ('cliente', 'parceiro', 'indicador', 'credor', 'fornecedor', 'prestador', 'outro')),
  documento text,
  email text,
  telefone text,
  origem text,
  pix text,
  comissao_percentual numeric(5, 2),
  observacao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Contas a pagar e a receber. Repasse/comissão é uma conta a pagar ligada
-- ao recebimento que a originou (origem_id) e só é liberada quando ele é pago.
create table if not exists public.os_lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('pagar', 'receber')),
  descricao text not null,
  contato_id uuid references public.os_contatos (id) on delete set null,
  contraparte text,
  categoria text,
  valor numeric(12, 2) not null check (valor >= 0),
  vencimento date not null,
  pago_em date,
  origem_id uuid references public.os_lancamentos (id) on delete set null,
  observacao text,
  created_at timestamptz not null default now()
);

create index if not exists os_lancamentos_abertos_idx on public.os_lancamentos (vencimento) where pago_em is null;
create index if not exists os_lancamentos_contato_idx on public.os_lancamentos (contato_id);
create index if not exists os_lancamentos_origem_idx on public.os_lancamentos (origem_id);
create index if not exists os_contatos_user_idx on public.os_contatos (user_id);
create index if not exists os_lancamentos_user_idx on public.os_lancamentos (user_id);

alter table public.os_contatos enable row level security;
alter table public.os_lancamentos enable row level security;

create policy "os_contatos dono" on public.os_contatos for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "os_lancamentos dono" on public.os_lancamentos for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
