-- 1. ADD MISSING COLUMNS
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS duration_days INT NOT NULL DEFAULT 30;

-- 2. SECURITY: PROTECT FINANCIAL COLUMNS
-- This trigger prevents users from updating their own balance/profit fields via the API
CREATE OR REPLACE FUNCTION public.protect_financial_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If not an admin, prevent changes to balance fields
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.balance = OLD.balance;
    NEW.profit_balance = OLD.profit_balance;
    NEW.total_invested = OLD.total_invested;
    NEW.total_profit = OLD.total_profit;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_protect_financials
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_financial_columns();

-- 3. ROI AUTOMATION FUNCTION
-- This can be called to process all pending rewards
CREATE OR REPLACE FUNCTION public.process_daily_rewards()
RETURNS void AS $$
DECLARE
  _inv RECORD;
  _reward NUMERIC;
BEGIN
  FOR _inv IN 
    SELECT i.*, p.name as plan_name 
    FROM public.investments i
    JOIN public.plans p ON i.plan_id = p.id
    WHERE i.status = 'active' 
    AND (i.last_reward_at IS NULL OR i.last_reward_at <= now() - interval '24 hours')
  LOOP
    _reward := _inv.amount * (_inv.daily_roi_percent / 100);
    
    -- Update investment
    UPDATE public.investments 
    SET total_earnings = total_earnings + _reward,
        last_reward_at = now()
    WHERE id = _inv.id;
    
    -- Update user profile
    UPDATE public.profiles 
    SET profit_balance = profit_balance + _reward,
        total_profit = total_profit + _reward
    WHERE id = _inv.user_id;
    
    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (_inv.user_id, _reward, 'roi', 'Daily ROI from ' || _inv.plan_name);
    
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
