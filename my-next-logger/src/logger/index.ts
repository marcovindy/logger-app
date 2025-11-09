// src/logger/index.ts
import pino from "pino";
import pinoLoki from "pino-loki";

const stream = pinoLoki({
  host: "http://localhost:3100",
  headers: {
    "X-Scope-OrgID": "tenant1"
  },
  labels: {
    job: "nextjs-app",
    env: process.env.NODE_ENV || "dev"
  }
});

const logger = pino({}, stream);

export default logger;
