import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// Custom Vite plugin to handle /api/send-email locally
const apiPlugin = (env: Record<string, string>) => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api/send-email', (req: any, res: any) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const apiKey = env.VITE_RESEND_API_KEY;
            
            if (!apiKey) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: "VITE_RESEND_API_KEY not found in .env" }));
            }

            let to = data.user_id || "test@example.com";
            let subject = "Expert Invests Notification";
            let html = "<p>Message from Expert Invests</p>";
            
            // Extract email content based on kind
            if (data.kind === "send_otp") {
              subject = `[Expert Invests] Your Verification Code: ${data.code}`;
              html = `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px;">
                  <h2 style="color:#0d7a5f;text-align:center;">Expert Invests</h2>
                  <p style="font-size:14px;color:#333;">You're welcome to EXPERTINVEST, enter the below OTP to confirm your account creation.</p>
                  <div style="text-align:center;margin:30px 0;">
                    <span style="font-size:32px;font-weight:bold;letter-spacing:5px;color:#0d7a5f;background:#f0fdf4;padding:15px 30px;border-radius:10px;border:2px dashed #0d7a5f;">${data.code}</span>
                  </div>
                  <p style="font-size:12px;color:#888;text-align:center;">This code expires in 10 minutes.</p>
                </div>
              `;
            }

            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                from: "Expert Invests <noreply@expertinvest.xyz>",
                to: [to],
                subject,
                html,
              }),
            });

            const result = await response.json();
            
            if (!response.ok) {
              res.statusCode = response.status;
              return res.end(JSON.stringify({ error: result.message || "Resend API error" }));
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      } else {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed" }));
      }
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
