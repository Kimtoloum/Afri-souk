import { NextResponse } from "next/server";
import { generatePredictionReport } from "@/lib/predictions";
import type { ApiResponse, PredictionReport } from "@/types";

export const dynamic = "force-dynamic"; // always fresh, no caching

export async function GET(): Promise<NextResponse<ApiResponse<PredictionReport>>> {
  try {
    const report = await generatePredictionReport();
    return NextResponse.json({ ok: true, data: report });
  } catch (err) {
    console.error("[predictions] error:", err);
    return NextResponse.json(
      { ok: false, error: "Impossible de générer les prédictions." },
      { status: 500 }
    );
  }
}
