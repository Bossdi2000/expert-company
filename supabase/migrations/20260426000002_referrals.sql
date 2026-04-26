-- 1. ADD REFERRAL COLUMNS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC(14,2) NOT NULL DEFAULT 0;

-- 2. UPDATE HANDLE_NEW_USER TO SUPPORT REFERRALS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  referrer_id UUID;
BEGIN
  -- Extract referrer from metadata if present
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    referrer_id := (NEW.raw_user_meta_data->>'referred_by')::UUID;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, country, username, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    referrer_id
  );

  -- Increment referrer's count
  IF referrer_id IS NOT NULL THEN
    UPDATE public.profiles SET referral_count = referral_count + 1 WHERE id = referrer_id;
  END IF;

  SELECT COUNT(*) INTO user_count FROM auth.users;
  -- Make the first user an admin automatically
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END $$;

-- 3. FUNCTION TO AWARD REFERRAL COMMISSION
-- Should be called when a user makes their FIRST investment
CREATE OR REPLACE FUNCTION public.award_referral_commission(_user_id UUID, _amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _referrer_id UUID;
  _commission NUMERIC;
BEGIN
  -- Find the referrer
  SELECT referred_by INTO _referrer_id FROM public.profiles WHERE id = _user_id;
  
  IF _referrer_id IS NOT NULL THEN
    _commission := _amount * 0.05; -- 5% commission
    
    UPDATE public.profiles SET 
      balance = balance + _commission,
      referral_earnings = referral_earnings + _commission
    WHERE id = _referrer_id;
    
    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (_referrer_id, _commission, 'referral', 'Referral commission');
  END IF;
END;
$$;

-- 4. UPDATE CREATE_INVESTMENT TO CALL COMMISSION
CREATE OR REPLACE FUNCTION public.create_investment(_plan_id UUID, _amount NUMERIC)
RETURNS public.investments
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _uid UUID := auth.uid();
  _plan public.plans;
  _new_inv public.investments;
  _inv_count INT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _plan FROM public.plans WHERE id = _plan_id AND is_active;
  
  IF _plan.id IS NULL THEN RAISE EXCEPTION 'Plan not found'; END IF;

  -- Deduct from balance and insert investment
  UPDATE public.profiles SET 
    balance = balance - _amount,
    total_invested = total_invested + _amount
  WHERE id = _uid;
  
  INSERT INTO public.investments (user_id, plan_id, amount, daily_roi_percent)
  VALUES (_uid, _plan.id, _amount, _plan.daily_roi_pct)
  RETURNING * INTO _new_inv;
  
  -- Log transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (_uid, _amount, 'investment', 'Investment in ' || _plan.name);

  -- Check for referral commission (only on first investment)
  SELECT COUNT(*) INTO _inv_count FROM public.investments WHERE user_id = _uid;
  IF _inv_count = 1 THEN
    PERFORM public.award_referral_commission(_uid, _amount);
  END IF;

  RETURN _new_inv;
END $$;
