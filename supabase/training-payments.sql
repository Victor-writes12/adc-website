CREATE TABLE IF NOT EXISTS public.training_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'NGN',
  payment_reference text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('deposit_paid', 'completed', 'refunded'))
);

ALTER TABLE public.training_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own training payment" ON public.training_payments;

CREATE POLICY "Students can view their own training payment"
ON public.training_payments
FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.jwt() ->> 'email'));

CREATE INDEX IF NOT EXISTS training_payments_email_status_idx
ON public.training_payments (lower(email), status);
