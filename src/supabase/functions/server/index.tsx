import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// =====================================================
// 🔐 AUTH ENDPOINT - Signup with auto-confirmed email
// =====================================================
app.post("/make-server-af6f0d00/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, user_metadata } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Create Supabase client with SERVICE_ROLE_KEY (admin access)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: user_metadata || {},
      // ✅ Auto-confirm email since email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      console.error('❌ Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created with auto-confirmed email:', data.user?.id);

    return c.json({ 
      success: true, 
      user: data.user,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in signup endpoint:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-af6f0d00/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);