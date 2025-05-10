import webpush from "web-push";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:example@example.com";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_SUBJECT}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);
console.log("[VAPID] subject:", VAPID_SUBJECT);
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
