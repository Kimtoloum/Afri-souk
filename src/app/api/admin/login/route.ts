import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyPassword,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth";
import type { ApiResponse } from "@/types";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ ok: true }>>> {
  try {
    const { password } = await req.json();

    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { ok: false, error: "Mot de passe requis." },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      // Pas de détail sur la raison de l'échec (sécurité)
      return NextResponse.json(
        { ok: false, error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true, data: { ok: true } });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err) {
    console.error("[admin/login] error:", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
