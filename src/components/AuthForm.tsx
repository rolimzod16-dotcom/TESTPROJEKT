"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  redirectTo?: string;
  variant?: "desktop" | "mobile";
};

export function AuthForm({
  mode,
  redirectTo = "/dashboard",
  variant = "desktop",
}: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const isMobile = variant === "mobile";
  const altHref = isMobile
    ? isRegister
      ? "/app/login"
      : "/app/register"
    : isRegister
      ? "/login"
      : "/register";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Что-то пошло не так");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  const cardClass = isMobile
    ? "hm-card p-6"
    : "rounded-3xl border border-amber-200/20 bg-white/80 p-8 shadow-2xl shadow-amber-900/10 backdrop-blur";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className={cardClass}>
        {!isMobile && (
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-2xl">
              🐝
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              {isRegister ? "Регистрация" : "Вход"}
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              {isRegister
                ? "Создайте аккаунт и получите личный улей с ESP32"
                : "Войдите, чтобы смотреть отчёты вашего улья"}
            </p>
          </div>
        )}

        {isMobile && (
          <h1 className="mb-6 text-center text-xl font-bold text-stone-900">
            {isRegister ? "Регистрация" : "Вход"}
          </h1>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">
                Имя
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="hm-input"
                placeholder="Алексей"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hm-input"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hm-input"
              placeholder="минимум 6 символов"
              minLength={6}
              required
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="hm-btn hm-btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Подождите..."
              : isRegister
                ? "Создать аккаунт"
                : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
          <Link
            href={altHref}
            className="font-semibold text-amber-700 hover:text-amber-600"
          >
            {isRegister ? "Войти" : "Зарегистрироваться"}
          </Link>
        </p>
      </div>
    </div>
  );
}