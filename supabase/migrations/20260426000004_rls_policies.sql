-- RLS POLICIES FOR ADMIN ACCESS

-- 1. PLANS
-- Allow admins to insert/update/delete plans
CREATE POLICY "admin_manage_plans" ON public.plans
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. DEPOSITS
-- Allow admins to see all deposits
CREATE POLICY "admin_read_all_deposits" ON public.deposits
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to update deposits (e.g. status)
CREATE POLICY "admin_update_deposits" ON public.deposits
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. WITHDRAWALS
-- Allow admins to see all withdrawals
CREATE POLICY "admin_read_all_withdrawals" ON public.withdrawals
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to update withdrawals
CREATE POLICY "admin_update_withdrawals" ON public.withdrawals
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. USER ROLES
-- Allow admins to manage roles
CREATE POLICY "admin_manage_roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. TRANSACTIONS
-- Already has a read policy, adding write for admin if needed (though usually done via RPC)
CREATE POLICY "admin_manage_transactions" ON public.transactions
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
