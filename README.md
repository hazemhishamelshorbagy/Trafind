# Trafind

Trafind is a market-data ingestion and research project. Its current foundation
collects cryptocurrency candlesticks from Binance, stores them in PostgreSQL,
and provides an API scaffold. Feature engineering, pattern discovery,
hypothesis testing, and backtesting are planned next steps.

## Project status

- The worker can collect historical klines from Binance's REST API, map and
  validate candles, and save them to the database.
- A Binance WebSocket client processes closed live candles. On reconnect, it
  attempts to recover missing data before resuming buffered live updates.
- The Express API provides a health endpoint and a candle-query endpoint.
  The candle endpoint currently validates and returns query parameters; it
  does not yet read candles from the database.
- The research roadmap is described in [docs/cycle.md](docs/cycle.md).

## Workspace

This repository is a pnpm workspace:

| Path | Purpose |
| --- | --- |
| `apps/api` | Express API, request validation, and health check |
| `apps/worker` | Binance historical and WebSocket ingestion, candle mapping and validation |
| `packages/database` | Prisma schema, PostgreSQL client, and candle repository |
| `docs/cycle.md` | Planned market-research workflow |

## Data flow

```text
Binance REST ─────┐
                  ├─> Worker ─> validate/map candles ─> PostgreSQL
Binance WebSocket ┘
                      │
                      └─ On reconnect, recover missing candles before
                         processing buffered live candles

Client ─> Express API ─> health check or candle-query validation
```

The database stores candles in the `candles` table. Each candle is uniquely
identified by its symbol, interval, and opening time. Supported database
intervals are `M1`, `M5`, and `H1`; Binance intervals are `1m`, `5m`, and `1h`.
The current WebSocket URL is configured for `SOLUSDT` at `1m`.

## Requirements

- Node.js
- pnpm
- PostgreSQL 15 or newer

## Getting started

1. Install workspace dependencies:

   ```sh
   pnpm install
   ```

2. Copy `packages/database/.env.example` to `packages/database/.env` and set
   `DATABASE_URL` to your PostgreSQL connection string. Keep real credentials
   out of source control.

3. Generate the Prisma client and apply the development migration:

   ```sh
   pnpm --filter @trafind/database generate
   pnpm --filter @trafind/database migrate:dev
   ```

4. Start the API:

   ```sh
   pnpm --filter @trafind/api dev
   ```

   The API listens on port `4000` by default. Set `PORT` to use another port.

## API endpoints

- `GET /api/health` — returns service status and a timestamp.
- `GET /api/market/candles?symbol=SOLUSDT&interval=1h&limit=100` — validates
  the query and returns the selected parameters. `symbol` currently supports
  `SOLUSDT`; `interval` supports `1m`, `5m`, or `1h`; `limit` must be from 1
  to 1000.

## Development commands

```sh
pnpm --filter @trafind/api build
pnpm --filter @trafind/database build
```

The worker package does not currently define a start or build script. Its
`src/services/test-*.ts` and `src/test-*.ts` files are development scripts, not
a configured automated test suite.
