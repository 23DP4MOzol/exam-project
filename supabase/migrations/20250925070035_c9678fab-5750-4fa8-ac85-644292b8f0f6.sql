-- Insert demo users into the users table
INSERT INTO public.users (id, email, username, role, created_at, updated_at) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@marketplace.com', 'Administrator', 'admin', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'demo@marketplace.com', 'Demo User', 'user', now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  updated_at = now();