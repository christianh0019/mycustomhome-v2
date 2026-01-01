-- Allow authenticated users to see the bucket definition
-- This is often key for the client SDK to "find" the bucket.
drop policy if exists "Authenticated can see document-files bucket" on storage.buckets;

create policy "Authenticated can see document-files bucket"
on storage.buckets for select
to authenticated
using ( id = 'document-files' );
