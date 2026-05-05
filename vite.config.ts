import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// Custom Vite plugin to handle /api/* locally
const apiPlugin = (env: Record<string, string>) => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api', async (req: any, res: any) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const endpoint = url.pathname;

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.end();
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end(JSON.stringify({ error: "Method not allowed" }));
      }

      let body = '';
      req.on('data', (chunk: any) => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (endpoint === '/send-email') {
            const apiKey = env.VITE_RESEND_API_KEY || env.RESEND_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: "RESEND_API_KEY not found" }));
            }

            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                from: "Expert Invests <noreply@expertinvest.xyz>",
                to: [data.user_id || "test@example.com"],
                subject: data.kind === "send_otp" ? `[Expert Invests] Your Verification Code: ${data.code}` : "Expert Invests Notification",
                html: data.kind === "send_otp" ? `<p>Your code is: ${data.code}</p>` : "<p>Notification from Expert Invests</p>",
              }),
            });

            const result = await response.json();
            res.statusCode = response.ok ? 200 : response.status;
            return res.end(JSON.stringify(result));
          }

          if (endpoint === '/admin-delete-user') {
            const { createClient } = await import("@supabase/supabase-js");
            const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
            const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: "Missing VITE_SUPABASE_URL in .env" }));
            }
            if (!serviceKey) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env" }));
            }

            const supabaseAdmin = createClient(supabaseUrl, serviceKey);
            
            // Verify admin
            const { data: roleData } = await supabaseAdmin
              .from('user_roles')
              .select('role')
              .eq('user_id', data.adminId)
              .single();

            if (roleData?.role !== 'admin') {
              res.statusCode = 403;
              return res.end(JSON.stringify({ error: "Unauthorized" }));
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
            if (error) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: error.message }));
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({ ok: true }));
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: "Endpoint not found" }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      apiPlugin(env),
      TanStackRouterVite(),
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
  };
});
