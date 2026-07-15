import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { storage } from "./storage";
import type { InsertEmail } from "@shared/schema";

let transporter: Transporter | null = null;

export async function initEmailTransporter(): Promise<boolean> {
  const settings = await storage.getEmailSettings();
  if (!settings || !settings.enabled) {
    console.log("📧 Email not configured or disabled");
    return false;
  }

  try {
    transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // Verify connection
    await transporter!.verify();
    console.log("✅ Email transporter ready");
    return true;
  } catch (error) {
    console.error("❌ Email transporter failed:", error);
    return false;
  }
}

export async function sendEmail(
  email: InsertEmail,
  attachments?: { filename: string; path: string }[]
): Promise<{ success: boolean; error?: string }> {
  const settings = await storage.getEmailSettings();
  if (!settings || !settings.enabled || !transporter) {
    return { success: false, error: "Email not configured" };
  }

  try {
    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: email.toEmail,
      subject: email.subject,
      html: email.body,
      replyTo: settings.replyTo || settings.fromEmail,
      attachments,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

export async function queueEmail(email: InsertEmail): Promise<number> {
  const saved = await storage.createEmail(email);
  return saved.id;
}

export async function processPendingEmails(): Promise<void> {
  const pending = await storage.getPendingEmails();
  
  for (const email of pending) {
    const result = await sendEmail(email);
    await storage.markEmailSent(email.id, result.error);
    
    if (result.success) {
      console.log(`✅ Email ${email.id} sent to ${email.toEmail}`);
    } else {
      console.error(`❌ Email ${email.id} failed:`, result.error);
    }
  }
}

// Email templates
export function getWelcomeEmailTemplate(firstName: string, loginUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Willkommen beim M75 Manager!</h1>
      <p>Hallo ${firstName},</p>
      <p>Ihr Account wurde erfolgreich erstellt. Sie können sich jetzt anmelden:</p>
      <a href="${loginUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Jetzt anmelden
      </a>
      <p style="margin-top: 24px; color: #666; font-size: 12px;">
        Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
        ${loginUrl}
      </p>
    </div>
  `;
}

export function getFeeReminderTemplate(memberName: string, amount: number, dueDate: string | null, paymentUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Beitragszahlung erinnern</h1>
      <p>Hallo ${memberName},</p>
      <p>wir möchten Sie freundlich daran erinnern, dass Ihr Mitgliedsbeitrag noch offen ist:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 18px;"><strong>Betrag:</strong> ${amount.toFixed(2)} €</p>
        ${dueDate ? `<p style="margin: 8px 0 0 0;"><strong>Fällig bis:</strong> ${dueDate}</p>` : ""}
      </div>
      <p>Bitte überweisen Sie den Betrag auf unser Vereinskonto oder nutzen Sie die Online-Zahlung:</p>
      <a href="${paymentUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Online zahlen
      </a>
      <p style="margin-top: 24px; color: #666; font-size: 12px;">
        Bei Fragen wenden Sie sich bitte an unseren Kassenwart.
      </p>
    </div>
  `;
}

export function getSecurityAlertTemplate(ip: string, path: string, details: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">🚨 Sicherheitswarnung</h1>
      <p>Eine verdächtige Aktivität wurde erkannt:</p>
      <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
        <p style="margin: 0;"><strong>IP-Adresse:</strong> ${ip}</p>
        <p style="margin: 8px 0 0 0;"><strong>Pfad:</strong> ${path}</p>
        <p style="margin: 8px 0 0 0;"><strong>Details:</strong> ${details}</p>
      </div>
      <p>Bitte überprüfen Sie die Audit-Logs für weitere Informationen.</p>
    </div>
  `;
}

export function getRegistrationConfirmationTemplate(firstName: string, teamName: string | null): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Anmeldung eingegangen</h1>
      <p>Hallo ${firstName},</p>
      <p>wir haben Ihre Anmeldung${teamName ? ` für das Team "${teamName}"` : ""} erhalten.</p>
      <p>Unser Vorstand wird Ihre Anmeldung prüfen und sich in Kürze bei Ihnen melden.</p>
      <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Status:</strong> In Prüfung</p>
      </div>
      <p style="margin-top: 24px; color: #666; font-size: 12px;">
        Bei Fragen erreichen Sie uns unter info@mersch75.lu
      </p>
    </div>
  `;
}
