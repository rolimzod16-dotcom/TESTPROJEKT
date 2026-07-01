import Link from "next/link";
import { ApkDownloadButton } from "@/components/mobile/ApkDownloadButton";
import { APK_DOWNLOAD_PATH } from "@/lib/apk-download";
import { Logo } from "@/components/ui/Logo";

export default function DownloadPage() {
  return (
    <div className="hm-page safe-top safe-bottom min-h-dvh">
      <main className="mx-auto max-w-lg px-4 py-10">
        <Link
          href="/app"
          className="text-sm font-medium text-stone-500 hover:text-amber-700"
        >
          ← Назад
        </Link>

        <div className="mt-8 text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="mt-5 text-2xl font-bold text-stone-900">
            Скачать HiveMonitor
          </h1>
          <p className="mt-2 text-stone-500">
            Приложение для Android — мониторинг улья
          </p>
        </div>

        <div className="mt-8">
          <ApkDownloadButton />
        </div>

        <div className="hm-card mt-6 border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-bold">Телефон пишет «файл опасен»?</p>
          <p className="mt-2 leading-relaxed">
            Это защита Android для APK не из Google Play. Нажмите{" "}
            <strong>«Загрузить всё равно»</strong> — файл ~3.9 МБ скачивается с
            вашего сайта.
          </p>
        </div>

        <div className="hm-card mt-4 p-5 text-sm text-stone-600">
          <p className="font-bold text-stone-900">Инструкция</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
            <li>Нажмите зелёную кнопку выше</li>
            <li>Если спросит — «Загрузить всё равно»</li>
            <li>Дождитесь загрузки (~3.9 МБ)</li>
            <li>Откройте файл в «Загрузках»</li>
            <li>Разрешите установку из браузера</li>
            <li>Войдите с email и паролем</li>
          </ol>
        </div>

        <div className="hm-card-flat mt-4 p-5 text-sm text-stone-600">
          <p className="font-bold text-amber-900">Без APK (рекомендуем)</p>
          <p className="mt-2 leading-relaxed">
            Войдите в аккаунт → на дашборде нажмите «Установить приложение».
            Или Chrome → ⋮ → «Установить» на <strong>/app</strong>.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Ссылка:{" "}
          <a href={APK_DOWNLOAD_PATH} className="text-amber-700 underline">
            {APK_DOWNLOAD_PATH}
          </a>
        </p>
      </main>
    </div>
  );
}