-- 1. ENUMS AND ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security helper for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. PROFILES (Users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT,
  email TEXT,
  country TEXT,
  phone TEXT,
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  profit_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_invested NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_profit NUMERIC(14,2) NOT NULL DEFAULT 0,
  custom_roi_bonus NUMERIC(5,2) NOT NULL DEFAULT 0,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. AUTOMATION: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, country, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );

  SELECT COUNT(*) INTO user_count FROM auth.users;
  -- Make the first user an admin automatically
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- PLANS
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  min_amount NUMERIC(14,2) NOT NULL,
  max_amount NUMERIC(14,2) NOT NULL,
  daily_roi_pct NUMERIC(5,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- INVESTMENTS
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  amount NUMERIC(14,2) NOT NULL,
  daily_roi_percent NUMERIC(5,2) NOT NULL,
  total_earnings NUMERIC(14,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reward_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'roi', 'investment', 'reinvest'
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- DEPOSITS & WITHDRAWALS
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  token TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  token TEXT NOT NULL,
  network TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;


-- Profiles: Users read/update own; Admins all
CREATE POLICY "profile self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profile self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Investments & Transactions: User own only
CREATE POLICY "inv self read" ON public.investments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "tx self read" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Plans: Everyone reads active plans
CREATE POLICY "plans read" ON public.plans FOR SELECT TO authenticated USING (true);


-- Function to create an investment and update balance
CREATE OR REPLACE FUNCTION public.create_investment(_plan_id UUID, _amount NUMERIC)
RETURNS public.investments
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _uid UUID := auth.uid();
  _plan public.plans;
  _new_inv public.investments;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _plan FROM public.plans WHERE id = _plan_id AND is_active;
  
  IF _plan.id IS NULL THEN RAISE EXCEPTION 'Plan not found'; END IF;

  -- Logic to deduct from balance and insert investment
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

  RETURN _new_inv;
END $$;


INSERT INTO public.plans (name, tier, min_amount, max_amount, daily_roi_pct, sort_order) VALUES
('Starter', 'Starter', 100, 500, 5.0, 1),
('Premium', 'Premium', 501, 1000, 7.0, 2),
('Elite', 'Elite', 1001, 1500, 10.0, 3),
('Royal', 'Royal', 1501, 2000, 12.0, 4);
