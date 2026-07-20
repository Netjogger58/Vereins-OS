import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest, queryClient, setAuthToken, getAuthToken } from "./queryClient";
import type { PublicUser } from "@shared/schema";

export interface TwoFaChallenge {
  twoFactorRequired: true;
  challenge: string;
  maskedEmail: string;
}

const DEVICE_KEY = "m75_device";
const getDeviceToken = () => localStorage.getItem(DEVICE_KEY) || undefined;

interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<TwoFaChallenge | void>;
  cardLogin: (cardId: string) => Promise<TwoFaChallenge | { name: string; clubFunction?: string }>;
  adminLogin: (email: string, password: string) => Promise<TwoFaChallenge | void>;
  verifyTwoFactor: (challenge: string, code: string, trustDevice: boolean) => Promise<{ memberName?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: PublicUser | null) => void;
  identifyMember: (firstName: string, lastName: string, birthdate: string) => Promise<{ found: boolean; memberId?: number; name?: string; hasPhone?: boolean; hasEmail?: boolean; phoneOwner?: string | null; reason?: string }>;
  registerOtp: (memberId: number, countryCode?: string) => Promise<{ success: boolean; method: string; masked: string; fallback?: boolean }>;
  registerComplete: (memberId: number, otpCode: string, pin: string, method?: string, countryCode?: string) => Promise<TwoFaChallenge | { name: string; clubFunction?: string }>;
  pinLogin: (firstName: string, lastName: string, birthdate: string, pin: string) => Promise<TwoFaChallenge | { name: string; clubFunction?: string }>;
  pinResetRequest: (firstName: string, lastName: string, birthdate: string, countryCode?: string) => Promise<{ success: boolean; method: string; masked: string; memberId: number; fallback?: boolean }>;
  pinResetComplete: (memberId: number, otpCode: string, pin: string, method?: string, countryCode?: string) => Promise<TwoFaChallenge | { name: string; clubFunction?: string }>;
}

const Ctx = createContext<AuthCtx | null>(null);

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers,
        credentials: "include",
      });
      if (res.ok) setUser(await res.json());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string): Promise<TwoFaChallenge | void> => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password, deviceToken: getDeviceToken() });
    const data = await res.json();
    if (data.twoFactorRequired) return data as TwoFaChallenge;
    // Store token in memory for Bearer auth (cookie won't work in iframe)
    if (data._token) {
      setAuthToken(data._token);
    }
    // Strip internal field before storing user
    const { _token, ...userdata } = data;
    setUser(userdata as PublicUser);
  };

  const cardLogin = async (cardId: string): Promise<TwoFaChallenge | { name: string; clubFunction?: string }> => {
    const res = await apiRequest("POST", "/api/auth/card-login", { cardId, deviceToken: getDeviceToken() });
    const data = await res.json();
    if (data.twoFactorRequired) return data as TwoFaChallenge;
    if (data._token) setAuthToken(data._token);
    const { _token, memberName, clubFunction, ...userdata } = data;
    setUser(userdata as PublicUser);
    return { name: memberName as string, clubFunction: clubFunction as string | undefined };
  };

  const adminLogin = async (email: string, password: string): Promise<TwoFaChallenge | void> => {
    const res = await apiRequest("POST", "/api/auth/admin-login", { email, password, deviceToken: getDeviceToken() });
    const data = await res.json();
    if (data.twoFactorRequired) return data as TwoFaChallenge;
    if (data._token) setAuthToken(data._token);
    const { _token, ...userdata } = data;
    setUser(userdata as PublicUser);
  };

  const verifyTwoFactor = async (challenge: string, code: string, trustDevice: boolean) => {
    const res = await apiRequest("POST", "/api/auth/2fa/verify", { challenge, code, trustDevice });
    const data = await res.json();
    if (data._token) setAuthToken(data._token);
    if (data._deviceToken) localStorage.setItem(DEVICE_KEY, data._deviceToken);
    const { _token, _deviceToken, memberName, clubFunction, ...userdata } = data;
    setUser(userdata as PublicUser);
    return { memberName: memberName as string | undefined };
  };

  const logout = async () => {
    try { await apiRequest("POST", "/api/auth/logout"); } catch {}
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  };

  const identifyMember = async (firstName: string, lastName: string, birthdate: string) => {
    const res = await apiRequest("POST", "/api/auth/identify-member", { firstName, lastName, birthdate });
    return await res.json();
  };

  const registerOtp = async (memberId: number, countryCode = "+352") => {
    const res = await apiRequest("POST", "/api/auth/register-otp", { memberId, countryCode });
    return await res.json();
  };

  const registerComplete = async (memberId: number, otpCode: string, pin: string, method = "sms", countryCode = "+352") => {
    const res = await apiRequest("POST", "/api/auth/register-complete", { memberId, otpCode, pin, method, countryCode });
    const data = await res.json();
    if (data.twoFactorRequired) return data as TwoFaChallenge;
    if (data._token) setAuthToken(data._token);
    const { _token, memberName, clubFunction, ...userdata } = data;
    setUser(userdata as PublicUser);
    return { name: memberName as string, clubFunction: clubFunction as string | undefined };
  };

  const pinLogin = async (firstName: string, lastName: string, birthdate: string, pin: string) => {
    const res = await apiRequest("POST", "/api/auth/pin-login", { firstName, lastName, birthdate, pin, deviceToken: getDeviceToken() });
    const data = await res.json();
    if (data.twoFactorRequired) return data as TwoFaChallenge;
    if (data._token) setAuthToken(data._token);
    const { _token, memberName, clubFunction, ...userdata } = data;
    setUser(userdata as PublicUser);
    return { name: memberName as string, clubFunction: clubFunction as string | undefined };
  };

  const pinResetRequest = async (firstName: string, lastName: string, birthdate: string, countryCode = "+352") => {
    const res = await apiRequest("POST", "/api/auth/pin-reset-request", { firstName, lastName, birthdate, countryCode });
    return await res.json();
  };

  const pinResetComplete = async (memberId: number, otpCode: string, pin: string, method = "sms", countryCode = "+352") => {
    const res = await apiRequest("POST", "/api/auth/pin-reset-complete", { memberId, otpCode, pin, method, countryCode });
    const data = await res.json();
    if (data.twoFactorRequired) return data as TwoFaChallenge;
    if (data._token) setAuthToken(data._token);
    const { _token, memberName, clubFunction, ...userdata } = data;
    setUser(userdata as PublicUser);
    return { name: memberName as string, clubFunction: clubFunction as string | undefined };
  };

  return (
    <Ctx.Provider value={{ user, loading, login, cardLogin, adminLogin, verifyTwoFactor, logout, refresh, setUser, identifyMember, registerOtp, registerComplete, pinLogin, pinResetRequest, pinResetComplete }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
