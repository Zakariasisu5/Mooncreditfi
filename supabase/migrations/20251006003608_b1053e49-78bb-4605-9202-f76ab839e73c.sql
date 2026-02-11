-- Create user_contributions table to track funding history
CREATE TABLE public.user_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.depin_projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  ownership_percentage NUMERIC NOT NULL DEFAULT 0,
  nft_token_id TEXT,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own contributions
CREATE POLICY "Users can view their own contributions"
ON public.user_contributions
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their contributions
CREATE POLICY "Authenticated users can insert contributions"
ON public.user_contributions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster queries
CREATE INDEX idx_user_contributions_user_address ON public.user_contributions(user_address);
CREATE INDEX idx_user_contributions_project_id ON public.user_contributions(project_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_contributions_updated_at
  BEFORE UPDATE ON public.user_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_depin_projects_updated_at();