import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecuritySettings {
  twoFactorAuth?: boolean;
  sessionTimeout?: number;
  ipWhitelist?: boolean;
  allowedIps?: string[];
  locationRestriction?: boolean;
  activityLogging?: boolean;
  loginAttempts?: number;
  requireStrongPassword?: boolean;
  passwordExpiry?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

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
    if (user.user_metadata?.role !== 'admin') {
      throw new Error("Solo los administradores pueden cambiar configuraciones de seguridad");
    }

    const settings: SecuritySettings = await req.json();

    // Upsert security settings
    const { data: result, error: upsertError } = await supabaseClient
      .from("security_settings")
      .upsert({
        two_factor_auth: settings.twoFactorAuth,
        session_timeout: settings.sessionTimeout,
        ip_whitelist: settings.ipWhitelist,
        allowed_ips: settings.allowedIps,
        location_restriction: settings.locationRestriction,
        activity_logging: settings.activityLogging,
        login_attempts: settings.loginAttempts,
        require_strong_password: settings.requireStrongPassword,
        password_expiry: settings.passwordExpiry,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (upsertError) {
      throw upsertError;
    }

    // Log the activity
    await supabaseClient.from("activity_logs").insert({
      user_id: user.id,
      user_email: user.email!,
      user_name: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      action: 'Configuración de seguridad actualizada',
      details: { changes: settings }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Configuración de seguridad guardada exitosamente",
        data: result 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error saving security settings:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});