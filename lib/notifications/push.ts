import webpush from "web-push";
import type { PushSubscription } from "web-push";

// Lazily configure VAPID keys so the module can be imported without crashing
// in environments where env vars are not yet set (e.g. build time).
function getWebPush() {
  const publicKey  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email      = process.env.VAPID_EMAIL ?? "mailto:admin@trackflow.ng";

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys are not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_EMAIL."
    );
  }

  webpush.setVapidDetails(email, publicKey, privateKey);
  return webpush;
}

export interface PushPayload {
  title:   string;
  body:    string;
  icon?:   string;
  badge?:  string;
  url?:    string;
  tag?:    string;
}

/**
 * Send a push notification to a single subscription.
 * Returns `true` on success, `false` if the subscription is no longer valid
 * (410 Gone / 404), throws for other errors.
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  const push = getWebPush();

  try {
    await push.sendNotification(
      subscription,
      JSON.stringify({
        title:  payload.title,
        body:   payload.body,
        icon:   payload.icon  ?? "/icons/icon-192x192.png",
        badge:  payload.badge ?? "/icons/badge-72x72.png",
        url:    payload.url   ?? "/dashboard",
        tag:    payload.tag,
      })
    );
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    // Subscription expired or unsubscribed — caller should delete it
    if (statusCode === 410 || statusCode === 404) return false;
    throw err;
  }
}

/**
 * Send to multiple subscriptions in parallel.
 * Returns an array of subscription objects whose subscriptions are no longer
 * valid (so the caller can remove them from the database).
 */
export async function sendPushToMany(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<PushSubscription[]> {
  const push = getWebPush();
  const expired: PushSubscription[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await push.sendNotification(sub, JSON.stringify(payload));
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          expired.push(sub);
        }
      }
    })
  );

  return expired;
}
