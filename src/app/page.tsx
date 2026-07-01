import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7d6,_#f5efe6_45%,_#e8dfd1)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-xl">
            🐝
          </div>
          <span className="text-lg font-bold text-stone-900">HiveMonitor</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/app"
            className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-50"
          >
            📱 Приложение
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-stone-900 transition hover:bg-amber-400"
            >
              Мой улей
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-stone-900 transition hover:bg-amber-400"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-900">
              Симуляция ESP32 · отчёты каждые 2 часа
            </p>
            <h1 className="text-5xl font-bold leading-tight text-stone-900">
              Личный улей с умным мониторингом
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600">
              Регистрируешься — получаешь свой виртуальный улей с ESP32.
              Симулятор отправляет показания датчиков каждые 2 часа, а на
              сайте отчёты приходят в реальном времени.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-stone-900 transition hover:bg-amber-400"
              >
                Создать улей
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-stone-200 bg-white px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Уже есть аккаунт
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200/40 bg-white/80 p-8 shadow-2xl shadow-amber-900/10 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Последний отчёт</p>
                <p className="text-2xl font-bold text-stone-900">
                  Улей онлайн
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ["34.2°C", "Температура"],
                ["58%", "Влажность"],
                ["24.6 кг", "Вес"],
                ["47 дБ", "Активность"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-stone-50 px-4 py-5 text-center"
                >
                  <p className="text-2xl font-bold text-stone-900">{value}</p>
                  <p className="mt-1 text-sm text-stone-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-stone-900 p-4 font-mono text-sm text-emerald-300">
              ESP32-A7F3C2 → report sent · battery 94%
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Регистрация",
              text: "Создаёшь аккаунт — система автоматически выдаёт личный улей и виртуальный ESP32.",
            },
            {
              title: "Симуляция",
              text: "Каждые 2 часа генерируется отчёт: температура, влажность, вес, шум и заряд батареи.",
            },
            {
              title: "Real-time",
              text: "Как только отчёт готов, он сразу появляется в личном кабинете без перезагрузки страницы.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-amber-200/30 bg-white/70 p-6 shadow-sm backdrop-blur"
            >
              <h3 className="text-xl font-bold text-stone-900">{item.title}</h3>
              <p className="mt-3 text-stone-600">{item.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}