-- Fix security issues: Add search_path to all functions

-- Drop triggers first, then functions
DROP TRIGGER IF EXISTS update_balance_on_transaction ON public.user_transactions;
DROP FUNCTION IF EXISTS public.update_user_balance();

-- Recreate update_user_balance function with search_path
CREATE OR REPLACE FUNCTION public.update_user_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users 
  SET balance = balance + NEW.amount 
  WHERE id = NEW.user_id;
  
  -- Ensure balance doesn't go negative for withdrawals
  IF (SELECT balance FROM public.users WHERE id = NEW.user_id) < 0 AND NEW.amount < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_balance_on_transaction
  AFTER INSERT ON public.user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_balance();

-- Fix other functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO users (id, email, username)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;