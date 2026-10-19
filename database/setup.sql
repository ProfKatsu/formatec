-- Execute uma vez no SQL Editor de um projeto Supabase novo.
create table public.attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 email text not null,
 name text not null check (char_length(name) between 3 and 150),
 school text not null check (char_length(school) between 3 and 200),
 course text not null check (course in ('tecnologia','robotica')),
 answers jsonb not null,
 score integer not null check (score between 0 and 5),
 attempt_number integer not null check (attempt_number>0),
 completed_at timestamptz not null default now(),
 sed_declared_at timestamptz,
 request_id uuid not null,
 unique(user_id,request_id), unique(user_id,course,attempt_number)
);
create index attempts_date on public.attempts(completed_at desc);
alter table public.attempts enable row level security;
revoke all on public.attempts from anon,authenticated;
grant all on public.attempts to service_role;
-- Sem políticas de acesso público: somente o servidor tem acesso aos registros.
create or replace function public.record_attempt(p_user uuid,p_email text,p_name text,p_school text,p_course text,p_answers jsonb,p_score integer,p_request uuid)
returns setof public.attempts language plpgsql security invoker set search_path=public as $$
declare n integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 if exists(select 1 from public.attempts where user_id=p_user and request_id=p_request) then
  return query select * from public.attempts where user_id=p_user and request_id=p_request;
  return;
 end if;
 select coalesce(max(attempt_number),0)+1 into n from public.attempts where user_id=p_user and course=p_course;
 return query insert into public.attempts(user_id,email,name,school,course,answers,score,attempt_number,request_id)
 values(p_user,p_email,p_name,p_school,p_course,p_answers,p_score,n,p_request) returning *;
end $$;
revoke all on function public.record_attempt(uuid,text,text,text,text,jsonb,integer,uuid) from public,anon,authenticated;
grant execute on function public.record_attempt(uuid,text,text,text,text,jsonb,integer,uuid) to service_role;
