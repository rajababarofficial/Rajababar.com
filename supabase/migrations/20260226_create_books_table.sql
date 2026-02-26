-- Migration to create books table for Digital Library Aggregator
create table if not exists public.books (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    author text,
    language text,
    category text,
    publish_year text,
    cover_url text,
    source_name text not null,
    source_url text not null,
    is_public_domain boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.books enable row level security;

-- Create policy to allow anyone to read
create policy "Allow public read access" on public.books
    for select using (true);
