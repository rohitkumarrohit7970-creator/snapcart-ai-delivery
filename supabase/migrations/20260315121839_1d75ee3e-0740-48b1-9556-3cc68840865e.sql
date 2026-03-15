ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variety text DEFAULT '',
ADD COLUMN IF NOT EXISTS shelf_life text DEFAULT '',
ADD COLUMN IF NOT EXISTS best_before_days integer DEFAULT NULL;