// app/api/test/simulate-load/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CommentRepository } from "@/lib/repositories/test/comment";

let loadFactor = 1;

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "increase":
        loadFactor += 0.5;
        break;
      case "decrease":
        loadFactor = Math.max(1, loadFactor - 0.5);
        break;
      case "reset":
        loadFactor = 1;
        break;
    }

    return NextResponse.json({
      success: true,
      loadFactor
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export { loadFactor };
