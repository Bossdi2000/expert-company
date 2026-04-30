-- UPDATE ADMIN WALLETS WITH THE NEW ADDRESSES
-- Run this in the Supabase SQL Editor

-- 1. Clear existing placeholder wallets
DELETE FROM public.admin_wallets;

-- 2. Insert the new production wallets
INSERT INTO public.admin_wallets (token, network, address, is_active) VALUES 
('USDT', 'TRC-20', 'TLP9c1BpnxJXW7DdS6awAha9uU9CevCfze', true),
('USDT/USDC', 'EVM (ERC-20/BEP-20)', '0xA821B62f63569b3DAB093Abc3222a779B2ee1D1D', true);

-- Verify the update
SELECT * FROM public.admin_wallets;
