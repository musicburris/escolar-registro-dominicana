import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogActivityRequest {
  action: string;
  details?: any;
  userAgent?: string;
  ipAddress?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    const user = userData.user;
    const body: LogActivityRequest = await req.json();

    // Get client IP address
    const clientIP = req.headers.get("x-forwarded-for") || 
                    req.headers.get("x-real-ip") || 
                    body.ipAddress || 
                    "unknown";

    // Get user agent
    const userAgent = req.headers.get("user-agent") || body.userAgent || "unknown";

    // Insert activity log
    const { error: insertError } = await supabaseClient
      .from("activity_logs")
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
        action: body.action,
        details: body.details || {},
        ip_address: clientIP,
        user_agent: userAgent,
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Activity logged successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error logging activity:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});