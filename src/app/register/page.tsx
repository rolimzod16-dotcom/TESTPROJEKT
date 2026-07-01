import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fff7d6,_#f5efe6_45%,_#e8dfd1)] px-6 py-12">
      <AuthForm mode="register" />
    </div>
  );
}