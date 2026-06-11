-- Seed admin and staff profile records.
--
-- To use this file, first create the corresponding Auth users in Supabase.
-- Then replace <ADMIN_USER_ID> and <STAFF_USER_ID> with the real user UUIDs.
-- If you already have the Auth users created, you can also run this as-is after updating the IDs.

INSERT INTO public.profiles (id, email, full_name, role, phone_number, is_active)
VALUES
  (
    '<ADMIN_USER_ID>',
    'admin@example.com',
    'Admin User',
    'admin',
    NULL,
    true
  ),
  (
    '<STAFF_USER_ID>',
    'staff@example.com',
    'Staff User',
    'staff',
    NULL,
    true
  )
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone_number = EXCLUDED.phone_number,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Query for verification:
SELECT id, email, full_name, role, phone_number, is_active, created_at, updated_at
FROM public.profiles
WHERE role IN ('admin', 'staff');
