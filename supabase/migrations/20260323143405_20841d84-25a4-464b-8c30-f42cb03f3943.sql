
-- Create kiosk_reservations table
CREATE TABLE public.kiosk_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kiosk_id INTEGER NOT NULL,
  kiosk_name TEXT NOT NULL,
  date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito')),
  payment_date DATE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(kiosk_id, date)
);

-- Create atv_reservations table
CREATE TABLE public.atv_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  ride_type TEXT NOT NULL CHECK (ride_type IN ('individual', 'dupla', 'adulto_crianca')),
  vehicle_count INTEGER NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito')),
  payment_date DATE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kiosk_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atv_reservations ENABLE ROW LEVEL SECURITY;

-- Allow all operations (admin system without auth for now)
CREATE POLICY "Allow all access to kiosk_reservations" ON public.kiosk_reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to atv_reservations" ON public.atv_reservations FOR ALL USING (true) WITH CHECK (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_kiosk_reservations_updated_at
  BEFORE UPDATE ON public.kiosk_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atv_reservations_updated_at
  BEFORE UPDATE ON public.atv_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
