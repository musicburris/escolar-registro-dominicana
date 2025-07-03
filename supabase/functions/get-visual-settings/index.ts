import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // First try to get global settings, then user-specific settings
    const { data: settings, error: fetchError } = await supabaseClient
      .from("visual_settings")
      .select("*")
      .or(`is_global.eq.true,user_id.eq.${user.id}`)
      .order('is_global', { ascending: false }) // Global settings first
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const defaultSettings = {
      primary_color: '#0D3B66',
      secondary_color: '#137547',
      accent_color: '#DC2626',
      font_family: 'Inter',
      font_size: '16',
      theme: 'light',
      logo_url: '',
      site_name: 'Sistema Educativo MINERD',
      subtitle: 'Gestión Escolar Integral'
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: settings || defaultSettings
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching visual settings:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});