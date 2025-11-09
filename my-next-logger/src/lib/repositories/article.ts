// src/lib/repositories/article.ts
import prisma from "@/lib/db";
import type { Article } from "@prisma/client";
import { DBMetrics } from "../metrics/db";

export class ArticleRepository {
  static async findAll() {
    return DBMetrics.measureQuery("article_findAll", () =>
      prisma.article.findMany({
        orderBy: { createdAt: "desc" }
      })
    );
  }

  static async findById(id: string) {
    return DBMetrics.measureQuery("article_findById", () =>
      prisma.article.findUnique({
        where: { id },
        include: { comments: true }
      })
    );
  }

  static async incrementViews(id: string) {
    return DBMetrics.measureQuery("article_incrementViews", () =>
      prisma.article.update({
        where: { id },
        data: { views: { increment: 1 } }
      })
    );
  }

  static async create(data: Pick<Article, "title" | "content" | "category">) {
    return DBMetrics.measureQuery("article_create", () =>
      prisma.article.create({
        data: {
          ...data,
          views: 0
        }
      })
    );
  }
}
