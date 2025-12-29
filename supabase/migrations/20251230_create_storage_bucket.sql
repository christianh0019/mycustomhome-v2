-- Create a private bucket for document files
insert into storage.buckets (id, name, public)
values ('document-files', 'document-files', false)
on conflict (id) do nothing;

-- RLS for Storage
create policy "Vendors can upload their own document files"
on storage.objects for insert
with check ( bucket_id = 'document-files' and auth.role() = 'authenticated' );

create policy "Vendors can view their own document files"
on storage.objects for select
using ( bucket_id = 'document-files' and auth.role() = 'authenticated' );

create policy "Vendors can update their own document files"
on storage.objects for update
using ( bucket_id = 'document-files' and auth.role() = 'authenticated' );

create policy "Vendors can delete their own document files"
on storage.objects for delete
using ( bucket_id = 'document-files' and auth.role() = 'authenticated' );
