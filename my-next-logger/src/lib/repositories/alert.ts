// lib/repositories/alert.ts
import prisma from "@/lib/db";
import { DBMetrics } from "../metrics/db";

interface AlertHistoryCreate {
  alertName: string;
  status: string;
  severity: string;
  value: string;
  description?: string;
}

interface AlertHistory extends AlertHistoryCreate {
  id: string;
  timestamp: Date;
}

export class AlertRepository {
  static async findAll(): Promise<AlertHistory[]> {
    return DBMetrics.measureQuery("alert_findAll", async () => {
      const result = await prisma.$queryRaw`
        SELECT * FROM "AlertHistory"
        ORDER BY timestamp DESC
      `;
      return result as AlertHistory[];
    });
  }

  static async findRecent(limit = 50): Promise<AlertHistory[]> {
    return DBMetrics.measureQuery("alert_findRecent", async () => {
      const result = await prisma.$queryRaw`
        SELECT * FROM "AlertHistory"
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
      return result as AlertHistory[];
    });
  }

  static async create(data: AlertHistoryCreate): Promise<AlertHistory> {
    return DBMetrics.measureQuery("alert_create", async () => {
      const id = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "AlertHistory" (
          id,
          "alertName",
          status,
          severity,
          value,
          description,
          timestamp
        ) VALUES (
          ${id},
          ${data.alertName},
          ${data.status},
          ${data.severity},
          ${data.value},
          ${data.description},
          NOW()
        )
      `;

      return {
        ...data,
        id,
        timestamp: new Date()
      };
    });
  }

  static async findBySeverity(severity: string): Promise<AlertHistory[]> {
    return DBMetrics.measureQuery("alert_findBySeverity", async () => {
      const result = await prisma.$queryRaw`
        SELECT * FROM "AlertHistory"
        WHERE severity = ${severity}
        ORDER BY timestamp DESC
      `;
      return result as AlertHistory[];
    });
  }

  static async deleteOlderThan(date: Date): Promise<void> {
    return DBMetrics.measureQuery("alert_deleteOld", async () => {
      await prisma.$executeRaw`
        DELETE FROM "AlertHistory"
        WHERE timestamp < ${date}
      `;
    });
  }
}
