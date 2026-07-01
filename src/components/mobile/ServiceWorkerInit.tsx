"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push-client";
import { setupNativeNotificationListeners } from "@/lib/native-notifications";

export function ServiceWorkerInit() {
  useEffect(() => {
    void registerServiceWorker();
    void setupNativeNotificationListeners();
  }, []);

  return null;
}