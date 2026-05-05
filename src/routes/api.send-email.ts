import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Expert Invests <noreply@expertinvest.xyz>";
const BRAND = "#0d7a5f"; // Emerald Prestige primary

type EmailKind =
  | "welcome"
  | "deposit_submitted"
  | "deposit_approved"
  | "deposit_rejected"
  | "withdrawal_requested"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "send_otp";

type Body = {
  kind: EmailKind;
  user_id?: string;
  deposit_id?: string;
  withdrawal_id?: string;
  amount?: string | number;
  token?: string;
  code?: string;
};

const layout = (title: string, body: string) => `
<!doctype html><html><body style="margin:0;background:#f6f7f5;font-family:Inter,system-ui,sans-serif;color:#0f1b1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:13px;letter-spacing:0.3em;color:${BRAND};text-transform:uppercase;font-weight:700;">Expert Invests</div>
    </div>
    <div style="background:#ffffff;border:1px solid #e6ece9;border-radius:24px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f1b1a;">${title}</h1>
      ${body}
    </div>
    <p style="margin:24px 0 0;text-align:center;font-size:11px;color:#7a8784;">
      You're receiving this because you have an account at Expert Invests.
    </p>
  </div>
</body></html>`;

const button = (label: string, url: string) =>
  `<a href="${url}" style="display:inline-block;padding:12px 24px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${label}</a>`;

async function sendResend(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<Response> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  return fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
}

