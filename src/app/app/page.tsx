import Link from "next/link";
import { ApkDownloadButton } from "@/components/mobile/ApkDownloadButton";
import { Logo } from "@/components/ui/Logo";

export default function MobileAppPage() {
  return (
    <div className="hm-page safe-top safe-bottom flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <div className="text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="mt-5 text-2xl font-bold text-stone-900">HiveMonitor</h1>
          <p className="mt-2 text-stone-500">
            Личный улей с ESP32 на телефоне
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-stone-400">
            или скачать APK
          </p>
          <ApkDownloadButton />
          <Link
            href="/download"
            className="block text-center text-sm font-medium text-amber-700 hover:underline"
          >
            Инструкция по установке →
          </Link>
        </div>

        <p className="mt-8 text-center text-xs font-semibold uppercase tracking-widest text-stone-400">
          Войти в приложении
        </p>

        <div className="mt-4 space-y-3">
          <Link href="/app/login" className="hm-link-card flex items-center gap-4 p-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              🔑
            </span>
            <div>
              <p className="font-bold text-stone-900">Войти</p>
              <p className="text-sm text-stone-500">Уже есть аккаунт</p>
            </div>
          </Link>

          <Link
            href="/app/register"
            className="hm-link-card flex items-center gap-4 border-emerald-100 p-5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              🐝
            </span>
            <div>
              <p className="font-bold text-stone-900">Регистрация</p>
              <p className="text-sm text-stone-500">Получить личный улей</p>
            </div>
          </Link>
        </div>

        <p className="mt-auto pt-10 text-center text-xs text-stone-400">
          Полная версия сайта — с компьютера
        </p>
      </main>
    </div>
  );
}