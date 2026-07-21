import { apiRequest } from "./queryClient";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, c => c.charCodeAt(0));
}

export async function registerPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (Notification.permission === "denied") return false;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (sub) return true;
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;
  }
  const res = await apiRequest("GET", "/api/push/vapid-public-key");
  if (!res.ok) return false;
  const { publicKey } = await res.json();
  try {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
    await apiRequest("POST", "/api/push/subscribe", { subscription: sub.toJSON() });
    return true;
  } catch (e) {
    console.error("[push] subscribe failed", e);
    return false;
  }
}

export async function unregisterPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;
  await sub.unsubscribe();
  try { await apiRequest("POST", "/api/push/unsubscribe", { endpoint: sub.endpoint }); } catch {}
  return true;
}
