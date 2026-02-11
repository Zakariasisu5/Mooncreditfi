-- Create depin_projects table
CREATE TABLE public.depin_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  funding_goal DECIMAL(18, 2) NOT NULL DEFAULT 0,
  funding_current DECIMAL(18, 2) NOT NULL DEFAULT 0,
  funding_progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  roi DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.depin_projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view depin projects" 
ON public.depin_projects 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to update funding
CREATE POLICY "Authenticated users can update funding" 
ON public.depin_projects 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_depin_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.funding_progress = LEAST(100, GREATEST(0, ROUND((NEW.funding_current / NULLIF(NEW.funding_goal, 0)) * 100)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp and progress updates
CREATE TRIGGER update_depin_projects_updated_at
BEFORE UPDATE ON public.depin_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_depin_projects_updated_at();

-- Insert sample projects
INSERT INTO public.depin_projects (name, description, image, category, funding_goal, funding_current, status, roi) VALUES
('Solar Grid Network', 'Decentralized solar energy infrastructure with community ownership and renewable energy credits', '/placeholder.svg', 'Solar', 5000000, 3900000, 'active', 9.2),
('WiFi Mesh Expansion', 'Community-owned wireless network providing affordable internet access in underserved areas', '/placeholder.svg', 'WiFi', 3000000, 1860000, 'active', 7.8),
('EV Charging Hub', 'Blockchain-enabled electric vehicle charging stations with dynamic pricing and rewards', '/placeholder.svg', 'Mobility', 2000000, 1700000, 'active', 8.9),
('Helium Hotspot Network', 'IoT connectivity infrastructure powered by community-deployed wireless hotspots', '/placeholder.svg', 'WiFi', 1500000, 900000, 'active', 8.5);