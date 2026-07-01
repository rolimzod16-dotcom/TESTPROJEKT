"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone);
    setIsStandalone(!!standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="hm-card mb-4 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
        <p className="font-bold text-amber-900">Установить приложение</p>
        <p className="mt-1 text-sm text-amber-800">
          Добавьте на главный экран — будет как обычное приложение.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await deferredPrompt.prompt();
              setDeferredPrompt(null);
            }}
            className="hm-btn hm-btn-primary px-4 py-2 text-sm"
          >
            Установить
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="hm-btn px-4 py-2 text-sm text-amber-800"
          >
            Позже
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hm-card-flat mb-4 p-4 text-sm text-stone-600">
      <p className="font-bold text-stone-900">Установка через браузер</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
        <li>
          <strong>iPhone:</strong> Safari → Поделиться → «На экран Домой»
        </li>
        <li>
          <strong>Android:</strong> Chrome → ⋮ → «Установить приложение»
        </li>
      </ul>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-3 font-medium text-amber-700"
      >
        Понятно
      </button>
    </div>
  );
}