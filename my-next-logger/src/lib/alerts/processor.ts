// lib/alerts/processor.ts
import { AlertRepository } from "@/lib/repositories/alert";
import logger from "@/logger";

export class AlertProcessor {
  static async processAlert(alert: any) {
    try {
      // Transformace Grafana alertu na náš formát
      const alertData = {
        alertName: alert.labels.alertname,
        status: alert.status,
        severity: alert.labels.severity || "info",
        value: alert.value || "0",
        description: alert.annotations?.description
      };

      // Uložení do databáze
      const savedAlert = await AlertRepository.create(alertData);

      // Logování podle severity
      switch (alertData.severity.toLowerCase()) {
        case "critical":
          logger.error("Critical alert received", {
            alertId: savedAlert.id,
            ...alertData
          });
          break;
        case "warning":
          logger.warn("Warning alert received", {
            alertId: savedAlert.id,
            ...alertData
          });
          break;
        default:
          logger.info("Alert received", {
            alertId: savedAlert.id,
            ...alertData
          });
      }

      return savedAlert;
    } catch (error) {
      logger.error("Failed to process alert", {
        error: error instanceof Error ? error.message : "Unknown error",
        alert: alert.labels.alertname
      });
      throw error;
    }
  }
}
