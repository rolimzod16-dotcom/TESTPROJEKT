import { NextResponse } from "next/server";
import {
  createSession,
  hashPassword,
} from "@/lib/auth";
import {
  createUser,
  findUserByEmail,
} from "@/lib/hives";
import {
  createReportForHive,
  provisionHiveForUser,
} from "@/lib/simulator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "Заполните все поля. Пароль — минимум 6 символов." },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует." },
        { status: 409 },
      );
    }

    const user = await createUser({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    const { hive } = await provisionHiveForUser(user.id, user.name);
    await createReportForHive(hive.id, user.id);

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
    console.error("[register]", error);
    const message =
      error instanceof Error && error.message.includes("Supabase")
        ? error.message
        : "Не удалось зарегистрироваться. Проверь, что SQL запущен в Supabase.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}