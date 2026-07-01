import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/hives";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Введите email и пароль." },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: "Неверный email или пароль." },
        { status: 401 },
      );
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json(
      { error: "Не удалось войти. Проверь подключение к Supabase." },
      { status: 500 },
    );
  }
}