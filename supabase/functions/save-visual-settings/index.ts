import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisualSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: string;
  theme?: string;
  logoUrl?: string;
  siteName?: string;
  subtitle?: string;
  isGlobal?: boolean;
  settings?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
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
    const settings: VisualSettings = await req.json();

    // Check if user is admin for global settings
    const isAdmin = user.user_metadata?.role === 'admin';
    if (settings.isGlobal && !isAdmin) {
      throw new Error("Solo los administradores pueden cambiar configuraciones globales");
    }

    // Upsert visual settings
    const { data: result, error: upsertError } = await supabaseClient
      .from("visual_settings")
      .upsert({
        user_id: settings.isGlobal ? null : user.id,
        is_global: settings.isGlobal || false,
        primary_color: settings.primaryColor,
        secondary_color: settings.secondaryColor,
        accent_color: settings.accentColor,
        font_family: settings.fontFamily,
        font_size: settings.fontSize,
        theme: settings.theme,
        logo_url: settings.logoUrl,
        site_name: settings.siteName,
        subtitle: settings.subtitle,
        settings: settings.settings || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: settings.isGlobal ? 'is_global' : 'user_id'
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
      action: settings.isGlobal ? 'Configuración visual global actualizada' : 'Configuración visual personal actualizada',
      details: { 
        settingsId: result.id,
        isGlobal: settings.isGlobal,
        changes: settings 
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Configuración visual guardada exitosamente",
        data: result 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error saving visual settings:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});