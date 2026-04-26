-- 0. ADMIN WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.admin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_wallets_read" ON public.admin_wallets FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_wallets_write" ON public.admin_wallets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_wallets (token, network, address) VALUES 
('USDT', 'TRC-20', 'T9yD8SpxvK9vXyvK9vXyvK9vXyvK9vXyvK'),
('BTC', 'Bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

-- 1. ADMIN CREDIT DEPOSIT
CREATE OR REPLACE FUNCTION public.admin_credit_deposit(_deposit_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _dep RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  SELECT * INTO _dep FROM public.deposits WHERE id = _deposit_id AND status = 'pending';
  IF _dep.id IS NULL THEN RAISE EXCEPTION 'Deposit not found or not pending'; END IF;

  -- Update deposit status
  UPDATE public.deposits SET status = 'received' WHERE id = _deposit_id;

  -- Credit user balance
  UPDATE public.profiles SET balance = balance + _dep.amount WHERE id = _dep.user_id;

  -- Log transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (_dep.user_id, _dep.amount, 'deposit', 'Deposit of ' || _dep.amount || ' ' || _dep.token || ' confirmed');
END;
$$;

-- 2. ADMIN REJECT DEPOSIT
CREATE OR REPLACE FUNCTION public.admin_reject_deposit(_deposit_id UUID, _reason TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  UPDATE public.deposits SET 
    status = 'rejected',
    notes = _reason
  WHERE id = _deposit_id AND status = 'pending';
END;
$$;

-- 3. ADMIN APPROVE WITHDRAWAL
CREATE OR REPLACE FUNCTION public.admin_approve_withdrawal(_withdrawal_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _wd RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  SELECT * INTO _wd FROM public.withdrawals WHERE id = _withdrawal_id AND status = 'pending';
  IF _wd.id IS NULL THEN RAISE EXCEPTION 'Withdrawal not found or not pending'; END IF;

  -- Update withdrawal status
  UPDATE public.withdrawals SET status = 'approved' WHERE id = _withdrawal_id;

  -- Deduct from profile balance (Note: it was likely already deducted or should be now)
  -- In most systems, we deduct on request and refund on rejection.
  -- Our current flow: User requests -> Deduct balance? Let's check.
END;
$$;

-- 4. ADMIN REJECT WITHDRAWAL
CREATE OR REPLACE FUNCTION public.admin_reject_withdrawal(_withdrawal_id UUID, _reason TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _wd RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  SELECT * INTO _wd FROM public.withdrawals WHERE id = _withdrawal_id AND status = 'pending';
  IF _wd.id IS NULL THEN RAISE EXCEPTION 'Withdrawal not found or not pending'; END IF;

  UPDATE public.withdrawals SET 
    status = 'rejected',
    notes = _reason
  WHERE id = _withdrawal_id;

  -- Refund user balance
  UPDATE public.profiles SET balance = balance + _wd.amount WHERE id = _wd.user_id;

  -- Log transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (_wd.user_id, _wd.amount, 'refund', 'Withdrawal refund: ' || _reason);
END;
$$;

-- Add notes column to deposits and withdrawals if missing
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS wallet_address TEXT;
-- 5. REQUEST WITHDRAWAL (USER)
CREATE OR REPLACE FUNCTION public.request_withdrawal(_amount NUMERIC, _token TEXT, _network TEXT, _address TEXT)
RETURNS public.withdrawals LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _uid UUID := auth.uid();
  _wd public.withdrawals;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  
  -- Check balance
  IF (SELECT balance FROM public.profiles WHERE id = _uid) < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct balance
  UPDATE public.profiles SET balance = balance - _amount WHERE id = _uid;

  -- Insert withdrawal
  INSERT INTO public.withdrawals (user_id, amount, token, network, destination_address, status)
  VALUES (_uid, _amount, _token, _network, _address, 'pending')
  RETURNING * INTO _wd;

  -- Log transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (_uid, _amount, 'withdrawal', 'Withdrawal request of ' || _amount || ' ' || _token);

  RETURN _wd;
END;
$$;-- 6. ADMIN UPDATE USER
CREATE OR REPLACE FUNCTION public.admin_update_user(_user_id UUID, _balance NUMERIC, _roi_bonus NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  
  UPDATE public.profiles SET 
    balance = _balance,
    custom_roi_bonus = _roi_bonus
  WHERE id = _user_id;
END;
$$;
