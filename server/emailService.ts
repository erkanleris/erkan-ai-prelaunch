import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

export type SendEmailResult = {
  sent: boolean;
  error?: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  const parsedPort = Number(port);
  return {
    host,
    port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587,
    secure: parsedPort === 465,
    auth: { user, pass },
  };
}

function buildWelcomeHtml(params: {
  fullName: string;
  email: string;
  age: number;
  profession: string;
  username: string;
  registrationId: string;
  dateAr: string;
}): string {
  const { fullName, age, profession, username, dateAr } = params;
  const LOGO_URL = "https://erkan-ai-prelaunch.manus.space/manus-storage/erkan-logo_3a933153.png";
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#050914;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050914;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0b1226;border:1px solid rgba(96,165,250,0.25);border-radius:20px;overflow:hidden;">
      <tr>
        <td align="center" style="padding:40px 30px 20px;background:linear-gradient(135deg,#0b1226 0%,#101b40 55%,#1a1040 100%);">
          <img src="${LOGO_URL}" alt="ERKAN AI" width="140" height="140" style="display:block;margin:0 auto;border-radius:30px;"/>
          <h1 style="margin:18px 0 4px;font-size:26px;color:#ffffff;letter-spacing:2px;">ERKAN AI</h1>
          <p style="margin:0;font-size:14px;color:#93c5fd;letter-spacing:1px;">Built for the next generation</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 36px 28px;">
          <h2 style="margin:0 0 14px;font-size:22px;color:#ffffff;">تم حجز مقعدك بنجاح! 🎉</h2>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#cbd5e1;">
            أهلاً بك <strong style="color:#ffffff;">${escapeHtml(fullName)}</strong>،<br/>
            شكراً لثقتك بنا! تم تسجيلك رسمياً في قائمة المسجلين المسبقين لتطبيق <strong style="color:#93c5fd;">ERKAN AI</strong>.
            احتفظ بهذه الرسالة، فستحتاجها عند الإطلاق.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 22px;">
            <tr>
              <td style="padding:14px 18px;border:1px solid rgba(96,165,250,0.3);border-radius:12px 12px 0 0;">
                <span style="font-size:11px;color:#94a3b8;letter-spacing:1px;">اسمك المحجوز</span><br/>
                <span style="font-size:18px;color:#60a5fa;font-weight:bold;">@${escapeHtml(username)}</span>
              </td>
              <td style="padding:14px 18px;border:1px solid rgba(96,165,250,0.3);border-right:none;border-radius:12px 12px 0 0;">
                <span style="font-size:11px;color:#94a3b8;letter-spacing:1px;">رقم الحجز</span><br/>
                <span style="font-size:18px;color:#a78bfa;font-weight:bold;">${escapeHtml(params.registrationId)}</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:10px 18px 14px;border:1px solid rgba(96,165,250,0.3);border-top:none;border-radius:0 0 12px 12px;">
                <span style="font-size:11px;color:#94a3b8;letter-spacing:1px;">تاريخ التسجيل</span><br/>
                <span style="font-size:14px;color:#e2e8f0;">${escapeHtml(dateAr)}</span>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:10px 0 22px;background-color:rgba(15,23,42,0.6);border:1px solid rgba(96,165,250,0.18);border-radius:14px;overflow:hidden;">
            <tr>
              <td colspan="2" style="padding:12px 18px;font-size:13px;font-weight:bold;color:#93c5fd;letter-spacing:1px;border-bottom:1px solid rgba(96,165,250,0.18);background-color:rgba(37,99,235,0.08);">بيانات تسجيلك المسبق</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;width:34%;border-bottom:1px solid rgba(96,165,250,0.12);">الاسم الكامل</td>
              <td style="padding:10px 18px;font-size:14px;color:#e2e8f0;border-bottom:1px solid rgba(96,165,250,0.12);">${escapeHtml(fullName)}</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(96,165,250,0.12);">البريد الإلكتروني</td>
              <td style="padding:10px 18px;font-size:14px;color:#e2e8f0;border-bottom:1px solid rgba(96,165,250,0.12);" dir="ltr">${escapeHtml(params.email)}</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(96,165,250,0.12);">العمر</td>
              <td style="padding:10px 18px;font-size:14px;color:#e2e8f0;border-bottom:1px solid rgba(96,165,250,0.12);">${escapeHtml(String(age))}</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(96,165,250,0.12);">المهنة</td>
              <td style="padding:10px 18px;font-size:14px;color:#e2e8f0;border-bottom:1px solid rgba(96,165,250,0.12);">${escapeHtml(profession)}</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(96,165,250,0.12);">اسم المستخدم</td>
              <td style="padding:10px 18px;font-size:14px;color:#60a5fa;font-weight:bold;border-bottom:1px solid rgba(96,165,250,0.12);" dir="ltr">@${escapeHtml(username)}</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(96,165,250,0.12);">رقم الحجز</td>
              <td style="padding:10px 18px;font-size:14px;color:#a78bfa;font-weight:bold;letter-spacing:1px;border-bottom:1px solid rgba(96,165,250,0.12);">${escapeHtml(params.registrationId)}</td>
            </tr>
            <tr>
              <td style="padding:10px 18px;font-size:12px;color:#94a3b8;">تاريخ التسجيل</td>
              <td style="padding:10px 18px;font-size:14px;color:#e2e8f0;">${escapeHtml(dateAr)}</td>
            </tr>
          </table>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#cbd5e1;">
            اسم المستخدم الخاص بك <strong style="color:#60a5fa;">@${escapeHtml(username)}</strong> محجوز حصرياً لك،
            وستكون من <strong style="color:#ffffff;">الأوائل</strong> في الوصول إلى التطبيق عند الإطلاق الرسمي.
          </p>
          <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
            مع أطيب التحيات،<br/>
            <strong style="color:#93c5fd;">فريق ERKAN AI</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:18px 30px;background-color:#070c1c;border-top:1px solid rgba(96,165,250,0.15);">
          <p style="margin:0;font-size:12px;color:#64748b;">© 2026 ERKAN AI. جميع الحقوق محفوظة.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendWelcomeEmail(params: {
  to: string;
  fullName: string;
  email: string;
  age: number;
  profession: string;
  username: string;
  registrationId: string;
  dateAr: string;
}): Promise<SendEmailResult> {
  const config = getSmtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP_CONFIG_MISSING" };
  }
  let transporter: nodemailer.Transporter | null = null;
  try {
    transporter = nodemailer.createTransport(config);
    await transporter.verify();

    await transporter.sendMail({
      from: `"ERKAN AI" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: "🎉 تم حجز مقعدك في ERKAN AI — مرحباً بك!",
      html: buildWelcomeHtml(params),
      text:
        "مرحباً! تم حجز مقعدك بنجاح في ERKAN AI.\n\n" +
        `بيانات تسجيلك:\n` +
        `الاسم الكامل: ${params.fullName}\n` +
        `البريد الإلكتروني: ${params.email}\n` +
        `العمر: ${params.age}\n` +
        `المهنة: ${params.profession}\n` +
        `اسمك المحجوز: @${params.username}\n` +
        `رقم الحجز: ${params.registrationId}\n` +
        `تاريخ التسجيل: ${params.dateAr}\n\n` +
        "احتفظ بهذه الرسالة. شكراً لثقتك بنا — فريق ERKAN AI",
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Failed to send welcome email:", message);
    return { sent: false, error: message };
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
}
