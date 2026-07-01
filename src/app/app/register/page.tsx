import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/ui/Logo";

export default function MobileRegisterPage() {
  return (
    <div className="hm-page safe-top safe-bottom min-h-dvh px-4 py-8">
      <Link
        href="/app"
        className="text-sm font-medium text-stone-500 hover:text-amber-700"
      >
        ← Назад
      </Link>
      <div className="mx-auto mt-6 max-w-md text-center">
        <Logo size="lg" className="mx-auto" />
      </div>
      <div className="mx-auto mt-6 max-w-md">
        <AuthForm mode="register" redirectTo="/app/dashboard" variant="mobile" />
      </div>
    </div>
  );
}