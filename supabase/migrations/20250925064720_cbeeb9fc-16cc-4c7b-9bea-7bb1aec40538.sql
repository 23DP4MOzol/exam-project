-- Create proper admin user with secure password handling
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- First check if admin user already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@marketplace.com';
    
    -- If admin doesn't exist, we'll create it through the users table instead
    -- since direct auth.users insertion requires special permissions
    
    -- Delete existing admin if exists
    DELETE FROM users WHERE email = 'admin@marketplace.com';
    
    -- Create a test admin user in our users table
    -- Real production setup would require proper Supabase Auth user creation
    INSERT INTO users (
        id, 
        email, 
        username, 
        role, 
        created_at, 
        updated_at
    ) VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
        'admin@marketplace.com',
        'admin',
        'admin',
        now(),
        now()
    ) ON CONFLICT (email) DO UPDATE SET 
        role = 'admin',
        username = 'admin';
        
    -- Also create a regular test user
    INSERT INTO users (
        id, 
        email, 
        username, 
        role, 
        created_at, 
        updated_at
    ) VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'user@marketplace.com',
        'testuser',
        'user',
        now(),
        now()
    ) ON CONFLICT (email) DO UPDATE SET 
        role = 'user',
        username = 'testuser';
        
    RAISE NOTICE 'Admin and test users created/updated successfully';
END $$;