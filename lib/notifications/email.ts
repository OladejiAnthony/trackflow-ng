import { Resend } from "resend";

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_PROD_URL ?? "https://trackflow-ng.vercel.app";

export async function sendFamilyInviteEmail({
  toEmail,
  inviteCode,
  familyName,
}: {
  toEmail: string;
  inviteCode: string;
  familyName: string;
}) {
  const registerUrl = `${APP_URL}/register?invite=${encodeURIComponent(inviteCode)}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `You've been invited to join ${familyName} on TrackFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
        <h2 style="color:#6366f1;margin-bottom:8px">You're invited to TrackFlow</h2>
        <p style="color:#334155">You've been invited to join the <strong>${familyName}</strong> family group on TrackFlow — a smart finance tracker for Nigerians.</p>
        <p style="color:#334155">Click the button below to create your account and join the family:</p>
        <a href="${registerUrl}"
           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0">
          Accept Invite &amp; Register
        </a>
        <p style="color:#64748b;font-size:14px;margin-top:24px">Or register manually at <a href="${APP_URL}/register" style="color:#6366f1">${APP_URL}/register</a> and enter this invite code:</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px 20px;margin:12px 0;text-align:center">
          <span style="font-family:monospace;font-size:28px;font-weight:700;letter-spacing:0.25em;color:#0f172a">${inviteCode}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">
          This invite expires in 7 days. If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
}
