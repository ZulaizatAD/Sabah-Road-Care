-- Supabase/Postgres schema bootstrap for Sabah Road Care backend
-- Run this whole file in Supabase SQL Editor.

create table if not exists users (
    id serial primary key,
    email varchar(255) unique not null,
    full_name varchar(255),
    password_hash varchar(255) not null,
    profile_picture varchar(255),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists ix_users_id on users(id);
create index if not exists ix_users_email on users(email);

create table if not exists pothole_reports (
    case_id varchar primary key,
    email varchar not null,
    user_id integer not null references users(id) on delete cascade,
    location json not null,
    district varchar not null,
    latitude double precision not null,
    longitude double precision not null,
    description text,
    date_created timestamptz default now(),
    last_date_status_update timestamptz default now(),
    severity varchar not null default 'Analyzing',
    status varchar not null default 'Under Review',
    priority varchar not null default 'Medium',
    ai_analysis_completed boolean not null default false,
    ai_confidence double precision default 0.0,
    pothole_length_cm double precision,
    pothole_width_cm double precision,
    pothole_depth_cm double precision,
    similar_reports_count integer default 0,
    unique_users_count integer default 0,
    community_multiplier double precision default 1.0,
    ai_analysis_details json,
    photo_top text,
    photo_far text,
    photo_close text
);

create index if not exists ix_pothole_reports_case_id on pothole_reports(case_id);
create index if not exists ix_pothole_reports_email on pothole_reports(email);
create index if not exists ix_pothole_reports_district on pothole_reports(district);
create index if not exists ix_pothole_reports_latitude on pothole_reports(latitude);
create index if not exists ix_pothole_reports_longitude on pothole_reports(longitude);

create table if not exists ai_jobs (
    id bigserial primary key,
    case_id text not null unique references pothole_reports(case_id) on delete cascade,
    status text not null default 'QUEUED',
    attempts integer not null default 0,
    max_attempts integer not null default 3,
    error_message text,
    queued_at timestamptz not null default now(),
    started_at timestamptz,
    finished_at timestamptz,
    next_retry_at timestamptz
);

create index if not exists ix_ai_jobs_case_id on ai_jobs(case_id);
create index if not exists ix_ai_jobs_status on ai_jobs(status);

alter table pothole_reports
    alter column photo_top drop not null,
    alter column photo_far drop not null,
    alter column photo_close drop not null;
