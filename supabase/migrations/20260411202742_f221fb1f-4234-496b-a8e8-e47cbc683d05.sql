UPDATE public.payment_settings 
SET 
  stripe_enabled = true,
  stripe_public_key = 'pk_live_51TIMRlEwrXRMorqglX1jVbTiTxyDp1YoCgnT7DBjlVUK7DHe2DDgUwMk3OtqWbwBEZkorNYEKdyQniQYtnQBhzue00n4iEva3T',
  stripe_secret_key = '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',
  stripe_mode = 'live',
  one_time_enabled = true,
  updated_at = now()
WHERE id = '8e3b140a-477a-4104-9611-16af6cd45907';
