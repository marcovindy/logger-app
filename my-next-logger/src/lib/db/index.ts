// src/lib/db/index.ts
import { PrismaClient } from "@prisma/client";
import { recordMetric } from "@/lib/metrics/server";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient = new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = prismaClient;
  }
}

export const prisma = global.prisma || prismaClient;

export class DBMetrics {
  static async measureQuery<T>(
    operation: string,
    query: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await query();
      const duration = (performance.now() - startTime) / 1000;

      recordMetric("blog_db_query_duration_seconds", duration, {
        operation
      });

      recordMetric("blog_db_queries_total", 1, {
        operation,
        status: "success"
      });

      return result;
    } catch (error) {
      recordMetric("blog_db_queries_total", 1, {
        operation,
        status: "error"
      });
      throw error;
    }
  }
}

export default prisma;

