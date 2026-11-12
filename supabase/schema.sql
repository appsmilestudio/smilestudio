-- Smile Studio. Pega este archivo en Supabase → SQL Editor → Run.
-- La clave anon queda abierta para la recepción hasta que haya un login de personal.

create table if not exists public.pacientes (
  id text primary key,
  nombre text not null default '',
  edad text not null default '',
  dni text not null default '',
  telefono text not null default '',
  direccion text not null default ''
);

create table if not exists public.citas (
  id text primary key,
  paciente_id text not null,
  doctor text not null,
  fecha date not null,
  hora text,
  tratamiento text not null default '',
  estado text not null,
  mes text not null default '',
  nota text not null default '',
  origen text not null default 'agenda',
  sin_cobro boolean not null default false
);

create table if not exists public.pagos (
  id text primary key,
  cita_id text not null,
  metodo text not null,
  monto numeric not null,
  operacion text not null default '',
  nota text not null default '',
  tiene_evidencia boolean not null default false,
  evidencia text
);

create table if not exists public.deudas (
  id text primary key,
  paciente_id text not null,
  monto numeric not null,
  concepto text not null default '',
  estado text not null
);

create table if not exists public.cierres (
  fecha date primary key,
  efectivo_contado numeric,
  nota text not null default '',
  cerrado_en timestamptz
);

create table if not exists public.emisor (
  id integer primary key,
  ruc text not null default '',
  razon_social text not null default 'Smile Studio',
  direccion text not null default 'Piura',
  siguiente_boleta integer not null default 1,
  siguiente_factura integer not null default 1
);

create table if not exists public.comprobantes (
  id text primary key,
  cita_id text not null,
  pago_ids text[] not null default '{}',
  tipo text not null,
  serie text not null,
  numero integer not null,
  fecha date not null,
  receptor text not null default '',
  tipo_doc text not null default '0',
  num_doc text not null default '',
  descripcion text not null default '',
  op_gravada numeric not null default 0,
  igv numeric not null default 0,
  total numeric not null default 0,
  estado text not null default 'local',
  leyenda text not null default 'COMPROBANTE INTERNO — NO ENVIADO A SUNAT'
);

create table if not exists public.fichas (
  id text primary key,
  datos jsonb not null
);

create index if not exists citas_fecha_idx on public.citas (fecha);
create index if not exists pagos_cita_idx on public.pagos (cita_id);
create index if not exists deudas_paciente_idx on public.deudas (paciente_id);

grant select, insert, update, delete on public.pacientes, public.citas, public.pagos, public.deudas, public.cierres, public.emisor, public.comprobantes, public.fichas to anon, authenticated;

alter table public.pacientes enable row level security;
alter table public.citas enable row level security;
alter table public.pagos enable row level security;
alter table public.deudas enable row level security;
alter table public.cierres enable row level security;
alter table public.emisor enable row level security;
alter table public.comprobantes enable row level security;
alter table public.fichas enable row level security;

drop policy if exists recepcion on public.pacientes;
drop policy if exists recepcion on public.citas;
drop policy if exists recepcion on public.pagos;
drop policy if exists recepcion on public.deudas;
drop policy if exists recepcion on public.cierres;
drop policy if exists recepcion on public.emisor;
drop policy if exists recepcion on public.comprobantes;
drop policy if exists recepcion on public.fichas;

create policy recepcion on public.pacientes for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.citas for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.pagos for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.deudas for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.cierres for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.emisor for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.comprobantes for all to anon, authenticated using (true) with check (true);
create policy recepcion on public.fichas for all to anon, authenticated using (true) with check (true);
