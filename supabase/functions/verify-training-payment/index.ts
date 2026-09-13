// @ts-ignore - the workspace TypeScript service does not resolve Deno URL imports.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEPOSIT_AMOUNT = 2500000;

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!paystackSecret || !supabaseUrl || !serviceRoleKey) {
    return response({ error: "Payment verification is not configured" }, 500);
  }

  try {
    const body = await request.json();
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!reference || !email) return response({ error: "Email and payment reference are required" }, 400);

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } },
    );
    const verification = await verifyResponse.json();
    const transaction = verification?.data;
    const transactionEmail = transaction?.customer?.email?.toLowerCase();

    if (
      !verifyResponse.ok ||
      verification?.status !== true ||
      transaction?.status !== "success" ||
      transaction?.currency !== "NGN" ||
      transaction?.amount !== DEPOSIT_AMOUNT ||
      transactionEmail !== email
    ) {
      return response({ error: "Training payment could not be verified" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("training_payments")
      .upsert({
        email,
        amount: DEPOSIT_AMOUNT / 100,
        currency: "NGN",
        payment_reference: reference,
        status: "deposit_paid",
        updated_at: new Date().toISOString(),
      }, { onConflict: "payment_reference" })
      .select("id, email, amount, currency, payment_reference, status")
      .single();

    if (error) {
      console.error(error);
      return response({ error: "Payment verified but could not be recorded" }, 500);
    }

    return response({ ok: true, payment: data });
  } catch (error) {
    console.error(error);
    return response({ error: "Invalid payment verification request" }, 400);
  }
});
