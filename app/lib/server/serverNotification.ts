import webpush from "web-push";

const VAPID_EMAIL = process.env.VAPID_EMAIL!;
if (!VAPID_EMAIL) {
  throw new Error("VAPID_EMAIL is not set");
}
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
if (!VAPID_PUBLIC_KEY) {
  throw new Error("VAPID_PUBLIC_KEY is not set");
}
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
if (!VAPID_PRIVATE_KEY) {
  throw new Error("VAPID_PRIVATE_KEY is not set");
}

webpush.setVapidDetails(
  `mailto:${VAPID_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);
console.log("[VAPID] email:", VAPID_EMAIL);
console.log("[VAPID] VAPID_PUBLIC_KEY:", VAPID_PUBLIC_KEY);

export type PushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function sendPushNotification(
  pushSub: PushSubscription,
  payload: string
) {
  try {
    const result = await webpush.sendNotification(pushSub, payload);
    return result;
  } catch (e) {
    throw e;
  }
}
