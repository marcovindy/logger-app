```markdown
# 🧠 My Next Logger

A local observability stack combining **Grafana**, **Loki**, **Prometheus**, **Alloy**, and a **Next.js logger** powered by `pino` + `pino-loki`.

---

## 🚀 Features

- 📊 **Grafana** – visualize logs, metrics, and dashboards
- 📦 **Loki** – centralized log storage
- 🔗 **Alloy** – observability agent for metrics and logs
- 🧱 **Prometheus** – collects and stores metrics
- 🐘 **Postgres + pgAdmin** – simple demo database
- 🌐 **Nginx Gateway** – proxy for Loki read/write
- 🪵 **Flog** – random log generator for testing
- ⚙️ **Backend** – Loki backend for log ingestion
- 🧑‍💻 **Next.js logger** – integrated `pino` logger setup for the app

---

## 🧩 Project Structure
```

my-next-logger/
├─ docker-compose.yml
├─ prometheus.yml
├─ loki-config.yaml
├─ alloy-local-config.yaml
├─ src/
│ └─ logger/
│ └─ index.ts # pino + pino-loki logger setup
├─ .env # environment variables (ignored by git)

````

---

## ⚙️ Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [pnpm](https://pnpm.io/) (recommended)
- Node.js 18+

---

## 🧭 Getting Started

### 1️⃣ Start all containers

```bash
docker compose up -d
````

### 2️⃣ Install dependencies

```bash
pnpm install
```

### 3️⃣ Run the Next.js app

```bash
pnpm dev
```

---

## 🧠 Available Services

| Service          | Port  | Description                        |
| ---------------- | ----- | ---------------------------------- |
| **Next.js App**  | 3000  | Application with integrated logger |
| **Grafana**      | 3001  | Web UI for metrics and logs        |
| **Prometheus**   | 9090  | Prometheus metrics explorer        |
| **pgAdmin**      | 5050  | Web UI for PostgreSQL              |
| **Postgres**     | 5432  | Database service                   |
| **MinIO**        | 9000  | Object storage backend for Loki    |
| **Loki Gateway** | 3100  | Proxy for read/write requests      |
| **Alloy**        | 12345 | Observability agent                |
| **Loki Read**    | 3101  | Loki read target                   |
| **Loki Write**   | 3102  | Loki write target                  |

---

## 🪵 Logger Configuration

`src/logger/index.ts`:

```ts
import pino from "pino";
import pinoLoki from "pino-loki";

const stream = pinoLoki({
  host: "http://localhost:3100",
  headers: { "X-Scope-OrgID": "tenant1" },
  labels: { job: "nextjs-app", env: process.env.NODE_ENV || "dev" }
});

const logger = pino({}, stream);

export default logger;
```

This logger sends logs directly to the **Loki gateway** at `http://localhost:3100`.

---

## 🧮 Example Usage

```ts
import logger from "@/logger";

export default function handler(req, res) {
  logger.info("Hello from API!");
  res.status(200).json({ ok: true });
}
```

---

## 🧹 Cleanup

To stop and remove all containers and volumes:

```bash
docker compose down -v
```

---

## 🔒 Security Notes

- Never hardcode API tokens or secrets in source code. Use `.env` instead.
- `.env` is already ignored by `.gitignore`.
- If you accidentally committed secrets, you can wipe history safely:

  ```bash
  git checkout --orphan clean-main
  git add .
  git commit -m "Clean commit"
  git branch -D main
  git branch -m main
  git push -f origin main
  ```

---

## 🧠 Tips

- Access **Grafana UI**: [http://localhost:3001](http://localhost:3001)
- Default login:

  - **User:** `admin`
  - **Password:** `admin`

---

## 🧰 Author

**[@marcovindy](https://github.com/marcovindy)**
Frontend & DevOps tinkering project 🚀

---

```

```