export const Route = createFileRoute("/api/send-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const reqBody = await request.text();
          if (!reqBody) throw new Error("Empty request body");
          const body = JSON.parse(reqBody) as Body;

          const adminEmail = import.meta.env.VITE_ADMIN_NOTIFY_EMAIL || undefined;
          const origin = new URL(request.url).origin;

          // Resolve user from related record when needed
          let userEmail: string | undefined;
          let userName: string | undefined;
          let amount = body.amount?.toString();
          let token = body.token;

          if (body.kind === "send_otp") {
            userEmail = body.user_id; // For OTP, we pass the email as user_id
          } else if (body.deposit_id) {
            const { data: dep } = await supabaseAdmin
              .from("deposits")
              .select("amount, token, user_id")
              .eq("id", body.deposit_id)
              .maybeSingle();
            if (dep) {
              amount = amount ?? String(dep.amount);
              token = token ?? dep.token;
              const { data: prof } = await supabaseAdmin
                .from("profiles")
                .select("email, full_name")
                .eq("id", dep.user_id)
                .maybeSingle();
              userEmail = prof?.email ?? undefined;
              userName = prof?.full_name ?? undefined;
            }
          } else if (body.withdrawal_id) {
            const { data: wd } = await supabaseAdmin
              .from("withdrawals")
              .select("amount, token, user_id")
              .eq("id", body.withdrawal_id)
              .maybeSingle();
            if (wd) {
              amount = amount ?? String(wd.amount);
              token = token ?? wd.token;
              const { data: prof } = await supabaseAdmin
                .from("profiles")
                .select("email, full_name")
                .eq("id", wd.user_id)
                .maybeSingle();
              userEmail = prof?.email ?? undefined;
              userName = prof?.full_name ?? undefined;
            }
          } else if (body.user_id) {
            const { data: prof } = await supabaseAdmin
              .from("profiles")
              .select("email, full_name")
              .eq("id", body.user_id)
              .maybeSingle();
            userEmail = prof?.email ?? undefined;
            userName = prof?.full_name ?? undefined;
          }

          const greet = userName ? `Hi ${userName.split(" ")[0]},` : "Hello,";
          const dashboardCta = button("Open dashboard", `${origin}/dashboard`);

          const sends: Promise<Response>[] = [];

          switch (body.kind) {
            case "welcome": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: "Welcome to Expert Invests",
                    html: layout(
                      "Welcome aboard 👑",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">Your Expert Invests account is live. Start by funding your wallet and pick a plan that fits your goals — from <b>Starter (1%/day)</b> all the way up to <b>Royal (7%/day)</b>.</p>
                       <p style="margin:24px 0;">${dashboardCta}</p>
                       <p style="font-size:12px;color:#7a8784;">If you have any questions, just reply to this email.</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "send_otp": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: `[Expert Invests] Your Verification Code: ${body.code}`,
                    html: layout(
                      "Expert Invests",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">You're welcome to EXPERTINVEST, enter the below OTP to confirm your account creation.</p>
                       <div style="margin:32px 0;text-align:center;">
                         <div style="display:inline-block;padding:16px 32px;background:#f0fdf4;border:2px dashed ${BRAND};border-radius:16px;font-family:monospace;font-size:32px;font-weight:800;letter-spacing:0.2em;color:${BRAND};">
                           ${body.code}
                         </div>
                       </div>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;font-weight:bold;text-align:center;">Security Notice:</p>
                       <p style="font-size:12px;color:#7a8784;text-align:center;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "deposit_submitted": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: `Deposit pending — $${amount}`,
                    html: layout(
                      "We're watching for your deposit",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">Your deposit of <b>$${amount}</b> in <b>${token}</b> has been registered. Send the exact amount to the wallet shown on your dashboard within 1 hour. We'll credit your balance as soon as it's confirmed.</p>
                       <p style="margin:24px 0;">${dashboardCta}</p>`,
                    ),
                  }),
                );
              }
              if (adminEmail) {
                sends.push(
                  sendResend({
                    to: adminEmail,
                    subject: `🟡 New deposit pending — $${amount}`,
                    html: layout(
                      "New deposit awaiting confirmation",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;"><b>${userName ?? userEmail ?? "A user"}</b> just submitted a deposit of <b>$${amount}</b> in <b>${token}</b>. Review and credit it from the admin console.</p>
                       <p style="margin:24px 0;">${button("Open admin → Deposits", `${origin}/admin/deposits`)}</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "deposit_approved": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: `Deposit confirmed — $${amount} credited`,
                    html: layout(
                      "Your deposit is confirmed ✅",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">We've received your <b>$${amount}</b> deposit and credited it to your account balance. You can now activate any investment plan.</p>
                       <p style="margin:24px 0;">${dashboardCta}</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "deposit_rejected": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: "Deposit not received",
                    html: layout(
                      "We couldn't confirm your deposit",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">We did not receive your <b>$${amount}</b> deposit within the 1-hour window. Please initiate a new deposit from your dashboard, or contact support if you believe this is an error.</p>
                       <p style="margin:24px 0;">${button("Try again", `${origin}/dashboard`)}</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "withdrawal_requested": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: `Withdrawal requested — $${amount}`,
                    html: layout(
                      "Withdrawal received",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">Your withdrawal of <b>$${amount}</b> in <b>${token}</b> is being processed. Most withdrawals complete within 24 hours.</p>
                       <p style="margin:24px 0;">${dashboardCta}</p>`,
                    ),
                  }),
                );
              }
              if (adminEmail) {
                sends.push(
                  sendResend({
                    to: adminEmail,
                    subject: `🔵 New withdrawal request — $${amount}`,
                    html: layout(
                      "New withdrawal awaiting approval",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;"><b>${userName ?? userEmail ?? "A user"}</b> requested a withdrawal of <b>$${amount}</b> in <b>${token}</b>.</p>
                       <p style="margin:24px 0;">${button("Open admin", `${origin}/admin`)}</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "withdrawal_approved": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: `Withdrawal sent — $${amount}`,
                    html: layout(
                      "Your withdrawal has been sent",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">Your <b>$${amount}</b> withdrawal in <b>${token}</b> has been broadcast to the network. It should arrive shortly.</p>`,
                    ),
                  }),
                );
              }
              break;
            }
            case "withdrawal_rejected": {
              if (userEmail) {
                sends.push(
                  sendResend({
                    to: userEmail,
                    subject: "Withdrawal rejected — funds returned",
                    html: layout(
                      "Withdrawal could not be processed",
                      `<p style="font-size:14px;line-height:1.6;color:#3a4744;">${greet}</p>
                       <p style="font-size:14px;line-height:1.6;color:#3a4744;">Your withdrawal of <b>$${amount}</b> was rejected and the amount has been refunded to your balance. Please contact support if you have questions.</p>
                       <p style="margin:24px 0;">${dashboardCta}</p>`,
                    ),
                  }),
                );
              }
              break;
            }
          }

          const results = await Promise.allSettled(sends);
          const hasError = results.some(r => r.status === 'rejected');

          return new Response(JSON.stringify({ ok: !hasError, sent: sends.length }), {
            status: hasError ? 500 : 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("Email API Error:", err);
          return new Response(
            JSON.stringify({ ok: false, error: err?.message || "Internal Server Error" }),
            { 
              status: 500, 
              headers: { "Content-Type": "application/json" } 
            },
          );
        }
      },
    },
  },
});
