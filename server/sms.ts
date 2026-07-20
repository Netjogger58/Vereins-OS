/**
 * SMS Gateway Integratioun (Mixvoip/Voxbi)
 * 
 * Wann keng MIXVOIP_API_KEY konfiguréiert ass, gëtt d'SMS just an der Console geloggt.
 * Fir Produktioun: Mixvoip Account erstellen → API Key als env var setzen.
 */

const MIXVOIP_API_KEY = process.env.MIXVOIP_API_KEY;
const MIXVOIP_SENDER = process.env.MIXVOIP_SENDER || "M75";
const MIXVOIP_API_URL = process.env.MIXVOIP_API_URL || "https://api.voxbi.com/v1/sms";

export interface SendSMSResult {
  success: boolean;
  error?: string;
}

/**
 * Schéckt eng SMS un eng bestëmmt Nummer.
 * @param to Vollständig Nummer mat Lännercode (z.B. "+352621123456")
 * @param message Den SMS Text
 */
export async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  if (!MIXVOIP_API_KEY) {
    console.log(`[SMS Fallback] An ${to}: ${message}`);
    return { success: true };
  }

  try {
    const response = await fetch(MIXVOIP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MIXVOIP_API_KEY}`,
      },
      body: JSON.stringify({
        from: MIXVOIP_SENDER,
        to: to,
        message: message,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[SMS] Mixvoip API error ${response.status}:`, text);
      return { success: false, error: `SMS API error: ${response.status}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[SMS] Failed to send SMS:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generéiert en 6-stellige Validatiouns-Code
 */
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * OTP Code Späicherung (in-memory, mat Expiry)
 */
interface OTPEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  memberId: number;
}

const otpStore = new Map<string, OTPEntry>();

/**
 * Späichert en OTP Code fir eng bestëmmt Telefonnummer
 */
export function storeOTP(phone: string, code: string, memberId: number, ttlMs = 10 * 60 * 1000) {
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0,
    memberId,
  });
}

/**
 * Verifizéiert en OTP Code
 */
export function verifyOTP(phone: string, code: string): { valid: boolean; memberId?: number; error?: string } {
  const entry = otpStore.get(phone);
  if (!entry) return { valid: false, error: "Kein Code angefordert oder abgelaufen" };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, error: "Code abgelaufen" };
  }
  if (entry.attempts >= 5) {
    otpStore.delete(phone);
    return { valid: false, error: "Zu viele Fehlversuche" };
  }
  entry.attempts++;
  if (entry.code !== code) {
    return { valid: false, error: "Falscher Code" };
  }
  const memberId = entry.memberId;
  otpStore.delete(phone);
  return { valid: true, memberId };
}

/**
 * Läscht en OTP Code (z.B. no erfolgreicher Registratioun)
 */
export function clearOTP(phone: string) {
  otpStore.delete(phone);
}

/**
 * Normaliséiert eng Telefonnummer fir Vergläich
 * Eweiderleerz, Bindestricher a Lännercode-Prefixe ginn entfernt
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").replace(/^00/, "+");
}
