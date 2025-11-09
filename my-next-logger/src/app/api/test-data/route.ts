// src/app/api/test-data/route.ts
import { Article } from "@/types/types";
import { NextResponse } from "next/server";

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "První článek",
    content: "Obsah prvního článku",
    category: "tech",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Druhý článek",
    content: "Obsah druhého článku",
    category: "lifestyle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_ARTICLES
  });
}
