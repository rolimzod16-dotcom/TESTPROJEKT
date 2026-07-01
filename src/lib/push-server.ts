import webpush from "web-push";
import { requireSupabase } from "@/lib/supabase/server";
import type { Report } from "@/lib/types";

type PushSubscriptionJSON = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@hivemonitor.app";

  if (!publicKey || !privateKey) return null;

  return { publicKey, privateKey, subject };
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON,
) {
  const supabase = requireSupabase();
  const keys = subscription.keys;
  if (!keys?.p256dh || !keys?.auth || !subscription.endpoint) {
    throw new Error("Invalid subscription");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) throw error;
}

export async function sendReportPush(userId: string, report: Report) {
  const vapid = getVapidConfig();
  if (!vapid) return { sent: 0, skipped: "vapid_not_configured" };

  const supabase = requireSupabase();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) throw error;
  if (!subs?.length) return { sent: 0, skipped: "no_subscriptions" };

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const payload = JSON.stringify({
    title: "🐝 Новый отчёт от улья",
    body: `T: ${report.temperature}°C · влажность ${report.humidity}% · вес ${report.weight} кг`,
    url: "/app/dashboard",
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      );
      sent++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
      console.error("[push] send failed:", err);
    }
  }

  return { sent };
}