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

type OrderInput = {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  items: Array<{ name: string; qty: number; unit_price: number }>;
  total: number;
  notes?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!paystackSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Payment verification is not configured" }, 500);
  }

  try {
    const body = await request.json();
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    const order = body.order as OrderInput;

    if (!reference || !order?.email || !Number.isFinite(order.total)) {
      return jsonResponse({ error: "Reference and order details are required" }, 400);
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } },
    );
    const verification = await verifyResponse.json();
    const transaction = verification?.data;
    const expectedAmount = Math.round(order.total * 100);

    if (
      !verifyResponse.ok ||
      verification?.status !== true ||
      transaction?.status !== "success" ||
      transaction?.currency !== "NGN" ||
      transaction?.amount !== expectedAmount ||
      transaction?.customer?.email?.toLowerCase() !== order.email.toLowerCase()
    ) {
      return jsonResponse({ error: "Payment could not be verified" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        full_name: order.full_name,
        phone: order.phone,
        email: order.email,
        address: order.address + (order.notes ? `. Notes: ${order.notes}` : ""),
        items: order.items,
        total: order.total,
        payment_reference: reference,
        status: "paid",
      })
      .select("id, payment_reference, status")
      .single();

    if (error) {
      if (error.code === "23505") return jsonResponse({ ok: true, order: data });
      console.error(error);
      return jsonResponse({ error: "Payment verified but order could not be saved" }, 500);
    }

    return jsonResponse({ ok: true, order: data });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: "Invalid payment verification request" }, 400);
  }
});
