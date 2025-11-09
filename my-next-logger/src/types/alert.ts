// types/alert.ts
export interface AlertHistoryCreate {
  alertName: string;
  status: string;
  severity: string;
  value: string;
  description?: string;
}

export interface AlertHistory extends AlertHistoryCreate {
  id: string;
  timestamp: Date;
}
