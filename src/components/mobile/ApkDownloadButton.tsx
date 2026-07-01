"use client";

import { useState } from "react";
import { APK_DOWNLOAD_PATH, APK_FILE_NAME, APK_SIZE_MB } from "@/lib/apk-download";

type Props = {
  variant?: "primary" | "compact";
};

export function ApkDownloadButton({ variant = "primary" }: Props) {
  const [showHint, setShowHint] = useState(false);

  function startDownload() {
    setShowHint(false);
    const link = document.createElement("a");
    link.href = APK_DOWNLOAD_PATH;
    link.download = APK_FILE_NAME;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const buttonClass =
    variant === "compact"
      ? "hm-btn inline-flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm"
      : "hm-link-card flex w-full items-center gap-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 text-left";

  return (
    <>
      <button type="button" onClick={() => setShowHint(true)} className={buttonClass}>
        {variant === "compact" ? (
          <>
            <span>📥</span>
            Скачать APK ({APK_SIZE_MB})
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl text-white shadow-md shadow-emerald-200">
              📥
            </span>
            <div>
              <p className="font-bold text-emerald-900">Скачать для Android</p>
              <p className="text-sm text-emerald-700">APK — скоро будет готов</p>
            </div>
          </>
        )}
      </button>

      {showHint && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="hm-card max-w-md w-full p-5 shadow-xl">
            <p className="text-lg font-bold text-stone-900">Пока рекомендуем PWA</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              APK-файл появится позже. Сейчас лучше установить через Chrome → ⋮ →
              «Установить приложение» на странице <strong>/app</strong> — работает
              так же, без Google Play.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={startDownload}
                className="hm-btn hm-btn-primary flex-1 px-4 py-2.5"
              >
                Попробовать скачать
              </button>
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="hm-btn px-4 py-2.5 text-stone-600"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}