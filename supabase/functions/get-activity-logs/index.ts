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
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const action = url.searchParams.get("action");
    const userFilter = url.searchParams.get("user");

    // Build query
    let query = supabaseClient
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters based on user role
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      // Non-admin users can only see their own logs
      query = query.eq("user_id", user.id);
    } else {
      // Admin can filter by specific user
      if (userFilter) {
        query = query.eq("user_email", userFilter);
      }
    }

    // Filter by action if specified
    if (action) {
      query = query.ilike("action", `%${action}%`);
    }

    const { data: logs, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    // Get total count for pagination
    let countQuery = supabaseClient
      .from("activity_logs")
      .select("*", { count: "exact", head: true });

    if (!isAdmin) {
      countQuery = countQuery.eq("user_id", user.id);
    }
    if (userFilter && isAdmin) {
      countQuery = countQuery.eq("user_email", userFilter);
    }
    if (action) {
      countQuery = countQuery.ilike("action", `%${action}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    return new Response(
      JSON.stringify({ 
        logs,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});