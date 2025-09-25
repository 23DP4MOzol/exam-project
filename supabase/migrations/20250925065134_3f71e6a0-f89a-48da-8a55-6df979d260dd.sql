-- Create a completely new admin account with proper UUID
DO $$
BEGIN
    -- Delete any existing admin accounts
    DELETE FROM users WHERE email = 'admin@marketplace.com' OR role = 'admin';
    
    -- Create the new admin account with a fixed UUID for consistency
    INSERT INTO users (
        id, 
        email, 
        username, 
        role, 
        created_at, 
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@marketplace.com',
        'Administrator',
        'admin',
        now(),
        now()
    );
    
    -- Create a regular demo user for testing
    INSERT INTO users (
        id, 
        email, 
        username, 
        role, 
        created_at, 
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000002'::uuid,
        'demo@marketplace.com',
        'Demo User',
        'user',
        now(),
        now()
    ) ON CONFLICT (email) DO UPDATE SET 
        role = 'user',
        username = 'Demo User';
        
    RAISE NOTICE 'New admin account created successfully';
END $$;