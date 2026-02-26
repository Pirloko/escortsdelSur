// Edge Function: crea usuario en Auth y lo asocia a un perfil de escort (usuario registrado).
// Solo puede ser llamada por un admin (JWT en Authorization).
// Body: { escort_profile_id: string, email: string, password: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Falta Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "").trim();
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    const callerId = userData?.user?.id;
    if (userError || !callerId) {
      return new Response(
        JSON.stringify({
          error: "No autorizado",
          detail: userError?.message ?? "Token inválido o caducado",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .single();
    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Solo un admin puede dar acceso" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { escort_profile_id, email, password } = body;
    if (!escort_profile_id || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Faltan escort_profile_id, email o password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { role: "registered_user", must_change_password: true },
    });
    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!newUser.user) {
      return new Response(JSON.stringify({ error: "No se creó el usuario" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateEscortError } = await supabaseAdmin
      .from("escort_profiles")
      .update({ user_id: newUser.user.id, updated_at: new Date().toISOString() })
      .eq("id", escort_profile_id);
    if (updateEscortError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: updateEscortError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin.from("profiles").upsert(
      {
        id: newUser.user.id,
        role: "registered_user",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuario creado. Que use este correo y contraseña para entrar en /login y editar su perfil en /cuenta.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
