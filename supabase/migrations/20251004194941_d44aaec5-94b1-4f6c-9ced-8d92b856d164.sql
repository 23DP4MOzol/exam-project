-- Add user balance system
ALTER TABLE public.users 
ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL;

-- Create user transactions table for tracking balance changes
CREATE TABLE public.user_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'listing_fee', 'reserve_fee', 'refund')),
  description TEXT,
  reference_id UUID, -- Can reference orders, products, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for transactions
CREATE INDEX idx_user_transactions_user_id ON public.user_transactions(user_id);
CREATE INDEX idx_user_transactions_type ON public.user_transactions(transaction_type);

-- Add listing fees to products
ALTER TABLE public.products
ADD COLUMN listing_fee DECIMAL(10,2) DEFAULT 2.50,
ADD COLUMN is_reserved BOOLEAN DEFAULT FALSE,
ADD COLUMN reserved_by UUID REFERENCES users(id),
ADD COLUMN reserve_fee DECIMAL(10,2) DEFAULT 1.00,
ADD COLUMN reserved_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on user_transactions
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.user_transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" 
ON public.user_transactions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" 
ON public.user_transactions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Function to update user balance when transaction is inserted
CREATE OR REPLACE FUNCTION public.update_user_balance()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to automatically update balance
CREATE TRIGGER update_balance_on_transaction
  AFTER INSERT ON public.user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_balance();

-- Add timestamp triggers for user_transactions
CREATE TRIGGER update_user_transactions_updated_at
  BEFORE UPDATE ON public.user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();