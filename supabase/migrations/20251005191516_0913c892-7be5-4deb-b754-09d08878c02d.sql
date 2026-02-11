-- Fix function search_path security issue
DROP TRIGGER IF EXISTS update_depin_projects_updated_at ON public.depin_projects;
DROP FUNCTION IF EXISTS public.update_depin_projects_updated_at();

CREATE OR REPLACE FUNCTION public.update_depin_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.funding_progress = LEAST(100, GREATEST(0, ROUND((NEW.funding_current / NULLIF(NEW.funding_goal, 0)) * 100)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_depin_projects_updated_at
BEFORE UPDATE ON public.depin_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_depin_projects_updated_at();